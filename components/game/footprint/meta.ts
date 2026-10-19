import type { Source } from "@/lib/game/footprint";

export type Pin = { id: string; claim: string };
export type FilterId = "all" | Source["kind"];
export type DeskMode = "sources" | "board";

export const filters: { id: FilterId; label: string }[] = [
  { id: "all", label: "Alles" },
  { id: "nieuws", label: "Nieuws" },
  { id: "post", label: "Social" },
  { id: "bedrijf", label: "Bedrijf" },
  { id: "profiel", label: "Personen" },
  { id: "foto", label: "Evenement" },
  { id: "partner", label: "Partner" },
];

export const typeLabel: Record<Source["kind"], string> = {
  nieuws: "Nieuwsartikel",
  post: "Social",
  bedrijf: "Bedrijfsbericht",
  profiel: "Medewerker",
  foto: "Evenement",
  partner: "Partner",
};

/** Only pictures that illustrate a fact already present in that source. */
export const sourcePhoto: Record<string, string> = {
  "dock-shot": "/osint/dock.jpg",
  "run-post": "/osint/park.jpg",
  "pass-post": "/osint/pass.jpg",
  "berg-vrij": "/news/mountains.jpg",
  "mara-lead": "/mara-briefing.jpg",
  "helix-card": "/m2/helix.jpg",
  "helix-floor": "/m2/helix.jpg",
  "news-week": "/news/nexora-day.jpg",
  "coffee-post": "/news/coffee.jpg",
  "quarter-post": "/news/charts.jpg",
};

export function initials(name: string) {
  const parts = name.split(/\s+/).filter((part) => /[A-Za-z]/.test(part));
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function readLabel(id: string, seen: string[], pins: Pin[]) {
  if (pins.some((pin) => pin.id === id)) return "Gekoppeld";
  if (seen.includes(id)) return "Bekeken";
  return "Nog niet bekeken";
}
