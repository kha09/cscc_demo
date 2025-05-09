-- CreateEnum
CREATE TYPE "SecurityAction" AS ENUM ('CONFIRM', 'REQUEST_REVIEW');

-- CreateTable
CREATE TABLE "SecurityReview" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "mainComponent" TEXT NOT NULL,
    "securityManagerId" TEXT NOT NULL,
    "action" "SecurityAction" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityReviewControlAssignment" (
    "id" TEXT NOT NULL,
    "securityReviewId" TEXT NOT NULL,
    "controlAssignmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityReviewControlAssignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SecurityReview" ADD CONSTRAINT "SecurityReview_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityReview" ADD CONSTRAINT "SecurityReview_securityManagerId_fkey" FOREIGN KEY ("securityManagerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityReviewControlAssignment" ADD CONSTRAINT "SecurityReviewControlAssignment_securityReviewId_fkey" FOREIGN KEY ("securityReviewId") REFERENCES "SecurityReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityReviewControlAssignment" ADD CONSTRAINT "SecurityReviewControlAssignment_controlAssignmentId_fkey" FOREIGN KEY ("controlAssignmentId") REFERENCES "ControlAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "SecurityReview_taskId_idx" ON "SecurityReview"("taskId");
CREATE INDEX "SecurityReview_securityManagerId_idx" ON "SecurityReview"("securityManagerId");
CREATE INDEX "SecurityReviewControlAssignment_securityReviewId_idx" ON "SecurityReviewControlAssignment"("securityReviewId");
CREATE INDEX "SecurityReviewControlAssignment_controlAssignmentId_idx" ON "SecurityReviewControlAssignment"("controlAssignmentId");
