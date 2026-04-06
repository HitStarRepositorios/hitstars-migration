/*
  Warnings:

  - A unique constraint covering the columns `[catalogNumber]` on the table `Release` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Release" ADD COLUMN "catalogNumber" TEXT;

-- CreateTable
CREATE TABLE "CodeSequence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "year" INTEGER,
    "lastNumber" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Release_catalogNumber_key" ON "Release"("catalogNumber");
