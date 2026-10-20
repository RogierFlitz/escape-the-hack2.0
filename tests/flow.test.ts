import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { adminConfigError, checkPassword, clearLoginFailures, loginClientKey, loginLimited, noteLoginFailure, requestIsHttps, resetLoginLimits, usingDefaultPassword } from "../lib/admin-gate";
import { makeCode } from "../lib/codes";
import { guardPlay, resetPlayGuards, unknownCode } from "../lib/play-guard";
import { includesTraining, prologueComplete, trainingReport } from "../lib/game/awareness";
import { grade } from "../lib/game/grade";
import { emptyStory, nextBeat } from "../lib/game/story";
import { scoreBreakdown } from "../lib/scoring";
import type { PlaySnapshot } from "../lib/types";

const dir = mkdtempSync(path.join(os.tmpdir(), "eth-phase8-"));
process.env.SQLITE_PATH = path.join(dir, "game.sqlite");
process.env.DATABASE_URL = "";

type Actions = typeof import("../lib/game/actions");
type Store = typeof import("../lib/db/store");
type Snapshot = typeof import("../lib/game/snapshot");

let actions: Actions;
let store: Store;
let snapshot: Snapshot;

async function load() {
  if (actions) return;
  actions = await import("../lib/game/actions");
  store = await import("../lib/db/store");
  snapshot = await import("../lib/game/snapshot");
}

const PAYLOADS: Record<string, unknown> = {
  "ch1-bays": {
    pins: [
      { id: "mara-lead", claim: "who" },
      { id: "dock-shot", claim: "where" },
      { id: "helix-floor", claim: "vendor" },
      { id: "adler-table", claim: "leak" },
      { id: "helix-card", claim: "trust" },
      { id: "berg-vrij", claim: "public" },
    ],
  },
  "ch1-login": { spots: ["lanyard", "badge", "sign", "plan"] },
  "ch1-nodes": { links: { lead: "mara", place: "dok", vendor: "helix", leak: "adler", trust: "listing" } },
  "ch1-ports": { event: "nexora-day", name: "helix", step: "impersonate" },
  "ch2-acrostic": { mail: "phish", evidence: ["contract", "header"] },
  "ch2-meta": { marks: ["author", "dock-row"] },
  "ch2-timeline": { order: ["phish", "dock", "export"] },
  "ch2-trace": { job: "DOCK-244", supports: ["export-log", "attachment"] },
  "ch3-logic": { session: "helix-svc", clues: ["hours", "vault"] },
  "ch3-path": { path: ["CRU", "EDGE", "DNS", "AUTH", "VAULT"] },
  "ch3-boot": { actions: ["isolate-session", "keep-log", "hold-edge"] },
  "ch3-cables": { DNS: "53", AUTH: "443", LOG: "514", TRAP: "PARK", order: ["DNS", "AUTH", "VAULT"] },
  "ch4-symbols": { files: ["planning", "contract", "staff", "finance", "agenda"] },
  "ch4-sequence": { value: 22 },
  "ch4-rotor": { word: "SEAL", shape: "square" },
  "ch4-backup": { id: "kluis-nacht" },
  "ch4-decode": { code: "HX-19" },
  "ch5-camera": { frames: ["cafe-0236", "dock-0231", "entry-0248", "gate-0229"] },
  "ch5-places": { places: { vale: "kantine", crew: "dok", okonkwo: "rek", crowe: "kantoor" }, badge: "apart" },
  "ch5-share": { setting: "19:04", opened: "19:06", message: "19:05" },
  "ch5-accuse": { person: "adler", document: "planning", cause: "open-link", intent: "unintended", evidence: ["share-log", "chat-link", "external-open"] },
  "ch6-seals": { perimeter: "SEAL", trace: "DOCK-244", lockout: "HX-19" },
  "ch6-shutdown": { order: ["N74192", "DOCK-244", "ROUTE-7", "HX-19"] },
};

for (const [id, payload] of Object.entries(PAYLOADS)) {
  assert.equal(grade(id, payload).ok, true, id);
}

async function snap(code: string) {
  const found = await snapshot.playSnapshot(code);
  if (!found) throw new Error(`geen snapshot voor ${code}`);
  return found;
}

function solvedIds(current: PlaySnapshot) {
  return current.puzzles.filter((puzzle) => puzzle.solved).map((puzzle) => puzzle.id);
}

async function openSession(name: string, teams: string[], mode: "escape" | "awareness" | "nis2") {
  const created = await actions.createSession({
    name,
    durationSec: 3600,
    hintPenalty: true,
    hintPenaltySec: 30,
    teamNames: teams,
    mode,
  });
  return created;
}

async function stepStory(code: string, mode: "escape" | "awareness" | "nis2") {
  for (let guard = 0; guard < 80; guard += 1) {
    const current = await snap(code);
    if (current.finished) return current;
    const beat = nextBeat(current.story ?? emptyStory(), solvedIds(current), current.team.phishReported);
    if (beat.kind === "puzzle" || beat.kind === "finale" || beat.kind === "done") return current;
    if (beat.kind === "backup") {
      const result = await actions.saveStory(code, { backup: "kluis-nacht" });
      if ("error" in result) throw new Error(result.error);
      continue;
    }
    if (beat.kind === "social") {
      const result = await actions.saveStory(code, { social: ["wie", "feest", "leverancier", "dok", "samen"] });
      if ("error" in result) throw new Error(result.error);
      continue;
    }
    if (beat.kind === "transmission" || beat.kind === "discovery") {
      if (includesTraining(mode) && beat.id === "m3") {
        const wrong = await actions.saveDecision(code, "escalate", "wait");
        if ("error" in wrong) throw new Error(wrong.error);
        const before = await snap(code);
        assert.equal(before.story.scenes.includes("m3"), false);
        assert.equal(before.awareness.decisions.find((item) => item.id === "escalate")?.correct, false);
        const right = await actions.saveDecision(code, "escalate", "escalate");
        if ("error" in right) throw new Error(right.error);
      }
      if (includesTraining(mode) && beat.id === "m4") {
        const right = await actions.saveDecision(code, "supplier", "inform,restrict,recheck,verify");
        if ("error" in right) throw new Error(right.error);
      }
      const result = await actions.saveStory(code, { scene: beat.id });
      if ("error" in result) throw new Error(`${beat.id}: ${result.error}`);
      const marked = await snap(code);
      assert.equal(marked.story.scenes.filter((scene) => scene === beat.id).length, 1);
      continue;
    }
    throw new Error("onverwachte beat");
  }
  throw new Error("het verhaal liep vast");
}

async function playFinale(code: string, step: "access" | "revoke" | "backup-check") {
  if (step === "access") {
    const wrongSession = await actions.saveStory(code, { finale: "access", pick: "vale", clues: ["export", "route"] });
    assert.equal("error" in wrongSession, true);
    const thin = await actions.saveStory(code, { finale: "access", pick: "helix-svc", clues: ["vault"] });
    assert.equal("error" in thin, true);
    const right = await actions.saveStory(code, { finale: "access", pick: "helix-svc", clues: ["vault", "export"] });
    assert.equal("error" in right, false);
    const after = await snap(code);
    assert.equal(after.story.finale.includes("access"), true);
    assert.equal(after.story.finale.includes("revoke"), false);
    return;
  }
  if (step === "revoke") {
    const result = await actions.saveStory(code, { finale: "revoke" });
    assert.equal("error" in result, false);
    return;
  }
  const openLink = await actions.saveStory(code, {
    finale: "backup-check",
    checks: ["revoked", "route", "kluis", "files", "share-open"],
  });
  assert.equal("error" in openLink, true);
  const stillOpen = await snap(code);
  assert.equal(stillOpen.story.finale.includes("backup-check"), false);
  const closed = await actions.saveStory(code, {
    finale: "backup-check",
    checks: ["revoked", "route", "kluis", "files", "share-closed"],
  });
  assert.equal("error" in closed, false);
}

async function playThrough(code: string, mode: "escape" | "awareness" | "nis2") {
  for (let guard = 0; guard < 80; guard += 1) {
    const current = await stepStory(code, mode);
    if (current.finished) return current;
    const beat = nextBeat(current.story ?? emptyStory(), solvedIds(current), current.team.phishReported);
    if (beat.kind === "done") return await snap(code);
    if (beat.kind === "finale") {
      await playFinale(code, beat.step);
      continue;
    }
    if (beat.kind !== "puzzle") throw new Error(`verwacht een puzzel, kreeg ${beat.kind}`);
    if (includesTraining(mode) && beat.puzzleId.startsWith("ch4-") && !current.awareness.decisions.some((item) => item.id === "priority")) {
      const choice = await actions.saveDecision(code, "priority", "backup");
      if ("error" in choice) throw new Error(choice.error);
    }
    const wrong = await actions.solve(code, beat.puzzleId, beat.puzzleId === "ch6-shutdown" ? { order: ["HX-19", "ROUTE-7", "DOCK-244", "N74192"] } : {});
    assert.equal("mismatch" in wrong && wrong.mismatch, true, beat.puzzleId);
    const stuck = await snap(code);
    assert.equal(stuck.puzzles.find((puzzle) => puzzle.id === beat.puzzleId)?.solved, false);
    if (beat.puzzleId === "ch1-bays") {
      const first = await actions.takeHint(code, beat.puzzleId, 1);
      assert.equal("error" in first, false);
      const retry = await actions.takeHint(code, beat.puzzleId, 1);
      assert.equal("error" in retry, false);
      const hinted = await snap(code);
      assert.equal(hinted.team.penaltySec, 30);
      assert.equal(hinted.puzzles.find((puzzle) => puzzle.id === "ch1-bays")?.hintLevel, 1);
    }
    const solved = await actions.solve(code, beat.puzzleId, PAYLOADS[beat.puzzleId]);
    if ("error" in solved) throw new Error(`${beat.puzzleId}: ${solved.error}`);
    assert.equal(Boolean(solved.mismatch), false);
    const once = await snap(code);
    const duplicate = await actions.solve(code, beat.puzzleId, PAYLOADS[beat.puzzleId]);
    assert.equal("error" in duplicate, false);
    const after = await snap(code);
    assert.equal(after.puzzles.filter((puzzle) => puzzle.id === beat.puzzleId && puzzle.solved).length, 1);
    assert.equal(after.progress.solved, once.progress.solved);
    assert.equal(after.team.score, once.team.score);
  }
  throw new Error("het spel liep niet tot het einde");
}

test("productie weigert beheer zonder wachtwoord en beperkt pogingen", () => {
  const env = process.env as Record<string, string | undefined>;
  const previousNode = env.NODE_ENV;
  const previousPassword = env.ADMIN_PASSWORD;
  resetLoginLimits();
  env.NODE_ENV = "production";
  delete env.ADMIN_PASSWORD;
  const problem = adminConfigError();
  assert.ok(problem);
  assert.equal(problem.includes("flitz-admin"), false);
  assert.equal(checkPassword("flitz-admin"), false);
  assert.equal(usingDefaultPassword(), false);
  env.ADMIN_PASSWORD = "fase8-test-geheim";
  assert.equal(adminConfigError(), null);
  assert.equal(checkPassword("fase8-test-geheim"), true);
  assert.equal(checkPassword("flitz-admin"), false);
  env.NODE_ENV = "development";
  delete env.ADMIN_PASSWORD;
  assert.equal(usingDefaultPassword(), true);
  assert.equal(checkPassword("flitz-admin"), true);
  assert.equal(requestIsHttps({ url: "http://10.0.0.8:3000/api/admin/login", headers: { get: () => null } }), false);
  assert.equal(requestIsHttps({ url: "http://10.0.0.8:3000/api/admin/login", headers: { get: (name) => (name === "x-forwarded-proto" ? "https" : null) } }), true);
  const previousTrust = env.TRUST_PROXY;
  delete env.TRUST_PROXY;
  assert.equal(loginClientKey({ headers: { get: (name) => (name === "x-forwarded-for" ? "203.0.113.8" : null) } }), "local");
  env.TRUST_PROXY = "true";
  assert.equal(loginClientKey({ headers: { get: (name) => (name === "x-forwarded-for" ? "203.0.113.8, 10.0.0.1" : null) } }), "203.0.113.8");
  if (previousTrust === undefined) delete env.TRUST_PROXY;
  else env.TRUST_PROXY = previousTrust;
  resetLoginLimits();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    assert.equal(noteLoginFailure("tablet").limited, false);
  }
  assert.equal(loginLimited("tablet").limited, true);
  assert.equal(noteLoginFailure("andere-tablet").limited, false);
  clearLoginFailures("tablet");
  assert.equal(loginLimited("tablet").limited, false);
  if (previousNode === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = previousNode;
  if (previousPassword === undefined) delete env.ADMIN_PASSWORD;
  else env.ADMIN_PASSWORD = previousPassword;
});

test("teamcodes zijn lang en onbekende codes worden afgeremd", () => {
  const code = makeCode();
  assert.equal(code.length, 8);
  assert.match(code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
  const env = process.env as Record<string, string | undefined>;
  const previousNode = env.NODE_ENV;
  const previousDemo = env.DEMO_TOOLS;
  resetPlayGuards();
  env.NODE_ENV = "production";
  delete env.DEMO_TOOLS;
  assert.equal(guardPlay("DEMO", "read")?.status, 404);
  env.DEMO_TOOLS = "true";
  resetPlayGuards();
  assert.equal(guardPlay("DEMO", "read"), null);
  resetPlayGuards();
  for (let attempt = 0; attempt < 20; attempt += 1) assert.equal(unknownCode().status, 404);
  assert.equal(unknownCode().status, 429);
  if (previousNode === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = previousNode;
  if (previousDemo === undefined) delete env.DEMO_TOOLS;
  else env.DEMO_TOOLS = previousDemo;
  resetPlayGuards();
});

test("escape, awareness en NIS2 volgen hun eigen start en een volledige ronde", async () => {
  await load();
  const escape = await openSession("Escape", ["Ploeg Noord"], "escape");
  const escapeCode = escape.teams[0].code;
  const lobby = await snap(escapeCode);
  assert.equal(lobby.phase, "lobby");
  assert.equal(lobby.session.running, false);
  const tooSoon = await actions.solve(escapeCode, "ch1-bays", PAYLOADS["ch1-bays"]);
  assert.equal("error" in tooSoon, true);
  await actions.controlSession(escape.session.id, "start");
  const office = await snap(escapeCode);
  assert.equal(office.phase, "office");
  assert.equal(office.session.running, false);
  const noPrologue = await actions.savePrologue(escapeCode, "brief");
  assert.equal("error" in noPrologue, true);

  const awareness = await openSession("Awareness", ["Ploeg Oost"], "awareness");
  const awarenessCode = awareness.teams[0].code;
  await actions.controlSession(awareness.session.id, "start");
  const repeated = await actions.savePrologue(awarenessCode, "brief");
  assert.equal("error" in repeated, false);
  await actions.savePrologue(awarenessCode, "brief");
  const duringPrologue = await snap(awarenessCode);
  assert.equal(duringPrologue.phase, "office");
  assert.equal(duringPrologue.session.running, false);
  assert.equal(duringPrologue.awareness.prologue.filter((scene) => scene === "brief").length, 1);
  await actions.savePrologue(awarenessCode, "skip");
  const skipped = await snap(awarenessCode);
  assert.equal(prologueComplete(skipped.awareness), true);
  assert.equal(skipped.session.running, false);
  await actions.triggerBreach(awarenessCode, true);
  const clockOn = await snap(awarenessCode);
  assert.equal(clockOn.phase, "crisis");
  assert.equal(clockOn.session.running, true);
  assert.equal(clockOn.team.score, 200);
  const offset = (await store.getByCode(awarenessCode))?.team.breachOffsetSec;
  await actions.triggerBreach(awarenessCode, false);
  assert.equal((await store.getByCode(awarenessCode))?.team.breachOffsetSec, offset);
  assert.equal((await snap(awarenessCode)).team.phishReported, true);

  await actions.triggerBreach(escapeCode, true);
  const armed = await snap(escapeCode);
  assert.equal(armed.session.running, true);
  assert.equal(armed.team.score, 200);
  const escapeOffset = (await store.getByCode(escapeCode))?.team.breachOffsetSec;
  await actions.triggerBreach(escapeCode, true);
  assert.equal((await store.getByCode(escapeCode))?.team.breachOffsetSec, escapeOffset);
  await actions.saveStory(escapeCode, { scene: "incident" });
  await actions.saveStory(escapeCode, { scene: "incident" });
  const pendingMission = await snap(escapeCode);
  assert.equal(pendingMission.story.scenes.filter((scene) => scene === "incident").length, 1);
  assert.equal(pendingMission.story.scenes.includes("m1"), false);
  const missionSpeech = nextBeat(pendingMission.story, [], true);
  assert.equal(missionSpeech.kind, "transmission");
  if (missionSpeech.kind === "transmission") assert.equal(missionSpeech.id, "m1");

  const finishedEscape = await playThrough(escapeCode, "escape");
  assert.equal(finishedEscape.finished?.outcome, "completed");
  assert.equal(finishedEscape.finished?.title, "SYSTEM RESTORED");
  assert.equal(finishedEscape.progress.solved, 23);
  const escapeRow = await store.getByCode(escapeCode);
  if (!escapeRow) throw new Error("escape verdwenen");
  const escapeScore = scoreBreakdown(escapeRow.session, escapeRow.team, escapeRow.team.finishedAt ?? Date.now());
  assert.equal(finishedEscape.team.score, escapeScore.total);
  assert.equal(escapeScore.total, escapeScore.puzzlePoints + escapeScore.chapterBonus + escapeScore.timeBonus + escapeScore.completionBonus + 200);
  const escapeDecision = await actions.saveDecision(escapeCode, "escalate", "escalate");
  assert.equal("error" in escapeDecision, true);
  const escapeEval = await actions.saveEval(escapeCode, "login", "report");
  assert.equal("error" in escapeEval, true);
  assert.equal(finishedEscape.awareness.decisions.length, 0);
  assert.equal(finishedEscape.awareness.evals.length, 0);

  const nis = await openSession("NIS2", ["Ploeg West"], "nis2");
  const nisCode = nis.teams[0].code;
  await actions.controlSession(nis.session.id, "start");
  await actions.savePrologue(nisCode, "skip");
  const nisOffice = await snap(nisCode);
  assert.equal(nisOffice.session.running, false);
  assert.equal(nisOffice.phase, "office");
  const earlyEval = await actions.saveEval(nisCode, "invoice", "verify");
  assert.equal("error" in earlyEval, true);
  await actions.triggerBreach(nisCode, true);
  const finishedNis = await playThrough(nisCode, "nis2");
  assert.equal(finishedNis.finished?.outcome, "completed");
  assert.equal(finishedNis.progress.solved, 23);
  const decisions = ["escalate", "supplier", "priority"];
  for (const id of decisions) {
    assert.equal(finishedNis.awareness.decisions.find((item) => item.id === id)?.correct, true, id);
  }
  for (const [id, choice] of [
    ["invoice", "pay"],
    ["public-doc", "limit"],
    ["login", "report"],
    ["colleague", "procedure"],
    ["outage", "procedure"],
  ] as const) {
    if (id === "invoice") {
      const missed = await actions.saveEval(nisCode, id, choice);
      assert.equal("error" in missed, false);
      const open = await snap(nisCode);
      assert.equal(open.awareness.evals.find((item) => item.id === id)?.correct, false);
      const fixed = await actions.saveEval(nisCode, id, "verify");
      assert.equal("error" in fixed, false);
      continue;
    }
    const saved = await actions.saveEval(nisCode, id, choice);
    assert.equal("error" in saved, false);
  }
  const reported = await snap(nisCode);
  assert.equal(reported.awareness.evals.length, 5);
  assert.equal(reported.awareness.evals.every((item) => item.correct), true);
  const report = trainingReport({
    team: reported.team.name,
    date: "15-10-2026",
    mode: "nis2",
    chaptersDone: reported.progress.chaptersDone,
    hintCount: reported.team.hintCount,
    awareness: reported.awareness,
  });
  assert.match(report, /Ploeg West/);
  assert.match(report, /geen certificaat/);
  assert.equal(report.includes("NIS2-compliant"), false);
  assert.equal(report.includes("fase8"), false);
});

test("tien teams houden een eigen klok, score, inventaris en hintstraf", async () => {
  await load();
  const names = Array.from({ length: 10 }, (_, index) => `Ploeg ${index + 1}`);
  const created = await openSession("Gelijktijdig", names, "escape");
  await actions.controlSession(created.session.id, "start");
  await Promise.all(created.teams.map(async (team) => {
    await actions.triggerBreach(team.code, false);
    await actions.saveStory(team.code, { scene: "incident" });
    await actions.saveStory(team.code, { scene: "m1" });
  }));
  const chain = ["ch1-bays", "ch1-login", "ch1-nodes", "ch1-ports"] as const;
  await Promise.all(created.teams.map(async (team, index) => {
    if (index === 2) {
      await actions.solve(team.code, "ch1-bays", { pins: [{ id: "coffee-post", claim: "who" }] });
      return;
    }
    if (index === 0) {
      for (const id of chain) await actions.solve(team.code, id, PAYLOADS[id]);
      await actions.solve(team.code, "ch1-ports", PAYLOADS["ch1-ports"]);
      return;
    }
    await actions.solve(team.code, "ch1-bays", PAYLOADS["ch1-bays"]);
  }));
  const hinted = created.teams[1];
  await Promise.all([
    actions.takeHint(hinted.code, "ch1-login", 1),
    actions.takeHint(hinted.code, "ch1-login", 1),
  ]);
  const rows = await Promise.all(created.teams.map(async (team) => snap(team.code)));
  const leader = rows[0];
  const penalized = rows[1];
  const mistaken = rows[2];
  const quiet = rows[3];
  assert.equal(leader.progress.solved, 4);
  assert.equal(leader.inventory.some((token) => token.id === "N74192"), true);
  assert.equal(leader.team.score, 550);
  assert.equal(penalized.progress.solved, 1);
  assert.equal(penalized.inventory.some((token) => token.id === "N74192"), false);
  assert.equal(penalized.team.penaltySec, 30);
  assert.equal(penalized.puzzles.find((puzzle) => puzzle.id === "ch1-login")?.hintLevel, 1);
  assert.equal(mistaken.progress.solved, 0);
  assert.equal(mistaken.team.fails, 1);
  assert.equal(mistaken.team.penaltySec, 0);
  assert.equal(quiet.progress.solved, 1);
  assert.equal(quiet.team.fails, 0);
  assert.equal(quiet.team.penaltySec, 0);
  assert.equal(quiet.inventory.length, 0);
  for (const row of rows) assert.equal(row.session.running, true);
  assert.ok(quiet.session.remainingSec - penalized.session.remainingSec >= 25);
  assert.ok(quiet.session.remainingSec - penalized.session.remainingSec <= 35);
  const again = await snap(created.teams[0].code);
  assert.equal(again.progress.solved, leader.progress.solved);
  assert.equal(again.team.score, leader.team.score);
  assert.equal(again.team.penaltySec, leader.team.penaltySec);
});

test("de demo start als NIS2 op de proloog en de klok wacht", async () => {
  await load();
  const opened = await actions.openDemo("origin");
  assert.equal("code" in opened, true);
  const view = await snap("DEMO");
  assert.equal(view.session.mode, "nis2");
  assert.equal(view.session.durationSec, 3600);
  assert.equal(view.phase, "office");
  assert.equal(view.session.running, false);
  assert.equal(view.awareness.prologue.length, 0);
  assert.equal(prologueComplete(view.awareness), false);
  assert.equal((await store.getByCode("DEMO"))?.team.breachOffsetSec, null);
  await actions.triggerBreach("DEMO", false);
  const clockOn = await snap("DEMO");
  assert.equal(clockOn.phase, "crisis");
  assert.equal(clockOn.session.running, true);
  const reset = await actions.openDemo("origin");
  assert.equal("code" in reset, true);
  const fresh = await snap("DEMO");
  assert.equal(fresh.session.mode, "nis2");
  assert.equal(fresh.phase, "office");
  assert.equal(fresh.session.running, false);
  assert.equal(fresh.awareness.prologue.length, 0);
  assert.equal(fresh.session.durationSec, 3600);
});

test("tijd toevoegen geldt per team, eenmaal, en herstart niemand", async () => {
  await load();
  const created = await openSession("Tijd", ["Noord", "Zuid"], "escape");
  const before = await store.getSession(created.session.id);
  assert.ok(before);
  const north = before.teams.find((item) => item.name === "Noord");
  const south = before.teams.find((item) => item.name === "Zuid");
  assert.ok(north && south);
  const draft = await actions.controlSession(created.session.id, "adjust", 60, { requestId: "tijd-draft-1", teamId: north.id });
  assert.equal("error" in draft, false);
  const stillDraft = await store.getSession(created.session.id);
  assert.equal(stillDraft?.session.status, "draft");
  assert.equal(stillDraft?.session.startedAt, null);
  assert.equal(stillDraft?.teams.find((item) => item.id === north.id)?.timeAdjustSec, 60);
  await actions.controlSession(created.session.id, "start");
  const started = await store.getSession(created.session.id);
  assert.ok(started);
  const liveNorth = started.teams.find((item) => item.id === north.id);
  const liveSouth = started.teams.find((item) => item.id === south.id);
  assert.ok(liveNorth && liveSouth);
  await store.saveTeam(liveSouth.updatedAt, { ...liveSouth, status: "failed", finishedAt: Date.now(), solved: ["ch1-bays"] });
  const once = await actions.controlSession(created.session.id, "adjust", 300, { requestId: "tijd-eenmalig", teamId: north.id });
  assert.equal("error" in once, false);
  if ("duplicate" in once) assert.equal(once.duplicate, false);
  const replay = await actions.controlSession(created.session.id, "adjust", 300, { requestId: "tijd-eenmalig", teamId: north.id });
  assert.equal("error" in replay, false);
  if ("duplicate" in replay) assert.equal(replay.duplicate, true);
  await actions.controlSession(created.session.id, "pause");
  const pausedGrant = await actions.controlSession(created.session.id, "adjust", 120, { requestId: "tijd-pauze-allen" });
  assert.equal("error" in pausedGrant, false);
  const after = await store.getSession(created.session.id);
  assert.equal(after?.session.status, "paused");
  assert.equal(after?.session.startedAt, started.session.startedAt);
  const doneNorth = after?.teams.find((item) => item.id === north.id);
  const doneSouth = after?.teams.find((item) => item.id === south.id);
  assert.equal(doneNorth?.timeAdjustSec, 480);
  assert.equal(doneNorth?.solved.length, 0);
  assert.equal(doneNorth?.status, "playing");
  assert.equal(doneSouth?.status, "failed");
  assert.equal(doneSouth?.timeAdjustSec, 0);
  assert.deepEqual(doneSouth?.solved, ["ch1-bays"]);
  const view = await snapshot.playSnapshot(north.code);
  assert.equal(view?.session.remainingSec, 3600 + 480);
});

test("een instructeurshint kost geen tijd en een eigen extra hint blijft apart", async () => {
  await load();
  const created = await openSession("Extra hints", ["Ploeg Hint"], "escape");
  const team = created.teams[0];
  const early = await actions.instructorHint(created.session.id, team.id, "ch1-bays");
  assert.equal("error" in early, true);
  await actions.controlSession(created.session.id, "start");
  const office = await actions.instructorHint(created.session.id, team.id, "ch1-bays");
  assert.equal("error" in office, true);
  await actions.triggerBreach(team.code, false);
  const before = await snap(team.code);
  const sent = await actions.instructorHint(created.session.id, team.id, "ch1-bays");
  assert.equal("error" in sent, false);
  assert.equal("hint" in sent && Boolean(sent.hint), true);
  const noted = await actions.coachTeam(created.session.id, team.id, "ch1-bays", "Kijk nog eens naar de eerste pin.");
  assert.equal("error" in noted, false);
  const again = await actions.coachTeam(created.session.id, team.id, "ch1-bays", "Kijk nog eens naar de eerste pin.");
  assert.equal("error" in again, false);
  if ("duplicate" in again) assert.equal(again.duplicate, true);
  const short = await actions.coachTeam(created.session.id, team.id, "ch1-bays", "ok");
  assert.equal("error" in short, true);
  const second = await actions.coachTeam(created.session.id, team.id, "ch1-bays", "Vergelijk de pin met de bron.");
  const third = await actions.coachTeam(created.session.id, team.id, "ch1-bays", "Eén pin hoort nog niet.");
  assert.equal("error" in second, false);
  assert.equal("error" in third, false);
  const fourth = await actions.coachTeam(created.session.id, team.id, "ch1-bays", "Meer dan drie extra hints mag niet.");
  assert.equal("error" in fourth, true);
  const after = await snap(team.code);
  const puzzle = after.puzzles.find((item) => item.id === "ch1-bays");
  assert.equal(puzzle?.hintLevel, 1);
  assert.deepEqual(puzzle?.coach, [
    "Kijk nog eens naar de eerste pin.",
    "Vergelijk de pin met de bron.",
    "Eén pin hoort nog niet.",
  ]);
  assert.equal(after.team.penaltySec, before.team.penaltySec);
  assert.equal(after.team.score, before.team.score);
  assert.equal(after.progress.solved, before.progress.solved);
  assert.equal(after.team.status, "playing");
  const desk = await snapshot.adminSnapshot(created.session.id);
  const open = desk?.teams[0]?.hintsOpen.find((item) => item.id === "ch1-bays");
  assert.equal(open?.level, 1);
  assert.equal(open?.next != null, true);
  assert.equal(open?.coach.length, 3);
  await actions.controlSession(created.session.id, "end");
  const closed = await actions.coachTeam(created.session.id, team.id, "ch1-bays", "Nog een zetje.");
  assert.equal("error" in closed, true);
});

test("een lopende sessie houdt bedrijfsnaam, starttijd en score bij een wijziging", async () => {
  await load();
  const created = await openSession("Bedrijfsuitje", ["Team 1"], "nis2");
  await actions.controlSession(created.session.id, "start");
  const started = await store.getSession(created.session.id);
  await actions.controlSession(created.session.id, "pause");
  const tuned = await actions.controlSession(created.session.id, "retune", 0, {
    name: "Bedrijfsuitje",
    client: "Gemeente Havenstad",
    eventDate: "2026-10-20",
    durationMin: 60,
    hintPenalty: true,
    hintPenaltySec: 30,
    mode: "nis2",
    sector: "gemeenten",
  });
  assert.equal("error" in tuned, false);
  const after = await store.getSession(created.session.id);
  assert.equal(after?.session.clientName, "Gemeente Havenstad");
  assert.equal(after?.session.eventDate, "2026-10-20");
  assert.equal(after?.session.name, "Bedrijfsuitje");
  assert.equal(after?.session.sector, "gemeenten");
  assert.equal(after?.session.mode, "nis2");
  assert.equal(after?.session.status, "paused");
  assert.equal(after?.session.startedAt, started?.session.startedAt);
  assert.equal(after?.teams[0]?.solved.length, 0);
  assert.equal(after?.teams[0]?.penaltySec, 0);
});

test("na drie hints kan een vastgelopen team nog één extra hint krijgen", async () => {
  await load();
  const created = await openSession("Doorgang", ["Ploeg Vast"], "escape");
  const team = created.teams[0];
  await actions.controlSession(created.session.id, "start");
  await actions.triggerBreach(team.code, false);
  const early = await actions.requestRescue(team.code, "ch1-bays");
  assert.equal("error" in early, true);
  for (let step = 0; step < 3; step += 1) {
    const sent = await actions.instructorHint(created.session.id, team.id, "ch1-bays");
    assert.equal("error" in sent, false);
  }
  const before = await snap(team.code);
  const rescue = await actions.requestRescue(team.code, "ch1-bays");
  assert.equal("error" in rescue, false);
  const again = await actions.requestRescue(team.code, "ch1-bays");
  assert.equal("duplicate" in again && again.duplicate, true);
  const after = await snap(team.code);
  const puzzle = after.puzzles.find((item) => item.id === "ch1-bays");
  assert.equal(puzzle?.hintLevel, 3);
  assert.equal((puzzle?.coach.length ?? 0) > 0, true);
  assert.equal(after.team.penaltySec, before.team.penaltySec);
  assert.equal(after.team.penaltySec, 0);
  assert.equal(after.team.score, before.team.score);
  assert.equal(after.progress.solved, 0);
  assert.equal(after.team.status, "playing");
});
