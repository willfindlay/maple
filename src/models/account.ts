export const ACCOUNT_TYPES = [
  "chequing",
  "savings",
  "credit_card",
  "loan",
  "mortgage",
  "investment",
  "tfsa",
  "rrsp",
  "fhsa",
  "resp",
  "lira",
  "rrif",
  "rdsp",
  "non_registered",
  "crypto",
  "property",
  "vehicle",
  "other_asset",
  "other_liability",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

/** Account types that represent assets (positive net worth contribution). */
export const ASSET_TYPES: readonly AccountType[] = [
  "chequing",
  "savings",
  "investment",
  "tfsa",
  "rrsp",
  "fhsa",
  "resp",
  "lira",
  "rrif",
  "rdsp",
  "non_registered",
  "crypto",
  "property",
  "vehicle",
  "other_asset",
];

/** Account types that represent liabilities (negative net worth contribution). */
export const LIABILITY_TYPES: readonly AccountType[] = [
  "credit_card",
  "loan",
  "mortgage",
  "other_liability",
];

/** Registered account types for contribution room tracking. */
export const REGISTERED_TYPES = [
  "tfsa",
  "rrsp",
  "fhsa",
  "resp",
  "lira",
  "rrif",
  "rdsp",
] as const;

export type RegisteredAccountType = (typeof REGISTERED_TYPES)[number];

export function isAssetType(type: AccountType): boolean {
  return (ASSET_TYPES as readonly string[]).includes(type);
}

/** Display-friendly groupings for the accounts list. */
export const ACCOUNT_TYPE_GROUPS = {
  Banking: ["chequing", "savings"],
  Credit: ["credit_card"],
  Loans: ["loan", "mortgage"],
  Investments: ["investment", "non_registered", "crypto"],
  Registered: ["tfsa", "rrsp", "fhsa", "resp", "lira", "rrif", "rdsp"],
  Property: ["property", "vehicle"],
  Other: ["other_asset", "other_liability"],
} as const;
