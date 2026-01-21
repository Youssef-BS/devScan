-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "githubId" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "avatarUrl" TEXT,
    "accessToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
