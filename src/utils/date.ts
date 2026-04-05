/** Get the current year. */
export function currentYear(): number {
  return new Date().getFullYear();
}

/** Get the current month in YYYY-MM format. */
export function currentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** Get today's date in YYYY-MM-DD format (local time, no timezone). */
export function today(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Determine the RRSP tax year for a contribution made on a given date.
 * Contributions in the first 60 days of a year can be attributed to the
 * prior tax year.
 *
 * Returns the latest tax year the contribution could apply to.
 * The user chooses which year to attribute it to at entry time.
 */
export function rrspDeadlineYear(dateStr: string): number {
  const date = new Date(dateStr + "T00:00:00");
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();

  // Jan 1 - Mar 1 (approximately 60 days) can be attributed to prior year.
  // The exact RRSP deadline is the 60th day of the year.
  const dayOfYear = getDayOfYear(date);
  if (dayOfYear <= 60) {
    return year - 1;
  }
  return year;
}

/** Check if a date string falls within the first 60 days of its year. */
export function isInRrspOverlapPeriod(dateStr: string): boolean {
  const date = new Date(dateStr + "T00:00:00");
  return getDayOfYear(date) <= 60;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Parse a YYYY-MM string into { year, month }. */
export function parseMonth(monthStr: string): { year: number; month: number } {
  const [yearStr, monthNumStr] = monthStr.split("-");
  return { year: parseInt(yearStr, 10), month: parseInt(monthNumStr, 10) };
}
