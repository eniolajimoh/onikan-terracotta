-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'EDITOR', 'MODERATOR') NOT NULL DEFAULT 'EDITOR',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Artifact` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `catalogueNumber` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `height` DOUBLE NULL,
    `width` DOUBLE NULL,
    `length` DOUBLE NULL,
    `material` VARCHAR(191) NULL,
    `culture` VARCHAR(191) NULL,
    `geographicalOrigin` VARCHAR(191) NULL,
    `estimatedPeriod` VARCHAR(191) NULL,
    `provenance` TEXT NULL,
    `conservationStatus` VARCHAR(191) NULL,
    `interpretiveNotes` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Artifact_catalogueNumber_key`(`catalogueNumber`),
    INDEX `Artifact_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Artifact_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArtifactImage` (
    `id` VARCHAR(191) NOT NULL,
    `artifactId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `publicId` VARCHAR(191) NULL,
    `altText` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ArtifactImage_artifactId_sortOrder_idx`(`artifactId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reference` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `authors` VARCHAR(191) NULL,
    `publication` VARCHAR(191) NULL,
    `year` INTEGER NULL,
    `url` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArtifactReference` (
    `artifactId` VARCHAR(191) NOT NULL,
    `referenceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`artifactId`, `referenceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArtifactCategory` (
    `artifactId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`artifactId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `artifactId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Comment_artifactId_status_createdAt_idx`(`artifactId`, `status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Like` (
    `id` VARCHAR(191) NOT NULL,
    `artifactId` VARCHAR(191) NOT NULL,
    `visitorKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Like_artifactId_visitorKey_key`(`artifactId`, `visitorKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ArtifactImage` ADD CONSTRAINT `ArtifactImage_artifactId_fkey` FOREIGN KEY (`artifactId`) REFERENCES `Artifact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArtifactReference` ADD CONSTRAINT `ArtifactReference_artifactId_fkey` FOREIGN KEY (`artifactId`) REFERENCES `Artifact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArtifactReference` ADD CONSTRAINT `ArtifactReference_referenceId_fkey` FOREIGN KEY (`referenceId`) REFERENCES `Reference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArtifactCategory` ADD CONSTRAINT `ArtifactCategory_artifactId_fkey` FOREIGN KEY (`artifactId`) REFERENCES `Artifact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArtifactCategory` ADD CONSTRAINT `ArtifactCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_artifactId_fkey` FOREIGN KEY (`artifactId`) REFERENCES `Artifact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_artifactId_fkey` FOREIGN KEY (`artifactId`) REFERENCES `Artifact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
