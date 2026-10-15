"use client";

import { useEffect, useState } from "react";
import type { Speech } from "@/lib/game/story";

export function KadeTransmission({
  scene,
  audio,
  onDone,
  videoSrc,
}: {
  scene: Speech;
  audio: boolean;
  onDone: () => void;
  videoSrc?: string;
}) {
  const [index, setIndex] = useState(0);
  const [replay, setReplay] = useState(0);
  const last = index >= scene.lines.length - 1;
  const nora = scene.speaker === "nora";

  useEffect(() => {
    setIndex(0);
  }, [scene.id, replay]);

  useEffect(() => {
    if (!audio || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(scene.lines.join(" "));
    utterance.lang = "nl-NL";
    utterance.rate = 0.96;
    window.speechSynthesis.speak(utterance);
    return () => window.speechSynthesis.cancel();
  }, [audio, scene.id, replay, scene.lines]);

  useEffect(() => {
    if (last) return;
    const timer = window.setTimeout(() => setIndex((value) => value + 1), 2200);
    return () => window.clearTimeout(timer);
  }, [index, last, replay]);

  return (
    <div className="kade">
      {videoSrc && !nora ? (
        <video className="kade-portrait" src={videoSrc} autoPlay playsInline />
      ) : nora ? (
        <div className="kade-portrait nora-portrait" aria-hidden>
          <span className="nora-ring" />
          <span className="nora-core" />
        </div>
      ) : (
        <div className="kade-portrait kade-live" aria-hidden>
          <img src="/kade.jpg" alt="" />
          <span className="cine-noise" />
        </div>
      )}
      <div className="stack kade-copy">
        <p className="kicker">{scene.kicker} · {nora ? "NORA" : "KADE"}</p>
        <h2>{scene.title}</h2>
        {scene.lines.slice(0, index + 1).map((line) => (
          <p key={line}>{line}</p>
        ))}
        {scene.id === "k3" && last && (
          <div className="stack">
            {["planning-nexora-day.xlsx", "contracten-nexora.pdf", "crew-dokzaal.xlsx"].map((file) => (
              <div key={file} className="token"><small>Vergrendeld</small>{file}</div>
            ))}
          </div>
        )}
        {scene.learn && last && (
          <div className="stack">
            <div className="token"><small>Wat gebeurde er?</small>{scene.learn.deed}</div>
            <div className="token"><small>Waarom was dit gevaarlijk?</small>{scene.learn.hoe}</div>
            <div className="token"><small>Wat doe je op je eigen werk anders?</small>{scene.learn.voorkom}</div>
          </div>
        )}
        {(nora || last) && (
          <div className="row">
            {nora && <button className="btn" type="button" onClick={onDone}>Overslaan</button>}
            {last && <button className="btn" type="button" onClick={() => setReplay((value) => value + 1)}>Opnieuw afspelen</button>}
            {last && <button className="btn btn-primary" type="button" onClick={onDone}>{scene.continueLabel}</button>}
          </div>
        )}
      </div>
    </div>
  );
}

export function NoraStrip({ text }: { text: string }) {
  return (
    <div className="nora-strip">
      <span className="nora-mark" aria-hidden />
      <p><strong>NORA</strong> {text}</p>
    </div>
  );
}
