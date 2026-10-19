"use client";

import { useEffect, useRef, useState } from "react";
import { asSector } from "@/lib/game/sector";
import { playSecureConnect } from "./audio";
import { useSector } from "./SectorSkin";

type Cue = { t: number; text: string };

const VIDEO_SRC = "/mara-intro.mp4";
const POSTER_SRC = "/mara-briefing.jpg";
const CUE_SRC = "/audio/secure-connect.wav";

const SCRIPT: Cue[] = [
  { t: 0, text: "Goedemorgen en welkom bij Nexora Technologies." },
  { t: 3, text: "Mijn naam is Mara de Vries en ik ben operationeel manager." },
  { t: 6.35, text: "Fijn dat jullie zo snel beschikbaar waren." },
  { t: 8.85, text: "Ik zal meteen ter zake komen." },
  { t: 11.03, text: "Gisteren ontvingen wij een verontrustend bericht van een externe partij. Zij beschikten over informatie waarvan wij dachten dat deze uitsluitend binnen onze organisatie bekend was." },
  { t: 19.56, text: "Hoe die informatie daar terecht is gekomen, weten we niet." },
  { t: 22.8, text: "Misschien is er ergens iets onbedoeld gedeeld. Misschien is er meer aan de hand." },
  { t: 27.31, text: "Daarom hebben wij jullie ingeschakeld." },
  { t: 29.66, text: "Jullie krijgen toegang tot onze interne werkomgeving. Hier vinden jullie onze e-mails, documenten, agenda's, medewerkersinformatie en leveranciersgegevens." },
  { t: 38.48, text: "Ik wil dat jullie onderzoeken wat er precies is gebeurd." },
  { t: 41.3, text: "Bekijk de informatie, leg verbanden en controleer alles wat jullie verdacht vinden." },
  { t: 45.58, text: "Verzamel bewijsmateriaal en trek niet te snel conclusies." },
  { t: 49, text: "En nog iets: ga zorgvuldig om met onverwachte berichten of bestanden. We weten op dit moment niet of onze omgeving volledig veilig is." },
  { t: 56.18, text: "Ik reken op jullie." },
  { t: 57.77, text: "Succes." },
];

const CHAPTERS = [
  { id: "briefing", title: "Briefing", sub: "Situatie en opdracht", image: POSTER_SRC },
  { id: "incident", title: "Incident", sub: "Wat is er gebeurd?", image: "/brief-day.jpg", text: "Er is informatie buiten Nexora gezien die alleen intern bekend hoorde te zijn. Hoe dat is gebeurd, is nog niet vastgesteld." },
  { id: "organisatie", title: "Organisatie", sub: "Nexora Technologies", image: "/brief-hq.jpg", text: "Nexora Technologies bereidt Nexora Day voor. De bijeenkomst is in de Dokzaal. Helix Events is de betrokken externe partij." },
  { id: "dreiging", title: "Dreiging", sub: "Verdachte signalen", image: "/brief-world.jpg", text: "Status: verhoogde digitale dreiging. Er zijn verdachte signalen. Wat ze veroorzaakt, is nog niet vastgesteld." },
  { id: "team", title: "Jouw team", sub: "Tijd om te starten", image: "/brief-team.jpg", text: "Jullie zijn het onderzoeksteam. Mara de Vries, operationeel manager, geeft toegang tot de werkomgeving. Bekijk wat afwijkt en trek nog geen conclusies." },
] as const;

const FACTS = [
  { label: "Organisatie", value: "Nexora Technologies", d: "M4 20.5h16M6 20.5V5.5h7.5V20.5M13.5 20.5V9.5H20v11M8 9h2.2M8 12.5h2.2M8 16h2.2M15.6 13h2M15.6 16.5h2" },
  { label: "Evenement", value: "Nexora Day", d: "M7.5 3.5v3.2M16.5 3.5v3.2M4.5 9h15M5.5 5.2h13a1.2 1.2 0 0 1 1.2 1.2v12.8a1.2 1.2 0 0 1-1.2 1.2h-13a1.2 1.2 0 0 1-1.2-1.2V6.4a1.2 1.2 0 0 1 1.2-1.2z" },
  { label: "Locatie", value: "Dokzaal", d: "M12 21.2s-6.3-5.3-6.3-10.1a6.3 6.3 0 1 1 12.6 0c0 4.8-6.3 10.1-6.3 10.1zM12 11.6a2.15 2.15 0 1 0 0-4.3 2.15 2.15 0 0 0 0 4.3z" },
  { label: "Externe partij", value: "Helix Events", named: "Betrokken externe partij: Helix Events", d: "M8.2 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16.4 11.4a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6zM2.8 19.8c.45-3.2 2.4-4.8 5.4-4.8s4.95 1.6 5.4 4.8M13.6 19.8c.3-2.1 1.45-3.3 3.15-3.7" },
];

const OBJECTIVES = [
  { n: "1", title: "Onderzoek", text: "Onderzoek verdachte digitale signalen.", d: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM16.5 16.5L21 21" },
  { n: "2", title: "Identificeer", text: "Identificeer risico's en kwetsbare verbindingen.", d: "M12 3l7 3v6c0 4.2-2.8 7.2-7 8.5C7.8 19.2 5 16.2 5 12V6l7-3z" },
  { n: "3", title: "Help", text: "Help de organisatie de dreiging te beheersen.", d: "M12 4v4M12 16v4M4 12h4M16 12h4M7 7l2.5 2.5M14.5 14.5L17 17M17 7l-2.5 2.5M9.5 14.5L7 17" },
];

const RAIL = [
  { n: "1", title: "Briefing", sub: "Situatie en opdracht", on: true },
  { n: "2", title: "Onderzoek", sub: "Incident analyseren", on: false },
  { n: "3", title: "Missies", sub: "6 digitale uitdagingen", on: false },
  { n: "4", title: "Finale", sub: "Dreiging stoppen", on: false },
];

let lastCueAt = 0;

function playConnectionCue() {
  const now = Date.now();
  if (now - lastCueAt < 900) return;
  lastCueAt = now;
  const cue = new Audio(CUE_SRC);
  cue.volume = 0.45;
  let fellBack = false;
  const fallback = () => {
    if (fellBack) return;
    fellBack = true;
    playSecureConnect();
  };
  cue.addEventListener("error", fallback);
  void cue.play().catch(fallback);
}

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return reduce;
}

function Mark({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function FactIcon({ d }: { d: string }) {
  return (
    <svg className="cb-fact-ico" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SecureLink({
  audio,
  onToggleAudio,
  onDone,
}: {
  audio: boolean;
  onToggleAudio: () => void;
  onDone: () => void;
}) {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const finished = useRef(false);

  useEffect(() => {
    if (audio) playConnectionCue();
  }, []);

  useEffect(() => {
    if (reduce) {
      setReady(true);
      return;
    }
    const show = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(show);
  }, [reduce]);

  useEffect(() => {
    const wait = reduce ? 1600 : 3400;
    const timer = window.setTimeout(finish, wait);
    return () => window.clearTimeout(timer);
  }, [reduce]);

  function finish() {
    if (finished.current) return;
    finished.current = true;
    onDone();
  }

  return (
    <section className="cb-secure" data-screen="secure" aria-label="Beveiligde verbinding">
      <p className="cb-secure-brand">NEXORA TECHNOLOGIES</p>
      <div className="cb-trace" aria-hidden="true"><i /></div>
      <p className="cb-secure-kicker">{ready ? "Kanaal gecontroleerd" : "Verbinding controleren"}</p>
      <h1>{ready ? "SECURE CONNECTION ESTABLISHED" : "SECURE CONNECTION"}</h1>
      <p className="cb-secure-sub">Alleen voor het onderzoeksteam.</p>
      <div className="cb-secure-actions">
        <button
          type="button"
          onClick={() => {
            if (!audio) playConnectionCue();
            onToggleAudio();
          }}
          aria-pressed={audio}
        >
          {audio ? "Geluid aan" : "Geluid uit"}
        </button>
        <button type="button" className="cb-secure-go" onClick={finish}>Doorgaan</button>
      </div>
    </section>
  );
}

export function Briefing({
  audio,
  onToggleAudio,
  onStart,
}: {
  audio: boolean;
  onToggleAudio: () => void;
  onStart: () => void;
}) {
  const sector = useSector();
  const skin = (text: string) => asSector(sector, text);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scriptRef = useRef<HTMLDivElement>(null);
  const [linked, setLinked] = useState(false);
  const [chapter, setChapter] = useState<(typeof CHAPTERS)[number]["id"]>("briefing");
  const [replay, setReplay] = useState(0);
  const [paused, setPaused] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [cues, setCues] = useState<Cue[]>(SCRIPT);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoMissing, setVideoMissing] = useState(false);
  const current = CHAPTERS.find((item) => item.id === chapter) ?? CHAPTERS[0];
  const caption = [...cues].reverse().find((cue) => time >= cue.t - 0.05)?.text ?? "";
  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  useEffect(() => {
    let cancel = false;
    fetch("/mara-intro.json")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { cues?: Cue[] }) => {
        if (!cancel && data.cues?.length) setCues(data.cues);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !audio;
  }, [audio]);

  const playedReplay = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || replay === 0 || chapter !== "briefing" || playedReplay.current === replay) return;
    playedReplay.current = replay;
    video.currentTime = 0;
    setTime(0);
    video.muted = !audio;
    void video.play().catch(() => setPaused(true));
  }, [replay, chapter, audio]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video || videoMissing) return;
    if (video.paused) {
      video.muted = !audio;
      void video.play().then(() => setPaused(false)).catch(() => setPaused(true));
      return;
    }
    video.pause();
    setPaused(true);
  }

  function toggleSound() {
    const video = videoRef.current;
    if (video) video.muted = audio;
    onToggleAudio();
  }

  function replayBriefing() {
    setChapter("briefing");
    setPaused(false);
    if (videoMissing) {
      scriptRef.current?.scrollTo({ top: 0 });
      return;
    }
    setReplay((value) => value + 1);
  }

  if (!linked) {
    return (
      <SecureLink
        audio={audio}
        onToggleAudio={onToggleAudio}
        onDone={() => setLinked(true)}
      />
    );
  }

  const showVideo = chapter === "briefing" && !videoMissing;

  return (
    <section className="cb" data-screen="briefing" aria-label="Vertrouwelijke briefing">
      <h1 className="cb-sr">Escape the Hack 2.0. Vertrouwelijke briefing.</h1>
      <aside className="cb-rail">
        <p className="cb-word">
          <i aria-hidden="true" />
          <span>ESCAPE<small>THE HACK <b>2.0</b></small></span>
        </p>
        <ol aria-label="Voortgang">
          {RAIL.map((step) => (
            <li key={step.n} className={step.on ? "on" : ""} aria-current={step.on ? "step" : undefined}>
              <b>{step.n}</b>
              <span>{step.title}<small>{step.sub}</small></span>
            </li>
          ))}
        </ol>
      </aside>

      <div className="cb-stage">
        <div
          className={`cb-frame${showVideo && paused ? " is-paused" : ""}`}
          onClick={showVideo ? togglePlay : undefined}
        >
          <video
            ref={videoRef}
            className="cb-video"
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            playsInline
            preload="metadata"
            muted={!audio}
            hidden={!showVideo}
            onError={() => setVideoMissing(true)}
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
          />
          {!showVideo && (
            <div className={`cb-still${chapter === "dreiging" ? " is-alert" : ""}`}>
              <img src={current.image} alt="" />
              <div className="cb-still-card" ref={chapter === "briefing" ? scriptRef : undefined}>
                <p>{chapter === "briefing" ? "Tekstbriefing" : skin(current.title)}</p>
                {chapter === "briefing" ? (
                  SCRIPT.map((line) => <span key={line.t}>{skin(line.text)}</span>)
                ) : (
                  <span>{skin("text" in current ? current.text : "")}</span>
                )}
              </div>
            </div>
          )}
          {showVideo && <p className="cb-live"><i />Live threat monitoring</p>}
          {showVideo && (
            <p className="cb-name">
              <b>Mara de Vries</b>
              <small>Operationeel manager · {skin("Nexora Technologies")}</small>
            </p>
          )}
          {showVideo && captions && caption && <p className="cb-cap" aria-live="polite">{skin(caption)}</p>}
          {showVideo && (
            <button
              type="button"
              className={paused ? "cb-play" : "cb-pause"}
              aria-label={paused ? "Afspelen" : "Pauze"}
              onClick={(event) => {
                event.stopPropagation();
                togglePlay();
              }}
            >
              {paused ? <Mark d="M9 7.2v9.6L17.5 12 9 7.2z" /> : <Mark d="M8 7h2.4v10H8zM13.6 7H16v10h-2.4z" />}
            </button>
          )}
          {showVideo && <span className="cb-progress" aria-hidden="true"><i style={{ width: `${progress}%` }} /></span>}
        </div>
      </div>

      <aside className="cb-dossier" aria-label="Situatiedossier">
        <header className="cb-dhead">
          <div className="cb-nexora">
            <span className="cb-hex" aria-hidden="true">{sector === "gemeenten" ? "G" : sector === "ministeries" ? "M" : "N"}</span>
            <strong>{skin("Nexora Technologies")}</strong>
          </div>
          <p className="cb-conf">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10V7a4 4 0 0 1 8 0v3M6 10h12v10H6z" /></svg>
            Vertrouwelijk<small>Alleen voor onderzoeksteams</small>
          </p>
        </header>
        <div className="cb-dtop">
          <div>
            <p className="cb-sit">Situatie</p>
            <h2>Verhoogde digitale dreiging</h2>
          </div>
          <figure>
            <img src="/brief-dock.jpg" alt={skin("De Dokzaal, locatie van Nexora Day")} />
            <figcaption>Dokzaal · {skin("Nexora Day")}</figcaption>
          </figure>
        </div>
        <p className="cb-lead">
          {skin("Tijdens Nexora Day zijn er verdachte digitale signalen gedetecteerd. Onze systemen vertonen afwijkend gedrag en er is een reëel risico op een gecoördineerde cyberaanval.")}
        </p>
        <p className="cb-status">Status: verhoogde digitale dreiging</p>
        <ul className="cb-facts">
          {FACTS.map((fact) => (
            <li key={fact.label} aria-label={skin("named" in fact && fact.named ? fact.named : `${fact.label}: ${fact.value}`)}>
              <FactIcon d={fact.d} />
              <span>{fact.label}<b>{skin(fact.value)}</b></span>
            </li>
          ))}
        </ul>
        <p className="cb-task-label">Jullie opdracht</p>
        <ol className="cb-objectives">
          {OBJECTIVES.map((item) => (
            <li key={item.n}>
              <Mark d={item.d} />
              <span><b>{item.n}. {item.title}</b>{item.text}</span>
            </li>
          ))}
        </ol>
      </aside>

      <footer className="cb-foot">
        <p className="cb-linkbadge">
          <span aria-hidden="true">!</span>
          <span>Beveiligde verbinding<small>Actief</small></span>
        </p>
        <div className="cb-thumbs" role="tablist" aria-label="Hoofdstukken van de briefing">
          {CHAPTERS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={chapter === item.id}
              className={chapter === item.id ? "on" : ""}
              onClick={() => setChapter(item.id)}
            >
              <img src={item.image} alt="" />
              <span><b>{index + 1}. {item.title}</b><small>{skin(item.sub)}</small></span>
            </button>
          ))}
        </div>
        <div className="cb-actions">
          <button className="cb-go" type="button" onClick={onStart}>
            Naar het onderzoek
            <span aria-hidden="true">→</span>
          </button>
          <div className="cb-tools">
            <button type="button" onClick={toggleSound} aria-pressed={audio}>{audio ? "Geluid aan" : "Geluid uit"}</button>
            <button type="button" onClick={() => setCaptions((value) => !value)} aria-pressed={captions}>Ondertiteling</button>
            <button type="button" onClick={replayBriefing}>Opnieuw afspelen</button>
          </div>
        </div>
      </footer>
    </section>
  );
}
