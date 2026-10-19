"use client";

import { useEffect, useState } from "react";
import { asSector } from "@/lib/game/sector";
import { playGlitch, playIncoming, playLock } from "./audio";
import { speech } from "@/lib/game/story";
import { useSector } from "./SectorSkin";

type Phase = "file" | "glitch" | "locks" | "incoming" | "kade" | "nora";
type Rail = "dossier" | "bewijs";

const FILES = ["planning-nexora-day.xlsx", "leveranciers.xlsx", "contract-helix.pdf", "agenda.ics", "personeelsgegevens.xlsx"];
const WARNINGS = [
  "Serververbinding verbroken.",
  "Venster reageert niet.",
  "Beveiligingswaarschuwing — integriteit onbekend.",
];
const PANEL = [
  "Onbekende sessie gedetecteerd.",
  "Ongeautoriseerde toegang.",
  "Bestandsintegriteit aangetast.",
  "Netwerkverbinding instabiel.",
];
const NORA = [
  "Beveiligingsincident bevestigd.",
  "Ik ben NORA, de digitale noodassistent van Nexora.",
  "Meerdere systemen zijn gecompromitteerd.",
  "Ik heb een geïsoleerde onderzoeksomgeving beschikbaar gemaakt.",
  "Jullie opdracht is om de aanval te reconstrueren, de toegang van KADE te blokkeren en de systemen te herstellen.",
  "We hebben beperkte tijd.",
  "Ik heb het eerste spoor gevonden.",
  "Volgende keer: het volledige adres, niet het logo.",
];
const STEPS = ["Incident", "Onderzoek", "Missies", "Finale"];

function clock(total: number) {
  const safe = Math.max(0, Math.floor(total));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function speak(line: string, audio: boolean) {
  if (!audio || typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(line);
  utterance.lang = "nl-NL";
  utterance.rate = 0.98;
  window.speechSynthesis.speak(utterance);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.();
  else void document.exitFullscreen?.();
}

export function AttackCine({
  reported,
  audio,
  resumed,
  live,
  score,
  allottedSec,
  onToggleAudio,
  onStart,
  onClose,
}: {
  reported: boolean;
  audio: boolean;
  resumed: boolean;
  live: boolean;
  score: number;
  allottedSec: number;
  onToggleAudio: () => void;
  onStart: () => void;
  onClose: () => void;
}) {
  const lines = speech("incident", reported)?.lines ?? [];
  const sector = useSector();
  const [phase, setPhase] = useState<Phase>(resumed ? "nora" : reported ? "glitch" : "file");
  const [fileStep, setFileStep] = useState(0);
  const [warn, setWarn] = useState(0);
  const [locked, setLocked] = useState(0);
  const [line, setLine] = useState(0);
  const [noraLine, setNoraLine] = useState(0);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    document.body.classList.toggle("cine-fail", phase === "glitch");
    return () => document.body.classList.remove("cine-fail");
  }, [phase]);

  useEffect(() => {
    if (phase === "glitch") {
      playGlitch();
      const timer = window.setInterval(() => playGlitch(), 2400);
      return () => window.clearInterval(timer);
    }
    if (phase === "incoming") playIncoming();
  }, [phase]);

  useEffect(() => {
    if (phase !== "file") return;
    if (fileStep < 3) {
      const timer = window.setTimeout(() => setFileStep((value) => value + 1), 1100);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setPhase("glitch"), 900);
    return () => window.clearTimeout(timer);
  }, [phase, fileStep]);

  useEffect(() => {
    if (phase !== "glitch") return;
    const timer = window.setInterval(() => setWarn((value) => Math.min(value + 1, WARNINGS.length)), 2200);
    const done = window.setTimeout(() => setPhase("locks"), 8000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(done);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "locks") return;
    if (locked < FILES.length) {
      const timer = window.setTimeout(() => {
        setLocked((value) => value + 1);
        playLock();
      }, 1600);
      return () => window.clearTimeout(timer);
    }
    const done = window.setTimeout(() => setPhase("incoming"), 1800);
    return () => window.clearTimeout(done);
  }, [phase, locked]);

  useEffect(() => {
    if (phase !== "incoming") return;
    const timer = window.setTimeout(() => setPhase("kade"), 2800);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "kade") return;
    speak(asSector(sector, lines[line] ?? ""), audio);
    if (line >= lines.length - 1) return;
    const timer = window.setTimeout(() => setLine((value) => value + 1), 1500);
    return () => window.clearTimeout(timer);
  }, [phase, line, audio, lines, replay, sector]);

  useEffect(() => {
    if (phase !== "nora") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setNoraLine(NORA.length - 1);
      return;
    }
    speak(asSector(sector, NORA[noraLine] ?? ""), audio);
    if (noraLine >= NORA.length - 1) return;
    const timer = window.setTimeout(() => setNoraLine((value) => value + 1), 1500);
    return () => window.clearTimeout(timer);
  }, [phase, noraLine, audio, sector]);

  const noraReady = phase === "nora" && noraLine >= NORA.length - 1;
  const showOffice = phase === "file" || phase === "glitch";
  const allotted = clock(allottedSec);

  function replayTransmission() {
    window.speechSynthesis?.cancel();
    setLine(0);
    setReplay((value) => value + 1);
  }

  function follow() {
    window.speechSynthesis?.cancel();
    setPhase("nora");
  }

  return (
    <div className={`cine${showOffice ? " cine-clear" : ""}${phase === "glitch" ? " cine-glitch" : ""}${phase === "kade" ? " cine-fill" : ""}`} role="dialog" aria-label="Beveiligingsincident">
      {phase === "file" && (
        <div className="cine-window">
          <header><b>{asSector(sector, "planning-nexora-day.xlsx")}</b><small>{asSector(sector, "Nexora · Documenten")}</small></header>
          <div className="cine-sheet">
            <p>Dokzaal · interne planning</p>
            <p className={fileStep < 2 ? "cine-dim" : ""}>Crew · tijden · indeling</p>
            <p className={fileStep < 2 ? "cine-dim" : ""}>Vertrouwelijk</p>
          </div>
          <div className="cine-load" aria-hidden><i style={{ width: `${Math.min(100, 28 + fileStep * 24)}%` }} /></div>
          <p className="cine-error">{fileStep >= 3 ? "Bestand reageert niet. Macro geweigerd." : "Bestand openen…"}</p>
        </div>
      )}

      {phase === "glitch" && (
        <div className="cine-alerts">
          {WARNINGS.slice(0, warn + 1).map((item) => <p key={item}>{item}</p>)}
        </div>
      )}

      {phase === "locks" && (
        <div className="cine-lock">
          <div>
            {FILES.map((name, index) => (
              <p key={name} className={index < locked ? "locked" : ""}>
                <span>{name}</span>
                <b>{index < locked ? "TOEGANG GEBLOKKEERD" : "OPEN"}</b>
              </p>
            ))}
          </div>
          <aside>
            <p>BEVEILIGINGSPANEEL</p>
            {PANEL.slice(0, Math.max(1, locked - 1)).map((item) => <p key={item}>{item}</p>)}
          </aside>
        </div>
      )}

      {phase === "incoming" && (
        <div className="cine-incoming">
          <p>INCOMING TRANSMISSION</p>
          <p>SOURCE: UNKNOWN</p>
        </div>
      )}

      {phase === "kade" && (
        <IncidentBoard
          reported={reported}
          audio={audio}
          score={score}
          allotted={allotted}
          replay={replay}
          onToggleAudio={onToggleAudio}
          onReplay={replayTransmission}
          onContinue={follow}
        />
      )}

      {phase === "nora" && (
        <NoraProtocol
          line={asSector(sector, NORA[noraLine] ?? "")}
          progress={noraLine / Math.max(1, NORA.length - 1)}
          ready={noraReady}
          reported={reported}
          live={live}
          onStart={onStart}
          onClose={onClose}
        />
      )}
    </div>
  );
}

function NoraProtocol({
  line,
  progress,
  ready,
  reported,
  live,
  onStart,
  onClose,
}: {
  line: string;
  progress: number;
  ready: boolean;
  reported: boolean;
  live: boolean;
  onStart: () => void;
  onClose: () => void;
}) {
  const sector = useSector();
  const hero = asSector(sector, "Ik ben NORA, de digitale noodassistent van Nexora.");
  const checks = [
    ["Systeemcheck", "OK"],
    ["Databeveiliging", "OK"],
    ["Verbinding", "OK"],
    ["Assistent", ready ? "OK" : "Activeren..."],
  ];
  return (
    <div className="nora-hud">
      <header className="nora-top">
        <div className="nw-brand">
          <span className="nw-logo" aria-hidden="true">N</span>
          <span><b>NEXORA</b><small>TECHNOLOGIES</small></span>
        </div>
        <p className="nora-alert">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 16H3z" /><path d="M12 9v5M12 16.5v.5" /></svg>
          Emergency security protocol activated
        </p>
        <dl className="nora-status">
          <div><dt>System status</dt><dd>Online</dd></div>
          <div><dt>Nora AI</dt><dd>{ready ? "Online" : "Activating..."}</dd></div>
          <div><dt>Connection</dt><dd>Secure</dd></div>
        </dl>
      </header>
      <div className="nora-stage">
        <aside>
          <div className="nora-card">
            <Wave />
            <strong>NORA Online</strong>
            <small>AI-assistent</small>
            <small>{asSector(sector, "Nexora Technologies")}</small>
          </div>
          <ul className="nora-checks">
            {checks.map(([label, value]) => (
              <li key={label}><span>{label}</span><b className={value === "OK" ? "ok" : ""}>{value}</b></li>
            ))}
          </ul>
        </aside>
        <div className="nora-core-wrap" aria-hidden="true">
          <span className="nora-orb" />
          <svg className="nora-link" viewBox="0 0 64 28">
            <rect x="2" y="4" width="28" height="20" rx="10" />
            <rect x="34" y="4" width="28" height="20" rx="10" />
          </svg>
          <Wave wide />
        </div>
        <aside>
          <figure className="nora-site">
            <img src="/nora/hq.jpg" alt="" />
            <b>{asSector(sector, "NEXORA")}</b>
          </figure>
          <dl className="nora-place">
            <div><dt>Locatie</dt><dd>Hoofdkantoor</dd></div>
            <div><dt>Status</dt><dd>Beveiligd</dd></div>
          </dl>
        </aside>
      </div>
      <footer className="nora-foot">
        <h2>Ik ben <span>NORA</span>,<br />{asSector(sector, "de digitale noodassistent van Nexora.")}</h2>
        {line && line !== hero && <p className="nora-beat">{line}</p>}
        {reported && ready && <p className="seal">Verdachte mail gemeld · +200. De aanval was al voorbereid.</p>}
        <p className="nora-init">{ready ? "Secure connection ready" : "Initialising secure connection..."}</p>
        <div className="nora-bar" aria-hidden="true"><i style={{ width: `${Math.round(progress * 100)}%` }} /></div>
        {ready && (
          live ? (
            <button className="nx-next" type="button" onClick={onStart}>Onderzoek starten</button>
          ) : (
            <button className="nx-next" type="button" onClick={onClose}>Sluiten</button>
          )
        )}
      </footer>
    </div>
  );
}

function Wave({ wide = false }: { wide?: boolean }) {
  return (
    <svg className={wide ? "nora-wave wide" : "nora-wave"} viewBox="0 0 240 36" aria-hidden="true">
      <path d="M0 18h28c8 0 8-12 16-12s8 12 16 12 8-12 16-12 8 12 16 12 8-12 16-12 8 12 16 12 8-12 16-12 8 12 16 12 8-12 16-12 8 12 16 12h52" />
    </svg>
  );
}

function IncidentBoard({
  reported,
  audio,
  score,
  allotted,
  replay,
  onToggleAudio,
  onReplay,
  onContinue,
}: {
  reported: boolean;
  audio: boolean;
  score: number;
  allotted: string;
  replay: number;
  onToggleAudio: () => void;
  onReplay: () => void;
  onContinue: () => void;
}) {
  const [rail, setRail] = useState<Rail>("dossier");
  const sector = useSector();
  const lines = (speech("incident", reported)?.lines ?? []).map((line) => asSector(sector, line));
  const evidence = reported
    ? [
        ["Afzender", "planning@helix-event.co"],
        ["Helix Events", "events@helix-events.nl"],
        ["Verschil", "Een s te weinig. .co in plaats van .nl."],
        ["Keuze", "De mail is gemeld. De bijlage is niet geopend."],
      ]
    : [
        ["Afzender", "planning@helix-event.co"],
        ["Helix Events", "events@helix-events.nl"],
        ["Verschil", "Een s te weinig. .co in plaats van .nl."],
        ["Bijlage", asSector(sector, "Nexora_Day_Planning.exe is uitgevoerd.")],
      ];

  return (
    <div className="cine-incident">
      <header className="ki-top">
        <p className="ki-brand">
          <Bolt />
          <span>ESCAPE <b>THE HACK</b> <em>2.0</em></span>
        </p>
        <ol className="ki-steps" aria-label="Voortgang">
          {STEPS.map((label, index) => (
            <li key={label} className={index === 0 ? "on" : ""} aria-current={index === 0 ? "step" : undefined}>
              <i>{index + 1}</i>
              <span>{label}</span>
            </li>
          ))}
        </ol>
        <div className="ki-tools">
          <p className="ki-score"><Trophy /> {score} pt</p>
          <p className="ki-clock" aria-label={`Beschikbare tijd ${allotted}. De klok start bij Onderzoek starten.`}>{allotted}</p>
          <button className="ki-tool" type="button" aria-pressed={audio} onClick={onToggleAudio}>
            <Speaker />
            <span>{audio ? "Geluid aan" : "Geluid uit"}</span>
          </button>
          <button className="ki-tool" type="button" onClick={toggleFullscreen}>
            <FullscreenIcon />
            <span>Volledig scherm</span>
          </button>
        </div>
      </header>
      <div className="ki-split">
        <section className="ki-stage" aria-label="Transmissie van KADE">
          <div className="ki-tabs" role="tablist" aria-label="Dossier">
            <button type="button" role="tab" aria-selected={rail === "dossier"} onClick={() => setRail("dossier")}>
              <Folder /> Dossier
            </button>
            <button type="button" role="tab" aria-selected={rail === "bewijs"} onClick={() => setRail("bewijs")}>
              <Stack /> Bewijs
            </button>
          </div>
          {rail === "dossier" ? (
            <figure className="ki-frame">
              <img src="/kade/kade-portrait.jpg" alt="" />
              <span className="ki-scan" />
              <span key={replay} className={replay > 0 ? "ki-sweep on" : "ki-sweep"} />
              <figcaption>
                <small>INCOMING TRANSMISSION…</small>
                <strong>KADE</strong>
                <span>UNKNOWN LOCATION</span>
              </figcaption>
            </figure>
          ) : (
            <div className="ki-evidence" role="tabpanel">
              <p>Bewijs bij deze transmissie</p>
              {evidence.map(([label, value]) => (
                <p key={label}><small>{label}</small>{value}</p>
              ))}
            </div>
          )}
        </section>
        <section className="ki-card" aria-label={reported ? "Incident KADE, spoor herkend" : "Incident KADE, system compromised"}>
          <p className="ki-kicker">INCIDENT · KADE</p>
          <h2 className={reported ? "ki-title ki-seen" : "ki-title"}>{reported ? "SPOOR HERKEND" : "SYSTEM COMPROMISED"}</h2>
          <div className={`ki-copy${replay > 0 ? " is-replay" : ""}`} key={replay}>
            {lines.map((line) => line === "planning@helix-event.co." ? <Address key={line} /> : <p key={line}>{line}</p>)}
            {!reported && (
              <div className="ki-exe">
                <Clip />
                <span>
                  <small>BIJLAGE</small>
                  <strong>{asSector(sector, "Nexora_Day_Planning.exe")}</strong>
                  <em>2,4 MB · Uitgevoerd</em>
                </span>
                <Skull />
              </div>
            )}
          </div>
          <div className="ki-actions">
            <button className="ki-again" type="button" onClick={onReplay}>
              <ReplayIcon /> Opnieuw afspelen
            </button>
            <button className="ki-go" type="button" onClick={onContinue}>Sporen volgen →</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Address() {
  return (
    <p className="ki-mail">
      <Mail />
      <span>planning@helix-event.co</span>
      <Warn />
    </p>
  );
}

function Bolt() {
  return (
    <svg className="ki-bolt" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}

function Trophy() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10v3a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M9 20h6M12 14v6" />
    </svg>
  );
}

function Speaker() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10h4l5-4v12l-5-4H4zM16 9a4 4 0 0 1 0 6" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" />
    </svg>
  );
}

function Folder() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7h6l2 2h10v9H3z" />
    </svg>
  );
}

function Stack() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
    </svg>
  );
}

function Mail() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="m4 8 8 6 8-6" />
    </svg>
  );
}

function Warn() {
  return (
    <svg className="ki-warn" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}

function Clip() {
  return (
    <svg className="ki-clip" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 12.5V7a4 4 0 1 1 8 0v8a2.5 2.5 0 0 1-5 0V8" />
    </svg>
  );
}

function Skull() {
  return (
    <span className="ki-skull" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="10" r="5" />
        <path d="M9 14.5c.4 2 1.4 3 3 3s2.6-1 3-3M10 10h.01M14 10h.01" />
      </svg>
    </span>
  );
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v5h5" />
    </svg>
  );
}
