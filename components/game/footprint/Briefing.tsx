"use client";

import { noraArchive } from "@/lib/game/footprint";
import type { DeskMode } from "./meta";

export function Mission1Briefing({
  filled,
  total,
  open,
  mode,
  text,
  action,
  onToggle,
  onMode,
}: {
  filled: number;
  total: number;
  open: boolean;
  mode: DeskMode;
  text?: string;
  action?: string;
  onToggle: () => void;
  onMode: (mode: DeskMode) => void;
}) {
  return (
    <div className="m1-nora">
      <span className="m1-nora-face" aria-hidden>N</span>
      <div>
        <p>
          <b>NORA</b>
          <span>Onderzoeksbriefing</span>
        </p>
        <p className="m1-now"><b>Nu doen.</b> {text ?? "Open een bron, koppel die aan een vraag en dien de verbanden in."}</p>
        {open && (
          <div className="m1-more">
            <p>{noraArchive}</p>
            {action && <p>Handeling: {action}.</p>}
          </div>
        )}
      </div>
      <div className="m1-modes" role="tablist" aria-label="Werkstand">
        <button type="button" role="tab" aria-selected={mode === "sources"} onClick={() => onMode("sources")}>Bronnen</button>
        <button type="button" role="tab" aria-selected={mode === "board"} onClick={() => onMode("board")}>
          Onderzoeksbord
          <b>{filled}/{total}</b>
        </button>
      </div>
      <button type="button" aria-expanded={open} onClick={onToggle}>{open ? "Minder uitleg" : "Meer uitleg"}</button>
    </div>
  );
}
