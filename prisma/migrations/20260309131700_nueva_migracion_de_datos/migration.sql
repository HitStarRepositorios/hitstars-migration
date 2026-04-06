/*
  Warnings:

  - Added the required column `rightsHolderId` to the `MasterParty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rightsHolderId` to the `PublishingCredit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Track" ADD COLUMN "audioCodec" TEXT;
ALTER TABLE "Track" ADD COLUMN "bitDepth" INTEGER;
ALTER TABLE "Track" ADD COLUMN "sampleRate" INTEGER;

-- CreateTable
CREATE TABLE "RightsHolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT,
    "lastName" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "nationality" TEXT,
    "ipi" TEXT,
    "pro" TEXT,
    "taxId" TEXT,
    "taxCountry" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RightsHolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DSPDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "releaseId" TEXT NOT NULL,
    "dsp" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" DATETIME,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DSPDelivery_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MasterParty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "stageName" TEXT,
    "entityType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "taxId" TEXT,
    "taxCountry" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "ownershipShare" REAL NOT NULL,
    "revenueShare" REAL,
    "isrcOwner" BOOLEAN NOT NULL DEFAULT false,
    "rightsHolderId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MasterParty_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MasterParty_rightsHolderId_fkey" FOREIGN KEY ("rightsHolderId") REFERENCES "RightsHolder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MasterParty" ("createdAt", "email", "entityType", "id", "isrcOwner", "legalName", "ownershipShare", "phone", "revenueShare", "role", "stageName", "taxCountry", "taxId", "trackId") SELECT "createdAt", "email", "entityType", "id", "isrcOwner", "legalName", "ownershipShare", "phone", "revenueShare", "role", "stageName", "taxCountry", "taxId", "trackId" FROM "MasterParty";
DROP TABLE "MasterParty";
ALTER TABLE "new_MasterParty" RENAME TO "MasterParty";
CREATE INDEX "MasterParty_trackId_idx" ON "MasterParty"("trackId");
CREATE TABLE "new_PublishingCredit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ipiNumber" TEXT,
    "pro" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "documentNumber" TEXT,
    "publisherName" TEXT,
    "publisherIpi" TEXT,
    "share" REAL NOT NULL,
    "nationality" TEXT,
    "address" TEXT,
    "societyMemberId" TEXT,
    "rightsHolderId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PublishingCredit_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublishingCredit_rightsHolderId_fkey" FOREIGN KEY ("rightsHolderId") REFERENCES "RightsHolder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PublishingCredit" ("address", "createdAt", "documentNumber", "email", "firstName", "id", "ipiNumber", "lastName", "nationality", "phone", "pro", "publisherIpi", "publisherName", "role", "share", "societyMemberId", "trackId") SELECT "address", "createdAt", "documentNumber", "email", "firstName", "id", "ipiNumber", "lastName", "nationality", "phone", "pro", "publisherIpi", "publisherName", "role", "share", "societyMemberId", "trackId" FROM "PublishingCredit";
DROP TABLE "PublishingCredit";
ALTER TABLE "new_PublishingCredit" RENAME TO "PublishingCredit";
CREATE INDEX "PublishingCredit_trackId_idx" ON "PublishingCredit"("trackId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DSPDelivery_releaseId_idx" ON "DSPDelivery"("releaseId");
