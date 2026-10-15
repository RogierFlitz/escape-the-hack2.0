export const noraRecovery =
  "Meerdere bestanden zijn versleuteld. Ik heb een geïsoleerde herstelomgeving beschikbaar gemaakt. We moeten eerst de getroffen gegevens onderzoeken, vervolgens het herstelprotocol reconstrueren en pas daarna een betrouwbare back-up selecteren.";

export type VaultFile = {
  id: string;
  name: string;
  folder: string;
  version: string;
  modified: string;
  check: string;
  preview: string;
  readable: boolean;
};

export const vaultFiles: VaultFile[] = [
  {
    id: "planning",
    name: "planning-nexora-day.xlsx",
    folder: "Nexora Day",
    version: "v4",
    modified: "vandaag 02:18",
    check: "F4-19",
    preview: "8F 1C 90 A2 44 0B E7 19  6C 2A 91 00 C3 7E B1 4D",
    readable: false,
  },
  {
    id: "contract",
    name: "contract-helix.pdf",
    folder: "Leveranciers",
    version: "v3",
    modified: "vandaag 02:19",
    check: "F4-19",
    preview: "B7 02 6E AA 18 44 90 1F  00 7C E2 5B 19 80 44 C0",
    readable: false,
  },
  {
    id: "staff",
    name: "personeel-nexora.csv",
    folder: "Organisatie",
    version: "v6",
    modified: "vandaag 02:21",
    check: "F4-19",
    preview: "D1 90 44 2C 7A 01 88 E5  16 40 9B 2F 00 C4 71 3A",
    readable: false,
  },
  {
    id: "finance",
    name: "financieel-q1.xlsx",
    folder: "Administratie",
    version: "v2",
    modified: "vandaag 02:22",
    check: "F4-19",
    preview: "01 AA 67 4E 90 12 C8 3B  77 0D 52 19 E4 60 8C 2A",
    readable: false,
  },
  {
    id: "agenda",
    name: "agenda-nexora-day.ics",
    folder: "Nexora Day",
    version: "v5",
    modified: "vandaag 02:24",
    check: "F4-19",
    preview: "9C 30 1B 77 4A E0 25 68  0F 92 D4 11 6E 80 3C 5B",
    readable: false,
  },
  {
    id: "menu",
    name: "kantine-menu.pdf",
    folder: "Facilitair",
    version: "v1",
    modified: "vorige week",
    check: "A1-02",
    preview: "Soep, brood en koffie. Geen namen, geen planning, geen leverancier.",
    readable: true,
  },
  {
    id: "handbook",
    name: "herstelhandboek.txt",
    folder: "Noodkern",
    version: "v1",
    modified: "vorige maand",
    check: "A1-02",
    preview: "Kluiscycli: 4, 7, 11, 16. De rotatie komt uit het routetoken: het reknummer. De cassette schuift elk zegel één plek op. De laatste pagina ontbreekt.",
    readable: true,
  },
  {
    id: "contacts",
    name: "contact-helix.txt",
    folder: "Leveranciers",
    version: "v3",
    modified: "vorige week",
    check: "A1-02",
    preview: "Helix Events. Vloer en crew voor Nexora Day in de Dokzaal. Post: events@helix-events.nl.",
    readable: true,
  },
];

export const restoredBodies: Record<string, string> = {
  planning: "Nexora Day — Dokzaal\n07:30 crew call\n08:00 zaal open\nvloer en rigging: Helix Events\ngeen nachtelijke dokvrijgave",
  contract: "Contract HX-2026\nHelix Events levert vloer, rigging en crew.\nContact: events@helix-events.nl",
  staff: "Mara de Vries — operatie\nJ. Vale — nacht, pas 4418\nHelix-crew — begeleiding op het dok\nDe pasnummers van de crew staan in de toegangslog.",
  finance: "Q1 sluit op schema. Geen openstaande post naar een onbekend domein.",
  agenda: "Nexora Day\nLocatie: Dokzaal\nLeverancier vloer: Helix Events",
  access: "Dokzaal, crewpoort\n07:12  pas 4418   J. Vale        Nexora     binnen\n07:18  pas HX-19  Helix Events   crew       binnen\n07:40  pas 2201   Noordlicht     catering   geweigerd",
};

export const passes = [
  { id: "4418", label: "4418 · J. Vale · Nexora" },
  { id: "HX-19", label: "HX-19 · Helix Events · crew" },
  { id: "2201", label: "2201 · Noordlicht · geweigerd" },
];

export type BackupReport = {
  id: string;
  title: string;
  time: string;
  link: string;
  integrity: string;
  access: string;
  diff: string;
  check: string;
};

export const backupReports: BackupReport[] = [
  {
    id: "live-mirror",
    title: "Live Mirror",
    time: "Vandaag 09:40",
    link: "NEX, AUTH en VAULT op het productienetwerk",
    integrity: "Controlewaarde wijkt af van de catalogus van gisteren",
    access: "helix-svc las de kluis om 02:06",
    diff: "planning-nexora-day.xlsx is groter en eindigt op .locked",
    check: "Generatie 23",
  },
  {
    id: "kluis-nacht",
    title: "Nachtelijke Kluis",
    time: "Gisteren 03:10",
    link: "Alleen backup-svc, van VAULT naar LOG",
    integrity: "Komt overeen met de catalogus van vóór 02:00",
    access: "Geen sessie van buiten. Geen helix-svc",
    diff: "planning-nexora-day.xlsx is versie v3, dezelfde als de eerdere Helix-mail",
    check: "Generatie 22",
  },
  {
    id: "shared-recovery",
    title: "Shared Recovery",
    time: "Gisteren 03:12",
    link: "EDGE, met een deelkoppeling naar buiten",
    integrity: "De hash lijkt op generatie 22",
    access: "03:14 een kopie verstuurd naar planning@helix-event.co",
    diff: "Zelfde planning als de kluis, plus een extra deelregel",
    check: "Generatie 22",
  },
];

export const sections = [
  { id: "files", label: "Bestanden" },
  { id: "protocol", label: "Protocol" },
  { id: "copies", label: "Back-ups" },
  { id: "restore", label: "Herstel" },
];

export const restoreNames = [
  "planning-nexora-day.xlsx",
  "contract-helix.pdf",
  "personeel-nexora.csv",
  "financieel-q1.xlsx",
  "agenda-nexora-day.ics",
  "dok-toegang.log",
];
