"use client";

import { useEffect, useRef, useState } from "react";

type Cue = { t: number; text: string };

function clock(total: number) {
  const safe = Math.max(0, Math.round(total));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [replay, setReplay] = useState(0);
  const [paused, setPaused] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [cues, setCues] = useState<Cue[]>([]);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const caption = [...cues].reverse().find((cue) => time >= cue.t - 0.05)?.text ?? "";

  useEffect(() => {
    fetch("/mara-intro.json")
      .then((response) => response.json())
      .then((data: { cues?: Cue[] }) => {
        if (data.cues) setCues(data.cues);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !audio;
    if (audio && video.paused && !paused) void video.play().catch(() => undefined);
  }, [audio, paused]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();
    else void video.play().catch(() => undefined);
  }, [paused]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || replay === 0) return;
    video.currentTime = 0;
    setTime(0);
    setPaused(false);
    void video.play().catch(() => undefined);
  }, [replay]);

  return (
    <section className="brief-app brief-film" aria-label="Briefing van Mara de Vries">
      <header className="brief-top">
        <div className="brief-brand">
          <span>N</span>
          <strong>NEXORA<small>TECHNOLOGIES</small></strong>
        </div>
        <p className="brief-conf">CONFIDENTIAL BRIEFING</p>
      </header>
      <div className="brief-stage">
        <div className="brief-video">
          <video
            ref={videoRef}
            className="mara-still"
            src="/mara-intro.mp4"
            poster="/mara-briefing.jpg"
            playsInline
            autoPlay
            muted={!audio}
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || duration)}
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
          />
          <span className="brief-live"><i />LIVE</span>
          <div className="brief-name">
            <b>N</b>
            <span>Mara de Vries<small>Operationeel manager<br />Nexora Technologies</small></span>
          </div>
          {captions && caption && <p className="brief-sub" aria-live="polite">{caption}</p>}
          <div className="brief-transport">
            <button type="button" aria-label={paused ? "Afspelen" : "Pauze"} onClick={() => setPaused((value) => !value)}>{paused ? "▶" : "❚❚"}</button>
            <span className="mono">{clock(time)} / {clock(duration)}</span>
            <span className="brief-bar" aria-hidden><i style={{ width: `${duration ? (time / duration) * 100 : 0}%` }} /></span>
            <button type="button" onClick={onToggleAudio} aria-label={audio ? "Geluid uit" : "Geluid aan"}>{audio ? "🔊" : "🔇"}</button>
            <button type="button" aria-pressed={captions} onClick={() => setCaptions((value) => !value)} aria-label="Ondertiteling">CC</button>
            <button type="button" onClick={() => setReplay((value) => value + 1)} aria-label="Opnieuw afspelen">↺</button>
          </div>
        </div>
      </div>
      <footer className="brief-foot brief-film-foot">
        <div>
          <strong>Mara de Vries</strong>
          <small>Operationeel manager · Nexora Technologies</small>
        </div>
        <button className="brief-go" type="button" onClick={onStart}>
          <span>→</span>
          <span>Start onderzoek<small>Naar de werkomgeving</small></span>
        </button>
      </footer>
    </section>
  );
}
