export const mediaSlots = [
  { id: "mara-intro", role: "Mara", kind: "video", path: "/mara-intro.mp4", note: "Bestaande intro." },
  { id: "kade-voice", role: "KADE", kind: "stem", path: null, note: "Donkere stem. Tot die er is, spreekt de dreigende apparaatstem." },
  { id: "nora-voice", role: "NORA", kind: "stem", path: null, note: "Rustige stem. Tot die er is, spreekt de gekozen apparaatstem." },
  { id: "bed-office", role: "Werkvloer", kind: "muziek", path: null, note: "Zachte achtergrond tijdens het kantoor." },
  { id: "bed-crisis", role: "Crisis", kind: "muziek", path: null, note: "Spanning tijdens de missies." },
  { id: "bed-finale", role: "Finale", kind: "muziek", path: null, note: "Eindscène." },
] as const;

export type MediaSlot = (typeof mediaSlots)[number];

export function mediaFile(id: string) {
  const slot = mediaSlots.find((item) => item.id === id);
  return slot?.path ?? null;
}

const sceneVoices: Record<string, string> = {};

export function sceneVoice(id: string) {
  return sceneVoices[id] ?? null;
}

export function musicLevel(percent: number, ducked: boolean) {
  const base = Math.min(1, Math.max(0, percent / 100));
  return ducked ? base * 0.22 : base;
}
