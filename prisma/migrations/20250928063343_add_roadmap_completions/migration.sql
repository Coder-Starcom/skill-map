/*
  Warnings:

  - You are about to drop the `MicroCredential` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserIndustryInsight` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MicroCredential" DROP CONSTRAINT "MicroCredential_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserIndustryInsight" DROP CONSTRAINT "UserIndustryInsight_userId_fkey";

-- DropTable
DROP TABLE "MicroCredential";

-- DropTable
DROP TABLE "UserIndustryInsight";

-- CreateTable
CREATE TABLE "UserRoadmapCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "roadmapName" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "badgeUrl" TEXT,
    "badgeName" TEXT NOT NULL,

    CONSTRAINT "UserRoadmapCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRoadmapCompletion_userId_idx" ON "UserRoadmapCompletion"("userId");

-- CreateIndex
CREATE INDEX "UserRoadmapCompletion_roadmapId_idx" ON "UserRoadmapCompletion"("roadmapId");

-- AddForeignKey
ALTER TABLE "UserRoadmapCompletion" ADD CONSTRAINT "UserRoadmapCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
