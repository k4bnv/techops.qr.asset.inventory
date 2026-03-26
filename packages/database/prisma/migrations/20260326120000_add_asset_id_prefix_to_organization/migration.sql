-- Add assetIdPrefix column to Organization table
-- This allows each organization to customize the prefix for their asset sequential IDs (e.g. SAM-0001, AST-0001)
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "assetIdPrefix" TEXT NOT NULL DEFAULT 'SAM';
