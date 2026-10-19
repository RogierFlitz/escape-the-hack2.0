import { chapters } from "./content";

export type StoryState = {
  scenes: string[];
  social: boolean;
  backup: boolean;
  finale: string[];
  replay: string | null;
};

export type StoryInput = {
  scene?: string;
  social?: string[];
  backup?: string;
  finale?: string;
  pick?: string;
  clues?: string[];
  checks?: string[];
};

export const SOCIAL_CORRECT = ["wie", "feest", "leverancier", "dok", "samen"] as const;
export const BACKUP_ID = "kluis-nacht";
export const ACCESS_ID = "helix-svc";

export const socialPosts = [
  { id: "wie", source: "LinkedIn", text: "Mara de Vries — operationeel manager bij Nexora. Zij leidt Nexora Day.", useful: true },
  { id: "feest", source: "Instagram", text: "Nexora: volgende week is het personeelsfeest. Iedereen is uitgenodigd.", useful: true },
  { id: "koffie", source: "Intranet-lek", text: "De kantine heeft nieuwe koffie. Geen namen, geen planning.", useful: false },
  { id: "leverancier", source: "Facebook", text: "Helix Events bouwt de vloer voor ons feest. Fijn team.", useful: true },
  { id: "regen", source: "Story", text: "Regen boven de stad. Geen collega, geen locatie.", useful: false },
  { id: "dok", source: "Instagram", text: "Sfeerfoto van de Dokzaal. Op de achtergrond de kade en de zaaldeur.", useful: true },
  { id: "sport", source: "Hardloopclub", text: "Zaterdag 10 km. Dit gaat niet over Nexora.", useful: false },
  { id: "samen", source: "Borrelfoto", text: "Mara met het Helix-team. Badge en planning liggen op tafel.", useful: true },
];

export const backups = [
  { id: "live-mirror", title: "Live Mirror", detail: "Vandaag 09:40. Generatie 23." },
  { id: "shared-recovery", title: "Shared Recovery", detail: "Gisteren 03:12. Generatie 22, met een deelkoppeling." },
  { id: BACKUP_ID, title: "Nachtelijke Kluis", detail: "Gisteren 03:10. Generatie 22." },
];

export const sessions = [
  { id: "vale", title: "j.vale", detail: "Workstation-14. Alleen de mailbox, geen export." },
  { id: ACCESS_ID, title: "helix-svc", detail: "Export-node. Nog aangemeld. Bezocht de kluis om 02:06." },
  { id: "print", title: "printer-3", detail: "Facilitaire wachtrij. Geen toegang tot bestanden." },
];

export type Speech = {
  id: string;
  speaker: "kade" | "nora";
  kicker: string;
  title: string;
  lines: string[];
  learn?: { deed: string; hoe: string; voorkom: string };
  continueLabel: string;
};

const openIncident: Speech = {
  id: "incident",
  speaker: "kade",
  kicker: "INCIDENT",
  title: "SYSTEM COMPROMISED",
  continueLabel: "Sporen volgen",
  lines: [
    "Zo, daar zijn jullie dan.",
    "Het externe beveiligingsteam van Nexora.",
    "Jullie kwamen hier om een mogelijk informatielek te onderzoeken.",
    "Maar jullie zijn te laat.",
    "Ik weet wie jullie medewerkers zijn.",
    "Ik weet met welke bedrijven jullie samenwerken.",
    "Ik weet waar jullie bestanden staan.",
    "En het mooiste is...",
    "Ik hoefde niet eens alles zelf uit te zoeken.",
    "Jullie hebben mij geholpen.",
    "Jullie vertrouwden de naam Helix. En het logo.",
    "Het adres hebben jullie niet gelezen.",
    "planning@helix-event.co.",
    "Dat is niet events@helix-events.nl.",
    "Een s te weinig. .co in plaats van .nl.",
    "Daarom was dit de verkeerde keuze.",
    "De aanval gaat door. Ik was al binnen.",
    "Mijn naam is KADE.",
    "Ik heb toegang tot jullie systemen en jullie belangrijkste bestanden zijn vergrendeld.",
    "Over zestig minuten activeert mijn laatste fase.",
    "Willen jullie Nexora redden?",
    "Dan moeten jullie ontdekken hoe ik binnenkwam.",
    "Volg mijn sporen.",
    "Misschien zijn jullie slimmer dan ik denk.",
  ],
};

const reportIncident: Speech = {
  id: "incident",
  speaker: "kade",
  kicker: "INCIDENT",
  title: "SYSTEM COMPROMISED",
  continueLabel: "Sporen volgen",
  lines: [
    "Interessant.",
    "Jullie hebben mijn vervalste bericht herkend.",
    "Dat had ik niet verwacht.",
    "Jullie meldden de mail.",
    "planning@helix-event.co.",
    "Dat is niet events@helix-events.nl.",
    "Een s te weinig. .co in plaats van .nl.",
    "Daarom was melden de juiste keuze.",
    "Maar denk niet dat daarmee alles veilig is.",
    "Ik was namelijk al binnen voordat jullie die mail ontvingen.",
    "Jullie keuze heeft dit niet gestart.",
    "Jullie hebben één aanval voorkomen.",
    "Nu moeten jullie de rest nog stoppen.",
  ],
};

const missionSpeech: Speech[] = [
  {
    id: "m1",
    speaker: "kade",
    kicker: "MISSIE 1",
    title: "Digital Footprint",
    continueLabel: "Onderzoek openen",
    lines: [
      "Ik begon niet met het kraken van computers. Ik begon met kijken.",
      "Jullie noemen het social media. Ik noem het mijn informatiebron.",
      "Niet elk bericht was bruikbaar. Zoek zelf wat ik nodig had.",
    ],
  },
  {
    id: "k1",
    speaker: "kade",
    kicker: "KADE",
    title: "Wat hij al wist",
    continueLabel: "Verder",
    lines: [
      "Goed gevonden.",
      "Jullie beginnen te begrijpen hoe ik te werk ging.",
      "Ik hoefde geen ingewikkelde systemen te kraken om jullie te leren kennen.",
      "Jullie vertelden me zelf wie jullie waren, waar jullie werkten en met wie jullie samenwerkten.",
      "Maar informatie alleen opent geen deuren.",
      "Daarvoor heb je vertrouwen nodig.",
      "En ik wist precies wie jullie vertrouwden.",
    ],
  },
  {
    id: "m2",
    speaker: "kade",
    kicker: "MISSIE 2",
    title: "The Fake Supplier",
    continueLabel: "Onderzoek openen",
    lines: [
      "Jullie hebben ontdekt wat ik wist.",
      "Maar informatie is pas waardevol wanneer iemand je vertrouwt.",
      "Een bekende naam. Een vertrouwd logo. Een bericht op precies het juiste moment.",
      "Soms is dat alles wat je nodig hebt.",
      "Eens kijken of jullie kunnen ontdekken welk bericht werkelijk van Helix kwam.",
    ],
  },
  {
    id: "k2a",
    speaker: "kade",
    kicker: "KADE",
    title: "Het teken",
    continueLabel: "Verder",
    lines: [
      "Dat ene teken.",
      "Meer was er niet nodig om jullie aandacht op het verkeerde spoor te zetten.",
    ],
  },
  {
    id: "k2",
    speaker: "kade",
    kicker: "KADE",
    title: "Meer dan een mail",
    continueLabel: "Verder",
    lines: [
      "Jullie hebben mijn bericht gevonden.",
      "Goed gedaan.",
      "Maar denken jullie werkelijk dat één e-mail mijn hele plan was?",
      "Ik was al binnen voordat jullie die bijlage zagen.",
      "Jullie hebben mijn woorden onderzocht.",
      "Nu mogen jullie mijn verbindingen onderzoeken.",
    ],
  },
  {
    id: "m3",
    speaker: "kade",
    kicker: "MISSIE 3",
    title: "Network Lockdown",
    continueLabel: "Netwerk openen",
    lines: [
      "Jullie hebben mijn bericht gevonden.",
      "Maar een e-mail is slechts één manier om binnen te komen.",
      "Terwijl jullie naar afzenders en bijlagen keken, bewoog ik me al door jullie netwerk.",
      "Ik had geen toegang tot alles.",
      "Nog niet.",
      "Maar jullie systemen vertrouwen elkaar meer dan ze zouden moeten.",
      "En dat vertrouwen ga ik gebruiken.",
    ],
  },
  {
    id: "k3a",
    speaker: "kade",
    kicker: "KADE",
    title: "De lijn",
    continueLabel: "Verder",
    lines: [
      "Die lijn.",
      "Jullie hebben hem gevonden.",
      "Maar zien is nog niet hetzelfde als afsluiten.",
    ],
  },
  {
    id: "k3",
    speaker: "kade",
    kicker: "KADE",
    title: "Te laat voor de bestanden",
    continueLabel: "Verder",
    lines: [
      "Jullie hebben mijn verbinding gevonden.",
      "En jullie hebben een deel van mijn route afgesloten.",
      "Indrukwekkend.",
      "Maar jullie zijn te laat voor de bestanden.",
      "Die zijn al versleuteld.",
      "Jullie kunnen mijn toegang blokkeren, maar kunnen jullie ook herstellen wat ik heb achtergelaten?",
    ],
  },
  {
    id: "m4",
    speaker: "kade",
    kicker: "MISSIE 4",
    title: "Encryption Protocol",
    continueLabel: "Bestanden openen",
    lines: [
      "Jullie hebben mijn verbinding afgesloten.",
      "Maar daarmee krijgen jullie je bestanden niet terug.",
      "Contracten. Planningen. Personeelsgegevens.",
      "Allemaal achter slot.",
      "Er zijn kopieën, natuurlijk.",
      "Maar weten jullie zeker dat jullie die kunnen vertrouwen?",
      "Eén verkeerde herstelactie en jullie halen het probleem gewoon opnieuw naar binnen.",
    ],
  },
  {
    id: "k4",
    speaker: "kade",
    kicker: "KADE",
    title: "De bestanden",
    continueLabel: "Verder",
    lines: [
      "Jullie hebben de bestanden terug.",
      "Dat had ik niet verwacht.",
      "Maar jullie begrijpen nog steeds niet hoe dit allemaal begon.",
      "Jullie zoeken naar technische fouten.",
      "Misschien moeten jullie eens naar de mensen kijken.",
      "Soms hoeft niemand kwaad te willen om toch een deur open te zetten.",
    ],
  },
  {
    id: "m5",
    speaker: "kade",
    kicker: "MISSIE 5",
    title: "The Insider",
    continueLabel: "Archief openen",
    lines: [
      "Jullie hebben de bestanden teruggevonden.",
      "Maar jullie blijven naar computers kijken.",
      "Misschien moeten jullie eens kijken naar de mensen achter die computers.",
      "Wie had toegang?",
      "Wie wist wat?",
      "En wie liet informatie achter op een plek waar die niet hoorde?",
      "Ik ben benieuwd wie jullie gaan beschuldigen.",
    ],
  },
  {
    id: "k5",
    speaker: "kade",
    kicker: "KADE",
    title: "Een kans",
    continueLabel: "Verder",
    lines: [
      "Daar is jullie antwoord.",
      "Geen geheime samenzwering.",
      "Geen medewerker die mij bewust hielp.",
      "Gewoon informatie die op de verkeerde plek terechtkwam.",
      "Jullie noemen het een fout.",
      "Ik noem het een kans.",
      "En kansen laat ik niet liggen.",
      "Maar jullie zijn er nog niet.",
      "Jullie hebben ontdekt hoe ik begon.",
      "Jullie hebben mijn route gevonden.",
      "Jullie hebben de bestanden terug.",
      "Toch staat er nog steeds een deur open.",
    ],
  },
  {
    id: "m6",
    speaker: "kade",
    kicker: "FINALE",
    title: "Final Shutdown",
    continueLabel: "Crisis openen",
    lines: [
      "Jullie hebben de bestanden terug.",
      "Jullie weten hoe de informatie buiten kwam.",
      "Maar er staat nog een sessie open.",
      "Zolang die deur openstaat, is dit niet voorbij.",
      "Zoek de verbinding die niet bij de werkdag hoort.",
      "Sluit haar pas als het bewijs klopt.",
    ],
  },
];

const discoveries: Speech[] = [
  {
    id: "d1",
    speaker: "nora",
    kicker: "NORA",
    title: "Openbare informatie",
    continueLabel: "Naar de valse leverancier",
    lines: [
      "KADE gebruikte openbare informatie om een geloofwaardige identiteit op te bouwen.",
      "Door gegevens te combineren kon hij een overtuigende phishingaanval voorbereiden.",
      "Controleer wat je openbaar deelt, let op vertrouwelijke informatie in foto's, en verifieer een onverwacht verzoek via een bekend kanaal.",
      "We hebben een nieuwe aanwijzing gevonden die naar de communicatie met een leverancier leidt. Laten we onderzoeken hoe hij dat vertrouwen heeft misbruikt.",
    ],
    learn: {
      deed: "Openbare posts, foto's en namen lagen buiten Nexora.",
      hoe: "Wie dat combineert, kan een geloofwaardig verhaal maken over waar mensen werken.",
      voorkom: "Deel op je werk geen planning, badges of interne namen in het openbaar.",
    },
  },
  {
    id: "d2",
    speaker: "nora",
    kicker: "NORA",
    title: "De communicatie",
    continueLabel: "Naar het netwerk",
    lines: [
      "De communicatieanalyse is afgerond.",
      "KADE gebruikte een vervalste leveranciersidentiteit om vertrouwen te winnen.",
      "De naam, context en inhoud van het bericht sloten aan op echte bedrijfsinformatie.",
      "Controleer het volledige afzenderadres, verifieer onverwachte verzoeken via bekende contactgegevens en behandel verdachte bijlagen voorzichtig.",
      "We hebben aanwijzingen voor eerdere ongeautoriseerde toegang. De volgende stap is het onderzoeken van de netwerkverbindingen.",
    ],
    learn: {
      deed: "Een bericht leek bekend, maar vroeg iets onverwachts.",
      hoe: "Zo'n mail kan mensen laten klikken of informatie laten doorsturen.",
      voorkom: "Controleer onverwachte mail en verifieer het verzoek via een bekend contact.",
    },
  },
  {
    id: "d3",
    speaker: "nora",
    kicker: "NORA",
    title: "De sessie is geïsoleerd",
    continueLabel: "Naar de versleuteling",
    lines: [
      "De verdachte netwerkroute is geïsoleerd.",
      "De kritieke systemen zijn voorlopig beveiligd.",
      "Maar meerdere bestanden blijven versleuteld.",
      "We moeten onderzoeken welke back-ups nog betrouwbaar zijn en hoe we de gegevens veilig kunnen herstellen.",
    ],
    learn: {
      deed: "Een bestaande verbinding werd gebruikt om verder te komen.",
      hoe: "Te ruime rechten maken van één sessie een groter incident.",
      voorkom: "Gebruik een extra controle bij het inloggen, houd rechten klein en meld verdachte activiteit.",
    },
  },
  {
    id: "d4",
    speaker: "nora",
    kicker: "NORA",
    title: "Herstel voltooid",
    continueLabel: "Naar het spoor",
    lines: [
      "De herstelprocedure is voltooid.",
      "De gecontroleerde back-up is betrouwbaar en de belangrijkste bestanden zijn weer toegankelijk.",
      "Tijdens het herstel hebben we nieuwe aanwijzingen gevonden over de toegang tot de evenementlocatie en de betrokken leverancier.",
      "We moeten reconstrueren hoe interne informatie oorspronkelijk buiten Nexora terechtkwam.",
    ],
    learn: {
      deed: "Belangrijke bestanden waren vergrendeld.",
      hoe: "Zonder gecontroleerde kopie staat het werk stil. Een onbekend pakket voegt risico toe.",
      voorkom: "Herstel via de gecontroleerde back-up. Gebruik geen onbekende software.",
    },
  },
  {
    id: "d5",
    speaker: "nora",
    kicker: "NORA",
    title: "Het lek is rond",
    continueLabel: "Naar de finale",
    lines: [
      "Het oorspronkelijke informatielek is gereconstrueerd.",
      "De beschikbare bewijzen wijzen op een onbedoelde fout bij het delen van de planning.",
      "We hebben nu voldoende informatie om KADE's aanval te reconstrueren.",
      "Maar zijn resterende toegang is nog niet definitief ingetrokken.",
      "Alleen wanneer we die toegang veilig afsluiten, kunnen we het incident beëindigen.",
    ],
    learn: {
      deed: "Een document was ruimer gedeeld dan nodig.",
      hoe: "Externe toegang maakt interne informatie leesbaar voor anderen.",
      voorkom: "Beperk documentrechten en controleer wie buiten de organisatie kan meelezen.",
    },
  },
];

export const winLines = [
  "THREAT CONTAINED",
  "NEXORA SECURED",
  "De resterende toegang is ingetrokken.",
  "De gecontroleerde back-up is bevestigd.",
  "Het netwerk kan weer worden vrijgegeven.",
];

export const failLines = [
  "De klok liep af voordat de laatste toegang werd ingetrokken.",
  "Wat jullie al hadden vastgelegd, blijft in dit rapport.",
  "De sessie stond nog open.",
];

export function noraNote(missionId: number) {
  const notes: Record<number, string> = {
    1: "Niet elke bron hoort in zijn voorbereiding. Ik geef het verband niet.",
    2: "Niet elk bericht in deze set is betrouwbaar. Ik geef de afzender niet.",
    3: "Onderzoek de verbindingen voordat je iets uitzet. Ik wijs de sessie niet aan.",
    4: "Open de bestanden voordat je iets terugzet. Ik wijs de kopie niet aan.",
    5: "Vergelijk wat een camera toont met wat een log of een chat beweert. Ik wijs niemand aan.",
    6: "Vergelijk wat een sessie deed met de route en de export. Ik wijs haar niet aan.",
  };
  return notes[missionId] ?? "Ik volg mee. De oplossing zeg ik niet.";
}

export function emptyStory(): StoryState {
  return { scenes: [], social: false, backup: false, finale: [], replay: null };
}

export function parseStory(value: unknown): StoryState {
  const raw = value && typeof value === "object" ? value as Partial<StoryState> : {};
  return {
    scenes: Array.isArray(raw.scenes) ? raw.scenes.filter((item) => typeof item === "string") : [],
    social: raw.social === true,
    backup: raw.backup === true,
    finale: Array.isArray(raw.finale) ? raw.finale.filter((item) => typeof item === "string") : [],
    replay: typeof raw.replay === "string" ? raw.replay : null,
  };
}

export function speech(id: string, reported: boolean): Speech | null {
  if (id === "incident") return reported ? reportIncident : openIncident;
  return missionSpeech.find((item) => item.id === id) ?? discoveries.find((item) => item.id === id) ?? null;
}

export function missionTitle(id: number) {
  return chapters.find((chapter) => chapter.id === id)?.title ?? "Missie";
}

export type Beat =
  | { kind: "transmission"; id: string }
  | { kind: "discovery"; id: string }
  | { kind: "social" }
  | { kind: "backup" }
  | { kind: "finale"; step: "access" | "revoke" | "backup-check" }
  | { kind: "puzzle"; puzzleId: string }
  | { kind: "done" };

function puzzlesOf(id: number) {
  return chapters.find((chapter) => chapter.id === id)?.puzzles ?? [];
}

function missionCleared(solved: string[], id: number) {
  return puzzlesOf(id).every((puzzle) => solved.includes(puzzle));
}

export function nextBeat(story: StoryState, solved: string[], _reported = false): Beat {
  if (story.replay && speech(story.replay, false)) return { kind: "transmission", id: story.replay };
  if (!story.scenes.includes("incident")) return { kind: "transmission", id: "incident" };
  for (const chapter of chapters) {
    if (chapter.id > 1 && !missionCleared(solved, chapter.id - 1)) return { kind: "done" };
    if (chapter.id > 1 && !story.scenes.includes(`d${chapter.id - 1}`)) return { kind: "discovery", id: `d${chapter.id - 1}` };
    if (!story.scenes.includes(`m${chapter.id}`)) return { kind: "transmission", id: `m${chapter.id}` };
    if (
      chapter.id === 2 &&
      solved.includes("ch2-acrostic") &&
      !solved.includes("ch2-meta") &&
      !story.scenes.includes("k2a")
    ) {
      return { kind: "transmission", id: "k2a" };
    }
    if (
      chapter.id === 3 &&
      solved.includes("ch3-logic") &&
      solved.includes("ch3-path") &&
      !solved.includes("ch3-boot") &&
      !story.scenes.includes("k3a")
    ) {
      return { kind: "transmission", id: "k3a" };
    }
    if (chapter.id === 6) {
      if (!story.finale.includes("access")) return { kind: "finale", step: "access" };
      if (!story.finale.includes("revoke")) return { kind: "finale", step: "revoke" };
      if (!solved.includes("ch6-seals")) return { kind: "puzzle", puzzleId: "ch6-seals" };
      if (!story.finale.includes("backup-check")) return { kind: "finale", step: "backup-check" };
      if (!solved.includes("ch6-shutdown")) return { kind: "puzzle", puzzleId: "ch6-shutdown" };
      return { kind: "done" };
    }
    const open = chapter.puzzles.find((puzzle) => !solved.includes(puzzle));
    if (open) return { kind: "puzzle", puzzleId: open };
    if (chapter.id === 4 && !story.backup) return { kind: "backup" };
    if (chapter.id === 1 && !story.scenes.includes("k1") && !story.scenes.includes("d1")) {
      return { kind: "transmission", id: "k1" };
    }
    if (chapter.id === 2 && !story.scenes.includes("k2") && !story.scenes.includes("d2")) {
      return { kind: "transmission", id: "k2" };
    }
    if (chapter.id === 3 && !story.scenes.includes("k3") && !story.scenes.includes("d3")) {
      return { kind: "transmission", id: "k3" };
    }
    if (chapter.id === 4 && !story.scenes.includes("k4") && !story.scenes.includes("d4")) {
      return { kind: "transmission", id: "k4" };
    }
    if (chapter.id === 5 && !story.scenes.includes("k5") && !story.scenes.includes("d5")) {
      return { kind: "transmission", id: "k5" };
    }
    if (!story.scenes.includes(`d${chapter.id}`)) return { kind: "discovery", id: `d${chapter.id}` };
  }
  return { kind: "done" };
}

function sameSet(left: string[], right: readonly string[]) {
  const a = [...left].sort();
  const b = [...right].sort();
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

export function applyStory(story: StoryState, solved: string[], reported: boolean, input: StoryInput): { story: StoryState } | { error: string } {
  const beat = nextBeat(story, solved, reported);
  const next = { ...story, scenes: [...story.scenes], finale: [...story.finale] };
  if (input.scene) {
    if (story.replay === input.scene) {
      next.replay = null;
      if (!next.scenes.includes(input.scene)) next.scenes.push(input.scene);
      return { story: next };
    }
    if ((beat.kind !== "transmission" && beat.kind !== "discovery") || beat.id !== input.scene) {
      return { error: "Deze scène is nu niet aan de beurt." };
    }
    if (!next.scenes.includes(input.scene)) next.scenes.push(input.scene);
    next.replay = null;
    return { story: next };
  }
  if (input.social) {
    if (beat.kind !== "social") return { error: "De berichten zijn nu niet aan de beurt." };
    if (!sameSet(input.social, SOCIAL_CORRECT)) return { error: "Dit zijn niet de vijf sporen die KADE gebruikte." };
    next.social = true;
    return { story: next };
  }
  if (input.backup) {
    if (beat.kind !== "backup") return { error: "De back-up is nu niet aan de beurt." };
    if (input.backup !== BACKUP_ID) return { error: "NORA: Deze kopie haalt het probleem weer naar binnen. Vergelijk tijd, verbinding en de toegangslog." };
    next.backup = true;
    return { story: next };
  }
  if (input.finale) {
    if (beat.kind !== "finale" || beat.step !== input.finale) return { error: "Deze stap is nu niet aan de beurt." };
    if (input.finale === "access" && input.pick !== ACCESS_ID) return { error: "NORA: Die sessie hoort bij een gewone taak. Vergelijk tijd, herkomst en wat ze heeft aangeraakt." };
    if (input.finale === "access") {
      const clues = input.clues ?? [];
      const matched = ["export", "route", "vault"].filter((id) => clues.includes(id));
      if (matched.length < 2) return { error: "NORA: De naam alleen is niet genoeg. Wijs minstens twee sporen aan die bij deze sessie horen." };
    }
    if (input.finale === "backup-check" && !story.backup) return { error: "Er is nog geen schone back-up gekozen." };
    if (input.finale === "backup-check") {
      const checks = input.checks ?? [];
      if (checks.includes("share-open")) return { error: "NORA: Die deellink staat nog open. Die hoort niet bij de schone set." };
      const needed = ["files", "kluis", "revoked", "route", "share-closed"];
      if (!needed.every((id) => checks.includes(id))) return { error: "NORA: De controle is nog niet compleet. Er staat nog een open lijn in de lijst." };
    }
    if (!next.finale.includes(input.finale)) next.finale.push(input.finale);
    return { story: next };
  }
  return { error: "Geen verhaalactie." };
}

export function missionReady(story: StoryState, solved: string[], puzzleId: string) {
  const chapter = chapters.find((item) => item.puzzles.includes(puzzleId as never));
  if (!chapter) return "Onbekende opdracht.";
  if (!story.scenes.includes(`m${chapter.id}`)) return "KADE heeft deze missie nog niet geopend.";
  if (chapter.id >= 5 && !story.backup) return "Kies eerst de schone back-up.";
  if (puzzleId === "ch6-seals" && (!story.finale.includes("access") || !story.finale.includes("revoke"))) {
    return "Trek eerst de sessie van KADE in.";
  }
  if (puzzleId === "ch6-shutdown" && !story.finale.includes("backup-check")) return "Controleer eerst de back-up.";
  if (chapter.id > 1 && !missionCleared(solved, chapter.id - 1)) return "Deze laag is nog vergrendeld.";
  return null;
}

export function dossier(story: StoryState) {
  return discoveries.filter((item) => story.scenes.includes(item.id) && item.learn);
}

export function lastTransmission(story: StoryState) {
  const ids = ["incident", "m1", "k1", "m2", "k2a", "k2", "m3", "k3a", "k3", "m4", "k4", "m5", "k5", "m6"];
  return [...story.scenes].reverse().find((id) => ids.includes(id)) ?? null;
}
