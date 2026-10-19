export type Sector = "general" | "ministeries" | "gemeenten";

export const SECTORS: { id: Sector; label: string }[] = [
  { id: "general", label: "Algemeen" },
  { id: "ministeries", label: "Ministeries" },
  { id: "gemeenten", label: "Gemeenten" },
];

export const SECTOR_PLAN: Record<Sector, string> = {
  general: "Algemeen. Het doelwit is het fictieve bedrijf Nexora Technologies.",
  ministeries: "Ministeries. Het doelwit is het fictieve Ministerie van Verbindingen. Dezelfde puzzels en antwoorden. Helix en de Dokzaal blijven de leverancier en de locatie.",
  gemeenten: "Gemeenten. Het doelwit is de fictieve Gemeente Havenstad. Dezelfde puzzels en antwoorden. Helix en de Dokzaal blijven de leverancier en de locatie.",
};

export function parseSector(value: unknown): Sector {
  if (value === "ministeries" || value === "gemeenten" || value === "general") return value;
  return "general";
}

const SWAPS: Record<Exclude<Sector, "general">, [string, string][]> = {
  ministeries: [
    ["nexora.internal", "ministerie.internal"],
    ["recon-nexora.zip", "recon-ministerie.zip"],
    ["planning-nexora-day.xlsx", "planning-departementsdag.xlsx"],
    ["Nexora_Day_Planning.exe", "Departementsdag_Planning.exe"],
    ["NEXORA TECHNOLOGIES", "MINISTERIE VAN VERBINDINGEN"],
    ["Nexora Technologies", "Ministerie van Verbindingen"],
    ["Nexora Day", "Departementsdag"],
    ["Nexora Netwerk", "Ministerienetwerk"],
    ["Nexora Chat", "Ministeriechat"],
    ["Nexora Social", "Ministerie Sociaal"],
    ["Nexora-badge", "ministeriepas"],
    ["Nexora-account", "ministerie-account"],
    ["buiten Nexora", "buiten het ministerie"],
    ["bij Nexora", "bij het ministerie"],
    ["van Nexora", "van het ministerie"],
    ["over Nexora", "over het ministerie"],
    ["NEXORA", "MINISTERIE"],
    ["Nexora", "Ministerie"],
  ],
  gemeenten: [
    ["nexora.internal", "havenstad.internal"],
    ["recon-nexora.zip", "recon-gemeente.zip"],
    ["planning-nexora-day.xlsx", "planning-gemeentedag.xlsx"],
    ["Nexora_Day_Planning.exe", "Gemeentedag_Planning.exe"],
    ["NEXORA TECHNOLOGIES", "GEMEENTE HAVENSTAD"],
    ["Nexora Technologies", "Gemeente Havenstad"],
    ["Nexora Day", "Gemeentedag"],
    ["Nexora Netwerk", "Gemeentenetwerk"],
    ["Nexora Chat", "Gemeentechat"],
    ["Nexora Social", "Gemeente Sociaal"],
    ["Nexora-badge", "gemeentepas"],
    ["Nexora-account", "gemeente-account"],
    ["buiten Nexora", "buiten de gemeente"],
    ["bij Nexora", "bij de gemeente"],
    ["van Nexora", "van de gemeente"],
    ["over Nexora", "over de gemeente"],
    ["NEXORA", "GEMEENTE"],
    ["Nexora", "Gemeente"],
  ],
};

export function sectorLine(sector: Sector) {
  if (sector === "ministeries") return "Jullie ministerie is het doelwit: Ministerie van Verbindingen.";
  if (sector === "gemeenten") return "Jullie gemeente is het doelwit: Gemeente Havenstad.";
  return "Het doelwit is het bedrijf Nexora Technologies.";
}

export function asSector(sector: Sector, text: string) {
  if (sector === "general" || !text) return text;
  return SWAPS[sector].reduce((line, [from, to]) => line.replaceAll(from, to), text);
}
