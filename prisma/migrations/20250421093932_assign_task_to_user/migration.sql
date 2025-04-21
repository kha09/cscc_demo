/*
  Warnings:

  - You are about to drop the column `departmentId` on the `Task` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sensitiveSystemId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    CONSTRAINT "Task_sensitiveSystemId_fkey" FOREIGN KEY ("sensitiveSystemId") REFERENCES "SensitiveSystemInfo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("assignedById", "createdAt", "deadline", "id", "sensitiveSystemId", "status", "updatedAt") SELECT "assignedById", "createdAt", "deadline", "id", "sensitiveSystemId", "status", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_sensitiveSystemId_idx" ON "Task"("sensitiveSystemId");
CREATE INDEX "Task_assignedById_idx" ON "Task"("assignedById");
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
