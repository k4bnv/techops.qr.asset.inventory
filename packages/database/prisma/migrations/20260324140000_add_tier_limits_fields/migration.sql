-- Add maxAssets and canInviteTeamMembers to TierLimit (standard tiers)
ALTER TABLE "TierLimit"
  ADD COLUMN IF NOT EXISTS "maxAssets"            INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "canInviteTeamMembers" BOOLEAN NOT NULL DEFAULT true;

-- Add maxAssets and canInviteTeamMembers to CustomTierLimit (per-user custom tier)
ALTER TABLE "CustomTierLimit"
  ADD COLUMN IF NOT EXISTS "maxAssets"            INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "canInviteTeamMembers" BOOLEAN NOT NULL DEFAULT true;
