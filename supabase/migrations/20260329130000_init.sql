-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DNI', 'PASSPORT', 'NIE', 'CIF');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('ROYALTY', 'ROYALTY_EARNING', 'PAYOUT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "RoyaltyKind" AS ENUM ('MASTER', 'PUBLISHING', 'PRODUCER');

-- CreateEnum
CREATE TYPE "RecordingEdition" AS ENUM ('ORIGINAL', 'REMASTERED', 'RADIO_EDIT', 'LIVE', 'ACOUSTIC', 'INSTRUMENTAL');

-- CreateEnum
CREATE TYPE "TrackArtistRole" AS ENUM ('MAIN', 'FEATURED', 'PRODUCER', 'REMIXER');

-- CreateEnum
CREATE TYPE "LegalEntityType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "PRO" AS ENUM ('SGAE', 'ASCAP', 'BMI', 'PRS', 'SOCAN', 'SACEM', 'GEMA');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'AVAILABLE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EARNING', 'WITHDRAWAL', 'ROYALTY', 'PAYOUT', 'ADJUSTMENT', 'WITHHOLDING', 'TAX');

-- CreateEnum
CREATE TYPE "ReleaseStatus" AS ENUM ('DRAFT', 'PENDING', 'SUBMITTED', 'AWAITING_SIGNATURE', 'CONTRACT_GENERATED', 'SIGNED', 'APPROVED', 'REJECTED', 'DISTRIBUTING', 'LIVE');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('SPOTIFY', 'APPLE_MUSIC', 'AMAZON', 'YOUTUBE', 'YOUTUBE_MUSIC', 'DEEZER', 'TIDAL', 'SOUNDCLOUD', 'PANDORA', 'TENCENT', 'NETEASE', 'QQ_MUSIC', 'KUGOU', 'KUWO', 'GAANA', 'JIOSAAVN', 'BOOMPLAY', 'ANGHAMI', 'AUDIOMACK', 'SNAPCHAT', 'TIKTOK', 'INSTAGRAM', 'FACEBOOK', 'RESSO', 'CAPCUT', 'SHAZAM', 'BEATPORT', 'TRAXSOURCE', 'VEVO', 'NAPSTER');

-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('pop', 'hip_hop', 'electronic', 'rock', 'latin', 'rnb', 'afro', 'reggae', 'jazz', 'classical', 'country', 'folk', 'metal', 'soundtrack', 'other');

-- CreateEnum
CREATE TYPE "SubGenre" AS ENUM ('dance_pop', 'indie_pop', 'electropop', 'teen_pop', 'pop_rock', 'trap', 'drill', 'boom_bap', 'lofi', 'uk_rap', 'conscious_hip_hop', 'house', 'tech_house', 'deep_house', 'techno', 'melodic_techno', 'edm', 'trance', 'dubstep', 'reggaeton', 'latin_trap', 'bachata', 'salsa', 'dembow', 'alternative_rock', 'indie_rock', 'hard_rock', 'punk', 'contemporary_rnb', 'neo_soul', 'afrobeats', 'amapiano', 'dancehall', 'roots_reggae', 'smooth_jazz', 'bebop', 'orchestral', 'chamber_music', 'modern_country', 'country_pop', 'indie_folk', 'acoustic_folk', 'metalcore', 'death_metal', 'heavy_metal', 'film_score', 'video_game_music', 'instrumental', 'experimental');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "dni" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "country" TEXT,
    "phone" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompletedAt" TIMESTAMP(3),
    "termsAcceptedAt" TIMESTAMP(3),
    "privacyAcceptedAt" TIMESTAMP(3),
    "termsVersion" TEXT,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "legalEntityType" "LegalEntityType" NOT NULL DEFAULT 'INDIVIDUAL',
    "firstName" TEXT,
    "lastName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "documentType" "DocumentType",
    "documentNumber" TEXT,
    "companyName" TEXT,
    "companyRegistrationNumber" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "taxId" TEXT,
    "taxCountry" TEXT,
    "vatNumber" TEXT,
    "isVatRegistered" BOOLEAN NOT NULL DEFAULT false,
    "accountHolderName" TEXT,
    "iban" TEXT,
    "swift" TEXT,
    "bankName" TEXT,
    "bankCountry" TEXT,
    "stripeAccountId" TEXT,
    "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "status" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "approvedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "riskScore" DOUBLE PRECISION,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistPlatform" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ArtistPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "genre" TEXT,
    "subGenre" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "coverUrl" TEXT,
    "label" TEXT NOT NULL DEFAULT 'Independent',
    "upc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
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
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "contractId" TEXT,
    "contractHash" TEXT,
    "status" "ReleaseStatus" NOT NULL DEFAULT 'DRAFT',
    "signedUserAgent" TEXT,
    "signedAt" TIMESTAMP(3),
    "signedIp" TEXT,
    "distributedAt" TIMESTAMP(3),
    "liveAt" TIMESTAMP(3),
    "catalogNumber" TEXT,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "trackNumber" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isrc" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
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
    "recordingEdition" "RecordingEdition" NOT NULL DEFAULT 'ORIGINAL',

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "iswc" TEXT,
    "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "alternativeTitle" TEXT,
    "territory" TEXT,
    "createdByArtistId" TEXT,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackSegment" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "start" DOUBLE PRECISION NOT NULL,
    "end" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform" TEXT NOT NULL,
    "streams" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "releaseId" TEXT,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountHolderName" TEXT,
    "bankName" TEXT,
    "iban" TEXT,
    "swift" TEXT,
    "taxId" TEXT,
    "taxCountry" TEXT,
    "vatNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayoutProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreStat" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "streams" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "month" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributionPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotify" BOOLEAN NOT NULL DEFAULT true,
    "apple" BOOLEAN NOT NULL DEFAULT true,
    "amazon" BOOLEAN NOT NULL DEFAULT true,
    "deezer" BOOLEAN NOT NULL DEFAULT true,
    "youtube" BOOLEAN NOT NULL DEFAULT true,
    "tiktok" BOOLEAN NOT NULL DEFAULT true,
    "instagram" BOOLEAN NOT NULL DEFAULT true,
    "tidal" BOOLEAN NOT NULL DEFAULT true,
    "soundcloud" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DistributionPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoyaltyTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rightsHolderId" TEXT NOT NULL,
    "trackId" TEXT,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceType" "TransactionSource" NOT NULL,
    "reportMonth" TIMESTAMP(3),
    "requiresKyc" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoyaltyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackArtist" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "role" "TrackArtistRole" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "spotifyId" TEXT,
    "appleId" TEXT,
    "youtubeId" TEXT,
    "spotifyUrl" TEXT,
    "appleUrl" TEXT,
    "youtubeUrl" TEXT,
    "instagramUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackArtist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseArtist" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReleaseArtist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RightsHolder" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "nationality" TEXT,
    "ipi" TEXT,
    "pro" TEXT,
    "taxId" TEXT,
    "taxCountry" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RightsHolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishingCredit" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ipiNumber" TEXT,
    "pro" "PRO",
    "email" TEXT,
    "phone" TEXT,
    "documentNumber" TEXT,
    "publisherName" TEXT,
    "publisherIpi" TEXT,
    "share" DOUBLE PRECISION NOT NULL,
    "nationality" TEXT,
    "address" TEXT,
    "societyMemberId" TEXT,
    "rightsHolderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublishingCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterParty" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "stageName" TEXT,
    "entityType" "LegalEntityType" NOT NULL DEFAULT 'INDIVIDUAL',
    "taxId" TEXT,
    "taxCountry" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "ownershipShare" DOUBLE PRECISION NOT NULL,
    "revenueShare" DOUBLE PRECISION,
    "isrcOwner" BOOLEAN NOT NULL DEFAULT false,
    "rightsHolderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyArtistCache" (
    "artistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "followers" INTEGER NOT NULL,
    "popularity" INTEGER NOT NULL,
    "tracks" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotifyArtistCache_pkey" PRIMARY KEY ("artistId")
);

-- CreateTable
CREATE TABLE "CodeSequence" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "year" INTEGER,
    "lastNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSPDelivery" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "dsp" "Platform" NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DSPDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoyaltyUsage" (
    "id" TEXT NOT NULL,
    "isrc" TEXT NOT NULL,
    "trackId" TEXT,
    "releaseId" TEXT,
    "platform" "Platform" NOT NULL,
    "country" TEXT NOT NULL,
    "streams" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "reportMonth" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoyaltyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoyaltyEarning" (
    "id" TEXT NOT NULL,
    "usageId" TEXT,
    "trackId" TEXT NOT NULL,
    "rightsHolderId" TEXT NOT NULL,
    "platform" "Platform",
    "pro" "PRO",
    "source" TEXT,
    "streams" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "share" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reportMonth" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" "RoyaltyKind" NOT NULL DEFAULT 'MASTER',

    CONSTRAINT "RoyaltyEarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProducerReport" (
    "id" TEXT NOT NULL,
    "isrc" TEXT NOT NULL,
    "trackTitle" TEXT NOT NULL,
    "producerIpi" TEXT,
    "streams" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "territory" TEXT NOT NULL,
    "reportMonth" TIMESTAMP(3) NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProducerReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishingReport" (
    "id" TEXT NOT NULL,
    "iswc" TEXT,
    "workTitle" TEXT NOT NULL,
    "rightsHolderIpi" TEXT,
    "streams" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "territory" TEXT NOT NULL,
    "reportMonth" TIMESTAMP(3) NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublishingReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KycVerification_userId_key" ON "KycVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_token_key" ON "EmailVerification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistPlatform_artistId_platform_key" ON "ArtistPlatform"("artistId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_userId_key" ON "Artist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Release_upc_key" ON "Release"("upc");

-- CreateIndex
CREATE UNIQUE INDEX "Release_catalogNumber_key" ON "Release"("catalogNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Track_isrc_key" ON "Track"("isrc");

-- CreateIndex
CREATE UNIQUE INDEX "Work_iswc_key" ON "Work"("iswc");

-- CreateIndex
CREATE INDEX "TrackSegment_trackId_idx" ON "TrackSegment"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNumber_key" ON "Contract"("contractNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutProfile_userId_key" ON "PayoutProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "TrackArtist_trackId_idx" ON "TrackArtist"("trackId");

-- CreateIndex
CREATE INDEX "PublishingCredit_trackId_idx" ON "PublishingCredit"("trackId");

-- CreateIndex
CREATE INDEX "MasterParty_trackId_idx" ON "MasterParty"("trackId");

-- CreateIndex
CREATE INDEX "DSPDelivery_releaseId_idx" ON "DSPDelivery"("releaseId");

-- CreateIndex
CREATE UNIQUE INDEX "DSPDelivery_releaseId_dsp_key" ON "DSPDelivery"("releaseId", "dsp");

-- CreateIndex
CREATE INDEX "RoyaltyUsage_isrc_idx" ON "RoyaltyUsage"("isrc");

-- CreateIndex
CREATE INDEX "RoyaltyUsage_reportMonth_idx" ON "RoyaltyUsage"("reportMonth");

-- CreateIndex
CREATE INDEX "RoyaltyEarning_trackId_idx" ON "RoyaltyEarning"("trackId");

-- CreateIndex
CREATE INDEX "RoyaltyEarning_rightsHolderId_idx" ON "RoyaltyEarning"("rightsHolderId");

-- CreateIndex
CREATE INDEX "RoyaltyEarning_reportMonth_idx" ON "RoyaltyEarning"("reportMonth");

-- CreateIndex
CREATE UNIQUE INDEX "RoyaltyEarning_trackId_rightsHolderId_reportMonth_kind_plat_key" ON "RoyaltyEarning"("trackId", "rightsHolderId", "reportMonth", "kind", "platform", "pro");

-- CreateIndex
CREATE INDEX "ProducerReport_isrc_idx" ON "ProducerReport"("isrc");

-- CreateIndex
CREATE INDEX "ProducerReport_producerIpi_idx" ON "ProducerReport"("producerIpi");

-- CreateIndex
CREATE INDEX "PublishingReport_iswc_idx" ON "PublishingReport"("iswc");

-- CreateIndex
CREATE INDEX "PublishingReport_rightsHolderIpi_idx" ON "PublishingReport"("rightsHolderIpi");

-- CreateIndex
CREATE INDEX "PublishingReport_reportMonth_idx" ON "PublishingReport"("reportMonth");

-- CreateIndex
CREATE INDEX "PublishingReport_processed_reportMonth_idx" ON "PublishingReport"("processed", "reportMonth");

-- AddForeignKey
ALTER TABLE "KycVerification" ADD CONSTRAINT "KycVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerification" ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistPlatform" ADD CONSTRAINT "ArtistPlatform_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_createdByArtistId_fkey" FOREIGN KEY ("createdByArtistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackSegment" ADD CONSTRAINT "TrackSegment_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutProfile" ADD CONSTRAINT "PayoutProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreStat" ADD CONSTRAINT "StoreStat_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionPreference" ADD CONSTRAINT "DistributionPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyTransaction" ADD CONSTRAINT "RoyaltyTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseArtist" ADD CONSTRAINT "ReleaseArtist_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RightsHolder" ADD CONSTRAINT "RightsHolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishingCredit" ADD CONSTRAINT "PublishingCredit_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishingCredit" ADD CONSTRAINT "PublishingCredit_rightsHolderId_fkey" FOREIGN KEY ("rightsHolderId") REFERENCES "RightsHolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterParty" ADD CONSTRAINT "MasterParty_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterParty" ADD CONSTRAINT "MasterParty_rightsHolderId_fkey" FOREIGN KEY ("rightsHolderId") REFERENCES "RightsHolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DSPDelivery" ADD CONSTRAINT "DSPDelivery_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyUsage" ADD CONSTRAINT "RoyaltyUsage_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyUsage" ADD CONSTRAINT "RoyaltyUsage_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyEarning" ADD CONSTRAINT "RoyaltyEarning_usageId_fkey" FOREIGN KEY ("usageId") REFERENCES "RoyaltyUsage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyEarning" ADD CONSTRAINT "RoyaltyEarning_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyEarning" ADD CONSTRAINT "RoyaltyEarning_rightsHolderId_fkey" FOREIGN KEY ("rightsHolderId") REFERENCES "RightsHolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

