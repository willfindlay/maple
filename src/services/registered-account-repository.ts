import { eq, and } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { getDatabase } from "../db/client";
import { registeredAccounts, registeredTransactions } from "../db/schema";
import type { RegisteredAccountType } from "../models/account";
import type { RegisteredTransactionType } from "../models/transaction";

export interface CreateRegisteredAccountInput {
  accountId: string;
  type: RegisteredAccountType;
  holderName?: string;
  dateOpened?: string;
  tfsaEligibleSinceYear?: number;
  rrspDeductionLimit?: number; // cents
  rrspPensionAdjustment?: number; // cents
}

export interface LogRegisteredTransactionInput {
  registeredAccountId: string;
  transactionId?: string;
  type: RegisteredTransactionType;
  amount: number; // cents (always positive)
  taxYear: number;
  date: string; // YYYY-MM-DD
  notes?: string;
}

/** Create a registered account record linked to an existing account. */
export function createRegisteredAccount(input: CreateRegisteredAccountInput) {
  const db = getDatabase();
  const id = Crypto.randomUUID();

  db.insert(registeredAccounts)
    .values({
      id,
      accountId: input.accountId,
      type: input.type,
      holderName: input.holderName ?? null,
      dateOpened: input.dateOpened ?? null,
      tfsaEligibleSinceYear: input.tfsaEligibleSinceYear ?? null,
      rrspDeductionLimit: input.rrspDeductionLimit ?? null,
      rrspPensionAdjustment: input.rrspPensionAdjustment ?? null,
    })
    .run();

  return getRegisteredAccountById(id);
}

/** Get a registered account by ID. */
export function getRegisteredAccountById(id: string) {
  const db = getDatabase();
  return db
    .select()
    .from(registeredAccounts)
    .where(eq(registeredAccounts.id, id))
    .get();
}

/** Get all registered accounts, optionally filtered by type. */
export function getRegisteredAccounts(type?: RegisteredAccountType) {
  const db = getDatabase();
  if (type) {
    return db
      .select()
      .from(registeredAccounts)
      .where(eq(registeredAccounts.type, type))
      .all();
  }
  return db.select().from(registeredAccounts).all();
}

/** Log a contribution, withdrawal, or transfer for a registered account. */
export function logRegisteredTransaction(input: LogRegisteredTransactionInput) {
  const db = getDatabase();
  const id = Crypto.randomUUID();

  db.insert(registeredTransactions)
    .values({
      id,
      registeredAccountId: input.registeredAccountId,
      transactionId: input.transactionId ?? null,
      type: input.type,
      amount: input.amount,
      taxYear: input.taxYear,
      date: input.date,
      notes: input.notes ?? null,
    })
    .run();

  return id;
}

/** Get all registered transactions for a specific registered account. */
export function getRegisteredTransactionsForAccount(
  registeredAccountId: string,
) {
  const db = getDatabase();
  return db
    .select()
    .from(registeredTransactions)
    .where(eq(registeredTransactions.registeredAccountId, registeredAccountId))
    .all();
}

/** Get registered transactions for a specific tax year and account type. */
export function getRegisteredTransactionsByYear(
  registeredAccountId: string,
  taxYear: number,
) {
  const db = getDatabase();
  return db
    .select()
    .from(registeredTransactions)
    .where(
      and(
        eq(registeredTransactions.registeredAccountId, registeredAccountId),
        eq(registeredTransactions.taxYear, taxYear),
      ),
    )
    .all();
}

/**
 * Get all registered transactions across all accounts of a given type,
 * grouped by tax year. Useful for computing total TFSA room across institutions.
 */
export function getAllRegisteredTransactionsByType(
  type: RegisteredAccountType,
) {
  const db = getDatabase();
  const accts = getRegisteredAccounts(type);
  const accountIds = accts.map((a) => a.id);

  if (accountIds.length === 0) return [];

  const allTxns = [];
  for (const accountId of accountIds) {
    const txns = db
      .select()
      .from(registeredTransactions)
      .where(eq(registeredTransactions.registeredAccountId, accountId))
      .all();
    allTxns.push(...txns);
  }

  return allTxns;
}
