/*
  Warnings:

  - You are about to drop the column `subGenre` on the `Release` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Release" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "releaseDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "coverUrl" TEXT,
    "label" TEXT NOT NULL DEFAULT 'Independent',
    "upc" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "genre" TEXT,
    "language" TEXT,
    "copyrightYear" INTEGER,
    "producerName" TEXT,
    "composerName" TEXT,
    "publisher" TEXT,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "territories" TEXT,
    "distributionType" TEXT,
    "distributionPlatforms" JSONB,
    "distributionWorldwide" BOOLEAN NOT NULL DEFAULT true,
    "distributionTerritories" JSONB,
    "rejectionReason" TEXT,
    "reviewedAt" DATETIME,
    "reviewedById" TEXT,
    CONSTRAINT "Release_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Release_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Release" ("artistId", "composerName", "copyrightYear", "coverUrl", "createdAt", "distributionPlatforms", "distributionTerritories", "distributionType", "distributionWorldwide", "explicit", "genre", "id", "label", "language", "producerName", "publisher", "rejectionReason", "releaseDate", "reviewedAt", "reviewedById", "status", "territories", "title", "upc", "updatedAt") SELECT "artistId", "composerName", "copyrightYear", "coverUrl", "createdAt", "distributionPlatforms", "distributionTerritories", "distributionType", "distributionWorldwide", "explicit", "genre", "id", "label", "language", "producerName", "publisher", "rejectionReason", "releaseDate", "reviewedAt", "reviewedById", "status", "territories", "title", "upc", "updatedAt" FROM "Release";
DROP TABLE "Release";
ALTER TABLE "new_Release" RENAME TO "Release";
CREATE UNIQUE INDEX "Release_upc_key" ON "Release"("upc");
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "releaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "trackNumber" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isrc" TEXT,
    "duration" INTEGER,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "iswc" TEXT,
    "lyrics" TEXT,
    "publisher" TEXT,
    "composer" TEXT,
    "subGenre" TEXT,
    "isInstrumental" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Track_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Track" ("composer", "createdAt", "duration", "explicit", "fileUrl", "id", "isrc", "iswc", "lyrics", "publisher", "releaseId", "title", "trackNumber", "updatedAt") SELECT "composer", "createdAt", "duration", "explicit", "fileUrl", "id", "isrc", "iswc", "lyrics", "publisher", "releaseId", "title", "trackNumber", "updatedAt" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_isrc_key" ON "Track"("isrc");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
