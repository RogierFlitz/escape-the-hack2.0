export const PRESENCE_GAP_MS = 12_000;
export const PRESENCE_ONLINE_MS = 20_000;
export const PRESENCE_UNSTABLE_MS = 45_000;

export type Presence = "online" | "unstable" | "offline";

export function presenceOf(lastSeenAt: number | null, now: number): Presence {
  if (lastSeenAt === null || !Number.isFinite(lastSeenAt)) return "offline";
  const age = now - lastSeenAt;
  if (age <= PRESENCE_ONLINE_MS) return "online";
  if (age <= PRESENCE_UNSTABLE_MS) return "unstable";
  return "offline";
}

export function thinking(presence: Presence, status: string, activityAgeSec: number) {
  return presence === "online" && status === "playing" && activityAgeSec >= 120;
}
