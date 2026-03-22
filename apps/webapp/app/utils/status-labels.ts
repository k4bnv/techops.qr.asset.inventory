import { AssetStatus, BookingStatus, KitStatus } from "@prisma/client";

export const bookingStatusDutchMap: Record<BookingStatus, string> = {
  DRAFT: "Concept",
  RESERVED: "Gereserveerd",
  ONGOING: "Lopend",
  OVERDUE: "Te laat",
  COMPLETE: "Voltooid",
  ARCHIVED: "Gearchiveerd",
  CANCELLED: "Geannuleerd",
};

export const assetStatusDutchMap: Record<AssetStatus, string> = {
  AVAILABLE: "Beschikbaar",
  IN_CUSTODY: "In beheer",
  CHECKED_OUT: "Uitgeleend",
};

export const kitStatusDutchMap: Record<KitStatus, string> = {
  AVAILABLE: "Beschikbaar",
  IN_CUSTODY: "In beheer",
  CHECKED_OUT: "Uitgeleend",
};
