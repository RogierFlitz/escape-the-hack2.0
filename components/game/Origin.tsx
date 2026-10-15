"use client";

import { useEffect, useState } from "react";
import {
  BREACH_LINE,
  BRIEFING_LINES,
  FICTION_MARKET,
  FICTION_ROUTE,
  GHOST_LINE,
  MARKET_LINES,
  OSINT_LINES,
  PROLOGUE_SCENES,
  TRUST_LINES,
  type PrologueScene,
} from "@/lib/game/awareness";

function startIndex(seen: string[], code: string) {
  const done = new Set(seen);
  const local = sessionStorage.getItem(`eth-origin-${code}`);
  if (local === "skip") return PROLOGUE_SCENES.length;
  const at = PROLOGUE_SCENES.indexOf(local as PrologueScene);
  if (at >= 0) {
    for (let index = 0; index <= at; index += 1) done.add(PROLOGUE_SCENES[index]);
  }
  const next = PROLOGUE_SCENES.findIndex((scene) => !done.has(scene));
  return next === -1 ? PROLOGUE_SCENES.length : next;
}

function speak(line: string, audio: boolean) {
  if (!audio || typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(line);
  utterance.lang = "nl-NL";
  utterance.rate = 0.96;
  window.speechSynthesis.speak(utterance);
}

export function OriginPrologue({
  code,
  seen,
  audio,
  onToggleAudio,
  onSeen,
}: {
  code: string;
  seen: string[];
  audio: boolean;
  onToggleAudio: () => void;
  onSeen: (scene: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [reduce, setReduce] = useState(false);
  const [step, setStep] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const scene = PROLOGUE_SCENES[index];

  useEffect(() => {
    setIndex(startIndex(seen, code));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(media.matches);
  }, [code, seen]);

  useEffect(() => {
    setStep(0);
    setGlitch(false);
    if (!audio) window.speechSynthesis?.cancel();
  }, [scene, audio]);

  useEffect(() => {
    if (!scene) return;
    const line = scene === "brief" ? BRIEFING_LINES[step] : scene === "ghost" ? GHOST_LINE : scene === "osint" ? OSINT_LINES[0] : scene === "human" ? TRUST_LINES[Math.min(step, TRUST_LINES.length - 1)] : scene === "breach" ? BREACH_LINE : scene === "market" ? MARKET_LINES[Math.min(step, MARKET_LINES.length - 1)] : "";
    if (line) speak(line, audio);
  }, [scene, step, audio]);

  useEffect(() => {
    if (!scene) return;
    const pace = reduce ? 0.42 : 1;
    const wait = (ms: number) => window.setTimeout(() => undefined, ms * pace);
    if (scene === "brief") {
      if (step < BRIEFING_LINES.length - 1) {
        const timer = window.setTimeout(() => setStep((value) => value + 1), 4800 * pace);
        return () => window.clearTimeout(timer);
      }
      const timer = window.setTimeout(() => finish("brief"), 3200 * pace);
      return () => window.clearTimeout(timer);
    }
    if (scene === "title") {
      const timer = window.setTimeout(() => finish("title"), 7000 * pace);
      return () => window.clearTimeout(timer);
    }
    if (scene === "ghost" || scene === "osint" || scene === "human" || scene === "market") {
      const cap = scene === "ghost" ? 4 : scene === "osint" ? 5 : scene === "human" ? TRUST_LINES.length : MARKET_LINES.length;
      if (step < cap - 1) {
        const timer = window.setTimeout(() => setStep((value) => value + 1), 3200 * pace);
        return () => window.clearTimeout(timer);
      }
      const timer = window.setTimeout(() => finish(scene), 2800 * pace);
      return () => window.clearTimeout(timer);
    }
    if (scene === "breach") {
      if (!reduce && step === 3 && !glitch) {
        const timer = window.setTimeout(() => setGlitch(true), 400);
        const done = window.setTimeout(() => finish("breach"), 1600);
        return () => {
          window.clearTimeout(timer);
          window.clearTimeout(done);
        };
      }
      if (step < 3) {
        const timer = window.setTimeout(() => setStep((value) => value + 1), 2800 * pace);
        return () => window.clearTimeout(timer);
      }
      const timer = window.setTimeout(() => finish("breach"), reduce ? 900 : 1800);
      return () => window.clearTimeout(timer);
    }
    if (scene === "hours") {
      window.speechSynthesis?.cancel();
      const timer = window.setTimeout(() => finish("hours"), 8000 * pace);
      return () => window.clearTimeout(timer);
    }
    return () => window.clearTimeout(wait(0));
  }, [scene, step, reduce, glitch]);

  function finish(id: string) {
    sessionStorage.setItem(`eth-origin-${code}`, id);
    onSeen(id);
    setIndex((value) => value + 1);
  }

  if (!scene) return null;

  return (
    <section className={`og${glitch && !reduce ? " og-glitch" : ""}`} aria-label="De oorsprong">
      <header className="og-top">
        <strong>NEXORA TECHNOLOGIES</strong>
        <span>SECURITY OPERATIONS</span>
        <button type="button" onClick={onToggleAudio}>{audio ? "geluid aan" : "geluid uit"}</button>
        <button type="button" onClick={() => { sessionStorage.setItem(`eth-origin-${code}`, "skip"); onSeen("skip"); }}>Naar Mara</button>
      </header>
      <div className="og-stage">
        {scene === "brief" && (
          <div className="og-brief">
            <p className="kicker">CONFIDENTIAL INCIDENT BRIEFING</p>
            <div className="og-lines">
              {BRIEFING_LINES.slice(0, step + 1).map((line) => <p key={line}>{line}</p>)}
            </div>
          </div>
        )}
        {scene === "title" && (
          <div className="og-title">
            <p>THE ORIGIN</p>
            <small>EVERY BREACH HAS A BEGINNING.</small>
          </div>
        )}
        {scene === "ghost" && (
          <div className="og-ghost">
            <img src="/brief-world.jpg" alt="" />
            <div className="og-route" aria-hidden>
              {["AMSTERDAM", "FRANKFURT", "SINGAPORE", "SATELLIETRELAIS", "ONBEKEND"].slice(0, step + 1).map((stop) => <b key={stop}>{stop}</b>)}
            </div>
            <ul>
              {step >= 1 && <li>CONNECTION ROUTED</li>}
              {step >= 2 && <li>ORIGIN OBSCURED</li>}
              {step >= 3 && <li>TARGET ACQUIRED</li>}
              {step >= 3 && <li>NEXORA TECHNOLOGIES</li>}
            </ul>
            {step >= 3 && <strong className="og-kade">KADE</strong>}
            <p>{GHOST_LINE}</p>
            <small>{FICTION_ROUTE}</small>
          </div>
        )}
        {scene === "osint" && (
          <div className="og-osint">
            <p className="kicker">NEXORA — RECONNAISSANCE IN PROGRESS</p>
            <div className="og-cards">
              {[
                ["/brief-team.jpg", "Profiel", "Een openbaar profiel van het bedrijf."],
                ["/brief-day.jpg", "Bericht", "Een aankondiging van een personeelsdag."],
                ["/brief-dock.jpg", "Foto", "Een sfeerfoto van een zaal."],
                ["/brief-hq.jpg", "Leverancier", "Een partner die iets bouwt voor het evenement."],
                ["/brief-world.jpg", "Nexora Day", "Een openbare vermelding van de dag."],
              ].slice(0, step + 1).map(([src, title, text]) => (
                <figure key={title}><img src={src} alt="" /><figcaption><b>{title}</b><span>{text}</span></figcaption></figure>
              ))}
            </div>
            <p>{OSINT_LINES[0]}</p>
          </div>
        )}
        {scene === "human" && (
          <div className="og-human">
            <div className="og-graph" aria-hidden>
              <b>Mensen</b><b>Leverancier</b><b className="on">Account</b><b>Evenement</b>
            </div>
            <p className="kicker">ACCOUNT IDENTITY: REDACTED</p>
            <p className="kicker">POTENTIAL ACCESS VECTOR IDENTIFIED</p>
            {TRUST_LINES.slice(0, step + 1).map((line) => <p key={line}>{line}</p>)}
          </div>
        )}
        {scene === "breach" && (
          <div className="og-breach">
            <div className="og-map" aria-hidden>
              <i>buiten</i><i>poort</i><i className={step >= 2 ? "hot" : ""}>sessie</i><i className={step >= 3 ? "hot" : ""}>deel</i>
            </div>
            {step >= 0 && <p>AUTHENTICATION EVENT DETECTED</p>}
            {step >= 1 && <p>SESSION ESTABLISHED</p>}
            {step >= 2 && <p>INTERNAL NETWORK ACCESS</p>}
            <p>{BREACH_LINE}</p>
          </div>
        )}
        {scene === "market" && (
          <div className="og-market">
            <p className="kicker">NAGEMAAKTE MARKT · FICTIE</p>
            <div className="og-shelf">
              <article><b>module-archief</b><span>verkoper onbekend</span></article>
              <article><b>bestand.versleuteld</b><span>geen voorbeeld</span></article>
              <article><b>UNKNOWN SOFTWARE PACKAGE</b><span>SOURCE UNVERIFIED</span></article>
            </div>
            {MARKET_LINES.slice(0, step + 1).map((line) => <p key={line}>{line}</p>)}
            <small>{FICTION_MARKET}</small>
            <button type="button" disabled>Geen download in deze simulatie</button>
          </div>
        )}
        {scene === "hours" && (
          <div className="og-title">
            <p>72 HOURS BEFORE NEXORA DAY</p>
            <small>NEXORA TECHNOLOGIES</small>
          </div>
        )}
      </div>
      <footer className="og-foot">
        <i style={{ width: `${((index + 1) / PROLOGUE_SCENES.length) * 100}%` }} />
      </footer>
    </section>
  );
}
