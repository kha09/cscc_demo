-- AlterTable
ALTER TABLE "User" ADD COLUMN "mobile" TEXT;
ALTER TABLE "User" ADD COLUMN "nameAr" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- CreateTable
CREATE TABLE "Assessment" (
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
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assessment_securityManagerId_fkey" FOREIGN KEY ("securityManagerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Assessment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Assessment_securityManagerId_idx" ON "Assessment"("securityManagerId");

-- CreateIndex
CREATE INDEX "Assessment_createdById_idx" ON "Assessment"("createdById");
