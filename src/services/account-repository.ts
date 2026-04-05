import { eq, sql, and, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../db/client";
import { accounts, transactions } from "../db/schema";
import { isAssetType, type AccountType } from "../models/account";

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  institution?: string;
  currency?: string;
  initialBalance?: number; // cents
  isOffBudget?: boolean;
  notes?: string;
}

export interface UpdateAccountInput {
  name?: string;
  institution?: string;
  currency?: string;
  isOffBudget?: boolean;
  notes?: string;
}

/** Create a new account. If initialBalance is provided, creates an opening balance transaction. */
export function createAccount(input: CreateAccountInput) {
  const db = getDatabase();
  const id = uuidv4();
  const isAsset = isAssetType(input.type);

  db.insert(accounts)
    .values({
      id,
      name: input.name,
      type: input.type,
      institution: input.institution ?? null,
      currency: input.currency ?? "CAD",
      balance: input.initialBalance ?? 0,
      isAsset,
      isOffBudget: input.isOffBudget ?? false,
      notes: input.notes ?? null,
    })
    .run();

  // Create an opening balance transaction if initial balance is non-zero
  if (input.initialBalance && input.initialBalance !== 0) {
    db.insert(transactions)
      .values({
        id: uuidv4(),
        accountId: id,
        date: new Date().toISOString().split("T")[0],
        amount: input.initialBalance,
        payee: "Opening Balance",
        memo: "Initial account balance",
        importSource: "manual",
      })
      .run();
  }

  return getAccountById(id);
}

/** Get a single account by ID (excludes soft-deleted). */
export function getAccountById(id: string) {
  const db = getDatabase();
  return db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, id), isNull(accounts.deletedAt)))
    .get();
}

/** Get all active accounts (excludes soft-deleted). */
export function getAllAccounts() {
  const db = getDatabase();
  return db.select().from(accounts).where(isNull(accounts.deletedAt)).all();
}

/** Get accounts grouped by whether they are assets or liabilities. */
export function getAccountsByAssetType() {
  const all = getAllAccounts();
  return {
    assets: all.filter((a) => a.isAsset),
    liabilities: all.filter((a) => !a.isAsset),
  };
}

/** Update an account's editable fields. */
export function updateAccount(id: string, input: UpdateAccountInput) {
  const db = getDatabase();
  db.update(accounts)
    .set({
      ...input,
      updatedAt: sql`datetime('now')`,
    })
    .where(eq(accounts.id, id))
    .run();
  return getAccountById(id);
}

/** Soft-delete an account. */
export function deleteAccount(id: string) {
  const db = getDatabase();
  db.update(accounts)
    .set({ deletedAt: sql`datetime('now')` })
    .where(eq(accounts.id, id))
    .run();
}

/**
 * Recompute an account's balance from the sum of its non-deleted transactions.
 * Called after every transaction insert/update/delete.
 */
export function recomputeBalance(accountId: string) {
  const db = getDatabase();
  const result = db
    .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.accountId, accountId),
        isNull(transactions.deletedAt),
      ),
    )
    .get();

  const newBalance = result?.total ?? 0;
  db.update(accounts)
    .set({ balance: newBalance, updatedAt: sql`datetime('now')` })
    .where(eq(accounts.id, accountId))
    .run();

  return newBalance;
}

/** Get total assets, total liabilities, and net worth across all active accounts. */
export function getNetWorth() {
  const all = getAllAccounts();
  let totalAssets = 0;
  let totalLiabilities = 0;
  for (const account of all) {
    if (account.isAsset) {
      totalAssets += account.balance ?? 0;
    } else {
      totalLiabilities += Math.abs(account.balance ?? 0);
    }
  }
  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
  };
}
