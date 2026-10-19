import assert from "node:assert/strict";
import test from "node:test";
import { emptyAwareness } from "../lib/game/awareness";
import { PUZZLE_IDS } from "../lib/game/content";
import { emptyStory } from "../lib/game/story";
import { outcomeOf, playerReport, resultsCsv, sessionReport } from "../lib/game/results";
import { scoreBreakdown } from "../lib/scoring";
import type { Session, Team } from "../lib/types";

const now = 1_000_000 + 20 * 60 * 1000;

const session: Session = {
  id: "s",
  name: "Bedrijf",
  durationSec: 3600,
  hintPenalty: true,
  hintPenaltySec: 30,
  mode: "escape",
  sector: "general",
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
    id: partial.id ?? "t",
    sessionId: "s",
    name: partial.name ?? "Team",
    code: partial.code ?? "TEST",
    status: "playing",
    solved: [],
    hints: {},
    instructorHints: {},
    inventory: [],
    eventsSeen: [],
    penaltySec: 0,
    fails: 0,
    finishedAt: null,
    updatedAt: 1,
    lastProgressAt: 1,
    breachOffsetSec: 30,
    phishReported: false,
    awareness: emptyAwareness(),
    story: emptyStory(),
    ...partial,
  };
}

test("geslaagd volgt de status, niet een scoregrens", () => {
  assert.equal(outcomeOf("completed"), "geslaagd");
  assert.equal(outcomeOf("failed"), "niet geslaagd");
  assert.equal(outcomeOf("playing"), "bezig");
  assert.equal(outcomeOf("ready"), "nog niet gestart");
  const rich = team({ name: "Hoog", status: "playing", solved: PUZZLE_IDS.slice(0, 10), phishReported: true });
  const done = team({ name: "Laag", code: "LAAG", status: "completed", solved: [...PUZZLE_IDS], finishedAt: now, phishReported: true });
  const report = sessionReport(session, [rich, done], now);
  assert.equal(report.teams.find((item) => item.name === "Hoog")?.outcome, "bezig");
  assert.equal(report.teams.find((item) => item.name === "Laag")?.outcome, "geslaagd");
  assert.equal(report.teams.find((item) => item.name === "Laag")?.score, scoreBreakdown(session, done, now).total);
});

test("gelijke scores volgen de teamnaam en blijven in deze sessie", () => {
  const solved = [...PUZZLE_IDS];
  const alpha = team({ id: "a", name: "Alpha", code: "AAAA", status: "completed", solved, finishedAt: now, phishReported: true });
  const beta = team({ id: "b", name: "Beta", code: "BBBB", status: "completed", solved, finishedAt: now, phishReported: true });
  const other = team({ id: "c", name: "Buiten", code: "ZZZZ", sessionId: "andere", status: "completed", solved, finishedAt: now, phishReported: true });
  const report = sessionReport(session, [beta, other, alpha], now);
  assert.deepEqual(report.leaderboard.map((row) => row.name), ["Alpha", "Beta"]);
  assert.equal(report.leaderboard[0].rank, 1);
  assert.equal(report.leaderboard[1].rank, 2);
  assert.equal(report.leaderboard[0].tiedScore, true);
  assert.equal(report.leaderboard[0].score, report.leaderboard[1].score);
  const view = playerReport(session, [beta, other, alpha], "AAAA", now);
  assert.equal(JSON.stringify(view).includes("ZZZZ"), false);
  assert.equal(JSON.stringify(view).includes("BBBB"), false);
});

test("twaalf teams, bezig en mislukt, zonder verzonnen missietijd", () => {
  const teams = Array.from({ length: 12 }, (_, index) => team({
    id: `t${index}`,
    name: `Ploeg ${String(index).padStart(2, "0")}`,
    code: `C${index}`,
    status: index === 0 ? "playing" : index === 1 ? "failed" : "completed",
    solved: index === 1 ? PUZZLE_IDS.slice(0, 3) : index === 0 ? PUZZLE_IDS.slice(0, 4) : [...PUZZLE_IDS],
    finishedAt: index === 0 ? null : now,
    phishReported: index !== 1,
    hints: index === 2 ? { "ch2-trace": 2 } : {},
    fails: index === 3 ? 4 : 0,
  }));
  const report = sessionReport(session, teams, now);
  assert.equal(report.leaderboard.length, 12);
  assert.equal(report.counts.playing, 1);
  assert.equal(report.counts.failed, 1);
  assert.equal(report.counts.passed, 10);
  assert.equal(report.participants, null);
  const failed = report.teams.find((item) => item.name === "Ploeg 01");
  assert.equal(failed?.missions[0].timeNote, "Tijd per missie wordt niet bewaard.");
  assert.equal(failed?.missions[0].state, "open gebleven");
  assert.equal(failed?.advice.length, 3);
  assert.equal(failed?.advice.every((item) => item.kind === "gemeten" || item.kind === "algemeen"), true);
  assert.equal(resultsCsv(report, false).includes("percentage"), false);
  assert.equal(resultsCsv(report, false).includes("C0"), false);
  assert.equal(resultsCsv(report, true).includes("C0"), true);
});

test("een foutloze afronding krijgt algemene aanbevelingen, een gemiste mail een gemeten punt", () => {
  const clean = team({ status: "completed", solved: [...PUZZLE_IDS], finishedAt: now, phishReported: true });
  const missed = team({ name: "Mis", code: "MIS", status: "completed", solved: [...PUZZLE_IDS], finishedAt: now, phishReported: false });
  const cleanReport = sessionReport(session, [clean], now).teams[0];
  const missedReport = sessionReport(session, [missed], now).teams[0];
  assert.equal(cleanReport.advice.length, 3);
  assert.equal(cleanReport.advice.every((item) => item.kind === "algemeen"), true);
  assert.equal(cleanReport.improvements.length, 0);
  assert.equal(missedReport.advice[0].kind, "gemeten");
  assert.equal(missedReport.advice[0].topic, "Phishing en social engineering");
  assert.equal(missedReport.missions.every((mission) => mission.state === "afgerond"), true);
});

test("NIS2 toont het voorbehoud en een vastgelegde foute evaluatie", () => {
  const nis2: Session = { ...session, mode: "nis2" };
  const row = team({
    status: "completed",
    solved: [...PUZZLE_IDS],
    finishedAt: now,
    phishReported: true,
    awareness: {
      ...emptyAwareness(),
      evals: [{ id: "invoice", choice: "pay", correct: false, attempts: 2 }],
    },
  });
  const report = sessionReport(nis2, [row], now);
  assert.match(report.disclaimer, /geen|niet aan/i);
  assert.ok(report.legalNote);
  assert.equal(report.teams[0].advice[0].kind, "gemeten");
  assert.match(report.teams[0].advice[0].trigger, /invoice/);
  const escape = sessionReport(session, [row], now);
  assert.equal(escape.legalNote, null);
});
