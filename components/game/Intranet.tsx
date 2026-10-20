"use client";

import { useEffect, useState } from "react";
import { colleaguePost } from "@/lib/game/footprint";
import { chatThreads, deskNotes, projectTasks, socialExtras, tickets } from "./office/records";

export type IntranetPage = "Mail" | "Agenda" | "Documenten" | "Medewerkers" | "Leveranciers" | "Nieuws" | "Dossier" | "CRM";

export type Piece = {
  id: string;
  clue?: string;
  title: string;
  source: string;
  excerpt: string;
};

export type Suspicion = "verdacht" | "veilig";

export type Investigation = {
  ready: boolean;
  busy: boolean;
  openMail: string | null;
  dossier: string[];
  marks: Record<string, Suspicion>;
  readMail: string[];
  onOpenMail: (id: string | null) => void;
  onSeen: (id: string) => void;
  onPin: (id: string) => void;
  onMark: (id: string, verdict: Suspicion) => void;
  onRead: (id: string) => void;
  onBreach: (reported: boolean) => void;
};

type MailFile = { name: string; meta: string; text: string };
type MailHeader = { label: string; value: string };

type Row = Piece & {
  mark: string;
  when: string;
  address?: string;
  body: string;
  openbaar?: string;
  to?: string;
  date?: string;
  stamp?: number;
  photo?: string;
  group?: string;
  shown?: string;
  badge?: string;
  unread?: boolean;
  attachment?: MailFile;
  headers?: MailHeader[];
};

const TO_MARA = "Mara de Vries <mara.devries@nexora.internal>";

type MailFolder = "inbox" | "drafts" | "sent" | "deleted" | "archive" | "junk";

const FOLDERS: { id: MailFolder; label: string }[] = [
  { id: "inbox", label: "Postvak IN" },
  { id: "drafts", label: "Concepten" },
  { id: "sent", label: "Verzonden items" },
  { id: "deleted", label: "Verwijderde items" },
  { id: "archive", label: "Archief" },
  { id: "junk", label: "Ongewenste e-mail" },
];

const MAIL: Row[] = [
  {
    id: "astra",
    clue: "astra",
    mark: "A",
    title: "Informatie die niet voor ons lijkt",
    source: "P. Hendriks · Astra Logistics",
    address: "p.hendriks@astra-logistics.nl",
    to: TO_MARA,
    when: "di 16:22",
    date: "dinsdag 13 oktober 2026, 16:22",
    stamp: 790,
    excerpt: "Externe partij ontving details over een interne Nexora-bijeenkomst.",
    body: "Beste Mara, gisteren ontvingen wij een bericht met details over een interne bijeenkomst van Nexora: een datum, een locatie en een indeling. Die informatie leek niet voor een externe partij bedoeld. Wij weten niet via wie dit bij ons terecht is gekomen. Kunnen jullie nagaan of dit klopt?",
  },
  {
    id: "mara",
    mark: "M",
    title: "Toegang tot de werkomgeving",
    source: "Mara de Vries",
    address: "mara.devries@nexora.internal",
    to: TO_MARA,
    when: "08:06",
    date: "donderdag 15 oktober 2026, 08:06",
    stamp: 990,
    unread: true,
    excerpt: "Het externe team heeft toegang. Mara wacht op bevindingen.",
    body: "Jullie account staat open. In deze omgeving staan de gewone bedrijfsstukken. Ik weet nog niet wat er buiten Nexora is beland. Kijk rond en bewaar wat jullie relevant vinden. Ik hoor jullie bevindingen.",
  },
  {
    id: "helix",
    clue: "mail-helix",
    mark: "H",
    title: "Crew voor de bijeenkomst",
    source: "Helix Events",
    address: "events@helix-events.nl",
    to: TO_MARA,
    when: "ma 11:40",
    date: "maandag 12 oktober 2026, 11:40",
    stamp: 590,
    excerpt: "Bevestiging van de crew voor de bijeenkomst.",
    body: "Hoi Mara, de crew staat ingepland voor de bijeenkomst in de Dokzaal. De definitieve tijden sturen we nog. Aan deze mail zit geen bestand. Groet, Helix Events.",
    headers: [
      { label: "Return-Path", value: "events@helix-events.nl" },
      { label: "Reply-To", value: "events@helix-events.nl" },
      { label: "Message-ID", value: "<crew@helix-events.nl>" },
    ],
  },
  {
    id: "finance",
    mark: "F",
    title: "Factuur kantoorartikelen",
    source: "Financiën",
    address: "facturen@nexora.internal",
    to: TO_MARA,
    when: "ma 09:15",
    date: "maandag 12 oktober 2026, 09:15",
    stamp: 580,
    excerpt: "Gewone factuur. Geen verband met de bijeenkomst.",
    body: "De factuur van de kantoorartikelen staat klaar ter akkoord. Kostenplaats facilitaire zaken. Dit hoort niet bij het externe onderzoek.",
    attachment: {
      name: "Factuur-4421.pdf",
      meta: "PDF · 86 kB",
      text: "Factuur 4421\nKantoorartikelen, kostenplaats facilitaire zaken.\nDit stuk hoort niet bij de bijeenkomst.",
    },
  },
  {
    id: "noord",
    mark: "N",
    title: "Offerte borrel",
    source: "Noordlicht Catering",
    address: "offertes@noordlicht.nl",
    to: TO_MARA,
    when: "6 okt",
    date: "dinsdag 6 oktober 2026, 10:04",
    stamp: 400,
    excerpt: "Offerte, niet gegund.",
    body: "Bijgaand onze offerte voor een borrel. We hebben nog geen opdracht ontvangen. De bijeenkomst staat bij ons nog niet in de planning.",
    attachment: {
      name: "Offerte-borrel.pdf",
      meta: "PDF · 240 kB",
      text: "Offerte Noordlicht Catering\nBorrel, nog geen opdracht.\nDe bijeenkomst staat bij ons niet in de planning.",
    },
  },
  {
    id: "it",
    mark: "I",
    title: "Herinnering: geen wachtwoorden delen",
    source: "IT-servicedesk",
    address: "servicedesk@nexora.internal",
    to: TO_MARA,
    when: "gisteren",
    date: "woensdag 14 oktober 2026, 16:40",
    stamp: 900,
    unread: true,
    excerpt: "Standaard herinnering van IT.",
    body: "Deel geen wachtwoorden via de mail en open geen bestand dat je niet verwacht. Dit is de maandelijkse herinnering van de servicedesk.",
  },
  {
    id: "room",
    mark: "F",
    title: "Vergaderzaal 3 gereserveerd",
    source: "Facilitair",
    address: "facilitair@nexora.internal",
    to: TO_MARA,
    when: "07:52",
    date: "donderdag 15 oktober 2026, 07:52",
    stamp: 980,
    unread: true,
    excerpt: "Zaal 3 staat op jouw naam van 10:30 tot 11:15.",
    body: "Hoi Mara, vergaderzaal 3 is gereserveerd op jouw naam, vandaag van 10:30 tot 11:15. De badgelezer bij de kantine hapert nog; facilitair kijkt ernaar. Dit gaat niet over de bijeenkomst.",
  },
  {
    id: "adler-mail",
    mark: "H",
    title: "Aankomst van de crew",
    source: "S. Adler · Helix Events",
    address: "s.adler@helix-events.nl",
    to: TO_MARA,
    when: "di 18:05",
    date: "dinsdag 13 oktober 2026, 18:05",
    stamp: 800,
    excerpt: "We laden in via de zijingang. Vragen naar events@helix-events.nl.",
    body: "Hoi Mara, ik ben S. Adler van Helix Events. De crew laadt morgenochtend in via de zijingang van de Dokzaal. Voor planning en wijzigingen blijft het adres events@helix-events.nl. Groet, S. Adler.",
    headers: [
      { label: "Reply-To", value: "events@helix-events.nl" },
      { label: "Message-ID", value: "<aankomst@helix-events.nl>" },
    ],
  },
  {
    id: "dock-mail",
    mark: "D",
    title: "Bevestiging zaalhuur",
    source: "Dokzaal",
    address: "zaal@dokzaal.nl",
    to: TO_MARA,
    when: "di 11:20",
    date: "dinsdag 13 oktober 2026, 11:20",
    stamp: 700,
    unread: true,
    excerpt: "De zaal staat vast. De bevestiging zit in de bijlage.",
    body: "Beste Mara, de Dokzaal is vastgelegd voor Nexora Day. Wij leveren de ruimte, niet de crew. De bevestiging zit in de bijlage.",
    attachment: {
      name: "Bevestiging-zaal.pdf",
      meta: "PDF · 128 kB",
      text: "Zaalhuur Dokzaal\nOpdrachtgever: Mara de Vries.\nDe zaal levert de ruimte. Crew en planning horen bij de vloerpartner.",
    },
  },
  {
    id: "lunch",
    mark: "K",
    title: "Lunchlijst vrijdag",
    source: "Kantine",
    address: "kantine@nexora.internal",
    to: TO_MARA,
    when: "ma 12:10",
    date: "maandag 12 oktober 2026, 12:10",
    stamp: 600,
    excerpt: "Geef door of je vrijdag mee-eet. Keuze: soep of brood.",
    body: "De lunchlijst voor vrijdag staat open tot woensdag 15:00. Keuze: soep of brood. Antwoorden mag naar kantine@nexora.internal.",
  },
];

const PHISH: Row = {
  id: "phish",
  mark: "H",
  title: "Definitieve planning Nexora Day",
  source: "Helix Events",
  address: "planning@helix-event.co",
  to: TO_MARA,
  when: "09:18",
  date: "donderdag 15 oktober 2026, 09:18",
  stamp: 1000,
  unread: true,
  excerpt: "Hoi Mara, in de bijlage staat de definitieve indeling voor de Dokzaal.",
  body: "Hoi Mara, in de bijlage staat de definitieve indeling voor de Dokzaal. Graag vandaag nog bevestigen.",
  attachment: {
    name: "Dokzaal-indeling.pdf",
    meta: "PDF · 186 kB",
    text: "Indeling Dokzaal. Bestand van de afzender.",
  },
  headers: [
    { label: "Return-Path", value: "planning@helix-event.co" },
    { label: "Reply-To", value: "planning@helix-event.co" },
    { label: "Message-ID", value: "<plan@helix-event.co>" },
  ],
};

const DOCS: Row[] = [
  {
    id: "doc-plan",
    clue: "doc-plan",
    mark: "P",
    title: "Conceptplanning bijeenkomst",
    source: "Documenten · intern",
    when: "intern",
    excerpt: "Interne planning. Niet verspreiden buiten Nexora.",
    body: "Intern. Niet verspreiden buiten Nexora. Bijeenkomst: Nexora Day, over drie dagen, Dokzaal. Opdrachtgever: Mara de Vries. Vloer en crew: Helix Events.",
  },
  {
    id: "doc-contract",
    clue: "doc-contract",
    mark: "C",
    title: "Overeenkomst vloerpartner",
    source: "Documenten · contract",
    when: "getekend",
    excerpt: "Overeenkomst met de vloerpartner.",
    body: "Partij: Helix Events. Werk: opbouw en begeleiding in de Dokzaal. Correspondentie verloopt via events@helix-events.nl. Andere adressen staan niet in deze overeenkomst.",
  },
  {
    id: "doc-rules",
    mark: "H",
    title: "Huisregels kantoor",
    source: "Documenten · facilitair",
    when: "geldig",
    excerpt: "Bezoek meldt zich bij de balie.",
    body: "Bezoek meldt zich bij de balie. Vergaderzalen via de agenda. Badges niet mee naar huis. Dit stuk gaat niet over de bijeenkomst.",
  },
  {
    id: "doc-quote",
    mark: "O",
    title: "Offerte Noordlicht",
    source: "Documenten · inkoop",
    when: "afgewezen",
    excerpt: "Catering is niet gegund.",
    body: "Noordlicht Catering heeft een offerte gestuurd voor een borrel. Inkoop heeft geen opdracht gegeven. Noordlicht heeft geen rol op Nexora Day.",
  },
];

const AGENDA: Row[] = [
  {
    id: "ag-stand",
    mark: "09",
    title: "09:00 · Stand-up operatie",
    source: "Agenda",
    when: "vandaag",
    excerpt: "Gewone ochtendmeeting.",
    body: "Korte stand-up van het operationele team. Geen externe gasten.",
  },
  {
    id: "ag-astra",
    mark: "10",
    title: "10:30 · Terugbel Astra Logistics",
    source: "Agenda · Mara de Vries",
    when: "vandaag",
    excerpt: "Mara wil de externe partij terugbellen.",
    body: "P. Hendriks vroeg om een reactie op een bericht van gisteren. Onderwerp staat niet in de agenda, alleen de naam van de relatie.",
  },
  {
    id: "agenda-event",
    clue: "agenda-event",
    mark: "3d",
    title: "Over 3 dagen · Nexora Day",
    source: "Agenda · hele dag",
    when: "Dokzaal",
    excerpt: "Interne afspraak, de hele dag.",
    body: "Hele dag. Locatie Dokzaal. Opdrachtgever Mara de Vries. Crew ter plaatse: Helix Events. De afspraak is intern zichtbaar, niet gepubliceerd.",
  },
  {
    id: "ag-board",
    mark: "15",
    title: "15:00 · Kwartaalcijfers",
    source: "Agenda · boardroom",
    when: "vandaag",
    excerpt: "Cijferoverleg. Geen leveranciers.",
    body: "Boardroom. Alleen directie en financiën. Geen verband met de bijeenkomst of met externe mail.",
  },
];

const PEOPLE: Row[] = [
  { id: "p-mara", mark: "MV", title: "Mara de Vries", source: "Operationeel manager", when: "opdrachtgever", excerpt: "Huurt het externe team in.", body: "Operationeel manager. Eerste aanspreekpunt voor deze opdracht. Badge hoort bij haarzelf." },
  { id: "p-vale", mark: "JV", title: "J. Vale", source: "Operatie", when: "verdieping 3", excerpt: "Badge 4418. Die ligt volgens facilitair in de kantine.", body: "Operatie, verdieping 3. Badge 4418. Facilitair noteerde dat de badge gisteren in de kantine is blijven liggen." },
  { id: "p-crowe", mark: "LC", title: "L. Crowe", source: "Security", when: "analist", excerpt: "Intern securityteam.", body: "Security-analist. Werkt vandaag niet aan deze opdracht. Het externe team is apart ingehuurd." },
  { id: "p-okon", mark: "MO", title: "M. Okonkwo", source: "Netwerk", when: "rek 7", excerpt: "Beheerder van de netwerkkasten.", body: "Netwerkbeheer, rek 7. Geen rol in de uitnodigingen voor de bijeenkomst." },
  { id: "p-adler", mark: "SA", title: "S. Adler", source: "Helix Events", when: "op het dok", excerpt: "Begeleidt de crew namens de vloerpartner.", body: "Werkt bij Helix Events en staat op de dag zelf op het dok. In het personeelsbestand van Nexora alleen genoemd als begeleider van de crew." },
  { id: "p-berg", mark: "TB", title: "T. Berg", source: "Receptie", when: "balie", excerpt: "Meldt bezoek aan.", body: "Receptie. Bezoekers krijgen een dagbadge. Geen toegang tot de planning van de bijeenkomst." },
];

const VENDORS: Row[] = [
  {
    id: "vendor-helix",
    clue: "vendor-helix",
    mark: "H",
    title: "Helix Events",
    source: "Vloer en crew",
    address: "events@helix-events.nl",
    when: "geboekt",
    excerpt: "Geboekt voor opbouw en begeleiding.",
    body: "Geboekt voor opbouw en begeleiding tijdens Nexora Day. In het relatiebestand staat als contact events@helix-events.nl.",
  },
  {
    id: "vendor-dock",
    mark: "D",
    title: "Dokzaal",
    source: "Locatie",
    address: "zaal@dokzaal.nl",
    when: "geboekt",
    excerpt: "Alleen de zaal.",
    body: "Huur van de zaal. De Dokzaal levert de ruimte, niet de crew en niet de planning.",
  },
  {
    id: "vendor-noord",
    mark: "N",
    title: "Noordlicht Catering",
    source: "Offerte",
    address: "offertes@noordlicht.nl",
    when: "niet gegund",
    excerpt: "Geen opdracht.",
    body: "Offerte voor een borrel. Geen opdracht, geen toegang tot interne stukken.",
  },
  {
    id: "vendor-clean",
    mark: "S",
    title: "Schoonmaak Houten",
    source: "Facilitair",
    address: "planning@schoonmaakhouten.nl",
    when: "doorlopend",
    excerpt: "Avondschoonmaak van het kantoor.",
    body: "Doorlopend contract voor het kantoor. Geen aanwezigheid op Nexora Day.",
  },
];

const NEWS: Row[] = [
  {
    id: "news-berg",
    mark: "TB",
    title: colleaguePost.title,
    source: `${colleaguePost.author} · Social`,
    when: colleaguePost.when,
    excerpt: colleaguePost.body,
    body: colleaguePost.body,
    openbaar: colleaguePost.cue,
    group: "Social",
    shown: "9 okt",
    badge: "Openbaar",
    photo: "/news/mountains.jpg",
  },
  {
    id: "news-day",
    mark: "N",
    title: "Nexora Day komt eraan",
    source: "Intern nieuws",
    when: "deze week",
    excerpt: "Publieke aankondiging noemt nog geen locatie.",
    body: "Over een paar dagen houdt Nexora een bijeenkomst voor relaties. Locatie en indeling worden later gedeeld. Tot die tijd blijft de planning intern.",
    group: "Bedrijfsnieuws",
    shown: "14 okt",
    badge: "Intern nieuws",
    photo: "/news/nexora-day.jpg",
  },
  {
    id: "news-coffee",
    mark: "K",
    title: "Nieuwe koffie op verdieping 3",
    source: "Facilitair",
    when: "gisteren",
    excerpt: "Huishoudelijk bericht.",
    body: "We hebben een nieuwe koffiemachine op verdieping 3. De oude is vervangen.",
    group: "Facilitair",
    shown: "15 okt",
    photo: "/news/coffee.jpg",
  },
  {
    id: "news-quarter",
    mark: "Q",
    title: "Kwartaalcijfers volgende week",
    source: "Directie",
    when: "deze week",
    excerpt: "Cijfers, geen evenement.",
    body: "De kwartaalcijfers worden volgende week intern gedeeld. Er is geen extern evenement.",
    group: "Directie",
    shown: "14 okt",
    photo: "/news/charts.jpg",
  },
];

const SENT: Row[] = [
  {
    id: "sent-helix",
    mark: "M",
    title: "Re: Crew voor de bijeenkomst",
    source: "Mara de Vries",
    address: "mara.devries@nexora.internal",
    to: "Helix Events <events@helix-events.nl>",
    when: "08:41",
    date: "donderdag 15 oktober 2026, 08:41",
    stamp: 995,
    excerpt: "Dank, we rekenen op de crew in de Dokzaal.",
    body: "Hoi, dank voor de bevestiging. We rekenen op de crew in de Dokzaal. Groet, Mara de Vries",
  },
  {
    id: "sent-astra",
    mark: "M",
    title: "Re: Informatie die niet voor ons lijkt",
    source: "Mara de Vries",
    address: "mara.devries@nexora.internal",
    to: "P. Hendriks <p.hendriks@astra-logistics.nl>",
    when: "gisteren",
    date: "woensdag 14 oktober 2026, 17:05",
    stamp: 880,
    excerpt: "We kijken intern na hoe die details bij jullie terecht zijn gekomen.",
    body: "Beste Pieter, dank voor je mail. We kijken intern na hoe die details bij jullie terecht zijn gekomen. Ik kom erop terug. Groet, Mara de Vries",
  },
];

const DRAFTS: Row[] = [
  {
    id: "draft-crew",
    mark: "M",
    title: "Vragen voor de crew",
    source: "Mara de Vries",
    address: "mara.devries@nexora.internal",
    to: "Helix Events <events@helix-events.nl>",
    when: "gisteren",
    date: "woensdag 14 oktober 2026, 18:12",
    stamp: 870,
    excerpt: "Dit concept is nog niet verzonden.",
    body: "Hoi, kunnen jullie bevestigen hoe laat de wagen bij de zijingang staat?",
  },
];

const DELETED: Row[] = [
  {
    id: "del-park",
    mark: "F",
    title: "Onderhoud parkeerplaats",
    source: "Facilitair",
    address: "facilitair@nexora.internal",
    to: TO_MARA,
    when: "6 okt",
    date: "dinsdag 6 oktober 2026, 08:30",
    stamp: 100,
    excerpt: "De parkeerplaats achter het pand is vrijdag deels afgezet.",
    body: "De parkeerplaats achter het pand is vrijdag deels afgezet. Dit bericht is verwijderd.",
  },
];

const ARCHIVE: Row[] = [
  {
    id: "arch-sep",
    mark: "F",
    title: "Maandoverzicht september",
    source: "Financiën",
    address: "facturen@nexora.internal",
    to: TO_MARA,
    when: "1 okt",
    date: "donderdag 1 oktober 2026, 09:00",
    stamp: 50,
    excerpt: "Kostenplaatsen van september zijn afgesloten.",
    body: "Het maandoverzicht van september staat in het archief. Kostenplaatsen zijn afgesloten. Niets uit dit overzicht hoort bij de relatiemail.",
  },
];

function noteRow(item: { id: string; title: string; source: string; when: string; excerpt: string; body: string }, mark: string): Row {
  return { id: item.id, mark, title: item.title, source: item.source, when: item.when, excerpt: item.excerpt, body: item.body };
}

const EXTRA: Row[] = [
  ...socialExtras.map((item) => noteRow(item, "NX")),
  ...chatThreads.map((item) => noteRow(item, item.title.slice(0, 1))),
  ...projectTasks.map((item) => noteRow(item, "P")),
  ...tickets.map((item) => noteRow(item, "IT")),
  ...deskNotes.map((item) => noteRow(item, "N")),
];

const ALL = [...MAIL, PHISH, ...SENT, ...DRAFTS, ...DELETED, ...ARCHIVE, ...DOCS, ...AGENDA, ...PEOPLE, ...VENDORS, ...NEWS, ...EXTRA];

export function officePeople() {
  return PEOPLE;
}

export function officeVendors() {
  return VENDORS;
}

export function officePieces(ids: string[]) {
  return ids.map((id) => ALL.find((item) => item.id === id)).filter((item): item is Row => Boolean(item));
}

export function savedOfficePieces(teamCode: string) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`eth-office-${teamCode}`);
    const ids = raw ? (JSON.parse(raw) as { dossier?: string[] }).dossier : [];
    return officePieces(Array.isArray(ids) ? ids : []);
  } catch {
    return [];
  }
}

export function IntranetBody({
  page,
  investigation,
  onJump,
  focusId,
  onOpenSource,
}: {
  page: IntranetPage;
  investigation: Investigation;
  onJump?: (target: "home" | "crm" | "downloads" | "dossier") => void;
  focusId?: string | null;
  onOpenSource?: (id: string) => void;
}) {
  if (page === "Mail") return <Mailbox investigation={investigation} />;
  if (page === "Agenda") return <DayAgenda investigation={investigation} focusId={focusId} />;
  if (page === "Documenten") return <Downloads investigation={investigation} focusId={focusId} />;
  if (page === "Medewerkers") return <List pageLabel="MEDEWERKERS" title="Wie werkt waar" rows={PEOPLE} investigation={investigation} />;
  if (page === "Leveranciers") return <List pageLabel="LEVERANCIERS" title="Relaties" rows={VENDORS} investigation={investigation} />;
  if (page === "CRM") return <Crm investigation={investigation} focusId={focusId} />;
  if (page === "Nieuws") return <NewsPortal investigation={investigation} onJump={onJump} focusId={focusId} />;
  return <Dossier investigation={investigation} onJump={onJump} onOpenSource={onOpenSource} />;
}

export function Pin({ investigation, id, label = "Bewaar in dossier", savedLabel = "Bewaard in dossier" }: { investigation: Investigation; id: string; label?: string; savedLabel?: string }) {
  if (label === "Bewaar in dossier") return <ReportMark investigation={investigation} id={id} />;
  const saved = investigation.dossier.includes(id);
  return (
    <button className="nx-pin" type="button" onClick={() => investigation.onPin(id)}>
      {saved ? savedLabel : label}
    </button>
  );
}

export function ReportMark({ investigation, id }: { investigation: Investigation; id: string }) {
  const verdict = investigation.marks[id];
  return (
    <div className="ol-actions" role="group" aria-label="Melding">
      <button className={`ol-cmd ol-report${verdict === "verdacht" ? " on" : ""}`} type="button" aria-pressed={verdict === "verdacht"} onClick={() => investigation.onMark(id, "verdacht")}>
        {verdict === "verdacht" ? "Gemeld als verdacht" : "Meld als verdacht"}
      </button>
      <button className={`ol-cmd ol-clear${verdict === "veilig" ? " on" : ""}`} type="button" aria-pressed={verdict === "veilig"} onClick={() => investigation.onMark(id, "veilig")}>
        {verdict === "veilig" ? "Gemeld als niet verdacht" : "Meld als niet verdacht"}
      </button>
    </div>
  );
}

function avatarColor(mark: string) {
  if (mark === "H") return "#1f7a4d";
  if (mark === "M") return "#1683f0";
  if (mark === "A") return "#3d6f99";
  if (mark === "F") return "#3d5a80";
  if (mark === "N") return "#5c6b7a";
  if (mark === "I") return "#2a6f8f";
  if (mark === "D") return "#3a5f78";
  if (mark === "K") return "#4d6270";
  return "#245c86";
}

function technicalHeaders(item: Row): MailHeader[] {
  const from = item.address ?? "";
  const domain = from.includes("@") ? from.split("@")[1] : "nexora.internal";
  const generated: MailHeader[] = [
    { label: "Return-Path", value: from || item.source },
    { label: "Reply-To", value: from || item.source },
    { label: "Message-ID", value: `<${item.id}@${domain}>` },
  ];
  if (!item.headers?.length) return generated;
  const labels = new Set(item.headers.map((header) => header.label));
  return [...item.headers, ...generated.filter((header) => !labels.has(header.label))];
}

function mailUnread(item: Row, read: string[]) {
  return Boolean(item.unread) && !read.includes(item.id);
}

function Clip() {
  return (
    <svg className="ol-clip" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 12.5V7a4 4 0 1 1 8 0v8a2.5 2.5 0 0 1-5 0V8" />
    </svg>
  );
}

function Mailbox({ investigation }: { investigation: Investigation }) {
  const [folder, setFolder] = useState<MailFolder>("inbox");
  const [headerFor, setHeaderFor] = useState<string | null>(null);
  const [fileFor, setFileFor] = useState<string | null>(null);
  const inbox = [...(investigation.ready ? [PHISH, ...MAIL] : MAIL)].sort((a, b) => (b.stamp ?? 0) - (a.stamp ?? 0));
  const boxes: Record<MailFolder, Row[]> = {
    inbox,
    drafts: DRAFTS,
    sent: [...SENT].sort((a, b) => (b.stamp ?? 0) - (a.stamp ?? 0)),
    deleted: DELETED,
    archive: ARCHIVE,
    junk: [],
  };
  const rows = boxes[folder];
  const open = rows.find((item) => item.id === investigation.openMail) ?? null;
  const unreadIn = inbox.filter((item) => mailUnread(item, investigation.readMail)).length;
  const folderLabel = FOLDERS.find((item) => item.id === folder)?.label ?? "Postvak IN";

  function choose(item: Row) {
    investigation.onOpenMail(item.id);
    investigation.onRead(item.id);
    if (item.clue) investigation.onSeen(item.clue);
  }

  function openAttachment(item: Row) {
    if (item.id === "phish") {
      investigation.onBreach(false);
      return;
    }
    setFileFor((current) => current === item.id ? null : item.id);
  }

  return (
    <div className="ol-mail">
      <nav className="ol-folders" aria-label="Mappen">
        <p className="ol-account"><b>MV</b><span>Mara de Vries<small>mara.devries@nexora.internal</small></span></p>
        {FOLDERS.map((item) => {
          const count = item.id === "inbox" ? unreadIn : 0;
          return (
            <button key={item.id} type="button" className={folder === item.id ? "on" : ""} aria-current={folder === item.id ? "true" : undefined} onClick={() => setFolder(item.id)}>
              <svg className="ol-folder-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h6l2 2h10v10H3z" /></svg>
              <span>{item.label}</span>
              {count > 0 ? <em className="ol-count">{count}</em> : null}
            </button>
          );
        })}
      </nav>
      <div className="ol-list">
        <header className="ol-list-head">
          <strong>{folderLabel}</strong>
          <span>{rows.length}</span>
        </header>
        {rows.length === 0 ? <p className="ol-empty">Geen berichten.</p> : rows.map((item) => {
          const unread = mailUnread(item, investigation.readMail);
          const selected = investigation.openMail === item.id;
          return (
            <button key={item.id} type="button" aria-current={selected ? "true" : undefined} className={`ol-row${unread ? " unread" : ""}${selected ? " on" : ""}`} onClick={() => choose(item)}>
              {unread ? <span className="ol-sr">Ongelezen. </span> : null}
              <i className="ol-avatar" style={{ background: avatarColor(item.mark) }} aria-hidden="true">{item.mark}</i>
              <span className="ol-row-main">
                <span className="ol-row-top">
                  <strong>{item.source}</strong>
                  <time>{item.when}</time>
                </span>
                <span className="ol-subject">
                  <span>{item.title}</span>
                  {item.attachment ? <Clip /> : null}
                </span>
                <span className="ol-preview">{item.excerpt}</span>
              </span>
            </button>
          );
        })}
      </div>
      <article className="ol-read" aria-label="Leesvenster">
        {open ? (
          <>
            <div className="ol-titleline">
              <h2>{open.title}</h2>
              <time>{open.date ?? open.when}</time>
            </div>
            <div className="ol-who">
              <i className="ol-avatar" style={{ background: avatarColor(open.mark) }} aria-hidden="true">{open.mark}</i>
              <div>
                <p><b>Van</b> <span>{open.source}</span> {open.address ? <span className="mono ol-address">&lt;{open.address}&gt;</span> : null}</p>
                <p><b>Aan</b> <span className="mono ol-address">{open.to ?? TO_MARA}</span></p>
              </div>
            </div>
            <button className="ol-headers-btn" type="button" aria-expanded={headerFor === open.id} onClick={() => setHeaderFor((current) => current === open.id ? null : open.id)}>
              {headerFor === open.id ? "Kopteksten verbergen" : "Kopteksten weergeven"}
            </button>
            {headerFor === open.id && (
              <dl className="ol-tech">
                {technicalHeaders(open).map((header) => (
                  <div key={header.label}><dt>{header.label}</dt><dd>{header.value}</dd></div>
                ))}
              </dl>
            )}
            {folder === "drafts" ? <p className="ol-draft">Dit concept is nog niet verzonden.</p> : null}
            <p className="ol-body">{open.body}</p>
            {open.attachment && (
              <div className="ol-files">
                <p>1 bijlage</p>
                <button className="ol-file" type="button" disabled={investigation.busy} onClick={() => openAttachment(open)}>
                  <span className="ol-file-ico" aria-hidden="true">PDF</span>
                  <span><strong>{open.attachment.name}</strong><small>{open.attachment.meta}</small></span>
                </button>
                {fileFor === open.id && open.id !== "phish" ? <p className="ol-file-body">{open.attachment.text}</p> : null}
              </div>
            )}
            <div className="ol-actions">
              {open.id === "phish" ? (
                <>
                  <button className="ol-cmd ol-report" type="button" disabled={investigation.busy} onClick={() => investigation.onBreach(true)}>Meld als verdacht</button>
                  <button className="ol-cmd ol-clear" type="button" disabled={investigation.busy} onClick={() => investigation.onBreach(false)}>Meld als niet verdacht</button>
                </>
              ) : (
                <Pin investigation={investigation} id={open.id} />
              )}
            </div>
          </>
        ) : (
          <p className="ol-empty">Selecteer een bericht.</p>
        )}
      </article>
    </div>
  );
}

function portraitTone(mark: string) {
  const tones: Record<string, string> = {
    MV: "linear-gradient(160deg, #8fd0ff, #245c9a)",
    JV: "linear-gradient(160deg, #c5d4e4, #3d5268)",
    LC: "linear-gradient(160deg, #d7c4a4, #6a5438)",
    MO: "linear-gradient(160deg, #b9c7d6, #2c3d52)",
    SA: "linear-gradient(160deg, #f0d2b0, #8a623c)",
    TB: "linear-gradient(160deg, #f3d7c4, #a56b52)",
    H: "linear-gradient(160deg, #9fd0ff, #1d4e89)",
    D: "linear-gradient(160deg, #b7c9da, #3a5168)",
    N: "linear-gradient(160deg, #d5c8b0, #6d5a3e)",
    S: "linear-gradient(160deg, #c9d7c4, #3f5c48)",
  };
  return tones[mark] ?? "linear-gradient(160deg, #9eb6cc, #24384e)";
}

function Crm({ investigation, focusId }: { investigation: Investigation; focusId?: string | null }) {
  const [tab, setTab] = useState<"Medewerkers" | "Leveranciers">(focusId?.startsWith("vendor-") ? "Leveranciers" : "Medewerkers");
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("Alles");
  const [openId, setOpenId] = useState<string | null>(focusId ?? null);
  const rows = tab === "Medewerkers" ? PEOPLE : VENDORS;
  const depts = ["Alles", ...Array.from(new Set(rows.map((item) => item.source)))];
  const open = rows.find((item) => item.id === openId) ?? null;
  const needle = query.trim().toLowerCase();
  const visible = rows.filter((item) => {
    const text = `${item.title} ${item.source} ${item.when}`.toLowerCase();
    return (dept === "Alles" || item.source === dept) && (!needle || text.includes(needle));
  });

  useEffect(() => {
    if (!focusId) return;
    const item = [...PEOPLE, ...VENDORS].find((row) => row.id === focusId);
    if (!item) return;
    setTab(item.id.startsWith("vendor-") ? "Leveranciers" : "Medewerkers");
    setOpenId(item.id);
    if (item.clue) investigation.onSeen(item.clue);
  }, [focusId, investigation]);

  function choose(item: Row) {
    setOpenId(item.id);
    if (item.clue) investigation.onSeen(item.clue);
  }

  if (open) {
    return (
      <article className="crm-profile">
        <button className="nx-back" type="button" onClick={() => setOpenId(null)}>← Terug naar CRM</button>
        <div className="crm-profile-grid">
          <aside>
            <p className="on">Overzicht</p>
            <p>Functie</p>
            <p>Locatie</p>
            {open.address ? <p>Contact</p> : null}
          </aside>
          <div>
            <header>
              <i style={{ background: portraitTone(open.mark) }} aria-hidden="true">{open.mark}</i>
              <div>
                <h2>{open.title}</h2>
                <span>{open.source}</span>
              </div>
              <em>{open.when}</em>
            </header>
            <section>
              <h3>Over {open.title}</h3>
              <p>{open.body}</p>
            </section>
            <section>
              <h3>Functie</h3>
              <p>{open.source}</p>
            </section>
            <section>
              <h3>Locatie</h3>
              <p>{open.when}</p>
            </section>
            {open.address ? (
              <section>
                <h3>Contact</h3>
                <p className="mono">{open.address}</p>
              </section>
            ) : null}
            <Pin investigation={investigation} id={open.id} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="crm-home">
      <header className="crm-head">
        <div>
          <h2>CRM</h2>
          <p>{tab === "Medewerkers" ? "Medewerkers en leveranciers van Nexora" : "Relaties van Nexora"}</p>
        </div>
      </header>
      <div className="nx-seg" role="tablist" aria-label="CRM">
        <button type="button" role="tab" aria-selected={tab === "Medewerkers"} className={tab === "Medewerkers" ? "on" : ""} onClick={() => { setTab("Medewerkers"); setOpenId(null); setDept("Alles"); }}>Medewerkers ({PEOPLE.length})</button>
        <button type="button" role="tab" aria-selected={tab === "Leveranciers"} className={tab === "Leveranciers" ? "on" : ""} onClick={() => { setTab("Leveranciers"); setOpenId(null); setDept("Alles"); }}>Leveranciers ({VENDORS.length})</button>
      </div>
      <label className="crm-search">
        <span className="ol-sr">Zoeken</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek op naam, functie of afdeling" />
      </label>
      <div className="os-chips" role="tablist" aria-label="Afdeling">
        {depts.map((item) => (
          <button key={item} type="button" role="tab" aria-selected={dept === item} className={dept === item ? "on" : ""} onClick={() => setDept(item)}>{item}</button>
        ))}
      </div>
      <div className="crm-grid">
        {visible.map((item) => (
          <button key={item.id} type="button" className="crm-card" onClick={() => choose(item)}>
            <i style={{ background: portraitTone(item.mark) }} aria-hidden="true">{item.mark}</i>
            <strong>{item.title}</strong>
            <span>{item.source}</span>
            <small>{item.when}</small>
          </button>
        ))}
      </div>
      {visible.length === 0 ? <p className="ol-empty">Geen resultaten.</p> : null}
    </div>
  );
}

function Downloads({ investigation, focusId }: { investigation: Investigation; focusId?: string | null }) {
  const [openId, setOpenId] = useState<string | null>(focusId && DOCS.some((item) => item.id === focusId) ? focusId : DOCS[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Alles");
  const visible = DOCS.filter((item) => {
    const text = item.title.toLowerCase().includes(query.trim().toLowerCase());
    return text && (status === "Alles" || item.when === status);
  });
  const open = DOCS.find((item) => item.id === openId) ?? null;

  useEffect(() => {
    if (focusId && DOCS.some((item) => item.id === focusId)) setOpenId(focusId);
  }, [focusId]);

  useEffect(() => {
    investigation.onSeen("doc-plan");
    if (open?.clue) investigation.onSeen(open.clue);
  }, [open?.id, investigation]);

  function choose(item: Row) {
    setOpenId(item.id);
    if (item.clue) investigation.onSeen(item.clue);
  }

  return (
    <div className="dl-app">
      <header className="crm-head">
        <div>
          <h2>Downloads</h2>
          <p>Interne documenten en gedeelde bestanden</p>
        </div>
      </header>
      <label className="crm-search">
        <span className="ol-sr">Zoeken</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek op bestandsnaam" />
      </label>
      <div className="os-chips" role="tablist" aria-label="Status">
        {["Alles", "intern", "getekend", "geldig", "afgewezen"].map((item) => (
          <button key={item} type="button" role="tab" aria-selected={status === item} className={status === item ? "on" : ""} onClick={() => setStatus(item)}>{item === "Alles" ? "Alles" : `Status: ${item}`}</button>
        ))}
      </div>
      <div className="dl-split">
        <div className="dl-list">
          <p className="dl-colhead"><span>Bestand</span><span>Status</span></p>
          {visible.map((item) => (
            <button key={item.id} type="button" className={open?.id === item.id ? "on" : ""} onClick={() => choose(item)}>
              <i aria-hidden="true">PDF</i>
              <span>
                <strong>{item.title}.pdf</strong>
                <small>PDF-document</small>
              </span>
              <em className={`st ${item.when}`}>{item.when}</em>
            </button>
          ))}
        </div>
        <article className="dl-preview">
          {open ? (
            <>
              <p className="nx-kicker">Nexora</p>
              <h2>{open.title}</h2>
              <p>{open.body}</p>
              <Pin investigation={investigation} id={open.id} />
            </>
          ) : (
            <p className="ol-empty">Geen document.</p>
          )}
        </article>
      </div>
    </div>
  );
}

function DayAgenda({ investigation, focusId }: { investigation: Investigation; focusId?: string | null }) {
  const [openId, setOpenId] = useState<string | null>(focusId && AGENDA.some((item) => item.id === focusId) ? focusId : null);
  const open = AGENDA.find((item) => item.id === openId);
  useEffect(() => {
    if (focusId && AGENDA.some((item) => item.id === focusId)) {
      setOpenId(focusId);
      const item = AGENDA.find((row) => row.id === focusId);
      if (item?.clue) investigation.onSeen(item.clue);
    }
  }, [focusId, investigation]);
  const today = AGENDA.filter((item) => item.id !== "agenda-event");
  const later = AGENDA.filter((item) => item.id === "agenda-event");
  function choose(item: Row) {
    setOpenId(item.id);
    if (item.clue) investigation.onSeen(item.clue);
  }
  if (open) return <RecordView item={open} onBack={() => setOpenId(null)} investigation={investigation} />;
  return (
    <div className="nx-cal">
      <section>
        <h2>Vandaag</h2>
        {today.map((item) => {
          const time = item.title.match(/^(\d{1,2}:\d{2})/)?.[1] ?? item.mark;
          const label = item.title.replace(/^\d{1,2}:\d{2}\s·\s/, "");
          return (
            <button key={item.id} className="nx-slot" type="button" onClick={() => choose(item)}>
              <time>{time}</time>
              <span><strong>{label}</strong><small>{item.excerpt}</small></span>
            </button>
          );
        })}
      </section>
      <section>
        <h2>Over 3 dagen</h2>
        {later.map((item) => (
          <button key={item.id} className="nx-slot" type="button" onClick={() => choose(item)}>
            <time>Hele dag</time>
            <span><strong>Nexora Day</strong><small>{item.when} · {item.excerpt}</small></span>
          </button>
        ))}
      </section>
    </div>
  );
}

function RecordView({ item, onBack, investigation }: { item: Row; onBack: () => void; investigation: Investigation }) {
  return (
    <article className="nx-copy">
      <button className="nx-back" type="button" onClick={onBack}>← Terug</button>
      <p className="nx-kicker">{item.source}</p>
      <h2>{item.title}</h2>
      {item.openbaar && <p className="nx-open">{item.openbaar}</p>}
      {item.address && <p className="mono">{item.address}</p>}
      <p>{item.body}</p>
      <Pin investigation={investigation} id={item.id} />
    </article>
  );
}

function PortalBar({
  active,
  team = "Intern team",
  onJump,
}: {
  active?: "home" | "crm" | "downloads" | "dossier";
  team?: string;
  onJump?: (target: "home" | "crm" | "downloads" | "dossier") => void;
}) {
  const links = [
    ["home", "Dashboard"],
    ["crm", "CRM"],
    ["downloads", "Downloads"],
    ["dossier", "Onderzoeksdossier"],
  ] as const;
  return (
    <header className="nw-top">
      <div className="nw-brand">
        <span className="nw-logo" aria-hidden="true">N</span>
        <span><b>NEXORA</b><small>TECHNOLOGIES</small></span>
      </div>
      <nav aria-label="Nexora">
        {links.map(([id, label]) => (
          <button key={id} type="button" className={active === id ? "on" : ""} onClick={() => onJump?.(id)}>{label}</button>
        ))}
      </nav>
      <div className="brief-user"><b>MV</b><span>Mara de Vries<small>{team}</small></span></div>
    </header>
  );
}

const NEWS_FILTERS = ["Alles", "Bedrijfsnieuws", "Facilitair", "Directie", "Social"] as const;

function NewsPortal({
  investigation,
  onJump,
  focusId,
}: {
  investigation: Investigation;
  onJump?: (target: "home" | "crm" | "downloads" | "dossier") => void;
  focusId?: string | null;
}) {
  const [openId, setOpenId] = useState<string | null>(focusId && NEWS.some((item) => item.id === focusId) ? focusId : null);
  useEffect(() => {
    if (focusId && NEWS.some((item) => item.id === focusId)) setOpenId(focusId);
  }, [focusId]);
  const [filter, setFilter] = useState<(typeof NEWS_FILTERS)[number]>("Alles");
  const [query, setQuery] = useState("");
  const open = NEWS.find((item) => item.id === openId);
  const needle = query.trim().toLowerCase();
  const visible = NEWS.filter((item) => {
    const groupOk = filter === "Alles" || item.group === filter;
    const text = `${item.title} ${item.body} ${item.source}`.toLowerCase();
    return groupOk && (!needle || text.includes(needle));
  });
  const lead = filter === "Alles" && !needle ? visible.find((item) => item.id === "news-day") : undefined;
  const cards = visible.filter((item) => item.id !== lead?.id);
  function choose(item: Row) {
    setOpenId(item.id);
    if (item.clue) investigation.onSeen(item.clue);
  }
  return (
    <div className="nw-app">
      <PortalBar onJump={onJump} />
      <div className="nw-page">
        <button className="nw-crumb" type="button" onClick={() => (open ? setOpenId(null) : onJump?.("home"))}>← Nieuws</button>
        {open ? (
          <article className="nw-read">
            {open.photo && <img src={open.photo} alt="" />}
            <p>{open.source} · {open.when}</p>
            <h2>{open.title}</h2>
            {open.openbaar && <p className="nx-open">{open.openbaar}</p>}
            <p>{open.body}</p>
            <Pin investigation={investigation} id={open.id} />
          </article>
        ) : (
          <>
            <div className="nw-head">
              <div>
                <h2>Het Netwerk</h2>
                <p>Nieuws, updates en berichten van collega&apos;s</p>
              </div>
              <label className="nw-search">
                <span aria-hidden="true">⌕</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek in nieuwsberichten..." />
              </label>
            </div>
            <div className="nw-chips" role="tablist" aria-label="Soort bericht">
              {NEWS_FILTERS.map((item) => (
                <button key={item} type="button" role="tab" aria-selected={filter === item} onClick={() => setFilter(item)}>{item}</button>
              ))}
            </div>
            {lead && <NewsHero item={lead} onOpen={() => choose(lead)} />}
            {cards.length > 0 && (
              <div className="nw-grid">
                {cards.map((item) => <NewsCard key={item.id} item={item} onOpen={() => choose(item)} />)}
              </div>
            )}
            {visible.length === 0 && <p className="nw-empty">Geen berichten voor deze zoekopdracht.</p>}
          </>
        )}
      </div>
    </div>
  );
}

function NewsHero({ item, onOpen }: { item: Row; onOpen: () => void }) {
  return (
    <button className="nw-hero" type="button" onClick={onOpen}>
      {item.photo && <img src={item.photo} alt="" />}
      <span>
        <small>Voorpagina · deze week</small>
        <strong>{item.title}</strong>
        <em>{item.body}</em>
        <i>
          {item.badge && <b>{item.badge}</b>}
          <time>{item.shown}</time>
        </i>
      </span>
    </button>
  );
}

function NewsCard({ item, onOpen }: { item: Row; onOpen: () => void }) {
  return (
    <button className="nw-card" type="button" onClick={onOpen}>
      {item.photo && <img src={item.photo} alt="" />}
      <span>
        <small>{item.source} · {item.when}</small>
        <strong>{item.title}</strong>
        <em>{item.body}</em>
        <i>
          {item.badge && <b className={item.badge === "Openbaar" ? "open" : ""}>{item.badge}</b>}
          <time>{item.shown}</time>
        </i>
      </span>
    </button>
  );
}

function List({ pageLabel, title, rows, investigation, compact = false }: { pageLabel: string; title: string; rows: Row[]; investigation: Investigation; compact?: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = rows.find((item) => item.id === openId);
  function choose(item: Row) {
    setOpenId(item.id);
    if (item.clue) investigation.onSeen(item.clue);
  }
  if (open) {
    return (
      <article className="nx-copy">
        <button className="nx-back" type="button" onClick={() => setOpenId(null)}>← Terug</button>
        <p className="nx-kicker">{open.source}</p>
        <h2>{open.title}</h2>
        {open.openbaar && <p className="nx-open">{open.openbaar}</p>}
        {open.address && <p className="mono">{open.address}</p>}
        <p>{open.body}</p>
        <Pin investigation={investigation} id={open.id} />
      </article>
    );
  }
  return (
    <article className="nx-copy">
      {!compact && <p className="nx-kicker">{pageLabel}</p>}
      {!compact && <h2>{title}</h2>}
      <div className="nx-inbox">
        {rows.map((item) => (
          <button key={item.id} className={item.openbaar ? "nx-mail openbaar" : "nx-mail"} type="button" onClick={() => choose(item)}>
            <b>{item.mark}</b>
            <span>
              <strong>{item.title}</strong>
              <small>{item.excerpt}</small>
              {item.openbaar && <em className="nx-open">{item.openbaar}</em>}
            </span>
            <small>{item.when}</small>
          </button>
        ))}
      </div>
    </article>
  );
}

function pieceKind(id: string) {
  if (id.startsWith("p-")) return "Personen";
  if (id.startsWith("vendor-")) return "Leveranciers";
  if (id.startsWith("doc-")) return "Documenten";
  if (id.startsWith("news-")) return "Nieuws";
  if (id.startsWith("social-") || id.startsWith("chat-")) return "Berichten";
  if (id.startsWith("hd-")) return "Tickets";
  if (id.startsWith("task-")) return "Projecten";
  if (id.startsWith("note-")) return "Notities";
  return "E-mails";
}

function kindName(kind: string) {
  if (kind === "E-mails") return "E-mail";
  if (kind === "Documenten") return "Document";
  if (kind === "Personen") return "Persoon";
  if (kind === "Leveranciers") return "Leverancier";
  if (kind === "Berichten") return "Bericht";
  if (kind === "Tickets") return "Ticket";
  if (kind === "Projecten") return "Taak";
  if (kind === "Notities") return "Notitie";
  return "Nieuws";
}

function Dossier({
  investigation,
  onJump,
  onOpenSource,
}: {
  investigation: Investigation;
  onJump?: (target: "home" | "crm" | "downloads" | "dossier") => void;
  onOpenSource?: (id: string) => void;
}) {
  const [filter, setFilter] = useState("Alles");
  const [query, setQuery] = useState("");
  const items = officePieces(investigation.dossier);
  const filters = ["Alles", "E-mails", "Documenten", "Personen", "Leveranciers", "Nieuws", "Berichten", "Tickets", "Projecten", "Notities"];
  const count = (kind: string) => items.filter((item) => pieceKind(item.id) === kind).length;
  const needle = query.trim().toLowerCase();
  const shown = items.filter((item) => {
    const kindOk = filter === "Alles" || pieceKind(item.id) === filter;
    const text = `${item.title} ${item.source} ${item.excerpt}`.toLowerCase();
    return kindOk && (!needle || text.includes(needle));
  });
  return (
    <div className="nw-app dos-app">
      <PortalBar active="dossier" team="Extern team" onJump={onJump} />
      <div className="dos-page">
        <header className="dos-intro">
          <div>
            <h2>Onderzoeksdossier</h2>
            <p>Verzamel en analyseer digitale sporen uit het Nexora-netwerk.</p>
          </div>
          <img src="/news/racks.jpg" alt="" />
        </header>
        <div className="dos-stats">
          <span><i aria-hidden="true"><DocGlyph /></i><b>{items.length}</b> Bewijsstukken</span>
          <span><i aria-hidden="true"><PersonGlyph /></i><b>{count("Personen")}</b> Personen</span>
          <span><i aria-hidden="true"><DocGlyph /></i><b>{count("Documenten")}</b> Documenten</span>
          <span><i aria-hidden="true"><VendorGlyph /></i><b>{count("Leveranciers")}</b> Leveranciers</span>
        </div>
        <div className="dos-tools">
          <div className="nw-chips" role="tablist" aria-label="Filter">
            {filters.map((item) => {
              const total = item === "Alles" ? items.length : count(item);
              return (
                <button key={item} type="button" role="tab" aria-selected={filter === item} onClick={() => setFilter(item)}>
                  {item} ({total})
                </button>
              );
            })}
          </div>
          <label className="nw-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek in je dossier..." />
          </label>
        </div>
        {items.length === 0 ? (
          <p className="dos-empty">Nog niets gemeld. Open een mail, bericht of ticket en kies Meld als verdacht of Meld als niet verdacht.</p>
        ) : shown.length === 0 ? (
          <p className="dos-empty">Niets in deze groep.</p>
        ) : (
          <div className="dos-grid">
            {shown.map((item) => {
              const kind = pieceKind(item.id);
              const status = kind === "Documenten" ? item.when : "";
              return (
                <article key={item.id} className="dos-card">
                  <DossierMark kind={kind} mark={item.mark} title={item.title} />
                  <div>
                    <small>{kindName(kind)}</small>
                    <strong>{kind === "Documenten" ? `${item.title}.pdf` : item.title}</strong>
                    <em>
                      {kind === "E-mails" ? `Van: ${item.source}` : item.source}
                      {status ? <b className={`st ${status}`}>{status}</b> : null}
                      {kind === "E-mails" ? <time>{item.when}</time> : null}
                    </em>
                    <p>{item.excerpt}</p>
                    {investigation.marks[item.id] === "verdacht" ? <b className="dos-flag bad">Verdacht</b> : investigation.marks[item.id] === "veilig" ? <b className="dos-flag ok">Niet verdacht</b> : null}
                  </div>
                  <div className="dos-actions">
                    <button type="button" onClick={() => onOpenSource?.(item.id)}>Bron openen</button>
                    <button type="button" onClick={() => investigation.onPin(item.id)}>Weghalen</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DossierMark({ kind, mark, title }: { kind: string; mark: string; title: string }) {
  if (kind === "Personen") return <span className="dos-face" style={{ background: portraitTone(mark) }}>{mark}</span>;
  if (kind === "Leveranciers") {
    return <span className="dos-brand" aria-hidden="true">{title.split(" ")[0]?.slice(0, 6) || "REL"}</span>;
  }
  const tone = kind === "E-mails" ? "mail" : mark === "H" || title.toLowerCase().includes("huisregels") ? "sheet" : "pdf";
  return (
    <span className={`dos-file ${tone}`} aria-hidden="true">
      {kind === "E-mails" ? <MailGlyph /> : <DocGlyph />}
    </span>
  );
}

function MailGlyph() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function DocGlyph() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

function PersonGlyph() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 19c1.4-3 3.6-4.5 7-4.5S17.6 16 19 19" />
    </svg>
  );
}

function VendorGlyph() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 10h16v9H4z" />
      <path d="M8 10V7h8v3" />
    </svg>
  );
}
