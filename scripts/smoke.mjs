const base = process.env.BASE ?? "http://127.0.0.1:3456";
let cookie = "";

async function api(path, options = {}) {
  const response = await fetch(base + path, {
    ...options,
    headers: {
      "content-type": "application/json",
      cookie,
      ...(options.headers ?? {}),
    },
  });
  const nextCookie = response.headers.get("set-cookie");
  if (nextCookie) cookie = nextCookie.split(";")[0];
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { status: response.status, data };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const archive = {
  pins: [
    { id: "mara-lead", claim: "who" },
    { id: "dock-shot", claim: "where" },
    { id: "helix-floor", claim: "vendor" },
    { id: "adler-table", claim: "leak" },
    { id: "helix-card", claim: "trust" },
    { id: "berg-vrij", claim: "public" },
  ],
};

const steps = [
  ["ch1-bays", archive],
  ["ch1-login", { spots: ["badge", "plan", "sign", "lanyard"] }],
  ["ch1-nodes", { links: { lead: "mara", place: "dok", vendor: "helix", leak: "adler", trust: "listing" } }],
  ["ch1-ports", { event: "nexora-day", name: "helix", step: "impersonate" }],
  ["ch2-acrostic", { mail: "phish", evidence: ["contract", "header"] }],
  ["ch2-meta", { marks: ["author", "dock-row"] }],
  ["ch2-timeline", { order: ["phish", "dock", "export"] }],
  ["ch2-trace", { job: "DOCK-244", supports: ["export-log", "attachment"] }],
  ["ch3-logic", { session: "helix-svc", clues: ["hours", "vault"] }],
  ["ch3-path", { path: ["CRU", "EDGE", "DNS", "AUTH", "VAULT"] }],
  ["ch3-boot", { actions: ["isolate-session", "keep-log", "hold-edge"] }],
  ["ch3-cables", { DNS: "53", AUTH: "443", LOG: "514", TRAP: "PARK", order: ["DNS", "AUTH", "VAULT"] }],
  ["ch4-symbols", { files: ["planning", "contract", "staff", "finance", "agenda"] }],
  ["ch4-sequence", { value: 22 }],
  ["ch4-rotor", { word: "SEAL", shape: "square" }],
  ["ch4-backup", { id: "kluis-nacht" }],
  ["ch4-decode", { code: "HX-19" }],
  ["ch5-camera", { frames: ["cafe-0236", "dock-0231", "entry-0248", "gate-0229"] }],
  ["ch5-places", { places: { vale: "kantine", crew: "dok", okonkwo: "rek", crowe: "kantoor" }, badge: "apart" }],
  ["ch5-share", { setting: "19:04", opened: "19:06", message: "19:05" }],
  ["ch5-accuse", { person: "adler", document: "planning", cause: "open-link", intent: "unintended", evidence: ["share-log", "chat-link", "external-open"] }],
  ["ch6-seals", { perimeter: "SEAL", trace: "DOCK-244", lockout: "HX-19" }],
  ["ch6-shutdown", { order: ["N74192", "DOCK-244", "ROUTE-7", "HX-19"] }],
];

const health = await api("/api/health");
assert(health.status === 200 && health.data.ok === true, "health");

const adminClosed = await api("/api/sessions");
assert(adminClosed.status === 401, "players cannot open admin");

const demo = await api("/api/demo", { method: "POST", body: JSON.stringify({ at: "m1" }) });
assert(demo.status === 404, "demo hidden from players");

const wrongPassword = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password: "niet-het-wachtwoord" }) });
assert(wrongPassword.status === 401, "wrong password");
assert(!JSON.stringify(wrongPassword.data).toLowerCase().includes("flitz-admin"), "wrong password leaks no password");

const login = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || "flitz-admin" }) });
assert(login.status === 200, "login");

const created = await api("/api/sessions", {
  method: "POST",
  body: JSON.stringify({
    name: "Smoke",
    durationMin: 45,
    hintPenalty: true,
    hintPenaltySec: 30,
    teams: ["Noord", "Zuid"],
  }),
});
assert(created.status === 200, "create");
const sessionId = created.data.session.id;
const [north, south] = created.data.teams;

const early = await api(`/api/play/${north.code}/solve`, {
  method: "POST",
  body: JSON.stringify({ puzzleId: "ch1-bays", payload: { code: "N74192" } }),
});
assert(early.status === 400, "blocked before start");

const started = await api(`/api/sessions/${sessionId}/control`, { method: "POST", body: JSON.stringify({ action: "start" }) });
assert(started.status === 200, "start");

const beforeHack = await api(`/api/play/${north.code}`);
assert(beforeHack.data.phase === "office", "office before hack");
assert(beforeHack.data.session.running === false, "clock not armed");

const breach = await api(`/api/play/${north.code}/breach`, { method: "POST", body: JSON.stringify({ reported: true }) });
assert(breach.status === 200, "breach");
assert(breach.data.phase === "crisis", "crisis after breach");
assert(breach.data.team.phishReported === true, "phish reward flag");
assert(breach.data.team.score === 200, "phish score");
assert(breach.data.session.running === true, "clock armed");

const breachAgain = await api(`/api/play/${north.code}/breach`, { method: "POST", body: JSON.stringify({ reported: true }) });
assert(breachAgain.status === 200, "breach retry");
assert(breachAgain.data.session.remainingSec <= breach.data.session.remainingSec, "clock did not restart");
assert(breachAgain.data.team.score === 200, "phish score once");

async function story(body) {
  const result = await api(`/api/play/${north.code}/story`, { method: "POST", body: JSON.stringify(body) });
  assert(result.status === 200, `story ${JSON.stringify(body)} -> ${result.status} ${result.data?.error ?? ""}`);
}
await story({ scene: "incident" });
const pendingMission = await api(`/api/play/${north.code}`);
assert(pendingMission.data.story.scenes.includes("m1") === false, "mission 1 speech still pending");
await story({ scene: "m1" });

const wrong = await api(`/api/play/${north.code}/solve`, {
  method: "POST",
  body: JSON.stringify({ puzzleId: "ch1-bays", payload: { pins: [{ id: "coffee-post", claim: "who" }] } }),
});
assert(wrong.status === 422, "wrong answer");
assert(wrong.data.snapshot.team.fails === 1, "fail counted");

const hint = await api(`/api/play/${north.code}/hint`, {
  method: "POST",
  body: JSON.stringify({ puzzleId: "ch1-bays", level: 1 }),
});
assert(hint.status === 200, "hint");
assert(hint.data.puzzles.find((puzzle) => puzzle.id === "ch1-bays").hints.length === 1, "hint text");
assert(hint.data.team.penaltySec === 30, "penalty");
const hintRetry = await api(`/api/play/${north.code}/hint`, {
  method: "POST",
  body: JSON.stringify({ puzzleId: "ch1-bays", level: 1 }),
});
assert(hintRetry.status === 200, "hint retry");
assert(hintRetry.data.team.penaltySec === 30, "hint retry keeps one penalty");

const locked = await api(`/api/play/${north.code}/solve`, {
  method: "POST",
  body: JSON.stringify({ puzzleId: "ch2-acrostic", payload: { word: "DOCK" } }),
});
assert(locked.status === 400, "chapter locked");

const prelude = {
  "ch2-acrostic": [{ scene: "k1" }, { scene: "d1" }, { scene: "m2" }],
  "ch2-meta": [{ scene: "k2a" }],
  "ch3-logic": [{ scene: "k2" }, { scene: "d2" }, { scene: "m3" }],
  "ch3-boot": [{ scene: "k3a" }],
  "ch4-symbols": [{ scene: "k3" }, { scene: "d3" }, { scene: "m4" }],
  "ch5-camera": [{ scene: "k4" }, { scene: "d4" }, { scene: "m5" }],
  "ch6-seals": [{ scene: "k5" }, { scene: "d5" }, { scene: "m6" }, { finale: "access", pick: "helix-svc", clues: ["vault", "export"] }, { finale: "revoke" }],
  "ch6-shutdown": [{ finale: "backup-check", checks: ["revoked", "route", "kluis", "files", "share-closed"] }],
};

for (const [puzzleId, payload] of steps) {
  for (const body of prelude[puzzleId] ?? []) await story(body);
  const result = await api(`/api/play/${north.code}/solve`, {
    method: "POST",
    body: JSON.stringify({ puzzleId, payload }),
  });
  assert(result.status === 200, `${puzzleId} -> ${result.status} ${result.data?.error ?? ""}`);
}

const done = await api(`/api/play/${north.code}`);
assert(done.data.finished.outcome === "completed", "completed");
assert(done.data.progress.solved === 23, "all puzzles");
assert(done.data.inventory.map((token) => token.id).join(",") === "N74192,DOCK-244,ROUTE-7,SEAL,HX-19,INSIDER:ADLER", "tokens");
assert(done.data.team.rank === 1, "rank");

const other = await api(`/api/play/${south.code}`);
assert(other.data.team.status === "playing", "other team still playing");
assert(other.data.progress.solved === 0, "other team isolated");

const paused = await api(`/api/sessions/${sessionId}/control`, { method: "POST", body: JSON.stringify({ action: "pause" }) });
assert(paused.status === 200, "pause");
const duringPause = await api(`/api/play/${south.code}/solve`, {
  method: "POST",
  body: JSON.stringify({ puzzleId: "ch1-bays", payload: { code: "N74192" } }),
});
assert(duringPause.status === 400, "paused blocks");

const board = await api(`/api/sessions/${sessionId}`);
assert(board.data.teams.length === 2, "board");
assert(board.data.teams.some((team) => team.status === "completed"), "admin sees completion");

console.log("smoke ok", done.data.team.score, done.data.finished.title);
