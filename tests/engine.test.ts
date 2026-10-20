import assert from "node:assert/strict";
import test from "node:test";
import { emptyAwareness, gradeDecision, gradeEval, includesTraining, markPrologue, parseAwareness, parseMode, pendingStoryDecision, prologueComplete, recordDecision, recordEval, recordPulse, trainingReport } from "../lib/game/awareness";
import { mediaFile, musicLevel, sceneVoice } from "../lib/game/media";
import { presenceOf, thinking } from "../lib/game/presence";
import { colleaguePost, sources } from "../lib/game/footprint";
import { grade } from "../lib/game/grade";
import { hintText, rescueHint } from "../lib/game/hints";
import { phishDue, phishReady } from "../lib/game/office";
import { PUZZLE_IDS, puzzleCues } from "../lib/game/content";
import { demoBeat, demoBlocked } from "../lib/game/demo";
import { finaleSessions } from "../lib/game/shutdown";
import { applyStory, emptyStory, nextBeat } from "../lib/game/story";
import { asSector } from "../lib/game/sector";
import { narrateHoldMs } from "../components/game/narrate";
import { allSolved, currentChapterId, scoreBreakdown } from "../lib/scoring";
import { baseRemainingSec, teamRemainingSec } from "../lib/time";
import type { Session, Team } from "../lib/types";

const session: Session = {
  id: "s",
  name: "Test",
  durationSec: 3600,
  hintPenalty: true,
  hintPenaltySec: 30,
  mode: "escape",
  sector: "general",
  clientName: "",
  eventDate: "",
  status: "live",
  startedAt: 1_000_000,
  pauseStartedAt: null,
  pausedMs: 0,
  timeAdjustSec: 0,
  createdAt: 0,
  endedAt: null,
};

function team(partial: Partial<Team> = {}): Team {
  return {
    id: "t",
    sessionId: "s",
    name: "Team",
    code: "TEST",
    status: "playing",
    solved: [],
    hints: {},
    instructorHints: {},
    inventory: [],
    eventsSeen: [],
    penaltySec: 0,
    fails: 0,
    finishedAt: null,
    updatedAt: 0,
    lastProgressAt: 0,
    lastSeenAt: null,
    breachOffsetSec: 0,
    phishReported: false,
    timeAdjustSec: 0,
    coach: [],
    awareness: emptyAwareness(),
    story: emptyStory(),
    ...partial,
  };
}

test("elke puzzel heeft één juiste oplossing", () => {
  const pins = [
    { id: "mara-lead", claim: "who" },
    { id: "dock-shot", claim: "where" },
    { id: "helix-floor", claim: "vendor" },
    { id: "adler-table", claim: "leak" },
    { id: "helix-card", claim: "trust" },
    { id: "berg-vrij", claim: "public" },
  ];
  assert.equal(grade("ch1-bays", { pins }).ok, true);
  assert.equal(grade("ch1-bays", { pins: pins.slice(0, 4) }).ok, false);
  assert.equal(grade("ch1-bays", { pins: pins.filter((pin) => pin.claim !== "public") }).ok, false);
  assert.equal(grade("ch1-bays", { pins: [...pins.slice(0, 4), { id: "coffee-post", claim: "trust" }] }).ok, false);
  const wrongPublic = grade("ch1-bays", { pins: pins.map((pin) => (pin.claim === "public" ? { id: "run-post", claim: "public" } : pin)) });
  assert.equal(wrongPublic.ok, false);
  if (!wrongPublic.ok) {
    const note = wrongPublic.note ?? "";
    assert.equal(note.includes("Ardennen"), false);
    assert.equal(note.includes("Berg"), false);
    assert.equal(note.toLowerCase().includes("vakantie"), false);
  }
  const post = sources.find((item) => item.id === colleaguePost.id);
  assert.equal(post?.title, colleaguePost.title);
  assert.equal(post?.author, colleaguePost.author);
  assert.equal(post?.body, colleaguePost.body);
  assert.match(post?.audience ?? "", /Openbaar/);
  assert.match(post?.audience ?? "", /iedereen kan dit zien/);
  assert.equal(colleaguePost.body.toLowerCase().includes("kade"), false);
  assert.equal(grade("ch1-login", { spots: ["lanyard", "badge", "sign", "plan"] }).ok, true);
  assert.equal(grade("ch1-login", { spots: ["badge", "plan", "sign", "mug"] }).ok, false);
  assert.equal(grade("ch1-nodes", { links: { lead: "mara", place: "dok", vendor: "helix", leak: "adler", trust: "listing" } }).ok, true);
  assert.equal(grade("ch1-nodes", { links: { lead: "vale", place: "dok", vendor: "helix", leak: "adler", trust: "listing" } }).ok, false);
  const recon = grade("ch1-ports", { event: "nexora-day", name: "helix", step: "impersonate" });
  assert.equal(recon.ok, true);
  if (recon.ok) assert.equal(recon.token, "N74192");
  const missed = grade("ch1-ports", { event: "park", name: "helix", step: "impersonate" });
  assert.equal(missed.ok, false);
  if (!missed.ok) assert.equal(missed.note?.includes("nexora-day"), false);
  assert.equal(grade("ch2-acrostic", { mail: "phish", evidence: ["contract", "header"] }).ok, true);
  assert.equal(grade("ch2-acrostic", { mail: "phish", evidence: ["logo"] }).ok, false);
  assert.equal(grade("ch2-acrostic", { mail: "prior", evidence: ["contract", "prior"] }).ok, false);
  assert.equal(grade("ch2-meta", { marks: ["author", "dock-row"] }).ok, true);
  assert.equal(grade("ch2-meta", { marks: ["filename"] }).ok, false);
  assert.equal(grade("ch2-timeline", { order: ["phish", "dock", "export"] }).ok, true);
  assert.equal(grade("ch2-timeline", { order: ["phish", "maint", "export"] }).ok, false);
  const trace = grade("ch2-trace", { job: "DOCK-244", supports: ["export-log", "attachment"] });
  assert.equal(trace.ok, true);
  if (trace.ok) assert.equal(trace.token, "DOCK-244");
  const wrongJob = grade("ch2-trace", { job: "CORE-011", supports: ["export-log", "attachment"] });
  assert.equal(wrongJob.ok, false);
  if (!wrongJob.ok) assert.equal(wrongJob.note?.includes("DOCK-244"), false);
  assert.equal(grade("ch3-logic", { session: "helix-svc", clues: ["hours", "vault"] }).ok, true);
  assert.equal(grade("ch3-logic", { session: "backup-svc", clues: ["hours", "vault"] }).ok, false);
  assert.equal(grade("ch3-logic", { session: "helix-svc", clues: ["name"] }).ok, false);
  const route = grade("ch3-path", { path: ["CRU", "EDGE", "DNS", "AUTH", "VAULT"] });
  assert.equal(route.ok, true);
  if (route.ok) assert.equal(route.token, undefined);
  const wrongRoute = grade("ch3-path", { path: ["CRU", "EDGE", "PROXY", "LOG", "VAULT"] });
  assert.equal(wrongRoute.ok, false);
  if (!wrongRoute.ok) assert.equal(wrongRoute.note?.includes("ROUTE-7"), false);
  const isolate = grade("ch3-boot", { actions: ["isolate-session", "keep-log", "hold-edge"] });
  assert.equal(isolate.ok, true);
  if (isolate.ok) assert.equal(isolate.token, "ROUTE-7");
  const cutVault = grade("ch3-boot", { actions: ["isolate-session", "cut-vault"] });
  assert.equal(cutVault.ok, false);
  if (!cutVault.ok) assert.equal(cutVault.note?.includes("ROUTE-7"), false);
  assert.equal(grade("ch3-cables", { DNS: "53", AUTH: "443", LOG: "514", TRAP: "PARK", order: ["DNS", "AUTH", "VAULT"] }).ok, true);
  assert.equal(grade("ch3-cables", { DNS: "53", AUTH: "443", LOG: "514", TRAP: "PARK", order: ["VAULT", "DNS", "AUTH"] }).ok, false);
  assert.equal(grade("ch3-cables", { DNS: "443", AUTH: "53", LOG: "514", TRAP: "PARK", order: ["DNS", "AUTH", "VAULT"] }).ok, false);
  assert.equal(grade("ch4-symbols", { files: ["planning", "contract", "staff", "finance", "agenda"] }).ok, true);
  assert.equal(grade("ch4-symbols", { files: ["planning", "menu"] }).ok, false);
  assert.equal(grade("ch4-sequence", { value: 22 }).ok, true);
  assert.equal(grade("ch4-sequence", { value: 23 }).ok, false);
  const seal = grade("ch4-rotor", { word: "SEAL", shape: "square" });
  assert.equal(seal.ok, true);
  if (seal.ok) assert.equal(seal.token, "SEAL");
  assert.equal(grade("ch4-rotor", { word: "ZLHS", shape: "square" }).ok, false);
  const mirror = grade("ch4-backup", { id: "live-mirror" });
  assert.equal(mirror.ok, false);
  if (!mirror.ok) assert.equal(mirror.note?.includes("kluis-nacht"), false);
  assert.equal(grade("ch4-backup", { id: "kluis-nacht" }).ok, true);
  const helix = grade("ch4-decode", { code: "HX-19" });
  assert.equal(helix.ok, true);
  if (helix.ok) assert.equal(helix.token, "HX-19");
  const otherPass = grade("ch4-decode", { code: "4418" });
  assert.equal(otherPass.ok, false);
  if (!otherPass.ok) assert.equal(otherPass.note?.includes("HX-19"), false);
  assert.equal(grade("ch5-camera", { frames: ["cafe-0236", "dock-0231", "entry-0248", "gate-0229"] }).ok, true);
  assert.equal(grade("ch5-camera", { frames: ["entry-0155", "dock-0231"] }).ok, false);
  assert.equal(grade("ch5-places", { places: { vale: "kantine", crew: "dok", okonkwo: "rek", crowe: "kantoor" }, badge: "apart" }).ok, true);
  assert.equal(grade("ch5-places", { places: { vale: "dok", crew: "dok", okonkwo: "rek", crowe: "kantoor" }, badge: "apart" }).ok, false);
  assert.equal(grade("ch5-share", { setting: "19:04", opened: "19:06", message: "19:05" }).ok, true);
  const later = grade("ch5-share", { setting: "19:04", opened: "02:44", message: "19:05" });
  assert.equal(later.ok, false);
  if (!later.ok) assert.equal(later.note?.includes("Adler"), false);
  const report = grade("ch5-accuse", { person: "adler", document: "planning", cause: "open-link", intent: "unintended", evidence: ["share-log", "chat-link", "external-open"] });
  assert.equal(report.ok, true);
  if (report.ok) assert.equal(report.token, "INSIDER:ADLER");
  const cameraOnly = grade("ch5-accuse", { person: "adler", document: "planning", cause: "open-link", intent: "unintended", evidence: ["cam-dock"] });
  assert.equal(cameraOnly.ok, false);
  if (!cameraOnly.ok) assert.equal(cameraOnly.note?.includes("HX-19"), false);
  assert.equal(grade("ch6-seals", { perimeter: "SEAL", trace: "DOCK-244", lockout: "HX-19" }).ok, true);
  assert.equal(grade("ch6-shutdown", { order: ["N74192", "DOCK-244", "ROUTE-7", "HX-19"] }).ok, true);
});

test("KADE opent het verhaal stap voor stap", () => {
  let story = emptyStory();
  assert.equal(nextBeat(story, []).kind, "transmission");
  const incident = applyStory(story, [], false, { scene: "incident" });
  assert.equal("story" in incident, true);
  if (!("story" in incident)) return;
  story = incident.story;
  const mission = applyStory(story, [], false, { scene: "m1" });
  if (!("story" in mission)) throw new Error("m1");
  story = mission.story;
  assert.equal(nextBeat(story, []).kind, "puzzle");
  const solved = ["ch1-bays", "ch1-login", "ch1-nodes", "ch1-ports"];
  const after = nextBeat({ ...story, social: true }, solved);
  assert.equal(after.kind, "transmission");
  if (after.kind !== "transmission") return;
  assert.equal(after.id, "k1");
  const kade = applyStory({ ...story, social: true }, solved, false, { scene: "k1" });
  if (!("story" in kade)) throw new Error("k1");
  const lesson = nextBeat(kade.story, solved);
  assert.equal(lesson.kind, "discovery");
  if (lesson.kind !== "discovery") return;
  assert.equal(lesson.id, "d1");
  const nora = applyStory(kade.story, solved, false, { scene: "d1" });
  if (!("story" in nora)) throw new Error("d1");
  const next = nextBeat(nora.story, solved);
  assert.equal(next.kind, "transmission");
  if (next.kind === "transmission") assert.equal(next.id, "m2");
  const chapterOne = ["ch1-bays", "ch1-login", "ch1-nodes", "ch1-ports"];
  const missionTwo = applyStory(nora.story, chapterOne, false, { scene: "m2" });
  if (!("story" in missionTwo)) throw new Error("m2");
  const afterMail = nextBeat(missionTwo.story, [...chapterOne, "ch2-acrostic"]);
  assert.equal(afterMail.kind, "transmission");
  if (afterMail.kind !== "transmission") return;
  assert.equal(afterMail.id, "k2a");
  const seenSign = applyStory(missionTwo.story, [...chapterOne, "ch2-acrostic"], false, { scene: "k2a" });
  if (!("story" in seenSign)) throw new Error("k2a");
  const chapterTwo = [...chapterOne, "ch2-acrostic", "ch2-meta", "ch2-timeline", "ch2-trace"];
  const closing = nextBeat(seenSign.story, chapterTwo);
  assert.equal(closing.kind, "transmission");
  if (closing.kind !== "transmission") return;
  assert.equal(closing.id, "k2");
  const closingScene = applyStory(seenSign.story, chapterTwo, false, { scene: "k2" });
  if (!("story" in closingScene)) throw new Error("k2");
  const supplierLesson = nextBeat(closingScene.story, chapterTwo);
  assert.equal(supplierLesson.kind, "discovery");
  if (supplierLesson.kind !== "discovery") return;
  assert.equal(supplierLesson.id, "d2");
  const network = applyStory(closingScene.story, chapterTwo, false, { scene: "d2" });
  if (!("story" in network)) throw new Error("d2");
  const missionThree = nextBeat(network.story, chapterTwo);
  assert.equal(missionThree.kind, "transmission");
  if (missionThree.kind === "transmission") assert.equal(missionThree.id, "m3");
  const opened = applyStory(network.story, chapterTwo, false, { scene: "m3" });
  if (!("story" in opened)) throw new Error("m3");
  const afterRoute = nextBeat(opened.story, [...chapterTwo, "ch3-logic", "ch3-path"]);
  assert.equal(afterRoute.kind, "transmission");
  if (afterRoute.kind !== "transmission") return;
  assert.equal(afterRoute.id, "k3a");
  const seenLine = applyStory(opened.story, [...chapterTwo, "ch3-logic", "ch3-path"], false, { scene: "k3a" });
  if (!("story" in seenLine)) throw new Error("k3a");
  const chapterThree = [...chapterTwo, "ch3-logic", "ch3-path", "ch3-boot", "ch3-cables"];
  const lockdown = nextBeat(seenLine.story, chapterThree);
  assert.equal(lockdown.kind, "transmission");
  if (lockdown.kind !== "transmission") return;
  assert.equal(lockdown.id, "k3");
  const lockdownScene = applyStory(seenLine.story, chapterThree, false, { scene: "k3" });
  if (!("story" in lockdownScene)) throw new Error("k3");
  const networkLesson = nextBeat(lockdownScene.story, chapterThree);
  assert.equal(networkLesson.kind, "discovery");
  if (networkLesson.kind !== "discovery") return;
  assert.equal(networkLesson.id, "d3");
  assert.equal(hintText("ch1-bays", 3).join(" ").includes("N74192"), false);
  assert.equal(hintText("ch2-acrostic", 3).join(" ").includes("Het woord is DOCK"), false);
  assert.equal(hintText("ch2-meta", 3).join(" ").includes("DOCK-244"), false);
  assert.equal(hintText("ch3-path", 3).join(" ").includes("CRU"), false);
  assert.equal(hintText("ch3-boot", 3).join(" ").includes("ROUTE-7"), false);
  assert.equal(hintText("ch3-logic", 3).join(" ").includes("dit is de hacker"), false);
});

test("opdrachtregels noemen de handeling en niet het antwoord", () => {
  const needed = [
    "ch1-bays", "ch1-login", "ch1-nodes", "ch1-ports",
    "ch2-acrostic", "ch2-meta", "ch2-timeline", "ch2-trace",
    "ch3-logic", "ch3-path", "ch3-boot", "ch3-cables",
    "ch4-symbols", "ch4-sequence", "ch4-rotor", "ch4-backup", "ch4-decode",
    "ch5-camera", "ch5-places", "ch5-share", "ch5-accuse",
    "access", "revoke", "seals", "backup-check", "shutdown",
  ];
  const banned = ["N74192", "DOCK-244", "helix-svc", "ROUTE-7", "SEAL", "kluis-nacht", "HX-19", "Adler", "unintended", "onbedoeld", "helix-event.co", "CRU", "vierkant", "22"];
  for (const id of needed) {
    const cue = puzzleCues[id];
    assert.ok(cue?.text && cue.action, id);
  }
  const blob = Object.values(puzzleCues).map((cue) => `${cue.text} ${cue.action}`).join("\n");
  for (const word of banned) assert.equal(blob.includes(word), false, word);
});

test("demo landt op het gekozen moment", () => {
  assert.equal(demoBeat("briefing"), "office");
  assert.equal(demoBeat("kade"), "incident");
  assert.equal(demoBeat("m1"), "m1");
  assert.equal(demoBeat("m2"), "m2");
  assert.equal(demoBeat("m3"), "m3");
  assert.equal(demoBeat("m4"), "m4");
  assert.equal(demoBeat("m5"), "m5");
  assert.equal(demoBeat("finale"), "m6");
  assert.equal(demoBeat("resultaten"), "done");
});

test("de verdachte mail komt na genoeg onderzoek, zonder vaste volgorde", () => {
  assert.equal(phishReady(["astra"]), false);
  assert.equal(phishReady(["astra", "doc-plan"]), false);
  assert.equal(phishReady(["doc-plan", "vendor-helix", "agenda-event"]), true);
  assert.equal(phishReady(["astra", "doc-plan", "mail-helix"]), true);
  assert.equal(phishDue(1_000, 1_000 + 3 * 60 * 1000 - 1), false);
  assert.equal(phishDue(1_000, 1_000 + 3 * 60 * 1000), true);
});

test("hoofdstukken gaan pas open als de vorige dicht is", () => {
  assert.equal(currentChapterId([]), 1);
  assert.equal(currentChapterId(["ch1-bays", "ch1-login", "ch1-nodes", "ch1-ports"]), 2);
  assert.equal(allSolved(PUZZLE_IDS), true);
});

test("de crisisklok start pas wanneer de hack gebeurt", () => {
  const office = team({ breachOffsetSec: null });
  assert.equal(teamRemainingSec(session, office, 1_000_000 + 120_000), 3600);
  const breached = team({ breachOffsetSec: 60 });
  assert.equal(teamRemainingSec(session, breached, 1_000_000 + 120_000), 3540);
});

test("timer bevriest tijdens pauze en hintstraf telt per team", () => {
  const paused: Session = { ...session, status: "paused", pauseStartedAt: 1_000_000 + 60_000, pausedMs: 0 };
  assert.equal(baseRemainingSec(paused, 1_000_000 + 120_000), 3540);
  const playing = team({ penaltySec: 30 });
  assert.equal(teamRemainingSec(session, playing, 1_000_000 + 10_000), 3560);
  const gifted = team({ timeAdjustSec: 300, breachOffsetSec: 0 });
  assert.equal(teamRemainingSec(session, gifted, 1_000_000 + 10_000), 3890);
  assert.equal(scoreBreakdown(session, gifted, 1_000_000 + 10_000).total, scoreBreakdown(session, team({ breachOffsetSec: 0 }), 1_000_000 + 10_000).total);
});

test("eindscore telt puzzels, hoofdstukken, tijd en afronding", () => {
  const done = team({
    status: "completed",
    solved: [...PUZZLE_IDS],
    finishedAt: 1_000_000 + 600_000,
  });
  const score = scoreBreakdown(session, done, 1_000_000 + 3_000_000);
  assert.equal(score.puzzlePoints, PUZZLE_IDS.length * 100);
  assert.equal(score.chapterBonus, 6 * 150);
  assert.equal(score.completionBonus, 400);
  assert.equal(score.timeBonus, 50 * 20);
  assert.equal(score.total, score.puzzlePoints + score.chapterBonus + score.completionBonus + score.timeBonus);
});

test("het herstel kiest de kluis pas na vergelijking en opent daarna het spoor", () => {
  const solvedBase = [
    "ch1-bays", "ch1-login", "ch1-nodes", "ch1-ports",
    "ch2-acrostic", "ch2-meta", "ch2-timeline", "ch2-trace",
    "ch3-logic", "ch3-path", "ch3-boot", "ch3-cables",
  ];
  const story = {
    scenes: ["incident", "m1", "d1", "m2", "d2", "m3", "d3", "m4"],
    social: true,
    backup: false,
    finale: [],
    replay: null,
  };
  const mid = [...solvedBase, "ch4-symbols", "ch4-sequence", "ch4-rotor"];
  const choice = nextBeat(story, mid);
  assert.equal(choice.kind, "puzzle");
  if (choice.kind === "puzzle") assert.equal(choice.puzzleId, "ch4-backup");
  const done = [...mid, "ch4-backup", "ch4-decode"];
  const close = nextBeat({ ...story, backup: true }, done);
  assert.equal(close.kind, "transmission");
  if (close.kind === "transmission") assert.equal(close.id, "k4");
  const seen = applyStory({ ...story, backup: true }, done, false, { scene: "k4" });
  if (!("story" in seen)) throw new Error("k4");
  const lesson = nextBeat(seen.story, done);
  assert.equal(lesson.kind, "discovery");
  if (lesson.kind === "discovery") assert.equal(lesson.id, "d4");
  assert.equal(hintText("ch4-rotor", 3).join(" ").includes("SEAL"), false);
  assert.equal(hintText("ch4-sequence", 3).join(" ").includes("22"), false);
  assert.equal(hintText("ch4-decode", 3).join(" ").includes("HX-19"), false);
  assert.equal(hintText("ch4-symbols", 3).join(" ").includes("vierkant"), false);
});

test("het archief eindigt bij de fout, niet bij een naam vooraf", () => {
  const solvedBase = [
    "ch1-bays", "ch1-login", "ch1-nodes", "ch1-ports",
    "ch2-acrostic", "ch2-meta", "ch2-timeline", "ch2-trace",
    "ch3-logic", "ch3-path", "ch3-boot", "ch3-cables",
    "ch4-symbols", "ch4-sequence", "ch4-rotor", "ch4-backup", "ch4-decode",
  ];
  const story = {
    scenes: ["incident", "m1", "d1", "m2", "d2", "m3", "d3", "m4", "k4", "d4", "m5"],
    social: true,
    backup: true,
    finale: [],
    replay: null,
  };
  const mid = [...solvedBase, "ch5-camera", "ch5-places", "ch5-share"];
  const report = nextBeat(story, mid);
  assert.equal(report.kind, "puzzle");
  if (report.kind === "puzzle") assert.equal(report.puzzleId, "ch5-accuse");
  const done = [...mid, "ch5-accuse"];
  const close = nextBeat(story, done);
  assert.equal(close.kind, "transmission");
  if (close.kind === "transmission") assert.equal(close.id, "k5");
  const seen = applyStory(story, done, false, { scene: "k5" });
  if (!("story" in seen)) throw new Error("k5");
  const lesson = nextBeat(seen.story, done);
  assert.equal(lesson.kind, "discovery");
  if (lesson.kind === "discovery") assert.equal(lesson.id, "d5");
  const level = hintText("ch5-accuse", 3).join(" ");
  assert.equal(level.includes("Adler"), false);
  assert.equal(level.includes("onbedoeld"), false);
});

test("de finale eist sporen en een gesloten deellink", () => {
  const solved = [
    "ch1-bays", "ch1-login", "ch1-nodes", "ch1-ports",
    "ch2-acrostic", "ch2-meta", "ch2-timeline", "ch2-trace",
    "ch3-logic", "ch3-path", "ch3-boot", "ch3-cables",
    "ch4-symbols", "ch4-sequence", "ch4-rotor", "ch4-backup", "ch4-decode",
    "ch5-camera", "ch5-places", "ch5-share", "ch5-accuse",
  ];
  const story = {
    scenes: ["incident", "m1", "d1", "m2", "d2", "m3", "d3", "m4", "k4", "d4", "m5", "k5", "d5", "m6"],
    social: true,
    backup: true,
    finale: [],
    replay: null,
  };
  const named = applyStory(story, solved, false, { finale: "access", pick: "helix-svc" });
  assert.equal("error" in named, true);
  if ("error" in named) assert.equal(named.error.includes("KADE") || named.error.includes("helix-svc"), false);
  const wrong = applyStory(story, solved, false, { finale: "access", pick: "vale", clues: ["export", "route"] });
  assert.equal("error" in wrong, true);
  if ("error" in wrong) assert.equal(wrong.error.includes("KADE"), false);
  const right = applyStory(story, solved, false, { finale: "access", pick: "helix-svc", clues: ["vault", "export"] });
  if (!("story" in right)) throw new Error("access");
  const revoked = applyStory(right.story, solved, false, { finale: "revoke" });
  if (!("story" in revoked)) throw new Error("revoke");
  const openLink = applyStory({ ...revoked.story, finale: [...revoked.story.finale] }, [...solved, "ch6-seals"], false, { finale: "backup-check", checks: ["revoked", "route", "kluis", "files", "share-open"] });
  assert.equal("error" in openLink, true);
  const checked = applyStory(revoked.story, [...solved, "ch6-seals"], false, { finale: "backup-check", checks: ["revoked", "route", "kluis", "files", "share-closed"] });
  if (!("story" in checked)) throw new Error("check");
  assert.equal(checked.story.finale.includes("backup-check"), true);
  const hint = hintText("ch6-shutdown", 3).join(" ");
  assert.equal(hint.includes("N74192") || hint.includes("DOCK-244") || hint.includes("helix-svc"), false);
  assert.equal(demoBeat("finale"), "m6");
});

test("de finalekaart noemt het juiste account niet vooraf de hacker", () => {
  const card = finaleSessions.find((item) => item.id === "helix-svc");
  const text = `${card?.title ?? ""} ${card?.where ?? ""} ${card?.note ?? ""}`.toLowerCase();
  assert.equal(text.includes("hacker"), false);
  assert.equal(text.includes("deur van kade"), false);
  assert.equal(text.includes("kade"), false);
});

test("na drie hints blijft er één doorgangshint over, zonder nieuwe code", () => {
  for (const id of PUZZLE_IDS) {
    assert.equal(hintText(id, 4).length, 3, id);
    const extra = rescueHint(id);
    assert.equal(typeof extra, "string", id);
    assert.equal((extra ?? "").length > 20, true, id);
  }
  assert.equal(rescueHint("ch6-shutdown")?.includes("HX-19"), false);
  assert.equal(rescueHint("ch6-seals")?.includes("SEAL"), false);
  assert.equal(rescueHint("ch4-decode")?.includes("HX-19"), false);
  assert.equal(rescueHint("ch4-sequence")?.includes("22"), false);
});

test("hintniveau 1 geeft het antwoord nog niet", () => {
  assert.equal(hintText("ch1-ports", 1).join(" ").includes("Nexora Day"), false);
  const bayHint = hintText("ch1-bays", 1).join(" ");
  assert.equal(bayHint.includes("Mara"), false);
  assert.equal(bayHint.includes("Berg"), false);
  assert.equal(bayHint.includes("Ardennen"), false);
  assert.equal(hintText("ch6-seals", 1).join(" ").includes("SEAL"), false);
});

test("demo is in productie dicht voor spelers", () => {
  const env = process.env as Record<string, string | undefined>;
  const previousNode = env.NODE_ENV;
  const previousDemo = env.DEMO_TOOLS;
  env.NODE_ENV = "production";
  env.DEMO_TOOLS = "true";
  assert.equal(demoBlocked(false), true);
  assert.equal(demoBlocked(true), false);
  delete env.DEMO_TOOLS;
  assert.equal(demoBlocked(true), true);
  env.NODE_ENV = "development";
  assert.equal(demoBlocked(false), false);
  if (previousNode === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = previousNode;
  if (previousDemo === undefined) delete env.DEMO_TOOLS;
  else env.DEMO_TOOLS = previousDemo;
});

test("standaardmodus blijft escape room", () => {
  assert.equal(parseMode(undefined), "escape");
  assert.equal(parseMode("anders"), "escape");
  assert.equal(parseMode("awareness"), "awareness");
  assert.equal(parseMode("nis2"), "nis2");
});

test("de proloog start de crisis-klok niet", () => {
  const marked = markPrologue({ awareness: emptyAwareness(), breachOffsetSec: null }, "ghost");
  assert.equal(marked.breachOffsetSec, null);
  assert.deepEqual(marked.awareness.prologue, ["ghost"]);
  const skipped = markPrologue(marked, "skip");
  assert.equal(skipped.breachOffsetSec, null);
  assert.equal(prologueComplete(skipped.awareness), true);
  const office = team({ breachOffsetSec: null, awareness: skipped.awareness });
  assert.equal(teamRemainingSec(session, office, 1_000_000 + 180_000), 3600);
});

test("keuzes worden server-side beoordeeld zonder dubbele score", () => {
  assert.equal(pendingStoryDecision("escape", ["d2"], emptyAwareness()), null);
  assert.equal(pendingStoryDecision("awareness", ["d2"], emptyAwareness()), "escalate");
  const wrong = gradeDecision("escalate", "notify");
  assert.ok(wrong);
  assert.equal(wrong.correct, false);
  assert.equal(wrong.accepted, false);
  const right = gradeDecision("escalate", "escalate");
  assert.ok(right && right.correct);
  const first = recordDecision(emptyAwareness(), wrong);
  const second = recordDecision(first.state, wrong);
  assert.equal(second.state.decisions.length, 1);
  assert.equal(second.state.decisions[0].attempts, 2);
  const third = recordDecision(second.state, right);
  assert.equal(third.state.decisions[0].correct, true);
  const again = recordDecision(third.state, wrong);
  assert.equal(again.unchanged, true);
  assert.equal(again.state.decisions[0].attempts, third.state.decisions[0].attempts);
  const priority = gradeDecision("priority", "event");
  assert.ok(priority && priority.accepted && !priority.correct);
  const preferred = gradeDecision("priority", "backup");
  assert.ok(preferred && preferred.correct);
  const supplier = gradeDecision("supplier", "restrict,verify");
  assert.ok(supplier && !supplier.correct);
  const supplierOk = gradeDecision("supplier", "inform,restrict,recheck,verify");
  assert.ok(supplierOk && supplierOk.correct);
  const plain = scoreBreakdown(session, team({ solved: ["ch1-bays"] }), 1_000_000);
  const withChoice = scoreBreakdown(session, team({ solved: ["ch1-bays"], awareness: recordDecision(third.state, preferred).state }), 1_000_000);
  assert.equal(plain.total, withChoice.total);
});

test("awareness eenvoudig is een eigen variant en laat de andere modi met rust", () => {
  assert.equal(parseMode("eenvoudig"), "eenvoudig");
  assert.equal(parseMode("awareness"), "awareness");
  assert.equal(parseMode("nis2"), "nis2");
  assert.equal(parseMode("iets-anders"), "escape");
  assert.equal(includesTraining("eenvoudig"), true);
  assert.equal(includesTraining("escape"), false);
  assert.equal(includesTraining("awareness"), true);
});

test("de NIS2-evaluatie wordt per situatie beoordeeld", () => {
  for (const [id, choice] of [
    ["invoice", "verify"],
    ["public-doc", "limit"],
    ["login", "report"],
    ["colleague", "procedure"],
    ["outage", "procedure"],
  ] as const) {
    const graded = gradeEval(id, choice);
    assert.ok(graded && graded.correct);
  }
  const missed = gradeEval("invoice", "pay");
  assert.ok(missed && !missed.accepted);
  const once = recordEval(emptyAwareness(), gradeEval("login", "report")!);
  const twice = recordEval(once.state, gradeEval("login", "ignore")!);
  assert.equal(twice.unchanged, true);
  const report = trainingReport({
    team: "Team 1",
    date: "14-10-2026",
    mode: "nis2",
    chaptersDone: 6,
    hintCount: 2,
    awareness: once.state,
  });
  assert.match(report, /Cybersecurity-awareness-training met NIS2-gerelateerde leerdoelen/);
  assert.equal(report.includes("NIS2-compliant"), false);
  assert.match(report, /geen certificaat/);
  assert.match(report, /juridische verificatie/i);
});

test("een branche maakt het doelwit herkenbaar en laat de antwoorden staan", () => {
  const ministry = asSector("ministeries", "Bij Nexora Technologies loopt de voorbereiding op Nexora Day. De lijn moet bij Nexora beginnen.");
  assert.match(ministry, /Ministerie van Verbindingen/);
  assert.match(ministry, /Departementsdag/);
  assert.match(ministry, /bij het ministerie beginnen/);
  assert.equal(ministry.includes("Nexora"), false);
  const city = asSector("gemeenten", "Gemeente? Nexora Technologies en Nexora Day.");
  assert.match(city, /Gemeente Havenstad/);
  assert.match(city, /Gemeentedag/);
  const clues = asSector("ministeries", "helix-svc DOCK-244 ROUTE-7 SEAL HX-19 kluis-nacht");
  assert.equal(clues, "helix-svc DOCK-244 ROUTE-7 SEAL HX-19 kluis-nacht");
  assert.equal(asSector("general", "Nexora Day"), "Nexora Day");
});

test("de meting telt niet mee in de score en oude sessies blijven leesbaar", () => {
  const old = parseAwareness({ prologue: ["brief"], decisions: [], evals: [] });
  assert.deepEqual(old.pulse, { before: {}, after: {} });
  const answers = { mail: "check", public: "hold", supplier: "known", backup: "procedure" };
  const saved = recordPulse(emptyAwareness(), "before", answers);
  assert.equal("error" in saved, false);
  if ("error" in saved) return;
  const again = recordPulse(saved.state, "before", { ...answers, mail: "open" });
  assert.equal("error" in again, false);
  if ("error" in again) return;
  assert.equal(again.unchanged, true);
  assert.equal(again.state.pulse.before.mail, "check");
  const partial = recordPulse(emptyAwareness(), "after", { mail: "check" });
  assert.equal("error" in partial, true);
  const report = trainingReport({ team: "A", date: "20-10-2026", mode: "awareness", chaptersDone: 1, hintCount: 0, awareness: saved.state });
  assert.match(report, /Voorkeursactie bij de start: 4 van 4/);
  assert.equal(report.includes("certificaat"), true);
  const scored = scoreBreakdown(session, team({ awareness: saved.state, solved: ["ch1-bays"] }), 1_000_000);
  const bare = scoreBreakdown(session, team({ solved: ["ch1-bays"] }), 1_000_000);
  assert.equal(scored.total, bare.total);
  assert.equal(mediaFile("kade-voice"), null);
  assert.equal(mediaFile("mara-intro"), "/mara-intro.mp4");
});

test("een tablet die nadenkt blijft online en een stille tablet wordt offline", () => {
  const now = 1_000_000;
  assert.equal(presenceOf(now - 5_000, now), "online");
  assert.equal(presenceOf(now - 30_000, now), "unstable");
  assert.equal(presenceOf(now - 60_000, now), "offline");
  assert.equal(presenceOf(null, now), "offline");
  assert.equal(thinking("online", "playing", 180), true);
  assert.equal(thinking("offline", "playing", 180), false);
  assert.equal(thinking("online", "playing", 30), false);
  assert.equal(Math.round(musicLevel(40, true) * 1000) / 1000, 0.088);
  assert.equal(musicLevel(40, false), 0.4);
  assert.equal(sceneVoice("m1:0"), null);
  assert.equal(mediaFile("bed-crisis"), null);
  assert.equal(mediaFile("kade-voice"), null);
});

test("de verteller houdt een zin lang genoeg aan om hem rustig uit te spreken", () => {
  const short = narrateHoldMs("Jullie zijn het beveiligingsteam.");
  const long = narrateHoldMs("Jullie opdracht is om de aanval te reconstrueren, de toegang van KADE te blokkeren en de systemen te herstellen.");
  assert.ok(short >= 4000);
  assert.ok(long > short + 2500);
});
