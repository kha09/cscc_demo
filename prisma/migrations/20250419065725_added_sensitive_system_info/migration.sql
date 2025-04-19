-- CreateTable
CREATE TABLE "SensitiveSystemInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SensitiveSystemInfo_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SensitiveSystemInfo_assessmentId_idx" ON "SensitiveSystemInfo"("assessmentId");
