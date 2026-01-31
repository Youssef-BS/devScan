/*
  Warnings:

  - You are about to drop the column `lastCommitDate` on the `Repo` table. All the data in the column will be lost.
  - You are about to drop the column `lastCommitMessage` on the `Repo` table. All the data in the column will be lost.
  - You are about to drop the column `lastCommitSha` on the `Repo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Commit" DROP CONSTRAINT "Commit_repoId_fkey";

-- DropIndex
DROP INDEX "Commit_repoId_idx";

-- AlterTable
ALTER TABLE "Repo" DROP COLUMN "lastCommitDate",
DROP COLUMN "lastCommitMessage",
DROP COLUMN "lastCommitSha";

-- CreateIndex
CREATE INDEX "Commit_repoId_date_idx" ON "Commit"("repoId", "date");

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
