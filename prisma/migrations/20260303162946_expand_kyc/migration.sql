/*
  Warnings:

  - You are about to drop the column `dateOfBirthVerified` on the `KycVerification` table. All the data in the column will be lost.
  - You are about to drop the column `firstNameVerified` on the `KycVerification` table. All the data in the column will be lost.
  - You are about to drop the column `lastNameVerified` on the `KycVerification` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `KycVerification` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `KycVerification` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KycVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "legalEntityType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "firstName" TEXT,
    "lastName" TEXT,
    "dateOfBirth" DATETIME,
    "nationality" TEXT,
    "documentType" TEXT,
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
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "approvedAt" DATETIME,
    "rejectedReason" TEXT,
    "riskScore" REAL,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KycVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_KycVerification" ("approvedAt", "createdAt", "documentNumber", "documentType", "id", "rejectedReason", "reviewedAt", "riskScore", "status", "updatedAt", "userId") SELECT "approvedAt", "createdAt", "documentNumber", "documentType", "id", "rejectedReason", "reviewedAt", "riskScore", "status", "updatedAt", "userId" FROM "KycVerification";
DROP TABLE "KycVerification";
ALTER TABLE "new_KycVerification" RENAME TO "KycVerification";
CREATE UNIQUE INDEX "KycVerification_userId_key" ON "KycVerification"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
