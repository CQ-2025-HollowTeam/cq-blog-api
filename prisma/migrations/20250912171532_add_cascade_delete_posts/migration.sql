-- DropForeignKey
ALTER TABLE `PostAttachment` DROP FOREIGN KEY `PostAttachment_postId_fkey`;

-- DropForeignKey
ALTER TABLE `PostComment` DROP FOREIGN KEY `PostComment_postId_fkey`;

-- DropForeignKey
ALTER TABLE `PostReaction` DROP FOREIGN KEY `PostReaction_postId_fkey`;

-- DropIndex
DROP INDEX `PostAttachment_postId_fkey` ON `PostAttachment`;

-- DropIndex
DROP INDEX `PostComment_postId_fkey` ON `PostComment`;

-- DropIndex
DROP INDEX `PostReaction_postId_fkey` ON `PostReaction`;

-- AddForeignKey
ALTER TABLE `PostAttachment` ADD CONSTRAINT `PostAttachment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostComment` ADD CONSTRAINT `PostComment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostReaction` ADD CONSTRAINT `PostReaction_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
