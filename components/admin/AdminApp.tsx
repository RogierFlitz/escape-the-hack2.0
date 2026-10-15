"use client";

import { useEffect, useState } from "react";
import { MODE_PLAN, type GameMode } from "@/lib/game/awareness";
import type { AdminSnapshot, Session } from "@/lib/types";

function clock(total: number) {
  const safe = Math.max(0, Math.floor(total));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function Qr({ value }: { value: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let cancel = false;
    import("qrcode").then((lib) => lib.toDataURL(value, { margin: 1, width: 280, color: { dark: "#071018", light: "#ffffff" } })).then((url) => {
      if (!cancel) setSrc(url);
    }).catch(() => undefined);
    return () => { cancel = true; };
  }, [value]);
  if (!src) return <div className="qr" />;
  return <img className="qr" alt="" src={src} />;
}

export function AdminApp() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [devHint, setDevHint] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [board, setBoard] = useState<AdminSnapshot | null>(null);
  const [name, setName] = useState("Bedrijfsuitje");
  const [duration, setDuration] = useState(60);
  const [penaltyOn, setPenaltyOn] = useState(true);
  const [penaltySec, setPenaltySec] = useState(30);
  const [teams, setTeams] = useState(["Team 1", "Team 2"]);
  const [mode, setMode] = useState<GameMode>("escape");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  async function refreshList() {
    const response = await fetch("/api/sessions", { cache: "no-store" });
    if (response.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await response.json();
    setSessions(data.sessions ?? []);
  }

  useEffect(() => {
    fetch("/api/admin/login", { cache: "no-store" }).then((response) => response.json()).then((data) => {
      setAuthed(Boolean(data.authenticated));
      setDevHint(Boolean(data.devHint));
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!authed) return;
    void refreshList();
  }, [authed]);

  useEffect(() => {
    if (!activeId) return;
    let stop = false;
    async function tick() {
      const response = await fetch(`/api/sessions/${activeId}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (!stop) setBoard(data as AdminSnapshot);
    }
    void tick();
    const id = window.setInterval(() => void tick(), 2000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [activeId]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      setLoginError("Wachtwoord klopt niet.");
      return;
    }
    setAuthed(true);
    setLoginError("");
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, durationMin: duration, hintPenalty: penaltyOn, hintPenaltySec: penaltySec, teams, mode }),
    });
    const data = await response.json();
    if (!response.ok) {
      setFormError(data.error ?? "Aanmaken mislukt.");
      return;
    }
    setActiveId(data.session.id);
    await refreshList();
  }

  async function control(action: string, extra: Record<string, unknown> = {}) {
    if (!activeId) return;
    const response = await fetch(`/api/sessions/${activeId}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await response.json();
    if (!response.ok) setNotice(data.error ?? "Actie mislukt.");
    else {
      setNotice(action === "hint" ? `Hint verstuurd: ${data.puzzle}` : "");
      if (data.snapshot) setBoard(data.snapshot as AdminSnapshot);
    }
  }

  if (!ready) return <main className="scroll-page"><p className="kicker">Beheer laden…</p></main>;

  if (!authed) {
    return (
      <main className="scroll-page">
        <form className="panel join" style={{ maxWidth: 420, margin: "10vh auto" }} onSubmit={login}>
          <p className="kicker">Flitz-events</p>
          <h1>Instructeur</h1>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Wachtwoord" data-testid="admin-password" style={{ letterSpacing: 0, textTransform: "none", fontSize: 18 }} />
          {loginError && <p className="note">{loginError}</p>}
          {devHint && <p className="muted">Standaardwachtwoord: flitz-admin. Zet ADMIN_PASSWORD voor je de laptop buiten het evenement-wifi bereikbaar maakt.</p>}
          <button className="btn btn-primary" type="submit">Open beheer</button>
          <a className="linkish" href="/">Terug naar de game</a>
        </form>
      </main>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const port = typeof window !== "undefined" && window.location.port ? `:${window.location.port}` : "";
  const lan = board?.lanHosts[0];
  const base = host === "localhost" || host === "127.0.0.1" ? (lan ? `http://${lan}${port}` : origin) : origin;

  return (
    <main className="scroll-page">
      <div className="admin">
        <header className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <p className="kicker">Beheer</p>
            <h1>Speelsessies</h1>
          </div>
          <div className="row">
            <a className="btn btn-ghost" href="/">Spelersscherm</a>
            <button className="btn" type="button" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthed(false); }}>Afmelden</button>
          </div>
        </header>

        {!activeId && (
          <form className="panel" style={{ padding: 18 }} onSubmit={create}>
            <p className="kicker">Nieuwe sessie</p>
            <div className="grid-2">
              <label className="stack">Naam<input value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label className="stack">Duur in minuten<input type="number" min={10} max={180} value={duration} onChange={(event) => setDuration(Number(event.target.value))} /></label>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              {[30, 45, 60, 75, 90].map((minutes) => (
                <button key={minutes} className={duration === minutes ? "chip on" : "chip"} type="button" onClick={() => setDuration(minutes)}>{minutes} min</button>
              ))}
            </div>
            <div className="stack" style={{ marginTop: 12 }}>
              <p className="kicker">Modus</p>
              {([
                ["escape", "Escape Room"],
                ["awareness", "Cyber Awareness"],
                ["nis2", "NIS2 Training Experience"],
              ] as const).map(([id, label]) => (
                <button key={id} className={mode === id ? "chip on" : "chip"} type="button" onClick={() => setMode(id)}>{label}</button>
              ))}
              <p className="muted">{MODE_PLAN[mode]}</p>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button className={penaltyOn ? "chip on" : "chip"} type="button" onClick={() => setPenaltyOn((value) => !value)}>Hints kosten tijd: {penaltyOn ? "aan" : "uit"}</button>
              <label className="row">Seconden<input type="number" min={0} max={300} value={penaltySec} onChange={(event) => setPenaltySec(Number(event.target.value))} style={{ width: 100 }} /></label>
            </div>
            <div className="stack" style={{ marginTop: 12 }}>
              {teams.map((team, index) => (
                <div key={index} className="row">
                  <input value={team} onChange={(event) => setTeams(teams.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))} placeholder={`Team ${index + 1}`} />
                  <button className="btn" type="button" onClick={() => setTeams(teams.filter((_, itemIndex) => itemIndex !== index))} disabled={teams.length === 1}>Weg</button>
                </div>
              ))}
              <button className="btn btn-ghost" type="button" onClick={() => setTeams([...teams, `Team ${teams.length + 1}`])} disabled={teams.length >= 24}>Team toevoegen</button>
            </div>
            {formError && <p className="note">{formError}</p>}
            <button className="btn btn-primary" type="submit" style={{ marginTop: 12 }} data-testid="create-session">Sessie klaarzetten</button>
            {sessions.length > 0 && (
              <div className="stack" style={{ marginTop: 18 }}>
                <p className="kicker">Eerder</p>
                {sessions.map((session) => (
                  <button key={session.id} className="token" type="button" onClick={() => setActiveId(session.id)}>
                    <strong>{session.name}</strong>
                    <small>{session.status} · {session.mode ?? "escape"} · {Math.round(session.durationSec / 60)} min</small>
                  </button>
                ))}
              </div>
            )}
          </form>
        )}

        {activeId && board && (
          <section className="stack">
            <div className="panel" style={{ padding: 16 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <p className="kicker">{board.session.status}</p>
                  <h2>{board.session.name}</h2>
                  <p className="mono" style={{ fontSize: 28 }}>{board.teams.some((team) => !team.office && team.status === "playing") ? clock(Math.min(...board.teams.filter((team) => !team.office && team.status === "playing").map((team) => team.remainingSec))) : "kantoor"}</p>
                </div>
                <div className="row">
                  {board.session.status === "draft" && <button className="btn btn-mint" type="button" data-testid="start-session" onClick={() => void control("start")}>Iedereen starten</button>}
                  {board.session.mode && board.session.mode !== "escape" && <button className="btn" type="button" onClick={() => void control("skip-prologue")}>Proloog overslaan</button>}
                  {board.session.status === "live" && <button className="btn" type="button" onClick={() => void control("pause")}>Pauzeren</button>}
                  {board.session.status === "paused" && <button className="btn btn-mint" type="button" onClick={() => void control("resume")}>Hervatten</button>}
                  <button className="btn" type="button" onClick={() => void control("adjust", { seconds: 60 })}>+1 min</button>
                  <button className="btn" type="button" onClick={() => void control("adjust", { seconds: 300 })}>+5 min</button>
                  <button className="btn" type="button" onClick={() => void control("adjust", { seconds: -60 })}>−1 min</button>
                  <button className="btn btn-danger" type="button" onClick={() => void control("end")}>Beëindigen</button>
                  <a className="btn" href={`/api/sessions/${activeId}/export`}>Exporteer</a>
                  <button className="btn btn-ghost" type="button" onClick={() => { setActiveId(null); setBoard(null); }}>Terug</button>
                </div>
              </div>
              {notice && <p className="note good">{notice}</p>}
              <p className="muted" style={{ marginTop: 8 }}>Tablets openen {base}. {host === "localhost" && !lan ? "Geen netwerkadres gevonden. Open dit scherm via het IP-adres van deze laptop." : ""}</p>
            </div>
            <div className="team-grid">
              {board.teams.map((team) => {
                const url = `${base}/play/${team.code}`;
                return (
                  <article key={team.id} className="panel team-card" style={{ padding: 14 }}>
                    <header>
                      <div>
                        <strong>{team.name}</strong>
                        <small className={team.stuck ? "stuck" : ""}>{team.office ? "Nog op kantoor" : team.stuck ? "Vastgelopen" : team.status}{team.phishReported ? " · mail herkend" : ""} · {team.currentPuzzle ?? "klaar"}</small>
                      </div>
                      <div className="code mono">{team.code}</div>
                    </header>
                    <div className="row" style={{ marginTop: 10, alignItems: "flex-start" }}>
                      <Qr value={url} />
                      <div className="stack">
                        <div>{team.solved}/{team.total} hersteld</div>
                        <div>{team.score} pt · plek {team.rank}</div>
                        <div className="mono">{clock(team.remainingSec)}</div>
                        <div className="muted">Hints {team.hints} · instructeur {team.instructorHints}</div>
                        <div className="muted">{team.currentPuzzle ?? "Geen open opdracht"}{team.lastScene ? ` · ${team.lastScene}` : ""}</div>
                        <button className="btn" type="button" onClick={() => void control("hint", { teamId: team.id })}>Hint geven</button>
                        <button className="btn" type="button" onClick={() => void control("replay", { teamId: team.id })}>Scène opnieuw</button>
                        <button className="btn" type="button" onClick={() => void control("advance", { teamId: team.id })}>Volgend moment</button>
                        <button className="btn btn-ghost" type="button" onClick={() => void navigator.clipboard.writeText(url)}>Link kopiëren</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
