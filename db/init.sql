CREATE DATABASE IF NOT EXISTS mgroomerdb;
USE mgroomerdb;


CREATE TABLE IF NOT EXISTS athletes (
    `id` INT UNSIGNED NOT NULL,
    `givenNames` VARCHAR(50) NOT NULL,
    `familyNames` VARCHAR(50) NOT NULL,
    `displayName` VARCHAR(100) NOT NULL,
    `country` VARCHAR(3) NOT NULL,
    `category` TINYINT NOT NULL,
    `discipline` TINYINT NOT NULL,
    `hasRecording` TINYINT(1),
    `hasPic` TINYINT(1),
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS files (
    `id` VARCHAR(50) NOT NULL,
    `size` INT UNSIGNED NOT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `author` VARCHAR(50),
    `athleteId` INT UNSIGNED NOT NULL,
    `flag` TINYINT(1),
    `rating` FLOAT,
    `nRatings` SMALLINT,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`athleteId`) REFERENCES athletes(`id`)
);
