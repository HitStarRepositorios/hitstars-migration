/*
  Warnings:

  - You are about to drop the column `source` on the `RoyaltyTransaction` table. All the data in the column will be lost.
  - Added the required column `rightsHolderId` to the `RoyaltyTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceType` to the `RoyaltyTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RoyaltyEarning" (
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
    "kind" TEXT NOT NULL DEFAULT 'MASTER',
    CONSTRAINT "RoyaltyEarning_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "RoyaltyUsage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RoyaltyEarning_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RoyaltyEarning_rightsHolderId_fkey" FOREIGN KEY ("rightsHolderId") REFERENCES "RightsHolder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RoyaltyEarning" ("amount", "createdAt", "id", "platform", "reportMonth", "revenue", "rightsHolderId", "share", "streams", "trackId", "usageId") SELECT "amount", "createdAt", "id", "platform", "reportMonth", "revenue", "rightsHolderId", "share", "streams", "trackId", "usageId" FROM "RoyaltyEarning";
DROP TABLE "RoyaltyEarning";
ALTER TABLE "new_RoyaltyEarning" RENAME TO "RoyaltyEarning";
CREATE INDEX "RoyaltyEarning_trackId_idx" ON "RoyaltyEarning"("trackId");
CREATE INDEX "RoyaltyEarning_rightsHolderId_idx" ON "RoyaltyEarning"("rightsHolderId");
CREATE INDEX "RoyaltyEarning_reportMonth_idx" ON "RoyaltyEarning"("reportMonth");
CREATE TABLE "new_RoyaltyTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rightsHolderId" TEXT NOT NULL,
    "trackId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceType" TEXT NOT NULL,
    "reportMonth" DATETIME,
    "requiresKyc" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoyaltyTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RoyaltyTransaction" ("amount", "createdAt", "currency", "id", "requiresKyc", "status", "type", "userId") SELECT "amount", "createdAt", "currency", "id", "requiresKyc", "status", "type", "userId" FROM "RoyaltyTransaction";
DROP TABLE "RoyaltyTransaction";
ALTER TABLE "new_RoyaltyTransaction" RENAME TO "RoyaltyTransaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
