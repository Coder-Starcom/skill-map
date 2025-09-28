/*
  Warnings:

  - You are about to drop the column `completedAt` on the `MicroCredential` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `MicroCredential` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `MicroCredential` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MicroCredential" DROP COLUMN "completedAt",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "quizAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quizLockedUntil" TIMESTAMP(3);
