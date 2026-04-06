/*
  Warnings:

  - You are about to drop the column `estimatedEnergy` on the `Track` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "releaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "trackNumber" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isrc" TEXT,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "iswc" TEXT,
    "lyrics" TEXT,
    "publisher" TEXT,
    "composer" TEXT,
    "subGenre" TEXT,
    "isInstrumental" BOOLEAN NOT NULL DEFAULT false,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "previewStart" INTEGER,
    "estimatedBPM" INTEGER,
    "estimatedTone" TEXT,
    "estimatedDanceability" TEXT,
    "workId" TEXT,
    "audioCodec" TEXT,
    "sampleRate" INTEGER,
    "bitDepth" INTEGER,
    "recordingEdition" TEXT NOT NULL DEFAULT 'ORIGINAL',
    CONSTRAINT "Track_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Track_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Track" ("audioCodec", "bitDepth", "composer", "createdAt", "duration", "estimatedBPM", "estimatedTone", "explicit", "fileUrl", "id", "isInstrumental", "isrc", "iswc", "lyrics", "previewStart", "publisher", "recordingEdition", "releaseId", "sampleRate", "subGenre", "title", "trackNumber", "updatedAt", "workId") SELECT "audioCodec", "bitDepth", "composer", "createdAt", "duration", "estimatedBPM", "estimatedTone", "explicit", "fileUrl", "id", "isInstrumental", "isrc", "iswc", "lyrics", "previewStart", "publisher", "recordingEdition", "releaseId", "sampleRate", "subGenre", "title", "trackNumber", "updatedAt", "workId" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_isrc_key" ON "Track"("isrc");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
