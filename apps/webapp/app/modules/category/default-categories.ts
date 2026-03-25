import type { Category } from "@prisma/client";

export const defaultUserCategories: Pick<
  Category,
  "name" | "description" | "color"
>[] = [
  {
    name: "Kantoorartikelen",
    description:
      "Artikelen die worden gebruikt voor kantoorwerk, zoals computers, printers, scanners, telefoons, enz.",
    color: "#ab339f",
  },
  {
    name: "Kabels",
    description:
      "Draden die apparaten verbinden of signalen verzenden, zoals netsnoeren, ethernetkabels, HDMI-kabels, enz.",
    color: "#0dec5d",
  },
  {
    name: "Machines",
    description:
      "Apparatuur die mechanische taken uitvoert, zoals boren, zagen, draaibank, enz.",
    color: "#efa578",
  },
  {
    name: "Voorraad",
    description:
      "Goederen die door een bedrijf worden opgeslagen of verkocht, zoals grondstoffen, eindproducten, reserveonderdelen, enz.",
    color: "#376dd8",
  },
  {
    name: "Meubilair",
    description:
      "Artikelen die worden gebruikt om te zitten, werken of dingen op te bergen, zoals stoelen, bureaus, planken, kasten, enz.",
    color: "#88a59e",
  },
  {
    name: "Benodigdheden",
    description:
      "Artikelen die worden verbruikt of opgebruikt in een proces, zoals papier, inkt, pennen, gereedschap, enz.",
    color: "#acbf01",
  },
  {
    name: "Overig",
    description: "Alle andere items die niet in de bovenstaande categorieën passen.",
    color: "#48ecfc",
  },
];
