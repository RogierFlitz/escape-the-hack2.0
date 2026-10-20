"use client";

import { useEffect, useRef, useState } from "react";
import type { Speech } from "@/lib/game/story";
import { narrate, stopNarration } from "./narrate";

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

  const replayTick = useRef(replay);

  useEffect(() => {
    const line = scene.lines[index] ?? "";
    if (replayTick.current !== replay) {
      replayTick.current = replay;
      stopNarration();
    }
    let alive = true;
    if (audio) {
      narrate(line, true, () => {
        if (!alive || index >= scene.lines.length - 1) return;
        setIndex((value) => value + 1);
      });
      return () => {
        alive = false;
      };
    }
    narrate(line, false);
    if (index >= scene.lines.length - 1) return;
    const timer = window.setTimeout(() => setIndex((value) => value + 1), 3200);
    return () => window.clearTimeout(timer);
  }, [audio, scene.id, replay, index, scene.lines]);

  if (scene.id === "m2") {
    return <SupplierBrief scene={scene} onReplay={() => setReplay((value) => value + 1)} onDone={onDone} />;
  }

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

function SupplierBrief({
  scene,
  onReplay,
  onDone,
}: {
  scene: Speech;
  onReplay: () => void;
  onDone: () => void;
}) {
  return (
    <div className="m2-brief">
      <figure className="m2-shot">
        <img src="/kade/kade-portrait.jpg" alt="" />
        <span className="m2-tag tl">Unknown<br />threat<br />tracked</span>
        <span className="m2-tag tr">
          Helix<br />supplier
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 16H3z" /><path d="M12 9v5" /></svg>
        </span>
        <span className="m2-tag bl">Supply chain<br />infiltration<small>Nexora network</small></span>
        <div className="m2-film">
          <img src="/m2/port.jpg" alt="" />
          <img src="/m2/helix.jpg" alt="" />
          <img src="/m2/keys.jpg" alt="" />
        </div>
      </figure>
      <div className="m2-copy">
        <p className="kicker">{scene.kicker}</p>
        <h2>{scene.title}</h2>
        {scene.lines.map((line) => <p key={line}>{line}</p>)}
        <div className="m2-task">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>
          <div>
            <strong>Jullie opdracht</strong>
            <p>Onderzoek de beschikbare informatie en ontdek welk bericht echt van Helix Events afkomstig is.</p>
          </div>
        </div>
        <div className="m2-facts">
          <span><b>Berichten</b><small>E-mails en bijlagen</small></span>
          <span><b>Leverancier</b><small>Helix Events</small></span>
          <span><b>Let op details</b><small>Afzender, links en bijlagen</small></span>
        </div>
        <div className="m2-actions">
          <button className="btn" type="button" onClick={onReplay}>Opnieuw afspelen</button>
          <button className="btn btn-primary" type="button" onClick={onDone}>{scene.continueLabel}</button>
        </div>
      </div>
    </div>
  );
}
