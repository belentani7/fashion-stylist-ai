CREATE TABLE `clientPortalAccesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stylistUserId` int NOT NULL,
	`clientId` int NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientUserId` int,
	`status` enum('active','revoked') NOT NULL DEFAULT 'active',
	`consentedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientPortalAccesses_id` PRIMARY KEY(`id`),
	CONSTRAINT `clientPortalAccesses_clientId_unique` UNIQUE(`clientId`)
);
