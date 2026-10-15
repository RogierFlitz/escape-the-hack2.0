export const noraSupplier =
  "Ik heb communicatie tussen Nexora en Helix Events veiliggesteld. Niet alle berichten zijn betrouwbaar. Vergelijk de beschikbare informatie, controleer de afzenders en reconstrueer wat er is gebeurd. Trek pas een conclusie wanneer jullie voldoende bewijs hebben.";

export type Mail = {
  id: string;
  from: string;
  to: string;
  subject: string;
  when: string;
  body: string;
  file?: string;
  headers: { label: string; value: string }[];
};

export const mails: Mail[] = [
  {
    id: "prior",
    from: "events@helix-events.nl",
    to: "events@nexora.internal",
    subject: "Nexora Day — planning v3",
    when: "ma 9 mrt, 11:18",
    file: "planning-nexora-day-v3.xlsx",
    body: "Mara, bijgaand de planning voor de Dokzaal. Crew call 07:30. De vloer ligt er woensdag. Vragen stuur je naar dit adres.",
    headers: [
      { label: "Return-Path", value: "events@helix-events.nl" },
      { label: "Message-ID", value: "<plan-v3@helix-events.nl>" },
      { label: "Reply-To", value: "events@helix-events.nl" },
    ],
  },
  {
    id: "reply",
    from: "mara.de.vries@nexora.internal",
    to: "events@helix-events.nl",
    subject: "Re: Nexora Day — planning v3",
    when: "ma 9 mrt, 14:02",
    body: "Ontvangen. Het dok blijft op onze badgelijst. Tot donderdag.",
    headers: [
      { label: "Return-Path", value: "mara.de.vries@nexora.internal" },
      { label: "In-Reply-To", value: "<plan-v3@helix-events.nl>" },
    ],
  },
  {
    id: "invoice",
    from: "events@helix-events.nl",
    to: "finance@nexora.internal",
    subject: "Factuur vloer en rigging",
    when: "di 10 mrt, 09:40",
    body: "Factuur HX-2026 voor vloer, rigging en crew op Nexora Day. Het operationele contact blijft events@helix-events.nl.",
    headers: [
      { label: "Return-Path", value: "events@helix-events.nl" },
      { label: "Message-ID", value: "<hx-2026@helix-events.nl>" },
    ],
  },
  {
    id: "crew",
    from: "s.adler@helix-events.nl",
    to: "events@nexora.internal",
    subject: "Crewcall donderdag",
    when: "wo 11 mrt, 16:12",
    body: "We staan om 07:00 bij de artiesteningang. De run-of-show loopt via het events-adres, niet via een persoonlijk account.",
    headers: [
      { label: "Return-Path", value: "s.adler@helix-events.nl" },
      { label: "Message-ID", value: "<crew@helix-events.nl>" },
    ],
  },
  {
    id: "phish",
    from: "planning@helix-event.co",
    to: "events@nexora.internal",
    subject: "Bijgewerkte planning voor het dok",
    when: "do 12 mrt, 02:11",
    file: "planning-nexora-day.xlsx",
    body: "Helix Events. De planning voor Nexora Day in de Dokzaal is bijgewerkt. Bekijk de bijlage voor het nachtelijke venster. Met vriendelijke groet, Planning.",
    headers: [
      { label: "Return-Path", value: "planning@helix-event.co" },
      { label: "Reply-To", value: "planning@helix-event.co" },
      { label: "Message-ID", value: "<plan@helix-event.co>" },
    ],
  },
  {
    id: "canteen",
    from: "facilitair@nexora.internal",
    to: "all@nexora.internal",
    subject: "Kantine verdieping 3",
    when: "wo 11 mrt, 08:05",
    body: "De automaat blijft aan tijdens Nexora Day. De nachtploeg kan daar koffie halen.",
    headers: [{ label: "Return-Path", value: "facilitair@nexora.internal" }],
  },
  {
    id: "finance",
    from: "finance@nexora.internal",
    to: "leads@nexora.internal",
    subject: "Kwartaalcijfers vrijdag",
    when: "di 10 mrt, 17:20",
    body: "De presentatie blijft in de map van finance tot de meeting. Geen relatie met de zaalopbouw.",
    headers: [{ label: "Return-Path", value: "finance@nexora.internal" }],
  },
  {
    id: "crowe",
    from: "l.crowe@nexora.internal",
    to: "soc@nexora.internal",
    subject: "Spiegel van de export",
    when: "do 12 mrt, 02:55",
    body: "Ik zet een kopie van de export in het analysedossier. Ik was die nacht niet op het dok.",
    headers: [{ label: "Return-Path", value: "l.crowe@nexora.internal" }],
  },
  {
    id: "okonkwo",
    from: "m.okonkwo@nexora.internal",
    to: "ops@nexora.internal",
    subject: "Onderhoud rek 7",
    when: "wo 11 mrt, 18:44",
    body: "Venster 01:00–03:00. Ik blijf bij de kast. Geen dokrechten op dit ticket.",
    headers: [{ label: "Return-Path", value: "m.okonkwo@nexora.internal" }],
  },
  {
    id: "noord",
    from: "planning@noordlicht-catering.nl",
    to: "events@nexora.internal",
    subject: "Offerte koffie Nexora Day",
    when: "vr 6 mrt, 13:10",
    body: "We kunnen de foyer doen. Dit voorstel gaat over koffie, niet over zaalbouw.",
    headers: [{ label: "Return-Path", value: "planning@noordlicht-catering.nl" }],
  },
];

export const contract = {
  party: "Helix Events",
  work: "Vloer, rigging en crew voor Nexora Day in de Dokzaal",
  ref: "HX-2026",
  contact: "events@helix-events.nl",
  note: "Operationele mail loopt via het adres op dit contract. Persoonlijke accounts en andere domeinen staan er niet op.",
};

export const realPlan = [
  "Nexora Day — Dokzaal",
  "07:30 crew call",
  "08:00 zaal open",
  "vloer en rigging: Helix Events",
  "geen nachtelijke dokvrijgave",
];

export const fakePlan = [
  "Nexora Day — Dokzaal",
  "07:30 crew call",
  "08:00 zaal open",
  "02:30 dokpoort vrijgeven voor pakket",
  "bevestig de overdracht aan de poort",
];

export const fileMeta = {
  name: "planning-nexora-day.xlsx",
  created: "02:11",
  modified: "02:14",
  author: "planning@helix-event.co",
  tool: "SheetForge",
};

export const realMeta = {
  name: "planning-nexora-day-v3.xlsx",
  created: "8 mrt, 19:12",
  modified: "9 mrt, 10:54",
  author: "events@helix-events.nl",
  tool: "Nexora Sheets",
};

export const marks = [
  { id: "author", label: "Maker van het bestand" },
  { id: "dock-row", label: "Regel die alleen in de nieuwe bijlage staat" },
  { id: "modified", label: "Tijdstip van de laatste wijziging" },
  { id: "filename", label: "Bestandsnaam" },
  { id: "font", label: "Lettertype van de kop" },
] as const;

export const nightCards = [
  { id: "phish", label: "Een werkplek opent een leveranciersmail" },
  { id: "dock", label: "Een pas wordt bij het dok gelezen" },
  { id: "export", label: "Een exportjob verlaat het dok" },
  { id: "maint", label: "Onderhoud aan rek 7" },
  { id: "mirror", label: "Een analist maakt een spiegelkopie" },
  { id: "canteen", label: "Het kantinelicht op verdieping 3" },
] as const;

export const accessLog = [
  "02:14  workstation-14  mail-open   j.vale",
  "02:31  dock-gate        badge-4418  j.vale",
  "02:40  rack-7           maint       m.okonkwo",
  "02:51  analyst-3        report      l.crowe",
];

export const exportLog = [
  "02:12  export-node  job CORE-011  afgebroken",
  "02:44  export-node  job DOCK-244  helix-svc",
  "proef  DOCK-198  status afgekeurd",
];

export const jobs = [
  { id: "CORE-011", label: "CORE-011" },
  { id: "DOCK-198", label: "DOCK-198" },
  { id: "DOCK-244", label: "DOCK-244" },
] as const;

export const supports = [
  { id: "contract", label: "Adres op het contract" },
  { id: "prior", label: "Eerder bericht van Helix" },
  { id: "header", label: "Headers van het aangewezen bericht" },
  { id: "logo", label: "De naam Helix in de ondertekening" },
] as const;

export const traceSupports = [
  { id: "export-log", label: "Regel in de exportlog" },
  { id: "attachment", label: "Dokregel in de bijlage" },
  { id: "canteen", label: "Kantinebericht" },
] as const;

export const sections = [
  { id: "mail", label: "Post" },
  { id: "dossier", label: "Dossier" },
  { id: "file", label: "Bijlage" },
  { id: "log", label: "Nachtlog" },
  { id: "time", label: "Tijdlijn" },
] as const;
