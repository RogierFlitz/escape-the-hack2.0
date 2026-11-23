import { chapters } from "./game/content";
import { countsOnRoute, requiredPuzzleIds, routeOf } from "./game/route";
import { teamRemainingSec } from "./time";
import type { Session, Team } from "./types";

function chapterIds(chapter: { puzzles: readonly string[] }, route: number) {
  return chapter.puzzles.filter((id) => countsOnRoute(route, id));
}

export function completedChapters(solved: string[], route = 2) {
  return chapters.filter((chapter) => chapterIds(chapter, route).every((id) => solved.includes(id))).length;
}

export function currentChapterId(solved: string[], route = 2) {
  for (const chapter of chapters) {
    if (!chapterIds(chapter, route).every((id) => solved.includes(id))) return chapter.id;
  }
  return 6;
}

export function allSolved(solved: string[], route = 2) {
  return requiredPuzzleIds(route).every((id) => solved.includes(id));
}

export function scoreBreakdown(session: Session, team: Team, now: number) {
  const route = routeOf(session);
  const puzzlePoints = team.solved.filter((id) => countsOnRoute(route, id)).length * 100;
  const chapterBonus = completedChapters(team.solved, route) * 150;
  const done = team.status === "completed";
  const remain = done ? Math.max(0, teamRemainingSec(session, team, team.finishedAt ?? now)) : 0;
  const timeBonus = done ? Math.floor(remain / 60) * 20 : 0;
  const completionBonus = done ? 400 : 0;
  const alertBonus = team.phishReported ? 200 : 0;
  const total = puzzlePoints + chapterBonus + timeBonus + completionBonus + alertBonus;
  return { puzzlePoints, chapterBonus, timeBonus, completionBonus, total };
}
