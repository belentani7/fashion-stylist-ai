CREATE TABLE `clientStyleProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`dominantStyle` varchar(100),
	`secondaryStyles` text,
	`preferredColors` text,
	`avoidedColors` text,
	`silhouettes` text,
	`proportions` text,
	`materials` text,
	`patterns` text,
	`formality` varchar(80),
	`frequentOccasions` text,
	`favoriteItems` text,
	`neverWears` text,
	`brands` text,
	`budgetRange` varchar(120),
	`experimentLevel` varchar(80),
	`imageGoals` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientStyleProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `clientStyleProfiles_clientId_unique` UNIQUE(`clientId`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outfitItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`outfitId` int NOT NULL,
	`garmentId` int NOT NULL,
	`role` varchar(80),
	`position` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `outfitItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outfits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int,
	`contextId` int,
	`name` varchar(160) NOT NULL,
	`occasion` varchar(160),
	`formality` varchar(80),
	`explanation` text,
	`adjustment` text,
	`status` enum('draft','ready','archived') NOT NULL DEFAULT 'draft',
	`origin` enum('manual','assistant') NOT NULL DEFAULT 'manual',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outfits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stylingContexts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`occasion` varchar(160),
	`season` varchar(80),
	`climate` varchar(120),
	`formality` varchar(80),
	`objective` text,
	`constraints` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stylingContexts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stylingDecisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int,
	`contextId` int,
	`outfitId` int,
	`category` varchar(80) NOT NULL,
	`statement` text NOT NULL,
	`source` enum('natalia','assistant') NOT NULL DEFAULT 'natalia',
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stylingDecisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visualReferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int,
	`referenceType` enum('inspiration','aesthetic','silhouette','palette','campaign','look') NOT NULL,
	`title` varchar(160) NOT NULL,
	`imageKey` varchar(512),
	`imageUrl` varchar(1024),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `visualReferences_id` PRIMARY KEY(`id`)
);
