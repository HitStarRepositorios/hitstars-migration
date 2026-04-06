-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RoyaltyEarning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usageId" TEXT,
    "trackId" TEXT NOT NULL,
    "rightsHolderId" TEXT NOT NULL,
    "platform" TEXT,
    "pro" TEXT,
    "streams" INTEGER NOT NULL,
    "revenue" REAL NOT NULL,
    "share" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "reportMonth" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" TEXT NOT NULL DEFAULT 'MASTER',
    CONSTRAINT "RoyaltyEarning_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "RoyaltyUsage" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RoyaltyEarning_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RoyaltyEarning_rightsHolderId_fkey" FOREIGN KEY ("rightsHolderId") REFERENCES "RightsHolder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RoyaltyEarning" ("amount", "createdAt", "id", "kind", "platform", "pro", "reportMonth", "revenue", "rightsHolderId", "share", "streams", "trackId", "usageId") SELECT "amount", "createdAt", "id", "kind", "platform", "pro", "reportMonth", "revenue", "rightsHolderId", "share", "streams", "trackId", "usageId" FROM "RoyaltyEarning";
DROP TABLE "RoyaltyEarning";
ALTER TABLE "new_RoyaltyEarning" RENAME TO "RoyaltyEarning";
CREATE INDEX "RoyaltyEarning_trackId_idx" ON "RoyaltyEarning"("trackId");
CREATE INDEX "RoyaltyEarning_rightsHolderId_idx" ON "RoyaltyEarning"("rightsHolderId");
CREATE INDEX "RoyaltyEarning_reportMonth_idx" ON "RoyaltyEarning"("reportMonth");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
