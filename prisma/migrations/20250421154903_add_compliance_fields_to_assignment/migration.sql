-- DropIndex
DROP INDEX "ControlAssignment_controlId_idx";

-- DropIndex
DROP INDEX "ControlAssignment_taskId_idx";

-- AlterTable
ALTER TABLE "ControlAssignment" ADD COLUMN "complianceLevel" TEXT;
ALTER TABLE "ControlAssignment" ADD COLUMN "correctiveActions" TEXT;
ALTER TABLE "ControlAssignment" ADD COLUMN "expectedComplianceDate" DATETIME;
ALTER TABLE "ControlAssignment" ADD COLUMN "notes" TEXT;
