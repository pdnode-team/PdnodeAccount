CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nickname` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`status` text NOT NULL,
	`role` text NOT NULL,
	`email_verified_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);