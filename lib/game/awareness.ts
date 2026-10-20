export type GameMode = "escape" | "awareness" | "nis2" | "eenvoudig";

export const GAME_MODES: GameMode[] = ["escape", "awareness", "nis2", "eenvoudig"];

export const PROLOGUE_SCENES = ["brief", "title", "ghost", "osint", "human", "breach", "market", "hours"] as const;
export type PrologueScene = (typeof PROLOGUE_SCENES)[number];

export type DecisionRecord = {
  id: string;
  choice: string;
  correct: boolean;
  attempts: number;
};

export type AwarenessState = {
  prologue: string[];
  decisions: DecisionRecord[];
  evals: DecisionRecord[];
  pulse: { before: Record<string, string>; after: Record<string, string> };
};

export const PULSE = [
  {
    id: "mail",
    prompt: "Een bekende naam vraagt per mail om een bestand te openen. Wat doe je eerst?",
    choices: [
      { id: "check", label: "Controleren via een kanaal dat je al kent" },
      { id: "open", label: "De bijlage openen, de naam is bekend" },
    ],
    preferred: "check",
  },
  {
    id: "public",
    prompt: "Een collega wil de planning en een badgefoto openbaar delen.",
    choices: [
      { id: "hold", label: "Dat niet delen, ook niet als het feestelijk oogt" },
      { id: "post", label: "Het mag, het is geen wachtwoord" },
    ],
    preferred: "hold",
  },
  {
    id: "supplier",
    prompt: "Een leverancier vraagt om een extra account.",
    choices: [
      { id: "known", label: "Alleen via het bekende contact, met beperkte rechten" },
      { id: "grant", label: "Het account meteen aanmaken" },
    ],
    preferred: "known",
  },
  {
    id: "backup",
    prompt: "Bestanden zijn onbruikbaar. Iemand stuurt een onbekend herstelprogramma.",
    choices: [
      { id: "procedure", label: "De incidentprocedure volgen en het programma niet starten" },
      { id: "run", label: "Het programma starten om tijd te winnen" },
    ],
    preferred: "procedure",
  },
] as const;

export type PulseWhen = "before" | "after";

export type Grade = {
  id: string;
  choice: string;
  correct: boolean;
  accepted: boolean;
  explanation: string;
};

export const BRIEFING_LINES = [
  "Een cyberaanval begint zelden met een groot alarm.",
  "Eerst is er een spoor dat nog niet op een aanval lijkt.",
  "Een openbaar bericht. Een vertrouwde naam. Een sessie die niet had mogen bestaan.",
  "Bij Nexora Technologies loopt de voorbereiding op Nexora Day.",
  "Jullie zijn het beveiligingsteam.",
  "Jullie zien hoe zo'n verhaal begint, lang voordat het scherm rood wordt.",
  "Dit is het begin. Nog geen antwoord.",
  "En wat nodig is om hem te stoppen.",
];

export const GHOST_LINE = "Jullie denken dat een aanval begint wanneer het alarm afgaat. Maar tegen die tijd is het verhaal al begonnen.";
export const OSINT_LINES = [
  "Jullie vertelden me zelf wie jullie waren, waar jullie werkten en met wie jullie samenwerkten.",
];
export const TRUST_LINES = [
  "Informatie alleen opent geen deuren.",
  "Daarvoor heb je vertrouwen nodig.",
  "En ik wist precies wie jullie vertrouwden.",
];
export const BREACH_LINE = "Eenmaal binnen hoef je niet overal tegelijk te zijn. Soms is één open deur voldoende.";
export const MARKET_LINES = [
  "Toegang heeft een prijs.",
  "Informatie heeft een prijs.",
  "En soms wordt ook een oplossing te koop aangeboden.",
];

export const FICTION_ROUTE = "Dit satellietbeeld is een verhaal in de simulatie. Het maakt niemand onvindbaar.";
export const FICTION_MARKET = "Dit is een nagemaakte marktplaats. Er is geen verbinding met een echte markt en er is niets te downloaden.";

export const LEGAL_NOTE =
  "Leermoment, ter juridische verificatie. Het NCSC beschrijft op de pagina over de meldplicht onder de Cyberbeveiligingswet drie fasen voor significante incidenten: een vroegtijdige waarschuwing (uiterlijk 24 uur), een melding (uiterlijk 72 uur) en een eindverslag (binnen een maand). De termijnen tellen vanaf het moment dat de organisatie kennis krijgt van het incident. Drempels verschillen per sector en er zijn uitzonderingen. Bron: ncsc.nl, meldplicht Cyberbeveiligingswet, geraadpleegd voor deze sessie. Medewerkers beslissen die melding niet zelf. Dit spel stuurt geen melding.";

export const MODE_PLAN: Record<GameMode, string> = {
  escape: "Escape Room: ongeveer 60 minuten spel. Plantijd, geen tweede klok.",
  awareness: "Cyber Awareness: briefing, proloog en drie keuzes. De crisis-klok start pas na NORA.",
  nis2: "NIS2-training: ongeveer 75 minuten inclusief nabespreking. Plantijd, geen tweede klok. De spelklok blijft de duur die je hier invult.",
  eenvoudig: "Awareness eenvoudig: dezelfde proloog en keuzes, met een stap-voor-stap begeleiding tijdens de missies. De crisis-klok start pas na NORA. Het huidige spel blijft ongewijzigd.",
};

const ESCALATE_OK = `Juist. Escaleer intern naar de verantwoordelijke of het incidentteam. Medewerkers beslissen een externe melding niet zelf. ${LEGAL_NOTE}`;
const SUPPLIER_OK = "Juist. Beperk de toegang, controleer de accounts opnieuw, verifieer via bekende contacten en informeer de leverancier via de afgesproken procedure. Leveranciersbeveiliging is een gedeelde verantwoordelijkheid.";
const SUPPLIER_NO = "Nog niet compleet. Beoordeel de toegang, controleer accounts opnieuw, verifieer via een bekend contact en informeer de leverancier via de afgesproken procedure. Een samenwerking afkappen of een geheim doorsturen hoort hier niet bij.";
const STRATEGY = "NORA legt de werkstrategie vast: klantdata afschermen, het incidentteam bereikbaar houden, de evenementplanning laten wachten, en alleen herstellen vanuit de gecontroleerde back-upomgeving.";

const PRIORITY_NOTES: Record<string, string> = {
  customers: `Klantdata gaat dan eerst dicht. Het herstel van de bestanden wacht nog. ${STRATEGY}`,
  event: `De evenementplanning komt dan eerst aan de beurt. De vergrendelde systemen blijven dicht. ${STRATEGY}`,
  backup: `De back-upomgeving gaat voor. Herstel kan daarna via een gecontroleerde kopie. ${STRATEGY}`,
  comms: `Het team kan dan weer overleggen. De bestanden blijven vergrendeld tot de back-up volgt. ${STRATEGY}`,
};

export const MISSION_LEARN = [
  {
    id: 1,
    title: "Openbaar delen",
    deed: "Openbare posts, foto's en namen lagen buiten Nexora.",
    hoe: "Wie dat combineert, kan een geloofwaardig verhaal maken over waar mensen werken.",
    voorkom: "Deel op je werk geen planning, badges of interne namen in het openbaar.",
  },
  {
    id: 2,
    title: "Onverwachte mail",
    deed: "Een bericht leek bekend, maar vroeg iets onverwachts.",
    hoe: "Zo'n mail kan mensen laten klikken of informatie laten doorsturen.",
    voorkom: "Controleer onverwachte mail en verifieer het verzoek via een bekend contact.",
  },
  {
    id: 3,
    title: "Toegang",
    deed: "Een bestaande verbinding werd gebruikt om verder te komen.",
    hoe: "Te ruime rechten maken van één sessie een groter incident.",
    voorkom: "Gebruik een extra controle bij het inloggen, houd rechten klein en meld verdachte activiteit.",
  },
  {
    id: 4,
    title: "Back-ups",
    deed: "Belangrijke bestanden waren vergrendeld.",
    hoe: "Zonder gecontroleerde kopie staat het werk stil. Een onbekend pakket voegt risico toe.",
    voorkom: "Herstel via de gecontroleerde back-up. Gebruik geen onbekende software.",
  },
  {
    id: 5,
    title: "Rechten",
    deed: "Een document was ruimer gedeeld dan nodig.",
    hoe: "Externe toegang maakt interne informatie leesbaar voor anderen.",
    voorkom: "Beperk documentrechten en controleer wie buiten de organisatie kan meelezen.",
  },
  {
    id: 6,
    title: "Procedure",
    deed: "Het team volgde de incidentprocedure tot het herstel.",
    hoe: "Stoppen na het eerste herstel laat een deur open.",
    voorkom: "Werk samen, volg de procedure en controleer of het herstel uit een gecontroleerde back-up komt.",
  },
];

export function parseMode(value: unknown): GameMode {
  if (value === "awareness" || value === "nis2" || value === "eenvoudig") return value;
  return "escape";
}

export function includesTraining(mode: GameMode) {
  return mode === "awareness" || mode === "nis2" || mode === "eenvoudig";
}

export function emptyPulse(): AwarenessState["pulse"] {
  return { before: {}, after: {} };
}

export function emptyAwareness(): AwarenessState {
  return { prologue: [], decisions: [], evals: [], pulse: emptyPulse() };
}

function readPulseMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, string> = {};
  for (const item of PULSE) {
    const choice = (value as Record<string, unknown>)[item.id];
    if (typeof choice === "string" && item.choices.some((option) => option.id === choice)) out[item.id] = choice;
  }
  return out;
}

export function pulseComplete(map: Record<string, string> | undefined) {
  return PULSE.every((item) => typeof map?.[item.id] === "string");
}

export function pulseChoiceLabel(questionId: string, choiceId: string) {
  const question = PULSE.find((item) => item.id === questionId);
  return question?.choices.find((item) => item.id === choiceId)?.label ?? "niet vastgelegd";
}

export function recordPulse(state: AwarenessState, when: PulseWhen, answers: Record<string, string>): { state: AwarenessState; unchanged: boolean } | { error: string } {
  const current = state.pulse ?? emptyPulse();
  if (pulseComplete(current[when])) return { state: { ...state, pulse: current }, unchanged: true };
  const next: Record<string, string> = {};
  for (const item of PULSE) {
    const choice = answers[item.id];
    if (!item.choices.some((option) => option.id === choice)) return { error: "De meting is nog niet compleet." };
    next[item.id] = choice;
  }
  return { state: { ...state, pulse: { ...current, [when]: next } }, unchanged: false };
}

export function parseAwareness(value: unknown): AwarenessState {
  const raw = value && typeof value === "object" ? value as Partial<AwarenessState> : {};
  const records = (input: unknown): DecisionRecord[] => {
    if (!Array.isArray(input)) return [];
    return input.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Partial<DecisionRecord>;
      if (typeof row.id !== "string" || typeof row.choice !== "string") return [];
      return [{
        id: row.id,
        choice: row.choice,
        correct: row.correct === true,
        attempts: typeof row.attempts === "number" ? row.attempts : 1,
      }];
    });
  };
  const known = new Set<string>(PROLOGUE_SCENES);
  const pulseRaw = raw.pulse && typeof raw.pulse === "object" ? raw.pulse as { before?: unknown; after?: unknown } : {};
  return {
    prologue: Array.isArray(raw.prologue) ? raw.prologue.filter((item): item is string => typeof item === "string" && known.has(item)) : [],
    decisions: records(raw.decisions),
    evals: records(raw.evals),
    pulse: { before: readPulseMap(pulseRaw.before), after: readPulseMap(pulseRaw.after) },
  };
}

export function prologueComplete(state: AwarenessState) {
  return PROLOGUE_SCENES.every((scene) => state.prologue.includes(scene));
}

export function appendPrologue(state: AwarenessState, scene: string): AwarenessState {
  if (scene === "skip") return { ...state, prologue: [...PROLOGUE_SCENES] };
  if (!PROLOGUE_SCENES.includes(scene as PrologueScene) || state.prologue.includes(scene)) return state;
  return { ...state, prologue: [...state.prologue, scene] };
}

export function markPrologue<T extends { awareness: AwarenessState; breachOffsetSec: number | null }>(team: T, scene: string): T {
  return {
    ...team,
    awareness: appendPrologue(team.awareness, scene),
    breachOffsetSec: team.breachOffsetSec,
  };
}

function parts(choice: string) {
  return choice.split(",").map((item) => item.trim()).filter(Boolean);
}

export function gradeDecision(id: string, raw: string): Grade | null {
  if (id === "escalate") {
    const choice = raw.trim();
    const correct = choice === "escalate";
    const explanation = correct
      ? ESCALATE_OK
      : choice === "notify"
        ? `Medewerkers doen die melding niet zelf. Escaleer intern naar de verantwoordelijke of het incidentteam. ${LEGAL_NOTE}`
        : choice === "wait"
          ? "Afwachten laat de toegang open. Escaleer intern, zodat iemand het incident kan beoordelen."
          : "Sporen wissen hoort niet bij de eerste stap. Escaleer intern en laat het incidentteam de sporen bewaren.";
    if (!["escalate", "notify", "wait", "wipe"].includes(choice)) return null;
    return { id, choice, correct, accepted: correct, explanation };
  }
  if (id === "priority") {
    const choice = raw.trim();
    if (!PRIORITY_NOTES[choice]) return null;
    return {
      id,
      choice,
      correct: choice === "backup",
      accepted: true,
      explanation: PRIORITY_NOTES[choice],
    };
  }
  if (id === "supplier") {
    const selected = parts(raw);
    if (selected.length === 0) return null;
    const required = ["inform", "recheck", "restrict", "verify"];
    const known = new Set([...required, "cut", "forward"]);
    if (selected.some((item) => !known.has(item))) return null;
    const set = new Set(selected);
    const correct = required.every((item) => set.has(item)) && ![...set].some((item) => item === "cut" || item === "forward");
    return {
      id,
      choice: [...set].sort().join(","),
      correct,
      accepted: correct,
      explanation: correct ? SUPPLIER_OK : SUPPLIER_NO,
    };
  }
  return null;
}

const EVALS: Record<string, { correct: string; ok: string; no: string }> = {
  invoice: {
    correct: "verify",
    ok: "Niet betalen. Meld het intern en laat het rekeningnummer controleren via een bekend contact van de leverancier.",
    no: "Een nieuw rekeningnummer in een onverwachte mail is een stopteken. Betaal niet en verifieer via een bekend contact.",
  },
  "public-doc": {
    correct: "limit",
    ok: "Meld het intern en laat de deling beperken. Het team beslist niet zelf of dit een externe melding wordt.",
    no: "Een vertrouwelijk document op een openbare plek hoort intern gemeld te worden, zodat de deling kan worden beperkt.",
  },
  login: {
    correct: "report",
    ok: "Meld de verdachte login en laat het account controleren. Log niet in via de melding zelf.",
    no: "Een verdachte login meld je intern. De link in de melding open je niet.",
  },
  colleague: {
    correct: "procedure",
    ok: "Volg de incidentprocedure. Meld het vermoeden. Beschuldig niemand in de groep en sluit het account niet op eigen houtje.",
    no: "Een vermoeden over een collega-account gaat via de procedure, niet via een publieke beschuldiging.",
  },
  outage: {
    correct: "procedure",
    ok: "Volg de incidentprocedure en schakel de verantwoordelijke in. Gebruik geen onbekend herstelprogramma.",
    no: "Een kritiek systeem dat uit ligt, meld je via de procedure. Onbekende software maakt het herstel riskanter.",
  },
};

export const EVAL_IDS = Object.keys(EVALS);

export function gradeEval(id: string, raw: string): Grade | null {
  const item = EVALS[id];
  if (!item) return null;
  const choice = raw.trim();
  if (!choice) return null;
  const correct = choice === item.correct;
  return { id, choice, correct, accepted: correct, explanation: correct ? item.ok : item.no };
}

function locked(id: string, record: DecisionRecord, kind: "decision" | "eval") {
  if (kind === "decision" && id === "priority") return true;
  return record.correct;
}

function record(list: DecisionRecord[], grade: Grade, kind: "decision" | "eval") {
  const current = list.find((item) => item.id === grade.id);
  if (current && locked(grade.id, current, kind)) return { list, unchanged: true };
  const next: DecisionRecord = {
    id: grade.id,
    choice: grade.choice,
    correct: grade.correct,
    attempts: (current?.attempts ?? 0) + 1,
  };
  return {
    list: current ? list.map((item) => (item.id === grade.id ? next : item)) : [...list, next],
    unchanged: false,
  };
}

export function recordDecision(state: AwarenessState, grade: Grade) {
  const next = record(state.decisions, grade, "decision");
  if (next.unchanged) return { state, unchanged: true };
  return { state: { ...state, decisions: next.list }, unchanged: false };
}

export function recordEval(state: AwarenessState, grade: Grade) {
  const next = record(state.evals, grade, "eval");
  if (next.unchanged) return { state, unchanged: true };
  return { state: { ...state, evals: next.list }, unchanged: false };
}

export function pendingStoryDecision(mode: GameMode, scenes: string[], state: AwarenessState) {
  if (!includesTraining(mode)) return null;
  const done = (id: string) => state.decisions.some((item) => item.id === id && item.correct);
  if (scenes.includes("d2") && !scenes.includes("m3") && !done("escalate")) return "escalate" as const;
  if (scenes.includes("d3") && !scenes.includes("m4") && !done("supplier")) return "supplier" as const;
  return null;
}

export function decisionView(id: "escalate" | "priority" | "supplier") {
  if (id === "escalate") {
    return {
      prompt: "We hebben aanwijzingen voor ongeautoriseerde toegang. Er is mogelijk bedrijfsinformatie betrokken. Wat is nu de juiste volgende stap?",
      multi: false,
      choices: [
        { id: "escalate", label: "Intern escaleren naar de verantwoordelijke of het incidentteam" },
        { id: "notify", label: "Zelf een melding doen bij een externe instantie" },
        { id: "wait", label: "Afwachten tot het vanzelf duidelijk wordt" },
        { id: "wipe", label: "De sporen verwijderen" },
      ],
    };
  }
  if (id === "priority") {
    return {
      prompt: "Er is verstoring en versleuteling. Wat krijgt nu voorrang?",
      multi: false,
      choices: [
        { id: "customers", label: "Klantdata eerst afschermen" },
        { id: "event", label: "Evenementplanning eerst vrijgeven" },
        { id: "backup", label: "Back-upomgeving eerst veiligstellen" },
        { id: "comms", label: "Interne communicatie eerst herstellen" },
      ],
    };
  }
  return {
    prompt: "De leverancier is onderdeel van het incident. Hoe zorgen we dat de samenwerking veilig kan doorgaan?",
    multi: true,
    choices: [
      { id: "restrict", label: "Toegang beperken" },
      { id: "recheck", label: "Accounts opnieuw controleren" },
      { id: "verify", label: "Verifiëren via bekende contacten" },
      { id: "inform", label: "De leverancier informeren via de afgesproken procedure" },
      { id: "cut", label: "De samenwerking meteen en voorgoed stoppen" },
      { id: "forward", label: "Een inloggegeven naar de leverancier sturen" },
    ],
  };
}

export function evalView(id: string) {
  const views: Record<string, { prompt: string; choices: { id: string; label: string }[] }> = {
    invoice: {
      prompt: "Een leverancier mailt dat het rekeningnummer is gewijzigd. De factuur moet vandaag betaald worden.",
      choices: [
        { id: "pay", label: "Betalen naar het nieuwe nummer" },
        { id: "verify", label: "Niet betalen en intern laten verifiëren via een bekend contact" },
        { id: "ignore", label: "De mail negeren" },
      ],
    },
    "public-doc": {
      prompt: "Een vertrouwelijk document staat op een plek die mensen buiten het team kunnen openen.",
      choices: [
        { id: "limit", label: "Intern melden en de deling laten beperken" },
        { id: "hope", label: "Niets doen en hopen dat niemand het ziet" },
        { id: "share", label: "Het document nog breder delen zodat iedereen het kan nakijken" },
      ],
    },
    login: {
      prompt: "Er is een login op een account vanaf een onbekende plek, buiten werktijd.",
      choices: [
        { id: "report", label: "Melden en het account laten controleren" },
        { id: "click", label: "De link in de waarschuwing openen" },
        { id: "ignore", label: "Het laten zitten" },
      ],
    },
    colleague: {
      prompt: "Het lijkt erop dat iemand het account van een collega gebruikt.",
      choices: [
        { id: "procedure", label: "Melden volgens de incidentprocedure" },
        { id: "blame", label: "De collega in de groep beschuldigen en het account zelf sluiten" },
        { id: "ignore", label: "Niets zeggen" },
      ],
    },
    outage: {
      prompt: "Een kritiek systeem ligt eruit. Iemand stuurt een onbekend herstelprogramma.",
      choices: [
        { id: "procedure", label: "De incidentprocedure volgen en geen onbekende software gebruiken" },
        { id: "download", label: "Het onbekende programma starten" },
        { id: "home", label: "Iedereen naar huis sturen zonder melding" },
      ],
    },
  };
  return views[id] ?? null;
}

export function trainingReport(input: {
  team: string;
  date: string;
  mode: GameMode;
  sector?: "general" | "ministeries" | "gemeenten";
  chaptersDone: number;
  hintCount: number;
  awareness: AwarenessState;
}) {
  const lines = [
    "Cybersecurity-awareness-training met NIS2-gerelateerde leerdoelen.",
    `Team: ${input.team}`,
    `Datum: ${input.date}`,
    `Modus: ${input.mode === "nis2" ? "NIS2 Training Experience" : input.mode === "awareness" ? "Cyber Awareness" : input.mode === "eenvoudig" ? "Awareness eenvoudig" : "Escape Room"}`,
    `Branche: ${input.sector === "ministeries" ? "Ministeries" : input.sector === "gemeenten" ? "Gemeenten" : "Algemeen"}`,
    "Dit rapport gaat over het team. Het doet geen uitspraak over wat een persoon weet. Dit is geen certificaat en geen oordeel dat de organisatie aan de Cyberbeveiligingswet voldoet.",
    "",
    "Leerdoelen:",
    ...MISSION_LEARN.map((item) => `- ${item.title}: ${input.chaptersDone >= item.id ? "geraakt" : "nog niet afgerond"}`),
    `- Proloog: ${prologueComplete(input.awareness) ? "gezien" : "niet afgerond"}`,
    "",
    `Missies afgerond: ${input.chaptersDone}/6`,
    "",
    "Keuzes:",
  ];
  for (const id of ["escalate", "priority", "supplier"]) {
    const row = input.awareness.decisions.find((item) => item.id === id);
    lines.push(`- ${id}: ${row ? (row.correct ? "juist" : "anders gekozen") : "niet vastgelegd"} (${row?.attempts ?? 0} poging${row && row.attempts === 1 ? "" : "en"})`);
  }
  if (input.mode === "nis2") {
    lines.push("", "Eindevaluatie:");
    for (const id of EVAL_IDS) {
      const row = input.awareness.evals.find((item) => item.id === id);
      lines.push(`- ${id}: ${row?.correct ? "juist" : "nog niet juist"} (${row?.attempts ?? 0})`);
    }
  }
  const before = input.awareness.pulse?.before ?? {};
  const after = input.awareness.pulse?.after ?? {};
  if (pulseComplete(before) || pulseComplete(after)) {
    lines.push("", "Meting aan het begin en aan het eind. Dit telt niet mee in de score.");
    let beforePreferred = 0;
    let afterPreferred = 0;
    for (const item of PULSE) {
      const start = before[item.id];
      const end = after[item.id];
      if (start === item.preferred) beforePreferred += 1;
      if (end === item.preferred) afterPreferred += 1;
      lines.push(`- ${item.prompt}`);
      lines.push(`  Begin: ${start ? pulseChoiceLabel(item.id, start) : "niet vastgelegd"}`);
      lines.push(`  Eind: ${end ? pulseChoiceLabel(item.id, end) : "niet vastgelegd"}`);
    }
    if (pulseComplete(before)) lines.push(`Voorkeursactie bij de start: ${beforePreferred} van ${PULSE.length}.`);
    if (pulseComplete(after)) lines.push(`Voorkeursactie aan het eind: ${afterPreferred} van ${PULSE.length}.`);
  }
  lines.push("", `Hints: ${input.hintCount}`, "", "Verbeterpunten:");
  const gaps: string[] = [];
  if (!input.awareness.decisions.some((item) => item.id === "escalate" && item.correct)) {
    gaps.push("Oefen interne escalatie: het team meldt bij de verantwoordelijke en beslist een externe melding niet zelf.");
  }
  if (!input.awareness.decisions.some((item) => item.id === "priority" && item.correct)) {
    gaps.push("Bespreek waarom de gecontroleerde back-upomgeving voorgaat op een los evenementbestand.");
  }
  if (!input.awareness.decisions.some((item) => item.id === "supplier" && item.correct)) {
    gaps.push("Bespreek hoe een leverancier in het incident blijft meedoen: toegang, accounts, bekend contact, afgesproken procedure.");
  }
  if (input.mode === "nis2") {
    for (const id of EVAL_IDS) {
      if (!input.awareness.evals.some((item) => item.id === id && item.correct)) gaps.push(`Nabespreking open: ${id}.`);
    }
  }
  if (gaps.length === 0) gaps.push("Het team heeft de keuzes in deze sessie op het beoogde pad gezet. Bespreek ze nog een keer met een eigen voorbeeld van het werk.");
  lines.push(...gaps.map((item) => `- ${item}`));
  lines.push("", LEGAL_NOTE);
  return lines.join("\n");
}
