/**
 * Format an integer amount in cents as a CAD currency string.
 * Examples: 12345 -> "$123.45", -500 -> "-$5.00", 0 -> "$0.00"
 */
export function formatCurrency(cents: number): string {
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const dollars = Math.floor(absCents / 100);
  const remaining = absCents % 100;
  const formatted = `$${dollars.toLocaleString("en-CA")}.${String(remaining).padStart(2, "0")}`;
  return isNegative ? `-${formatted}` : formatted;
}

/** Convert a dollar amount (e.g., 123.45) to cents (12345). Rounds to nearest cent. */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/** Convert cents to dollars. */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert a basis points value to a percentage for display.
 * Example: 525 -> 5.25, 1500 -> 15.00
 */
export function bpsToPercent(bps: number): number {
  return bps / 100;
}

/** Format basis points as a percentage string. Example: 525 -> "5.25%" */
export function formatPercent(bps: number): string {
  return `${bpsToPercent(bps).toFixed(2)}%`;
}

/** Convert a percentage to basis points. Example: 5.25 -> 525 */
export function percentToBps(percent: number): number {
  return Math.round(percent * 100);
}
