"use client";

import { useState } from "react";
import { formatClock, type Advice, type BoardRow, type MissionCard, type SessionReport, type TeamReport } from "@/lib/game/results";
import "./desk.css";

type Tab = "result" | "missions" | "advice" | "board" | "manage";

function tone(outcome: string) {
  if (outcome === "geslaagd") return "ok";
  if (outcome === "niet geslaagd") return "bad";
  return "wait";
}

function MissionGrid({ missions }: { missions: MissionCard[] }) {
  return (
    <div className="rs-missions">
      {missions.map((mission) => (
        <article key={mission.id} className="rs-card">
          <small>{mission.id}. {mission.theme}</small>
          <strong>{mission.title}</strong>
          <span className={`rs-chip ${tone(mission.state === "afgerond" ? "geslaagd" : mission.state === "open gebleven" ? "niet geslaagd" : "bezig")}`}>{mission.state}</span>
          <p>Opdrachten: {mission.solved} van {mission.total}</p>
          <p>Hints van het team: {mission.hints}</p>
          <p>Instructeurhints: {mission.instructorHints}</p>
          <p className="rs-muted">{mission.timeNote}</p>
          <p className="rs-muted">{mission.decisionNote}</p>
          {mission.signals.map((line) => <p key={line}>{line}</p>)}
          {mission.good.length > 0 && <ul className="rs-good">{mission.good.map((line) => <li key={line}>{line}</li>)}</ul>}
          {mission.improve.length > 0 && <ul className="rs-bad">{mission.improve.map((line) => <li key={line}>{line}</li>)}</ul>}
          {mission.good.length === 0 && mission.improve.length === 0 && <p className="rs-muted">Nog geen vastgelegde handeling in deze missie.</p>}
        </article>
      ))}
    </div>
  );
}

function AdviceList({ items }: { items: Advice[] }) {
  return (
    <div className="rs-advice">
      {items.map((item) => (
        <article key={item.id} className="rs-card">
          <span className={`rs-chip ${item.kind === "gemeten" ? "bad" : "wait"}`}>{item.kind === "gemeten" ? "Gemeten" : "Algemene aanbeveling"}</span>
          <strong>{item.topic}</strong>
          <p>{item.why}</p>
          <p><b>Aanleiding.</b> {item.trigger}</p>
          <p><b>Voortaan.</b> {item.change}</p>
          <p><b>Oefening.</b> {item.exercise}</p>
        </article>
      ))}
    </div>
  );
}

function Standing({ rows, winner }: { rows: Omit<BoardRow, "code">[]; winner: boolean }) {
  return (
    <div className="rs-board">
      {rows.map((row) => (
        <article key={`${row.rank}-${row.name}`} className={`rs-line${winner && row.rank === 1 ? " win" : ""}`}>
          <b>#{row.rank}</b>
          <div>
            <strong>{row.name}</strong>
            <span className={`rs-chip ${tone(row.outcome)}`}>{row.outcome}</span>
            {row.tiedScore && <span className="rs-chip">Gelijke score</span>}
          </div>
          <div className="rs-score" style={{ fontSize: 28 }}>{row.score}</div>
          <div className="rs-meta">
            <span>Missies {row.missionsDone}/6</span>
            <span>Opdrachten {row.solved}/{row.total}</span>
            <span>Hints {row.hints}</span>
            <span>Tijd {formatClock(row.elapsedSec)}</span>
            <span>Rest {formatClock(row.remainingSec)}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function TeamResult({ team, passRule, tieRule, disclaimer, modeNote, legalNote, tab: controlled, onTab }: {
  team: Omit<TeamReport, "code">;
  passRule: string;
  tieRule: string;
  disclaimer: string;
  modeNote: string;
  legalNote: string | null;
  tab?: Tab;
  onTab?: (tab: Tab) => void;
}) {
  const [local, setLocal] = useState<Tab>("result");
  const tab = controlled ?? local;
  const setTab = onTab ?? setLocal;
  const tabs: { id: Tab; label: string }[] = [
    { id: "result", label: "Resultaat" },
    { id: "missions", label: "Missies" },
    { id: "advice", label: "Leeradvies" },
  ];
  return (
    <>
      <header className="rs-card">
        <p className="rs-kicker">Eindresultaat</p>
        <div className="rs-top">
          <h1>{team.name}</h1>
          <span className={`rs-badge ${tone(team.outcome)}`}>{team.outcome}</span>
        </div>
        <div className="rs-score">{team.score} pt</div>
        <p className="rs-muted">{modeNote}</p>
      </header>
      <nav className="rs-tabs rs-noprint" aria-label="Resultaten">
        {tabs.map((item) => (
          <button key={item.id} type="button" aria-selected={tab === item.id} onClick={() => setTab(item.id)}>{item.label}</button>
        ))}
        {onTab && <button type="button" aria-selected={tab === "board"} onClick={() => setTab("board")}>Klassement</button>}
      </nav>
      <section className={`rs-panel${tab === "result" ? " on" : ""}`}>
        <div className="rs-stats">
          <div className="rs-card"><small>Speeltijd</small><strong>{formatClock(team.elapsedSec)}</strong></div>
          <div className="rs-card"><small>Resterende tijd</small><strong>{formatClock(team.remainingSec)}</strong></div>
          <div className="rs-card"><small>Hints</small><strong>{team.hints}</strong><small>Instructeur {team.instructorHints}</small></div>
          <div className="rs-card"><small>Afgekeurde pogingen</small><strong>{team.fails}</strong><small>Niet per opdracht bewaard</small></div>
          <div className="rs-card"><small>Valse mail</small><strong>{team.phish}</strong></div>
          <div className="rs-card"><small>Missies</small><strong>{team.missionsDone}/6</strong><small>{team.solved}/{team.total} opdrachten</small></div>
        </div>
        <article className="rs-note">
          <h2>Belangrijkste prestaties</h2>
          {team.strengths.length > 0 ? <ul className="rs-good">{team.strengths.map((line) => <li key={line}>{line}</li>)}</ul> : <p>Nog geen afgeronde prestatie in het verslag.</p>}
        </article>
        <article className="rs-note">
          <h2>Verbeterpunten</h2>
          {team.improvements.length > 0 ? <ul className="rs-bad">{team.improvements.map((line) => <li key={line}>{line}</li>)}</ul> : <p>Geen gemeten verbeterpunt in de bewaarde gegevens.</p>}
        </article>
        <p className="rs-muted">{passRule}</p>
      </section>
      <section className={`rs-panel${tab === "missions" ? " on" : ""}`}>
        <MissionGrid missions={team.missions} />
      </section>
      <section className={`rs-panel${tab === "advice" ? " on" : ""}`}>
        <AdviceList items={team.advice} />
        <p className="rs-muted">{disclaimer}</p>
        {legalNote && <p className="rs-muted">{legalNote}</p>}
        <p className="rs-muted">{tieRule}</p>
      </section>
    </>
  );
}

export function PlayerBoard({ report, onClose }: { report: import("@/lib/game/results").PlayerReport; onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>("result");
  const done = report.leaderboard.length > 0 && report.leaderboard.every((row) => row.outcome === "geslaagd" || row.outcome === "niet geslaagd");
  function pdf() { window.print(); }
  function csv() {
    const header = ["positie", "team", "resultaat", "score", "missies", "hints", "crisistijd_sec"];
    const lines = [header.join(",")];
    for (const row of report.leaderboard) {
      lines.push([row.rank, `"${row.name.replaceAll('"', '""')}"`, row.outcome, row.score, row.missionsDone, row.hints, row.elapsedSec].join(","));
    }
    const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.team.name}-klassement.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="rs">
      <div className="rs-wrap">
        <div className="rs-row rs-noprint">
          <p className="rs-kicker">{report.sessionName}</p>
          <div className="rs-tabs">
            <button type="button" className="rs-go" onClick={pdf}>PDF</button>
            <button type="button" className="rs-go" onClick={csv}>CSV</button>
            {onClose && <button type="button" className="rs-go" onClick={onClose}>Terug naar het rapport</button>}
          </div>
        </div>
        <TeamResult team={report.team} passRule={report.passRule} tieRule={report.tieRule} disclaimer={report.disclaimer} modeNote={report.modeNote} legalNote={report.legalNote} tab={tab} onTab={setTab} />
        <section className={`rs-panel${tab === "board" ? " on" : ""}`}>
          <article className="rs-note">
            <h2>{done ? "Klassement" : "Tussenstand"}</h2>
            <p className="rs-muted">{report.tieRule}</p>
          </article>
          <Standing rows={report.leaderboard} winner={done} />
        </section>
      </div>
    </div>
  );
}

export function ManageBoard({ report }: { report: SessionReport }) {
  const [tab, setTab] = useState<Tab>("manage");
  const [focus, setFocus] = useState(report.teams[0]?.name ?? "");
  const team = report.teams.find((item) => item.name === focus) ?? report.teams[0];
  const max = report.highestScore || 1;
  const done = report.counts.playing === 0 && report.counts.ready === 0 && report.counts.teams > 0;
  return (
    <div className="rs">
      <div className="rs-wrap">
        <header className="rs-card">
          <p className="rs-kicker">Managementrapport · {report.session.name}</p>
          <h1>{report.session.mode === "nis2" ? "NIS2-training" : report.session.mode === "awareness" ? "Cyber Awareness" : "Escape Room"}</h1>
          <p>{report.modeNote}</p>
          <p className="rs-muted">{report.disclaimer}</p>
        </header>
        <nav className="rs-tabs rs-noprint" aria-label="Organisator">
          <button type="button" aria-selected={tab === "manage"} onClick={() => setTab("manage")}>Overzicht</button>
          <button type="button" aria-selected={tab === "board"} onClick={() => setTab("board")}>Klassement</button>
          <button type="button" aria-selected={tab === "missions"} onClick={() => setTab("missions")}>Team</button>
        </nav>
        <section className={`rs-panel${tab === "manage" ? " on" : ""}`}>
          <div className="rs-stats">
            <div className="rs-card"><small>Teams</small><strong>{report.counts.teams}</strong></div>
            <div className="rs-card"><small>Deelnemers</small><strong>—</strong><small>{report.participantsNote}</small></div>
            <div className="rs-card"><small>Geslaagd</small><strong>{report.counts.passed}</strong></div>
            <div className="rs-card"><small>Niet geslaagd</small><strong>{report.counts.failed}</strong></div>
            <div className="rs-card"><small>Nog bezig</small><strong>{report.counts.playing + report.counts.ready}</strong></div>
            <div className="rs-card"><small>Slagingspercentage</small><strong>{report.passRate.percent === null ? "—" : `${report.passRate.percent}%`}</strong><small>{report.passRate.passed} van {report.passRate.teams}</small></div>
            <div className="rs-card"><small>Gemiddelde score</small><strong>{report.averageScore ?? "—"}</strong></div>
            <div className="rs-card"><small>Hoogste score</small><strong>{report.highestScore ?? "—"}</strong></div>
            <div className="rs-card"><small>Gemiddelde speeltijd</small><strong>{report.averageElapsedSec === null ? "—" : formatClock(report.averageElapsedSec)}</strong><small>{report.averageElapsedNote}</small></div>
            <div className="rs-card"><small>Gemiddeld aantal hints</small><strong>{report.averageHints ?? "—"}</strong></div>
          </div>
          <article className="rs-note">
            <h2>Missies die teams hebben afgerond</h2>
            {report.missions.map((mission) => (
              <div key={mission.id} style={{ marginTop: 10 }}>
                <strong>{mission.title}</strong>
                <small>{mission.teamsDone} van {mission.teams}</small>
                <div className="rs-bar" aria-hidden><span style={{ width: `${mission.teams === 0 ? 0 : (mission.teamsDone / mission.teams) * 100}%` }} /></div>
              </div>
            ))}
          </article>
          <article className="rs-note">
            <h2>Score per team</h2>
            {report.leaderboard.map((row) => (
              <div key={row.name} style={{ marginTop: 10 }}>
                <strong>{row.name}</strong>
                <small>{row.score} pt · {row.outcome}</small>
                <div className="rs-bar" aria-hidden><span style={{ width: `${(row.score / max) * 100}%` }} /></div>
              </div>
            ))}
          </article>
          <article className="rs-note">
            <h2>Gemeten verbeteronderwerpen</h2>
            {report.topics.length > 0 ? (
              <ul>{report.topics.map((topic) => <li key={topic.topic}>{topic.topic}: {topic.teams} team{topic.teams === 1 ? "" : "s"}</li>)}</ul>
            ) : <p>Nog geen gemeten verbeteronderwerp.</p>}
            <p className="rs-muted">{report.passRate.note}</p>
          </article>
        </section>
        <section className={`rs-panel${tab === "board" || tab === "result" ? " on" : ""}`}>
          <article className="rs-note"><h2>{done ? "Eindstand" : "Tussenstand"}</h2><p className="rs-muted">{report.tieRule}</p></article>
          <Standing rows={report.leaderboard} winner={done} />
        </section>
        <section className={`rs-panel${tab === "missions" ? " on" : ""}`}>
          <div className="rs-tabs rs-noprint">
            {report.teams.map((item) => (
              <button key={item.code} type="button" aria-selected={item.name === team?.name} onClick={() => setFocus(item.name)}>{item.name}</button>
            ))}
          </div>
          {team && <TeamResult team={team} passRule={report.passRule} tieRule={report.tieRule} disclaimer={report.disclaimer} modeNote={report.modeNote} legalNote={report.legalNote} />}
        </section>
      </div>
    </div>
  );
}

export function StageBoard({ report, onClose }: { report: SessionReport; onClose: () => void }) {
  const done = report.counts.playing === 0 && report.counts.ready === 0 && report.counts.teams > 0;
  const leader = report.leaderboard[0];
  const shared = leader ? report.leaderboard.filter((row) => row.score === leader.score) : [];
  return (
    <div className="rs rs-overlay">
      <div className="rs-wrap rs-stage">
        <div className="rs-row rs-noprint">
          <p className="rs-kicker">{report.session.name}</p>
          <button type="button" className="rs-go" onClick={onClose}>Sluiten</button>
        </div>
        <p className="rs-kicker">{done ? "Eindstand" : "Tussenstand"}</p>
        {leader && done && (
          <>
            <p className="rs-kicker">Plaats 1</p>
            <h1>{shared.map((row) => row.name).join(" · ")}</h1>
            <div className="rs-score">{leader.score} pt</div>
            {shared.length > 1 && <p>Deze teams hebben dezelfde score. {report.tieRule}</p>}
          </>
        )}
        {!done && <h1>Nog {report.counts.playing + report.counts.ready} team{report.counts.playing + report.counts.ready === 1 ? "" : "s"} bezig</h1>}
        <div className="rs-podium">
          <Standing rows={report.leaderboard} winner={done} />
        </div>
      </div>
    </div>
  );
}
