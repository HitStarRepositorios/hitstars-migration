/*
  Warnings:

  - You are about to drop the `Split` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "PublishingCredit" ADD COLUMN "address" TEXT;
ALTER TABLE "PublishingCredit" ADD COLUMN "nationality" TEXT;
ALTER TABLE "PublishingCredit" ADD COLUMN "societyMemberId" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Split";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "MasterParty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "stageName" TEXT,
    "entityType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "documentNumber" TEXT,
    "taxId" TEXT,
    "taxCountry" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "ownershipShare" REAL NOT NULL,
    "revenueShare" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MasterParty_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MasterParty_trackId_idx" ON "MasterParty"("trackId");
