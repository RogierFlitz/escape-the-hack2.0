import "server-only";
import { getByCode, getSession, listTimeGrants, saveTeam } from "../db/store";
import { lanHosts } from "../net";
import { allSolved, completedChapters, currentChapterId, scoreBreakdown } from "../scoring";
import { baseRemainingSec, crisisElapsedSec, inOffice, teamRemainingSec } from "../time";
import type { AdminSnapshot, PlaySnapshot, Session, Team } from "../types";
import { chapters, files, puzzleCues, puzzles, tokenLabel } from "./content";
import { pendingEvents } from "./events";
import { hintText, rescueHint } from "./hints";
import { emptyAwareness } from "./awareness";
import { presenceOf } from "./presence";
import { emptyStory, lastTransmission, missionReady } from "./story";

const TOTAL = puzzles.length;

function instructorInbox(team: Team) {
  const notes: { id: string; puzzle: string; text: string }[] = [];
  for (const puzzle of puzzles) {
    const playerLevel = team.hints[puzzle.id] ?? 0;
    const instructorLevel = team.instructorHints[puzzle.id] ?? 0;
    const lines = hintText(puzzle.id, Math.max(playerLevel, instructorLevel));
    for (let level = playerLevel + 1; level <= instructorLevel; level += 1) {
      const text = lines[level - 1];
      if (text) notes.push({ id: `${puzzle.id}:hint:${level}`, puzzle: puzzle.title, text });
    }
    (team.coach ?? []).forEach((item, index) => {
      if (item.puzzleId === puzzle.id) notes.push({ id: `${puzzle.id}:coach:${index}`, puzzle: puzzle.title, text: item.text });
    });
  }
  return notes;
}

function easyGuide(session: Session, team: Team, chapterId: number) {
  if ((session.mode ?? "escape") !== "eenvoudig") return null;
  const story = team.story ?? emptyStory();
  const puzzle = puzzles.find((item) => item.chapterId === chapterId && !team.solved.includes(item.id) && missionReady(story, team.solved, item.id) === null);
  if (!puzzle) return null;
  const cue = puzzleCues[puzzle.id];
  return {
    puzzleId: puzzle.id,
    title: puzzle.title,
    action: cue?.action ?? "",
    text: cue?.text ?? puzzle.brief,
    steps: hintText(puzzle.id, 3),
  };
}

function liveScore(session: Session, team: Team, now: number) {
  return scoreBreakdown(session, team, now);
}

export async function settle(session: Session, teams: Team[], now: number) {
  if (session.status !== "live") return teams;
  const next: Team[] = [];
  for (const team of teams) {
    if (team.status !== "playing") {
      next.push(team);
      continue;
    }
    if (teamRemainingSec(session, team, now) > 0) {
      next.push(team);
      continue;
    }
    const failed: Team = {
      ...team,
      status: "failed",
      finishedAt: now,
      updatedAt: now,
    };
    const wrote = await saveTeam(team.updatedAt, failed);
    next.push(wrote ? failed : team);
  }
  return next;
}

export async function playSnapshot(code: string): Promise<PlaySnapshot | null> {
  const found = await getByCode(code);
  if (!found) return null;
  const now = Date.now();
  const teams = await settle(found.session, found.teams, now);
  const team = teams.find((item) => item.id === found.team.id) ?? found.team;
  return present(found.session, team, teams, now);
}

export function present(session: Session, team: Team, teams: Team[], now: number): PlaySnapshot {
  const chapterId = currentChapterId(team.solved);
  const chapter = chapters.find((item) => item.id === chapterId) ?? chapters[0];
  const score = liveScore(session, team, now);
  const ranked = [...teams].sort((a, b) => liveScore(session, b, now).total - liveScore(session, a, now).total || a.name.localeCompare(b.name));
  const rank = Math.max(1, ranked.findIndex((item) => item.id === team.id) + 1);
  const remaining = Math.max(0, teamRemainingSec(session, team, now));
  const clockForElapsed = team.finishedAt && (team.status === "completed" || team.status === "failed") ? team.finishedAt : now;
  const elapsed = crisisElapsedSec(session, team, clockForElapsed);
  const phase = team.status === "ready" ? "lobby" : inOffice(team) ? "office" : "crisis";
  const finished =
    team.status === "completed"
      ? { outcome: "completed" as const, title: "SYSTEM RESTORED", elapsedSec: elapsed }
      : team.status === "failed"
        ? { outcome: "failed" as const, title: "SYSTEM COMPROMISED", elapsedSec: elapsed }
        : null;
  return {
    ok: true,
    team: {
      name: team.name,
      code: team.code,
      status: team.status,
      score: score.total,
      rank,
      hintCount: Object.values(team.hints).reduce((sum, level) => sum + level, 0),
      instructorHintCount: Object.values(team.instructorHints).reduce((sum, level) => sum + level, 0),
      penaltySec: team.penaltySec,
      fails: team.fails,
      phishReported: team.phishReported,
    },
    story: team.story ?? emptyStory(),
    awareness: team.awareness ?? emptyAwareness(),
    phase,
    session: {
      id: session.id,
      name: session.name,
      status: session.status,
      durationSec: session.durationSec,
      remainingSec: remaining,
      running: session.status === "live" && team.status === "playing" && phase === "crisis",
      hintPenalty: session.hintPenalty,
      hintPenaltySec: session.hintPenaltySec,
      mode: session.mode ?? "escape",
      sector: session.sector ?? "general",
      clientName: session.clientName ?? "",
    },
    chapter: { id: chapter.id, title: chapter.title, subtitle: chapter.subtitle, index: chapter.id, total: chapters.length },
    progress: { solved: team.solved.length, total: TOTAL, chaptersDone: completedChapters(team.solved) },
    puzzles: puzzles.map((puzzle) => {
      const level = Math.max(team.hints[puzzle.id] ?? 0, team.instructorHints[puzzle.id] ?? 0);
      const solved = team.solved.includes(puzzle.id);
      return {
        ...puzzle,
        solved,
        available: solved || (puzzle.chapterId === chapterId && missionReady(team.story ?? emptyStory(), team.solved, puzzle.id) === null),
        hintLevel: level,
        hints: hintText(puzzle.id, level),
        coach: (team.coach ?? []).filter((item) => item.puzzleId === puzzle.id).map((item) => item.text),
      };
    }),
    inventory: team.inventory.map((id) => ({ id, label: tokenLabel(id) })),
    files: files.filter((file) => file.chapter <= chapterId),
    events: pendingEvents(team, chapterId, remaining).map(({ id, title, body, tone }) => ({ id, title, body, tone })),
    inbox: instructorInbox(team),
    guide: easyGuide(session, team, chapterId),
    leaderboard: ranked.map((item) => ({
      name: item.name,
      score: liveScore(session, item, now).total,
      chapter: currentChapterId(item.solved),
      status: item.status,
    })),
    score,
    finished,
    serverNow: now,
  };
}

export async function adminSnapshot(sessionId: string): Promise<AdminSnapshot | null> {
  const found = await getSession(sessionId);
  if (!found) return null;
  const now = Date.now();
  const teams = await settle(found.session, found.teams, now);
  const ranked = [...teams].sort((a, b) => scoreBreakdown(found.session, b, now).total - scoreBreakdown(found.session, a, now).total || a.name.localeCompare(b.name));
  return {
    ok: true,
    lanHosts: lanHosts(),
    session: { ...found.session, baseRemainingSec: Math.max(0, baseRemainingSec(found.session, now)) },
    teams: ranked.map((team, index) => {
      const chapter = currentChapterId(team.solved);
      const office = inOffice(team);
      const open = puzzles.find((puzzle) => puzzle.chapterId <= chapter && !team.solved.includes(puzzle.id));
      const idle = now - team.lastProgressAt > 5 * 60 * 1000;
      return {
        id: team.id,
        name: team.name,
        code: team.code,
        status: team.status,
        score: scoreBreakdown(found.session, team, now).total,
        rank: index + 1,
        chapter,
        solved: team.solved.length,
        total: TOTAL,
        hints: Object.values(team.hints).reduce((sum, level) => sum + level, 0),
        instructorHints: Object.values(team.instructorHints).reduce((sum, level) => sum + level, 0),
        penaltySec: team.penaltySec,
        remainingSec: Math.max(0, teamRemainingSec(found.session, team, now)),
        stuck: team.status === "playing" && idle,
        presence: presenceOf(team.lastSeenAt, now),
        lastSeenAt: team.lastSeenAt,
        lastProgressAt: team.lastProgressAt,
        seenAgeSec: team.lastSeenAt === null ? null : Math.max(0, Math.floor((now - team.lastSeenAt) / 1000)),
        activityAgeSec: Math.max(0, Math.floor((now - team.lastProgressAt) / 1000)),
        fails: team.fails,
        currentPuzzle: office ? "Kantoor" : open?.title ?? null,
        office,
        phishReported: team.phishReported,
        extraSec: found.session.timeAdjustSec + team.timeAdjustSec,
        lastScene: lastTransmission(team.story ?? emptyStory()),
        hintsOpen: puzzles
          .filter((puzzle) => puzzle.chapterId === chapter && !team.solved.includes(puzzle.id))
          .map((puzzle) => {
            const level = Math.max(team.hints[puzzle.id] ?? 0, team.instructorHints[puzzle.id] ?? 0);
            const next = level >= 3 ? null : hintText(puzzle.id, level + 1).at(-1) ?? null;
            const coach = (team.coach ?? []).filter((item) => item.puzzleId === puzzle.id).map((item) => item.text);
            const rescue = level >= 3 ? rescueHint(puzzle.id) : null;
            return { id: puzzle.id, title: puzzle.title, level, next, coach, rescue };
          }),
      };
    }),
    timeLog: await listTimeGrants(found.session.id),
  };
}

export function everyoneDone(teams: Team[]) {
  return teams.length > 0 && teams.every((team) => team.status === "completed" || team.status === "failed" || allSolved(team.solved));
}
