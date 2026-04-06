-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "firstName" TEXT,
    "lastName" TEXT,
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
INSERT INTO "new_User" ("country", "createdAt", "dateOfBirth", "dni", "email", "firstName", "id", "lastName", "name", "onboardingCompleted", "onboardingCompletedAt", "password", "phone", "role", "updatedAt", "verified") SELECT "country", "createdAt", "dateOfBirth", "dni", "email", "firstName", "id", "lastName", "name", "onboardingCompleted", "onboardingCompletedAt", "password", "phone", "role", "updatedAt", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
