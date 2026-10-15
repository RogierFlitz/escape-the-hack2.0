"use client";

import { useState } from "react";
import { beacons, cameras, cipherText, evidence, helixLegend, helixMessage, sealSlots, shutdownSlots, suspects, symbolPalette, symbolRows } from "@/lib/game/content";
import type { Token } from "@/lib/types";
import { HoldButton, Keys, Seal, Shape } from "./ui";
import type { PuzzleProps } from "./early";

function decode(shift: number) {
  const turn = ((shift % 26) + 26) % 26;
  return cipherText.replace(/[A-Z]/g, (char) => String.fromCharCode(((char.charCodeAt(0) - 65 - turn + 26) % 26) + 65));
}

export function RotorPuzzle({ solved, busy, onSolve, inventory }: PuzzleProps & { inventory: Token[] }) {
  const [shift, setShift] = useState(0);
  const word = decode(shift);
  const route = inventory.find((token) => token.id.startsWith("ROUTE"));
  return (
    <div className="stack">
      <p>Rotatie = reknummer uit je route-token{route ? `: ${route.label}` : ""}.</p>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="key" type="button" disabled={solved} onClick={() => setShift((value) => value - 1)}>−</button>
        <div className="mono rotor">{String(((shift % 26) + 26) % 26).padStart(2, "0")}</div>
        <button className="key" type="button" disabled={solved} onClick={() => setShift((value) => value + 1)}>+</button>
      </div>
      <div className="mono" style={{ textAlign: "center" }}>{cipherText} → {word}</div>
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy} onClick={() => onSolve({ word })}>Plaintext bevestigen</button>}
    </div>
  );
}

export function SequencePuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [value, setValue] = useState("");
  return (
    <div className="stack">
      <p>Bakenintervallen. Het verschil tussen de getallen groeit met één.</p>
      <div className="bars">
        {beacons.map((item) => (
          <div key={item} className="bar mono" style={{ height: `${item * 8}px` }}>{item}</div>
        ))}
        <div className="bar mono" style={{ height: "24px", background: "#1a2838" }}>?</div>
      </div>
      <div className="mono rotor">{value || "--"}</div>
      <Keys keys={["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "⌫"]} disabled={solved} onKey={(key) => setValue((current) => (key === "⌫" ? current.slice(0, -1) : (current + key).slice(0, 2)))} />
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || !value} onClick={() => onSolve({ value: Number(value) })}>Interval vastzetten</button>}
    </div>
  );
}

const shapeName: Record<string, string> = { diamond: "ruit", square: "vierkant", circle: "cirkel", triangle: "driehoek" };

export function SymbolPuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [shape, setShape] = useState("");
  return (
    <div className="stack">
      <p>Elke rij is de vorige rij, één plek naar links geschoven.</p>
      <div className="stack">
        {symbolRows.map((row, index) => (
          <div key={index} className="row">
            {row.map((cell, cellIndex) => (
              <div key={cellIndex} className="slot" style={{ display: "grid", placeItems: "center" }}>
                {cell ? <Shape name={cell} /> : <span className="mono">?</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="row">
        {symbolPalette.map((item) => (
          <button key={item} type="button" className={shape === item ? "chip on" : "chip"} onClick={() => setShape(item)}>
            <Shape name={item} /> {shapeName[item]}
          </button>
        ))}
      </div>
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || !shape} onClick={() => onSolve({ shape })}>Patroon sluiten</button>}
    </div>
  );
}

export function DecodePuzzle({ solved, busy, onSolve, onOpenFile }: PuzzleProps & { onOpenFile: (id: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <div className="stack">
      <div className="row">
        {helixLegend.map((item) => (
          <div key={item.symbol} className="token mono"><strong>{item.symbol}</strong><small>{item.value}</small></div>
        ))}
      </div>
      <div className="mono rotor">{helixMessage.join("  ")}</div>
      <div className="mono">{code || "----"}</div>
      <Keys keys={["H", "X", "1", "9", "7", "4", "A", "5", "⌫"]} disabled={solved} onKey={(key) => setCode((value) => (key === "⌫" ? value.slice(0, -1) : (value + key).slice(0, 4)))} />
      <button className="btn btn-ghost" type="button" onClick={() => onOpenFile("helix-key")}>Open helix-key.txt</button>
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || code.length < 4} onClick={() => onSolve({ code })}>Sleutel toepassen</button>}
    </div>
  );
}

export function CameraPuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [frame, setFrame] = useState("");
  return (
    <div className="stack">
      <div className="grid-2">
        {cameras.map((cam) => (
          <button key={cam.id} type="button" className={`still still-${cam.id}${frame === cam.id ? " on" : ""}`} onClick={() => setFrame(cam.id)}>
            <span className="person" />
            {cam.id === "cafe" && <span className="prop" style={{ left: 16, bottom: 56 }}>badge 4418</span>}
            {cam.id === "dock" && <span className="helix-tag mono">HELIX</span>}
            {cam.id === "rack" && <span className="prop" style={{ right: 12, top: 16 }}>REK 7</span>}
            {cam.id === "cafe" && <span className="table" />}
            <span className="mono">{cam.time} · {cam.place}</span>
            <small className="muted">{cam.note}</small>
          </button>
        ))}
      </div>
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || !frame} onClick={() => onSolve({ frame })}>Beeld markeren</button>}
    </div>
  );
}

export function AccusePuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [suspect, setSuspect] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  function toggle(id: string) {
    setPicked((list) => (list.includes(id) ? list.filter((item) => item !== id) : list.length >= 3 ? list : [...list, id]));
  }
  return (
    <div className="stack">
      <div className="grid-2">
        {suspects.map((person) => (
          <button key={person.id} type="button" className={suspect === person.id ? "suspect on" : "suspect"} onClick={() => setSuspect(person.id)}>
            <strong>{person.name}</strong>
            <div className="muted">{person.role}</div>
          </button>
        ))}
      </div>
      <p className="muted">Kies drie bewijzen. {picked.length}/3</p>
      <div className="stack">
        {evidence.map((item) => (
          <button key={item.id} type="button" className={picked.includes(item.id) ? "chip on" : "chip"} onClick={() => toggle(item.id)}>{item.label}</button>
        ))}
      </div>
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || !suspect || picked.length !== 3} onClick={() => onSolve({ suspect, evidence: picked })}>Lek aanwijzen</button>}
    </div>
  );
}

export function SealPuzzle({ solved, busy, onSolve, inventory }: PuzzleProps & { inventory: Token[] }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  return (
    <div className="stack">
      <div className="row">
        {inventory.map((token) => (
          <button key={token.id} type="button" className={picked === token.id ? "chip on" : "chip"} onClick={() => setPicked(token.id)}>{token.label}</button>
        ))}
      </div>
      <div className="stack">
        {sealSlots.map((slot) => (
          <button key={slot.id} type="button" className={placed[slot.id] ? "token on" : "token"} disabled={!picked && !placed[slot.id]} onClick={() => {
            if (!picked) return;
            setPlaced((prev) => ({ ...prev, [slot.id]: picked }));
            setPicked(null);
          }}>
            <strong>{slot.title}</strong>
            <small>{slot.ask}</small>
            <div className="mono">{placed[slot.id] ?? "leeg"}</div>
          </button>
        ))}
      </div>
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || !placed.perimeter || !placed.trace || !placed.lockout} onClick={() => onSolve(placed)}>Zegels sluiten</button>}
    </div>
  );
}

export function ShutdownPuzzle({ solved, busy, onSolve, inventory }: PuzzleProps & { inventory: Token[] }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [order, setOrder] = useState<(string | null)[]>([null, null, null, null]);
  function place(index: number) {
    if (!picked) return;
    setOrder((prev) => prev.map((item, itemIndex) => (itemIndex === index ? picked : item === picked ? null : item)));
    setPicked(null);
  }
  return (
    <div className="stack">
      <p>Ω-protocol: override, forensisch zegel, route, contractor.</p>
      <div className="row">
        {inventory.map((token) => (
          <button key={token.id} type="button" className={picked === token.id ? "chip on" : "chip"} onClick={() => setPicked(token.id)}>{token.label}</button>
        ))}
      </div>
      <div className="grid-2">
        {shutdownSlots.map((slot, index) => (
          <button key={slot.id} type="button" className={order[index] ? "token on" : "token"} onClick={() => place(index)}>
            <strong>{slot.title}</strong>
            <small>{slot.ask}</small>
            <div className="mono">{order[index] ?? "leeg"}</div>
          </button>
        ))}
      </div>
      {solved ? <Seal /> : (
        <HoldButton label="Vasthouden om shutdown te starten" disabled={busy || order.some((item) => !item)} onHold={() => onSolve({ order })} />
      )}
    </div>
  );
}
