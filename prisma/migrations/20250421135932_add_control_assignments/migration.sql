/*
  Warnings:

  - You are about to drop the `_ControlToTask` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ControlToTask";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ControlAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ControlAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ControlAssignment_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ControlAssignment_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ControlAssignment_taskId_idx" ON "ControlAssignment"("taskId");

-- CreateIndex
CREATE INDEX "ControlAssignment_controlId_idx" ON "ControlAssignment"("controlId");

-- CreateIndex
CREATE INDEX "ControlAssignment_assignedUserId_idx" ON "ControlAssignment"("assignedUserId");
