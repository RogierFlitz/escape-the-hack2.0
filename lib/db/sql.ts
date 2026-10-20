import "server-only";
import { mkdirSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

export type Sql = {
  all<T>(sql: string, params?: unknown[]): Promise<T[]>;
  get<T>(sql: string, params?: unknown[]): Promise<T | undefined>;
  run(sql: string, params?: unknown[]): Promise<number>;
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration_sec INTEGER NOT NULL,
  hint_penalty INTEGER NOT NULL,
  hint_penalty_sec INTEGER NOT NULL,
  status TEXT NOT NULL,
  started_at BIGINT,
  pause_started_at BIGINT,
  paused_ms BIGINT NOT NULL DEFAULT 0,
  time_adjust_sec INTEGER NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  ended_at BIGINT,
  mode TEXT NOT NULL DEFAULT 'escape',
  sector TEXT NOT NULL DEFAULT 'general',
  client_name TEXT NOT NULL DEFAULT '',
  event_date TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  solved_json TEXT NOT NULL,
  hints_json TEXT NOT NULL,
  instructor_hints_json TEXT NOT NULL,
  inventory_json TEXT NOT NULL,
  events_seen_json TEXT NOT NULL,
  penalty_sec INTEGER NOT NULL DEFAULT 0,
  fails INTEGER NOT NULL DEFAULT 0,
  finished_at BIGINT,
  updated_at BIGINT NOT NULL,
  last_progress_at BIGINT NOT NULL,
  breach_offset_sec INTEGER,
  phish_reported INTEGER NOT NULL DEFAULT 0,
  story_json TEXT NOT NULL DEFAULT '{}',
  awareness_json TEXT NOT NULL DEFAULT '{}',
  time_adjust_sec INTEGER NOT NULL DEFAULT 0,
  coach_json TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS teams_session ON teams(session_id);
CREATE TABLE IF NOT EXISTS time_adjustments (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  request_key TEXT NOT NULL,
  targets_json TEXT NOT NULL,
  seconds INTEGER NOT NULL,
  actor TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at BIGINT NOT NULL,
  UNIQUE(session_id, request_key)
);
`;

const MIGRATIONS = [
  "ALTER TABLE teams ADD COLUMN breach_offset_sec INTEGER",
  "ALTER TABLE teams ADD COLUMN phish_reported INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE teams ADD COLUMN story_json TEXT NOT NULL DEFAULT '{}'",
  "ALTER TABLE sessions ADD COLUMN mode TEXT NOT NULL DEFAULT 'escape'",
  "ALTER TABLE sessions ADD COLUMN sector TEXT NOT NULL DEFAULT 'general'",
  "ALTER TABLE teams ADD COLUMN awareness_json TEXT NOT NULL DEFAULT '{}'",
  "ALTER TABLE teams ADD COLUMN time_adjust_sec INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE teams ADD COLUMN coach_json TEXT NOT NULL DEFAULT '[]'",
  "ALTER TABLE time_adjustments ADD COLUMN reason TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE sessions ADD COLUMN client_name TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE sessions ADD COLUMN event_date TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE teams ADD COLUMN last_seen_at BIGINT",
];

function migrateSqlite(db: DatabaseSync) {
  for (const statement of MIGRATIONS) {
    try {
      db.exec(statement);
    } catch {
      /* kolom bestaat al */
    }
  }
}

function sqlite(): Sql {
  const file = process.env.SQLITE_PATH
    ? path.resolve(process.env.SQLITE_PATH)
    : path.join(process.cwd(), "data", "game.sqlite");
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 4000;");
  db.exec(SCHEMA);
  migrateSqlite(db);
  return {
    async all<T>(sql: string, params: unknown[] = []) {
      return db.prepare(sql).all(...(params as never[])) as T[];
    },
    async get<T>(sql: string, params: unknown[] = []) {
      return db.prepare(sql).get(...(params as never[])) as T | undefined;
    },
    async run(sql: string, params: unknown[] = []) {
      return Number(db.prepare(sql).run(...(params as never[])).changes);
    },
  };
}

function toPg(sql: string) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value : "";
}

async function postgres(url: string): Promise<Sql> {
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: url,
    ssl: readEnv("DATABASE_SSL") === "true" ? { rejectUnauthorized: false } : undefined,
  });
  for (const statement of SCHEMA.split(";").map((item) => item.trim()).filter(Boolean)) {
    await pool.query(statement);
  }
  for (const statement of MIGRATIONS) {
    try {
      await pool.query(statement);
    } catch {
      /* kolom bestaat al */
    }
  }
  return {
    async all<T>(sql: string, params: unknown[] = []) {
      const result = await pool.query(toPg(sql), params);
      return result.rows as T[];
    },
    async get<T>(sql: string, params: unknown[] = []) {
      const result = await pool.query(toPg(sql), params);
      return result.rows[0] as T | undefined;
    },
    async run(sql: string, params: unknown[] = []) {
      const result = await pool.query(toPg(sql), params);
      return result.rowCount ?? 0;
    },
  };
}

const globalSql = globalThis as unknown as { __ethSqlV5?: Promise<Sql> };

export function sql() {
  if (!globalSql.__ethSqlV5) {
    const url = readEnv("DATABASE_URL");
    if (readEnv("VERCEL") && !url.startsWith("postgres")) {
      globalSql.__ethSqlV5 = Promise.reject(new Error("NO_STORE"));
    } else {
      globalSql.__ethSqlV5 = url && url.startsWith("postgres") ? postgres(url) : Promise.resolve(sqlite());
    }
  }
  return globalSql.__ethSqlV5.catch((error: unknown) => {
    globalSql.__ethSqlV5 = undefined;
    throw error;
  });
}
