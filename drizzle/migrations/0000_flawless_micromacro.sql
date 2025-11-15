CREATE TABLE `feature_gamification_achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text,
	`xp_reward` integer DEFAULT 0 NOT NULL,
	`tier` text DEFAULT 'bronze' NOT NULL,
	`criteria` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feature_gamification_achievements_key_unique` ON `feature_gamification_achievements` (`key`);--> statement-breakpoint
CREATE TABLE `feature_gamification_user_achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`unlocked_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_achievement_idx` ON `feature_gamification_user_achievements` (`user_id`,`achievement_id`);--> statement-breakpoint
CREATE INDEX `user_achievements_user_idx` ON `feature_gamification_user_achievements` (`user_id`);--> statement-breakpoint
CREATE TABLE `feature_gamification_user_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`total_xp` integer DEFAULT 0 NOT NULL,
	`current_level` integer DEFAULT 1 NOT NULL,
	`xp_to_next_level` integer DEFAULT 100 NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_activity_date` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feature_gamification_user_stats_user_id_unique` ON `feature_gamification_user_stats` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `gamification_user_idx` ON `feature_gamification_user_stats` (`user_id`);--> statement-breakpoint
CREATE INDEX `gamification_level_idx` ON `feature_gamification_user_stats` (`current_level`);--> statement-breakpoint
CREATE INDEX `gamification_streak_idx` ON `feature_gamification_user_stats` (`current_streak`);--> statement-breakpoint
CREATE TABLE `feature_gamification_xp_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` integer NOT NULL,
	`source` text NOT NULL,
	`source_id` text,
	`reason` text,
	`timestamp` integer
);
--> statement-breakpoint
CREATE INDEX `xp_history_user_idx` ON `feature_gamification_xp_history` (`user_id`);--> statement-breakpoint
CREATE INDEX `xp_history_timestamp_idx` ON `feature_gamification_xp_history` (`timestamp`);--> statement-breakpoint
CREATE INDEX `xp_history_source_idx` ON `feature_gamification_xp_history` (`source`);--> statement-breakpoint
CREATE TABLE `feature_task_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`user_id` text NOT NULL,
	`color` text DEFAULT '#3b82f6',
	`icon` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `feature_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`priority` text DEFAULT 'medium',
	`status` text DEFAULT 'active',
	`category_id` text,
	`xp_reward` integer DEFAULT 10,
	`due_date` integer,
	`created_at` integer,
	`completed_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `tasks_user_id_idx` ON `feature_tasks` (`user_id`);--> statement-breakpoint
CREATE INDEX `tasks_status_idx` ON `feature_tasks` (`status`);--> statement-breakpoint
CREATE INDEX `tasks_category_id_idx` ON `feature_tasks` (`category_id`);