/*
  Warnings:

  - Made the column `assessmentName` on table `Assessment` required. This step will fail if there are existing NULL values in that column.

*/

-- Step 1: Update existing NULL values to a default string
UPDATE "Assessment" SET "assessmentName" = 'Default Assessment Name' WHERE "assessmentName" IS NULL;

-- Step 2: RedefineTables (Prisma's generated script)
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyNameAr" TEXT NOT NULL,
    "companyNameEn" TEXT NOT NULL,
    "logoPath" TEXT,
    "securityManagerId" TEXT NOT NULL,
    "secondaryContactNameAr" TEXT NOT NULL,
    "secondaryContactNameEn" TEXT NOT NULL,
    "secondaryContactMobile" TEXT NOT NULL,
    "secondaryContactPhone" TEXT NOT NULL,
    "secondaryContactEmail" TEXT NOT NULL,
    "assessmentName" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assessment_securityManagerId_fkey" FOREIGN KEY ("securityManagerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Assessment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Assessment" ("assessmentName", "companyNameAr", "companyNameEn", "createdAt", "createdById", "id", "logoPath", "secondaryContactEmail", "secondaryContactMobile", "secondaryContactNameAr", "secondaryContactNameEn", "secondaryContactPhone", "securityManagerId", "updatedAt") SELECT "assessmentName", "companyNameAr", "companyNameEn", "createdAt", "createdById", "id", "logoPath", "secondaryContactEmail", "secondaryContactMobile", "secondaryContactNameAr", "secondaryContactNameEn", "secondaryContactPhone", "securityManagerId", "updatedAt" FROM "Assessment";
DROP TABLE "Assessment";
ALTER TABLE "new_Assessment" RENAME TO "Assessment";
CREATE INDEX "Assessment_securityManagerId_idx" ON "Assessment"("securityManagerId");
CREATE INDEX "Assessment_createdById_idx" ON "Assessment"("createdById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
