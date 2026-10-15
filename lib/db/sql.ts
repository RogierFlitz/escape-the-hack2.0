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
  mode TEXT NOT NULL DEFAULT 'escape'
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
  awareness_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS teams_session ON teams(session_id);
`;

const MIGRATIONS = [
  "ALTER TABLE teams ADD COLUMN breach_offset_sec INTEGER",
  "ALTER TABLE teams ADD COLUMN phish_reported INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE teams ADD COLUMN story_json TEXT NOT NULL DEFAULT '{}'",
  "ALTER TABLE sessions ADD COLUMN mode TEXT NOT NULL DEFAULT 'escape'",
  "ALTER TABLE teams ADD COLUMN awareness_json TEXT NOT NULL DEFAULT '{}'",
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
  const dir = path.join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "game.sqlite"));
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

async function postgres(url: string): Promise<Sql> {
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: url,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  await pool.query(SCHEMA);
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

const globalSql = globalThis as unknown as { __ethSqlV4?: Promise<Sql> };

export function sql() {
  if (!globalSql.__ethSqlV4) {
    const url = process.env.DATABASE_URL;
    globalSql.__ethSqlV4 = url && url.startsWith("postgres") ? postgres(url) : Promise.resolve(sqlite());
  }
  return globalSql.__ethSqlV4;
}
