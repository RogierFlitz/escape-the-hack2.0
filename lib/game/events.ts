import "server-only";
import { chapters } from "./content";
import type { Team } from "../types";

export type GameEvent = {
  id: string;
  title: string;
  body: string;
  tone: "alert" | "message" | "glitch";
};

const catalog: (GameEvent & {
  puzzle?: string;
  chapterDone?: number;
  chapter?: number;
  underSec?: number;
  needsHint?: boolean;
  needsFail?: boolean;
})[] = [
  {
    id: "kade-miss",
    title: "KADE",
    body: "Dat was het niet. Kijk nog eens naar wat ik heb achtergelaten.",
    tone: "message",
    needsFail: true,
  },
  {
    id: "kade-hint",
    title: "KADE",
    body: "Een hint. Jullie komen er, maar ik geef niets cadeau. De klok wel.",
    tone: "message",
    needsHint: true,
  },
  {
    id: "kade-30",
    title: "KADE",
    body: "Dertig minuten. De helft van jullie tijd is weg.",
    tone: "alert",
    underSec: 1800,
  },
  {
    id: "kade-10",
    title: "KADE",
    body: "Tien minuten. Ik sta nog in de laatste deur.",
    tone: "alert",
    underSec: 600,
  },
  {
    id: "kade-finale",
    title: "KADE",
    body: "Laatste deur. Als die openblijft, kom ik terug.",
    tone: "alert",
    chapter: 6,
  },
  {
    id: "veil-msg",
    title: "Bericht van KADE",
    body: "De planning was openbaar. Het dok ook. Jullie leverancier nam de rest voor zijn rekening.",
    tone: "message",
    chapterDone: 2,
  },
  {
    id: "interference",
    title: "Netwerkstoring",
    body: "Het netwerk hapert terwijl jullie hem afsluiten. De kaart blijft bruikbaar.",
    tone: "glitch",
    chapter: 3,
  },
  {
    id: "payload",
    title: "Payload gewapend",
    body: "KADE heeft de versleuteling gewapend. Alleen een shutdown stopt hem nog.",
    tone: "alert",
    chapterDone: 4,
  },
  {
    id: "five-min",
    title: "Laatste venster",
    body: "Minder dan vijf minuten. Zet de zegels en voer de shutdown uit.",
    tone: "alert",
    underSec: 300,
  },
];

function chapterDone(team: Team, id: number) {
  const chapter = chapters.find((item) => item.id === id);
  return !!chapter && chapter.puzzles.every((puzzle) => team.solved.includes(puzzle));
}

export function pendingEvents(team: Team, chapterId: number, remainingSec: number) {
  if (team.status === "ready") return [];
  if (team.breachOffsetSec === null && team.solved.length === 0) return [];
  const hints = Object.values(team.hints).reduce((sum, level) => sum + level, 0);
  return catalog.filter((event) => {
    if (team.eventsSeen.includes(event.id)) return false;
    if (event.needsHint && hints < 1) return false;
    if (event.needsFail && team.fails < 1) return false;
    if (event.puzzle && !team.solved.includes(event.puzzle)) return false;
    if (event.chapterDone && !chapterDone(team, event.chapterDone)) return false;
    if (event.chapter && chapterId < event.chapter) return false;
    if (event.underSec && (remainingSec <= 0 || remainingSec > event.underSec)) return false;
    if (event.underSec && team.status !== "playing") return false;
    return true;
  });
}
