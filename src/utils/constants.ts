/**
 * Canadian financial constants for 2026.
 *
 * All monetary amounts in dollars (converted to cents at the call site).
 * All rates in basis points (1 bp = 0.01%).
 */
export const CANADIAN_FINANCE_2026 = {
  tfsa: {
    annualLimit: 7_000,
    cumulativeLimitSince2009: 109_000,
    historicalLimits: {
      2009: 5_000,
      2010: 5_000,
      2011: 5_000,
      2012: 5_000,
      2013: 5_500,
      2014: 5_500,
      2015: 10_000,
      2016: 5_500,
      2017: 5_500,
      2018: 5_500,
      2019: 6_000,
      2020: 6_000,
      2021: 6_000,
      2022: 6_000,
      2023: 6_500,
      2024: 7_000,
      2025: 7_000,
      2026: 7_000,
    } as Record<number, number>,
    /** 1% per month, in basis points */
    overcontributionPenaltyRate: 100,
  },

  rrsp: {
    annualLimit: 33_810,
    /** 18% in basis points */
    incomePercentage: 1_800,
    overcontributionGrace: 2_000,
    /** 1% per month, in basis points */
    overcontributionPenaltyRate: 100,
    hbpWithdrawalLimit: 60_000,
    hbpRepaymentYears: 15,
    llpAnnualLimit: 10_000,
    llpLifetimeLimit: 20_000,
    llpRepaymentYears: 10,
    /** Must convert to RRIF by Dec 31 of year turning 71 */
    maxAge: 71,
  },

  fhsa: {
    annualLimit: 8_000,
    lifetimeLimit: 40_000,
    maxCarryforward: 8_000,
    maxSingleYear: 16_000,
    accountLifetimeYears: 15,
  },

  resp: {
    lifetimeLimit: 50_000,
    /** 20% in basis points */
    cesgRate: 2_000,
    cesgAnnualMax: 500,
    cesgContributionForMax: 2_500,
    cesgLifetimeMax: 7_200,
    clbMax: 2_000,
  },

  federalTax: {
    brackets: [
      { min: 0, max: 57_375, rate: 1_500 },
      { min: 57_375, max: 114_750, rate: 2_050 },
      { min: 114_750, max: 158_468, rate: 2_600 },
      { min: 158_468, max: 220_000, rate: 2_900 },
      { min: 220_000, max: Infinity, rate: 3_300 },
    ],
    basicPersonalAmount: 16_452,
  },

  ontarioTax: {
    brackets: [
      { min: 0, max: 53_891, rate: 505 },
      { min: 53_891, max: 107_785, rate: 915 },
      { min: 107_785, max: 150_000, rate: 1_116 },
      { min: 150_000, max: 220_000, rate: 1_216 },
      { min: 220_000, max: Infinity, rate: 1_316 },
    ],
    surtaxThreshold1: 5_818,
    /** 20% in basis points */
    surtaxRate1: 2_000,
    surtaxThreshold2: 7_446,
    /** 36% in basis points */
    surtaxRate2: 3_600,
    basicPersonalAmount: 12_989,
  },

  cmhc: {
    /**
     * Premium rates for 25-year amortization.
     * LTV as integer percentage, rate in basis points.
     */
    insurancePremiumRates25yr: [
      { ltvMin: 65, ltvMax: 75, rate: 60 },
      { ltvMin: 75, ltvMax: 80, rate: 170 },
      { ltvMin: 80, ltvMax: 85, rate: 280 },
      { ltvMin: 85, ltvMax: 90, rate: 310 },
      { ltvMin: 90, ltvMax: 95, rate: 400 },
    ],
    maxInsurablePrice: 1_500_000,
    /** 5.25% floor in basis points */
    stressTestFloor: 525,
    /** 2% buffer in basis points */
    stressTestBuffer: 200,
    /** 39% in basis points */
    gdsMax: 3_900,
    /** 44% in basis points */
    tdsMax: 4_400,
  },

  ontarioLtt: {
    brackets: [
      { min: 0, max: 55_000, rate: 50 },
      { min: 55_000, max: 250_000, rate: 100 },
      { min: 250_000, max: 400_000, rate: 150 },
      { min: 400_000, max: 2_000_000, rate: 200 },
      { min: 2_000_000, max: Infinity, rate: 250 },
    ],
    firstTimeBuyerRebateMax: 4_000,
  },

  cpp: {
    maxPensionableEarnings: 74_600,
    basicExemption: 3_500,
    /** 5.95% in basis points */
    employeeRate: 595,
    maxEmployeeContribution: 4_230,
    cpp2MaxEarnings: 85_000,
    /** 4% in basis points */
    cpp2Rate: 400,
  },

  capitalGains: {
    /** 50% inclusion rate in basis points */
    incomeInclusionRateBps: 5_000,
  },
} as const;

/** Helper to get the TFSA annual limit for a given year. Returns 0 for years before 2009. */
export function getTfsaAnnualLimit(year: number): number {
  if (year < 2009) return 0;
  const limits = CANADIAN_FINANCE_2026.tfsa.historicalLimits;
  // For future years beyond our data, use the most recent known limit
  if (year > 2026) return limits[2026];
  return limits[year] ?? 0;
}
