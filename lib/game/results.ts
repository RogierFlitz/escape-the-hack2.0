import { decisionView, evalView, EVAL_IDS, LEGAL_NOTE, MISSION_LEARN, type GameMode } from "./awareness";
import { parseSector, sectorLine, type Sector } from "./sector";
import { chapters, puzzles } from "./content";
import { completedChapters, scoreBreakdown } from "../scoring";
import { crisisElapsedSec, teamRemainingSec } from "../time";
import type { Session, Team, TeamStatus } from "../types";

export const PASS_RULE =
  "Geslaagd is de bestaande status afgerond: het team heeft alle opdrachten voltooid. Er is geen scoregrens. Niet geslaagd is de bestaande status mislukt: de tijd was om, of de instructeur sloot de sessie terwijl het team nog speelde. Die twee oorzaken worden niet apart bewaard.";

export const TIE_RULE =
  "Een hogere score staat hoger. Bij een gelijke score staat de teamnaam die alfabetisch eerder komt hoger, en de plaatsen blijven opeenvolgend. Dat is dezelfde volgorde als de positie in het spel.";

export const DISCLAIMER =
  "Deelname en deze spelresultaten tonen niet aan dat een persoon of organisatie voldoet aan de NIS2-richtlijn of de Cyberbeveiligingswet.";

const THEME: Record<number, string> = {
  1: "OSINT en informatiebewustzijn",
  2: "Phishing en leverancierscontrole",
  3: "Netwerkbeveiliging en incidentrespons",
  4: "Ransomware, back-ups en herstel",
  5: "Interne risico's en informatie delen",
  6: "Dreigingsanalyse en veilig herstel",
};

const FINALE_STEP: Record<string, string> = {
  access: "Sessie aangewezen",
  revoke: "Sessie ingetrokken",
  "ch6-seals": "Systemen vastgezet",
  "backup-check": "Herstelcontrole vastgelegd",
  "ch6-shutdown": "Afsluiting bevestigd",
};

export type Outcome = "geslaagd" | "niet geslaagd" | "bezig" | "nog niet gestart";
export type AdviceKind = "gemeten" | "algemeen";

export type Advice = {
  id: string;
  topic: string;
  kind: AdviceKind;
  why: string;
  trigger: string;
  change: string;
  exercise: string;
};

export type MissionCard = {
  id: number;
  title: string;
  theme: string;
  state: "afgerond" | "bezig" | "niet gestart" | "open gebleven";
  solved: number;
  total: number;
  hints: number;
  instructorHints: number;
  openPuzzles: string[];
  hintedPuzzles: string[];
  signals: string[];
  good: string[];
  improve: string[];
  timeNote: string;
  decisionNote: string;
};

export type TeamReport = {
  name: string;
  code: string;
  status: TeamStatus;
  outcome: Outcome;
  score: number;
  breakdown: { puzzlePoints: number; chapterBonus: number; timeBonus: number; completionBonus: number; total: number };
  elapsedSec: number;
  remainingSec: number;
  hints: number;
  instructorHints: number;
  penaltySec: number;
  extraSec: number;
  fails: number;
  phish: "gemeld" | "niet gemeld" | "nog niet aan de beurt";
  missionsDone: number;
  solved: number;
  total: number;
  missions: MissionCard[];
  strengths: string[];
  improvements: string[];
  advice: Advice[];
};

export type BoardRow = {
  rank: number;
  name: string;
  code: string;
  status: TeamStatus;
  outcome: Outcome;
  score: number;
  missionsDone: number;
  solved: number;
  total: number;
  hints: number;
  instructorHints: number;
  fails: number;
  elapsedSec: number;
  remainingSec: number;
  tiedScore: boolean;
};

export type SessionReport = {
  session: { id: string; name: string; mode: GameMode; status: Session["status"] };
  generatedAt: number;
  passRule: string;
  tieRule: string;
  disclaimer: string;
  modeNote: string;
  legalNote: string | null;
  participants: null;
  participantsNote: string;
  counts: { teams: number; passed: number; failed: number; playing: number; ready: number };
  passRate: { passed: number; teams: number; percent: number | null; note: string };
  averageScore: number | null;
  highestScore: number | null;
  averageElapsedSec: number | null;
  averageElapsedNote: string;
  averageHints: number | null;
  missions: { id: number; title: string; theme: string; teamsDone: number; teams: number }[];
  topics: { topic: string; teams: number }[];
  leaderboard: BoardRow[];
  teams: TeamReport[];
};

export type PlayerReport = {
  ok: true;
  sessionName: string;
  mode: GameMode;
  passRule: string;
  tieRule: string;
  disclaimer: string;
  modeNote: string;
  legalNote: string | null;
  team: Omit<TeamReport, "code">;
  leaderboard: Omit<BoardRow, "code">[];
};

export function outcomeOf(status: TeamStatus): Outcome {
  if (status === "completed") return "geslaagd";
  if (status === "failed") return "niet geslaagd";
  if (status === "ready") return "nog niet gestart";
  return "bezig";
}

export function formatClock(total: number) {
  const safe = Math.max(0, Math.floor(total));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function sum(record: Record<string, number>, ids: readonly string[]) {
  return ids.reduce((total, id) => total + (record[id] ?? 0), 0);
}

function hintCount(team: Team) {
  return Object.values(team.hints).reduce((total, level) => total + level, 0);
}

function instructorCount(team: Team) {
  return Object.values(team.instructorHints).reduce((total, level) => total + level, 0);
}

function choiceLabel(id: string, choice: string) {
  const view = id === "escalate" || id === "priority" || id === "supplier" ? decisionView(id) : evalView(id);
  if (!view) return choice;
  return choice
    .split(",")
    .map((part) => view.choices.find((item) => item.id === part.trim())?.label ?? part.trim())
    .join(", ");
}

function missionCards(team: Team): MissionCard[] {
  const current = chapters.find((chapter) => !chapter.puzzles.every((id) => team.solved.includes(id)))?.id ?? 6;
  return chapters.map((chapter) => {
    const items = puzzles.filter((puzzle) => puzzle.chapterId === chapter.id);
    const solved = items.filter((puzzle) => team.solved.includes(puzzle.id));
    const open = items.filter((puzzle) => !team.solved.includes(puzzle.id));
    const hinted = items.filter((puzzle) => (team.hints[puzzle.id] ?? 0) > 0);
    const instructor = sum(team.instructorHints, chapter.puzzles);
    const started = solved.length > 0 || (team.status === "playing" && current === chapter.id);
    const state: MissionCard["state"] = solved.length === items.length
      ? "afgerond"
      : solved.length === 0 && !started
        ? "niet gestart"
        : team.status === "playing"
          ? "bezig"
          : "open gebleven";
    const signals: string[] = [];
    if (chapter.id === 2) {
      signals.push(team.breachOffsetSec === null ? "De aanval is nog niet gestart, dus er is nog geen mailmelding." : team.phishReported ? "Valse mail gemeld." : "Valse mail niet gemeld.");
    }
    if (chapter.id === 6) {
      const recorded = team.story.finale.map((step) => FINALE_STEP[step] ?? step);
      signals.push(recorded.length > 0 ? `Vastgelegde afsluitstappen: ${recorded.join(", ")}.` : "Nog geen afsluitstap vastgelegd.");
    }
    const good: string[] = [];
    const improve: string[] = [];
    if (state === "afgerond" && hinted.length === 0) good.push("Alle opdrachten afgerond zonder hint van het team.");
    else if (state === "afgerond") good.push("Alle opdrachten afgerond.");
    if (chapter.id === 2 && team.phishReported) good.push("De valse mail is gemeld.");
    if (chapter.id === 6 && team.story.finale.length > 0) good.push(`${team.story.finale.length} afsluitstap${team.story.finale.length === 1 ? "" : "pen"} vastgelegd.`);
    if (open.length > 0 && state !== "niet gestart") improve.push(`Nog open: ${open.map((puzzle) => puzzle.title).join(", ")}.`);
    if (hinted.length > 0) improve.push(`Hints gebruikt bij: ${hinted.map((puzzle) => puzzle.title).join(", ")}.`);
    if (chapter.id === 2 && team.breachOffsetSec !== null && !team.phishReported) improve.push("De valse mail is niet gemeld.");
    return {
      id: chapter.id,
      title: chapter.title,
      theme: THEME[chapter.id] ?? chapter.subtitle,
      state,
      solved: solved.length,
      total: items.length,
      hints: sum(team.hints, chapter.puzzles),
      instructorHints: instructor,
      openPuzzles: open.map((puzzle) => puzzle.title),
      hintedPuzzles: hinted.map((puzzle) => puzzle.title),
      signals,
      good,
      improve,
      timeNote: "Tijd per missie wordt niet bewaard.",
      decisionNote: "Foutieve pogingen worden niet per opdracht bewaard.",
    };
  });
}

function advice(team: Team, mode: GameMode, cards: MissionCard[]): Advice[] {
  const measured: Advice[] = [];
  for (const row of team.awareness.decisions) {
    if (row.correct) continue;
    const topic = row.id === "escalate" ? "Incidentrespons" : row.id === "supplier" ? "Leveranciersverificatie" : "Back-up- en herstelprocedures";
    measured.push({
      id: `decision-${row.id}`,
      topic,
      kind: "gemeten",
      why: "Deze keuze is tijdens de training vastgelegd en wijkt af van de beoogde reactie.",
      trigger: `Vastgelegde keuze bij ${row.id}: ${choiceLabel(row.id, row.choice)}. Pogingen: ${row.attempts}.`,
      change: row.id === "escalate"
        ? "Escaleer intern naar de verantwoordelijke of het incidentteam. Medewerkers beslissen een externe melding niet zelf."
        : row.id === "supplier"
          ? "Beperk de toegang, controleer de accounts, verifieer via een bekend contact en informeer de leverancier via de afgesproken procedure."
          : "Zet de gecontroleerde back-upomgeving voor op een los bestand of een los communicatiekanaal.",
      exercise: "Bespreek de vastgelegde keuze met een voorbeeld uit het eigen werk en wijs de eerste interne stap aan.",
    });
  }
  if (mode === "nis2") {
    for (const row of team.awareness.evals) {
      if (row.correct) continue;
      measured.push({
        id: `eval-${row.id}`,
        topic: "NIS2-leerthema",
        kind: "gemeten",
        why: "De eindevaluatie hoort bij de bestaande NIS2-nabespreking. De vastgelegde reactie wijkt af.",
        trigger: `Situatie ${row.id}: ${choiceLabel(row.id, row.choice)}. Pogingen: ${row.attempts}.`,
        change: "Volg de incidentprocedure, verifieer via een bekend contact en gebruik geen onbekende software.",
        exercise: "Neem deze situatie nog een keer door en noem wie intern de volgende stap zet.",
      });
    }
  }
  if (team.breachOffsetSec !== null && !team.phishReported) {
    measured.push({
      id: "phish",
      topic: "Phishing en social engineering",
      kind: "gemeten",
      why: "Een bericht dat bekend lijkt maar iets onverwachts vraagt, is een veelgebruikte eerste stap.",
      trigger: "De aanval is gestart en de valse mail staat als niet gemeld in het teamverslag.",
      change: "Meld een onverwacht bericht intern en controleer het verzoek via een bekend contact.",
      exercise: "Kies één recente mail die om haast vroeg en wijs aan waar je afzender, link en verzoek zou controleren.",
    });
  }
  if (team.status === "failed") {
    const gap = cards.find((card) => card.solved < card.total);
    if (gap) {
      measured.push({
        id: `open-${gap.id}`,
        topic: gap.theme,
        kind: "gemeten",
        why: "Deze missie stond nog open toen het team stopte.",
        trigger: gap.openPuzzles.length > 0 ? `Niet afgerond: ${gap.openPuzzles.join(", ")}.` : `${gap.title} is niet afgerond.`,
        change: "Rond de open opdrachten af met de bronnen die in die missie al zichtbaar waren.",
        exercise: `Neem ${gap.title} nog een keer en noteer welk spoor elke keuze ondersteunt.`,
      });
    }
  }
  const hinted = [...cards].filter((card) => card.hints > 0).sort((a, b) => b.hints - a.hints)[0];
  if (hinted) {
    measured.push({
      id: `hints-${hinted.id}`,
      topic: hinted.theme,
      kind: "gemeten",
      why: "Een hint betekent dat het team de bronnen op dat moment nog niet genoeg had.",
      trigger: `Hints van het team bij ${hinted.title}: ${hinted.hintedPuzzles.join(", ")}.`,
      change: "Oefen die opdracht opnieuw en vergelijk eerst de bronnen voordat je bevestigt.",
      exercise: `Herhaal ${hinted.hintedPuzzles[0] ?? hinted.title} zonder hint.`,
    });
  }
  if (team.fails > 0) {
    measured.push({
      id: "fails",
      topic: "Controleren voor je bevestigt",
      kind: "gemeten",
      why: "Een afgekeurde poging laat zien dat een keuze de bronnen nog niet dekte.",
      trigger: `Er zijn ${team.fails} afgekeurde pogingen. Het spel bewaart niet bij welke opdracht die hoorden.`,
      change: "Vergelijk tijd, herkomst en bron voordat je een keuze vastlegt.",
      exercise: "Pak één missie erbij en noem welk spoor de uiteindelijke keuze ondersteunde.",
    });
  }
  if (mode === "nis2" && (team.status === "completed" || team.status === "failed")) {
    const missing = EVAL_IDS.filter((id) => !team.awareness.evals.some((row) => row.id === id));
    if (missing.length > 0) {
      measured.push({
        id: "eval-open",
        topic: "NIS2-eindevaluatie",
        kind: "gemeten",
        why: "De eindevaluatie is onderdeel van de NIS2-training en staat nog niet volledig in het verslag.",
        trigger: `Nog geen vastgelegde reactie bij: ${missing.join(", ")}.`,
        change: "Rond de bestaande eindevaluatie af. Dit rapport voegt geen nieuwe vragen toe.",
        exercise: "Bespreek de open situaties en wijs per situatie de interne stap aan.",
      });
    }
  }
  const unique: Advice[] = [];
  for (const item of measured) {
    if (unique.some((current) => current.topic === item.topic)) continue;
    unique.push(item);
  }
  if (unique.length >= 3) return unique.slice(0, 3);
  for (const lesson of MISSION_LEARN) {
    if (unique.length >= 3) break;
    if (unique.some((item) => item.topic === lesson.title)) continue;
    unique.push({
      id: `general-${lesson.id}`,
      topic: lesson.title,
      kind: "algemeen",
      why: lesson.hoe,
      trigger: "Geen gemeten fout op dit onderwerp. Dit is een algemene aanbeveling.",
      change: lesson.voorkom,
      exercise: "Bespreek dit met een voorbeeld uit het eigen werk.",
    });
  }
  return unique.slice(0, 3);
}

function teamReport(session: Session, team: Team, now: number): TeamReport {
  const mode = session.mode ?? "escape";
  const score = scoreBreakdown(session, team, now);
  const clock = team.finishedAt && (team.status === "completed" || team.status === "failed") ? team.finishedAt : now;
  const cards = missionCards(team);
  const points = advice(team, mode, cards);
  const strengths: string[] = [];
  if (team.status === "completed") strengths.push("Alle missies zijn afgerond.");
  if (team.phishReported) strengths.push("De valse mail is gemeld.");
  if (hintCount(team) === 0 && team.solved.length > 0) strengths.push("Geen hint van het team gebruikt.");
  if (team.fails === 0 && team.solved.length > 0) strengths.push("Geen afgekeurde poging bewaard.");
  for (const card of cards) {
    if (strengths.length >= 4) break;
    if (card.state === "afgerond" && card.hints === 0) strengths.push(`${card.title} afgerond zonder hint.`);
  }
  const improvements = points.filter((item) => item.kind === "gemeten").map((item) => `${item.topic}: ${item.trigger}`);
  return {
    name: team.name,
    code: team.code,
    status: team.status,
    outcome: outcomeOf(team.status),
    score: score.total,
    breakdown: score,
    elapsedSec: crisisElapsedSec(session, team, clock),
    remainingSec: Math.max(0, teamRemainingSec(session, team, now)),
    hints: hintCount(team),
    instructorHints: instructorCount(team),
    penaltySec: team.penaltySec,
    extraSec: session.timeAdjustSec + (team.timeAdjustSec ?? 0),
    fails: team.fails,
    phish: team.breachOffsetSec === null ? "nog niet aan de beurt" : team.phishReported ? "gemeld" : "niet gemeld",
    missionsDone: completedChapters(team.solved),
    solved: team.solved.length,
    total: puzzles.length,
    missions: cards,
    strengths: strengths.slice(0, 4),
    improvements: improvements.slice(0, 4),
    advice: points,
  };
}

export function rankTeams(session: Session, teams: Team[], now: number) {
  return teams
    .filter((team) => team.sessionId === session.id)
    .sort((a, b) => scoreBreakdown(session, b, now).total - scoreBreakdown(session, a, now).total || a.name.localeCompare(b.name));
}

function modeNote(mode: GameMode, sector: Sector) {
  const base = mode === "nis2"
    ? "NIS2-training. De koppeling gebruikt de bestaande leerthema's en de vastgelegde keuzes. Dit rapport verandert die vragen niet."
    : mode === "awareness"
      ? "Cyber Awareness. De nadruk ligt op het herkennen van risico's en op wat het team de volgende keer anders kan doen."
      : "Escape Room. Dit verslag beschrijft het teamresultaat met de gegevens die het spel bewaart.";
  return `${base} ${sectorLine(sector)}`;
}

export function sessionReport(session: Session, teams: Team[], now: number): SessionReport {
  const ranked = rankTeams(session, teams, now);
  const reports = ranked.map((team) => teamReport(session, team, now));
  const scores = reports.map((team) => team.score);
  const finished = reports.filter((team) => team.status === "completed" || team.status === "failed");
  const counts = {
    teams: reports.length,
    passed: reports.filter((team) => team.status === "completed").length,
    failed: reports.filter((team) => team.status === "failed").length,
    playing: reports.filter((team) => team.status === "playing").length,
    ready: reports.filter((team) => team.status === "ready").length,
  };
  const topicCount = new Map<string, number>();
  for (const team of reports) {
    for (const item of team.advice) {
      if (item.kind !== "gemeten") continue;
      topicCount.set(item.topic, (topicCount.get(item.topic) ?? 0) + 1);
    }
  }
  const topics = [...topicCount.entries()]
    .map(([topic, count]) => ({ topic, teams: count }))
    .sort((a, b) => b.teams - a.teams || a.topic.localeCompare(b.topic))
    .slice(0, 3);
  return {
    session: { id: session.id, name: session.name, mode: session.mode ?? "escape", status: session.status },
    generatedAt: now,
    passRule: PASS_RULE,
    tieRule: TIE_RULE,
    disclaimer: DISCLAIMER,
    modeNote: modeNote(session.mode ?? "escape", parseSector(session.sector)),
    legalNote: session.mode === "nis2" ? LEGAL_NOTE : null,
    participants: null,
    participantsNote: "Het aantal deelnemers per team wordt niet geregistreerd.",
    counts,
    passRate: {
      passed: counts.passed,
      teams: counts.teams,
      percent: counts.teams > 0 ? Math.round((counts.passed / counts.teams) * 1000) / 10 : null,
      note: "Het percentage is het aantal geslaagde teams gedeeld door alle teams in deze sessie. Teams die nog bezig zijn, tellen nog niet als geslaagd.",
    },
    averageScore: scores.length > 0 ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10 : null,
    highestScore: scores.length > 0 ? Math.max(...scores) : null,
    averageElapsedSec: finished.length > 0 ? Math.round(finished.reduce((sum, team) => sum + team.elapsedSec, 0) / finished.length) : null,
    averageElapsedNote: "Gemiddelde crisistijd van teams die geslaagd of niet geslaagd zijn. Teams die nog bezig zijn, zitten hier niet in.",
    averageHints: reports.length > 0 ? Math.round((reports.reduce((sum, team) => sum + team.hints, 0) / reports.length) * 10) / 10 : null,
    missions: chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      theme: THEME[chapter.id] ?? chapter.subtitle,
      teamsDone: reports.filter((team) => team.missions.find((mission) => mission.id === chapter.id)?.state === "afgerond").length,
      teams: reports.length,
    })),
    topics,
    leaderboard: reports.map((team, index) => ({
      rank: index + 1,
      name: team.name,
      code: team.code,
      status: team.status,
      outcome: team.outcome,
      score: team.score,
      missionsDone: team.missionsDone,
      solved: team.solved,
      total: team.total,
      hints: team.hints,
      instructorHints: team.instructorHints,
      fails: team.fails,
      elapsedSec: team.elapsedSec,
      remainingSec: team.remainingSec,
      tiedScore: reports.filter((item) => item.score === team.score).length > 1,
    })),
    teams: reports,
  };
}

export function playerReport(session: Session, teams: Team[], code: string, now: number): PlayerReport | null {
  const report = sessionReport(session, teams, now);
  const team = report.teams.find((item) => item.code.toUpperCase() === code.trim().toUpperCase());
  if (!team) return null;
  const { code: _code, ...own } = team;
  return {
    ok: true,
    sessionName: report.session.name,
    mode: report.session.mode,
    passRule: report.passRule,
    tieRule: report.tieRule,
    disclaimer: report.disclaimer,
    modeNote: report.modeNote,
    legalNote: report.legalNote,
    team: own,
    leaderboard: report.leaderboard.map(({ code: _rowCode, ...row }) => row),
  };
}

function cell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function resultsCsv(report: SessionReport, includeCodes: boolean) {
  const missionHeaders = chapters.flatMap((chapter) => [`m${chapter.id}_afgerond`, `m${chapter.id}_hints`]);
  const header = [
    "positie",
    "team",
    ...(includeCodes ? ["code"] : []),
    "status",
    "resultaat",
    "score",
    "opdrachten",
    "missies_afgerond",
    "hints",
    "instructeurhints",
    "strafseconden",
    "extra_tijd_sec",
    "afgekeurde_pogingen",
    "valse_mail",
    "crisistijd_sec",
    "resterend_sec",
    ...missionHeaders,
  ];
  const lines = [header.join(",")];
  for (const row of report.leaderboard) {
    const team = report.teams.find((item) => item.name === row.name && item.score === row.score);
    const missionCells = chapters.flatMap((chapter) => {
      const mission = team?.missions.find((item) => item.id === chapter.id);
      return [mission?.state === "afgerond" ? "ja" : "nee", mission?.hints ?? 0];
    });
    lines.push(
      [
        row.rank,
        row.name,
        ...(includeCodes ? [row.code] : []),
        row.status,
        row.outcome,
        row.score,
        `${row.solved}/${row.total}`,
        row.missionsDone,
        row.hints,
        row.instructorHints,
        team?.penaltySec ?? 0,
        team?.extraSec ?? 0,
        row.fails,
        team?.phish ?? "",
        row.elapsedSec,
        row.remainingSec,
        ...missionCells,
      ].map(cell).join(","),
    );
  }
  return `\uFEFF${lines.join("\n")}`;
}
