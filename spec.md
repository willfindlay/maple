# Maple — Personal Financial Command Center
## Product Specification Document v1.0

> **Working Name:** Maple (Canadian-first, open-source, local-first personal finance platform)
> **Author:** William + Claude
> **Date:** April 4, 2026
> **Purpose:** Complete specification for Claude Code development

---

## 1. Executive Summary

Maple is an open-core, local-first, privacy-focused personal finance application built for Canadians. It unifies budgeting, expense tracking, investment monitoring, registered account management (TFSA/RRSP/FHSA/RESP), retirement planning, and home purchase planning into a single application with optional AI-powered insights via Claude.

### 1.1 Why Maple Exists

The Canadian personal finance app market is underserved. The dominant players (Monarch Money, YNAB, Quicken Simplifi, Origin) are US-centric, cloud-dependent, and lack native understanding of Canadian financial concepts like registered accounts, CMHC mortgage insurance, provincial land transfer taxes, and the stress test. Canadian users are forced to cobble together online banking portals, custom Google Sheets, and US-focused apps — losing holistic visibility into their financial picture.

### 1.2 Core Differentiators

| Feature | Maple | Monarch | YNAB | Actual Budget | Origin |
|---------|-------|---------|------|---------------|--------|
| Local-first data | ✅ | ❌ (cloud) | ❌ (cloud) | ✅ | ❌ (cloud) |
| Open source core | ✅ (AGPL) | ❌ | ❌ | ✅ (MIT) | ❌ |
| Canadian tax accounts | ✅ native | ❌ | ❌ | ❌ | ❌ |
| CMHC/stress test calc | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI financial advisor | ✅ (Claude) | ❌ | ❌ | ❌ | ✅ (built-in) |
| Bank sync (Canada) | ✅ (Plaid/Flinks) | ✅ (Plaid) | ✅ | ✅ (limited) | ✅ |
| Investment tracking | ✅ | Basic | ❌ | ❌ | ✅ |
| Retirement modeling | ✅ | ❌ | ❌ | ❌ | ✅ |
| Cross-platform | ✅ (native mobile, webview desktop) | Web+mobile | Web+mobile | Web | Web+mobile |

### 1.3 Personal Goals

1. Build an app that William actively wants to use daily
2. Evolve into a product others will pay for
3. Generate enough savings insight to offset $300/month Claude Code subscription
4. Create an end-to-end plan for affording a new house in Ottawa

---

## 2. Competitive Landscape Analysis

### 2.1 Market Overview (2026)

The personal finance app market has consolidated significantly since Mint's shutdown in early 2024. Key trends:

- **AI integration is baseline**: Origin leads with a built-in AI advisor that understands user financial data. Others are adding AI features rapidly.
- **Privacy is a growing differentiator**: Actual Budget (25K+ GitHub stars) and Treeline (Rust-based, DuckDB-powered) prove demand for local-first finance tools.
- **Holistic platforms win**: Users are migrating from single-purpose budgeters to all-in-one platforms that connect spending, investing, and planning.
- **Open banking is arriving in Canada**: Flinks is the only live open banking API provider in Canada, with connections to National Bank, EQ Bank, FirstOntario, and Central 1. Canada's open banking framework launches 2026-2027.

### 2.2 Direct Competitors

**Monarch Money** ($14.99/month, $99.99/year)
- Strengths: Flexible budgeting, household collaboration, 13K+ institution connections, strong community (30K+ Reddit)
- Weaknesses: Cloud-only, US-centric, no Canadian tax account awareness, no investment analysis depth
- Gap we exploit: No registered account tracking, no Canadian mortgage planning

**YNAB ($14.99/month, $109/year)**
- Strengths: Best-in-class zero-based budgeting methodology, strong educational content, behavior change focus
- Weaknesses: No investment tracking, no financial planning, cloud-only, steep learning curve
- Gap we exploit: Entirely focused on budgeting — no holistic financial picture

**Actual Budget (Free, open source)**
- Strengths: Local-first, privacy-focused, fast, growing community, envelope budgeting
- Weaknesses: Budgeting only, no investment tracking, no financial planning, NodeJS web app (not native mobile), limited bank sync
- Gap we exploit: No investment/retirement/home planning features, no Canadian specifics

**Origin ($9-15/month)**
- Strengths: Holistic platform (budgeting + investing + retirement), AI advisor, clean UX
- Weaknesses: Cloud-only, US-focused, closed source, expensive
- Gap we exploit: No Canadian tax account awareness, closed ecosystem, cloud dependency

**Treeline (New, open source)**
- Strengths: Local-first, Rust + DuckDB, SQL-queryable transactions, plugin system
- Weaknesses: Very early stage, desktop only, no financial planning, no mobile
- Gap we exploit: Early stage competitor — validates our thesis but lacks planning features

**Quicken Simplifi ($2.99-5.99/month)**
- Strengths: Cash flow forecasting, spending plans, affordable, award-winning UX
- Weaknesses: Cloud-dependent, US-focused, limited investment features
- Gap we exploit: No Canadian specifics, cloud-only

**Copilot Money (~$15/month)**
- Strengths: Strong design, iOS-focused, recently added investment tracking, growing user base
- Weaknesses: US-centric, cloud-only, no Canadian specifics
- Gap we exploit: No registered account awareness, no Canadian mortgage planning, cloud-dependent

**Lunch Money ($10/month)**
- Strengths: Indie-built, developer-friendly, multi-currency support, growing following
- Weaknesses: Cloud-only, no Canadian tax accounts, no financial planning
- Gap we exploit: No holistic planning, no Canadian specifics, cloud-dependent

### 2.3 Indirect Competitors

- **Wealthsimple**: Canadian, but focused on brokerage/trading. Shows TFSA/RRSP room for Wealthsimple-held accounts only.
- **Hardbacon**: Canadian (Montreal), investment tracking, Canadian bank connections. Closest Canadian competitor. Cloud-only, no budgeting depth, no registered account room tracking, no open source.
- **RBC/TD/BMO banking apps**: Transaction viewing only, no cross-institution aggregation
- **Google Sheets / custom spreadsheets**: What many Canadians (including William) actually use. Proves the gap.
- **Ghostfolio**: Open-source investment tracker, but no budgeting or planning

### 2.4 Market Gap Summary

No existing product combines:
1. Local-first privacy
2. Native Canadian financial concepts (TFSA/RRSP/FHSA contribution room tracking, CMHC, stress test, provincial taxes)
3. Holistic financial planning (budget + invest + retire + home)
4. Open-source core with sustainable premium model
5. AI-powered insights
6. Cross-platform native experience

This is Maple's lane.

---

## 3. Technical Architecture

### 3.1 Platform Strategy

```
┌─────────────────────────────────────────────┐
│              Maple Application              │
├─────────┬─────────┬─────────┬───────────────┤
│ Desktop │   iOS   │ Android │   Web (later) │
│(Tauri v2)│ (Expo) │ (Expo)  │  (Expo Web)   │
├─────────┴─────────┴─────────┴───────────────┤
│           React Native (Expo)               │
├─────────────────────────────────────────────┤
│            Shared Business Logic            │
│    (TypeScript: hooks, utils, models)       │
├─────────────────────────────────────────────┤
│          Local Database (SQLite)            │
│        via expo-sqlite (all platforms)      │
├─────────────────────────────────────────────┤
│        Optional Services (Premium)          │
│   Plaid/Flinks │ Claude API │ Cloud Sync    │
└─────────────────────────────────────────────┘
```

### 3.2 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React Native via Expo (latest stable SDK at dev start) | Cross-platform from single codebase. William has Expo experience (Iron Log). |
| Desktop | Tauri v2 wrapping Expo Web build | Stable since late 2024, 2-10 MB bundles (vs Electron's 80-150 MB), uses OS WebView. **Requires POC spike** (see below) |
| Language | TypeScript (strict mode) | Type safety for financial calculations is non-negotiable |
| Database | SQLite via `expo-sqlite` (mobile/web/desktop) | Local-first, no server required, excellent performance |
| ORM/Query | Drizzle ORM | Type-safe SQL, lightweight, works with SQLite |
| State | Zustand | Lightweight, minimal boilerplate, works well with React Native |
| Navigation | Expo Router (file-based) | Convention over configuration, deep linking support |
| Charts | Victory Native XL | Skia-powered, native-feeling charts. Uses CanvasKit WASM on web/desktop (verify bundle size impact in Tauri POC) |
| UI Components | Tamagui or NativeWind (TailwindCSS for RN) | Cross-platform styling that looks native |
| AI Integration | Anthropic Claude API (claude-sonnet-4-6) | Premium feature — financial analysis and recommendations |
| Bank Sync | Plaid (US/Canada) + Flinks (Canada-specific) | Premium feature — Plaid covers RBC, TD, etc. Flinks for Canadian open banking |
| CSV Parsing | Papa Parse | Battle-tested CSV parser for statement imports |
| Encryption | SQLCipher (via `expo-sqlite` encrypted mode) | At-rest encryption for local financial data |
| Testing | Vitest + React Native Testing Library | Fast unit/integration testing |
| Build/Deploy | EAS Build + EAS Submit (iOS/Android), tauri build (desktop) | William has EAS experience |

### 3.2.1 Tauri Desktop POC Spike (Pre-Phase 1a, 1-2 days)

Before committing to the Tauri desktop path, validate the full stack end-to-end:

1. Create a minimal Expo Web app that uses `expo-sqlite` to create, write, and read an encrypted (SQLCipher) database in a Tauri v2 webview
2. Test on macOS, Windows, and Linux
3. Confirm: expo-sqlite's WASM/OPFS backend works inside Tauri's WebView, SQLCipher encryption works through expo-sqlite's web target, and Victory Native XL (Skia/CanvasKit WASM) renders correctly with acceptable bundle size

If this fails, alternatives: use Tauri's Rust-side SQL plugin for native SQLite on desktop (requires a platform abstraction layer between mobile and desktop data access), or defer desktop to Phase 2+.

### 3.3 Project Structure

```
maple/
├── app/                          # Expo Router pages
│   ├── (tabs)/
│   │   ├── dashboard.tsx         # Main dashboard / net worth
│   │   ├── budget.tsx            # Budget overview
│   │   ├── accounts.tsx          # All accounts list
│   │   ├── investments.tsx       # Investment portfolio
│   │   └── plan.tsx              # Financial planning hub
│   ├── account/[id].tsx          # Account detail
│   ├── transaction/[id].tsx      # Transaction detail
│   ├── settings/                 # Settings screens
│   └── _layout.tsx               # Root layout
├── src/
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema definitions
│   │   ├── migrations/           # SQL migrations
│   │   └── seed.ts               # Demo data seeder
│   ├── models/                   # Domain models & types
│   │   ├── account.ts
│   │   ├── transaction.ts
│   │   ├── budget.ts
│   │   ├── investment.ts
│   │   ├── registered-account.ts # TFSA/RRSP/FHSA/RESP
│   │   └── mortgage.ts
│   ├── services/
│   │   ├── plaid.ts              # Plaid integration (premium)
│   │   ├── flinks.ts             # Flinks integration (premium)
│   │   ├── claude.ts             # Claude AI integration (premium)
│   │   ├── csv-import.ts         # CSV/OFX/QFX import
│   │   ├── calculator/
│   │   │   ├── mortgage.ts       # CMHC, stress test, LTT
│   │   │   ├── retirement.ts     # CPP, OAS, RRSP drawdown
│   │   │   ├── tax.ts            # Federal + provincial marginal rates
│   │   │   ├── registered.ts     # Contribution room tracking
│   │   │   └── compound.ts       # Compound interest / projections
│   │   └── sync.ts               # Optional cloud sync
│   ├── stores/                   # Zustand stores
│   ├── hooks/                    # Custom React hooks
│   ├── components/               # Shared UI components
│   │   ├── charts/
│   │   ├── forms/
│   │   └── layout/
│   ├── utils/
│   │   ├── currency.ts           # CAD formatting, rounding
│   │   ├── date.ts               # Fiscal year awareness
│   │   └── constants.ts          # Tax brackets, limits, etc.
│   └── theme/                    # Design tokens
├── src-tauri/                    # Tauri v2 desktop wrapper
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/main.rs
├── assets/
├── drizzle.config.ts
├── app.json                      # Expo config
├── package.json
└── tsconfig.json
```

### 3.4 Database Schema (Core)

> **Date convention:** Transaction dates are stored as `YYYY-MM-DD` local date strings
> with no time or timezone component. `created_at` and `updated_at` use `datetime('now')`
> which produces UTC timestamps (`YYYY-MM-DD HH:MM:SS`). Month fields use `YYYY-MM`.
>
> **Convention:** All monetary amounts are stored as INTEGER in minor currency units
> (cents). $123.45 is stored as 12345. All rates and percentages are stored as INTEGER
> in basis points (1 bp = 0.01%). 5.25% is stored as 525, 15% is stored as 1500.
> TEXT UUIDs are used as primary keys for portability and future sync compatibility.
> Benchmark UUID vs INTEGER PKs on a 50K-row transactions table during Phase 1a.
> If UUID PKs show unacceptable query latency, switch to INTEGER PRIMARY KEY
> AUTOINCREMENT with a separate `uuid TEXT UNIQUE` column before any users have data.
>
> **Exception:** `holdings.quantity` and `equity_compensation.quantity` use REAL (IEEE 754
> double) for share counts. Fractional shares (e.g., 0.123456 of VGRO) are common and
> double precision provides ~15 significant digits, which is sufficient. These are the
> only REAL columns in the schema; all monetary amounts and rates remain INTEGER.

```sql
-- Core financial accounts
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN (
    'chequing', 'savings', 'credit_card', 'loan',
    'mortgage', 'investment', 'tfsa', 'rrsp', 'fhsa',
    'resp', 'lira', 'rrif', 'rdsp', 'non_registered',
    'crypto', 'property', 'vehicle', 'other_asset', 'other_liability'
  )),
  institution TEXT,               -- e.g., 'RBC', 'Wealthsimple'
  currency TEXT DEFAULT 'CAD',
  balance INTEGER DEFAULT 0,      -- cents
  is_asset INTEGER DEFAULT 1,     -- 1 = asset, 0 = liability; derived from type at app layer, stored for query convenience
  is_off_budget INTEGER DEFAULT 0,
  plaid_account_id TEXT,          -- For Plaid-linked accounts
  flinks_account_id TEXT,         -- For Flinks-linked accounts
  notes TEXT,
  deleted_at TEXT,                -- soft delete
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Transactions
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  date TEXT NOT NULL,              -- ISO 8601 date
  amount INTEGER NOT NULL,         -- cents; negative = outflow, positive = inflow
  payee TEXT,
  category_id TEXT REFERENCES categories(id),
  subcategory_id TEXT REFERENCES categories(id),
  memo TEXT,
  is_transfer INTEGER DEFAULT 0,
  transfer_account_id TEXT REFERENCES accounts(id),
  is_reconciled INTEGER DEFAULT 0,
  is_pending INTEGER DEFAULT 0,
  import_source TEXT,              -- 'manual', 'plaid', 'flinks', 'csv'
  plaid_transaction_id TEXT,
  deleted_at TEXT,                 -- soft delete
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Budget categories
-- Categories cannot be deleted while transactions reference them. Use "hidden" to
-- remove from selection UI while preserving historical data.
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES categories(id), -- For subcategories
  icon TEXT,
  color TEXT,
  is_income INTEGER DEFAULT 0,
  is_hidden INTEGER DEFAULT 0,    -- hidden from selection UI but preserved for history
  sort_order INTEGER DEFAULT 0
);

-- Monthly budget allocations
CREATE TABLE budget_allocations (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  month TEXT NOT NULL,             -- 'YYYY-MM' format
  allocated INTEGER DEFAULT 0,    -- cents
  UNIQUE(category_id, month)
);

-- Canadian registered account tracking
CREATE TABLE registered_accounts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  type TEXT NOT NULL CHECK(type IN ('tfsa', 'rrsp', 'fhsa', 'resp', 'lira', 'rrif', 'rdsp')),
  holder_name TEXT,
  date_opened TEXT,
  -- TFSA specific
  tfsa_eligible_since_year INTEGER,  -- Year first eligible (turned 18 or became resident)
  -- RRSP specific
  rrsp_deduction_limit INTEGER,      -- cents; from Notice of Assessment
  rrsp_pension_adjustment INTEGER,   -- cents
  -- FHSA specific
  fhsa_lifetime_used INTEGER DEFAULT 0, -- cents
  fhsa_is_first_time_buyer INTEGER DEFAULT 1,
  -- RESP specific
  resp_beneficiary TEXT,
  resp_lifetime_contributions INTEGER DEFAULT 0, -- cents
  resp_cesg_received INTEGER DEFAULT 0,          -- cents
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Contribution/withdrawal tracking for registered accounts
CREATE TABLE registered_transactions (
  id TEXT PRIMARY KEY,
  registered_account_id TEXT NOT NULL REFERENCES registered_accounts(id),
  transaction_id TEXT REFERENCES transactions(id),
  type TEXT NOT NULL CHECK(type IN ('contribution', 'withdrawal', 'transfer_in', 'transfer_out')),
  amount INTEGER NOT NULL,         -- cents
  tax_year INTEGER NOT NULL,       -- The tax year this applies to
  date TEXT NOT NULL,
  notes TEXT
);

-- Investment holdings
CREATE TABLE holdings (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  symbol TEXT NOT NULL,            -- Ticker symbol
  name TEXT,                       -- Full name
  quantity REAL NOT NULL,          -- share count (fractional shares allowed)
  avg_cost_per_unit INTEGER,      -- cents
  current_price INTEGER,          -- cents
  currency TEXT DEFAULT 'CAD',
  asset_class TEXT,                -- 'equity', 'fixed_income', 'cash', 'real_estate', 'crypto', 'other'
  geography TEXT,                  -- 'canada', 'us', 'international', 'emerging'
  last_price_update TEXT
);

-- Mortgage / home purchase planning
CREATE TABLE mortgages (
  id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES accounts(id),
  property_value INTEGER,         -- cents
  purchase_price INTEGER,         -- cents
  down_payment INTEGER,           -- cents
  mortgage_amount INTEGER,        -- cents
  interest_rate INTEGER,          -- basis points (e.g., 5.25% = 525)
  amortization_years INTEGER DEFAULT 25,
  term_years INTEGER DEFAULT 5,
  payment_frequency TEXT DEFAULT 'monthly',
  cmhc_premium INTEGER DEFAULT 0, -- cents
  province TEXT,                   -- For land transfer tax calculation
  is_first_time_buyer INTEGER DEFAULT 0,
  start_date TEXT,
  maturity_date TEXT
);

-- Recurring transactions (bills, subscriptions, income)
CREATE TABLE recurring_transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  payee TEXT NOT NULL,
  amount INTEGER NOT NULL,         -- cents
  category_id TEXT REFERENCES categories(id),
  frequency TEXT NOT NULL CHECK(frequency IN (
    'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annually', 'annually'
  )),
  next_date TEXT NOT NULL,
  end_date TEXT,
  is_auto_enter INTEGER DEFAULT 0,
  notes TEXT
);

-- Financial goals
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN (
    'emergency_fund', 'home_down_payment', 'retirement',
    'debt_payoff', 'vacation', 'education', 'custom'
  )),
  target_amount INTEGER NOT NULL,  -- cents
  current_amount INTEGER DEFAULT 0, -- cents; recomputed as SUM(accounts.balance) for linked goal_accounts
  target_date TEXT,
  monthly_contribution INTEGER,    -- cents
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Split transactions (one payment across multiple categories)
CREATE TABLE transaction_splits (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL REFERENCES transactions(id),
  category_id TEXT NOT NULL REFERENCES categories(id),
  amount INTEGER NOT NULL,         -- cents; splits must sum to parent transaction amount
  memo TEXT
);

-- Auto-categorization rules (payee pattern -> category)
CREATE TABLE categorization_rules (
  id TEXT PRIMARY KEY,
  pattern TEXT NOT NULL,           -- match string
  match_type TEXT NOT NULL CHECK(match_type IN ('exact', 'contains', 'starts_with', 'regex')),
  category_id TEXT NOT NULL REFERENCES categories(id),
  priority INTEGER DEFAULT 0,     -- higher = checked first
  is_user_created INTEGER DEFAULT 1, -- 0 = learned from user behavior
  created_at TEXT DEFAULT (datetime('now'))
);

-- Goal-to-account linkage
CREATE TABLE goal_accounts (
  goal_id TEXT NOT NULL REFERENCES goals(id),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  PRIMARY KEY (goal_id, account_id)
);

-- User profile and settings
-- NOTE: API keys and access tokens (Claude API key, Plaid access tokens) are stored
-- in the platform keychain (iOS Keychain / Android Keystore / Tauri secure storage),
-- not in SQLite.
-- Single-row design (id='default'). Phase 3 household/partner mode will require
-- migrating to multi-row with a current_user pointer.
CREATE TABLE user_profile (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT,
  province TEXT DEFAULT 'ON',     -- For provincial tax calculations
  birth_year INTEGER,
  retirement_age INTEGER DEFAULT 65,
  annual_income INTEGER,          -- cents
  marginal_tax_rate INTEGER,      -- basis points
  theme TEXT DEFAULT 'system',
  default_currency TEXT DEFAULT 'CAD',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance (filter on non-deleted rows)
CREATE INDEX idx_transactions_date ON transactions(date) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_account ON transactions(account_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_category ON transactions(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_active ON accounts(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_splits_transaction ON transaction_splits(transaction_id);
CREATE INDEX idx_budget_month ON budget_allocations(month);
CREATE INDEX idx_holdings_account ON holdings(account_id);
CREATE INDEX idx_registered_txns_account ON registered_transactions(registered_account_id);
CREATE INDEX idx_registered_txns_year ON registered_transactions(tax_year);
```

### 3.4.1 Phase 2 Schema Additions

```sql
-- ESPP and RSU tracking (relevant for Cisco employees, etc.)
CREATE TABLE equity_compensation (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('espp', 'rsu', 'stock_option')),
  company TEXT NOT NULL,
  grant_date TEXT,
  vest_date TEXT,
  quantity REAL,                   -- share count
  grant_price INTEGER,            -- cents; for ESPP: discounted purchase price
  vest_price INTEGER,             -- cents; FMV at vest (for RSU tax calculation)
  current_price INTEGER,          -- cents
  currency TEXT DEFAULT 'USD',
  is_vested INTEGER DEFAULT 0,
  is_sold INTEGER DEFAULT 0,
  account_id TEXT REFERENCES accounts(id),
  notes TEXT
);
```

### 3.5 Database Migrations

- Drizzle generates SQL migration files in `src/db/migrations/`
- Each migration is a numbered, forward-only SQL file
- A `schema_version` table tracks applied migrations
- Migrations run automatically on app startup before any queries
- Failed migrations: rollback the transaction, show error to user, refuse to open DB in inconsistent state
- Testing: migration tests run against a seeded DB snapshot in CI

---

## 4. Feature Specification

### 4.1 Phase 1 — Core (Free, Open Source)

#### 4.1.1 Dashboard

The main screen. At a glance, the user sees their complete financial picture.

**Components:**
- **Net Worth Card**: Total assets minus total liabilities, with trend sparkline (30d/90d/1y/all)
- **Cash Flow Summary**: Income vs. expenses this month, with comparison to last month and budget
- **Account Cards**: Grouped by type (Banking, Credit, Investments, Registered, Property). Each shows name, institution, balance, and last-updated timestamp
- **Upcoming Bills**: Next 7 days of recurring transactions
- **Budget Health Bar**: Visual indicator of overall budget adherence (green/yellow/red)
- **Quick Actions**: Add transaction, transfer between accounts, log contribution

**Design notes:**
- Dashboard should load in <200ms from local SQLite
- Pull-to-refresh on mobile triggers bank sync (if premium) or just recalculates derived values
- Tap any card to drill into detail view

#### 4.1.2 Accounts

**Account types supported:**
- Banking: Chequing, Savings
- Credit: Credit Cards
- Loans: Personal loans, lines of credit, student loans, car loans
- Mortgages: With full amortization tracking
- Investments: Non-registered brokerage accounts
- Registered: TFSA, RRSP, FHSA, RESP, LIRA, RRIF, RDSP
- Property: Real estate (manual valuation)
- Vehicles: Depreciating asset tracking
- Other: Catch-all for assets/liabilities

**Features:**
- Manual account creation with balance
- Reconciliation workflow (match statement balance, creates adjustment transaction if needed)
- Account grouping by institution
- Running balance display on transaction list
- Multi-currency support (see Section 4.1.10)

**Balance recomputation:** `accounts.balance` is a denormalized cache. It is recomputed from `SUM(transactions.amount)` on every transaction insert, update, or delete for that account. Bulk operations (CSV import) recompute once after the batch completes. The reconciliation workflow compares the stored balance against a user-provided statement balance; if they differ, an adjustment transaction is created to bring them into alignment.

#### 4.1.3 Transactions

**Manual entry:**
- Date, amount, payee, category, subcategory, memo
- Split transactions (one payment across multiple categories)
- Transfer between accounts (creates linked transactions)
- Recurring transaction templates

**CSV/OFX/QFX Import:**
- Column mapping UI (date, amount, payee, etc.)
- Save import profiles per institution (RBC CSV looks different from TD CSV)
- Duplicate detection (by date + amount + payee within ±2 days)
- Bulk categorization after import
- Supported formats: CSV, OFX, QFX, QIF

**Category management:**
- Default categories seeded (Housing, Food, Transport, etc.)
- User-created categories with icons and colors
- Hierarchical (category → subcategory)
- Auto-categorization rules (payee pattern → category)
- Category merge/rename without losing history

#### 4.1.4 Budgeting

**Method:** Zero-based / envelope-style (inspired by YNAB, but simpler)

**Core workflow:**
1. Income arrives → allocate to categories
2. Spending happens → tracked against allocations
3. Overspend in one category → reallocate from another
4. Month rolls over → configurable (roll over surplus, or reset)

**Budget views:**
- Monthly overview: All categories with allocated/spent/remaining
- Category detail: Transaction list for that category this month
- Trends: Category spending over time (bar chart, 6-12 months)
- Income vs. Expenses: Monthly comparison chart

**Budget features:**
- Monthly allocation templates (copy from previous month)
- Goals-based budgeting (save $X/month toward goal)
- "Available to budget" calculation (see model below)
- Overspend warnings (push notification on mobile)

**Budget model:**

"Available to budget" = sum of all income transactions categorized this month, minus sum of all allocations. It updates in real-time as income transactions are categorized.

Credit card handling: charging on a credit card immediately reduces the budget category (the budget tracks spending intent, not cash flow). Credit card payments are transfers between accounts (chequing to credit card), not budget events. This means the credit card balance reflects owed money, and the budget reflects spending decisions. A dedicated "Credit Card Payment" category is not needed; payments are transfers.

Transfer handling: all transfers between accounts (`is_transfer=1`) are excluded from budget calculations by default. This covers credit card payments, moving money between chequing/savings, and funding registered accounts. If a user wants a transfer to count as a budget event (e.g., monthly savings contribution), they create a regular categorized transaction instead of a transfer.

Month rollover: configurable per category. Options are (a) carry surplus forward (envelope-style), (b) reset to zero (fresh start), or (c) carry deficit forward (forces catch-up). Default is carry surplus forward.

#### 4.1.5 Canadian Registered Account Tracker

This is a **core differentiator**. No competitor aggregates contribution room across institutions with carry-forward and penalty calculations in a budgeting context. Wealthsimple shows room for Wealthsimple-held accounts only; CRA My Account shows official room but is not integrated with budgeting or planning tools.

**Disclaimer (must be visible in the UI):** Maple's contribution room calculations are estimates based on user-provided inputs. CRA is the authoritative source for TFSA/RRSP/FHSA room. Users should verify with their Notice of Assessment. Maple is not a tax advisor.

**TFSA Tracker:**
- Input: Year first eligible (turned 18 or became Canadian resident)
- Automatic calculation of cumulative contribution room using historical limits (2009: $5K, 2013: $5.5K, 2015: $10K, 2016-2018: $5.5K, 2019-2022: $6K, 2023: $6.5K, 2024-2026: $7K)
- Track contributions and withdrawals per calendar year
- Withdrawal room restoration (added back Jan 1 of following year)
- Over-contribution warning (1% monthly penalty calculation)
- Support for multiple TFSA accounts across institutions

**RRSP Tracker:**
- Input: Deduction limit from Notice of Assessment (or calculate from income)
- 18% of earned income calculation with annual cap ($33,810 for 2026)
- Pension adjustment deduction
- Unused room carry-forward
- HBP (Home Buyers' Plan) tracking, $60K withdrawal limit (increased from $35K in Budget 2024), 15-year repayment schedule
- LLP (Lifelong Learning Plan) tracking
- Contribution deadline awareness (60 days into next year)
- Spousal RRSP tracking (three-year attribution rule: withdrawals within 3 years of a spousal contribution are attributed back to the contributor for tax purposes)

**FHSA Tracker:**
- $8,000 annual limit, $40,000 lifetime limit
- Unused room carry-forward (maximum $8,000 carry-forward accumulation, so max $16K contribution in a single year: $8K annual + $8K carried forward)
- First-time buyer eligibility check
- Interaction with HBP (can use both, but FHSA first is usually optimal)
- 15-year account lifetime tracking

**RESP Tracker:**
- Per-beneficiary tracking
- $50,000 lifetime contribution limit per beneficiary
- CESG calculation ($500/year on $2,500 contribution, catch-up provisions)
- CLB (Canada Learning Bond) eligibility
- Family plan vs. individual plan awareness

**Unified registered account dashboard:**
- Total registered account value
- Remaining contribution room across all account types
- Optimal contribution order recommendation (Employer match → FHSA → TFSA → RRSP → RESP → Non-reg)
- Year-end contribution deadline countdown

#### 4.1.6 Investment Portfolio Tracker

**Holdings management:**
- Manual entry: Symbol, quantity, cost basis
- Asset class tagging (Canadian equity, US equity, international, fixed income, real estate, cash)
- Geographic allocation tagging
- Current price lookup (free tier: manual update; premium: auto via API)

**Portfolio views:**
- Holdings list with gain/loss (unrealized P&L)
- Asset allocation pie chart (target vs. actual)
- Geographic diversification chart
- Sector breakdown (if available from ticker data)
- Performance over time (total return chart)

#### 4.1.7 Financial Calculators

**Mortgage Calculator:**
- Canadian mortgage math (semi-annual compounding, not monthly like US)
- Payment frequency options: monthly, semi-monthly, biweekly, accelerated biweekly, weekly
- CMHC insurance premium calculation (2.8% - 4.0% based on LTV)
- Stress test calculator: qualifying rate = max(contract_rate + 2%, 5.25%)
- GDS ratio (≤39%) and TDS ratio (≤44%) calculation
- Provincial land transfer tax (Ontario: 0.5-2.5% tiered; first-time buyer rebates)
- Ottawa-specific: No municipal LTT (Ontario LTT only)
- Down payment tiers: 5% up to $500K, 10% for $500K-$1.5M portion, 20% for $1.5M+
- Amortization schedule generation (25 or 30 year for first-time buyers on new builds)
- Prepayment modeling (lump sum, increased payments)

**Retirement Calculator:**
- CPP benefit estimation (based on contribution history or simplified from income)
- OAS benefit estimation (based on years of Canadian residency)
- GIS eligibility check
- RRSP/RRIF drawdown modeling
- TFSA as supplementary retirement income
- Tax-efficient withdrawal sequencing (TFSA → non-reg capital gains → RRSP/RRIF)
- Inflation-adjusted projections
- "Number" calculator — how much do you need to retire?

**Tax Calculator:**
- 2026 federal tax brackets
- Provincial tax brackets (Ontario in Phase 1a; additional provinces in Phase 1b+)
- Marginal vs. effective tax rate display
- RRSP contribution tax savings calculator
- Capital gains inclusion rate (50%; two-tier proposal cancelled March 2025)
- Eligible vs. non-eligible dividend tax credit

**Compound Interest Calculator:**
- Lump sum and/or regular contributions
- Multiple compounding frequencies
- Compare scenarios side by side
- "What-if" slider for rate/contribution/timeframe

**Home Affordability Calculator:**
- Input: Income, debts, down payment savings, desired monthly payment
- Output: Maximum affordable home price (accounting for stress test)
- Savings plan: How much to save per month to reach down payment goal by target date
- FHSA + HBP combination strategy

#### 4.1.8 Reporting & Insights

**Built-in reports:**
- Net worth over time (line chart)
- Income vs. expenses (monthly bar chart)
- Spending by category (monthly and annual)
- Cash flow forecast (next 30/60/90 days based on recurring transactions)
- Year-over-year comparison
- Registered account contribution summary (per tax year)
- Investment performance summary

**Export:**
- CSV export for any report/transaction list
- PDF report generation (annual summary)

#### 4.1.9 Data Backup & Restore

Local-first means the user's device is the only copy of their financial data. Backup is a Phase 1a requirement.

- **Manual export:** Encrypted SQLite backup to device filesystem or share sheet. Format is an encrypted `.maple` file (SQLCipher-encrypted SQLite copy).
- **Manual import:** Restore from a `.maple` backup file, replacing the current database after confirmation.
- **Backup reminder:** Periodic nudge in settings (configurable frequency, default monthly). Non-dismissable until a backup is created or the user explicitly opts out.

#### 4.1.10 Multi-Currency (Deferred Design)

Phase 1 supports CAD as the primary currency. USD holdings (e.g., Cisco stock in a non-registered account) can be tracked with `currency: 'USD'` on the account and holdings, but conversion is manual: the user enters a CAD-equivalent balance or the app uses a single user-configured USD/CAD rate.

Full multi-currency support (automatic exchange rates, per-transaction conversion, multi-currency net worth aggregation) is deferred to Phase 2 or later. When designed, it will need: an `exchange_rates` table with historical daily rates, a policy for which rate applies (transaction date vs. current), and aggregation logic that converts all amounts to CAD for dashboard display.

USD contributions to a TFSA/RRSP must be converted to CAD for contribution room tracking. In Phase 1, the user enters the CAD equivalent manually.

### 4.2 Phase 2 -- Premium Features

#### 4.2.1 Bank Sync (Plaid + Flinks)

**Architecture challenge: Local-first + Plaid**

Plaid requires server-side token exchange. Solution: lightweight relay server.

```
User Device ←→ Maple Relay Server ←→ Plaid/Flinks API
                    │
                    └── Stateless: exchanges tokens only
                        No financial data stored on server
                        Transactions flow directly to local DB
```

**Relay server responsibilities:**
- Exchange public tokens for access tokens (required by Plaid)
- Proxy transaction fetch requests
- Handle Plaid Link initialization
- Does NOT store any financial data, only passes through to client
- Open-source (users can self-host if they want)

**Token storage and security:**
- Plaid access tokens are stored on-device in the platform keychain (iOS Keychain, Android Keystore, Tauri secure storage), not in SQLite
- Each sync request sends the access token through the relay to Plaid; the relay sees tokens transiently but does not persist them
- The relay handles bearer tokens for bank accounts and must be hardened: rate limiting, authenticated requests, TLS 1.3
- If a user loses their device, they must re-link accounts via the Plaid Link flow
- Self-hosted relay option mitigates trust concerns for power users who do not want tokens passing through a third-party server
- Relay deployment: Docker image published to GHCR, deployable to any cloud provider. Minimal config: Plaid client ID/secret, TLS cert, and a shared secret for client authentication. No database required.
- Compromise scenario: if the relay is breached, the attacker sees access tokens in transit but cannot replay them without the client's authentication secret. Plaid access tokens can be rotated via the Plaid API. Users should be notified and prompted to re-link.

**Plaid products used:**
- `transactions` — Transaction history and real-time updates
- `balance` — Real-time balance checks
- `investments` — Holdings and transactions for investment accounts
- `liabilities` — Credit card and loan details

**Flinks integration:**
- Canadian-specific, OAuth-based (no credential sharing)
- Connected to National Bank, EQ Bank, FirstOntario, Central 1, Everlink
- Preferred for Canadian banks when available
- Falls back to Plaid for institutions not on Flinks

**Sync behavior:**
- On-demand sync (pull to refresh)
- Background sync every 6 hours (configurable)
- New transactions auto-categorized using learned rules
- Conflict resolution: server transaction wins for Plaid-synced accounts

**Pricing model:** Premium subscription covers Plaid/Flinks per-connection costs.

#### 4.2.2 AI Financial Advisor (Claude Integration)

**How it works:**
- User provides their Claude API key (from Anthropic account) OR pays for Maple Premium which includes a pooled API key
- Claude receives a structured summary of the user's financial data (never raw bank credentials)
- All AI processing happens client-side via API call — no financial data touches Maple servers

**AI capabilities:**
- **Budget Analysis**: "Where am I overspending? What categories have the most room for improvement?"
- **Savings Optimization**: "What's the optimal order for my contributions this year given my income and existing room?"
- **Registered Account Strategy**: "Should I prioritize FHSA or RRSP given my income bracket and home buying timeline?"
- **Investment Review**: "Is my asset allocation appropriate for my age and risk tolerance?"
- **Home Purchase Readiness**: "Based on my savings rate and current financials, when can I realistically afford a home in Ottawa?"
- **Tax Optimization**: "What moves should I make before year-end to minimize my tax bill?"
- **Scenario Modeling**: "What happens to my retirement timeline if I increase my savings rate by 5%?"
- **Expense Anomaly Detection**: "Flag any unusual spending patterns this month"

**Context sent to Claude** (converted from internal integer storage to human-readable decimals/dollars):
```json
{
  "profile": {
    "province": "ON",
    "birth_year": 1995,
    "annual_income": 120000,
    "marginal_rate": 0.4341
  },
  "net_worth": {
    "total_assets": 250000,
    "total_liabilities": 15000,
    "net": 235000
  },
  "registered_accounts": {
    "tfsa": { "balance": 45000, "room_remaining": 12000 },
    "rrsp": { "balance": 30000, "room_remaining": 25000 },
    "fhsa": { "balance": 8000, "room_remaining": 24000 }
  },
  "budget_summary": {
    "monthly_income": 7500,
    "monthly_expenses": 5200,
    "savings_rate": 0.307,
    "top_categories": [...]
  },
  "goals": [...],
  "question": "user's question here"
}
```

**Usage metering:** Premium users with the pooled API key are capped at 50 queries per month (estimated cost ~$5/user at moderate context sizes). Users who provide their own API key have no cap. Usage is tracked client-side and displayed in settings. Heavy users are prompted to bring their own key.

**Privacy guarantee:** User sees exactly what data is sent to Claude before each request.

#### 4.2.3 Equity Compensation Tracking

- ESPP tracking (purchase price, FMV at purchase, holding period for tax treatment)
- RSU tracking (grant date, vest schedule, FMV at vest for employment income reporting)
- Stock option tracking (grant price, expiry, exercise tracking)
- USD/CAD conversion tracking for cross-border compensation

#### 4.2.4 Advanced Reporting

- Custom date range reports
- Multi-year tax planning projections
- Portfolio rebalancing recommendations
- Debt payoff strategies (avalanche vs. snowball with projections)
- Net worth forecasting with Monte Carlo simulation

### 4.3 Phase 3 — Future Features

- **Cloud sync** (optional, E2E encrypted): Sync between devices without losing privacy
- **Household/partner mode**: Shared budgets, individual and joint accounts
- **Bill negotiation reminders**: Track when contracts are up for renewal
- **Canadian tax return integration**: Auto-populate T1 fields from transaction data
- **Receipt scanning**: OCR via device camera
- **Widget support**: iOS/Android home screen widgets for net worth, budget remaining
- **MCP server**: Allow Claude Code / Claude Desktop to query financial data directly via MCP protocol
- **Apple Watch complication**: Quick glance at daily budget remaining
- **International support**: US tax accounts (401k, IRA, HSA), currency conversion

---

## 5. Monetization Strategy

### 5.1 Open Core Model

**Free (Open Source, AGPL):**
- All Phase 1 features
- Manual transaction entry
- CSV/OFX/QFX import
- Full budgeting system
- All calculators
- Registered account tracking
- Investment portfolio tracking (manual)
- Basic reporting

**Premium ($9.99 CAD/month or $79.99 CAD/year, ~33% discount):**
- Bank sync via Plaid/Flinks (covers per-connection costs)
- AI Financial Advisor (Claude-powered, covers API costs)
- Advanced reporting and projections
- Auto price updates for investment holdings (via Yahoo Finance API or Twelve Data; research cost and TSX/TSX-V coverage before committing)
- Priority support
- Early access to new features

### 5.2 Revenue Projections

Break-even target: $300/month (Claude Code subscription offset)

- 30 premium subscribers at $9.99/month = $299.70/month ✅
- Or 5 annual subscribers at $79.99/year = $33/month (need ~110 annual for target)
- Plaid cost per connection: ~$0.30-3.00/month depending on products
- Claude API cost per user: ~$2-5/month assuming moderate usage (sonnet-4-6)
- Net margin per premium user: ~$3-5/month after costs

### 5.3 Distribution

- **iOS**: App Store via EAS Submit (primary adoption platform)
- **Android**: Google Play Store via EAS Submit
- **Desktop**: Direct download (.dmg, .msi, .AppImage) via Tauri + potential Homebrew cask
- **Source**: GitHub (AGPL), anyone can build from source

---

## 6. Design Philosophy

### 6.1 Visual Identity

- **Name**: Maple — distinctly Canadian, financial (maple leaf on currency)
- **Colors**: Deep forest green (#1B4332) primary, gold accent (#D4A843), warm off-white backgrounds
- **Typography**: Inter (clean, highly legible, excellent tabular number support)
- **Iconography**: Lucide icons (open source, consistent style)
- **Tone**: Professional but approachable. No gamification, no condescending "you got this!" messages. Treat users as intelligent adults managing real money.

### 6.2 UX Principles

1. **Data density over simplicity**: Financial power users want information, not big empty cards. Show numbers, not just charts.
2. **Keyboard-first on desktop**: Power users navigate with keyboard shortcuts (n = new transaction, / = search, b = budget)
3. **Speed is a feature**: Local-first means everything loads instantly. Target <100ms for any screen transition.
4. **No dark patterns**: No upsell modals, no artificial limitations on free tier that make the app annoying. Free tier is genuinely useful.
5. **Canadian defaults**: CAD currency, Canadian tax brackets, Canadian institutions. No configuration needed for Canadian users.
6. **Accessible by default**: All screens support VoiceOver/TalkBack with meaningful labels. Respect dynamic type / font scaling. Meet WCAG 2.1 AA contrast ratios. Financial tables and charts include text alternatives.

---

## 7. Canadian Financial Constants (2026)

These should be defined in `src/utils/constants.ts` and updated annually.

```typescript
export const CANADIAN_FINANCE_2026 = {
  // TFSA
  tfsa: {
    annual_limit: 7000,
    cumulative_limit_since_2009: 109000,
    historical_limits: {
      2009: 5000, 2010: 5000, 2011: 5000, 2012: 5000,
      2013: 5500, 2014: 5500, 2015: 10000, 2016: 5500,
      2017: 5500, 2018: 5500, 2019: 6000, 2020: 6000,
      2021: 6000, 2022: 6000, 2023: 6500, 2024: 7000,
      2025: 7000, 2026: 7000,
    },
    overcontribution_penalty_rate: 100, // 1% per month (basis points)
  },

  // RRSP
  rrsp: {
    annual_limit: 33810,
    income_percentage: 1800, // 18% (basis points)
    overcontribution_grace: 2000,
    overcontribution_penalty_rate: 100, // 1% per month (basis points)
    hbp_withdrawal_limit: 60000, // Increased from $35K in Budget 2024
    hbp_repayment_years: 15,
    llp_annual_limit: 10000,
    llp_lifetime_limit: 20000, // Per participation period
    llp_repayment_years: 10,
    max_age: 71, // Must convert to RRIF by Dec 31 of year turning 71
  },

  // FHSA
  fhsa: {
    annual_limit: 8000,
    lifetime_limit: 40000,
    max_carryforward: 8000, // Can carry forward 1 year max
    max_single_year: 16000,
    account_lifetime_years: 15,
  },

  // RESP
  resp: {
    lifetime_limit: 50000,
    cesg_rate: 2000, // 20% (basis points)
    cesg_annual_max: 500,
    cesg_contribution_for_max: 2500,
    cesg_lifetime_max: 7200,
    clb_max: 2000,
  },

  // Federal tax brackets (2026)
  federal_tax: {
    brackets: [
      { min: 0, max: 57375, rate: 1500 },
      { min: 57375, max: 114750, rate: 2050 },
      { min: 114750, max: 158468, rate: 2600 },
      { min: 158468, max: 220000, rate: 2900 },
      { min: 220000, max: Infinity, rate: 3300 },
    ],
    basic_personal_amount: 16452,
  },

  // Ontario provincial tax brackets (2026)
  ontario_tax: {
    brackets: [
      { min: 0, max: 53891, rate: 505 },
      { min: 53891, max: 107785, rate: 915 },
      { min: 107785, max: 150000, rate: 1116 },
      { min: 150000, max: 220000, rate: 1216 },
      { min: 220000, max: Infinity, rate: 1316 },
    ],
    surtax_threshold_1: 5818,
    surtax_rate_1: 2000, // 20% (basis points)
    surtax_threshold_2: 7446,
    surtax_rate_2: 3600, // 36% (basis points)
    basic_personal_amount: 12989,
  },

  // CMHC mortgage insurance
  cmhc: {
    // Premium rates for 25-year amortization. 30-year (first-time buyers, new builds)
    // has higher rates that should be added when that feature is implemented.
    // LTV <= 80% requires no insurance.
    // LTV as integer percentage (65 = 65%), rate in basis points (280 = 2.80%)
    insurance_premium_rates_25yr: [
      { ltv_min: 65, ltv_max: 75, rate: 60 },
      { ltv_min: 75, ltv_max: 80, rate: 170 },
      { ltv_min: 80, ltv_max: 85, rate: 280 },
      { ltv_min: 85, ltv_max: 90, rate: 310 },
      { ltv_min: 90, ltv_max: 95, rate: 400 },
    ],
    max_insurable_price: 1500000, // Increased from $1M in late 2024
    stress_test_floor: 525,  // 5.25% (basis points)
    stress_test_buffer: 200, // 2% (basis points)
    gds_max: 3900,           // 39% (basis points); CMHC may use 35% for some programs
    tds_max: 4400,           // 44% (basis points); CMHC may use 42% for some programs
    // Note: Sagen and Canada Guaranty may have different limits. Default to 39/44.
  },

  // Ontario land transfer tax
  ontario_ltt: {
    brackets: [
      { min: 0, max: 55000, rate: 50 },
      { min: 55000, max: 250000, rate: 100 },
      { min: 250000, max: 400000, rate: 150 },
      { min: 400000, max: 2000000, rate: 200 },
      { min: 2000000, max: Infinity, rate: 250 },
    ],
    first_time_buyer_rebate_max: 4000,
  },

  // CPP (2026)
  cpp: {
    max_pensionable_earnings: 74600,
    basic_exemption: 3500,
    employee_rate: 595, // 5.95% (basis points)
    max_employee_contribution: 4230,
    // CPP2 (second ceiling)
    cpp2_max_earnings: 85000,
    cpp2_rate: 400, // 4% (basis points)
  },

  // Capital gains (two-tier proposal cancelled March 2025; flat 50%)
  capital_gains: {
    income_inclusion_rate_bps: 5000, // 50% of gains included in taxable income
  },
};
```

---

## 8. Development Roadmap

### Phase Mapping

Section 4 describes all features without phase annotations. The definitive phasing is this table:

| Feature (Section 4 ref) | Phase |
|--------------------------|-------|
| Dashboard (4.1.1) | 1a (net worth + accounts only; budget health bar and upcoming bills in 1b) |
| Accounts CRUD (4.1.2) | 1a |
| Balance recomputation (4.1.2) | 1a |
| Manual transactions + transfers (4.1.3) | 1a |
| CSV/OFX/QFX import (4.1.3) | 1b |
| Category system (4.1.3) | 1a (default seed categories only); 1b (custom categories, auto-rules) |
| Budgeting (4.1.4) | 1b |
| TFSA tracker (4.1.5) | 1a |
| RRSP tracker (4.1.5) | 1a |
| FHSA tracker (4.1.5) | 1b |
| RESP tracker (4.1.5) | 1b |
| Investment portfolio (4.1.6) | 1b |
| All calculators (4.1.7) | 1b |
| Reporting (4.1.8) | 1b |
| Backup/restore (4.1.9) | 1a |
| Multi-currency (4.1.10) | Phase 2+ |
| Bank sync (4.2.1) | 2 |
| AI advisor (4.2.2) | 2 |
| Equity compensation (4.2.3) | 2 |
| Advanced reporting (4.2.4) | 2 |
| All Phase 3 features (4.3) | 3 |

### Phase 1a: MVP (8-week target, iOS only)
- Tauri desktop POC spike (1-2 days, pre-development, go/no-go gate for Phase 1b desktop. Does not add desktop to Phase 1a scope.)
- Project scaffolding (Expo + TypeScript + SQLite + Drizzle)
- Database schema and migrations
- Account management (CRUD, manual balance)
- Transaction entry, transfers (manual only)
- TFSA and RRSP contribution room tracking
- Dashboard (net worth, account balances, cash flow summary)
- Data backup and restore
- Dark/light theme

### Phase 1b: Core Expansion
- CSV import with column mapping, duplicate detection, saved profiles
- FHSA contribution room tracking
- Mortgage calculator (CMHC, stress test, Ontario LTT)
- Zero-based budgeting system (with credit card handling model)
- Category system with auto-categorization rules
- RESP tracking (LIRA/RRIF/RDSP deferred to later)
- OFX/QFX/QIF import support
- Recurring transactions
- Investment portfolio tracker (manual entry)
- Additional calculators (retirement, tax Ontario-only, compound interest, home affordability)
- Basic charts and reporting
- Tauri wrapper for desktop
- Android via Expo

### Phase 2: Premium Layer
- Plaid integration with relay server
- Flinks integration for Canadian banks
- Claude AI advisor integration
- Investment portfolio tracking with auto price updates
- ESPP/RSU/stock option tracking
- Retirement calculator (CPP + OAS + RRSP drawdown)
- Advanced reporting and projections
- All-province tax brackets
- Subscription management and payment (Stripe or RevenueCat)
- iOS App Store submission
- Android Play Store submission

### Phase 3: Growth
- Cloud sync (optional, E2E encrypted)
- Household/partner mode
- Tax planning projections
- MCP server for Claude Code/Desktop integration
- Widget support (iOS, Android, macOS)
- Receipt OCR
- International support framework
- Community plugin system

---

## 9. Open Source Strategy

### 9.1 License

**AGPL v3** for the core application.

Rationale: AGPL requires anyone who modifies and deploys the software (including as a network service) to share their changes. This prevents a VC-funded competitor from forking Maple, adding premium features, and hosting it as a competing SaaS without contributing back.

Users can still:
- Self-host entirely (including premium features if they bring their own API keys)
- Fork and modify for personal use
- Contribute improvements back to the project

### 9.2 Contribution Model

- Premium features live in the same repository but require API keys/subscription to activate
- No feature flags that artificially break the free tier
- Community contributions welcome: new importers, international tax constants, calculators, UI improvements
- Localization via Weblate (like Actual Budget)

### 9.3 Premium Revenue Protection

Premium features that cost money to provide are naturally gated:
- **Plaid/Flinks**: Requires server-side infrastructure and per-connection fees
- **Claude API**: Requires API key with token costs
- **Auto price updates**: Requires market data API subscription

A user CAN bring their own Plaid/Claude API keys and self-host the relay server. This is by design — power users who do this are unlikely to be paying customers anyway, and they become evangelists.

---

## 10. Security Considerations

- **SQLCipher encryption** for local database at rest. Encryption key is a random 256-bit key auto-generated on first launch and stored in the platform keychain (iOS Keychain / Android Keystore / Tauri secure storage). The user never sees or enters this key. If the keychain entry is lost (factory reset, new device without keychain restore), the database cannot be decrypted; the user must restore from a `.maple` backup. Backup files are re-encrypted with a user-provided passphrase at export time (separate from the database key).
- **No plaintext API keys**: Encrypted storage using platform keychain (iOS Keychain, Android Keystore, Tauri secure storage)
- **No analytics/telemetry** in open source core
- **No financial data on any server**: Relay server is stateless, passes through only
- **HTTPS everywhere**: All API communication over TLS 1.3
- **Integer arithmetic**: All monetary values stored as integers in minor currency units (cents); all rates stored as integer basis points. No floating point for financial data.
- **Dependency auditing**: Regular `npm audit` in CI

### 10.1 Error Handling and Data Integrity

The user's device is the single source of truth. Data loss is unacceptable. Policies by operation:

**Database migrations:** Each migration runs inside a single SQLite transaction. On failure, the transaction rolls back and the app refuses to open the database. The user is shown the error and prompted to export a raw backup (pre-migration state) before retrying. Failed migration state is never committed.

**Database corruption:** On startup, run `PRAGMA integrity_check` (or a lightweight quick-check). If corruption is detected, prompt the user to restore from their most recent `.maple` backup. Do not silently continue with a corrupt database.

**CSV/OFX import:** Malformed rows are skipped and collected into an error report shown after import. Partial imports are allowed (successfully parsed rows are committed). The user reviews skipped rows and can correct and re-import them. The entire import is wrapped in a transaction so it can be undone as a unit.

**Backup failures:** If a backup cannot be created (disk full, permission error), show the error immediately. Never silently fail a backup operation. The app should surface remaining disk space before attempting large exports.

**Crash during write:** SQLite's WAL mode ensures write atomicity. Incomplete transactions from a crash are automatically rolled back on next open. The app should verify database integrity on startup after an unclean shutdown.

**General policy:** Fail loudly, never silently. Show actionable errors with context (what failed, what the user can do). Never delete or overwrite data without explicit confirmation.

---

## 11. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily active use (personal) | 5+ days/week | Self-reported |
| Monthly savings identified | ≥$300/month | App-calculated vs. pre-app spending |
| Premium subscribers | 30+ within 6 months of launch | Stripe dashboard |
| GitHub stars | 1000+ within 12 months | GitHub |
| App Store rating | 4.5+ | App Store Connect |
| Home purchase plan created | 1 (personal goal) | Feature usage |

---

## 12. Naming Alternatives

If "Maple" is taken or doesn't resonate:
- **Canopy** — shelter, growth, Canadian forest imagery
- **Tundra** — distinctly Canadian, "cold hard cash" wordplay
- **Frostline** — Canadian, clear/transparent, financial "bottom line"
- **Loonie** — Canadian dollar coin, playful
- **Cairn** — stacked stones marking a path, financial milestones

---

*This document is intended to be used directly with Claude Code for development. Each section maps to implementable features with enough detail to begin coding immediately.*