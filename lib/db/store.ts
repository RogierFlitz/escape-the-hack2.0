import "server-only";
import { makeCode, makeId } from "../codes";
import { emptyAwareness, parseAwareness, parseMode } from "../game/awareness";
import { parseSector, type Sector } from "../game/sector";
import { emptyStory, parseStory } from "../game/story";
import type { GameMode } from "../game/awareness";
import type { Session, SessionStatus, Team, TeamStatus } from "../types";
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
  breach_offset_sec: number | null;
  phish_reported: number;
  story_json: string | null;
  awareness_json?: string | null;
};

function parse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
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
    breachOffsetSec: numOrNull(row.breach_offset_sec),
    phishReported: num(row.phish_reported) === 1,
    awareness: parseAwareness(parse(row.awareness_json || "{}", {})),
    story: parseStory(parse(row.story_json || "{}", {})),
  };
}

const SESSION_COLS = `id, name, duration_sec, hint_penalty, hint_penalty_sec, status, started_at, pause_started_at, paused_ms, time_adjust_sec, created_at, ended_at, mode, sector`;
const TEAM_COLS = `id, session_id, name, code, status, solved_json, hints_json, instructor_hints_json, inventory_json, events_seen_json, penalty_sec, fails, finished_at, updated_at, last_progress_at, breach_offset_sec, phish_reported, story_json, awareness_json`;

export async function listSessions() {
  const db = await sql();
  const rows = await db.all<SessionRow>(`SELECT ${SESSION_COLS} FROM sessions ORDER BY created_at DESC`);
  return rows.map(sessionOf);
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
  };
  await db.run(
    `INSERT INTO sessions (id, name, duration_sec, hint_penalty, hint_penalty_sec, status, started_at, pause_started_at, paused_ms, time_adjust_sec, created_at, ended_at, mode, sector)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      breachOffsetSec: null,
      phishReported: false,
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

export async function setTeamCode(id: string, code: string) {
  const db = await sql();
  await db.run(`UPDATE teams SET code = ? WHERE id = ?`, [code, id]);
}

export async function saveSession(session: Session) {
  const db = await sql();
  await db.run(
    `UPDATE sessions SET name = ?, duration_sec = ?, hint_penalty = ?, hint_penalty_sec = ?, status = ?, started_at = ?, pause_started_at = ?, paused_ms = ?, time_adjust_sec = ?, ended_at = ?, mode = ?, sector = ? WHERE id = ?`,
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
