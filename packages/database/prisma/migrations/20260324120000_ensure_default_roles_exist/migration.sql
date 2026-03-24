-- Ensure default user roles exist using gen_random_uuid() (no uuid-ossp extension needed)
-- This fixes deployments where the previous migration (20240422181938_create_default_user_roles)
-- failed silently because uuid_generate_v4() requires the uuid-ossp extension which may not
-- be enabled in self-hosted Supabase/PostgreSQL instances.

INSERT INTO "Role" ("id", "name", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'USER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Role" WHERE "name" = 'USER');

INSERT INTO "Role" ("id", "name", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, 'ADMIN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Role" WHERE "name" = 'ADMIN');
