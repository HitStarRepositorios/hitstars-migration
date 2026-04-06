-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "iswc" TEXT,
    "language" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "alternativeTitle" TEXT,
    "territory" TEXT,
    "createdByArtistId" TEXT,
    CONSTRAINT "Work_createdByArtistId_fkey" FOREIGN KEY ("createdByArtistId") REFERENCES "Artist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

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
    "estimatedEnergy" TEXT,
    "workId" TEXT,
    CONSTRAINT "Track_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Track_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Track" ("composer", "createdAt", "duration", "estimatedBPM", "estimatedEnergy", "estimatedTone", "explicit", "fileUrl", "id", "isInstrumental", "isrc", "iswc", "lyrics", "previewStart", "publisher", "releaseId", "subGenre", "title", "trackNumber", "updatedAt") SELECT "composer", "createdAt", "duration", "estimatedBPM", "estimatedEnergy", "estimatedTone", "explicit", "fileUrl", "id", "isInstrumental", "isrc", "iswc", "lyrics", "previewStart", "publisher", "releaseId", "subGenre", "title", "trackNumber", "updatedAt" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_isrc_key" ON "Track"("isrc");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Work_iswc_key" ON "Work"("iswc");
