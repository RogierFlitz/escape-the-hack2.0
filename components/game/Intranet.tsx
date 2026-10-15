"use client";

import { useState } from "react";

export type IntranetPage = "Mail" | "Agenda" | "Documenten" | "Medewerkers" | "Leveranciers" | "Nieuws" | "Dossier";

export type Piece = {
  id: string;
  clue?: string;
  title: string;
  source: string;
  excerpt: string;
};

export type Investigation = {
  ready: boolean;
  busy: boolean;
  openMail: string | null;
  dossier: string[];
  onOpenMail: (id: string | null) => void;
  onSeen: (id: string) => void;
  onPin: (id: string) => void;
  onBreach: (reported: boolean) => void;
};

type Row = Piece & { mark: string; when: string; address?: string; body: string };

const MAIL: Row[] = [
  {
    id: "astra",
    clue: "astra",
    mark: "A",
    title: "Informatie die niet voor ons lijkt",
    source: "P. Hendriks · Astra Logistics",
    address: "p.hendriks@astra-logistics.nl",
    when: "gisteren",
    excerpt: "Externe partij ontving details over een interne Nexora-bijeenkomst.",
    body: "Beste Mara, gisteren ontvingen wij een bericht met details over een interne bijeenkomst van Nexora: een datum, een locatie en een indeling. Die informatie leek niet voor een externe partij bedoeld. Wij weten niet via wie dit bij ons terecht is gekomen. Kunnen jullie nagaan of dit klopt?",
  },
  {
    id: "mara",
    mark: "M",
    title: "Toegang tot de werkomgeving",
    source: "Mara de Vries",
    address: "mara.devries@nexora.internal",
    when: "vandaag",
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
    when: "eergisteren",
    excerpt: "Bevestiging van de crew voor de bijeenkomst.",
    body: "Hoi Mara, de crew staat ingepland voor de bijeenkomst in de Dokzaal. De definitieve tijden sturen we nog. Aan deze mail zit geen bestand. Groet, Helix Events.",
  },
  {
    id: "finance",
    mark: "F",
    title: "Factuur kantoorartikelen",
    source: "Financiën",
    address: "facturen@nexora.internal",
    when: "maandag",
    excerpt: "Gewone factuur. Geen verband met de bijeenkomst.",
    body: "De factuur van de kantoorartikelen staat klaar ter akkoord. Kostenplaats facilitaire zaken. Dit hoort niet bij het externe onderzoek.",
  },
  {
    id: "noord",
    mark: "N",
    title: "Offerte borrel",
    source: "Noordlicht Catering",
    address: "offertes@noordlicht.nl",
    when: "vorige week",
    excerpt: "Offerte, niet gegund.",
    body: "Bijgaand onze offerte voor een borrel. We hebben nog geen opdracht ontvangen. De bijeenkomst staat bij ons nog niet in de planning.",
  },
  {
    id: "it",
    mark: "I",
    title: "Herinnering: geen wachtwoorden delen",
    source: "IT-servicedesk",
    address: "servicedesk@nexora.internal",
    when: "deze week",
    excerpt: "Standaard herinnering van IT.",
    body: "Deel geen wachtwoorden via de mail en open geen bestand dat je niet verwacht. Dit is de maandelijkse herinnering van de servicedesk.",
  },
];

const PHISH: Row = {
  id: "phish",
  mark: "H",
  title: "Definitieve planning Nexora Day",
  source: "Helix Events",
  address: "planning@helix-event.co",
  when: "nieuw",
  excerpt: "Nieuwe mail met een bijlage, verstuurd als Helix Events.",
  body: "Hoi Mara, in de bijlage staat de definitieve indeling voor de Dokzaal. Graag vandaag nog bevestigen.",
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
    id: "news-day",
    mark: "N",
    title: "Nexora Day komt eraan",
    source: "Intern nieuws",
    when: "deze week",
    excerpt: "Publieke aankondiging noemt nog geen locatie.",
    body: "Over een paar dagen houdt Nexora een bijeenkomst voor relaties. Locatie en indeling worden later gedeeld. Tot die tijd blijft de planning intern.",
  },
  {
    id: "news-coffee",
    mark: "K",
    title: "Nieuwe koffie op verdieping 3",
    source: "Facilitair",
    when: "gisteren",
    excerpt: "Huishoudelijk bericht.",
    body: "De automaat op verdieping 3 is vervangen. Melden bij facilitair als de badgelezer bij de kantine hapert.",
  },
  {
    id: "news-quarter",
    mark: "Q",
    title: "Kwartaalcijfers volgende week",
    source: "Directie",
    when: "deze week",
    excerpt: "Cijfers, geen evenement.",
    body: "De kwartaalcijfers gaan volgende week naar de directie. Niets uit dat pakket hoort bij de relatiemail.",
  },
];

const ALL = [...MAIL, PHISH, ...DOCS, ...AGENDA, ...PEOPLE, ...VENDORS, ...NEWS];

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

export function IntranetBody({ page, investigation }: { page: IntranetPage; investigation: Investigation }) {
  if (page === "Mail") return <Mailbox investigation={investigation} />;
  if (page === "Agenda") return <List pageLabel="AGENDA" title="Vandaag en later" rows={AGENDA} investigation={investigation} />;
  if (page === "Documenten") return <List pageLabel="DOCUMENTEN" title="Gedeelde stukken" rows={DOCS} investigation={investigation} />;
  if (page === "Medewerkers") return <List pageLabel="MEDEWERKERS" title="Wie werkt waar" rows={PEOPLE} investigation={investigation} />;
  if (page === "Leveranciers") return <List pageLabel="LEVERANCIERS" title="Relaties" rows={VENDORS} investigation={investigation} />;
  if (page === "Nieuws") return <List pageLabel="NIEUWS" title="Berichten van Nexora" rows={NEWS} investigation={investigation} />;
  return <Dossier investigation={investigation} />;
}

function Pin({ investigation, id }: { investigation: Investigation; id: string }) {
  const saved = investigation.dossier.includes(id);
  return (
    <button className="nx-pin" type="button" onClick={() => investigation.onPin(id)}>
      {saved ? "Bewaard in dossier" : "Bewaar in dossier"}
    </button>
  );
}

function Mailbox({ investigation }: { investigation: Investigation }) {
  const rows = investigation.ready ? [PHISH, ...MAIL] : MAIL;
  const open = rows.find((item) => item.id === investigation.openMail);
  if (open) {
    return (
      <article className="nx-copy">
        <button className="nx-back" type="button" onClick={() => investigation.onOpenMail(null)}>← Postvak</button>
        <p className="nx-kicker">AFZENDER</p>
        <h2>{open.title}</h2>
        <p>{open.source}</p>
        {open.address && <p className="mono">{open.address}</p>}
        <p>{open.body}</p>
        <div className="nx-actions">
          <Pin investigation={investigation} id={open.id} />
          {open.id === "phish" && (
            <>
              <button className="nx-next" type="button" disabled={investigation.busy} onClick={() => investigation.onBreach(false)}>Bijlage openen</button>
              <button className="nx-alert" type="button" disabled={investigation.busy} onClick={() => investigation.onBreach(true)}>Melden als verdacht</button>
            </>
          )}
        </div>
      </article>
    );
  }
  return (
    <article className="nx-copy">
      <p className="nx-kicker">POSTVAK</p>
      <h2>Mail</h2>
      <div className="nx-inbox">
        {rows.map((item) => (
          <button key={item.id} className={item.id === "phish" ? "nx-mail fresh" : "nx-mail"} type="button" onClick={() => { investigation.onOpenMail(item.id); if (item.clue) investigation.onSeen(item.clue); }}>
            <b>{item.mark}</b>
            <span><strong>{item.source}</strong><small>{item.title}</small></span>
            <small>{item.when}</small>
          </button>
        ))}
      </div>
    </article>
  );
}

function List({ pageLabel, title, rows, investigation }: { pageLabel: string; title: string; rows: Row[]; investigation: Investigation }) {
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
        {open.address && <p className="mono">{open.address}</p>}
        <p>{open.body}</p>
        <Pin investigation={investigation} id={open.id} />
      </article>
    );
  }
  return (
    <article className="nx-copy">
      <p className="nx-kicker">{pageLabel}</p>
      <h2>{title}</h2>
      <div className="nx-inbox">
        {rows.map((item) => (
          <button key={item.id} className="nx-mail" type="button" onClick={() => choose(item)}>
            <b>{item.mark}</b>
            <span><strong>{item.title}</strong><small>{item.excerpt}</small></span>
            <small>{item.when}</small>
          </button>
        ))}
      </div>
    </article>
  );
}

function Dossier({ investigation }: { investigation: Investigation }) {
  const items = officePieces(investigation.dossier);
  return (
    <article className="nx-copy">
      <p className="nx-kicker">ONDERZOEK</p>
      <h2>Dossier</h2>
      {items.length === 0 ? (
        <p>Nog niets bewaard. Open een mail, document of relatie en bewaar wat later nog nodig kan zijn.</p>
      ) : (
        <div className="nx-inbox">
          {items.map((item) => (
            <div key={item.id} className="nx-person">
              <span><strong>{item.title}</strong><small>{item.source} · {item.excerpt}</small></span>
              <button className="nx-pin" type="button" onClick={() => investigation.onPin(item.id)}>Weghalen</button>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
