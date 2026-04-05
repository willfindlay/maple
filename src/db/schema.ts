import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { ACCOUNT_TYPES, REGISTERED_TYPES } from "@/src/models/account";
import {
  IMPORT_SOURCES,
  REGISTERED_TRANSACTION_TYPES,
} from "@/src/models/transaction";

// --- Accounts ---

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type", { enum: ACCOUNT_TYPES }).notNull(),
    institution: text("institution"),
    currency: text("currency").default("CAD"),
    balance: integer("balance").default(0), // cents
    isAsset: integer("is_asset", { mode: "boolean" }).default(true),
    isOffBudget: integer("is_off_budget", { mode: "boolean" }).default(false),
    plaidAccountId: text("plaid_account_id"),
    flinksAccountId: text("flinks_account_id"),
    notes: text("notes"),
    deletedAt: text("deleted_at"),
    createdAt: text("created_at").default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_accounts_active")
      .on(table.type)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);

// --- Categories ---

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  parentId: text("parent_id").references(
    (): ReturnType<typeof text> => categories.id,
  ),
  icon: text("icon"),
  color: text("color"),
  isIncome: integer("is_income", { mode: "boolean" }).default(false),
  isHidden: integer("is_hidden", { mode: "boolean" }).default(false),
  sortOrder: integer("sort_order").default(0),
});

// --- Transactions ---

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    date: text("date").notNull(), // YYYY-MM-DD
    amount: integer("amount").notNull(), // cents; negative = outflow
    payee: text("payee"),
    categoryId: text("category_id").references(() => categories.id),
    subcategoryId: text("subcategory_id").references(() => categories.id),
    memo: text("memo"),
    isTransfer: integer("is_transfer", { mode: "boolean" }).default(false),
    transferAccountId: text("transfer_account_id").references(
      () => accounts.id,
    ),
    isReconciled: integer("is_reconciled", { mode: "boolean" }).default(false),
    isPending: integer("is_pending", { mode: "boolean" }).default(false),
    importSource: text("import_source", { enum: IMPORT_SOURCES }),
    plaidTransactionId: text("plaid_transaction_id"),
    deletedAt: text("deleted_at"),
    createdAt: text("created_at").default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_transactions_date")
      .on(table.date)
      .where(sql`${table.deletedAt} IS NULL`),
    index("idx_transactions_account")
      .on(table.accountId)
      .where(sql`${table.deletedAt} IS NULL`),
    index("idx_transactions_category")
      .on(table.categoryId)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);

// --- Registered Accounts ---

export const registeredAccounts = sqliteTable("registered_accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  type: text("type", { enum: REGISTERED_TYPES }).notNull(),
  holderName: text("holder_name"),
  dateOpened: text("date_opened"),
  // TFSA
  tfsaEligibleSinceYear: integer("tfsa_eligible_since_year"),
  // RRSP
  rrspDeductionLimit: integer("rrsp_deduction_limit"), // cents
  rrspPensionAdjustment: integer("rrsp_pension_adjustment"), // cents
  // FHSA
  fhsaLifetimeUsed: integer("fhsa_lifetime_used").default(0), // cents
  fhsaIsFirstTimeBuyer: integer("fhsa_is_first_time_buyer", {
    mode: "boolean",
  }).default(true),
  // RESP
  respBeneficiary: text("resp_beneficiary"),
  respLifetimeContributions: integer("resp_lifetime_contributions").default(0), // cents
  respCesgReceived: integer("resp_cesg_received").default(0), // cents
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// --- Registered Transactions ---

export const registeredTransactions = sqliteTable(
  "registered_transactions",
  {
    id: text("id").primaryKey(),
    registeredAccountId: text("registered_account_id")
      .notNull()
      .references(() => registeredAccounts.id),
    transactionId: text("transaction_id").references(() => transactions.id),
    type: text("type", { enum: REGISTERED_TRANSACTION_TYPES }).notNull(),
    amount: integer("amount").notNull(), // cents
    taxYear: integer("tax_year").notNull(),
    date: text("date").notNull(), // YYYY-MM-DD
    notes: text("notes"),
  },
  (table) => [
    index("idx_registered_txns_account").on(table.registeredAccountId),
    index("idx_registered_txns_year").on(table.taxYear),
  ],
);

// --- User Profile ---

export const userProfile = sqliteTable("user_profile", {
  id: text("id").primaryKey().default("default"),
  name: text("name"),
  province: text("province").default("ON"),
  birthYear: integer("birth_year"),
  retirementAge: integer("retirement_age").default(65),
  annualIncome: integer("annual_income"), // cents
  marginalTaxRate: integer("marginal_tax_rate"), // basis points
  theme: text("theme", { enum: ["system", "light", "dark"] as const }).default(
    "system",
  ),
  defaultCurrency: text("default_currency").default("CAD"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});
