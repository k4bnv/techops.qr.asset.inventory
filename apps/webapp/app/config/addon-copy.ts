/**
 * Centralised copy for add-on descriptions and feature lists.
 * Every UI surface (banners, modals, onboarding, emails) should
 * import from here so the wording stays consistent.
 */

export const BARCODE_ADDON = {
  label: "Alternatieve Barcodes",

  /** One-liner used in cards, banners, and onboarding toggles */
  description:
    "Genereer nieuwe barcodes of gebruik uw bestaande. Ondersteunt Code128, Code39, EAN-13, DataMatrix & QR-codes — ideaal voor migraties.",

  /** Shorter subtitle for modal headers */
  subtitle:
    "Voeg ondersteuning voor industriestandaard barcodeformaten toe aan uw workspace.",

  /** Non-owner banner — tells the user to contact the owner */
  nonOwnerDescription:
    "Genereer nieuwe barcodes of gebruik uw bestaande. Ondersteunt Code128, Code39, EAN-13, DataMatrix & QR-codes — ideaal voor migraties. Neem contact op met de eigenaar van de workspace om deze functie in te schakelen.",

  /** Bullet-point features for modals and emails */
  features: [
    "Ondersteunt Code128, Code39, EAN-13, DataMatrix & QR-codes",
    "Genereer nieuwe barcodelabels of gebruik uw bestaande",
    "Print barcodelabels voor uw assets",
    "Ingebouwde barcodescanner voor snel opzoeken van assets",
  ],
} as const;

export const AUDIT_ADDON = {
  label: "Audits",

  /** One-liner used in cards, banners, and onboarding toggles */
  description:
    "Maak audits aan, wijs auditors toe, scan QR-codes en volg assetverificatie in realtime.",

  /** Shorter subtitle for modal/page headers */
  subtitle: "Voeg krachtige auditmogelijkheden toe aan uw workspace.",

  /** Non-owner message on the unlock page */
  nonOwnerDescription:
    "Neem contact op met de eigenaar van de workspace om de Audits add-on in te schakelen voor uw organisatie.",

  /** Bullet-point features for modals, unlock page, and emails */
  features: [
    "Maak audits aan en wijs auditors toe om uw assets te verifiëren",
    "Stel vervaldatums in en volg de voortgang in realtime",
    "Gebruik QR-codescanning voor snelle assetverificatie",
    "Genereer gedetailleerde auditrapporten",
  ],
} as const;
