"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { emptyAwareness, gradeDecision, includesTraining, pendingStoryDecision, prologueComplete, trainingReport } from "@/lib/game/awareness";
import { dossier, emptyStory, failLines, missionTitle, nextBeat, noraNote, speech, winLines } from "@/lib/game/story";
import { savedOfficePieces } from "./Intranet";
import type { PlayFile, PlaySnapshot } from "@/lib/types";
import { playAlert, playClick, playFinale, playMessage, playOk, setSound, soundOn } from "./audio";
import { DecisionCard, DecisionHold, EvalBoard } from "./AwarenessBeats";
import { KadeTransmission, NoraStrip } from "./Kade";
import { OfficeDesk } from "./OfficeDesk";
import { OriginPrologue } from "./Origin";
import { AttackCine } from "./AttackCine";
import { PuzzleStage } from "./puzzles";
import { BackupBoard, SocialBoard } from "./StoryBoards";
import { FinaleAlerts, ShutdownDesk } from "./Shutdown";
import { Pwa } from "../Pwa";

function clock(total: number) {
  const safe = Math.max(0, total);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function PlayApp({ code }: { code: string }) {
  const [snap, setSnap] = useState<PlaySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [mode, setMode] = useState<"puzzle" | "file">("puzzle");
  const [rail, setRail] = useState<"mission" | "evidence" | null>(null);
  const [audio, setAudio] = useState(false);
  const [cine, setCine] = useState(false);
  const [cineResume, setCineResume] = useState(false);
  const [alertsSeen, setAlertsSeen] = useState(false);
  const [replayCine, setReplayCine] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [feedback, setFeedback] = useState<{ id: string; text: string } | null>(null);
  const [originTick, setOriginTick] = useState(0);
  const [now, setNow] = useState(Date.now());
  const synced = useRef(Date.now());
  const seenEvent = useRef("");
  const playedEnd = useRef(false);
  const solvedSeen = useRef<number | null>(null);
  const starting = useRef(false);
  const originSync = useRef(false);

  const apply = useCallback((next: PlaySnapshot) => {
    setSnap(next);
    synced.current = Date.now();
    localStorage.setItem(`eth-snap-${code}`, JSON.stringify(next));
    setOffline(false);
    setError(null);
  }, [code]);

  const pull = useCallback(async () => {
    try {
      const response = await fetch(`/api/play/${code}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Code niet herkend.");
        return;
      }
      apply(data);
      const key = `eth-queue-${code}`;
      const queued = localStorage.getItem(key);
      if (queued) {
        const items = JSON.parse(queued) as { url: string; body: unknown }[];
        const pending: { url: string; body: unknown }[] = [];
        for (const item of items) {
          try {
            const retry = await fetch(item.url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.body),
            });
            if (!retry.ok && retry.status >= 500) pending.push(item);
          } catch {
            pending.push(item);
          }
        }
        if (pending.length) localStorage.setItem(key, JSON.stringify(pending));
        else localStorage.removeItem(key);
        const again = await fetch(`/api/play/${code}`, { cache: "no-store" });
        if (again.ok) apply(await again.json());
      }
    } catch {
      setOffline(true);
    }
  }, [apply, code]);

  useEffect(() => {
    const cached = localStorage.getItem(`eth-snap-${code}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as PlaySnapshot;
        if (parsed.story) setSnap(parsed);
      } catch { /* oude cache negeren */ }
    }
    setAudio(soundOn());
    setAlertsSeen(sessionStorage.getItem(`eth-m6-alerts-${code}`) === "1");
    void pull();
    const poll = window.setInterval(() => void pull(), 2500);
    const tick = window.setInterval(() => setNow(Date.now()), 250);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, [code, pull]);

  useEffect(() => {
    if (cine) sessionStorage.setItem(`eth-cine-${code}`, "1");
  }, [cine, code]);

  useEffect(() => {
    if (!snap || originSync.current) return;
    if (!includesTraining(snap.session.mode ?? "escape") || prologueComplete(snap.awareness ?? emptyAwareness())) return;
    const local = sessionStorage.getItem(`eth-origin-${code}`);
    if (local !== "hours" && local !== "skip") return;
    originSync.current = true;
    void send("origin", { scene: local === "skip" ? "skip" : "hours" });
  }, [snap, code]);

  useEffect(() => {
    if (!snap) return;
    setActive((current) => {
      if (current && snap.puzzles.some((puzzle) => puzzle.id === current && puzzle.available)) return current;
      return snap.puzzles.find((puzzle) => puzzle.available && !puzzle.solved)?.id ?? snap.puzzles.find((puzzle) => puzzle.available)?.id ?? null;
    });
    if (snap.phase === "office" && sessionStorage.getItem(`eth-cine-${code}`) === "1") {
      setCineResume(true);
      setCine(true);
    }
    if (snap.phase !== "crisis") return;
    if (solvedSeen.current === null) {
      solvedSeen.current = snap.progress.solved;
      return;
    }
    if (snap.progress.solved > solvedSeen.current) {
      const next = snap.puzzles.find((puzzle) => puzzle.available && !puzzle.solved);
      if (next) {
        setActive(next.id);
        setMode("puzzle");
      }
      solvedSeen.current = snap.progress.solved;
    }
  }, [snap, code]);

  const event = snap?.events[0];
  useEffect(() => {
    if (!event || event.id === seenEvent.current) return;
    seenEvent.current = event.id;
    if (event.tone === "message") playMessage();
    else playAlert();
  }, [event]);

  useEffect(() => {
    if (!snap?.finished || playedEnd.current) return;
    playedEnd.current = true;
    playFinale(snap.finished.outcome === "completed");
  }, [snap?.finished]);

  async function send(path: string, body: unknown) {
    playClick();
    setBusy(true);
    const before = snap?.progress.solved ?? 0;
    try {
      const response = await fetch(`/api/play/${code}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.snapshot) apply(data.snapshot);
      else if (data.team) apply(data as PlaySnapshot);
      if (!response.ok) {
        setNote(data.error ?? "Mislukt.");
        setShaking(true);
        window.setTimeout(() => setShaking(false), 400);
        return false;
      }
      if (typeof data.feedback === "string" && data.feedback) {
        const id = body && typeof body === "object" && "id" in body ? String((body as { id: unknown }).id) : "";
        if (id) setFeedback({ id, text: data.feedback });
      }
      if (path === "decision" || path === "eval" || path === "origin") return true;
      const solvedNow = (data.progress?.solved ?? data.snapshot?.progress?.solved ?? before) > before;
      const puzzleId = body && typeof body === "object" && "puzzleId" in body ? String((body as { puzzleId: unknown }).puzzleId) : "";
      const early = puzzleId.startsWith("ch1-") || puzzleId.startsWith("ch2-") || puzzleId.startsWith("ch3-") || puzzleId.startsWith("ch4-") || puzzleId.startsWith("ch5-") || puzzleId.startsWith("ch6-");
      setNote(solvedNow ? (early ? "Vastgelegd." : "Laag hersteld.") : null);
      if (solvedNow) playOk();
      return true;
    } catch {
      setOffline(true);
      setNote("Verbinding verbroken. De invoer wordt opnieuw verstuurd zodra het netwerk terug is.");
      const key = `eth-queue-${code}`;
      const queue = JSON.parse(localStorage.getItem(key) || "[]") as { url: string; body: unknown }[];
      queue.push({ url: `/api/play/${code}/${path}`, body });
      localStorage.setItem(key, JSON.stringify(queue));
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (error && !snap) {
    return (
      <main className="scroll-page">
        <div className="panel" style={{ padding: 24, maxWidth: 480 }}>
          <p className="kicker">NEXORA</p>
          <h1>Code niet herkend</h1>
          <p className="lede">{error}</p>
          <a className="btn btn-primary" href="/" style={{ display: "inline-grid", marginTop: 16, placeItems: "center" }}>Terug</a>
        </div>
      </main>
    );
  }

  if (!snap) {
    return <main className="app-shell"><p className="kicker" style={{ padding: 24 }}>Verbinding met Nexora…</p></main>;
  }

  const remaining = snap.session.running ? Math.max(0, snap.session.remainingSec - Math.floor((now - synced.current) / 1000)) : snap.session.remainingSec;
  const timerClass = remaining < 120 ? "timer late" : remaining < 600 ? "timer warn" : "timer";
  const puzzle = snap.puzzles.find((item) => item.id === active) ?? null;
  const file = snap.files.find((item) => item.id === fileId) ?? null;
  const nextPuzzle = snap.puzzles.find((item) => item.available && !item.solved);

  function openFile(id: string) {
    setFileId(id);
    setMode("file");
    setRail(null);
  }

  function download() {
    if (!snap) return;
    const lines = [
      `Team: ${snap.team.name}`,
      `Status: ${snap.finished?.title ?? snap.team.status}`,
      `Score: ${snap.team.score}`,
      `Positie: ${snap.team.rank}`,
      `Hints: ${snap.team.hintCount}`,
      `Instructeurhints: ${snap.team.instructorHintCount}`,
      `Opgelost: ${snap.progress.solved}/${snap.progress.total}`,
      `Speeltijd: ${snap.finished ? clock(snap.finished.elapsedSec) : ""}`,
      `Resterend: ${clock(snap.session.remainingSec)}`,
      `Valse mail herkend: ${snap.team.phishReported ? "ja" : "nee"}`,
      ...snap.puzzles.filter((item) => item.solved).map((item) => `Opgelost: ${item.title}`),
      ...story.scenes.map((id) => speech(id, snap.team.phishReported)?.title).filter(Boolean).map((title) => `Moment: ${title}`),
      ...savedOfficePieces(code).map((item) => `Dossier: ${item.title} — ${item.excerpt}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${snap.team.name}-resultaat.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function saveTraining() {
    if (!snap?.awareness || !snap.session.mode || snap.session.mode === "escape") return;
    const text = trainingReport({
      team: snap.team.name,
      date: new Date(snap.serverNow).toLocaleDateString("nl-NL"),
      mode: snap.session.mode,
      chaptersDone: snap.progress.chaptersDone,
      hintCount: snap.team.hintCount + snap.team.instructorHintCount,
      awareness: snap.awareness,
    });
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${snap.team.name}-training.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const savedBreach = typeof window === "undefined" ? null : sessionStorage.getItem(`eth-hack-${code}`);
  const reported = snap.team.phishReported || savedBreach === "report";
  const clockLabel = snap.phase === "office" ? "werkdag" : clock(remaining);
  const story = snap.story ?? emptyStory();
  const awareness = snap.awareness ?? emptyAwareness();
  const gameMode = snap.session.mode ?? "escape";
  const training = includesTraining(gameMode);
  const localOrigin = originTick >= 0 && typeof window !== "undefined" ? sessionStorage.getItem(`eth-origin-${code}`) : null;
  const showOrigin = training && snap.phase === "office" && !prologueComplete(awareness) && localOrigin !== "hours" && localOrigin !== "skip";
  const gate = pendingStoryDecision(gameMode, story.scenes, awareness);
  const held = feedback && (feedback.id === "escalate" || feedback.id === "supplier") && !gate ? feedback : null;
  const priority = awareness.decisions.find((item) => item.id === "priority");
  const priorityText = priority ? gradeDecision("priority", priority.choice)?.explanation ?? "" : "";
  const solvedIds = snap.puzzles.filter((item) => item.solved).map((item) => item.id);
  const beat = nextBeat(story, solvedIds, snap.team.phishReported);
  const spoken = beat.kind === "transmission" || beat.kind === "discovery" ? speech(beat.id, reported) : null;
  const missionId = beat.kind === "social" ? 1 : beat.kind === "backup" ? 4 : beat.kind === "finale" ? 6 : beat.kind === "puzzle" ? (snap.puzzles.find((item) => item.id === beat.puzzleId)?.chapterId ?? snap.chapter.id) : beat.kind === "transmission" || beat.kind === "discovery" ? Number(beat.id.replace(/\D/g, "")) || 1 : snap.chapter.id;
  const missionSteps = snap.puzzles.filter((item) => item.chapterId === missionId);
  const lessons = dossier(story);
  const finaleStep = beat.kind === "finale" ? beat.step : beat.kind === "puzzle" && beat.puzzleId === "ch6-seals" ? "seals" as const : beat.kind === "puzzle" && beat.puzzleId === "ch6-shutdown" ? "shutdown" as const : null;
  const stagePuzzle = beat.kind === "puzzle" ? snap.puzzles.find((item) => item.id === beat.puzzleId) ?? null : null;

  function beginBreach(report: boolean) {
    sessionStorage.setItem(`eth-hack-${code}`, report ? "report" : "open");
    sessionStorage.removeItem(`eth-cine-${code}`);
    setCineResume(false);
    setCine(true);
  }

  async function enterCrisis() {
    if (starting.current) return;
    starting.current = true;
    const ok = await send("breach", { reported });
    if (!ok) {
      starting.current = false;
      return;
    }
    const seen = await send("story", { scene: "incident" });
    if (seen) await send("story", { scene: "m1" });
    sessionStorage.removeItem(`eth-hack-${code}`);
    sessionStorage.removeItem(`eth-cine-${code}`);
    setCine(false);
    setCineResume(false);
  }

  return (
    <main className={`${snap.phase === "office" ? "office-root" : "play-root"} app-shell`}>
      <Pwa />
      <div className="turn">
        <div>
          <p className="kicker">Tablet</p>
          <h1>Draai naar liggend</h1>
        </div>
      </div>
      <header className="topbar">
        <div className="brand">{snap.phase === "office" ? "NEXORA" : "ESCAPE THE HACK 2.0"}<small>{snap.phase === "office" ? `WERKDAG · ${snap.team.name}` : snap.team.name}</small></div>
        <div>
          <div className="muted" style={{ fontSize: 12 }}>{snap.phase === "office" ? "Onderzoek" : beat.kind === "transmission" && beat.id === "incident" ? "Incident" : missionTitle(missionId)}</div>
          {snap.phase !== "office" && (
            <div className="segs" aria-label="Hoofdstukken">
              {Array.from({ length: 6 }, (_, index) => {
                const id = index + 1;
                const done = snap.progress.chaptersDone >= id;
                const current = snap.chapter.id === id;
                return <i key={id} className={`seg${done ? " on" : ""}${current && !done ? " now" : ""}`} />;
              })}
            </div>
          )}
        </div>
        <div className="grow" />
        {snap.phase !== "office" && <div className="mono" style={{ fontSize: 16 }}>{snap.team.score} pt</div>}
        {stagePuzzle && !stagePuzzle.solved && snap.phase === "crisis" && (
          <button className="icon-btn" type="button" disabled={busy || stagePuzzle.hintLevel >= 3} onClick={() => void send("hint", { puzzleId: stagePuzzle.id })}>
            Hints {stagePuzzle.hintLevel}/3
          </button>
        )}
        <div className={`mono ${snap.phase === "office" ? "timer" : timerClass}`}>{clockLabel}</div>
        <button className="icon-btn" type="button" onClick={() => { const next = !audio; setAudio(next); setSound(next); }}>{audio ? "geluid aan" : "geluid uit"}</button>
        <button className="icon-btn" type="button" onClick={() => {
          if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.();
          else void document.exitFullscreen?.();
        }}>volledig</button>
      </header>
      {offline && <div className="offline" style={{ padding: "0 12px" }}>Verbinding verbroken. Voortgang blijft op dit toestel staan.</div>}

      {snap.team.status === "ready" && (
        <section className="lobby" style={{ padding: 24 }}>
          <p className="kicker">{snap.session.name}</p>
          <h1>{snap.team.name}</h1>
          <p className="lede">Wacht tot de instructeur de missie start. Jullie scherm blijft hier.</p>
        </section>
      )}

      {showOrigin && (
        <OriginPrologue
          code={code}
          seen={awareness.prologue}
          audio={audio}
          onToggleAudio={() => { const next = !audio; setAudio(next); setSound(next); }}
          onSeen={(scene) => { setOriginTick((value) => value + 1); void send("origin", { scene }); }}
        />
      )}

      {snap.phase === "office" && !showOrigin && (
        <OfficeDesk
          teamCode={code}
          busy={busy}
          audio={audio}
          onToggleAudio={() => { const next = !audio; setAudio(next); setSound(next); }}
          onBreach={beginBreach}
        />
      )}

      {snap.phase === "crisis" && !snap.finished && !cine && (
        <>
          <div className="tabs">
            <button className="btn" type="button" onClick={() => setRail(rail === "mission" ? null : "mission")}>Dossier</button>
            <button className="btn" type="button" onClick={() => setRail(rail === "evidence" ? null : "evidence")}>Bewijs</button>
          </div>
          <section className="desk">
            <aside className={`panel col rail-left${rail === "mission" ? " open" : ""}`}>
              <p className="kicker">{missionTitle(missionId)}</p>
              <p className="muted">Nu: {spoken?.title ?? stagePuzzle?.title ?? (beat.kind === "social" ? "Vijf openbare sporen" : beat.kind === "backup" ? "Schone back-up" : beat.kind === "finale" ? "Laatste toegang" : "het huidige spoor")}</p>
              <div className="list" style={{ marginTop: 10 }}>
                {missionSteps.map((item) => (
                  <div key={item.id} className={`task${item.id === stagePuzzle?.id ? " on" : ""}${item.solved ? " done" : ""}`}>
                    {item.title}
                    <small>{item.solved ? "hersteld" : item.id === stagePuzzle?.id ? "nu" : "volgt"}</small>
                  </div>
                ))}
              </div>
                <button className="btn" type="button" onClick={() => setReplayCine(true)}>Aanval opnieuw</button>
                <p className="kicker" style={{ marginTop: 16 }}>Dossier</p>
              <div className="list">
                {lessons.map((item) => (
                  <div key={item.id} className="token">
                    <strong>{item.title}</strong>
                    <small>{item.learn?.voorkom}</small>
                  </div>
                ))}
                {snap.files.filter((item) => item.chapter === missionId || item.chapter < missionId).map((item) => (
                  <button key={item.id} type="button" className={`task${fileId === item.id && mode === "file" ? " on" : ""}`} onClick={() => openFile(item.id)}>
                    {item.name}
                  </button>
                ))}
              </div>
            </aside>
            <section className={`panel stage${shaking ? " shake" : ""}${event?.tone === "glitch" ? " glitch" : ""}`}>
              {!spoken && stagePuzzle && stagePuzzle.chapterId > 6 && <NoraStrip text={noraNote(missionId)} />}
              {gate ? (
                <DecisionCard id={gate} busy={busy} feedback={feedback?.id === gate ? feedback.text : null} onSubmit={(choice) => void send("decision", { id: gate, choice })} />
              ) : held ? (
                <DecisionHold text={held.text} onNext={() => setFeedback(null)} />
              ) : spoken && spoken.id === "m6" && !alertsSeen ? (
                <FinaleAlerts audio={audio} onDone={() => { sessionStorage.setItem(`eth-m6-alerts-${code}`, "1"); setAlertsSeen(true); }} />
              ) : spoken ? (
                <KadeTransmission scene={spoken} audio={audio} onDone={() => void send("story", { scene: spoken.id })} />
              ) : beat.kind === "social" ? (
                <SocialBoard busy={busy} onSubmit={(ids) => void send("story", { social: ids })} />
              ) : beat.kind === "backup" ? (
                <BackupBoard busy={busy} onSubmit={(id) => void send("story", { backup: id })} />
              ) : finaleStep ? (
                <div className="fp-stage">
                  <ShutdownDesk
                    step={finaleStep}
                    busy={busy}
                    inventory={snap.inventory}
                    onAccess={(id, clues) => void send("story", { finale: "access", pick: id, clues })}
                    onRevoke={() => void send("story", { finale: "revoke" })}
                    onBackup={(checks) => void send("story", { finale: "backup-check", checks })}
                    onSolve={(payload) => stagePuzzle && void send("solve", { puzzleId: stagePuzzle.id, payload })}
                  />
                </div>
              ) : mode === "file" && file ? <FileView file={file} /> : stagePuzzle && stagePuzzle.chapterId <= 5 ? (
                <div className="fp-stage">
                  <PuzzleStage
                    id={stagePuzzle.id}
                    solved={stagePuzzle.solved}
                    busy={busy}
                    inventory={snap.inventory}
                    training={training && stagePuzzle.chapterId === 4}
                    priorityDone={Boolean(priority)}
                    priorityText={priorityText}
                    onPriority={(choice) => void send("decision", { id: "priority", choice })}
                    onOpenFile={openFile}
                    onSolve={(payload) => void send("solve", { puzzleId: stagePuzzle.id, payload })}
                  />
                  {stagePuzzle.hints.length > 0 && (
                    <div className="fp-hints">
                      {stagePuzzle.hints.map((hint) => <div key={hint} className="token"><small>Hint</small>{hint}</div>)}
                    </div>
                  )}
                </div>
              ) : stagePuzzle ? (
                <div className="stack">
                  <div>
                    <p className="kicker">{stagePuzzle.title}</p>
                    <p className="muted">{stagePuzzle.bridge}</p>
                    <p>{stagePuzzle.brief}</p>
                  </div>
                  <PuzzleStage
                    id={stagePuzzle.id}
                    solved={stagePuzzle.solved}
                    busy={busy}
                    inventory={snap.inventory}
                    onOpenFile={openFile}
                    onSolve={(payload) => void send("solve", { puzzleId: stagePuzzle.id, payload })}
                  />
                  {stagePuzzle.hints.length > 0 && (
                    <div className="stack">
                      {stagePuzzle.hints.map((hint) => <div key={hint} className="token"><small>Hint</small>{hint}</div>)}
                    </div>
                  )}
                </div>
              ) : <p>Geen opdracht geselecteerd.</p>}
            </section>
            <aside className={`panel col rail-right${rail === "evidence" ? " open" : ""}`}>
              <p className="kicker">Inventaris</p>
              <div className="stack">
                {snap.inventory.length === 0 && <p className="muted">Nog geen tokens.</p>}
                {snap.inventory.map((token) => <div key={token.id} className="token mono">{token.label}</div>)}
              </div>
              <p className="kicker" style={{ marginTop: 16 }}>Stand</p>
              <div className="stack">
                {snap.leaderboard.map((row, index) => (
                  <div key={row.name} className="token"><strong>{index + 1}. {row.name}</strong><small>{row.score} pt{row.status === "ready" ? "" : ""}</small></div>
                ))}
              </div>
            </aside>
          </section>
          <footer className="foot">
            <div className={`note${note === "Laag hersteld." || note === "Vastgelegd." ? " good" : ""}`}>{spoken ? "" : note}</div>
            <div className="grow" />
            {stagePuzzle && !stagePuzzle.solved && (
              <>
                <div className="pips" aria-hidden>
                  {[1, 2, 3].map((level) => <i key={level} className={stagePuzzle.hintLevel >= level ? "pip on" : "pip"} />)}
                </div>
                <button className="btn" type="button" disabled={busy || stagePuzzle.hintLevel >= 3} onClick={() => void send("hint", { puzzleId: stagePuzzle.id })}>
                  Hint{snap.session.hintPenalty ? ` · +${snap.session.hintPenaltySec}s` : ""}
                </button>
              </>
            )}
          </footer>
        </>
      )}

      {snap.session.status === "paused" && !snap.finished && (
        <div className="pause"><div className="panel"><p className="kicker">Pauze</p><h2>De instructeur heeft de klok stilgezet.</h2></div></div>
      )}

      {(cine || replayCine) && (
        <AttackCine
          reported={reported}
          audio={audio}
          resumed={cineResume && !replayCine}
          live={snap.phase === "office"}
          onStart={() => void enterCrisis()}
          onClose={() => { setReplayCine(false); setCine(false); }}
        />
      )}

      {event && !snap.finished && !cine && snap.session.status !== "paused" && snap.phase === "crisis" && beat.kind !== "transmission" && beat.kind !== "discovery" && (
        <div className={`modal ${event.tone === "glitch" ? "glitch" : ""}`}>
          <div className="panel">
            <p className="kicker">{event.tone === "message" ? "Inkomend" : "Systeem"}</p>
            <h2>{event.title}</h2>
            <p style={{ marginTop: 10 }}>{event.body}</p>
            <button className="btn btn-primary" type="button" style={{ marginTop: 16 }} onClick={() => void send("ack", { eventId: event.id })}>Begrepen</button>
          </div>
        </div>
      )}

      {snap.finished && (
        <div className={`ending ${snap.finished.outcome === "completed" ? "win" : "fail"}`}>
          <div className="panel stack sd-report">
            <p className="kicker mono">{snap.team.name}</p>
            <h2>{snap.finished.outcome === "completed" ? "SYSTEM RESTORED" : "SYSTEM COMPROMISED"}</h2>
            {(snap.finished.outcome === "completed" ? winLines : failLines).map((line) => <p key={line}>{line}</p>)}
            {snap.finished.outcome === "completed" && <div className="sd-map safe" aria-hidden><b>NEX</b><b>EDGE</b><b>AUTH</b><b>VAULT</b><b>LOG</b></div>}
            <div className="grid-2">
              <div className="token"><small>Score</small><strong>{snap.team.score}</strong></div>
              <div className="token"><small>Positie</small><strong>#{snap.team.rank}</strong></div>
              <div className="token"><small>Hints</small><strong>{snap.team.hintCount}</strong></div>
              <div className="token"><small>Speeltijd</small><strong className="mono">{clock(snap.finished.elapsedSec)}</strong></div>
              <div className="token"><small>Tijd over</small><strong className="mono">{clock(snap.session.remainingSec)}</strong></div>
              <div className="token"><small>Valse mail</small><strong>{snap.team.phishReported ? "herkend" : "niet gemeld"}</strong></div>
            </div>
            <div className="stack">
              <p className="kicker">Missies</p>
              {[1, 2, 3, 4, 5, 6].map((id) => {
                const items = snap.puzzles.filter((item) => item.chapterId === id);
                const done = items.length > 0 && items.every((item) => item.solved);
                return <div key={id} className="token"><strong>{missionTitle(id)}</strong><small>{done ? "afgerond" : "open"}</small></div>;
              })}
            </div>
            {lessons.length > 0 && (
              <div className="stack">
                <p className="kicker">Ontdekkingen</p>
                {lessons.map((item) => (
                  <div key={item.id} className="token"><strong>{item.title}</strong><small>{item.learn?.deed}</small></div>
                ))}
              </div>
            )}
            <div className="stack">
              <p className="kicker">Tijdlijn</p>
              {story.scenes.map((id) => {
                const scene = speech(id, snap.team.phishReported);
                if (!scene) return null;
                const title = id === "incident" ? "De aanval begint" : scene.title;
                return <div key={id} className="token"><strong>{title}</strong><small>{scene.kicker}</small></div>;
              })}
            </div>
            {training && gameMode === "nis2" && (
              <EvalBoard
                done={awareness.evals.filter((item) => item.correct).map((item) => item.id)}
                feedback={feedback}
                busy={busy}
                onSubmit={(id, choice) => void send("eval", { id, choice })}
              />
            )}
            {training && (
              <div className="token">
                <strong>Missie 6</strong>
                <small>Volg de incidentprocedure, werk samen en controleer of het herstel uit een gecontroleerde back-up komt.</small>
              </div>
            )}
            <div className="row">
              <button className="btn" type="button" onClick={download}>Resultaat bewaren</button>
              {training && <button className="btn" type="button" onClick={saveTraining}>Trainingsrapport</button>}
              <a className="btn btn-ghost" href={`/results/${snap.team.code}`}>Opnieuw bekijken</a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FileView({ file }: { file: PlayFile }) {
  return (
    <article className="stack">
      <p className="kicker mono">{file.name}</p>
      {file.meta && (
        <table className="meta-table">
          <tbody>
            {file.meta.map((row) => (
              <tr key={row.label}><td className="muted">{row.label}</td><td className="mono">{row.value}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="doc mono">{file.body}</div>
    </article>
  );
}
