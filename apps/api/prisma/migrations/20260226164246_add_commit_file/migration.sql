-- CreateTable
CREATE TABLE "CommitFile" (
    "id" SERIAL NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "commitId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommitFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommitFile_sha_path_key" ON "CommitFile"("sha", "path");

-- AddForeignKey
ALTER TABLE "CommitFile" ADD CONSTRAINT "CommitFile_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "Commit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
