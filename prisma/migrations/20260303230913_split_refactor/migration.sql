/*
  Warnings:

  - You are about to drop the column `ipiNumber` on the `Split` table. All the data in the column will be lost.
  - You are about to drop the column `pro` on the `Split` table. All the data in the column will be lost.
  - You are about to drop the column `publisherIpi` on the `Split` table. All the data in the column will be lost.
  - You are about to drop the column `publisherName` on the `Split` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Split` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Split` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "TrackArtist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "spotifyId" TEXT,
    "appleId" TEXT,
    "youtubeId" TEXT,
    "spotifyUrl" TEXT,
    "appleUrl" TEXT,
    "youtubeUrl" TEXT,
    "instagramUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrackArtist_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReleaseArtist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "releaseId" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ReleaseArtist_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublishingCredit" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PublishingCredit_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Split" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Split_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Split" ("createdAt", "id", "name", "percentage", "trackId") SELECT "createdAt", "id", "name", "percentage", "trackId" FROM "Split";
DROP TABLE "Split";
ALTER TABLE "new_Split" RENAME TO "Split";
CREATE INDEX "Split_trackId_idx" ON "Split"("trackId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TrackArtist_trackId_idx" ON "TrackArtist"("trackId");

-- CreateIndex
CREATE INDEX "PublishingCredit_trackId_idx" ON "PublishingCredit"("trackId");
