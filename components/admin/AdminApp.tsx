"use client";

import { useEffect, useMemo, useState } from "react";
import { DemoJumps } from "../home/DemoJumps";
import { MODE_PLAN, type GameMode } from "@/lib/game/awareness";
import { SECTOR_PLAN, SECTORS, type Sector } from "@/lib/game/sector";
import type { AdminSnapshot, AdminTeam, Session, SessionRollup } from "@/lib/types";
import { AdminResults, PlayerResults } from "../results/ResultsApp";
import "./gcc.css";

type View = "dashboard" | "sessions" | "new" | "live" | "teams" | "test" | "board" | "results" | "settings";
type Filter = "all" | "draft" | "live" | "paused" | "ended";

const NAV: { id: View; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "sessions", label: "Speelsessies" },
  { id: "new", label: "Nieuwe sessie" },
  { id: "live", label: "Live spelbeheer" },
  { id: "teams", label: "Teams" },
  { id: "test", label: "Testcentrum" },
  { id: "board", label: "Klassement" },
  { id: "results", label: "Resultaten & rapportages" },
  { id: "settings", label: "Instellingen" },
];

function clock(total: number) {
  const safe = Math.max(0, Math.floor(total));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function modeLabel(mode?: string) {
  if (mode === "awareness") return "Cyber Awareness";
  if (mode === "nis2") return "NIS2 Training Experience";
  return "Escape Room";
}

function sectorLabel(sector?: string) {
  if (sector === "ministeries") return "Ministeries";
  if (sector === "gemeenten") return "Gemeenten";
  return "Algemeen";
}

function statusLabel(status: string) {
  if (status === "draft") return "Klaargezet";
  if (status === "live") return "Live";
  if (status === "paused") return "Gepauzeerd";
  if (status === "ended") return "Beëindigd";
  return status;
}

function freshSession(session: Session, now = Date.now()) {
  const stamp = session.startedAt ?? session.createdAt;
  return now - stamp < 18 * 60 * 60 * 1000;
}

function progressLine(count: SessionRollup | undefined, status: string) {
  if (!count || count.teams === 0) return "Nog geen teams";
  if (status === "draft") return `${count.teams} teams klaar · de klok loopt nog niet`;
  if (count.completed === count.teams) return "Alle teams zijn klaar";
  const parts = [`${count.playing} van ${count.teams} bezig`];
  if (count.completed > 0) parts.push(`${count.completed} klaar`);
  if (count.attention > 0) parts.push(`${count.attention} zonder voortgang`);
  return parts.join(" · ");
}

function teamTone(sessionStatus: string, team: AdminTeam) {
  if (team.status === "completed") return { label: "Afgerond", tone: "done", link: "Klaar" };
  if (team.status === "failed") return { label: "Beëindigd", tone: "bad", link: "Gestopt" };
  if (sessionStatus === "paused") return { label: "Gepauzeerd", tone: "warn", link: "Sessie op pauze" };
  if (team.status === "ready") return { label: "Lobby", tone: "wait", link: "Nog niet in het spel" };
  if (team.stuck) return { label: "Aandacht nodig", tone: "warn", link: "Geen voortgang in 5 minuten" };
  if (team.office) return { label: "Actief", tone: "ok", link: "Verbonden, nog op kantoor" };
  return { label: "Actief", tone: "ok", link: "Verbonden" };
}

function Icon({ name }: { name: View }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, viewBox: "0 0 24 24" };
  if (name === "dashboard") return <svg {...common}><rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="5" /><rect x="13" y="10" width="8" height="11" /><rect x="3" y="13" width="8" height="8" /></svg>;
  if (name === "sessions") return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h8M8 17h5" /></svg>;
  if (name === "new") return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 8v8M8 12h8" /></svg>;
  if (name === "live") return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M5 12a7 7 0 0 1 14 0" /><path d="M8 12a4 4 0 0 1 8 0" /></svg>;
  if (name === "teams") return <svg {...common}><circle cx="8" cy="9" r="2.5" /><circle cx="16" cy="9" r="2.5" /><path d="M4 18c1-3 2.5-4 4-4s3 1 4 4M12 18c1-3 2.5-4 4-4s3 1 4 4" /></svg>;
  if (name === "test") return <svg {...common}><path d="M9 3h6M10 3v6l-5 9h14l-5-9V3" /></svg>;
  if (name === "board") return <svg {...common}><path d="M5 19V9M12 19V5M19 19v-7" /></svg>;
  if (name === "results") return <svg {...common}><path d="M6 4h9l3 3v13H6z" /><path d="M9 12h6M9 16h6" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2" /></svg>;
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
  const [configError, setConfigError] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [counts, setCounts] = useState<SessionRollup[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [board, setBoard] = useState<AdminSnapshot | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Bedrijfsuitje");
  const [client, setClient] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [customDuration, setCustomDuration] = useState("");
  const [penaltyOn, setPenaltyOn] = useState(true);
  const [penaltySec, setPenaltySec] = useState(30);
  const [teams, setTeams] = useState(["Team 1", "Team 2"]);
  const [mode, setMode] = useState<GameMode>("escape");
  const [sector, setSector] = useState<Sector>("general");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [timeOpen, setTimeOpen] = useState<null | "add" | "cut">(null);
  const [timeTeam, setTimeTeam] = useState("all");
  const [timePick, setTimePick] = useState(5);
  const [customMin, setCustomMin] = useState("");
  const [reason, setReason] = useState("");
  const [timeBusy, setTimeBusy] = useState(false);
  const [resultsView, setResultsView] = useState<"report" | "stage" | null>(null);
  const [playerCode, setPlayerCode] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState("");

  const rollup = useMemo(() => new Map(counts.map((item) => [item.sessionId, item])), [counts]);
  const active = sessions.find((item) => item.id === activeId) ?? null;
  const selected = board?.teams.find((item) => item.id === selectedId) ?? null;

  async function refreshList() {
    const response = await fetch("/api/sessions", { cache: "no-store" });
    if (response.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await response.json();
    setSessions(data.sessions ?? []);
    setCounts(data.counts ?? []);
  }

  useEffect(() => {
    fetch("/api/admin/login", { cache: "no-store" }).then((response) => response.json()).then((data) => {
      setAuthed(Boolean(data.authenticated));
      setDevHint(Boolean(data.devHint));
      setConfigError(data.configured === false ? String(data.error ?? "Beheer is niet geconfigureerd.") : "");
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!authed) return;
    void refreshList();
    const id = window.setInterval(() => void refreshList(), 8000);
    return () => window.clearInterval(id);
  }, [authed]);

  useEffect(() => {
    if (!activeId || (view !== "live" && view !== "teams" && view !== "board" && view !== "results")) return;
    let stop = false;
    async function tick() {
      const response = await fetch(`/api/sessions/${activeId}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (!stop) setBoard(data as AdminSnapshot);
    }
    void tick();
    const id = window.setInterval(() => void tick(), 4000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [activeId, view]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setLoginError(data?.error ?? "Wachtwoord klopt niet.");
      return;
    }
    setAuthed(true);
    setLoginError("");
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
      setNotice(typeof data.notice === "string" && data.notice ? data.notice : action === "hint" ? `Hint verstuurd: ${data.puzzle}` : "");
      if (data.snapshot) setBoard(data.snapshot as AdminSnapshot);
    }
    await refreshList();
  }

  async function createSession(openLive: boolean) {
    setFormError("");
    const minutes = customDuration.trim() ? Number(customDuration) : duration;
    const eventName = client.trim() ? `${name.trim()} — ${client.trim()}` : name.trim();
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventDate ? `${eventName} (${eventDate})` : eventName,
          durationMin: minutes,
          hintPenalty: penaltyOn,
          hintPenaltySec: penaltySec,
          teams,
          mode,
          sector,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.session) {
        setFormError(data?.error ?? "Aanmaken mislukt.");
        return;
      }
      setActiveId(data.session.id);
      setBoard(null);
      await refreshList();
      if (openLive) setView("live");
      else {
        setView("sessions");
        setNotice("Concept bewaard. De spelklok is niet gestart.");
      }
    } catch {
      setFormError("Aanmaken mislukt.");
    }
  }

  async function removeSession(session: Session) {
    if (!window.confirm(`Sessie “${session.name}” verwijderen? Teams, codes en resultaten verdwijnen. Dit kan niet ongedaan.`)) return;
    if (!window.confirm("Tweede bevestiging: de historische resultaten van deze sessie worden gewist.")) return;
    const response = await fetch(`/api/sessions/${session.id}`, { method: "DELETE" });
    if (!response.ok) {
      setNotice("De sessie kon niet worden verwijderd.");
      return;
    }
    if (activeId === session.id) {
      setActiveId(null);
      setBoard(null);
    }
    await refreshList();
  }

  function openSession(id: string, next: View = "live") {
    setActiveId(id);
    setBoard(null);
    setSelectedId(null);
    setView(next);
  }

  async function duplicate(session: Session) {
    const response = await fetch(`/api/sessions/${session.id}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      setNotice("De sessie kon niet worden gekopieerd.");
      return;
    }
    const snapshot = data as AdminSnapshot;
    const created = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${session.name} kopie`,
        durationMin: Math.round(session.durationSec / 60),
        hintPenalty: session.hintPenalty,
        hintPenaltySec: session.hintPenaltySec,
        teams: snapshot.teams.map((team) => team.name),
        mode: session.mode,
        sector: session.sector,
      }),
    });
    const body = await created.json();
    if (!created.ok) {
      setNotice(body.error ?? "Kopiëren mislukt.");
      return;
    }
    setNotice("Kopie klaargezet met nieuwe codes. De spelvoortgang is niet meegenomen.");
    await refreshList();
    openSession(body.session.id, "live");
  }

  async function endSession(id: string) {
    if (!window.confirm("Sessie beëindigen voor alle teams die nog bezig zijn?")) return;
    const response = await fetch(`/api/sessions/${id}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end" }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) setNotice(data?.error ?? "Beëindigen mislukt.");
    else setNotice("Sessie beëindigd.");
    await refreshList();
    if (activeId === id) {
      const snap = await fetch(`/api/sessions/${id}`, { cache: "no-store" });
      if (snap.ok) setBoard(await snap.json());
    }
  }

  async function grant(minutes: number) {
    if (!activeId || !board || timeBusy) return;
    if (!Number.isFinite(minutes) || minutes === 0 || Math.abs(minutes) > 180) {
      setNotice("Vul een aantal minuten in tussen −180 en 180, niet nul.");
      return;
    }
    const target = timeTeam === "all" ? null : board.teams.find((team) => team.id === timeTeam);
    if (timeTeam !== "all" && !target) return;
    const who = target ? target.name : "alle actieve teams";
    const ask = minutes > 0
      ? `Je staat op het punt om ${minutes} minuten toe te voegen aan ${who}. Weet je het zeker?`
      : `Je staat op het punt om ${Math.abs(minutes)} minuten af te trekken van ${who}. De resterende tijd blijft minstens één minuut. Weet je het zeker?`;
    if (!window.confirm(ask)) return;
    if (minutes < 0 && !window.confirm("Dit haalt speeltijd weg. Doorgaan?")) return;
    setTimeBusy(true);
    try {
      await control("adjust", {
        seconds: Math.round(minutes * 60),
        teamId: target?.id,
        requestId: crypto.randomUUID(),
        reason,
      });
      setTimeOpen(null);
      setReason("");
    } finally {
      setTimeBusy(false);
    }
  }

  const filtered = sessions.filter((session) => {
    if (filter !== "all" && session.status !== filter) return false;
    return session.name.toLowerCase().includes(query.trim().toLowerCase());
  });
  const currentSessions = sessions.filter((session) => session.status !== "ended" && freshSession(session));
  const featured = currentSessions.find((session) => session.status === "live" || session.status === "paused") ?? currentSessions[0] ?? null;
  const otherCurrent = currentSessions.filter((session) => session.id !== featured?.id);
  const olderLive = sessions.filter((session) => (session.status === "live" || session.status === "paused") && !freshSession(session)).length;
  const focusIds = new Set(currentSessions.map((session) => session.id));
  const today = counts.filter((item) => focusIds.has(item.sessionId)).reduce((acc, item) => ({
    teams: acc.teams + item.teams,
    playing: acc.playing + item.playing,
    completed: acc.completed + item.completed,
    attention: acc.attention + item.attention,
  }), { teams: 0, playing: 0, completed: 0, attention: 0 });

  if (!ready) return <main className="gcc"><p className="gcc-main">Beheer laden…</p></main>;

  if (!authed) {
    return (
      <main className="gcc" style={{ display: "block" }}>
        <form className="gcc-panel gcc-login" onSubmit={login}>
          <p className="gcc-kicker">Flitz-events</p>
          <h1>Game Control Center</h1>
          <input type="password" name="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Wachtwoord" data-testid="admin-password" />
          {configError && <p>{configError}</p>}
          {loginError && <p>{loginError}</p>}
          {devHint && !configError && <p className="gcc-note">Lokaal ontwikkelwachtwoord: flitz-admin. Zet ADMIN_PASSWORD voor een echt evenement. In productie is er geen standaardwachtwoord.</p>}
          <button className="gcc-btn primary" type="submit" disabled={Boolean(configError)}>Open beheer</button>
        </form>
      </main>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const port = typeof window !== "undefined" && window.location.port ? `:${window.location.port}` : "";
  const lan = board?.lanHosts[0];
  const base = host === "localhost" || host === "127.0.0.1" ? (lan ? `http://${lan}${port}` : origin) : origin;
  const chosenMinutes = customMin.trim() ? Number(customMin) : timePick;

  return (
    <main className="gcc">
      <aside className="gcc-side">
        <div className="gcc-brand">
          <strong>Game Control</strong>
          <span>Escape the Hack 2.0</span>
        </div>
        <nav className="gcc-nav" aria-label="Beheer">
          {NAV.map((item) => (
            <button key={item.id} type="button" className={view === item.id ? "on" : ""} onClick={() => setView(item.id)}>
              <Icon name={item.id} />
              {item.label}
            </button>
          ))}
        </nav>
        <button className="gcc-quit" type="button" onClick={() => void fetch("/api/admin/logout", { method: "POST" }).then(() => setAuthed(false))}>Afmelden</button>
      </aside>
      <section className="gcc-main">
        {notice && <p className="gcc-panel gcc-noprint">{notice}</p>}
        {view === "dashboard" && (
          <>
            <header className="gcc-top">
              <div>
                <p className="gcc-kicker">Vandaag</p>
                <h1>Dashboard</h1>
              </div>
              <div className="gcc-row gcc-noprint">
                <button className="gcc-btn primary" type="button" onClick={() => setView("new")}>Nieuwe sessie</button>
                <button className="gcc-btn" type="button" onClick={() => setView("sessions")}>Alle sessies</button>
              </div>
            </header>
            {featured ? (
              <section className="gcc-hero">
                <article className="gcc-panel gcc-hero-main">
                  <div className="gcc-row" style={{ justifyContent: "space-between" }}>
                    <span className={`gcc-pill ${featured.status === "live" ? "ok" : featured.status === "paused" ? "warn" : "wait"}`}><i />{statusLabel(featured.status)}</span>
                    <span className="gcc-note">{modeLabel(featured.mode)} · {sectorLabel(featured.sector)} · {Math.round(featured.durationSec / 60)} min</span>
                  </div>
                  <h2>{featured.name}</h2>
                  <p>{progressLine(rollup.get(featured.id), featured.status)}</p>
                  <div className="gcc-bar" aria-hidden="true">
                    <span className="done" style={{ width: `${Math.round(((rollup.get(featured.id)?.completed ?? 0) / Math.max(1, rollup.get(featured.id)?.teams ?? 1)) * 100)}%` }} />
                    <span className="play" style={{ width: `${Math.round(((rollup.get(featured.id)?.playing ?? 0) / Math.max(1, rollup.get(featured.id)?.teams ?? 1)) * 100)}%` }} />
                  </div>
                  <div className="gcc-row">
                    <button className="gcc-btn primary" type="button" onClick={() => openSession(featured.id)}>Open live beheer</button>
                    <button className="gcc-btn" type="button" onClick={() => openSession(featured.id, "results")}>Resultaten</button>
                    {featured.status === "draft" && <button className="gcc-btn" type="button" onClick={() => openSession(featured.id, "teams")}>Teams</button>}
                  </div>
                </article>
                <div className="gcc-stats">
                  <article className="gcc-card"><small>Evenementen vandaag</small><strong>{currentSessions.length}</strong></article>
                  <article className="gcc-card"><small>Teams</small><strong>{today.teams}</strong></article>
                  <article className="gcc-card"><small>Bezig</small><strong>{today.playing}</strong></article>
                  <article className={`gcc-card${today.attention > 0 ? " warn" : ""}`}><small>Zonder voortgang</small><strong>{today.attention}</strong></article>
                </div>
              </section>
            ) : (
              <section className="gcc-panel gcc-hero-main">
                <p className="gcc-kicker">Geen lopend evenement</p>
                <h2>Klaar voor het volgende gezelschap</h2>
                <p className="gcc-note">Sessies van eerder vandaag of ouder blijven bewaard bij Speelsessies. Ze vullen dit scherm niet.</p>
                <button className="gcc-btn primary" type="button" onClick={() => setView("new")}>Nieuwe sessie</button>
              </section>
            )}
            {otherCurrent.length > 0 && (
              <section className="gcc-panel">
                <h2>Ook vandaag</h2>
                <div className="gcc-dash-list">
                  {otherCurrent.slice(0, 5).map((session) => (
                    <div key={session.id} className="gcc-dash-row">
                      <div>
                        <strong>{session.name}</strong>
                        <small className="gcc-note">{progressLine(rollup.get(session.id), session.status)}</small>
                      </div>
                      <span className={`gcc-pill ${session.status === "live" ? "ok" : session.status === "paused" ? "warn" : "wait"}`}><i />{statusLabel(session.status)}</span>
                      <button className="gcc-btn" type="button" onClick={() => openSession(session.id)}>Openen</button>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {olderLive > 0 && (
              <button className="gcc-btn" type="button" onClick={() => { setFilter("live"); setView("sessions"); }}>
                {olderLive} oudere live {olderLive === 1 ? "sessie" : "sessies"} bekijken
              </button>
            )}
          </>
        )}

        {view === "sessions" && (
          <>
            <header className="gcc-top"><div><p className="gcc-kicker">Sessies</p><h1>Speelsessies</h1></div></header>
            <div className="gcc-row">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek op evenement" aria-label="Zoek op evenement" />
              <div className="gcc-filters">
                {([["all", "Alle"], ["draft", "Concept / klaargezet"], ["live", "Live"], ["paused", "Gepauzeerd"], ["ended", "Beëindigd"]] as const).map(([id, label]) => (
                  <button key={id} className={`gcc-btn${filter === id ? " on" : ""}`} type="button" onClick={() => setFilter(id)}>{label}</button>
                ))}
              </div>
            </div>
            <div className="gcc-grid">
              {filtered.map((session) => (
                <article key={session.id} className="gcc-panel">
                  <h2>{session.name}</h2>
                  <p className="gcc-note">{modeLabel(session.mode)} · {sectorLabel(session.sector)} · {statusLabel(session.status)} · {Math.round(session.durationSec / 60)} min · {rollup.get(session.id)?.teams ?? 0} teams</p>
                  <div className="gcc-row">
                    <button className="gcc-btn primary" type="button" onClick={() => openSession(session.id)}>Openen</button>
                    {session.status === "draft" && <button className="gcc-btn" type="button" onClick={() => openSession(session.id, "live")}>Bewerken</button>}
                    <button className="gcc-btn" type="button" onClick={() => void duplicate(session)}>Dupliceren</button>
                    <button className="gcc-btn" type="button" onClick={() => openSession(session.id, "results")}>Resultaten</button>
                    <a className="gcc-btn" href={`/api/sessions/${session.id}/export`}>Exporteren</a>
                    {session.status !== "ended" && <button className="gcc-btn warn" type="button" onClick={() => void endSession(session.id)}>Beëindigen</button>}
                    <button className="gcc-btn bad" type="button" onClick={() => void removeSession(session)}>Verwijderen</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {view === "new" && (
          <>
            <header className="gcc-top"><div><p className="gcc-kicker">Voorbereiden</p><h1>Nieuwe sessie</h1></div></header>
            <div className="gcc-steps">
              {["Evenement", "Spelinstellingen", "Teams", "Controle"].map((label, index) => (
                <span key={label} className={step === index + 1 ? "on" : ""}>{index + 1}. {label}</span>
              ))}
            </div>
            {step === 1 && (
              <section className="gcc-panel">
                <label>Naam evenement<input value={name} onChange={(event) => setName(event.target.value)} /></label>
                <label>Naam opdrachtgever, optioneel<input value={client} onChange={(event) => setClient(event.target.value)} /></label>
                <label>Datum<input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} /></label>
                <div className="gcc-row">
                  {(["escape", "awareness", "nis2"] as GameMode[]).map((item) => (
                    <button key={item} className={`gcc-btn${mode === item ? " primary" : ""}`} type="button" onClick={() => setMode(item)}>{modeLabel(item)}</button>
                  ))}
                </div>
                <p>{MODE_PLAN[mode]}</p>
              </section>
            )}
            {step === 2 && (
              <section className="gcc-panel">
                <div className="gcc-row">
                  {[30, 45, 60, 75, 90].map((minutes) => (
                    <button key={minutes} className={`gcc-btn${duration === minutes && !customDuration ? " primary" : ""}`} type="button" onClick={() => { setDuration(minutes); setCustomDuration(""); }}>{minutes} min</button>
                  ))}
                </div>
                <label>Aangepaste speelduur in minuten<input type="number" min={10} max={180} value={customDuration} onChange={(event) => setCustomDuration(event.target.value)} placeholder="Bijvoorbeeld 50" /></label>
                <div className="gcc-row">
                  {SECTORS.map((item) => (
                    <button key={item.id} className={`gcc-btn${sector === item.id ? " primary" : ""}`} type="button" onClick={() => setSector(item.id)}>{item.label}</button>
                  ))}
                </div>
                <p>{SECTOR_PLAN[sector]}</p>
                <button className="gcc-btn" type="button" onClick={() => setPenaltyOn((value) => !value)}>Hintstraffen: {penaltyOn ? "aan" : "uit"}</button>
                <label>Strafseconden per hint<input type="number" min={0} max={300} value={penaltySec} onChange={(event) => setPenaltySec(Number(event.target.value))} /></label>
                <p className="gcc-note">Gekozen: {customDuration || duration} minuten, {sectorLabel(sector)}, hints {penaltyOn ? `${penaltySec} seconden` : "uit"}.</p>
              </section>
            )}
            {step === 3 && (
              <section className="gcc-panel">
                {teams.map((team, index) => (
                  <div key={index} className="gcc-row">
                    <input aria-label={`Team ${index + 1}`} value={team} onChange={(event) => setTeams(teams.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
                    <button className="gcc-btn" type="button" onClick={() => setTeams(teams.filter((_, itemIndex) => itemIndex !== index))}>Verwijderen</button>
                  </div>
                ))}
                <div className="gcc-row">
                  <button className="gcc-btn" type="button" onClick={() => setTeams([...teams, `Team ${teams.length + 1}`])}>Team toevoegen</button>
                  <button className="gcc-btn" type="button" onClick={() => setTeams(Array.from({ length: 10 }, (_, index) => `Team ${index + 1}`))}>Maak automatisch 10 teams aan</button>
                </div>
                <p className="gcc-note">Teamcodes en QR-codes worden gemaakt bij het klaarzetten en staan daarna in de lobby. De spelklok start dan nog niet.</p>
              </section>
            )}
            {step === 4 && (
              <section className="gcc-panel">
                <h2>{client.trim() ? `${name} — ${client.trim()}` : name}</h2>
                <p>{modeLabel(mode)} · {sectorLabel(sector)} · {customDuration || duration} minuten</p>
                <p>Hints: {penaltyOn ? `${penaltySec} seconden per hint` : "uit"}{eventDate ? ` · ${eventDate}` : ""}</p>
                <p>{MODE_PLAN[mode]}</p>
                <ul>{teams.filter(Boolean).map((team) => <li key={team}>{team}</li>)}</ul>
                {formError && <p>{formError}</p>}
              </section>
            )}
            <div className="gcc-row">
              {step > 1 && <button className="gcc-btn" type="button" onClick={() => setStep(step - 1)}>Terug</button>}
              {step < 4 && <button className="gcc-btn primary" type="button" onClick={() => setStep(step + 1)}>Volgende</button>}
              {step === 4 && <button className="gcc-btn" type="button" onClick={() => void createSession(false)}>Opslaan als concept</button>}
              {step === 4 && <button className="gcc-btn primary" type="button" onClick={() => void createSession(true)}>Sessie klaarzetten</button>}
            </div>
          </>
        )}

        {view === "live" && <LiveDesk board={activeId ? board : null} base={base} selected={selected} timeOpen={timeOpen} timeTeam={timeTeam} timePick={timePick} customMin={customMin} reason={reason} timeBusy={timeBusy} chosenMinutes={chosenMinutes} onSelect={setSelectedId} onTimeOpen={setTimeOpen} onTimeTeam={setTimeTeam} onTimePick={setTimePick} onCustom={setCustomMin} onReason={setReason} onGrant={() => void grant(timeOpen === "cut" ? -Math.abs(chosenMinutes) : Math.abs(chosenMinutes))} onControl={(action, extra) => void control(action, extra)} onRetune={(fields) => void control("retune", fields)} />}
        {view === "teams" && <TeamDesk board={activeId ? board : null} base={base} draft={board?.session.status === "draft"} newTeam={newTeam} onNewTeam={setNewTeam} onAdd={() => { if (newTeam.trim()) void control("add-team", { name: newTeam.trim() }).then(() => setNewTeam("")); }} onOpen={(id) => { setSelectedId(id); setView("live"); }} onRename={(id, teamName) => void control("rename", { teamId: id, name: teamName })} onRemove={(team) => { if (window.confirm(`${team.name} verwijderen? Alleen een team zonder spelvoortgang kan weg.`)) void control("remove-team", { teamId: team.id }); }} onTime={(id) => { setSelectedId(id); setTimeTeam(id); setTimeOpen("add"); setView("live"); }} />}
        {view === "test" && (
          <section className="gcc-panel">
            <p className="gcc-kicker">Testcentrum</p>
            <h1>Demo, los van het evenement</h1>
            <div className="gcc-alert">Dit zet alleen het demoteam met code DEMO terug. Een echte speelsessie en de teams daarvan blijven onaangeroerd. In productie blijft de demo-API dicht, tenzij die apart is aangezet.</div>
            <DemoJumps always />
          </section>
        )}
        {view === "board" && (
          <section className="gcc-panel">
            <div className="gcc-row" style={{ justifyContent: "space-between" }}>
              <h1>Klassement</h1>
              <button className="gcc-btn primary" type="button" disabled={!activeId} onClick={() => setResultsView("stage")}>Presentatie</button>
            </div>
            <p className="gcc-note">Alleen teams uit deze sessie. Gelijke score: hoogste score eerst, daarna teamnaam van A tot Z. Geslaagd betekent dat alle missies zijn afgerond.</p>
            <table className="gcc-table">
              <thead><tr><th>Positie</th><th>Team</th><th>Score</th><th>Missie</th><th>Opgelost</th><th>Tijd</th><th>Hints</th><th>Status</th></tr></thead>
              <tbody>
                {(activeId ? board?.teams ?? [] : []).map((team) => {
                  const state = teamTone(board?.session.status ?? "draft", team);
                  return (
                    <tr key={team.id}>
                      <td>{team.rank}</td>
                      <td>{team.name}</td>
                      <td>{team.score}</td>
                      <td>{team.chapter}</td>
                      <td>{team.solved}/{team.total}</td>
                      <td className="mono">{clock(team.remainingSec)}</td>
                      <td>{team.hints}</td>
                      <td><span className={`gcc-pill ${state.tone}`}><i />{state.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}
        {view === "results" && (
          <section>
            <header className="gcc-top"><div><p className="gcc-kicker">Na afloop</p><h1>Resultaten</h1></div></header>
            <p className="gcc-note">Geslaagd blijft de bestaande regel: het team heeft alle missies afgerond. Er is geen scoregrens. Deelnemersaantallen worden niet bewaard.</p>
            {activeId && (
              <div className="gcc-row gcc-noprint">
                <button className="gcc-btn" type="button" onClick={() => setResultsView("report")}>Managementrapport</button>
                <button className="gcc-btn" type="button" onClick={() => setResultsView("stage")}>Klassement presenteren</button>
                <a className="gcc-btn" href={`/api/sessions/${activeId}/report?format=csv`}>Scores als CSV</a>
                <a className="gcc-btn" href={`/api/sessions/${activeId}/export`}>Ruwe export</a>
              </div>
            )}
            <div className="gcc-grid">
              {(activeId ? board?.teams ?? [] : []).map((team) => (
                <article key={team.id} className="gcc-panel">
                  <h2>{team.name}</h2>
                  <p>{team.score} pt · {team.status === "completed" ? "Geslaagd" : team.status === "failed" ? "Niet geslaagd" : "Nog bezig"}</p>
                  <button className="gcc-btn" type="button" onClick={() => setPlayerCode(team.code)}>Teamrapport</button>
                </article>
              ))}
            </div>
            {activeId && resultsView === "report" && <AdminResults sessionId={activeId} view="report" onClose={() => setResultsView(null)} />}
          </section>
        )}
        {view === "settings" && (
          <section className="gcc-panel">
            <h1>Instellingen</h1>
            <p>Beheer vraagt om het wachtwoord uit de omgeving. In productie is er geen standaardwachtwoord en wordt dat wachtwoord hier niet getoond.</p>
            <p>Pauze geldt voor de hele sessie. Een team apart pauzeren zou de gedeelde klok uit elkaar halen, daarom blijft pauze een sessieactie.</p>
            <p>Het live scherm ververst de open sessie elke 4 seconden. Het dashboard ververst de sessielijst elke 8 seconden.</p>
            <a className="gcc-btn" href="/">Spelersscherm</a>
          </section>
        )}
        {resultsView === "stage" && activeId && <AdminResults sessionId={activeId} view="stage" onClose={() => setResultsView(null)} />}
        {playerCode && <PlayerResults code={playerCode} onClose={() => setPlayerCode(null)} />}
      </section>
    </main>
  );
}

function HintGift({ team, onControl }: { team: AdminTeam; onControl: (action: string, extra?: Record<string, unknown>) => void }) {
  const open = team.hintsOpen ?? [];
  const [puzzleId, setPuzzleId] = useState(open[0]?.id ?? "");
  const [text, setText] = useState("");
  const puzzle = open.find((item) => item.id === puzzleId) ?? open[0];
  if (!puzzle) return <p>Geen open opdracht. Een extra hint kan zodra dit team speelt.</p>;
  const nextLevel = puzzle.level + 1;
  return (
    <div>
      <h3>Extra hint</h3>
      <label>Opdracht
        <select value={puzzle.id} onChange={(event) => setPuzzleId(event.target.value)}>
          {open.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.level}/3</option>)}
        </select>
      </label>
      {puzzle.next ? (
        <>
          <p className="gcc-note">{puzzle.next}</p>
          <button
            className="gcc-btn primary"
            type="button"
            onClick={() => {
              if (window.confirm(`Hint ${nextLevel} van 3 naar ${team.name}? Geen tijdstraf.\n\n${puzzle.next}`)) {
                onControl("hint", { teamId: team.id, puzzleId: puzzle.id });
              }
            }}
          >
            Stuur hint {nextLevel}/3
          </button>
        </>
      ) : (
        <>
          <p>De drie hints zijn gebruikt en dit team zit nog vast. Deze extra hint kost geen tijd.</p>
          {puzzle.rescue && <p className="gcc-note">{puzzle.rescue}</p>}
          <button
            className="gcc-btn primary"
            type="button"
            disabled={!puzzle.rescue || (puzzle.coach ?? []).includes(puzzle.rescue)}
            onClick={() => {
              if (!puzzle.rescue) return;
              if (window.confirm(`Extra hint naar ${team.name}? Geen tijdstraf.\n\n${puzzle.rescue}`)) {
                onControl("coach", { teamId: team.id, puzzleId: puzzle.id, text: puzzle.rescue });
              }
            }}
          >
            {(puzzle.coach ?? []).includes(puzzle.rescue ?? "") ? "Extra hint is verstuurd" : "Stuur extra hint"}
          </button>
        </>
      )}
      {(puzzle.coach ?? []).map((line) => <p key={line} className="gcc-note">Al verstuurd: {line}</p>)}
      <label>Eigen extra hint
        <textarea maxLength={180} value={text} onChange={(event) => setText(event.target.value)} placeholder="Korte aanwijzing, zonder het antwoord" />
      </label>
      <button
        className="gcc-btn"
        type="button"
        disabled={text.trim().length < 3}
        onClick={() => {
          const line = text.trim().slice(0, 180);
          if (window.confirm(`Eigen extra hint naar ${team.name}? Geen tijdstraf.\n\n${line}`)) {
            onControl("coach", { teamId: team.id, puzzleId: puzzle.id, text: line });
            setText("");
          }
        }}
      >
        Eigen extra hint
      </button>
    </div>
  );
}

function LiveDesk({
  board, base, selected, timeOpen, timeTeam, timePick, customMin, reason, timeBusy, chosenMinutes,
  onSelect, onTimeOpen, onTimeTeam, onTimePick, onCustom, onReason, onGrant, onControl, onRetune,
}: {
  board: AdminSnapshot | null;
  base: string;
  selected: AdminTeam | null;
  timeOpen: null | "add" | "cut";
  timeTeam: string;
  timePick: number;
  customMin: string;
  reason: string;
  timeBusy: boolean;
  chosenMinutes: number;
  onSelect: (id: string) => void;
  onTimeOpen: (value: null | "add" | "cut") => void;
  onTimeTeam: (value: string) => void;
  onTimePick: (value: number) => void;
  onCustom: (value: string) => void;
  onReason: (value: string) => void;
  onGrant: () => void;
  onControl: (action: string, extra?: Record<string, unknown>) => void;
  onRetune: (fields: Record<string, unknown>) => void;
}) {
  if (!board) return <section className="gcc-panel"><h1>Live spelbeheer</h1><p>Open een sessie via het dashboard. Het teamoverzicht verschijnt hier.</p></section>;
  const pausedAt = board.session.status === "paused" && board.session.pauseStartedAt ? new Date(board.session.pauseStartedAt).toLocaleTimeString("nl-NL") : null;
  return (
    <>
      <header className="gcc-top">
        <div>
          <p className="gcc-kicker">{statusLabel(board.session.status)}</p>
          <h1>{board.session.name}</h1>
          <p className="gcc-note">{modeLabel(board.session.mode)} · {sectorLabel(board.session.sector)} · {Math.round(board.session.durationSec / 60)} min</p>
        </div>
        <div className="gcc-row gcc-noprint">
          {board.session.status === "draft" && <button className="gcc-btn ok" type="button" data-testid="start-session" onClick={() => onControl("start")}>Iedereen starten</button>}
          {board.session.mode !== "escape" && <button className="gcc-btn" type="button" onClick={() => onControl("skip-prologue")}>Proloog overslaan</button>}
          {board.session.status === "live" && <button className="gcc-btn warn" type="button" onClick={() => onControl("pause")}>Pauzeer sessie</button>}
          {board.session.status === "paused" && <button className="gcc-btn ok" type="button" onClick={() => onControl("resume")}>Hervat sessie</button>}
          <button className="gcc-btn primary" type="button" onClick={() => onTimeOpen("add")}>+ Tijd toevoegen</button>
          <button className="gcc-btn" type="button" onClick={() => onTimeOpen("cut")}>Tijd verminderen</button>
          <button className="gcc-btn bad" type="button" onClick={() => { if (window.confirm("Sessie beëindigen voor alle teams die nog bezig zijn?")) onControl("end"); }}>Beëindigen</button>
        </div>
      </header>
      {pausedAt && <p className="gcc-alert">Sessie gepauzeerd sinds {pausedAt}. De klokken staan stil voor iedereen.</p>}
      {timeOpen && (
        <section className="gcc-panel gcc-noprint">
          <h2>{timeOpen === "add" ? "Tijd toevoegen" : "Tijd verminderen"}</h2>
          <div className="gcc-row">
            {[1, 5, 10, 15].map((minutes) => (
              <button key={minutes} className={`gcc-btn${timePick === minutes && !customMin ? " primary" : ""}`} type="button" onClick={() => { onTimePick(minutes); onCustom(""); }}>+{minutes} min</button>
            ))}
            <input type="number" min={1} max={180} value={customMin} onChange={(event) => onCustom(event.target.value)} placeholder="Ander aantal" aria-label="Ander aantal minuten" />
          </div>
          <label>Voor
            <select value={timeTeam} onChange={(event) => onTimeTeam(event.target.value)}>
              <option value="all">Alle actieve teams</option>
              {board.teams.map((team) => <option key={team.id} value={team.id}>{team.name} · {clock(team.remainingSec)}</option>)}
            </select>
          </label>
          <label>Reden, optioneel<input value={reason} onChange={(event) => onReason(event.target.value)} /></label>
          <button className="gcc-btn primary" type="button" disabled={timeBusy || board.session.status === "ended"} onClick={onGrant}>
            {timeBusy ? "Bezig…" : `${Math.abs(chosenMinutes) || "…"} minuten ${timeOpen === "add" ? "toevoegen" : "aftrekken"}`}
          </button>
        </section>
      )}
      {board.session.status === "draft" && (
        <DraftTune session={board.session} onSave={onRetune} />
      )}
      <div className="gcc-live">
        <div className="gcc-grid">
          {board.teams.map((team) => {
            const state = teamTone(board.session.status, team);
            return (
              <button key={team.id} className="gcc-panel gcc-team gcc-print" type="button" onClick={() => onSelect(team.id)}>
                <span>
                  <strong>{team.name}</strong>
                  <small><span className={`gcc-pill ${state.tone}`}><i />{state.label}</span></small>
                  <small>{state.link}</small>
                  <small>Missie {team.chapter} · {team.solved}/{team.total} opgelost · {team.score} pt</small>
                  <small className="mono">Resterend {clock(team.remainingSec)} · hints {team.hints}{team.hintsOpen?.some((item) => item.level >= 3 && item.rescue && !item.coach.includes(item.rescue)) ? " · vast, extra hint mogelijk" : ""}{team.extraSec ? ` · extra ${clock(team.extraSec)}` : ""}</small>
                </span>
                <Qr value={`${base}/play/${team.code}`} />
              </button>
            );
          })}
        </div>
        <aside className="gcc-panel gcc-detail">
          {selected ? (
            <>
              <h2>{selected.name}</h2>
              <p className="mono">{selected.code}</p>
              <p>{teamTone(board.session.status, selected).label} · {teamTone(board.session.status, selected).link}</p>
              <p>Missie {selected.chapter}: {selected.currentPuzzle ?? "geen open opdracht"}</p>
              <p>{selected.solved}/{selected.total} opgelost · {selected.score} pt · plek {selected.rank}</p>
              <p>Hints {selected.hints} · instructeur {selected.instructorHints} · straf {selected.penaltySec}s</p>
              <p className="mono">Resterend {clock(selected.remainingSec)}</p>
              <div className="gcc-row">
                <button className="gcc-btn" type="button" onClick={() => { onTimeTeam(selected.id); onTimeOpen("add"); }}>+ Tijd</button>
                <button className="gcc-btn" type="button" onClick={() => void navigator.clipboard.writeText(`${base}/play/${selected.code}`)}>Link kopiëren</button>
                <button className="gcc-btn" type="button" onClick={() => void navigator.clipboard.writeText(selected.code)}>Code kopiëren</button>
                <button className="gcc-btn" type="button" onClick={() => window.print()}>QR printen</button>
              </div>
              <HintGift key={selected.id} team={selected} onControl={onControl} />
            </>
          ) : <p>Kies een team voor details, hints en een tijdcorrectie.</p>}
          <h3>Logboek</h3>
          {board.timeLog.length === 0 ? <p className="gcc-note">Nog geen tijdswijziging.</p> : board.timeLog.map((row) => (
            <p key={row.id}>{new Date(row.createdAt).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "medium" })} · {row.actor} · {row.targets} · {row.seconds > 0 ? "+" : ""}{row.seconds / 60} min{row.reason ? ` · ${row.reason}` : ""}</p>
          ))}
        </aside>
      </div>
    </>
  );
}

function DraftTune({ session, onSave }: { session: AdminSnapshot["session"]; onSave: (fields: Record<string, unknown>) => void }) {
  const [title, setTitle] = useState(session.name);
  const [minutes, setMinutes] = useState(Math.round(session.durationSec / 60));
  const [penalty, setPenalty] = useState(session.hintPenaltySec);
  return (
    <section className="gcc-panel gcc-noprint">
      <h2>Sessie nog niet gestart</h2>
      <div className="gcc-row">
        <input aria-label="Evenementnaam" value={title} onChange={(event) => setTitle(event.target.value)} />
        <input aria-label="Speelduur" type="number" min={10} max={180} value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} />
        <input aria-label="Strafseconden" type="number" min={0} max={300} value={penalty} onChange={(event) => setPenalty(Number(event.target.value))} />
        <button className="gcc-btn" type="button" onClick={() => onSave({ name: title, durationMin: minutes, hintPenalty: session.hintPenalty, hintPenaltySec: penalty, mode: session.mode, sector: session.sector })}>Instellingen bewaren</button>
      </div>
    </section>
  );
}

function TeamDesk({
  board, base, draft, newTeam, onNewTeam, onAdd, onOpen, onRename, onRemove, onTime,
}: {
  board: AdminSnapshot | null;
  base: string;
  draft: boolean;
  newTeam: string;
  onNewTeam: (value: string) => void;
  onAdd: () => void;
  onOpen: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (team: AdminTeam) => void;
  onTime: (id: string) => void;
}) {
  if (!board) return <section className="gcc-panel"><h1>Teams</h1><p>Open eerst een sessie.</p></section>;
  return (
    <>
      <header className="gcc-top"><div><p className="gcc-kicker">{board.session.name}</p><h1>Teams</h1></div></header>
      {draft && (
        <form className="gcc-row" onSubmit={(event) => { event.preventDefault(); onAdd(); }}>
          <input value={newTeam} onChange={(event) => onNewTeam(event.target.value)} placeholder="Nieuw team" aria-label="Nieuw team" />
          <button className="gcc-btn primary" type="submit">Team toevoegen</button>
        </form>
      )}
      <div className="gcc-grid">
        {board.teams.map((team) => {
          const state = teamTone(board.session.status, team);
          return (
            <article key={team.id} className="gcc-panel gcc-print">
              <h2>{team.name}</h2>
              <p className="mono">{team.code}</p>
              <p><span className={`gcc-pill ${state.tone}`}><i />{state.label}</span> {state.link}</p>
              <p>{team.solved}/{team.total} · {team.score} pt · {clock(team.remainingSec)}</p>
              <Qr value={`${base}/play/${team.code}`} />
              <div className="gcc-row">
                <button className="gcc-btn" type="button" onClick={() => {
                  const next = window.prompt("Nieuwe teamnaam", team.name);
                  if (next && next.trim()) onRename(team.id, next.trim());
                }}>Naam wijzigen</button>
                <button className="gcc-btn" type="button" onClick={() => void navigator.clipboard.writeText(team.code)}>Code kopiëren</button>
                <button className="gcc-btn" type="button" onClick={() => window.print()}>QR printen</button>
                <button className="gcc-btn" type="button" onClick={() => onOpen(team.id)}>Details</button>
                <button className="gcc-btn" type="button" onClick={() => onTime(team.id)}>Tijd aanpassen</button>
                <button className="gcc-btn bad" type="button" onClick={() => onRemove(team)}>Verwijderen</button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
