/**
 * Shared constants used across the app and the seed script.
 * Keep this file framework-agnostic (no next/* imports) so it can be
 * imported from /scripts/seed.ts.
 */

export const NEIGHBORHOODS = [
  "Westlands",
  "Kilimani",
  "Karen",
  "Lavington",
  "Runda",
  "Gigiri",
  "Parklands",
  "Kileleshwa",
  "Lang'ata",
  "Muthaiga",
] as const;

export type Neighborhood = (typeof NEIGHBORHOODS)[number];

export const CATEGORIES = [
  "driver",
  "house_help",
  "cook",
  "security",
  "nanny",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS_EN: Record<Category, string> = {
  driver: "Driver",
  house_help: "House Help",
  cook: "Cook",
  security: "Security",
  nanny: "Nanny",
};

export const CATEGORY_LABELS_SW: Record<Category, string> = {
  driver: "Dereva",
  house_help: "Msaidizi wa Nyumbani",
  cook: "Mpishi",
  security: "Mlinzi",
  nanny: "Yaya",
};

export const LANGUAGES = [
  "English",
  "Swahili",
  "Kikuyu",
  "Luo",
  "Kamba",
  "Luhya",
  "Kalenjin",
  "Meru",
] as const;

export type Language = (typeof LANGUAGES)[number];

export const SORT_OPTIONS = ["rating", "experience", "pay_asc"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
