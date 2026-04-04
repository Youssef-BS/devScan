-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('BUG', 'VULNERABILITY', 'CODE_SMELL');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'CONFIRMED', 'FIXED', 'IGNORED');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('security', 'performance', 'clean_code', 'bug');

-- DropForeignKey
ALTER TABLE "CommitFile" DROP CONSTRAINT "CommitFile_commitId_fkey";

-- CreateTable
CREATE TABLE "Scan" (
    "id" SERIAL NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "score" INTEGER,
    "grade" TEXT,
    "repoId" INTEGER NOT NULL,
    "commitId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "type" "IssueType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "filePath" TEXT NOT NULL,
    "lineStart" INTEGER,
    "lineEnd" INTEGER,
    "effort" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "agent" "AgentType" NOT NULL,
    "confidence" DOUBLE PRECISION,
    "fixedCode" TEXT,
    "rawAI" JSONB,
    "isFalsePositive" BOOLEAN NOT NULL DEFAULT false,
    "scanId" INTEGER NOT NULL,
    "commitId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scan_repoId_idx" ON "Scan"("repoId");

-- CreateIndex
CREATE INDEX "Scan_status_idx" ON "Scan"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Scan_repoId_commitId_key" ON "Scan"("repoId", "commitId");

-- CreateIndex
CREATE INDEX "Issue_severity_idx" ON "Issue"("severity");

-- CreateIndex
CREATE INDEX "Issue_type_idx" ON "Issue"("type");

-- CreateIndex
CREATE INDEX "Issue_status_idx" ON "Issue"("status");

-- CreateIndex
CREATE INDEX "Issue_scanId_idx" ON "Issue"("scanId");

-- CreateIndex
CREATE INDEX "Issue_commitId_idx" ON "Issue"("commitId");

-- CreateIndex
CREATE INDEX "CommitFile_commitId_idx" ON "CommitFile"("commitId");

-- CreateIndex
CREATE INDEX "Repo_ownerId_idx" ON "Repo"("ownerId");

-- AddForeignKey
ALTER TABLE "CommitFile" ADD CONSTRAINT "CommitFile_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "Commit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "Commit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "Commit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
