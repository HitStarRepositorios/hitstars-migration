-- AlterTable
ALTER TABLE "Artist" ADD COLUMN "subGenre" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "privacyAcceptedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "termsAcceptedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "termsVersion" TEXT;
