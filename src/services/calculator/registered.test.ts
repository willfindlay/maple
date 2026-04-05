import { describe, it, expect } from "vitest";
import {
  calculateTfsaRoom,
  calculateTfsaOverContributionPenalty,
  calculateRrspRoom,
  calculateHbpBalance,
  calculateRrspOverContributionPenalty,
  type RegisteredTransaction,
} from "./registered";

// Helper: dollars to cents
const c = (dollars: number) => dollars * 100;

describe("TFSA room calculation", () => {
  it("calculates full room for someone eligible since 2009", () => {
    const result = calculateTfsaRoom(2009, [], 2026);
    // 2009-2012: 4*5000 = 20000
    // 2013-2014: 2*5500 = 11000
    // 2015: 10000
    // 2016-2018: 3*5500 = 16500
    // 2019-2022: 4*6000 = 24000
    // 2023: 6500
    // 2024-2026: 3*7000 = 21000
    // Total: 109000
    expect(result.totalRoomEarned).toBe(c(109_000));
    expect(result.availableRoom).toBe(c(109_000));
    expect(result.overContribution).toBe(0);
  });

  it("calculates room for someone eligible since 2020", () => {
    const result = calculateTfsaRoom(2020, [], 2026);
    // 2020-2022: 3*6000 = 18000
    // 2023: 6500
    // 2024-2026: 3*7000 = 21000
    // Total: 45500
    expect(result.totalRoomEarned).toBe(c(45_500));
    expect(result.availableRoom).toBe(c(45_500));
  });

  it("ignores eligibility years before 2009", () => {
    // Someone born in 1970, turned 18 in 1988, but TFSA started 2009
    const result = calculateTfsaRoom(1988, [], 2026);
    expect(result.totalRoomEarned).toBe(c(109_000));
  });

  it("reduces room when contributions are made", () => {
    const txns: RegisteredTransaction[] = [
      {
        type: "contribution",
        amount: c(6_000),
        taxYear: 2024,
        date: "2024-03-15",
      },
      {
        type: "contribution",
        amount: c(7_000),
        taxYear: 2025,
        date: "2025-01-10",
      },
    ];
    const result = calculateTfsaRoom(2009, txns, 2026);
    expect(result.totalContributions).toBe(c(13_000));
    expect(result.availableRoom).toBe(c(109_000 - 13_000));
  });

  it("restores withdrawal room on Jan 1 of the following year", () => {
    const txns: RegisteredTransaction[] = [
      {
        type: "contribution",
        amount: c(50_000),
        taxYear: 2023,
        date: "2023-01-15",
      },
      {
        type: "withdrawal",
        amount: c(10_000),
        taxYear: 2024,
        date: "2024-06-01",
      },
    ];
    // As of 2025: the 2024 withdrawal is restored
    const result2025 = calculateTfsaRoom(2009, txns, 2025);
    expect(result2025.restoredWithdrawals).toBe(c(10_000));
    expect(result2025.availableRoom).toBe(c(109_000 - 7_000 - 50_000 + 10_000));
    // 109000 earned through 2025 is wrong, let me recalc
    // Through 2025: 102000. Available = 102000 - 50000 + 10000 = 62000
    expect(result2025.totalRoomEarned).toBe(c(102_000));
    expect(result2025.availableRoom).toBe(c(62_000));
  });

  it("does NOT restore current-year withdrawals", () => {
    const txns: RegisteredTransaction[] = [
      {
        type: "contribution",
        amount: c(50_000),
        taxYear: 2023,
        date: "2023-01-15",
      },
      {
        type: "withdrawal",
        amount: c(10_000),
        taxYear: 2026,
        date: "2026-03-01",
      },
    ];
    const result = calculateTfsaRoom(2009, txns, 2026);
    // Current year withdrawal not restored yet
    expect(result.restoredWithdrawals).toBe(0);
    expect(result.availableRoom).toBe(c(109_000 - 50_000));
  });

  it("detects over-contribution", () => {
    const txns: RegisteredTransaction[] = [
      {
        type: "contribution",
        amount: c(115_000),
        taxYear: 2026,
        date: "2026-01-15",
      },
    ];
    const result = calculateTfsaRoom(2009, txns, 2026);
    expect(result.overContribution).toBe(c(6_000)); // 115000 - 109000
    expect(result.availableRoom).toBe(0);
  });

  it("tracks multiple accounts across institutions", () => {
    // Contributions from two different TFSA accounts should sum
    const txns: RegisteredTransaction[] = [
      {
        type: "contribution",
        amount: c(3_000),
        taxYear: 2026,
        date: "2026-01-05",
      },
      {
        type: "contribution",
        amount: c(4_000),
        taxYear: 2026,
        date: "2026-02-10",
      },
    ];
    const result = calculateTfsaRoom(2009, txns, 2026);
    expect(result.totalContributions).toBe(c(7_000));
    expect(result.availableRoom).toBe(c(109_000 - 7_000));
  });

  it("provides correct yearly breakdown", () => {
    const txns: RegisteredTransaction[] = [
      {
        type: "contribution",
        amount: c(5_000),
        taxYear: 2024,
        date: "2024-03-15",
      },
      {
        type: "withdrawal",
        amount: c(2_000),
        taxYear: 2024,
        date: "2024-08-01",
      },
      {
        type: "contribution",
        amount: c(7_000),
        taxYear: 2025,
        date: "2025-01-10",
      },
    ];
    const result = calculateTfsaRoom(2024, txns, 2026);

    expect(result.yearlyBreakdown).toHaveLength(3);

    const y2024 = result.yearlyBreakdown.find((y) => y.year === 2024)!;
    expect(y2024.annualLimit).toBe(c(7_000));
    expect(y2024.contributions).toBe(c(5_000));
    expect(y2024.withdrawals).toBe(c(2_000));

    const y2025 = result.yearlyBreakdown.find((y) => y.year === 2025)!;
    expect(y2025.contributions).toBe(c(7_000));
  });
});

describe("TFSA over-contribution penalty", () => {
  it("returns zero penalty when not over-contributed", () => {
    const result = calculateTfsaOverContributionPenalty(0);
    expect(result.monthlyPenalty).toBe(0);
  });

  it("calculates 1% monthly penalty on over-contribution", () => {
    // $5,000 over = 500000 cents. 1% = 5000 cents = $50
    const result = calculateTfsaOverContributionPenalty(c(5_000));
    expect(result.monthlyPenalty).toBe(c(50));
    expect(result.overAmount).toBe(c(5_000));
  });
});

describe("RRSP room calculation", () => {
  it("calculates 18% of prior year income capped at annual limit", () => {
    const result = calculateRrspRoom({
      priorYearIncome: c(120_000),
      unusedRoomCarryForward: 0,
      pensionAdjustment: 0,
      currentYearTxns: [],
      hbpTotalWithdrawn: 0,
      hbpTotalRepaid: 0,
      hbpYearsSinceWithdrawal: 0,
    });
    // 18% of 120000 = 21600, which is under the 33810 cap
    expect(result.deductionLimit).toBe(c(21_600));
    expect(result.availableRoom).toBe(c(21_600));
  });

  it("caps room at the annual limit for high earners", () => {
    const result = calculateRrspRoom({
      priorYearIncome: c(300_000),
      unusedRoomCarryForward: 0,
      pensionAdjustment: 0,
      currentYearTxns: [],
      hbpTotalWithdrawn: 0,
      hbpTotalRepaid: 0,
      hbpYearsSinceWithdrawal: 0,
    });
    // 18% of 300000 = 54000, capped at 33810
    expect(result.deductionLimit).toBe(c(33_810));
  });

  it("adds carry-forward room", () => {
    const result = calculateRrspRoom({
      priorYearIncome: c(100_000),
      unusedRoomCarryForward: c(15_000),
      pensionAdjustment: 0,
      currentYearTxns: [],
      hbpTotalWithdrawn: 0,
      hbpTotalRepaid: 0,
      hbpYearsSinceWithdrawal: 0,
    });
    // 18% of 100000 = 18000 + 15000 carry-forward = 33000
    expect(result.deductionLimit).toBe(c(33_000));
    expect(result.availableRoom).toBe(c(33_000));
  });

  it("deducts pension adjustment", () => {
    const result = calculateRrspRoom({
      priorYearIncome: c(100_000),
      unusedRoomCarryForward: 0,
      pensionAdjustment: c(5_000),
      currentYearTxns: [],
      hbpTotalWithdrawn: 0,
      hbpTotalRepaid: 0,
      hbpYearsSinceWithdrawal: 0,
    });
    // 18% of 100000 = 18000 - 5000 PA = 13000
    expect(result.deductionLimit).toBe(c(13_000));
  });

  it("reduces room by current year contributions", () => {
    const txns: RegisteredTransaction[] = [
      {
        type: "contribution",
        amount: c(10_000),
        taxYear: 2026,
        date: "2026-01-15",
      },
    ];
    const result = calculateRrspRoom({
      priorYearIncome: c(100_000),
      unusedRoomCarryForward: 0,
      pensionAdjustment: 0,
      currentYearTxns: txns,
      hbpTotalWithdrawn: 0,
      hbpTotalRepaid: 0,
      hbpYearsSinceWithdrawal: 0,
    });
    // 18000 - 10000 = 8000
    expect(result.availableRoom).toBe(c(8_000));
    expect(result.currentYearContributions).toBe(c(10_000));
  });

  it("allows $2,000 over-contribution grace before penalty", () => {
    const txns: RegisteredTransaction[] = [
      {
        type: "contribution",
        amount: c(20_000),
        taxYear: 2026,
        date: "2026-01-15",
      },
    ];
    const result = calculateRrspRoom({
      priorYearIncome: c(100_000), // 18000 room
      unusedRoomCarryForward: 0,
      pensionAdjustment: 0,
      currentYearTxns: txns,
      hbpTotalWithdrawn: 0,
      hbpTotalRepaid: 0,
      hbpYearsSinceWithdrawal: 0,
    });
    // Over by 2000, but within $2000 grace
    expect(result.overContribution).toBe(0);
  });

  it("calculates over-contribution penalty beyond grace", () => {
    const txns: RegisteredTransaction[] = [
      {
        type: "contribution",
        amount: c(25_000),
        taxYear: 2026,
        date: "2026-01-15",
      },
    ];
    const result = calculateRrspRoom({
      priorYearIncome: c(100_000), // 18000 room
      unusedRoomCarryForward: 0,
      pensionAdjustment: 0,
      currentYearTxns: txns,
      hbpTotalWithdrawn: 0,
      hbpTotalRepaid: 0,
      hbpYearsSinceWithdrawal: 0,
    });
    // Over by 7000, minus 2000 grace = 5000 penalizable
    expect(result.overContribution).toBe(c(5_000));
  });
});

describe("HBP balance calculation", () => {
  it("returns zero when no HBP withdrawal", () => {
    expect(calculateHbpBalance(0, 0, 0)).toBe(0);
  });

  it("returns full balance before repayment period starts", () => {
    // Year 0 (withdrawal year) and year 1 (grace year), no repayment required yet
    expect(calculateHbpBalance(c(35_000), 0, 0)).toBe(c(35_000));
    expect(calculateHbpBalance(c(35_000), 0, 1)).toBe(c(35_000));
  });

  it("reduces balance by repayments", () => {
    // Withdrew 30000, repaid 4000 over 3 years
    expect(calculateHbpBalance(c(30_000), c(4_000), 3)).toBe(c(26_000));
  });

  it("caps effective withdrawal at HBP limit", () => {
    // Tried to withdraw 70000 but limit is 60000
    const balance = calculateHbpBalance(c(70_000), c(10_000), 5);
    expect(balance).toBe(c(50_000)); // 60000 - 10000
  });

  it("balance reaches zero when fully repaid", () => {
    expect(calculateHbpBalance(c(30_000), c(30_000), 10)).toBe(0);
  });
});

describe("RRSP over-contribution penalty", () => {
  it("returns zero for no over-contribution", () => {
    expect(calculateRrspOverContributionPenalty(0)).toBe(0);
  });

  it("calculates 1% monthly penalty", () => {
    // $3,000 over = 300000 cents. 1% = 3000 cents = $30
    expect(calculateRrspOverContributionPenalty(c(3_000))).toBe(c(30));
  });
});
