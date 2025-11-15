CREATE TABLE `feature_agents_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`title` text,
	`last_message_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE INDEX `conversations_user_agent_idx` ON `feature_agents_conversations` (`user_id`,`agent_id`);--> statement-breakpoint
CREATE TABLE `feature_agents_insights` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`data` text,
	`is_read` integer DEFAULT false,
	`created_at` integer
);
--> statement-breakpoint
CREATE INDEX `insights_user_category_idx` ON `feature_agents_insights` (`user_id`,`category`);--> statement-breakpoint
CREATE TABLE `feature_agents_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`timestamp` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `feature_agents_conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `messages_conversation_idx` ON `feature_agents_messages` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `messages_timestamp_idx` ON `feature_agents_messages` (`timestamp`);--> statement-breakpoint
CREATE TABLE `feature_agents_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`priority` text DEFAULT 'medium',
	`status` text DEFAULT 'active',
	`expires_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE INDEX `suggestions_user_status_idx` ON `feature_agents_suggestions` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `feature_auth_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`password_hash` text NOT NULL,
	`salt` text NOT NULL,
	`last_password_change` integer,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `feature_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feature_auth_credentials_user_id_unique` ON `feature_auth_credentials` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `credentials_user_id_idx` ON `feature_auth_credentials` (`user_id`);--> statement-breakpoint
CREATE TABLE `feature_auth_login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`ip_address` text,
	`success` integer NOT NULL,
	`timestamp` integer
);
--> statement-breakpoint
CREATE INDEX `login_attempts_email_idx` ON `feature_auth_login_attempts` (`email`);--> statement-breakpoint
CREATE INDEX `login_attempts_timestamp_idx` ON `feature_auth_login_attempts` (`timestamp`);--> statement-breakpoint
CREATE TABLE `feature_auth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`user_agent` text,
	`ip_address` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `feature_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feature_auth_sessions_token_unique` ON `feature_auth_sessions` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_idx` ON `feature_auth_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `feature_auth_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_at_idx` ON `feature_auth_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `feature_auth_verification_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`type` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `feature_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feature_auth_verification_tokens_token_unique` ON `feature_auth_verification_tokens` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `verification_tokens_token_idx` ON `feature_auth_verification_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `verification_tokens_user_id_idx` ON `feature_auth_verification_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_tokens_type_idx` ON `feature_auth_verification_tokens` (`type`);--> statement-breakpoint
CREATE TABLE `feature_user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `feature_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_prefs_user_key_idx` ON `feature_user_preferences` (`user_id`,`key`);--> statement-breakpoint
CREATE TABLE `feature_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`avatar` text,
	`bio` text,
	`timezone` text DEFAULT 'UTC',
	`last_login_at` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feature_users_email_unique` ON `feature_users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `feature_users` (`email`);