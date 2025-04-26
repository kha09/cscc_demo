-- CreateTable
CREATE TABLE "ControlFile" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "controlAssignmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ControlFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ControlFile_controlAssignmentId_idx" ON "ControlFile"("controlAssignmentId");

-- AddForeignKey
ALTER TABLE "ControlFile" ADD CONSTRAINT "ControlFile_controlAssignmentId_fkey" FOREIGN KEY ("controlAssignmentId") REFERENCES "ControlAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
