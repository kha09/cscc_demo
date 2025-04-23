/*
  Warnings:

  - You are about to drop the column `notes` on the `ControlAssignment` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ControlAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "correctiveActions" TEXT,
    "expectedComplianceDate" DATETIME,
    "complianceLevel" TEXT,
    CONSTRAINT "ControlAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ControlAssignment_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ControlAssignment_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ControlAssignment" ("assignedUserId", "complianceLevel", "controlId", "correctiveActions", "createdAt", "expectedComplianceDate", "id", "status", "taskId", "updatedAt") SELECT "assignedUserId", "complianceLevel", "controlId", "correctiveActions", "createdAt", "expectedComplianceDate", "id", "status", "taskId", "updatedAt" FROM "ControlAssignment";
DROP TABLE "ControlAssignment";
ALTER TABLE "new_ControlAssignment" RENAME TO "ControlAssignment";
CREATE INDEX "ControlAssignment_assignedUserId_idx" ON "ControlAssignment"("assignedUserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
