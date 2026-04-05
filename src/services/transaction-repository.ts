import { eq, and, isNull, desc, sql, gte, lte } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { getDatabase } from "../db/client";
import { transactions } from "../db/schema";
import { recomputeBalance } from "./account-repository";

export interface CreateTransactionInput {
  accountId: string;
  date: string; // YYYY-MM-DD
  amount: number; // cents
  payee?: string;
  categoryId?: string;
  subcategoryId?: string;
  memo?: string;
  importSource?: "manual" | "csv";
}

export interface CreateTransferInput {
  fromAccountId: string;
  toAccountId: string;
  date: string; // YYYY-MM-DD
  amount: number; // cents (positive)
  memo?: string;
}

export interface UpdateTransactionInput {
  date?: string;
  amount?: number;
  payee?: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  memo?: string;
}

/** Create a single transaction and recompute the account balance. */
export function createTransaction(input: CreateTransactionInput) {
  const db = getDatabase();
  const id = Crypto.randomUUID();

  db.insert(transactions)
    .values({
      id,
      accountId: input.accountId,
      date: input.date,
      amount: input.amount,
      payee: input.payee ?? null,
      categoryId: input.categoryId ?? null,
      subcategoryId: input.subcategoryId ?? null,
      memo: input.memo ?? null,
      importSource: input.importSource ?? "manual",
    })
    .run();

  recomputeBalance(input.accountId);
  return getTransactionById(id);
}

/**
 * Create a transfer between two accounts.
 * Creates two linked transactions: outflow from source, inflow to destination.
 */
export function createTransfer(input: CreateTransferInput) {
  const db = getDatabase();
  const outflowId = Crypto.randomUUID();
  const inflowId = Crypto.randomUUID();

  // Outflow from source account (negative amount)
  db.insert(transactions)
    .values({
      id: outflowId,
      accountId: input.fromAccountId,
      date: input.date,
      amount: -Math.abs(input.amount),
      payee: "Transfer",
      isTransfer: true,
      transferAccountId: input.toAccountId,
      memo: input.memo ?? null,
      importSource: "manual",
    })
    .run();

  // Inflow to destination account (positive amount)
  db.insert(transactions)
    .values({
      id: inflowId,
      accountId: input.toAccountId,
      date: input.date,
      amount: Math.abs(input.amount),
      payee: "Transfer",
      isTransfer: true,
      transferAccountId: input.fromAccountId,
      memo: input.memo ?? null,
      importSource: "manual",
    })
    .run();

  recomputeBalance(input.fromAccountId);
  recomputeBalance(input.toAccountId);

  return { outflowId, inflowId };
}

/** Get a single transaction by ID (excludes soft-deleted). */
export function getTransactionById(id: string) {
  const db = getDatabase();
  return db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)))
    .get();
}

/** Get transactions for an account, ordered by date descending. */
export function getTransactionsForAccount(
  accountId: string,
  opts?: { limit?: number; offset?: number },
) {
  const db = getDatabase();
  let query = db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.accountId, accountId),
        isNull(transactions.deletedAt),
      ),
    )
    .orderBy(desc(transactions.date))
    .$dynamic();

  if (opts?.limit) {
    query = query.limit(opts.limit);
  }
  if (opts?.offset) {
    query = query.offset(opts.offset);
  }
  return query.all();
}

/** Get transactions for a date range across all accounts. */
export function getTransactionsForDateRange(
  startDate: string,
  endDate: string,
) {
  const db = getDatabase();
  return db
    .select()
    .from(transactions)
    .where(
      and(
        isNull(transactions.deletedAt),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate),
      ),
    )
    .orderBy(desc(transactions.date))
    .all();
}

/** Update a transaction and recompute the affected account balance. */
export function updateTransaction(id: string, input: UpdateTransactionInput) {
  const db = getDatabase();
  const existing = getTransactionById(id);
  if (!existing) return null;

  db.update(transactions)
    .set({
      ...input,
      updatedAt: sql`datetime('now')`,
    })
    .where(eq(transactions.id, id))
    .run();

  recomputeBalance(existing.accountId);
  return getTransactionById(id);
}

/** Soft-delete a transaction and recompute the account balance. */
export function deleteTransaction(id: string) {
  const db = getDatabase();
  const existing = getTransactionById(id);
  if (!existing) return;

  db.update(transactions)
    .set({ deletedAt: sql`datetime('now')` })
    .where(eq(transactions.id, id))
    .run();

  recomputeBalance(existing.accountId);
}

/**
 * Get monthly cash flow for a given month (YYYY-MM).
 * Returns income and expenses (excluding transfers).
 */
export function getMonthlyCashFlow(month: string) {
  const db = getDatabase();
  const startDate = `${month}-01`;
  // End date: last day of month. Use next month's first day as exclusive upper bound.
  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
  const nextYear = monthNum === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const rows = db
    .select()
    .from(transactions)
    .where(
      and(
        isNull(transactions.deletedAt),
        eq(transactions.isTransfer, false),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate),
      ),
    )
    .all();

  // Filter out the first day of next month (we used lte, not lt)
  const filtered = rows.filter((r) => r.date < endDate);

  let income = 0;
  let expenses = 0;
  for (const row of filtered) {
    if (row.amount > 0) {
      income += row.amount;
    } else {
      expenses += Math.abs(row.amount);
    }
  }

  return { income, expenses, net: income - expenses };
}
