"use client";

import { useEffect, useState } from "react";
import { playGlitch, playIncoming, playLock } from "./audio";
import { speech } from "@/lib/game/story";

type Phase = "file" | "glitch" | "locks" | "incoming" | "kade" | "hold" | "nora";

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
];

function speak(line: string, audio: boolean) {
  if (!audio || typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(line);
  utterance.lang = "nl-NL";
  utterance.rate = 0.98;
  window.speechSynthesis.speak(utterance);
}

export function AttackCine({
  reported,
  audio,
  resumed,
  live,
  onStart,
  onClose,
}: {
  reported: boolean;
  audio: boolean;
  resumed: boolean;
  live: boolean;
  onStart: () => void;
  onClose: () => void;
}) {
  const lines = speech("incident", reported)?.lines ?? [];
  const [phase, setPhase] = useState<Phase>(resumed ? "nora" : reported ? "glitch" : "file");
  const [fileStep, setFileStep] = useState(0);
  const [warn, setWarn] = useState(0);
  const [locked, setLocked] = useState(0);
  const [line, setLine] = useState(0);
  const [noraLine, setNoraLine] = useState(0);

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
    speak(lines[line] ?? "", audio);
    if (line >= lines.length - 1) {
      const timer = window.setTimeout(() => setPhase("hold"), 2200);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setLine((value) => value + 1), 1500);
    return () => window.clearTimeout(timer);
  }, [phase, line, audio, lines]);

  useEffect(() => {
    if (phase !== "hold") return;
    window.speechSynthesis?.cancel();
    const timer = window.setTimeout(() => setPhase("nora"), 1800);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "nora") return;
    speak(NORA[noraLine] ?? "", audio);
    if (noraLine >= NORA.length - 1) return;
    const timer = window.setTimeout(() => setNoraLine((value) => value + 1), 1500);
    return () => window.clearTimeout(timer);
  }, [phase, noraLine, audio]);

  const noraReady = phase === "nora" && noraLine >= NORA.length - 1;
  const showOffice = phase === "file" || phase === "glitch";

  return (
    <div className={`cine${showOffice ? " cine-clear" : ""}${phase === "glitch" ? " cine-glitch" : ""}`} role="dialog" aria-label="Beveiligingsincident">
      {phase === "file" && (
        <div className="cine-window">
          <header><b>planning-nexora-day.xlsx</b><small>Nexora · Documenten</small></header>
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

      {(phase === "kade" || phase === "hold") && (
        <div className={`cine-cast${phase === "hold" ? " cine-cut" : ""}`}>
          <div className="cine-frame">
            <img src="/kade.jpg" alt="" />
            <span className="cine-noise" />
            <span className="cine-live">KADE · TRANSMISSIE</span>
          </div>
          <p className="cine-caption">{phase === "hold" ? "" : lines[line]}</p>
        </div>
      )}

      {phase === "nora" && (
        <div className="cine-nora">
          <p className="cine-protocol">EMERGENCY SECURITY PROTOCOL ACTIVATED</p>
          <div className="nora-portrait" aria-hidden><span className="nora-ring" /><span className="nora-core" /></div>
          <p className="cine-caption">{NORA[noraLine]}</p>
          {reported && noraReady && <p className="seal">Verdachte mail gemeld · +200. De aanval was al voorbereid.</p>}
          {noraReady && (
            live ? (
              <button className="nx-next" type="button" onClick={onStart}>Onderzoek starten</button>
            ) : (
              <button className="nx-next" type="button" onClick={onClose}>Sluiten</button>
            )
          )}
        </div>
      )}
    </div>
  );
}
