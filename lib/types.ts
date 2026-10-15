import type { AwarenessState, GameMode } from "./game/awareness";

export type SessionStatus = "draft" | "live" | "paused" | "ended";
export type TeamStatus = "ready" | "playing" | "completed" | "failed";

export type Session = {
  id: string;
  name: string;
  durationSec: number;
  hintPenalty: boolean;
  hintPenaltySec: number;
  mode: GameMode;
  status: SessionStatus;
  startedAt: number | null;
  pauseStartedAt: number | null;
  pausedMs: number;
  timeAdjustSec: number;
  createdAt: number;
  endedAt: number | null;
};

export type Team = {
  id: string;
  sessionId: string;
  name: string;
  code: string;
  status: TeamStatus;
  solved: string[];
  hints: Record<string, number>;
  instructorHints: Record<string, number>;
  inventory: string[];
  eventsSeen: string[];
  penaltySec: number;
  fails: number;
  finishedAt: number | null;
  updatedAt: number;
  lastProgressAt: number;
  breachOffsetSec: number | null;
  phishReported: boolean;
  awareness: AwarenessState;
  story: {
    scenes: string[];
    social: boolean;
    backup: boolean;
    finale: string[];
    replay: string | null;
  };
};

export type Token = { id: string; label: string };

export type PlayFile = {
  id: string;
  name: string;
  kind: "mail" | "log" | "meta" | "note" | "dossier" | "chat";
  chapter: number;
  body: string;
  meta?: { label: string; value: string }[];
};

export type PlaySnapshot = {
  ok: true;
  team: {
    name: string;
    code: string;
    status: TeamStatus;
    score: number;
    rank: number;
    hintCount: number;
    instructorHintCount: number;
    penaltySec: number;
    fails: number;
    phishReported: boolean;
  };
  story: {
    scenes: string[];
    social: boolean;
    backup: boolean;
    finale: string[];
    replay: string | null;
  };
  phase: "lobby" | "office" | "crisis";
  session: {
    id: string;
    name: string;
    status: SessionStatus;
    durationSec: number;
    remainingSec: number;
    running: boolean;
    hintPenalty: boolean;
    hintPenaltySec: number;
    mode: GameMode;
  };
  awareness: AwarenessState;
  chapter: { id: number; title: string; subtitle: string; index: number; total: number };
  progress: { solved: number; total: number; chaptersDone: number };
  puzzles: {
    id: string;
    chapterId: number;
    title: string;
    brief: string;
    bridge: string;
    solved: boolean;
    available: boolean;
    hintLevel: number;
    hints: string[];
  }[];
  inventory: Token[];
  files: PlayFile[];
  events: { id: string; title: string; body: string; tone: "alert" | "message" | "glitch" }[];
  leaderboard: { name: string; score: number; chapter: number; status: TeamStatus }[];
  score: {
    puzzlePoints: number;
    chapterBonus: number;
    timeBonus: number;
    completionBonus: number;
    total: number;
  };
  finished: { outcome: "completed" | "failed"; title: string; elapsedSec: number } | null;
  serverNow: number;
};

export type AdminTeam = {
  id: string;
  name: string;
  code: string;
  status: TeamStatus;
  score: number;
  rank: number;
  chapter: number;
  solved: number;
  total: number;
  hints: number;
  instructorHints: number;
  penaltySec: number;
  remainingSec: number;
  stuck: boolean;
  fails: number;
  currentPuzzle: string | null;
  office: boolean;
  phishReported: boolean;
  lastScene: string | null;
};

export type AdminSnapshot = {
  ok: true;
  lanHosts: string[];
  session: Session & { baseRemainingSec: number };
  teams: AdminTeam[];
};
