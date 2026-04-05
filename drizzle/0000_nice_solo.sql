CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`institution` text,
	`currency` text DEFAULT 'CAD',
	`balance` integer DEFAULT 0,
	`is_asset` integer DEFAULT true,
	`is_off_budget` integer DEFAULT false,
	`plaid_account_id` text,
	`flinks_account_id` text,
	`notes` text,
	`deleted_at` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `idx_accounts_active` ON `accounts` (`type`) WHERE "accounts"."deleted_at" IS NULL;--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`parent_id` text,
	`icon` text,
	`color` text,
	`is_income` integer DEFAULT false,
	`is_hidden` integer DEFAULT false,
	`sort_order` integer DEFAULT 0,
	FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `registered_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`type` text NOT NULL,
	`holder_name` text,
	`date_opened` text,
	`tfsa_eligible_since_year` integer,
	`rrsp_deduction_limit` integer,
	`rrsp_pension_adjustment` integer,
	`fhsa_lifetime_used` integer DEFAULT 0,
	`fhsa_is_first_time_buyer` integer DEFAULT true,
	`resp_beneficiary` text,
	`resp_lifetime_contributions` integer DEFAULT 0,
	`resp_cesg_received` integer DEFAULT 0,
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `registered_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`registered_account_id` text NOT NULL,
	`transaction_id` text,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`tax_year` integer NOT NULL,
	`date` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`registered_account_id`) REFERENCES `registered_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_registered_txns_account` ON `registered_transactions` (`registered_account_id`);--> statement-breakpoint
CREATE INDEX `idx_registered_txns_year` ON `registered_transactions` (`tax_year`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`date` text NOT NULL,
	`amount` integer NOT NULL,
	`payee` text,
	`category_id` text,
	`subcategory_id` text,
	`memo` text,
	`is_transfer` integer DEFAULT false,
	`transfer_account_id` text,
	`is_reconciled` integer DEFAULT false,
	`is_pending` integer DEFAULT false,
	`import_source` text,
	`plaid_transaction_id` text,
	`deleted_at` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subcategory_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transfer_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_transactions_date` ON `transactions` (`date`) WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX `idx_transactions_account` ON `transactions` (`account_id`) WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX `idx_transactions_category` ON `transactions` (`category_id`) WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`name` text,
	`province` text DEFAULT 'ON',
	`birth_year` integer,
	`retirement_age` integer DEFAULT 65,
	`annual_income` integer,
	`marginal_tax_rate` integer,
	`theme` text DEFAULT 'system',
	`default_currency` text DEFAULT 'CAD',
	`created_at` text DEFAULT (datetime('now'))
);
