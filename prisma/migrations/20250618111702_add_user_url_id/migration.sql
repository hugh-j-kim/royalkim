/*
  Warnings:

  - A unique constraint covering the columns `[urlId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "urlId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_urlId_key" ON "User"("urlId");
