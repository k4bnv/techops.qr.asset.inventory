import { db } from "~/database/db.server";

export type NavItemKey =
  | "home"
  | "assets"
  | "kits"
  | "categories"
  | "tags"
  | "locations"
  | "audits"
  | "bookings"
  | "reminders"
  | "team"
  | "workspaceSettings"
  | "scanner";

export type NavItemSetting = {
  visible: boolean;
  customUrl: string | null;
};

export type NavSettings = Record<NavItemKey, NavItemSetting>;

export const NAV_ITEM_LABELS: Record<NavItemKey, string> = {
  home: "Startpagina",
  assets: "Assets",
  kits: "Kits",
  categories: "Categorieën",
  tags: "Tags",
  locations: "Locaties",
  audits: "Audits",
  bookings: "Reserveringen",
  reminders: "Herinneringen",
  team: "Team",
  workspaceSettings: "Werkruimte-instellingen",
  scanner: "QR Scanner",
};

export const NAV_ITEM_KEYS: NavItemKey[] = [
  "home",
  "assets",
  "kits",
  "categories",
  "tags",
  "locations",
  "audits",
  "bookings",
  "reminders",
  "team",
  "workspaceSettings",
  "scanner",
];

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
  scanner: { visible: true, customUrl: null },
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
