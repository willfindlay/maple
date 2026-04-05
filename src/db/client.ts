import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import * as schema from "./schema";

const DB_NAME = "maple.db";
const ENCRYPTION_KEY_STORE_KEY = "maple_db_encryption_key";

/**
 * Get or create the database encryption key.
 * The key is a random 256-bit hex string stored in the platform keychain.
 */
async function getOrCreateEncryptionKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_STORE_KEY);
  if (!key) {
    const bytes = await Crypto.getRandomBytesAsync(32);
    key = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    await SecureStore.setItemAsync(ENCRYPTION_KEY_STORE_KEY, key);
  }
  return key;
}

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let rawDb: ReturnType<typeof openDatabaseSync> | null = null;

/**
 * Apply the SQLCipher encryption key to the database.
 * Uses a prepared statement to avoid string interpolation in SQL.
 */
function applyEncryptionKey(
  db: ReturnType<typeof openDatabaseSync>,
  key: string,
) {
  // SQLCipher PRAGMA key must be the first statement after opening.
  // The key is a hex string from our own SecureStore, never user input.
  const stmt = db.prepareSync("PRAGMA key = ?");
  try {
    stmt.executeSync(key);
  } finally {
    stmt.finalizeSync();
  }
}

/**
 * Initialize the database connection with encryption, WAL mode, and integrity check.
 * Must be called once at app startup before any queries.
 */
export async function initDatabase() {
  if (dbInstance) return dbInstance;

  const encryptionKey = await getOrCreateEncryptionKey();

  rawDb = openDatabaseSync(DB_NAME);

  // Apply encryption key (SQLCipher)
  applyEncryptionKey(rawDb, encryptionKey);

  // Enable WAL mode for better write performance and crash safety
  rawDb.execSync("PRAGMA journal_mode = WAL");

  // Run integrity check on startup
  const result = rawDb.getFirstSync<{ integrity_check: string }>(
    "PRAGMA integrity_check",
  );
  if (result?.integrity_check !== "ok") {
    throw new Error(
      `Database integrity check failed: ${result?.integrity_check}. Restore from backup.`,
    );
  }

  dbInstance = drizzle(rawDb, { schema });
  return dbInstance;
}

/** Get the initialized database instance. Throws if not initialized. */
export function getDatabase() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return dbInstance;
}

/** Get the raw expo-sqlite database (for backup operations). */
export function getRawDatabase() {
  if (!rawDb) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return rawDb;
}

/** Close the database connection. */
export function closeDatabase() {
  if (rawDb) {
    rawDb.closeSync();
    rawDb = null;
    dbInstance = null;
  }
}
