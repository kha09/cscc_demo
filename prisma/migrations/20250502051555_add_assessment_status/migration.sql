-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('طلب مراجعة', 'معتمد');

-- CreateTable
CREATE TABLE "AssessmentStatus" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "sensitiveSystemId" TEXT NOT NULL,
    "securityManagerId" TEXT NOT NULL,
    "departmentManagerId" TEXT NOT NULL,
    "securityManagerStatus" "ReviewStatus",
    "departmentManagerStatus" "ReviewStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssessmentStatus_assessmentId_idx" ON "AssessmentStatus"("assessmentId");

-- CreateIndex
CREATE INDEX "AssessmentStatus_sensitiveSystemId_idx" ON "AssessmentStatus"("sensitiveSystemId");

-- CreateIndex
CREATE INDEX "AssessmentStatus_securityManagerId_idx" ON "AssessmentStatus"("securityManagerId");

-- CreateIndex
CREATE INDEX "AssessmentStatus_departmentManagerId_idx" ON "AssessmentStatus"("departmentManagerId");

-- AddForeignKey
ALTER TABLE "AssessmentStatus" ADD CONSTRAINT "AssessmentStatus_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentStatus" ADD CONSTRAINT "AssessmentStatus_sensitiveSystemId_fkey" FOREIGN KEY ("sensitiveSystemId") REFERENCES "SensitiveSystemInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentStatus" ADD CONSTRAINT "AssessmentStatus_securityManagerId_fkey" FOREIGN KEY ("securityManagerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentStatus" ADD CONSTRAINT "AssessmentStatus_departmentManagerId_fkey" FOREIGN KEY ("departmentManagerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
