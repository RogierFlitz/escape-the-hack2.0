import type { Session, Team } from "./types";

export function breachOffset(team: Team) {
  if (team.breachOffsetSec !== null && team.breachOffsetSec !== undefined) return team.breachOffsetSec;
  if (team.solved.length > 0 || team.status === "completed") return 0;
  return null;
}

export function inOffice(team: Team) {
  return team.status === "playing" && team.breachOffsetSec === null && team.solved.length === 0;
}

export function elapsedSec(session: Session, now: number) {
  if (!session.startedAt) return 0;
  let end = now;
  if (session.status === "paused" && session.pauseStartedAt) end = session.pauseStartedAt;
  if (session.status === "ended" && session.endedAt) end = session.endedAt;
  return Math.max(0, Math.floor((end - session.startedAt - session.pausedMs) / 1000));
}

export function baseRemainingSec(session: Session, now: number) {
  if (session.status === "draft") return session.durationSec;
  return session.durationSec + session.timeAdjustSec - elapsedSec(session, now);
}

export function crisisElapsedSec(session: Session, team: Team, now: number) {
  const offset = breachOffset(team);
  if (offset === null) return 0;
  return Math.max(0, elapsedSec(session, now) - offset);
}

export function teamRemainingSec(session: Session, team: Team, now: number) {
  if (session.status === "draft") return session.durationSec;
  const freeze = team.finishedAt && (team.status === "completed" || team.status === "failed") ? team.finishedAt : now;
  const clockNow = team.status === "completed" || team.status === "failed" ? freeze : now;
  const offset = breachOffset(team);
  if (offset === null) return session.durationSec + session.timeAdjustSec - team.penaltySec;
  return session.durationSec + session.timeAdjustSec - team.penaltySec - crisisElapsedSec(session, team, clockNow);
}

export function running(session: Session) {
  return session.status === "live";
}
