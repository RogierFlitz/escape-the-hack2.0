"use client";

import { useEffect } from "react";
import type { Flow } from "@/lib/game/network";
import { orderedFlows } from "./shared";

export function Mission3Timeline({
  selectedId,
  playing,
  onPick,
  onPlaying,
}: {
  selectedId: string | null;
  playing: boolean;
  onPick: (id: string) => void;
  onPlaying: (value: boolean) => void;
}) {
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const index = orderedFlows.findIndex((row) => row.id === selectedId);
      const next = orderedFlows[index < 0 ? 0 : (index + 1) % orderedFlows.length];
      onPick(next.id);
    }, 1600);
    return () => window.clearInterval(timer);
  }, [playing, selectedId, onPick]);

  return (
    <div className="soc-time" aria-label="Tijdlijn">
      <button className={`soc-play${playing ? " on" : ""}`} type="button" onClick={() => onPlaying(!playing)}>
        {playing ? "Pauze" : "Afspelen"}
      </button>
      <div className="soc-ticks">
        {orderedFlows.map((row) => (
          <button key={row.id} type="button" className={selectedId === row.id ? "on" : ""} onClick={() => { onPlaying(false); onPick(row.id); }}>
            <b>{row.time}</b>
            <small>{shortNote(row)}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function shortNote(row: Flow) {
  const note = row.note.replace(/\.$/, "");
  return note.length > 28 ? `${note.slice(0, 26)}…` : note;
}
