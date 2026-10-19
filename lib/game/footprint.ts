export const claims = [
  { id: "who", label: "Wie Nexora Day leidt" },
  { id: "where", label: "Waar het plaatsvindt" },
  { id: "vendor", label: "Welke partner meebouwt" },
  { id: "leak", label: "Wie te veel deelde" },
  { id: "trust", label: "Waarom een mail van die partner geloofwaardig is" },
  { id: "public", label: "Openbaar, iedereen kon dit lezen" },
] as const;

/** Gewoon collega-bericht. Zelfde tekst in het kantoornieuws en in het eerste archief. */
export const colleaguePost = {
  id: "berg-vrij",
  author: "T. Berg",
  when: "vorige week",
  title: "Twee weken de bergen in",
  body: "Eindelijk vrij. Twee weken de Ardennen in, daarna een paar dagen aan zee. De planten mag de buurman water geven.",
  cue: "Openbaar · iedereen kan dit zien, geen account nodig.",
} as const;

export type ClaimId = (typeof claims)[number]["id"];

export type Source = {
  id: string;
  kind: "bedrijf" | "post" | "foto" | "profiel" | "nieuws" | "partner";
  outlet: string;
  author: string;
  when: string;
  title: string;
  body: string;
  audience?: string;
  shot?: "dock" | "sheet" | "park" | "pass";
};

export const noraArchive =
  "Ik heb een verzameling openbare bronnen gevonden die kort voor de aanval zijn geraadpleegd. Het lijkt erop dat KADE onze organisatie eerst uitgebreid heeft onderzocht. Niet ieder bericht is belangrijk. Onderzoek de bronnen en probeer te reconstrueren welke informatie hij nodig had. Ik kan jullie helpen met het onderzoek, maar jullie moeten zelf de verbanden leggen.";

export const sources: Source[] = [
  {
    id: "mara-lead",
    kind: "bedrijf",
    outlet: "Nexora Netwerk",
    author: "Mara de Vries",
    when: "12 mrt",
    title: "Volgende week open ik het",
    body: "Volgende week open ik Nexora Day. De crew staat klaar en de zaal wordt opgebouwd. Tot dan, en neem schoenen mee waar je een dag op kunt lopen.",
  },
  {
    id: "dock-shot",
    kind: "foto",
    outlet: "Beeld",
    author: "Evenementenfoto",
    when: "14 mrt",
    title: "Eerste opbouw",
    body: "Vroege shift. De kisten staan al binnen, het bord aan de muur is nog van de vorige huurder.",
    shot: "dock",
  },
  {
    id: "helix-floor",
    kind: "bedrijf",
    outlet: "Nexora Netwerk",
    author: "Operations",
    when: "11 mrt",
    title: "Vloer en rigging",
    body: "De vloer en de rigging komen dit jaar van Helix Events. Fijn team om mee te bouwen. Zij kennen de zaal.",
  },
  {
    id: "adler-table",
    kind: "post",
    outlet: "Werkvloer",
    author: "S. Adler",
    when: "15 mrt",
    title: "Run-of-show",
    body: "Run-of-show ligt klaar. Morgen wordt een lange dag met de bouwcrew.",
    shot: "sheet",
  },
  {
    id: "helix-card",
    kind: "partner",
    outlet: "Partnergids",
    author: "Openbare vermelding",
    when: "heel jaar",
    title: "Helix Events",
    body: "Helix Events — evenementenbouw. Vaste partner van Nexora voor zaalopbouw, vloer en crew. Genoemd op de publieke partnerpagina.",
  },
  {
    id: colleaguePost.id,
    kind: "post",
    outlet: "Social",
    author: colleaguePost.author,
    when: colleaguePost.when,
    title: colleaguePost.title,
    body: colleaguePost.body,
    audience: colleaguePost.cue,
  },
  {
    id: "news-week",
    kind: "nieuws",
    outlet: "Havenpost",
    author: "Redactie",
    when: "9 mrt",
    title: "De week van Nexora",
    body: "Nexora Day staat volgende week op de agenda van de stad. Het programma wordt later bekendgemaakt. Bezoekers kunnen zich via de bedrijfssite aanmelden.",
  },
  {
    id: "vale-card",
    kind: "profiel",
    outlet: "Personen",
    author: "J. Vale",
    when: "profiel",
    title: "J. Vale",
    body: "Operatie. Werkt op verdieping 3 en loopt de zaal na als de bouwcrew weg is. Bereikbaar via het interne nummer van de vloer.",
  },
  {
    id: "coffee-post",
    kind: "post",
    outlet: "Kantine",
    author: "Facilities",
    when: "13 mrt",
    title: "Nieuwe bonen",
    body: "Nieuwe bonen in de automaat op verdieping 3. De nachtploeg mag eerst. De oude voorraad gaat naar de vrijdagborrel.",
  },
  {
    id: "quarter-post",
    kind: "nieuws",
    outlet: "Nexora Netwerk",
    author: "Finance",
    when: "8 mrt",
    title: "Kwartaal",
    body: "De kwartaalcijfers volgen vrijdag in de grote vergaderzaal. De presentatie blijft in de map van finance tot het moment van de meeting.",
  },
  {
    id: "run-post",
    kind: "foto",
    outlet: "Vrije tijd",
    author: "L. Crowe",
    when: "7 mrt",
    title: "Tien kilometer",
    body: "Tien kilometer door het stadspark, zaterdag, voor de dienst. Daarna koffie.",
    shot: "park",
  },
  {
    id: "thanks-post",
    kind: "post",
    outlet: "Werkvloer",
    author: "M. Okonkwo",
    when: "14 mrt",
    title: "Late shift",
    body: "Late shift met de bouwcrew. Zonder hen geen zaal. Ik blijf bij de kast tot het licht uitgaat.",
  },
  {
    id: "pass-post",
    kind: "foto",
    outlet: "Kantine",
    author: "Balie",
    when: "16 mrt",
    title: "Pas bij de koffie",
    body: "Iemand liet een pas naast de automaat liggen. Hij ligt bij de balie tot de eigenaar hem ophaalt.",
    shot: "pass",
  },
];

export const boardEvidence = [
  { id: "mara", label: "Mara de Vries" },
  { id: "dok", label: "Dokzaal" },
  { id: "helix", label: "Helix Events" },
  { id: "adler", label: "S. Adler" },
  { id: "listing", label: "Openbare partnervermelding" },
  { id: "vale", label: "J. Vale" },
  { id: "kantine", label: "Kantinepost" },
] as const;

export const boardQuestions = [
  { id: "lead", label: "Wie leidt Nexora Day?" },
  { id: "place", label: "Waar is het evenement?" },
  { id: "vendor", label: "Welke leverancier is publiek gekoppeld?" },
  { id: "leak", label: "Wie zette interne informatie in beeld?" },
  { id: "trust", label: "Waarom zou een mail van die leverancier worden vertrouwd?" },
] as const;

export const reconChoices = {
  event: [
    { id: "nexora-day", label: "Nexora Day" },
    { id: "quarter", label: "Kwartaalpresentatie" },
    { id: "park", label: "Parkloop" },
  ],
  name: [
    { id: "helix", label: "Helix Events" },
    { id: "noord", label: "Noordlicht" },
    { id: "schoon", label: "Schoonmaak Houten" },
  ],
  step: [
    { id: "impersonate", label: "Die naam als afzender gebruiken" },
    { id: "rack", label: "Het rek forceren" },
    { id: "wipe", label: "De kantinepost wissen" },
  ],
} as const;
