-- CreateEnum
CREATE TYPE "RepairStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable: add repairsEnabled to Organization
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "repairsEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Repair" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "RepairStatus" NOT NULL DEFAULT 'PLANNED',
    "cost" DECIMAL(65,30),
    "timeSpentHours" DOUBLE PRECISION,
    "partsUsed" TEXT,
    "assetId" TEXT NOT NULL,
    "performedById" TEXT,
    "organizationId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Repair_assetId_idx" ON "Repair"("assetId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Repair_organizationId_idx" ON "Repair"("organizationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Repair_performedById_idx" ON "Repair"("performedById");

-- AddForeignKey
ALTER TABLE "Repair" ADD CONSTRAINT "Repair_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repair" ADD CONSTRAINT "Repair_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repair" ADD CONSTRAINT "Repair_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
