-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mainComponent" TEXT NOT NULL,
    "subComponent" TEXT,
    "controlType" TEXT NOT NULL,
    "controlNumber" TEXT NOT NULL,
    "controlText" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Control_controlNumber_key" ON "Control"("controlNumber");
