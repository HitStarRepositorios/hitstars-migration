/*
  Warnings:

  - You are about to drop the column `documentNumber` on the `MasterParty` table. All the data in the column will be lost.

*/
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MasterParty_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MasterParty" ("createdAt", "email", "entityType", "id", "legalName", "ownershipShare", "phone", "revenueShare", "role", "stageName", "taxCountry", "taxId", "trackId") SELECT "createdAt", "email", "entityType", "id", "legalName", "ownershipShare", "phone", "revenueShare", "role", "stageName", "taxCountry", "taxId", "trackId" FROM "MasterParty";
DROP TABLE "MasterParty";
ALTER TABLE "new_MasterParty" RENAME TO "MasterParty";
CREATE INDEX "MasterParty_trackId_idx" ON "MasterParty"("trackId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
