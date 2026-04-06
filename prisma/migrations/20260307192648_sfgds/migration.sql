-- AlterTable
ALTER TABLE "Track" ADD COLUMN "estimatedBPM" INTEGER;
ALTER TABLE "Track" ADD COLUMN "estimatedEnergy" TEXT;
ALTER TABLE "Track" ADD COLUMN "estimatedTone" TEXT;

-- CreateTable
CREATE TABLE "TrackSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "start" REAL NOT NULL,
    "end" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrackSegment_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TrackSegment_trackId_idx" ON "TrackSegment"("trackId");
