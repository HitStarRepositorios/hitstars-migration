/*
  Warnings:

  - A unique constraint covering the columns `[releaseId,dsp]` on the table `DSPDelivery` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "RoyaltyUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isrc" TEXT NOT NULL,
    "trackId" TEXT,
    "releaseId" TEXT,
    "platform" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "streams" INTEGER NOT NULL,
    "revenue" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "reportMonth" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoyaltyUsage_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RoyaltyUsage_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoyaltyEarning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usageId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "rightsHolderId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "streams" INTEGER NOT NULL,
    "revenue" REAL NOT NULL,
    "share" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "reportMonth" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoyaltyEarning_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "RoyaltyUsage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RoyaltyEarning_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RoyaltyEarning_rightsHolderId_fkey" FOREIGN KEY ("rightsHolderId") REFERENCES "RightsHolder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT,
    "lastName" TEXT,
    "dni" TEXT,
    "dateOfBirth" DATETIME,
    "country" TEXT,
    "phone" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompletedAt" DATETIME,
    "termsAcceptedAt" DATETIME,
    "privacyAcceptedAt" DATETIME,
    "termsVersion" TEXT,
    "balance" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("country", "createdAt", "dateOfBirth", "dni", "email", "firstName", "id", "lastName", "name", "onboardingCompleted", "onboardingCompletedAt", "password", "phone", "privacyAcceptedAt", "role", "termsAcceptedAt", "termsVersion", "updatedAt", "verified") SELECT "country", "createdAt", "dateOfBirth", "dni", "email", "firstName", "id", "lastName", "name", "onboardingCompleted", "onboardingCompletedAt", "password", "phone", "privacyAcceptedAt", "role", "termsAcceptedAt", "termsVersion", "updatedAt", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "RoyaltyUsage_isrc_idx" ON "RoyaltyUsage"("isrc");

-- CreateIndex
CREATE INDEX "RoyaltyUsage_reportMonth_idx" ON "RoyaltyUsage"("reportMonth");

-- CreateIndex
CREATE INDEX "RoyaltyEarning_trackId_idx" ON "RoyaltyEarning"("trackId");

-- CreateIndex
CREATE INDEX "RoyaltyEarning_rightsHolderId_idx" ON "RoyaltyEarning"("rightsHolderId");

-- CreateIndex
CREATE INDEX "RoyaltyEarning_reportMonth_idx" ON "RoyaltyEarning"("reportMonth");

-- CreateIndex
CREATE UNIQUE INDEX "DSPDelivery_releaseId_dsp_key" ON "DSPDelivery"("releaseId", "dsp");
