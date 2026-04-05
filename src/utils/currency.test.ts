import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  dollarsToCents,
  centsToDollars,
  bpsToPercent,
  formatPercent,
  percentToBps,
} from "./currency";

describe("formatCurrency", () => {
  it("formats positive amounts", () => {
    expect(formatCurrency(12345)).toBe("$123.45");
    expect(formatCurrency(100)).toBe("$1.00");
    expect(formatCurrency(1)).toBe("$0.01");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-500)).toBe("-$5.00");
    expect(formatCurrency(-12345)).toBe("-$123.45");
  });

  it("formats large amounts with locale grouping", () => {
    const result = formatCurrency(123456789);
    expect(result).toContain("1,234,567");
    expect(result.endsWith(".89")).toBe(true);
  });
});

describe("dollarsToCents", () => {
  it("converts dollars to cents", () => {
    expect(dollarsToCents(123.45)).toBe(12345);
    expect(dollarsToCents(0)).toBe(0);
    expect(dollarsToCents(1)).toBe(100);
  });

  it("rounds to nearest cent", () => {
    expect(dollarsToCents(10.999)).toBe(1100);
    expect(dollarsToCents(10.994)).toBe(1099);
  });
});

describe("centsToDollars", () => {
  it("converts cents to dollars", () => {
    expect(centsToDollars(12345)).toBe(123.45);
    expect(centsToDollars(0)).toBe(0);
  });
});

describe("bpsToPercent", () => {
  it("converts basis points to percentage", () => {
    expect(bpsToPercent(525)).toBe(5.25);
    expect(bpsToPercent(1500)).toBe(15);
    expect(bpsToPercent(100)).toBe(1);
  });
});

describe("formatPercent", () => {
  it("formats basis points as percentage string", () => {
    expect(formatPercent(525)).toBe("5.25%");
    expect(formatPercent(1500)).toBe("15.00%");
  });
});

describe("percentToBps", () => {
  it("converts percentage to basis points", () => {
    expect(percentToBps(5.25)).toBe(525);
    expect(percentToBps(15)).toBe(1500);
  });
});
