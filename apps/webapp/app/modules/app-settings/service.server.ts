import { db } from "~/database/db.server";
import { NAV_ITEM_KEYS, type NavItemKey, type NavSettings } from "./constants";

export type { NavItemKey, NavSettings } from "./constants";

const defaultNavSettings: NavSettings = {
  home: { visible: true, customUrl: null },
  assets: { visible: true, customUrl: null },
  kits: { visible: true, customUrl: null },
  categories: { visible: true, customUrl: null },
  tags: { visible: true, customUrl: null },
  locations: { visible: true, customUrl: null },
  audits: { visible: true, customUrl: null },
  bookings: { visible: true, customUrl: null },
  reminders: { visible: true, customUrl: null },
  team: { visible: true, customUrl: null },
  workspaceSettings: { visible: true, customUrl: null },
  repairs: { visible: true, customUrl: null },
  scanner: { visible: true, customUrl: null },
  feedback: { visible: true, customUrl: null },
  support: { visible: false, customUrl: null },
};

export async function getNavSettings(): Promise<NavSettings> {
  try {
    const config = await db.siteConfig.findUnique({
      where: { key: "navSettings" },
    });

    if (!config) return defaultNavSettings;

    const stored = config.value as Partial<NavSettings>;
    const merged: NavSettings = { ...defaultNavSettings };

    for (const key of NAV_ITEM_KEYS) {
      if (stored[key]) {
        merged[key] = { ...defaultNavSettings[key], ...stored[key] };
      }
    }

    return merged;
  } catch {
    return defaultNavSettings;
  }
}

export async function updateNavSettings(settings: NavSettings): Promise<void> {
  await db.siteConfig.upsert({
    where: { key: "navSettings" },
    update: { value: settings as object },
    create: {
      key: "navSettings",
      value: settings as object,
    },
  });
}
