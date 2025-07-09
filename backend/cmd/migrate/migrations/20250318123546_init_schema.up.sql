CREATE TABLE IF NOT EXISTS users (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `userName` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) DEFAULT 'user',
    `image` TEXT,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `lastLogin` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY (`email`),
    UNIQUE KEY (`userName`)
);

INSERT INTO users (firstName, lastName, email, userName, password, role) VALUES (
    'Milan',
    'Valasek',
    'mivalek@gmail.com',
    'mival',
    '$2a$10$OitVyCN4yWF4vh5GcJy.W.Aci4xtqLF9DCILDjAPe9yg2J7iGOhY6',
    'admin'
);

CREATE TABLE IF NOT EXISTS files (
    `id` VARCHAR(255) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `size` INT UNSIGNED NOT NULL,
    `createdAt` TIMESTAMP NOT NULL,
    `uploadedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ownerId` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ownerId`) REFERENCES users(`id`)
);

