-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SECURITY_MANAGER', 'DEPARTMENT_MANAGER', 'USER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ComplianceLevel" AS ENUM ('NOT_IMPLEMENTED', 'PARTIALLY_IMPLEMENTED', 'IMPLEMENTED', 'NOT_APPLICABLE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "department" TEXT,
    "nameAr" TEXT,
    "mobile" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensitiveSystemInfo" (
    "id" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "systemCategory" TEXT NOT NULL,
    "systemDescription" TEXT NOT NULL,
    "assetRouterCount" INTEGER NOT NULL,
    "assetSwitchCount" INTEGER NOT NULL,
    "assetGatewayCount" INTEGER NOT NULL,
    "assetFirewallCount" INTEGER NOT NULL,
    "assetIPSIDSCount" INTEGER NOT NULL,
    "assetAPTCount" INTEGER NOT NULL,
    "assetDatabaseCount" INTEGER NOT NULL,
    "assetStorageCount" INTEGER NOT NULL,
    "assetMiddlewareCount" INTEGER NOT NULL,
    "assetServerOSCount" INTEGER NOT NULL,
    "assetApplicationCount" INTEGER NOT NULL,
    "assetEncryptionDeviceCount" INTEGER NOT NULL,
    "assetPeripheralCount" INTEGER NOT NULL,
    "assetSupportStaffCount" INTEGER NOT NULL,
    "assetDocumentationCount" INTEGER NOT NULL,
    "otherAssetType" TEXT,
    "otherAssetCount" INTEGER,
    "totalAssetCount" INTEGER NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensitiveSystemInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL,
    "mainComponent" TEXT NOT NULL,
    "subComponent" TEXT,
    "controlType" TEXT NOT NULL,
    "controlNumber" TEXT NOT NULL,
    "controlText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sensitiveSystemId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedToId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "correctiveActions" TEXT,
    "expectedComplianceDate" TIMESTAMP(3),
    "complianceLevel" "ComplianceLevel",

    CONSTRAINT "ControlAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Assessment_securityManagerId_idx" ON "Assessment"("securityManagerId");

-- CreateIndex
CREATE INDEX "Assessment_createdById_idx" ON "Assessment"("createdById");

-- CreateIndex
CREATE INDEX "SensitiveSystemInfo_assessmentId_idx" ON "SensitiveSystemInfo"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Control_controlNumber_key" ON "Control"("controlNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Task_sensitiveSystemId_idx" ON "Task"("sensitiveSystemId");

-- CreateIndex
CREATE INDEX "Task_assignedById_idx" ON "Task"("assignedById");

-- CreateIndex
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");

-- CreateIndex
CREATE INDEX "ControlAssignment_assignedUserId_idx" ON "ControlAssignment"("assignedUserId");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_securityManagerId_fkey" FOREIGN KEY ("securityManagerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensitiveSystemInfo" ADD CONSTRAINT "SensitiveSystemInfo_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_sensitiveSystemId_fkey" FOREIGN KEY ("sensitiveSystemId") REFERENCES "SensitiveSystemInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlAssignment" ADD CONSTRAINT "ControlAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlAssignment" ADD CONSTRAINT "ControlAssignment_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlAssignment" ADD CONSTRAINT "ControlAssignment_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
