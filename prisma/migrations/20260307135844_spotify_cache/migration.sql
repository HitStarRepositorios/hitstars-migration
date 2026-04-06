-- CreateTable
CREATE TABLE "SpotifyArtistCache" (
    "artistId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "followers" INTEGER NOT NULL,
    "popularity" INTEGER NOT NULL,
    "tracks" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
