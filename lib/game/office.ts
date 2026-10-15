const CLUE_GROUPS = [
  ["astra"],
  ["doc-plan"],
  ["mail-helix", "vendor-helix", "doc-contract"],
  ["agenda-event"],
];

export function phishReady(seen: string[]) {
  const found = CLUE_GROUPS.filter((group) => group.some((id) => seen.includes(id))).length;
  return found >= 3;
}
