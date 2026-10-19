"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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

function briefTypeMs(text: string) {
  if (!text) return 0;
  return Math.min(1450, Math.max(480, text.length * 22));
}

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function reducedMotionNow() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function OpsField() {
  return (
    <svg className="og-net" viewBox="0 0 1440 900" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="og-ops-veil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#071422" stopOpacity="0.82" />
          <stop offset="34%" stopColor="#071422" stopOpacity="0.46" />
          <stop offset="58%" stopColor="#071422" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="#6aafd8" strokeWidth="1.25" opacity="0.62">
        <path d="M780 240H960l150-90 170 110 150-50" />
        <path d="M960 240l90 160 180 30" />
        <path d="M1110 150l70 250" />
        <path d="M1230 400H1040l-80 170 210 90 160-110" />
        <path d="M1230 400l130 150-70 130" />
        <path d="M840 580h190l140 150" />
        <path d="M1290 640l90-70" />
      </g>
      <g fill="#b7daf3">
        <circle cx="780" cy="240" r="3.2" />
        <circle cx="960" cy="240" r="3.4" />
        <circle cx="1110" cy="150" r="3" />
        <circle cx="1430" cy="210" r="2.6" />
        <circle cx="1050" cy="400" r="3.2" />
        <circle cx="1230" cy="400" r="3" />
        <circle cx="960" cy="570" r="2.8" />
        <circle cx="840" cy="580" r="3" />
        <circle cx="1030" cy="660" r="3.2" />
        <circle cx="1280" cy="550" r="3" />
        <circle cx="1370" cy="570" r="2.6" />
        <circle cx="1170" cy="730" r="3" />
        <circle cx="1290" cy="640" r="2.8" />
      </g>
      <g>
        <circle cx="1280" cy="260" r="5" fill="#d24b5e" />
        <circle cx="1280" cy="260" r="12" fill="none" stroke="#d24b5e" strokeWidth="1" opacity="0.7" />
      </g>
      <rect width="1440" height="900" fill="url(#og-ops-veil)" />
    </svg>
  );
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
  const reduce = useSyncExternalStore(subscribeReducedMotion, reducedMotionNow, () => false);
  const [step, setStep] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [typing, setTyping] = useState({ step: 0, count: 0 });
  const scene = PROLOGUE_SCENES[index];
  const typed = scene === "brief" && !reduce && typing.step === step ? typing.count : 0;

  useEffect(() => {
    setIndex(startIndex(seen, code));
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
      if (reduce) {
        const timer = window.setTimeout(() => finish("brief"), 7000);
        return () => window.clearTimeout(timer);
      }
      const line = BRIEFING_LINES[step] ?? "";
      const hold = step < BRIEFING_LINES.length - 1 ? 680 : 1300;
      const timer = window.setTimeout(() => {
        if (step < BRIEFING_LINES.length - 1) setStep((value) => value + 1);
        else finish("brief");
      }, briefTypeMs(line) + hold);
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

  useEffect(() => {
    if (scene !== "brief" || reduce) return;
    const line = BRIEFING_LINES[step] ?? "";
    if (!line) return;
    const duration = briefTypeMs(line);
    const tick = duration / line.length;
    let count = 1;
    setTyping({ step, count });
    const timer = window.setInterval(() => {
      count += 1;
      const next = Math.min(count, line.length);
      setTyping({ step, count: next });
      if (next >= line.length) window.clearInterval(timer);
    }, tick);
    return () => window.clearInterval(timer);
  }, [scene, step, reduce]);

  function finish(id: string) {
    sessionStorage.setItem(`eth-origin-${code}`, id);
    onSeen(id);
    setIndex((value) => value + 1);
  }

  if (!scene) return null;

  return (
    <section className={`og${scene === "brief" ? " og-ops" : ""}${glitch && !reduce ? " og-glitch" : ""}`} aria-label="De oorsprong">
      {scene === "brief" && <OpsField />}
      <header className="og-top">
        <strong>NEXORA TECHNOLOGIES</strong>
        <span>SECURITY OPERATIONS</span>
        <button type="button" onClick={onToggleAudio}>{audio ? "geluid aan" : "geluid uit"}</button>
        <button type="button" onClick={() => { sessionStorage.setItem(`eth-origin-${code}`, "skip"); onSeen("skip"); }}>Naar Mara</button>
      </header>
      <div className="og-stage">
        {scene === "brief" && <p className="og-ops-status" aria-hidden="true"><i /> signaal</p>}
        {scene === "brief" && (
          <div className="og-brief">
            <p className="kicker">CONFIDENTIAL INCIDENT BRIEFING</p>
            <div className="og-lines">
              {(reduce ? BRIEFING_LINES : BRIEFING_LINES.slice(0, step + 1)).map((line, lineIndex) => {
                const active = !reduce && lineIndex === step;
                const visible = active ? line.slice(0, typed) : line;
                return (
                  <p key={line}>
                    <span className="og-sr">{line}</span>
                    <span aria-hidden="true">
                      {visible}
                      {active && <span className="og-caret" />}
                    </span>
                  </p>
                );
              })}
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
