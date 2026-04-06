/*
  Warnings:

  - You are about to drop the column `appleId` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `spotifyId` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `territories` on the `Release` table. All the data in the column will be lost.
  - You are about to drop the column `kycDocumentUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `kycNotes` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `kycStatus` on the `User` table. All the data in the column will be lost.
  - Added the required column `type` to the `RoyaltyTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pro` to the `Split` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "KycVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT,
    "providerId" TEXT,
    "documentType" TEXT,
    "documentNumber" TEXT,
    "firstNameVerified" TEXT,
    "lastNameVerified" TEXT,
    "dateOfBirthVerified" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "approvedAt" DATETIME,
    "rejectedReason" TEXT,
    "riskScore" REAL,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KycVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArtistPlatform" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artistId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ArtistPlatform_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "genre" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    CONSTRAINT "Artist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Artist" ("bio", "createdAt", "genre", "id", "updatedAt", "userId") SELECT "bio", "createdAt", "genre", "id", "updatedAt", "userId" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE UNIQUE INDEX "Artist_userId_key" ON "Artist"("userId");
CREATE TABLE "new_Release" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "releaseDate" DATETIME NOT NULL,
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
    "distributionType" TEXT,
    "distributionPlatforms" JSONB,
    "distributionWorldwide" BOOLEAN NOT NULL DEFAULT true,
    "distributionTerritories" JSONB,
    "rejectionReason" TEXT,
    "reviewedAt" DATETIME,
    "reviewedById" TEXT,
    "contractId" TEXT,
    "contractHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "signedUserAgent" TEXT,
    "signedAt" DATETIME,
    "signedIp" TEXT,
    CONSTRAINT "Release_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Release_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Release" ("artistId", "composerName", "contractHash", "contractId", "copyrightYear", "coverUrl", "createdAt", "distributionPlatforms", "distributionTerritories", "distributionType", "distributionWorldwide", "genre", "id", "label", "language", "producerName", "publisher", "rejectionReason", "releaseDate", "reviewedAt", "reviewedById", "signedAt", "signedIp", "status", "title", "upc", "updatedAt") SELECT "artistId", "composerName", "contractHash", "contractId", "copyrightYear", "coverUrl", "createdAt", "distributionPlatforms", "distributionTerritories", "distributionType", "distributionWorldwide", "genre", "id", "label", "language", "producerName", "publisher", "rejectionReason", "releaseDate", "reviewedAt", "reviewedById", "signedAt", "signedIp", "status", "title", "upc", "updatedAt" FROM "Release";
DROP TABLE "Release";
ALTER TABLE "new_Release" RENAME TO "Release";
CREATE UNIQUE INDEX "Release_upc_key" ON "Release"("upc");
CREATE TABLE "new_RoyaltyTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requiresKyc" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoyaltyTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RoyaltyTransaction" ("amount", "createdAt", "currency", "id", "source", "status", "userId") SELECT "amount", "createdAt", "currency", "id", "source", "status", "userId" FROM "RoyaltyTransaction";
DROP TABLE "RoyaltyTransaction";
ALTER TABLE "new_RoyaltyTransaction" RENAME TO "RoyaltyTransaction";
CREATE TABLE "new_Split" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "ipiNumber" TEXT,
    "pro" TEXT NOT NULL,
    "publisherName" TEXT,
    "publisherIpi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Split_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Split" ("createdAt", "id", "name", "percentage", "role", "trackId", "type") SELECT "createdAt", "id", "name", "percentage", "role", "trackId", "type" FROM "Split";
DROP TABLE "Split";
ALTER TABLE "new_Split" RENAME TO "Split";
CREATE TABLE "new_User" (
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dni" TEXT,
    "dateOfBirth" DATETIME,
    "country" TEXT,
    "phone" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompletedAt" DATETIME
);
INSERT INTO "new_User" ("country", "createdAt", "dateOfBirth", "dni", "email", "firstName", "id", "lastName", "name", "password", "phone", "role", "updatedAt", "verified") SELECT "country", "createdAt", "dateOfBirth", "dni", "email", "firstName", "id", "lastName", "name", "password", "phone", "role", "updatedAt", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "KycVerification_userId_key" ON "KycVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistPlatform_artistId_platform_key" ON "ArtistPlatform"("artistId", "platform");
