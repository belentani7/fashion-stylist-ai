CREATE TABLE `privacyPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consentedAt` timestamp,
	`revokedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `privacyPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `privacyPreferences_userId_unique` UNIQUE(`userId`)
);
