import { chapters } from "./content";
import { emptyStory, nextBeat, type StoryState } from "./story";

export const DEMO_CODE = "DEMO";

export const demoStops = [
  { id: "origin", label: "Proloog" },
  { id: "briefing", label: "Briefing" },
  { id: "kade", label: "KADE" },
  { id: "m1", label: "Missie 1" },
  { id: "m2", label: "Missie 2" },
  { id: "m3", label: "Missie 3" },
  { id: "m4", label: "Missie 4" },
  { id: "m5", label: "Missie 5" },
  { id: "finale", label: "Finale" },
  { id: "resultaten", label: "Resultaten" },
] as const;

export type DemoStop = (typeof demoStops)[number]["id"];

const TOKENS: Record<string, string> = {
  "ch1-ports": "N74192",
  "ch2-trace": "DOCK-244",
  "ch3-boot": "ROUTE-7",
  "ch4-rotor": "SEAL",
  "ch4-decode": "HX-19",
  "ch5-accuse": "INSIDER:ADLER",
};

export function demoToolsEnabled() {
  return process.env["DEMO_TOOLS"] === "true";
}

export function demoBlocked(admin: boolean) {
  if (process.env.NODE_ENV !== "production") return false;
  return !(demoToolsEnabled() && admin);
}

export function isDemoStop(value: unknown): value is DemoStop {
  return demoStops.some((stop) => stop.id === value);
}

export function demoProgress(stop: DemoStop): { breach: boolean; story: StoryState; solved: string[]; inventory: string[] } {
  if (stop === "briefing" || stop === "origin") return { breach: false, story: emptyStory(), solved: [], inventory: [] };
  if (stop === "kade") return { breach: true, story: emptyStory(), solved: [], inventory: [] };
  const mission = stop === "resultaten" ? 7 : stop === "finale" ? 6 : Number(stop.slice(1));
  const solved = chapters.filter((chapter) => chapter.id < mission).flatMap((chapter) => [...chapter.puzzles]);
  const scenes = ["incident"];
  for (let id = 1; id < mission; id += 1) scenes.push(`m${id}`, `d${id}`);
  return {
    breach: true,
    solved,
    inventory: solved.map((id) => TOKENS[id]).filter((token): token is string => Boolean(token)),
    story: {
      scenes,
      social: mission > 1,
      backup: mission > 4,
      finale: stop === "resultaten" ? ["access", "revoke", "backup-check"] : [],
      replay: null,
    },
  };
}

export function demoBeat(stop: DemoStop) {
  if (stop === "briefing" || stop === "origin") return "office";
  const progress = demoProgress(stop);
  const beat = nextBeat(progress.story, progress.solved, false);
  if (beat.kind === "transmission") return beat.id;
  return beat.kind;
}
