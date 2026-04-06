-- CreateTable
CREATE TABLE "ChatDiscussion" (
    "id" SERIAL NOT NULL,
    "userQuery" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "context" TEXT,
    "repoId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatDiscussion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatDiscussion_repoId_idx" ON "ChatDiscussion"("repoId");

-- CreateIndex
CREATE INDEX "ChatDiscussion_userId_idx" ON "ChatDiscussion"("userId");

-- CreateIndex
CREATE INDEX "ChatDiscussion_createdAt_idx" ON "ChatDiscussion"("createdAt");

-- AddForeignKey
ALTER TABLE "ChatDiscussion" ADD CONSTRAINT "ChatDiscussion_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatDiscussion" ADD CONSTRAINT "ChatDiscussion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
