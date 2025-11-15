CREATE TABLE `feature_journal_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt` text NOT NULL,
	`category` text NOT NULL,
	`difficulty` text DEFAULT 'medium' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feature_journal_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text,
	`content` text NOT NULL,
	`mood` integer,
	`word_count` integer DEFAULT 0 NOT NULL,
	`tags` text,
	`prompt_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `journal_entries_user_id_idx` ON `feature_journal_entries` (`user_id`);--> statement-breakpoint
CREATE INDEX `journal_entries_created_at_idx` ON `feature_journal_entries` (`created_at`);--> statement-breakpoint
CREATE INDEX `journal_entries_mood_idx` ON `feature_journal_entries` (`mood`);--> statement-breakpoint
CREATE INDEX `journal_entries_user_created_idx` ON `feature_journal_entries` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `feature_journal_streaks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_entry_date` integer,
	`total_entries` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feature_journal_streaks_user_id_unique` ON `feature_journal_streaks` (`user_id`);--> statement-breakpoint
CREATE TABLE `feature_journal_user_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`prompt_id` text NOT NULL,
	`shown_at` integer NOT NULL,
	`used` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `user_prompts_user_id_idx` ON `feature_journal_user_prompts` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_prompts_prompt_id_idx` ON `feature_journal_user_prompts` (`prompt_id`);--> statement-breakpoint
CREATE TABLE `feature_journal_luna_analysis_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`analysis_type` text NOT NULL,
	`timeframe` text NOT NULL,
	`data` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `luna_analysis_user_id_idx` ON `feature_journal_luna_analysis_cache` (`user_id`);--> statement-breakpoint
CREATE INDEX `luna_analysis_type_timeframe_idx` ON `feature_journal_luna_analysis_cache` (`analysis_type`,`timeframe`);--> statement-breakpoint
CREATE TABLE `feature_journal_luna_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`related_entry_id` text,
	`metadata` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `luna_conversations_user_id_idx` ON `feature_journal_luna_conversations` (`user_id`);--> statement-breakpoint
CREATE INDEX `luna_conversations_created_at_idx` ON `feature_journal_luna_conversations` (`created_at`);--> statement-breakpoint
CREATE TABLE `feature_journal_luna_insights` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`related_entry_ids` text,
	`metadata` text,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `luna_insights_user_id_idx` ON `feature_journal_luna_insights` (`user_id`);--> statement-breakpoint
CREATE INDEX `luna_insights_type_idx` ON `feature_journal_luna_insights` (`type`);--> statement-breakpoint
CREATE INDEX `luna_insights_created_at_idx` ON `feature_journal_luna_insights` (`created_at`);--> statement-breakpoint
CREATE TABLE `feature_journal_luna_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`prompt` text NOT NULL,
	`reasoning` text,
	`is_used` integer DEFAULT false NOT NULL,
	`used_in_entry_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `luna_prompts_user_id_idx` ON `feature_journal_luna_prompts` (`user_id`);--> statement-breakpoint
CREATE INDEX `luna_prompts_is_used_idx` ON `feature_journal_luna_prompts` (`is_used`);