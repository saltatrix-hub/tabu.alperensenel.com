CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`name` text NOT NULL,
	`team` text NOT NULL,
	`seat` integer NOT NULL,
	`token` text NOT NULL,
	`joined_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_players_token` ON `players` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_players_room_name` ON `players` (`room_id`,`name`);--> statement-breakpoint
CREATE INDEX `idx_players_room_team` ON `players` (`room_id`,`team`,`seat`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`host_token` text NOT NULL,
	`status` text DEFAULT 'lobby' NOT NULL,
	`settings` text NOT NULL,
	`scores` text DEFAULT '{"A":0,"B":0}' NOT NULL,
	`game_state` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_rooms_code` ON `rooms` (`code`);