import type { PlayFile } from "../types";

export const chapters = [
  {
    id: 1,
    title: "Digital Footprint",
    subtitle: "Wat hij openbaar vond",
    puzzles: ["ch1-bays", "ch1-login", "ch1-nodes", "ch1-ports"],
  },
  {
    id: 2,
    title: "The Fake Supplier",
    subtitle: "De valse leverancier",
    puzzles: ["ch2-acrostic", "ch2-meta", "ch2-timeline", "ch2-trace"],
  },
  {
    id: 3,
    title: "Network Lockdown",
    subtitle: "Isoleer de verbinding",
    puzzles: ["ch3-logic", "ch3-path", "ch3-boot", "ch3-cables"],
  },
  {
    id: 4,
    title: "Encryption Protocol",
    subtitle: "Haal de bestanden terug",
    puzzles: ["ch4-symbols", "ch4-sequence", "ch4-rotor", "ch4-backup", "ch4-decode"],
  },
  {
    id: 5,
    title: "The Insider",
    subtitle: "Hoe kwam het naar buiten",
    puzzles: ["ch5-camera", "ch5-places", "ch5-share", "ch5-accuse"],
  },
  {
    id: 6,
    title: "Final Shutdown",
    subtitle: "Sluit de laatste deur",
    puzzles: ["ch6-seals", "ch6-shutdown"],
  },
] as const;

export const puzzles: { id: string; chapterId: number; title: string; brief: string; bridge: string }[] = [
  { id: "ch1-bays", chapterId: 1, title: "Wat wist KADE?", brief: "Onderzoek de openbare bronnen en leg per bron vast welk verband hij ermee kon leggen.", bridge: "" },
  { id: "ch1-login", chapterId: 1, title: "De foto", brief: "Vergroot de voorbereidingsfoto en markeer wat hij eruit kon halen.", bridge: "" },
  { id: "ch1-nodes", chapterId: 1, title: "Onderzoeksbord", brief: "Koppel de bewijsstukken aan de vragen op het bord.", bridge: "" },
  { id: "ch1-ports", chapterId: 1, title: "recon-nexora.zip", brief: "Reconstrueer wat KADE wist voordat hij een leveranciersnaam gebruikte.", bridge: "" },
  { id: "ch2-acrostic", chapterId: 2, title: "De afzender", brief: "Wijs het bericht aan dat niet van Helix Events komt, en onderbouw dat met minstens twee bronnen.", bridge: "" },
  { id: "ch2-meta", chapterId: 2, title: "De bijlage", brief: "Vergelijk de bijlage met de eerdere planning en markeer wat het bestand riskant maakte.", bridge: "" },
  { id: "ch2-timeline", chapterId: 2, title: "De nachtlog", brief: "Zet de voorbereiding van die nacht op volgorde. De tijden staan in de log.", bridge: "" },
  { id: "ch2-trace", chapterId: 2, title: "Het exportspoor", brief: "Bevestig welke export het dok verliet, met de log en de bijlage.", bridge: "" },
  { id: "ch3-logic", chapterId: 3, title: "De sessie", brief: "Vergelijk de verkeerslog en markeer de sessie die afwijkt, met minstens twee aanwijzingen.", bridge: "" },
  { id: "ch3-path", chapterId: 3, title: "De route", brief: "Zet op de kaart de sprongen die in de authenticatielog staan.", bridge: "" },
  { id: "ch3-boot", chapterId: 3, title: "Isoleren", brief: "Isoleer de sessie tijdelijk zonder de log of de kluis kwijt te raken.", bridge: "" },
  { id: "ch3-cables", chapterId: 3, title: "Herstel", brief: "Zet de veilige verbindingen terug via de patchkast en start de systemen in de juiste volgorde.", bridge: "" },
  { id: "ch4-symbols", chapterId: 4, title: "Getroffen bestanden", brief: "Open de kluis en markeer wat niet meer leesbaar is.", bridge: "" },
  { id: "ch4-sequence", chapterId: 4, title: "Controlewaarde", brief: "Zet de volgende kluiscyclus uit het herstelhandboek.", bridge: "" },
  { id: "ch4-rotor", chapterId: 4, title: "Herstelzegel", brief: "Zet de rotor op het rek uit de route en maak het cassettezegel af.", bridge: "" },
  { id: "ch4-backup", chapterId: 4, title: "Back-up", brief: "Vergelijk de drie kopieën en kies welke je durft terug te zetten.", bridge: "" },
  { id: "ch4-decode", chapterId: 4, title: "Terugzetten", brief: "Zet de schone set terug, controleer de bestanden en lees de toegangslog.", bridge: "" },
  { id: "ch5-camera", chapterId: 5, title: "Camerabeelden", brief: "Bewaar de fragmenten waarop iemand of een pas op een plek staat.", bridge: "" },
  { id: "ch5-places", chapterId: 5, title: "Waar was wie", brief: "Leg de beelden naast de pasregistratie en de verklaringen.", bridge: "" },
  { id: "ch5-share", chapterId: 5, title: "Het document", brief: "Zoek hoe de planning buiten Nexora leesbaar werd.", bridge: "" },
  { id: "ch5-accuse", chapterId: 5, title: "Incidentrapport", brief: "Stel de conclusie samen uit persoon, document, oorzaak en bewijs.", bridge: "" },
  { id: "ch6-seals", chapterId: 6, title: "Vastzetten", brief: "Leg de tokens op de systemen die daarbij passen.", bridge: "" },
  { id: "ch6-shutdown", chapterId: 6, title: "Afsluiten", brief: "Zet de vondsten op volgorde en bevestig de afsluiting.", bridge: "" },
];

/** Wat het team moet doen, zonder het antwoord. De actieregel noemt alleen de handeling. */
export const puzzleCues: Record<string, { text: string; action: string }> = {
  "ch1-bays": {
    text: "Open links een bron en koppel die aan een vraag. Ga daarna naar Onderzoeksbord en druk op Verbanden indienen.",
    action: "Koppel, daarna indienen",
  },
  "ch1-login": {
    text: "Vergroot de foto en tik de plekken aan waar iets leesbaars staat. Lege plekken laat je open. Druk daarna op Details vastleggen.",
    action: "Markeer, daarna vastleggen",
  },
  "ch1-nodes": {
    text: "Kies een bewijsstuk en koppel het aan de vraag waar het bij hoort. Druk daarna op Bord controleren.",
    action: "Koppel, daarna controleren",
  },
  "ch1-ports": {
    text: "Kies rechts het evenement, de naam die hij kon gebruiken, en wat hij daarmee kon doen. Druk daarna op Reconstructie vastleggen.",
    action: "Kies, daarna vastleggen",
  },
  "ch2-acrostic": {
    text: "Wijs het bericht aan dat niet klopt en kies minstens twee bronnen die dat ondersteunen. Druk daarna op Conclusie vastleggen.",
    action: "Wijs aan, daarna vastleggen",
  },
  "ch2-meta": {
    text: "Vergelijk de bijlage met de eerdere planning en markeer wat het bestand riskant maakte. Druk daarna op Verschillen vastleggen.",
    action: "Vergelijk, daarna vastleggen",
  },
  "ch2-timeline": {
    text: "Zet de kaarten in de volgorde van die nacht. De tijden staan in de log. Druk daarna op Keten vastleggen.",
    action: "Zet in volgorde, daarna vastleggen",
  },
  "ch2-trace": {
    text: "Kies de export die het dok verliet en minstens twee bronnen die dat ondersteunen. Druk daarna op Spoor bevestigen.",
    action: "Kies, daarna bevestigen",
  },
  "ch3-logic": {
    text: "Kies de sessie die afwijkt en minstens twee aanwijzingen. Druk daarna op Conclusie vastleggen.",
    action: "Kies, daarna vastleggen",
  },
  "ch3-path": {
    text: "Tik de sprongen aan vanaf het werkstation naar de kluis. Alleen lijnen die op de kaart staan. Druk daarna op Route vastleggen.",
    action: "Teken de route, daarna vastleggen",
  },
  "ch3-boot": {
    text: "Kies de tijdelijke isolatie. De log en de kluis moeten blijven. Druk daarna op Maatregelen uitvoeren.",
    action: "Kies, daarna uitvoeren",
  },
  "ch3-cables": {
    text: "Koppel elke kabel in de patchkast en zet daarna de systemen in de startvolgorde. Druk op Verbindingen herstellen.",
    action: "Koppel, daarna herstellen",
  },
  "ch4-symbols": {
    text: "Open de bestanden en markeer wat niet meer leesbaar is. Druk daarna op Schade vastleggen.",
    action: "Markeer, daarna vastleggen",
  },
  "ch4-sequence": {
    text: "Lees het patroon in het herstelhandboek en vul de volgende controlewaarde in. Druk daarna op Controle vastzetten.",
    action: "Vul in, daarna vastzetten",
  },
  "ch4-rotor": {
    text: "Zet de rotor met een token dat je al hebt en maak de vorm van de cassette af. Druk daarna op Protocol bevestigen.",
    action: "Zet, daarna bevestigen",
  },
  "ch4-backup": {
    text: "Vergelijk de drie kopieën en kies er één. Druk daarna op Deze kopie gebruiken.",
    action: "Vergelijk, daarna kiezen",
  },
  "ch4-decode": {
    text: "Kies het controlepunt, open het doklogboek en kies de pas van de leverancier. Druk daarna op Spoor vastleggen.",
    action: "Kies, daarna vastleggen",
  },
  "ch5-camera": {
    text: "Bewaar de stills waarop een persoon of een pas te zien is. Lege beelden laat je liggen. Druk daarna op Beelden vastleggen.",
    action: "Bewaar, daarna vastleggen",
  },
  "ch5-places": {
    text: "Rechts koppel je elke persoon aan één plek. Tik de plek aan, die licht op. De regels daarvoor staan links bij Tijdlijn en Dossiers. Daarna kies je of pas 4418 en het beeld van 02:31 hetzelfde laten zien. Druk daarna op Plekken vastleggen.",
    action: "Tik een plek, daarna vastleggen",
  },
  "ch5-share": {
    text: "Wijs de wijziging, de opening en het bijbehorende bericht aan. Druk daarna op Delen vastleggen.",
    action: "Wijs aan, daarna vastleggen",
  },
  "ch5-accuse": {
    text: "Vul wie, welk document, de oorzaak, de bedoeling en het bewijs van een gedeeld bestand in. Een camera alleen is niet genoeg. Druk daarna op Rapport vastleggen.",
    action: "Vul in, daarna vastleggen",
  },
  access: {
    text: "Kies een sessie en minstens twee aanwijzingen die laten zien wat die sessie deed. Druk daarna op Sessie vastleggen.",
    action: "Kies, daarna vastleggen",
  },
  revoke: {
    text: "Bevestig dat je de gekozen sessie wilt sluiten. Druk daarna op Lijn verbreken.",
    action: "Bevestig, daarna verbreken",
  },
  seals: {
    text: "Leg de tokens die je al hebt op de systemen die daarbij passen. Druk daarna op Systemen vastzetten.",
    action: "Koppel, daarna vastzetten",
  },
  "backup-check": {
    text: "Vink alleen af wat bij een schone set hoort. Druk daarna op Controle vastleggen.",
    action: "Vink af, daarna vastleggen",
  },
  shutdown: {
    text: "Zet de vondsten in de volgorde waarin je de tokens vond. Druk daarna op Bevestig afsluiten.",
    action: "Zet in volgorde, daarna afsluiten",
  },
};

export const PUZZLE_IDS = puzzles.map((puzzle) => puzzle.id);

export const bays = [
  { n: 1, tag: null },
  { n: 2, tag: "N7" },
  { n: 3, tag: null },
  { n: 4, tag: "41" },
  { n: 5, tag: null },
  { n: 6, tag: null },
  { n: 7, tag: null },
  { n: 8, tag: null },
  { n: 9, tag: "92" },
];

export const services = [
  { id: "VAULT", port: 9443 },
  { id: "ICMP", port: 1 },
  { id: "TLS", port: 443 },
  { id: "SSH", port: 22 },
  { id: "DNS", port: 53 },
];

export const mailLines = [
  { lead: "D", rest: "ossier nachtdienst is gekopieerd." },
  { lead: "O", rest: "nder het dok ligt de export." },
  { lead: "C", rest: "ontroleer locker 12 voor de badge." },
  { lead: "K", rest: "luislog bewaart het tijdstip." },
];

export const mailDecoys = ["nacht", "export", "locker", "tijdstip"];

export const metaChoices = {
  scan: ["DOCK-198", "DOCK-244"],
  log: ["CORE-011", "DOCK-244"],
};

export const timelineCards = [
  { id: "phish", title: "Phishingmail geopend", detail: "workstation-14" },
  { id: "export", title: "Exportjob weggeschreven", detail: "export-node" },
  { id: "dock", title: "Badge op het dok", detail: "dock-gate" },
];

export const network = {
  nodes: [
    { id: "CRU", label: "NEX", x: 8, y: 48, bad: false },
    { id: "EDGE", label: "EDGE", x: 28, y: 26, bad: false },
    { id: "HONEYPOT", label: "HONEY", x: 28, y: 74, bad: true },
    { id: "DNS", label: "DNS", x: 50, y: 16, bad: false },
    { id: "PROXY", label: "PROXY", x: 50, y: 52, bad: false },
    { id: "AUTH", label: "AUTH", x: 72, y: 22, bad: false },
    { id: "LOG", label: "LOG", x: 72, y: 72, bad: true },
    { id: "VAULT", label: "VAULT", x: 90, y: 42, bad: false },
  ],
  edges: [
    ["CRU", "EDGE"],
    ["CRU", "HONEYPOT"],
    ["EDGE", "DNS"],
    ["EDGE", "PROXY"],
    ["DNS", "AUTH"],
    ["PROXY", "LOG"],
    ["PROXY", "HONEYPOT"],
    ["AUTH", "VAULT"],
    ["LOG", "VAULT"],
  ] as [string, string][],
};

export const cables = [
  { id: "DNS", label: "DNS", tone: "cyan" },
  { id: "AUTH", label: "AUTH", tone: "mint" },
  { id: "LOG", label: "LOG", tone: "amber" },
  { id: "TRAP", label: "TRAP", tone: "danger" },
];

export const ports = [
  { id: "53", label: "poort 53" },
  { id: "443", label: "poort 443" },
  { id: "514", label: "poort 514" },
  { id: "PARK", label: "PARK" },
];

export const bootServers = [
  { id: "VAULT", label: "VAULT", need: "wacht op AUTH" },
  { id: "DNS", label: "DNS", need: "geen afhankelijkheid" },
  { id: "AUTH", label: "AUTH", need: "wacht op DNS" },
];

export const cipherText = "ZLHS";

export const beacons = [4, 7, 11, 16];

export const symbolRows = [
  ["diamond", "square", "circle"],
  ["square", "circle", "diamond"],
  ["circle", "diamond", null],
];

export const symbolPalette = ["diamond", "square", "circle", "triangle"];

export const helixLegend = [
  { symbol: "△", value: "H" },
  { symbol: "□", value: "X" },
  { symbol: "○", value: "1" },
  { symbol: "◇", value: "?" },
];

export const helixMessage = ["△", "□", "○", "◇"];

export const cameras = [
  { id: "cafe", time: "02:10", place: "Kantine", note: "Vale zit aan tafel. Badge 4418 ligt naast het blad." },
  { id: "dock", time: "02:31", place: "Dok", note: "Figuur bij de deur. Schouderdraagt het merk HELIX." },
  { id: "rack", time: "02:40", place: "Rek 7", note: "Monteur met onderhoudspas. Paneel van rek 7 staat open." },
  { id: "office", time: "02:50", place: "Analyse", note: "Crowe typt een rapport. Geen jas, geen dok." },
];

export const suspects = [
  { id: "vale", name: "J. Vale", role: "Operator nacht" },
  { id: "crowe", name: "L. Crowe", role: "Analist" },
  { id: "okonkwo", name: "M. Okonkwo", role: "Netwerk" },
  { id: "adler", name: "S. Adler", role: "Helix, events" },
];

export const evidence = [
  { id: "crowe-report", label: "Crowe schreef het rapport" },
  { id: "okonkwo-ticket", label: "Okonkwo had een onderhoudsticket" },
  { id: "cam-dock", label: "Dok-camera toont een Helix-jack" },
  { id: "chat-key", label: "Chat: key is live" },
  { id: "badge-cafe", label: "Vale's badge ligt in de kantine" },
];

export const sealSlots = [
  { id: "perimeter", title: "Perimeter", ask: "De rand van het netwerk." },
  { id: "trace", title: "Trace", ask: "Het exportspoor." },
  { id: "lockout", title: "Lockout", ask: "Het slot op de leverancierslijn." },
];

export const shutdownSlots = [
  { id: "override", title: "Onderzoek", ask: "Eerste vondst" },
  { id: "forensic", title: "Export", ask: "Spoor uit de nacht" },
  { id: "route", title: "Route", ask: "Schone route" },
  { id: "contractor", title: "Leverancier", ask: "Code van de crew" },
];

export const files: PlayFile[] = [
  {
    id: "boot",
    name: "boot.log",
    kind: "log",
    chapter: 1,
    body: "NEXORA noodkern\nKADE bekeek openbare bronnen vóór de aanval.\nHet archief in deze omgeving is een kopie van wat hij opende.\nNiet elke bron hoort bij zijn voorbereiding.",
  },
  {
    id: "nachtmail",
    name: "01-nachtmail.eml",
    kind: "mail",
    chapter: 2,
    body: "Van: planning@helix-event.co\nAan: events@nexora.internal\nOnderwerp: Bijgewerkte planning voor het dok\n\nHelix Events. De planning voor Nexora Day in de Dokzaal is bijgewerkt. De bijlage hoort bij het nachtelijke venster.",
  },
  {
    id: "facilitair",
    name: "02-facilitair.eml",
    kind: "mail",
    chapter: 2,
    body: "Van: facilitair@nexora.internal\nOnderwerp: kantine verdieping 3\n\nDe kantine blijft open tijdens Nexora Day. De nachtploeg kan daar koffie halen.",
  },
  {
    id: "crowe-mail",
    name: "03-crowe.eml",
    kind: "mail",
    chapter: 2,
    body: "Van: l.crowe@nexora.internal\n\nIk spiegel de export zodat het dossier een kopie heeft. Ik was niet op het dok. Mijn naam op de metadata komt van die spiegel.",
  },
  {
    id: "access",
    name: "access.csv",
    kind: "log",
    chapter: 2,
    body: "Nachtlog, vastgelegd vóór de aanval die het kantoor overdag zag.\n02:14  workstation-14  mail-open   j.vale\n02:31  dock-gate        badge-4418  j.vale\n02:40  rack-7           maint       m.okonkwo\n02:51  analyst-3        report      l.crowe",
  },
  {
    id: "export",
    name: "export.log",
    kind: "log",
    chapter: 2,
    body: "02:12  export-node  job CORE-011  afgebroken\n02:44  export-node  job DOCK-244  helix-svc\nproef DOCK-198  status afgekeurd",
  },
  {
    id: "scan",
    name: "badge-scan.meta",
    kind: "meta",
    chapter: 2,
    body: "Scan van een gekloonde pas. Metadata uit dezelfde nacht als de exportlog.",
    meta: [
      { label: "Auteur", value: "L. Crowe" },
      { label: "Software", value: "Helix Transfer" },
      { label: "Tijd", value: "02:44:07" },
      { label: "Commentaar", value: "export id DOCK-244" },
      { label: "Vorige proef", value: "DOCK-198 afgekeurd" },
    ],
  },
  {
    id: "helix-key",
    name: "helix-key.txt",
    kind: "note",
    chapter: 2,
    body: "Helix-symboolsleutel, fragment.\nHet ruitje hoort niet in de mail.\n◇ = 9\nBewaar de rest van de kaart op de cryptodesk.",
  },
  {
    id: "maint",
    name: "maintenance.txt",
    kind: "note",
    chapter: 2,
    body: "Onderhoudsvenster M. Okonkwo\n01:00–03:00\nLocatie: rek 7\nTicket dekt de hele periode. Geen dokrechten.",
  },
  {
    id: "vale",
    name: "dossier-vale.txt",
    kind: "dossier",
    chapter: 5,
    body: "J. Vale — operator nachtdienst.\nBadge 4418. Verdieping 3.\nDe badge is om 02:31 op het dok gezien.\nControleer of Vale en de badge op dat moment wel samen waren.",
  },
  {
    id: "crowe",
    name: "dossier-crowe.txt",
    kind: "dossier",
    chapter: 5,
    body: "L. Crowe — analist.\nSchreef het incidentrapport en spiegelde de export.\nDaarom staat haar naam in de metadata.\nGeen Helix-contract. Geen dokpas.",
  },
  {
    id: "okonkwo",
    name: "dossier-okonkwo.txt",
    kind: "dossier",
    chapter: 5,
    body: "M. Okonkwo — netwerk.\nOnderhoud rek 7 van 01:00 tot 03:00.\nCamera en ticket wijzen naar dezelfde plek.\nGeen exportrechten.",
  },
  {
    id: "adler",
    name: "dossier-adler.txt",
    kind: "dossier",
    chapter: 5,
    body: "S. Adler — Helix Events, begeleiding van de vloercrew.\nPasnummer HX-19, gezien bij de dokpoort in de herstelde log.\nStaat in de deellijst van de planning. Wat daarmee gebeurde, staat in het archief.",
  },
  {
    id: "chat",
    name: "helix-night.log",
    kind: "chat",
    chapter: 5,
    body: "[19:02] adler: De indeling staat op de deellink, dan kan de crew de maten zien.\n[19:05] adler: Ik heb de link opengezet, anders moet iedereen apart inloggen.\n[02:16] vale: Er staat een mail van een planningadres. Die kijk ik morgen na.\n[02:37] crowe: Ik spiegel alleen de log. Ik ben niet op het dok.\n[02:41] okonkwo: Rek 7 staat open voor onderhoud. Ik blijf hier.",
  },
];

export function tokenLabel(id: string) {
  const labels: Record<string, string> = {
    N74192: "Dossier N74192",
    "DOCK-244": "Export DOCK-244",
    "ROUTE-7": "Route ROUTE-7",
    SEAL: "Zegel SEAL",
    "HX-19": "Helix HX-19",
    "INSIDER:ADLER": "Lek: S. Adler",
  };
  return labels[id] ?? id;
}
