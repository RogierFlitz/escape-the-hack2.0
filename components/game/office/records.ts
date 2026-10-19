/** Lokale, fictieve kantoorstukken. Geen nieuwe wachtwoorden, codes, verdachten of locaties. */

export type OfficeNote = {
  id: string;
  title: string;
  source: string;
  when: string;
  excerpt: string;
  body: string;
};

export const socialExtras: OfficeNote[] = [
  {
    id: "social-prep",
    title: "De voorbereidingen zijn begonnen",
    source: "Nexora Technologies",
    when: "3 d",
    excerpt: "Nexora Day komt eraan. Programma en locatie volgen later.",
    body: "Achter de schermen wordt hard gewerkt aan Nexora Day. Een intern team zet de ideeën uit het veld klaar. Het programma en de locatie volgen later.",
  },
  {
    id: "social-lunch",
    title: "Lunchlijst vrijdag",
    source: "Kantine",
    when: "2 d",
    excerpt: "Keuze: soep of brood. Dit gaat niet over de bijeenkomst.",
    body: "De lunchlijst voor vrijdag staat open. Keuze: soep of brood. Dit gaat niet over de bijeenkomst.",
  },
  {
    id: "social-standup",
    title: "Stand-up om 09:00",
    source: "Mara de Vries",
    when: "vandaag",
    excerpt: "Korte stand-up van het operationele team. Geen externe gasten.",
    body: "Korte stand-up van het operationele team. Geen externe gasten.",
  },
];

export type ChatMessage = { from: string; time: string; text: string; file?: string };

export type ChatThread = OfficeNote & { people: string; messages: ChatMessage[] };

export const chatThreads: ChatThread[] = [
  {
    id: "chat-helix",
    title: "Helix Events",
    source: "S. Adler · Helix Events",
    people: "S. Adler, Mara de Vries",
    when: "10:12",
    excerpt: "De crew staat ingepland voor de Dokzaal. Planning via events@helix-events.nl.",
    body: "S. Adler: De crew staat ingepland voor de bijeenkomst in de Dokzaal. Voor planning en wijzigingen blijft het adres events@helix-events.nl.\nMara de Vries: Dank, we rekenen op de crew in de Dokzaal.",
    messages: [
      { from: "S. Adler", time: "10:04", text: "De crew staat ingepland voor de bijeenkomst in de Dokzaal. Voor planning en wijzigingen blijft het adres events@helix-events.nl." },
      { from: "Mara de Vries", time: "10:12", text: "Dank, we rekenen op de crew in de Dokzaal." },
    ],
  },
  {
    id: "chat-facilitair",
    title: "Facilitair",
    source: "Facilitair",
    people: "Facilitair, Mara de Vries",
    when: "07:58",
    excerpt: "Vergaderzaal 3 staat gereserveerd. De badgelezer bij de kantine hapert nog.",
    body: "Facilitair: Vergaderzaal 3 is gereserveerd op jouw naam, vandaag van 10:30 tot 11:15. De badgelezer bij de kantine hapert nog. Dit gaat niet over de bijeenkomst.\nMara de Vries: Genoteerd, dank.",
    messages: [
      { from: "Facilitair", time: "07:52", text: "Vergaderzaal 3 is gereserveerd op jouw naam, vandaag van 10:30 tot 11:15. De badgelezer bij de kantine hapert nog. Dit gaat niet over de bijeenkomst." },
      { from: "Mara de Vries", time: "07:58", text: "Genoteerd, dank." },
    ],
  },
  {
    id: "chat-it",
    title: "IT Support",
    source: "IT-servicedesk",
    people: "IT-servicedesk",
    when: "gisteren",
    excerpt: "Deel geen wachtwoorden via de mail.",
    body: "IT-servicedesk: Deel geen wachtwoorden via de mail en open geen bestand dat je niet verwacht. Dit is de maandelijkse herinnering.",
    messages: [
      { from: "IT-servicedesk", time: "16:40", text: "Deel geen wachtwoorden via de mail en open geen bestand dat je niet verwacht. Dit is de maandelijkse herinnering van de servicedesk." },
    ],
  },
  {
    id: "chat-astra",
    title: "Astra Logistics",
    source: "Mara de Vries",
    people: "Mara de Vries",
    when: "gisteren",
    excerpt: "P. Hendriks vroeg om een reactie. Het onderwerp staat in de mail, niet in deze chat.",
    body: "Mara de Vries: P. Hendriks vroeg om een reactie op een bericht van gisteren. De inhoud staat in de mail van Astra, niet in dit gesprek.",
    messages: [
      { from: "Mara de Vries", time: "17:10", text: "P. Hendriks vroeg om een reactie op een bericht van gisteren. De inhoud staat in de mail van Astra, niet in dit gesprek." },
    ],
  },
  {
    id: "chat-kantine",
    title: "Kantine",
    source: "Kantine",
    people: "Kantine",
    when: "ma 12:10",
    excerpt: "Lunchlijst vrijdag. Keuze: soep of brood.",
    body: "Kantine: De lunchlijst voor vrijdag staat open tot woensdag 15:00. Keuze: soep of brood.",
    messages: [
      { from: "Kantine", time: "12:10", text: "De lunchlijst voor vrijdag staat open tot woensdag 15:00. Keuze: soep of brood." },
    ],
  },
];

export type ProjectTask = OfficeNote & { owner: string; column: "todo" | "doing" | "done"; docId?: string };

export const projectTasks: ProjectTask[] = [
  {
    id: "task-standup",
    title: "Stand-up voorbereiden",
    source: "Operatie",
    owner: "Mara de Vries",
    when: "Vandaag",
    column: "todo",
    excerpt: "Korte stand-up. Geen externe gasten.",
    body: "Korte stand-up van het operationele team. Geen externe gasten.",
  },
  {
    id: "task-press",
    title: "Publieke aankondiging",
    source: "Intern nieuws",
    owner: "Mara de Vries",
    when: "Deze week",
    column: "todo",
    excerpt: "Locatie en indeling worden later gedeeld.",
    body: "Over een paar dagen houdt Nexora een bijeenkomst voor relaties. Locatie en indeling worden later gedeeld. Tot die tijd blijft de planning intern.",
  },
  {
    id: "task-lunch",
    title: "Lunchlijst vrijdag",
    source: "Kantine",
    owner: "Kantine",
    when: "17:00",
    column: "todo",
    excerpt: "Keuze: soep of brood.",
    body: "De lunchlijst voor vrijdag staat open. Keuze: soep of brood.",
  },
  {
    id: "task-helix",
    title: "Opbouw afstemmen",
    source: "Helix Events",
    owner: "S. Adler",
    when: "Deze week",
    column: "doing",
    excerpt: "Crew voor de bijeenkomst. Contact staat in het relatiebestand.",
    body: "Helix Events is geboekt voor opbouw en begeleiding. Het contactadres staat in het relatiebestand en in de overeenkomst.",
    docId: "doc-contract",
  },
  {
    id: "task-astra",
    title: "Terugbellen Astra Logistics",
    source: "Agenda",
    owner: "Mara de Vries",
    when: "10:30",
    column: "doing",
    excerpt: "P. Hendriks vroeg om een reactie. Het onderwerp staat in de mail.",
    body: "P. Hendriks vroeg om een reactie op een bericht van gisteren. Het onderwerp staat niet in deze taak, alleen de naam van de relatie.",
  },
  {
    id: "task-contract",
    title: "Contract vloerpartner",
    source: "Documenten",
    owner: "Mara de Vries",
    when: "Getekend",
    column: "doing",
    excerpt: "De overeenkomst staat bij Downloads.",
    body: "De overeenkomst met de vloerpartner staat bij Downloads. Open dat document voor de bestaande afspraken.",
    docId: "doc-contract",
  },
  {
    id: "task-room",
    title: "Vergaderzaal 3",
    source: "Facilitair",
    owner: "Facilitair",
    when: "Vandaag",
    column: "done",
    excerpt: "Gereserveerd op naam van Mara, 10:30 tot 11:15.",
    body: "Vergaderzaal 3 is gereserveerd op naam van Mara de Vries, vandaag van 10:30 tot 11:15.",
  },
  {
    id: "task-dock",
    title: "Zaal geboekt",
    source: "Dokzaal",
    owner: "Mara de Vries",
    when: "Geboekt",
    column: "done",
    excerpt: "De Dokzaal levert de ruimte, niet de crew.",
    body: "De Dokzaal is vastgelegd voor Nexora Day. De zaal levert de ruimte. Crew en planning horen bij de vloerpartner.",
    docId: "doc-plan",
  },
  {
    id: "task-quote",
    title: "Offerte Noordlicht",
    source: "Inkoop",
    owner: "Inkoop",
    when: "Afgewezen",
    column: "done",
    excerpt: "Geen opdracht. Geen rol op Nexora Day.",
    body: "Noordlicht Catering heeft een offerte gestuurd voor een borrel. Inkoop heeft geen opdracht gegeven.",
    docId: "doc-quote",
  },
];

export type Ticket = OfficeNote & { status: "Open" | "In behandeling" | "Gesloten"; attachment?: string };

export const tickets: Ticket[] = [
  {
    id: "hd-4823",
    title: "#4823 Toegang vergaderzaal 3",
    source: "Facilitair",
    when: "Vandaag 11:06",
    status: "Open",
    excerpt: "De badgelezer bij de kantine hapert nog.",
    body: "Vergaderzaal 3 is gereserveerd. De badgelezer bij de kantine hapert nog; facilitair kijkt ernaar. Dit gaat niet over de bijeenkomst.",
    attachment: "Notitie facilitair: de lezer bij de kantine hapert. Geen andere deur genoemd.",
  },
  {
    id: "hd-4817",
    title: "#4817 Printer doet het niet",
    source: "Facilitair",
    when: "Vandaag 10:06",
    status: "Open",
    excerpt: "De printer bij de balie pakt geen papier.",
    body: "De printer bij de balie pakt geen papier. Dit is een gewone storing en hoort niet bij de bijeenkomst.",
  },
  {
    id: "hd-4819",
    title: "#4819 Verbinding op kantoor traag",
    source: "M. Okonkwo",
    when: "Gisteren 16:32",
    status: "In behandeling",
    excerpt: "Het kantoornetwerk is traag. Geen verband met een externe mail.",
    body: "M. Okonkwo meldt dat het kantoornetwerk traag aanvoelt. Er is geen storing gekoppeld aan de bijeenkomst of aan externe mail.",
  },
  {
    id: "hd-4816",
    title: "#4816 Nieuw account extern",
    source: "Mara de Vries",
    when: "Vandaag 08:12",
    status: "Gesloten",
    excerpt: "Het externe team heeft toegang tot deze omgeving.",
    body: "Het account voor het externe team staat open. In deze omgeving staan de gewone bedrijfsstukken.",
  },
  {
    id: "hd-4815",
    title: "#4815 Lunchlijst niet gezien",
    source: "Kantine",
    when: "Maandag 10:14",
    status: "Gesloten",
    excerpt: "De lunchlijst staat in de mail. Keuze: soep of brood.",
    body: "De lunchlijst voor vrijdag is opnieuw gezet in de mail. Keuze: soep of brood.",
  },
];

export const deskNotes: OfficeNote[] = [
  {
    id: "note-today",
    title: "Vandaag op het bord",
    source: "Mara de Vries",
    when: "Vandaag",
    excerpt: "Stand-up, Astra terugbellen, zaal 3, kwartaalcijfers, lunchlijst.",
    body: "09:00 stand-up operatie. 10:30 terugbellen Astra Logistics. 13:00 vergaderzaal 3. 15:00 kwartaalcijfers. 17:00 lunchlijst.",
  },
  {
    id: "note-it",
    title: "Herinnering van IT",
    source: "IT-servicedesk",
    when: "Gisteren",
    excerpt: "Geen wachtwoorden via de mail. Geen onverwacht bestand openen.",
    body: "Deel geen wachtwoorden via de mail en open geen bestand dat je niet verwacht.",
  },
];
