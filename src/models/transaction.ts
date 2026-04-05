export const IMPORT_SOURCES = ["manual", "plaid", "flinks", "csv"] as const;

export type ImportSource = (typeof IMPORT_SOURCES)[number];

export const REGISTERED_TRANSACTION_TYPES = [
  "contribution",
  "withdrawal",
  "transfer_in",
  "transfer_out",
] as const;

export type RegisteredTransactionType =
  (typeof REGISTERED_TRANSACTION_TYPES)[number];
