-- CreateEnum
CREATE TYPE "MarketResearchStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "MarketResearch" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "MarketResearchStatus" NOT NULL DEFAULT 'PENDING',
    "searchResults" JSONB,
    "financialData" JSONB,
    "competitorData" JSONB,
    "aiAnalysis" TEXT,
    "executiveSummary" TEXT,
    "marketPosition" TEXT,
    "competitors" JSONB,
    "opportunities" JSONB,
    "threats" JSONB,
    "recommendations" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketResearch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MarketResearch" ADD CONSTRAINT "MarketResearch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
