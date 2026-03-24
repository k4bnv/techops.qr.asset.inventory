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
