import "server-only";
import { createSession, getByCode, getSession, saveSession, saveTeam, setTeamCode } from "../db/store";
import { allSolved, currentChapterId } from "../scoring";
import { elapsedSec, inOffice, teamRemainingSec } from "../time";
import type { Session, Team } from "../types";
import { puzzles } from "./content";
import { grade } from "./grade";
import { hintText } from "./hints";
import { DEMO_CODE, demoProgress, type DemoStop } from "./demo";
import { emptyAwareness, gradeDecision, gradeEval, includesTraining, markPrologue, recordDecision, recordEval } from "./awareness";
import { applyStory, emptyStory, lastTransmission, missionReady, nextBeat } from "./story";
import type { StoryInput, StoryState } from "./story";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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
  const chapter = currentChapterId(team.solved);
  const target = puzzleId
    ? puzzles.find((item) => item.id === puzzleId)
    : puzzles.find((item) => item.chapterId <= chapter && !team.solved.includes(item.id));
  if (!target) return { error: "Er is geen open opdracht." };
  const shown = Math.max(team.instructorHints[target.id] ?? 0, team.hints[target.id] ?? 0);
  if (shown >= 3) return { error: "Alle hints zijn al gegeven." };
  const next = clone(team);
  next.instructorHints = { ...next.instructorHints, [target.id]: shown + 1 };
  next.updatedAt = Date.now();
  const wrote = await saveTeam(team.updatedAt, next);
  if (!wrote) return { error: "Probeer opnieuw." };
  return { hint: hintText(target.id, shown + 1).at(-1) ?? "", puzzle: target.title };
}

export async function controlSession(sessionId: string, action: string, seconds = 0) {
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
    if (session.status === "draft" || session.status === "ended") return { error: "De timer kan nu niet worden aangepast." };
    if (!Number.isFinite(seconds) || seconds === 0) return { error: "Kies een tijdswijziging." };
    const delta = Math.max(-3600, Math.min(3600, Math.round(seconds)));
    session.timeAdjustSec += delta;
    await saveSession(session);
    for (const team of found.teams) {
      if (team.status !== "failed" || allSolved(team.solved)) continue;
      if (teamRemainingSec(session, { ...team, finishedAt: null, status: "playing" }, now) > 0) {
        const next = { ...team, status: "playing" as const, finishedAt: null, updatedAt: now };
        await saveTeam(team.updatedAt, next);
      }
    }
    return { ok: true as const };
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
    awareness: stop === "origin" ? emptyAwareness() : markPrologue({ awareness: emptyAwareness(), breachOffsetSec: null }, "skip").awareness,
    story: progress.story,
  };
  const wrote = await saveTeam(found.team.updatedAt, next);
  if (!wrote) return { error: "Probeer de demo opnieuw." as const };
  return { code: DEMO_CODE };
}

export { createSession };
