-- CreateTable
CREATE TABLE "UserRoadmapProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "roadmapName" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "completedSteps" JSONB NOT NULL,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRoadmapProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRoadmapProgress_userId_idx" ON "UserRoadmapProgress"("userId");

-- CreateIndex
CREATE INDEX "UserRoadmapProgress_roadmapId_idx" ON "UserRoadmapProgress"("roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoadmapProgress_userId_roadmapId_key" ON "UserRoadmapProgress"("userId", "roadmapId");

-- AddForeignKey
ALTER TABLE "UserRoadmapProgress" ADD CONSTRAINT "UserRoadmapProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
