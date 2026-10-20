const CLUE_GROUPS = [
  ["astra"],
  ["doc-plan"],
  ["mail-helix", "vendor-helix", "doc-contract"],
  ["agenda-event"],
];

export const PHISH_AFTER_MS = 3 * 60 * 1000;

export function phishReady(seen: string[]) {
  const found = CLUE_GROUPS.filter((group) => group.some((id) => seen.includes(id))).length;
  return found >= 3;
}

export function phishDue(startedAt: number, now: number) {
  return now - startedAt >= PHISH_AFTER_MS;
}
