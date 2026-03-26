-- Add passwordHash column to User table for standalone PostgreSQL auth (migrated from Supabase)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
