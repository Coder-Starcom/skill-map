-- CreateTable
CREATE TABLE "UserIndustryInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserIndustryInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserIndustryInsight_userId_idx" ON "UserIndustryInsight"("userId");

-- CreateIndex
CREATE INDEX "UserIndustryInsight_industry_idx" ON "UserIndustryInsight"("industry");

-- AddForeignKey
ALTER TABLE "UserIndustryInsight" ADD CONSTRAINT "UserIndustryInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
