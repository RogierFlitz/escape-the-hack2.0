import "server-only";
import { addCoachNote, addDraftTeam, clearTeamTime, createSession, getByCode, getSession, grantTime, removeReadyTeam, renameTeam, saveSession, saveTeam, setTeamCode, updateSessionDetails } from "../db/store";
import { allSolved, currentChapterId } from "../scoring";
import { elapsedSec, inOffice, teamRemainingSec } from "../time";
import type { Session, Team } from "../types";
import { puzzles } from "./content";
import { grade } from "./grade";
import { hintText, rescueHint } from "./hints";
import { DEMO_CODE, demoProgress, type DemoStop } from "./demo";
import { emptyAwareness, gradeDecision, gradeEval, includesTraining, markPrologue, parseMode, recordDecision, recordEval, recordPulse, type PulseWhen } from "./awareness";
import { applyStory, emptyStory, lastTransmission, missionReady, nextBeat } from "./story";
import { parseSector } from "./sector";
import type { StoryInput, StoryState } from "./story";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function clip(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

type Change = { team: Team; mismatch?: boolean; note?: string } | { error: string } | null;

async function mutate(code: string, change: (session: Session, team: Team, now: number) => Change) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const found = await getByCode(code);
    if (!found) return { error: "Code niet herkend." as const };
    const now = Date.now();
    const result = change(found.session, clone(found.team), now);
    if (!result) return { error: "Geen wijziging." as const };
    if ("error" in result) return result;
    result.team.updatedAt = now;
    const wrote = await saveTeam(found.team.updatedAt, result.team);
    if (wrote) return { team: result.team, session: found.session, mismatch: result.mismatch === true, note: result.note };
  }
  return { error: "Sessie was even bezet. Probeer opnieuw." as const };
}

function guard(session: Session, team: Team, now: number) {
  if (session.status === "draft") return "De instructeur heeft de missie nog niet gestart.";
  if (session.status === "paused") return "De missie is gepauzeerd.";
  if (session.status === "ended" || team.status === "failed") return "Deze missie is gesloten.";
  if (team.status === "completed") return "Deze missie is al afgerond.";
  if (teamRemainingSec(session, team, now) <= 0) return "De tijd is om.";
  return null;
}

export async function solve(code: string, puzzleId: string, payload: unknown) {
  const known = puzzles.some((puzzle) => puzzle.id === puzzleId);
  if (!known) return { error: "Onbekende opdracht." };
  return mutate(code, (session, team, now) => {
    if (team.solved.includes(puzzleId)) return { team };
    const blocked = guard(session, team, now);
    if (blocked) return { error: blocked };
    if (inOffice(team)) return { error: "De aanval is nog niet begonnen." };
    const chapter = currentChapterId(team.solved);
    const puzzle = puzzles.find((item) => item.id === puzzleId);
    if (!puzzle || puzzle.chapterId > chapter) return { error: "Deze laag is nog vergrendeld." };
    const storyBlock = missionReady(team.story ?? emptyStory(), team.solved, puzzleId);
    if (storyBlock) return { error: storyBlock };
    const result = grade(puzzleId, payload);
    if (!result.ok) {
      team.fails += 1;
      return { team, mismatch: true, note: result.note };
    }
    team.solved = [...team.solved, puzzleId];
    if (result.token && !team.inventory.includes(result.token)) team.inventory = [...team.inventory, result.token];
    if (puzzleId === "ch1-bays") team.story = { ...(team.story ?? emptyStory()), social: true };
    if (puzzleId === "ch4-backup") team.story = { ...(team.story ?? emptyStory()), backup: true };
    team.lastProgressAt = now;
    if (allSolved(team.solved)) {
      team.status = "completed";
      team.finishedAt = now;
    }
    return { team };
  });
}

export async function triggerBreach(code: string, reported: boolean) {
  return mutate(code, (session, team, now) => {
    if (session.status === "draft") return { error: "De instructeur heeft de werkdag nog niet geopend." };
    if (session.status === "paused") return { error: "De missie is gepauzeerd." };
    if (session.status === "ended" || team.status === "failed" || team.status === "completed") return { error: "Deze missie is gesloten." };
    if (team.breachOffsetSec !== null) return { team };
    team.breachOffsetSec = elapsedSec(session, now);
    team.phishReported = reported;
    team.lastProgressAt = now;
    return { team };
  });
}

export async function takeHint(code: string, puzzleId: string, level?: number) {
  return mutate(code, (session, team) => {
    const blocked = guard(session, team, Date.now());
    if (blocked) return { error: blocked };
    if (inOffice(team)) return { error: "De aanval is nog niet begonnen." };
    const puzzle = puzzles.find((item) => item.id === puzzleId);
    if (!puzzle || puzzle.chapterId > currentChapterId(team.solved)) return { error: "Deze laag is nog vergrendeld." };
    if (team.solved.includes(puzzleId)) return { error: "Deze opdracht is al hersteld." };
    const shown = Math.max(team.hints[puzzleId] ?? 0, team.instructorHints[puzzleId] ?? 0);
    if (typeof level === "number" && Number.isInteger(level)) {
      if (shown >= level) return { team };
      if (level !== shown + 1) return { error: "Deze hint is nu niet aan de beurt." };
    }
    if (shown >= 3) return { error: "Alle hints voor deze opdracht zijn gebruikt." };
    team.hints = { ...team.hints, [puzzleId]: shown + 1 };
    if (session.hintPenalty) team.penaltySec += session.hintPenaltySec;
    return { team };
  });
}

export async function savePulse(code: string, when: PulseWhen, answers: Record<string, string>) {
  return mutate(code, (session, team) => {
    if (!includesTraining(session.mode ?? "escape")) return { error: "Deze sessie heeft geen meting." };
    if (session.status === "draft") return { error: "De instructeur heeft de werkdag nog niet geopend." };
    const finished = team.status === "completed" || team.status === "failed";
    if (when === "before" && finished) return { error: "De meting aan het begin is voorbij." };
    if (when === "after" && !finished) return { error: "De meting aan het eind volgt na het spel." };
    const next = recordPulse(team.awareness ?? emptyAwareness(), when, answers);
    if ("error" in next) return next;
    team.awareness = next.state;
    return { team, note: next.unchanged ? "Deze meting staat al vast." : "Meting vastgelegd." };
  });
}

export async function savePrologue(code: string, scene: string) {
  return mutate(code, (session, team) => {
    if (session.status === "draft") return { error: "De instructeur heeft de werkdag nog niet geopend." };
    if (session.status === "ended" || team.status === "failed" || team.status === "completed") return { error: "Deze missie is gesloten." };
    if (!includesTraining(session.mode ?? "escape")) return { error: "Deze sessie heeft geen proloog." };
    const marked = markPrologue({ ...team, awareness: team.awareness ?? emptyAwareness() }, scene);
    team.awareness = marked.awareness;
    return { team };
  });
}

export async function saveDecision(code: string, id: string, choice: string) {
  return mutate(code, (session, team, now) => {
    const blocked = guard(session, team, now);
    if (blocked) return { error: blocked };
    if (!includesTraining(session.mode ?? "escape")) return { error: "Deze sessie heeft geen keuzemomenten." };
    const scenes = team.story?.scenes ?? [];
    if (id === "escalate" && !scenes.includes("d2")) return { error: "Deze keuze is nu niet aan de beurt." };
    if (id === "supplier" && !scenes.includes("d3")) return { error: "Deze keuze is nu niet aan de beurt." };
    if (id === "priority" && !scenes.includes("m4")) return { error: "Deze keuze is nu niet aan de beurt." };
    const graded = gradeDecision(id, choice);
    if (!graded) return { error: "Onbekende keuze." };
    const next = recordDecision(team.awareness ?? emptyAwareness(), graded);
    team.awareness = next.state;
    return { team, note: next.unchanged ? "Deze keuze staat al vast." : graded.explanation };
  });
}

export async function saveEval(code: string, id: string, choice: string) {
  return mutate(code, (session, team) => {
    if ((session.mode ?? "escape") !== "nis2") return { error: "Deze sessie heeft geen eindevaluatie." };
    if (team.status !== "completed" && team.status !== "failed") return { error: "De evaluatie volgt na het einde." };
    const graded = gradeEval(id, choice);
    if (!graded) return { error: "Onbekende situatie." };
    const next = recordEval(team.awareness ?? emptyAwareness(), graded);
    team.awareness = next.state;
    return { team, note: next.unchanged ? "Deze situatie staat al vast." : graded.explanation };
  });
}

export async function saveStory(code: string, input: StoryInput) {
  return mutate(code, (session, team, now) => {
    const blocked = guard(session, team, now);
    if (blocked) return { error: blocked };
    if (inOffice(team)) return { error: "De aanval is nog niet begonnen." };
    const applied = applyStory(team.story ?? emptyStory(), team.solved, team.phishReported, input);
    if ("error" in applied) return applied;
    team.story = applied.story;
    team.lastProgressAt = now;
    return { team };
  });
}

const TOKENS: Record<string, string> = {
  "ch1-ports": "N74192",
  "ch2-trace": "DOCK-244",
  "ch3-boot": "ROUTE-7",
  "ch4-rotor": "SEAL",
  "ch4-decode": "HX-19",
  "ch5-accuse": "INSIDER:ADLER",
};

export async function guideTeam(sessionId: string, teamId: string, action: "replay" | "advance") {
  const found = await getSession(sessionId);
  if (!found) return { error: "Sessie niet gevonden." };
  const team = found.teams.find((item) => item.id === teamId);
  if (!team) return { error: "Team niet gevonden." };
  if (team.status !== "playing") return { error: "Dit team speelt nu niet." };
  const next = clone(team);
  next.story = next.story ?? emptyStory();
  if (action === "replay") {
    const scene = lastTransmission(next.story);
    if (!scene) return { error: "Er is nog geen KADE-scène." };
    next.story = { ...next.story, replay: scene };
  } else {
    const moved = advance(next);
    if ("error" in moved) return moved;
  }
  next.updatedAt = Date.now();
  next.lastProgressAt = next.updatedAt;
  const wrote = await saveTeam(team.updatedAt, next);
  if (!wrote) return { error: "Probeer opnieuw." };
  return { ok: true as const };
}

function advance(team: Team): { error: string } | { ok: true } {
  const story: StoryState = team.story ?? emptyStory();
  const beat = nextBeat(story, team.solved, team.phishReported);
  if (beat.kind === "transmission" || beat.kind === "discovery") {
    const applied = applyStory(story, team.solved, team.phishReported, { scene: beat.id });
    if ("error" in applied) return applied;
    team.story = applied.story;
    return { ok: true };
  }
  if (beat.kind === "social") {
    team.story = { ...story, social: true };
    return { ok: true };
  }
  if (beat.kind === "backup") {
    team.story = { ...story, backup: true };
    return { ok: true };
  }
  if (beat.kind === "finale") {
    team.story = { ...story, finale: story.finale.includes(beat.step) ? story.finale : [...story.finale, beat.step] };
    return { ok: true };
  }
  if (beat.kind === "puzzle") {
    if (!team.solved.includes(beat.puzzleId)) team.solved = [...team.solved, beat.puzzleId];
    const token = TOKENS[beat.puzzleId];
    if (token && !team.inventory.includes(token)) team.inventory = [...team.inventory, token];
    if (beat.puzzleId === "ch1-bays") team.story = { ...story, social: true };
    if (beat.puzzleId === "ch4-backup") team.story = { ...(team.story ?? story), backup: true };
    if (allSolved(team.solved)) {
      team.status = "completed";
      team.finishedAt = Date.now();
    }
    return { ok: true };
  }
  return { error: "Er is geen volgend verhaalmoment." };
}

export async function ackEvent(code: string, eventId: string) {
  return mutate(code, (_session, team) => {
    if (team.eventsSeen.includes(eventId)) return { team };
    team.eventsSeen = [...team.eventsSeen, eventId];
    return { team };
  });
}

export async function instructorHint(sessionId: string, teamId: string, puzzleId?: string) {
  const found = await getSession(sessionId);
  if (!found) return { error: "Sessie niet gevonden." };
  const team = found.teams.find((item) => item.id === teamId);
  if (!team) return { error: "Team niet gevonden." };
  if (team.status !== "playing") return { error: "Dit team speelt nu niet." };
  if (inOffice(team)) return { error: "Een extra hint kan zodra de aanval is begonnen." };
  const chapter = currentChapterId(team.solved);
  const target = puzzleId
    ? puzzles.find((item) => item.id === puzzleId)
    : puzzles.find((item) => item.chapterId <= chapter && !team.solved.includes(item.id));
  if (!target || target.chapterId > chapter || team.solved.includes(target.id)) return { error: "Er is geen open opdracht." };
  const shown = Math.max(team.instructorHints[target.id] ?? 0, team.hints[target.id] ?? 0);
  if (shown >= 3) return { error: "De drie hints zijn al gegeven. Schrijf zelf een extra hint." };
  const before = team.penaltySec;
  const solved = team.solved.slice();
  const next = clone(team);
  next.instructorHints = { ...next.instructorHints, [target.id]: shown + 1 };
  next.penaltySec = before;
  next.solved = solved;
  next.updatedAt = Date.now();
  const wrote = await saveTeam(team.updatedAt, next);
  if (!wrote) return { error: "Probeer opnieuw." };
  const hint = hintText(target.id, shown + 1).at(-1) ?? "";
  return { hint, puzzle: target.title, notice: `Hint ${shown + 1} van 3 naar ${team.name}, zonder tijdstraf. ${hint}` };
}

export async function requestRescue(code: string, puzzleId: string) {
  const found = await getByCode(code);
  if (!found) return { error: "Code niet herkend." as const };
  const { session, team } = found;
  if (team.status !== "playing") return { error: "Dit team speelt nu niet." as const };
  if (inOffice(team)) return { error: "Een extra hint kan zodra de aanval is begonnen." as const };
  if (session.status === "paused") return { error: "De missie is gepauzeerd." as const };
  if (session.status === "ended") return { error: "Deze missie is gesloten." as const };
  const puzzle = puzzles.find((item) => item.id === puzzleId);
  const chapter = currentChapterId(team.solved);
  if (!puzzle || puzzle.chapterId > chapter || team.solved.includes(puzzle.id)) return { error: "Er is geen open opdracht." as const };
  const shown = Math.max(team.hints[puzzle.id] ?? 0, team.instructorHints[puzzle.id] ?? 0);
  if (shown < 3) return { error: "De extra hint komt pas na de drie gewone hints." as const };
  const line = rescueHint(puzzle.id);
  if (!line) return { error: "Voor deze opdracht is geen extra hint." as const };
  const saved = await addCoachNote(team.id, puzzle.id, line);
  if ("error" in saved) return saved;
  if (saved.duplicate) return { ok: true as const, duplicate: true as const, notice: "Deze extra hint staat al op het scherm." };
  return { ok: true as const, notice: "Extra hint staat op het scherm. Geen tijdstraf." };
}

export async function coachTeam(sessionId: string, teamId: string, puzzleId: string | undefined, text: string) {
  const found = await getSession(sessionId);
  if (!found) return { error: "Sessie niet gevonden." };
  const team = found.teams.find((item) => item.id === teamId);
  if (!team) return { error: "Team niet gevonden." };
  if (team.status !== "playing") return { error: "Dit team speelt nu niet." };
  if (inOffice(team)) return { error: "Een extra hint kan zodra de aanval is begonnen." };
  const line = clip(text, 180);
  if (line.length < 3) return { error: "Schrijf een korte extra hint." };
  const chapter = currentChapterId(team.solved);
  const target = puzzleId
    ? puzzles.find((item) => item.id === puzzleId)
    : puzzles.find((item) => item.chapterId <= chapter && !team.solved.includes(item.id));
  if (!target || target.chapterId > chapter || team.solved.includes(target.id)) return { error: "Er is geen open opdracht." };
  const saved = await addCoachNote(team.id, target.id, line);
  if ("error" in saved) return saved;
  if (saved.duplicate) return { ok: true as const, duplicate: true as const, notice: "Deze extra hint was al verstuurd." };
  return { ok: true as const, notice: `Extra hint naar ${team.name}: ${line}` };
}

export async function controlSession(
  sessionId: string,
  action: string,
  seconds = 0,
  options: {
    teamId?: string;
    requestId?: string;
    reason?: string;
    name?: string;
    client?: string;
    eventDate?: string;
    durationMin?: number;
    hintPenalty?: boolean;
    hintPenaltySec?: number;
    mode?: string;
    sector?: string;
  } = {},
) {
  const found = await getSession(sessionId);
  if (!found) return { error: "Sessie niet gevonden." };
  const now = Date.now();
  const session = { ...found.session };
  if (action === "start") {
    if (session.status !== "draft") return { error: "De sessie is al gestart." };
    session.status = "live";
    session.startedAt = now;
    await saveSession(session);
    for (const team of found.teams) {
      const next = { ...team, status: "playing" as const, lastProgressAt: now, updatedAt: now };
      await saveTeam(team.updatedAt, next);
    }
    return { ok: true as const };
  }
  if (action === "pause") {
    if (session.status !== "live") return { error: "Alleen een lopende sessie kan pauzeren." };
    session.status = "paused";
    session.pauseStartedAt = now;
    await saveSession(session);
    return { ok: true as const };
  }
  if (action === "resume") {
    if (session.status !== "paused" || !session.pauseStartedAt) return { error: "De sessie staat niet op pauze." };
    session.pausedMs += now - session.pauseStartedAt;
    session.pauseStartedAt = null;
    session.status = "live";
    await saveSession(session);
    return { ok: true as const };
  }
  if (action === "end") {
    if (session.status === "ended") return { ok: true as const };
    if (session.status === "paused" && session.pauseStartedAt) {
      session.pausedMs += now - session.pauseStartedAt;
      session.pauseStartedAt = null;
    }
    session.status = "ended";
    session.endedAt = now;
    await saveSession(session);
    for (const team of found.teams) {
      if (team.status === "playing" || team.status === "ready") {
        const next = { ...team, status: "failed" as const, finishedAt: now, updatedAt: now };
        await saveTeam(team.updatedAt, next);
      }
    }
    return { ok: true as const };
  }
  if (action === "adjust") {
    if (session.status === "ended") return { error: "De timer kan nu niet worden aangepast." };
    if (!Number.isFinite(seconds) || seconds === 0) return { error: "Kies een tijdswijziging." };
    const requestId = String(options.requestId ?? "").trim();
    if (!/^[A-Za-z0-9_-]{8,80}$/.test(requestId)) return { error: "De tijdswijziging mist een controlecode." };
    const delta = Math.max(-10800, Math.min(10800, Math.round(seconds)));
    const granted = await grantTime({
      session,
      requestId,
      teamId: options.teamId?.trim() || null,
      seconds: delta,
      actor: "Instructeur",
      reason: clip(options.reason, 160),
      teams: found.teams,
    });
    if ("error" in granted) return { error: granted.error };
    if (granted.duplicate) return { ok: true as const, duplicate: true as const, notice: "Deze wijziging was al uitgevoerd." };
    const amount = `${delta > 0 ? "+" : ""}${delta / 60} min`;
    const who = granted.applied.length > 0 ? granted.applied.join(", ") : "geen lopend team";
    const skipped = granted.skipped.length > 0 ? ` Overgeslagen: ${granted.skipped.join(", ")}.` : "";
    return {
      ok: true as const,
      duplicate: false as const,
      notice: granted.applied.length > 0 ? `${amount} voor ${who}.${skipped}` : `Geen lopend team. Afgeronde teams zijn niet herstart.${skipped}`,
    };
  }
  if (action === "rename") {
    const name = clip(options.name, 32);
    if (!options.teamId || !name) return { error: "Kies een team en een naam." };
    const renamed = await renameTeam(options.teamId, name);
    if ("error" in renamed) return renamed;
    return { ok: true as const, notice: `Team heet nu ${name}.` };
  }
  if (action === "remove-team") {
    if (!options.teamId) return { error: "Kies een team." };
    const removed = await removeReadyTeam(options.teamId);
    if ("error" in removed) return removed;
    return { ok: true as const, notice: "Team verwijderd." };
  }
  if (action === "add-team") {
    const name = clip(options.name, 32);
    if (!name) return { error: "Vul een teamnaam in." };
    const added = await addDraftTeam(sessionId, name);
    if ("error" in added) return added;
    return { ok: true as const, notice: `${name} is toegevoegd. Code ${added.team.code}.` };
  }
  if (action === "retune") {
    const durationMin = Number(options.durationMin);
    const penalty = Number(options.hintPenaltySec);
    if (!Number.isFinite(durationMin) || durationMin < 10 || durationMin > 180) return { error: "Speelduur moet tussen 10 en 180 minuten liggen." };
    if (!Number.isFinite(penalty) || penalty < 0 || penalty > 300) return { error: "Tijdstraf per hint moet tussen 0 en 300 seconden liggen." };
    const eventDate = clip(options.eventDate, 10);
    if (eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return { error: "Datum moet als jjjj-mm-dd." };
    const tuned = await updateSessionDetails(sessionId, {
      name: clip(options.name, 80) || session.name,
      clientName: options.client === undefined ? session.clientName : clip(options.client, 80),
      eventDate: options.eventDate === undefined ? session.eventDate : eventDate,
      durationSec: Math.round(durationMin * 60),
      hintPenalty: options.hintPenalty !== false,
      hintPenaltySec: Math.round(penalty),
      mode: options.mode === undefined ? session.mode : parseMode(options.mode),
      sector: options.sector === undefined ? session.sector : parseSector(options.sector),
    });
    if ("error" in tuned) return tuned;
    return {
      ok: true as const,
      notice: session.status === "draft"
        ? "Gegevens bewaard. De klok is niet gestart."
        : "Gegevens bewaard. Starttijd, score en voortgang blijven staan.",
    };
  }
  if (action === "skip-prologue") {
    for (const team of found.teams) {
      const marked = markPrologue({ awareness: team.awareness ?? emptyAwareness(), breachOffsetSec: team.breachOffsetSec }, "skip");
      const next = { ...team, awareness: marked.awareness, updatedAt: now };
      await saveTeam(team.updatedAt, next);
    }
    return { ok: true as const };
  }
  return { error: "Onbekende actie." };
}

export async function openDemo(stop: DemoStop) {
  const now = Date.now();
  let found = await getByCode(DEMO_CODE);
  if (!found) {
    const created = await createSession({
      name: "Demo",
      durationSec: 3600,
      hintPenalty: true,
      hintPenaltySec: 30,
      teamNames: ["Demo"],
    });
    await setTeamCode(created.teams[0].id, DEMO_CODE);
    found = await getByCode(DEMO_CODE);
  }
  if (!found) return { error: "Demo kon niet worden geopend." as const };
  const progress = demoProgress(stop);
  const preview = stop === "resultaten";
  const startedAt = preview ? now - 42 * 60 * 1000 : now;
  await saveSession({
    ...found.session,
    name: "Demo",
    status: "live",
    startedAt,
    pauseStartedAt: null,
    pausedMs: 0,
    timeAdjustSec: 0,
    endedAt: null,
    durationSec: 3600,
    mode: "nis2",
  });
  const next: Team = {
    ...found.team,
    name: "Demo",
    status: preview ? "completed" : "playing",
    solved: progress.solved,
    hints: {},
    instructorHints: {},
    inventory: progress.inventory,
    eventsSeen: [],
    penaltySec: 0,
    fails: 0,
    finishedAt: preview ? now : null,
    updatedAt: now,
    lastProgressAt: now,
    breachOffsetSec: progress.breach ? 0 : null,
    phishReported: false,
    timeAdjustSec: 0,
    coach: [],
    awareness: stop === "origin" ? emptyAwareness() : markPrologue({ awareness: emptyAwareness(), breachOffsetSec: null }, "skip").awareness,
    story: progress.story,
  };
  const wrote = await saveTeam(found.team.updatedAt, next);
  if (!wrote) return { error: "Probeer de demo opnieuw." as const };
  await clearTeamTime(found.team.id);
  return { code: DEMO_CODE };
}

export { createSession };
