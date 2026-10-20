import "server-only";
import { makeCode, makeId } from "../codes";
import { emptyAwareness, parseAwareness, parseMode } from "../game/awareness";
import { parseSector, type Sector } from "../game/sector";
import { emptyStory, parseStory } from "../game/story";
import type { GameMode } from "../game/awareness";
import { teamRemainingSec } from "../time";
import type { Session, SessionRollup, SessionStatus, Team, TeamStatus } from "../types";
import { sql } from "./sql";

type SessionRow = {
  id: string;
  name: string;
  duration_sec: number;
  hint_penalty: number;
  hint_penalty_sec: number;
  status: SessionStatus;
  started_at: number | null;
  pause_started_at: number | null;
  paused_ms: number;
  time_adjust_sec: number;
  created_at: number;
  ended_at: number | null;
  mode?: string | null;
  sector?: string | null;
  client_name?: string | null;
  event_date?: string | null;
};

type TeamRow = {
  id: string;
  session_id: string;
  name: string;
  code: string;
  status: TeamStatus;
  solved_json: string;
  hints_json: string;
  instructor_hints_json: string;
  inventory_json: string;
  events_seen_json: string;
  penalty_sec: number;
  fails: number;
  finished_at: number | null;
  updated_at: number;
  last_progress_at: number;
  last_seen_at?: number | null;
  breach_offset_sec: number | null;
  phish_reported: number;
  story_json: string | null;
  awareness_json?: string | null;
  time_adjust_sec?: number | null;
  coach_json?: string | null;
};

function parse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function coachNotes(value: string | null | undefined) {
  const parsed = parse<unknown>(value || "[]", []);
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const note = item as { puzzleId?: unknown; text?: unknown };
    return typeof note.puzzleId === "string" && typeof note.text === "string" ? [{ puzzleId: note.puzzleId, text: note.text }] : [];
  });
}

function num(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function numOrNull(value: unknown) {
  if (value == null || value === "") return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

function sessionOf(row: SessionRow): Session {
  return {
    id: row.id,
    name: row.name,
    durationSec: num(row.duration_sec),
    hintPenalty: num(row.hint_penalty) === 1,
    hintPenaltySec: num(row.hint_penalty_sec),
    status: row.status,
    startedAt: numOrNull(row.started_at),
    pauseStartedAt: numOrNull(row.pause_started_at),
    pausedMs: num(row.paused_ms),
    timeAdjustSec: num(row.time_adjust_sec),
    createdAt: num(row.created_at),
    endedAt: numOrNull(row.ended_at),
    mode: parseMode(row.mode),
    sector: parseSector(row.sector),
    clientName: String(row.client_name ?? ""),
    eventDate: String(row.event_date ?? ""),
  };
}

function teamOf(row: TeamRow): Team {
  return {
    id: row.id,
    sessionId: row.session_id,
    name: row.name,
    code: row.code,
    status: row.status,
    solved: parse(row.solved_json, []),
    hints: parse(row.hints_json, {}),
    instructorHints: parse(row.instructor_hints_json, {}),
    inventory: parse(row.inventory_json, []),
    eventsSeen: parse(row.events_seen_json, []),
    penaltySec: num(row.penalty_sec),
    fails: num(row.fails),
    finishedAt: numOrNull(row.finished_at),
    updatedAt: num(row.updated_at),
    lastProgressAt: num(row.last_progress_at),
    lastSeenAt: numOrNull(row.last_seen_at),
    breachOffsetSec: numOrNull(row.breach_offset_sec),
    phishReported: num(row.phish_reported) === 1,
    timeAdjustSec: num(row.time_adjust_sec),
    coach: coachNotes(row.coach_json),
    awareness: parseAwareness(parse(row.awareness_json || "{}", {})),
    story: parseStory(parse(row.story_json || "{}", {})),
  };
}

const SESSION_COLS = `id, name, duration_sec, hint_penalty, hint_penalty_sec, status, started_at, pause_started_at, paused_ms, time_adjust_sec, created_at, ended_at, mode, sector, client_name, event_date`;
const TEAM_COLS = `id, session_id, name, code, status, solved_json, hints_json, instructor_hints_json, inventory_json, events_seen_json, penalty_sec, fails, finished_at, updated_at, last_progress_at, last_seen_at, breach_offset_sec, phish_reported, story_json, awareness_json, time_adjust_sec, coach_json`;

export async function listSessions() {
  const db = await sql();
  const rows = await db.all<SessionRow>(`SELECT ${SESSION_COLS} FROM sessions ORDER BY created_at DESC`);
  return rows.map(sessionOf);
}

export async function listSessionRollup(now = Date.now()): Promise<SessionRollup[]> {
  const db = await sql();
  const rows = await db.all<{
    session_id: string;
    teams: number;
    playing: number;
    completed: number;
    failed: number;
    ready: number;
    attention: number;
  }>(
    `SELECT session_id,
      COUNT(*) AS teams,
      SUM(CASE WHEN status = 'playing' THEN 1 ELSE 0 END) AS playing,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
      SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) AS ready,
      SUM(CASE WHEN status = 'playing' AND last_progress_at < ? THEN 1 ELSE 0 END) AS attention
     FROM teams GROUP BY session_id`,
    [now - 5 * 60 * 1000],
  );
  return rows.map((row) => ({
    sessionId: row.session_id,
    teams: num(row.teams),
    playing: num(row.playing),
    completed: num(row.completed),
    failed: num(row.failed),
    ready: num(row.ready),
    attention: num(row.attention),
  }));
}

export async function getSession(id: string) {
  const db = await sql();
  const row = await db.get<SessionRow>(`SELECT ${SESSION_COLS} FROM sessions WHERE id = ?`, [id]);
  if (!row) return null;
  const teams = await teamsOf(id);
  return { session: sessionOf(row), teams };
}

async function teamsOf(sessionId: string) {
  const db = await sql();
  const rows = await db.all<TeamRow>(`SELECT ${TEAM_COLS} FROM teams WHERE session_id = ? ORDER BY name`, [sessionId]);
  return rows.map(teamOf);
}

export async function getByCode(code: string) {
  const db = await sql();
  const row = await db.get<TeamRow>(`SELECT ${TEAM_COLS} FROM teams WHERE code = ?`, [code.trim().toUpperCase()]);
  if (!row) return null;
  const bundle = await getSession(row.session_id);
  if (!bundle) return null;
  const team = bundle.teams.find((item) => item.id === row.id);
  if (!team) return null;
  return { ...bundle, team };
}

export async function createSession(input: {
  name: string;
  durationSec: number;
  hintPenalty: boolean;
  hintPenaltySec: number;
  teamNames: string[];
  mode?: GameMode;
  sector?: Sector;
  clientName?: string;
  eventDate?: string;
}) {
  const db = await sql();
  const now = Date.now();
  const session: Session = {
    id: makeId(),
    name: input.name,
    durationSec: input.durationSec,
    hintPenalty: input.hintPenalty,
    hintPenaltySec: input.hintPenaltySec,
    status: "draft",
    startedAt: null,
    pauseStartedAt: null,
    pausedMs: 0,
    timeAdjustSec: 0,
    createdAt: now,
    endedAt: null,
    mode: input.mode ?? "escape",
    sector: input.sector ?? "general",
    clientName: input.clientName ?? "",
    eventDate: input.eventDate ?? "",
  };
  await db.run(
    `INSERT INTO sessions (id, name, duration_sec, hint_penalty, hint_penalty_sec, status, started_at, pause_started_at, paused_ms, time_adjust_sec, created_at, ended_at, mode, sector, client_name, event_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.name,
      session.durationSec,
      session.hintPenalty ? 1 : 0,
      session.hintPenaltySec,
      session.status,
      session.startedAt,
      session.pauseStartedAt,
      session.pausedMs,
      session.timeAdjustSec,
      session.createdAt,
      session.endedAt,
      session.mode,
      session.sector,
      session.clientName,
      session.eventDate,
    ],
  );
  const teams: Team[] = [];
  for (const rawName of input.teamNames) {
    let code = makeCode();
    for (let i = 0; i < 8; i++) {
      const exists = await db.get<{ code: string }>(`SELECT code FROM teams WHERE code = ?`, [code]);
      if (!exists) break;
      code = makeCode();
    }
    const team: Team = {
      id: makeId(),
      sessionId: session.id,
      name: rawName,
      code,
      status: "ready",
      solved: [],
      hints: {},
      instructorHints: {},
      inventory: [],
      eventsSeen: [],
      penaltySec: 0,
      fails: 0,
      finishedAt: null,
      updatedAt: now,
      lastProgressAt: now,
      lastSeenAt: null,
      breachOffsetSec: null,
      phishReported: false,
      timeAdjustSec: 0,
      coach: [],
      awareness: emptyAwareness(),
      story: emptyStory(),
    };
    await insertTeam(team);
    teams.push(team);
  }
  return { session, teams };
}

async function insertTeam(team: Team) {
  const db = await sql();
  await db.run(
    `INSERT INTO teams (id, session_id, name, code, status, solved_json, hints_json, instructor_hints_json, inventory_json, events_seen_json, penalty_sec, fails, finished_at, updated_at, last_progress_at, breach_offset_sec, phish_reported, story_json, awareness_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      team.id,
      team.sessionId,
      team.name,
      team.code,
      team.status,
      JSON.stringify(team.solved),
      JSON.stringify(team.hints),
      JSON.stringify(team.instructorHints),
      JSON.stringify(team.inventory),
      JSON.stringify(team.eventsSeen),
      team.penaltySec,
      team.fails,
      team.finishedAt,
      team.updatedAt,
      team.lastProgressAt,
      team.breachOffsetSec,
      team.phishReported ? 1 : 0,
      JSON.stringify(team.story ?? emptyStory()),
      JSON.stringify(team.awareness ?? emptyAwareness()),
    ],
  );
}

const presenceGate = new Map<string, number>();

export async function notePresence(code: string) {
  const key = code.trim().toUpperCase();
  if (!key) return;
  const now = Date.now();
  const previous = presenceGate.get(key) ?? 0;
  if (now - previous < 12_000) return;
  presenceGate.set(key, now);
  const db = await sql();
  await db.run(
    `UPDATE teams SET last_seen_at = ? WHERE code = ? AND (last_seen_at IS NULL OR last_seen_at < ?)`,
    [now, key, now - 12_000],
  );
}

export async function setTeamCode(id: string, code: string) {
  const db = await sql();
  await db.run(`UPDATE teams SET code = ? WHERE id = ?`, [code, id]);
}

export async function addCoachNote(teamId: string, puzzleId: string, text: string) {
  const db = await sql();
  const row = await db.get<{ coach_json: string | null; status: string }>(`SELECT coach_json, status FROM teams WHERE id = ?`, [teamId]);
  if (!row) return { error: "Team niet gevonden." as const };
  if (row.status !== "playing") return { error: "Dit team speelt nu niet." as const };
  const notes = coachNotes(row.coach_json);
  const own = notes.filter((item) => item.puzzleId === puzzleId);
  if (own.some((item) => item.text === text)) return { ok: true as const, duplicate: true as const };
  if (own.length >= 3) return { error: "Dit team heeft voor deze opdracht al drie extra hints." as const };
  notes.push({ puzzleId, text });
  await db.run(`UPDATE teams SET coach_json = ? WHERE id = ?`, [JSON.stringify(notes), teamId]);
  return { ok: true as const, duplicate: false as const };
}

export async function clearTeamTime(teamId: string) {
  const db = await sql();
  await db.run(`UPDATE teams SET time_adjust_sec = 0, coach_json = '[]' WHERE id = ?`, [teamId]);
}

export async function renameTeam(id: string, name: string) {
  const db = await sql();
  const wrote = await db.run(`UPDATE teams SET name = ? WHERE id = ?`, [name, id]);
  if (!wrote) return { error: "Team niet gevonden." as const };
  return { ok: true as const };
}

export async function removeReadyTeam(id: string) {
  const db = await sql();
  const row = await db.get<TeamRow>(`SELECT ${TEAM_COLS} FROM teams WHERE id = ?`, [id]);
  if (!row) return { error: "Team niet gevonden." as const };
  const team = teamOf(row);
  const hints = Object.keys(team.hints).length + Object.keys(team.instructorHints).length;
  if (team.status !== "ready" || team.solved.length > 0 || hints > 0 || team.fails > 0) {
    return { error: "Dit team heeft al spelvoortgang en blijft bewaard." as const };
  }
  await db.run(`DELETE FROM teams WHERE id = ? AND status = 'ready'`, [id]);
  return { ok: true as const };
}

export async function addDraftTeam(sessionId: string, name: string) {
  const found = await getSession(sessionId);
  if (!found) return { error: "Sessie niet gevonden." as const };
  if (found.session.status !== "draft") return { error: "Teams toevoegen kan zolang de sessie nog niet is gestart." as const };
  if (found.teams.length >= 24) return { error: "Een sessie heeft maximaal 24 teams." as const };
  const db = await sql();
  let code = makeCode();
  for (let i = 0; i < 8; i += 1) {
    const exists = await db.get<{ code: string }>(`SELECT code FROM teams WHERE code = ?`, [code]);
    if (!exists) break;
    code = makeCode();
  }
  const now = Date.now();
  const team: Team = {
    id: makeId(),
    sessionId,
    name,
    code,
    status: "ready",
    solved: [],
    hints: {},
    instructorHints: {},
    inventory: [],
    eventsSeen: [],
    penaltySec: 0,
    fails: 0,
    finishedAt: null,
    updatedAt: now,
    lastProgressAt: now,
    lastSeenAt: null,
    breachOffsetSec: null,
    phishReported: false,
    timeAdjustSec: 0,
    coach: [],
    awareness: emptyAwareness(),
    story: emptyStory(),
  };
  await insertTeam(team);
  return { ok: true as const, team };
}

export async function updateSessionDetails(
  id: string,
  patch: Partial<Pick<Session, "name" | "clientName" | "eventDate" | "durationSec" | "hintPenalty" | "hintPenaltySec" | "mode" | "sector">>,
) {
  const found = await getSession(id);
  if (!found) return { error: "Sessie niet gevonden." as const };
  await saveSession({ ...found.session, ...patch });
  return { ok: true as const, startedAt: found.session.startedAt };
}

export async function deleteSession(id: string) {
  const db = await sql();
  const existing = await db.get<{ id: string }>(`SELECT id FROM sessions WHERE id = ?`, [id]);
  if (!existing) return false;
  await db.run(`DELETE FROM time_adjustments WHERE session_id = ?`, [id]);
  await db.run(`DELETE FROM teams WHERE session_id = ?`, [id]);
  await db.run(`DELETE FROM sessions WHERE id = ?`, [id]);
  return true;
}

export type TimeGrant = {
  id: string;
  targets: string;
  seconds: number;
  actor: string;
  reason: string;
  createdAt: number;
};

export async function listTimeGrants(sessionId: string) {
  const db = await sql();
  const rows = await db.all<{ id: string; targets_json: string; seconds: number; actor: string; reason?: string | null; created_at: number }>(
    `SELECT id, targets_json, seconds, actor, reason, created_at FROM time_adjustments WHERE session_id = ? ORDER BY created_at DESC`,
    [sessionId],
  );
  return rows.map((row) => ({
    id: row.id,
    targets: String(row.targets_json ?? ""),
    seconds: num(row.seconds),
    actor: row.actor,
    reason: String(row.reason ?? ""),
    createdAt: num(row.created_at),
  }));
}

export async function grantTime(input: {
  session: Session;
  requestId: string;
  teamId: string | null;
  seconds: number;
  actor: string;
  reason: string;
  teams: Team[];
}) {
  const db = await sql();
  const existing = await db.get<{ id: string }>(
    `SELECT id FROM time_adjustments WHERE session_id = ? AND request_key = ?`,
    [input.session.id, input.requestId],
  );
  if (existing) return { duplicate: true as const, applied: [] as string[], skipped: [] as string[] };
  const chosen = input.teamId ? input.teams.filter((team) => team.id === input.teamId) : input.teams;
  if (input.teamId && chosen.length === 0) return { error: "Team niet gevonden." as const };
  const id = makeId();
  const now = Date.now();
  try {
    await db.run(
      `INSERT INTO time_adjustments (id, session_id, request_key, targets_json, seconds, actor, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, input.session.id, input.requestId, "bezig", input.seconds, input.actor, input.reason, now],
    );
  } catch {
    return { duplicate: true as const, applied: [] as string[], skipped: [] as string[] };
  }
  const applied: string[] = [];
  const skipped: string[] = [];
  for (const team of chosen) {
    if (team.status !== "ready" && team.status !== "playing") {
      skipped.push(team.name);
      continue;
    }
    let delta = input.seconds;
    if (delta < 0) {
      const room = Math.max(0, teamRemainingSec(input.session, team, now) - 60);
      if (room < 1) {
        skipped.push(`${team.name} (te weinig tijd over)`);
        continue;
      }
      delta = -Math.min(-delta, room);
    }
    const wrote = await db.run(
      `UPDATE teams SET time_adjust_sec = time_adjust_sec + ? WHERE id = ? AND status IN ('ready', 'playing')`,
      [delta, team.id],
    );
    if (wrote > 0) applied.push(delta === input.seconds ? team.name : `${team.name} (${delta > 0 ? "+" : ""}${Math.round(delta / 60)} min)`);
    else skipped.push(team.name);
  }
  await db.run(`UPDATE time_adjustments SET targets_json = ? WHERE id = ?`, [applied.length > 0 ? applied.join(", ") : "geen team", id]);
  return { duplicate: false as const, applied, skipped };
}

export async function saveSession(session: Session) {
  const db = await sql();
  await db.run(
    `UPDATE sessions SET name = ?, duration_sec = ?, hint_penalty = ?, hint_penalty_sec = ?, status = ?, started_at = ?, pause_started_at = ?, paused_ms = ?, time_adjust_sec = ?, ended_at = ?, mode = ?, sector = ?, client_name = ?, event_date = ? WHERE id = ?`,
    [
      session.name,
      session.durationSec,
      session.hintPenalty ? 1 : 0,
      session.hintPenaltySec,
      session.status,
      session.startedAt,
      session.pauseStartedAt,
      session.pausedMs,
      session.timeAdjustSec,
      session.endedAt,
      session.mode ?? "escape",
      session.sector ?? "general",
      session.clientName ?? "",
      session.eventDate ?? "",
      session.id,
    ],
  );
}

export async function saveTeam(previousUpdatedAt: number, team: Team) {
  const db = await sql();
  return db.run(
    `UPDATE teams SET status = ?, solved_json = ?, hints_json = ?, instructor_hints_json = ?, inventory_json = ?, events_seen_json = ?, penalty_sec = ?, fails = ?, finished_at = ?, updated_at = ?, last_progress_at = ?, breach_offset_sec = ?, phish_reported = ?, story_json = ?, awareness_json = ? WHERE id = ? AND updated_at = ?`,
    [
      team.status,
      JSON.stringify(team.solved),
      JSON.stringify(team.hints),
      JSON.stringify(team.instructorHints),
      JSON.stringify(team.inventory),
      JSON.stringify(team.eventsSeen),
      team.penaltySec,
      team.fails,
      team.finishedAt,
      team.updatedAt,
      team.lastProgressAt,
      team.breachOffsetSec,
      team.phishReported ? 1 : 0,
      JSON.stringify(team.story ?? emptyStory()),
      JSON.stringify(team.awareness ?? emptyAwareness()),
      team.id,
      previousUpdatedAt,
    ],
  );
}
