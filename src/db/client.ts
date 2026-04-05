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
 * PRAGMA statements do not support parameter binding in SQLite,
 * so the key is passed as a hex literal. The key is a random hex
 * string from our own SecureStore, never user input.
 */
function applyEncryptionKey(
  db: ReturnType<typeof openDatabaseSync>,
  key: string,
) {
  // SQLCipher PRAGMA key must be the first statement after opening.
  // Using hex key format: x'<hex bytes>'
  db.execSync(`PRAGMA key = "x'${key}'"`);
}

/**
 * Initialize the database connection with WAL mode and integrity check.
 * SQLCipher encryption is applied only in production builds (requires prebuild).
 * Must be called once at app startup before any queries.
 */
export async function initDatabase() {
  if (dbInstance) return dbInstance;

  rawDb = openDatabaseSync(DB_NAME);

  // SQLCipher encryption requires a prebuild with the expo-sqlite config plugin.
  // Skip in development (Expo Go) where SQLCipher is not compiled in.
  if (!__DEV__) {
    const encryptionKey = await getOrCreateEncryptionKey();
    applyEncryptionKey(rawDb, encryptionKey);
  }

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
