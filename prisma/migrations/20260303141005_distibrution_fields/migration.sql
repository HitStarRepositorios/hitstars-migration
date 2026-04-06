-- AlterTable
ALTER TABLE "Release" ADD COLUMN "distributedAt" DATETIME;
ALTER TABLE "Release" ADD COLUMN "liveAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Split" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "ipiNumber" TEXT,
    "pro" TEXT,
    "publisherName" TEXT,
    "publisherIpi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Split_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Split" ("createdAt", "id", "ipiNumber", "name", "percentage", "pro", "publisherIpi", "publisherName", "role", "trackId", "type") SELECT "createdAt", "id", "ipiNumber", "name", "percentage", "pro", "publisherIpi", "publisherName", "role", "trackId", "type" FROM "Split";
DROP TABLE "Split";
ALTER TABLE "new_Split" RENAME TO "Split";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
