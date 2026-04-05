import {
  getTfsaAnnualLimit,
  CANADIAN_FINANCE_2026,
} from "../../utils/constants";
import { currentYear } from "../../utils/date";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RegisteredTransaction {
  type: "contribution" | "withdrawal" | "transfer_in" | "transfer_out";
  amount: number; // cents (always positive)
  taxYear: number;
  date: string; // YYYY-MM-DD
}

export interface TfsaRoomResult {
  /** Total cumulative room ever earned (cents). */
  totalRoomEarned: number;
  /** Total contributions made across all years (cents). */
  totalContributions: number;
  /** Withdrawals that have been restored as room (Jan 1 of following year) (cents). */
  restoredWithdrawals: number;
  /** Current available room (cents). */
  availableRoom: number;
  /** Amount over-contributed (cents), 0 if not over. */
  overContribution: number;
  /** Breakdown by year. */
  yearlyBreakdown: TfsaYearBreakdown[];
}

export interface TfsaYearBreakdown {
  year: number;
  annualLimit: number; // cents
  contributions: number; // cents
  withdrawals: number; // cents
}

export interface RrspRoomResult {
  /** Deduction limit for the current year (cents). */
  deductionLimit: number;
  /** Total contributions this year (cents). */
  currentYearContributions: number;
  /** Available room remaining (cents). */
  availableRoom: number;
  /** Amount over-contributed beyond $2,000 grace (cents), 0 if not over. */
  overContribution: number;
  /** HBP balance remaining to repay (cents). */
  hbpBalanceOwing: number;
}

export interface TfsaOverContributionPenalty {
  /** Monthly penalty amount (cents). */
  monthlyPenalty: number;
  /** The over-contributed amount the penalty is based on (cents). */
  overAmount: number;
}

// ─── TFSA ───────────────────────────────────────────────────────────────────

/**
 * Calculate TFSA contribution room.
 *
 * Room = cumulative annual limits since eligibility year
 *      - total contributions
 *      + withdrawals from prior years (restored Jan 1)
 *
 * Current-year withdrawals are NOT added back until Jan 1 of next year.
 */
export function calculateTfsaRoom(
  eligibleSinceYear: number,
  txns: RegisteredTransaction[],
  asOfYear?: number,
): TfsaRoomResult {
  const year = asOfYear ?? currentYear();
  const startYear = Math.max(eligibleSinceYear, 2009);

  // Calculate cumulative room earned
  let totalRoomEarned = 0;
  for (let y = startYear; y <= year; y++) {
    totalRoomEarned += dollarsToCentsForLimit(getTfsaAnnualLimit(y));
  }

  // Tally contributions and withdrawals by year
  const yearlyMap = new Map<
    number,
    { contributions: number; withdrawals: number }
  >();
  for (let y = startYear; y <= year; y++) {
    yearlyMap.set(y, { contributions: 0, withdrawals: 0 });
  }

  let totalContributions = 0;
  for (const txn of txns) {
    if (txn.taxYear < startYear || txn.taxYear > year) continue;

    if (!yearlyMap.has(txn.taxYear)) {
      yearlyMap.set(txn.taxYear, { contributions: 0, withdrawals: 0 });
    }
    const entry = yearlyMap.get(txn.taxYear)!;

    if (txn.type === "contribution" || txn.type === "transfer_in") {
      entry.contributions += txn.amount;
      totalContributions += txn.amount;
    } else if (txn.type === "withdrawal" || txn.type === "transfer_out") {
      entry.withdrawals += txn.amount;
    }
  }

  // Withdrawals from prior years are restored as room (Jan 1 of following year).
  // Current-year withdrawals are NOT yet restored.
  let restoredWithdrawals = 0;
  for (let y = startYear; y < year; y++) {
    const entry = yearlyMap.get(y);
    if (entry) {
      restoredWithdrawals += entry.withdrawals;
    }
  }

  const availableRoom =
    totalRoomEarned - totalContributions + restoredWithdrawals;
  const overContribution = Math.max(0, -availableRoom);

  // Build yearly breakdown
  const yearlyBreakdown: TfsaYearBreakdown[] = [];
  for (let y = startYear; y <= year; y++) {
    const entry = yearlyMap.get(y) ?? { contributions: 0, withdrawals: 0 };
    yearlyBreakdown.push({
      year: y,
      annualLimit: dollarsToCentsForLimit(getTfsaAnnualLimit(y)),
      contributions: entry.contributions,
      withdrawals: entry.withdrawals,
    });
  }

  return {
    totalRoomEarned,
    totalContributions,
    restoredWithdrawals,
    availableRoom: Math.max(0, availableRoom),
    overContribution,
    yearlyBreakdown,
  };
}

/**
 * Calculate the monthly over-contribution penalty for TFSA.
 * Penalty is 1% per month on the highest excess amount during the month.
 */
export function calculateTfsaOverContributionPenalty(
  overAmount: number,
): TfsaOverContributionPenalty {
  if (overAmount <= 0) {
    return { monthlyPenalty: 0, overAmount: 0 };
  }
  const rate = CANADIAN_FINANCE_2026.tfsa.overcontributionPenaltyRate; // 100 bps = 1%
  const monthlyPenalty = Math.round((overAmount * rate) / 10_000);
  return { monthlyPenalty, overAmount };
}

// ─── RRSP ───────────────────────────────────────────────────────────────────

export interface RrspRoomInput {
  /** Earned income for the prior year (cents). Used to calculate 18% room. */
  priorYearIncome: number;
  /** Carry-forward unused room from prior years (cents). From Notice of Assessment. */
  unusedRoomCarryForward: number;
  /** Pension adjustment from employer (cents). Reduces current year room. */
  pensionAdjustment: number;
  /** All RRSP transactions for the current tax year. */
  currentYearTxns: RegisteredTransaction[];
  /** HBP withdrawals (cents). */
  hbpTotalWithdrawn: number;
  /** HBP repayments made so far (cents). */
  hbpTotalRepaid: number;
  /** Number of years since first HBP withdrawal. */
  hbpYearsSinceWithdrawal: number;
}

/**
 * Calculate RRSP contribution room.
 *
 * Current year new room = min(18% of prior year income, annual cap) - pension adjustment
 * Total room = new room + carry-forward
 * Available = total room - current year contributions
 */
export function calculateRrspRoom(input: RrspRoomInput): RrspRoomResult {
  const { rrsp } = CANADIAN_FINANCE_2026;

  // Calculate new room from income
  const incomeBasedRoom = Math.round(
    (input.priorYearIncome * rrsp.incomePercentage) / 10_000,
  );
  const cappedRoom = Math.min(
    incomeBasedRoom,
    dollarsToCentsForLimit(rrsp.annualLimit),
  );
  const newRoom = Math.max(0, cappedRoom - input.pensionAdjustment);

  // Total deduction limit
  const deductionLimit = newRoom + input.unusedRoomCarryForward;

  // Current year contributions
  let currentYearContributions = 0;
  for (const txn of input.currentYearTxns) {
    if (txn.type === "contribution" || txn.type === "transfer_in") {
      currentYearContributions += txn.amount;
    }
  }

  const availableRoom = deductionLimit - currentYearContributions;
  const graceAmount = dollarsToCentsForLimit(rrsp.overcontributionGrace);
  const overContribution = Math.max(0, -availableRoom - graceAmount);

  // HBP tracking
  const hbpBalanceOwing = calculateHbpBalance(
    input.hbpTotalWithdrawn,
    input.hbpTotalRepaid,
    input.hbpYearsSinceWithdrawal,
  );

  return {
    deductionLimit,
    currentYearContributions,
    availableRoom: Math.max(0, availableRoom),
    overContribution,
    hbpBalanceOwing,
  };
}

/**
 * Calculate HBP (Home Buyers' Plan) remaining balance.
 *
 * The HBP requires repayment over 15 years, starting the 2nd year after withdrawal.
 * Minimum annual repayment = total withdrawn / 15.
 * If repayment is less than minimum, the shortfall is added to taxable income.
 */
export function calculateHbpBalance(
  totalWithdrawn: number,
  totalRepaid: number,
  yearsSinceWithdrawal: number,
): number {
  if (totalWithdrawn === 0) return 0;

  const { rrsp } = CANADIAN_FINANCE_2026;
  const maxWithdrawal = dollarsToCentsForLimit(rrsp.hbpWithdrawalLimit);
  const effectiveWithdrawn = Math.min(totalWithdrawn, maxWithdrawal);

  // Repayment starts in the 2nd year after withdrawal
  const repaymentYearsElapsed = Math.max(0, yearsSinceWithdrawal - 1);
  const minRepaymentPerYear = Math.round(
    effectiveWithdrawn / rrsp.hbpRepaymentYears,
  );
  const expectedRepaid = Math.min(
    minRepaymentPerYear * repaymentYearsElapsed,
    effectiveWithdrawn,
  );

  // Balance owing is the original amount minus actual repayments
  // (shortfalls become taxable income but don't reduce the balance)
  return Math.max(0, effectiveWithdrawn - totalRepaid);
}

/**
 * Calculate the RRSP over-contribution penalty.
 * There is a $2,000 grace amount. Penalty is 1% per month on excess above grace.
 */
export function calculateRrspOverContributionPenalty(
  overAmount: number,
): number {
  if (overAmount <= 0) return 0;
  const rate = CANADIAN_FINANCE_2026.rrsp.overcontributionPenaltyRate;
  return Math.round((overAmount * rate) / 10_000);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert dollar limits from constants to cents. */
function dollarsToCentsForLimit(dollars: number): number {
  return dollars * 100;
}
