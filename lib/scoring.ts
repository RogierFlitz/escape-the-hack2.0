import { PUZZLE_IDS, chapters } from "./game/content";
import { teamRemainingSec } from "./time";
import type { Session, Team } from "./types";

export function completedChapters(solved: string[]) {
  return chapters.filter((chapter) => chapter.puzzles.every((id) => solved.includes(id))).length;
}

export function currentChapterId(solved: string[]) {
  for (const chapter of chapters) {
    if (!chapter.puzzles.every((id) => solved.includes(id))) return chapter.id;
  }
  return 6;
}

export function allSolved(solved: string[]) {
  return PUZZLE_IDS.every((id) => solved.includes(id));
}

export function scoreBreakdown(session: Session, team: Team, now: number) {
  const puzzlePoints = team.solved.length * 100;
  const chapterBonus = completedChapters(team.solved) * 150;
  const done = team.status === "completed";
  const remain = done ? Math.max(0, teamRemainingSec(session, team, team.finishedAt ?? now)) : 0;
  const timeBonus = done ? Math.floor(remain / 60) * 20 : 0;
  const completionBonus = done ? 400 : 0;
  const alertBonus = team.phishReported ? 200 : 0;
  const total = puzzlePoints + chapterBonus + timeBonus + completionBonus + alertBonus;
  return { puzzlePoints, chapterBonus, timeBonus, completionBonus, total };
}
