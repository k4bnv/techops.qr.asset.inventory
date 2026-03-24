-- CreateTable: site-wide admin configuration key/value store
CREATE TABLE "SiteConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteConfig_key_key" ON "SiteConfig"("key");

-- Seed default nav settings so the row exists on first use
INSERT INTO "SiteConfig" ("id", "key", "value", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'navSettings',
  '{
    "home":              {"visible": true,  "customUrl": null},
    "assets":            {"visible": true,  "customUrl": null},
    "kits":              {"visible": true,  "customUrl": null},
    "categories":        {"visible": true,  "customUrl": null},
    "tags":              {"visible": true,  "customUrl": null},
    "locations":         {"visible": true,  "customUrl": null},
    "audits":            {"visible": true,  "customUrl": null},
    "bookings":          {"visible": true,  "customUrl": null},
    "reminders":         {"visible": true,  "customUrl": null},
    "team":              {"visible": true,  "customUrl": null},
    "workspaceSettings": {"visible": true,  "customUrl": null},
    "scanner":           {"visible": true,  "customUrl": null}
  }',
  NOW()
);
