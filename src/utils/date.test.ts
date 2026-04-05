import { describe, it, expect } from "vitest";
import { rrspDeadlineYear, isInRrspOverlapPeriod, parseMonth } from "./date";

describe("rrspDeadlineYear", () => {
  it("returns prior year for dates in first 60 days", () => {
    expect(rrspDeadlineYear("2026-01-15")).toBe(2025);
    expect(rrspDeadlineYear("2026-02-28")).toBe(2025);
  });

  it("returns current year for dates after first 60 days", () => {
    expect(rrspDeadlineYear("2026-03-15")).toBe(2026);
    expect(rrspDeadlineYear("2026-06-01")).toBe(2026);
    expect(rrspDeadlineYear("2026-12-31")).toBe(2026);
  });

  it("handles March 1 as day 60 (non-leap year boundary)", () => {
    // In 2026 (non-leap), March 1 is day 60
    expect(rrspDeadlineYear("2026-03-01")).toBe(2025);
  });

  it("handles leap year", () => {
    // 2024 is a leap year. March 1 is day 61.
    expect(rrspDeadlineYear("2024-02-29")).toBe(2023);
    expect(rrspDeadlineYear("2024-03-01")).toBe(2024);
  });
});

describe("isInRrspOverlapPeriod", () => {
  it("returns true for dates in first 60 days", () => {
    expect(isInRrspOverlapPeriod("2026-01-01")).toBe(true);
    expect(isInRrspOverlapPeriod("2026-02-15")).toBe(true);
  });

  it("returns false for dates after first 60 days", () => {
    expect(isInRrspOverlapPeriod("2026-04-01")).toBe(false);
    expect(isInRrspOverlapPeriod("2026-12-31")).toBe(false);
  });
});

describe("parseMonth", () => {
  it("parses YYYY-MM string", () => {
    expect(parseMonth("2026-04")).toEqual({ year: 2026, month: 4 });
    expect(parseMonth("2025-12")).toEqual({ year: 2025, month: 12 });
  });
});
