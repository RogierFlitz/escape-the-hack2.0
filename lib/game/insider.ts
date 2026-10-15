export const noraInsider =
  "Tijdens het herstel hebben we toegangsregistraties, camerabeelden en interne communicatie teruggevonden. We moeten vaststellen hoe de informatie buiten Nexora terechtkwam. Er zijn meerdere mogelijke verklaringen. Onderzoek de feiten en trek pas een conclusie wanneer het bewijs compleet is.";

export type Still = { id: string; time: string; image: string; caption: string };

export const wall = [
  {
    id: "entry",
    code: "CAM-01",
    place: "Entree Nexora",
    stills: [
      { id: "entry-0155", time: "01:55", image: "/cams/cam-entry-early.jpg", caption: "De hal is leeg." },
      { id: "entry-0248", time: "02:48", image: "/cams/cam-entry-late.jpg", caption: "Iemand loopt vanaf de kantoren de hal in." },
    ],
  },
  {
    id: "cafe",
    code: "CAM-02",
    place: "Kantine",
    stills: [
      { id: "cafe-0210", time: "02:10", image: "/cams/cam-cafe-early.jpg", caption: "Iemand zit aan tafel. Een pas ligt naast het blad." },
      { id: "cafe-0236", time: "02:36", image: "/cams/cam-cafe-late.jpg", caption: "De tafel is leeg. De pas ligt er nog." },
    ],
  },
  {
    id: "dock",
    code: "CAM-03",
    place: "Dokzaal",
    stills: [
      { id: "dock-0231", time: "02:31", image: "/cams/cam-dock-early.jpg", caption: "Iemand in een werkjas staat bij de zaaldeur." },
      { id: "dock-0244", time: "02:44", image: "/cams/cam-dock-late.jpg", caption: "De zaal is leeg." },
    ],
  },
  {
    id: "gate",
    code: "CAM-04",
    place: "Leveranciersingang",
    stills: [
      { id: "gate-0229", time: "02:29", image: "/cams/cam-gate-early.jpg", caption: "Iemand in een werkjas nadert de zijpoort." },
      { id: "gate-0233", time: "02:33", image: "/cams/cam-gate-late.jpg", caption: "De poort is dicht. Niemand in beeld." },
    ],
  },
] as const;

export const accessRows = [
  { time: "02:10", kind: "beeld", text: "Kantine. Iemand aan tafel, pas op het blad." },
  { time: "02:29", kind: "beeld", text: "Leveranciersingang. Werkjas bij de zijpoort." },
  { time: "02:31", kind: "log", text: "Dokpoort. Pas 4418 geregistreerd op naam van J. Vale." },
  { time: "02:31", kind: "beeld", text: "Dokzaal. Werkjas bij de deur. Geen pas in beeld." },
  { time: "02:36", kind: "beeld", text: "Kantine leeg. De pas ligt nog op tafel." },
  { time: "02:40", kind: "ticket", text: "Rek 7. Onderhoudsticket M. Okonkwo, 01:00 tot 03:00." },
  { time: "02:44", kind: "later", text: "Export DOCK-244 via helix-svc. Hoort bij de latere aanval." },
  { time: "02:48", kind: "beeld", text: "Entree. Iemand komt uit de kantoren." },
];

export const people = [
  { id: "vale", name: "J. Vale", role: "Nachtdienst Nexora", quote: "Ik was op het dok voor de crew." },
  { id: "crowe", name: "L. Crowe", role: "Analist", quote: "Ik schreef het rapport. Ik was niet op het dok." },
  { id: "okonkwo", name: "M. Okonkwo", role: "Netwerk", quote: "Ik bleef bij rek 7. Het ticket dekt die uren." },
  { id: "adler", name: "S. Adler", role: "Helix Events, vloer", quote: "Ik hielp de crew de zaal in. Pas HX-19 is van Helix." },
];

export const placeChoices = [
  { id: "kantine", label: "Kantine" },
  { id: "dok", label: "Dokzaal" },
  { id: "rek", label: "Rek 7" },
  { id: "kantoor", label: "Kantoren" },
];

export const shareHistory = [
  { id: "18:12", time: "18:12", text: "Gedeeld met alleen s.adler@helix-events.nl." },
  { id: "19:04", time: "19:04", text: "Delen gewijzigd naar: iedereen met de link." },
  { id: "19:06", time: "19:06", text: "Link geopend vanaf een netwerk buiten Nexora en buiten Helix." },
  { id: "02:14", time: "02:14", text: "Een phishingmail gebruikt details uit de planning." },
  { id: "02:44", time: "02:44", text: "Export DOCK-244 via helix-svc." },
];

export const chatLines = [
  { id: "19:02", time: "19:02", who: "S. Adler", text: "De indeling staat op de deellink, dan kan de crew de maten zien." },
  { id: "19:05", time: "19:05", who: "S. Adler", text: "Ik heb de link opengezet, anders moet iedereen apart inloggen." },
  { id: "02:16", time: "02:16", who: "J. Vale", text: "Er staat een mail van een planningadres. Die kijk ik morgen na." },
  { id: "02:37", time: "02:37", who: "L. Crowe", text: "Ik spiegel alleen de log. Ik ben niet op het dok." },
  { id: "02:41", time: "02:41", who: "M. Okonkwo", text: "Rek 7 staat open voor onderhoud. Ik blijf hier." },
];

export const documents = [
  { id: "planning", label: "planning-nexora-day.xlsx" },
  { id: "mail", label: "De nachtmail" },
  { id: "export", label: "Export DOCK-244" },
];

export const causes = [
  { id: "open-link", label: "De deellink stond te ruim" },
  { id: "phish", label: "De phishingmail" },
  { id: "badge", label: "De pas op het dok" },
  { id: "export", label: "De exportjob" },
];

export const intents = [
  { id: "unintended", label: "Fout bij het delen" },
  { id: "deliberate", label: "Bewust meegewerkt aan de aanval" },
];

export const proof = [
  { id: "share-log", label: "Deelgeschiedenis van de planning" },
  { id: "chat-link", label: "Chat over de opengezette link" },
  { id: "external-open", label: "Opening van buiten Nexora" },
  { id: "cam-dock", label: "Beeld van de dokdeur" },
  { id: "badge-cafe", label: "Pas die in de kantine bleef liggen" },
];

export const sections = [
  { id: "wall", label: "Camera's" },
  { id: "time", label: "Tijdlijn" },
  { id: "people", label: "Dossiers" },
  { id: "doc", label: "Document" },
  { id: "chat", label: "Chat" },
  { id: "board", label: "Bord" },
];
