CREATE TABLE `task` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`isDone` integer DEFAULT 0 NOT NULL
);
