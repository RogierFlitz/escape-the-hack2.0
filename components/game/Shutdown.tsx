"use client";

import { useEffect, useState } from "react";
import { playGlitch } from "./audio";
import {
  alertLines,
  finaleClues,
  finaleSessions,
  kadeAfterRevoke,
  noraReady,
  noraShutdown,
  restoreChecks,
  sealNodes,
  shutdownSteps,
} from "@/lib/game/shutdown";
import type { Token } from "@/lib/types";

function useDraft<T>(id: string, initial: T) {
  const key = `eth-m6-${id}`;
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* keep the empty case file */
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, ready, value]);
  return [value, setValue] as const;
}

export function FinaleAlerts({ audio, onDone }: { audio: boolean; onDone: () => void }) {
  const [line, setLine] = useState(0);
  useEffect(() => {
    if (audio) playGlitch();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (line >= alertLines.length - 1) return;
    const timer = window.setTimeout(() => setLine((value) => value + 1), 900);
    return () => window.clearTimeout(timer);
  }, [audio, line]);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shown = reduced ? alertLines : alertLines.slice(0, line + 1);
  const ready = reduced || line >= alertLines.length - 1;
  return (
    <div className="sd-alert">
      {shown.map((item) => <p key={item}>{item}</p>)}
      {ready && <button className="btn btn-mint" type="button" onClick={onDone}>Crisis openen</button>}
    </div>
  );
}

export function ShutdownDesk({
  step,
  busy,
  inventory,
  onAccess,
  onRevoke,
  onBackup,
  onSolve,
}: {
  step: "access" | "revoke" | "seals" | "backup-check" | "shutdown";
  busy: boolean;
  inventory: Token[];
  onAccess: (id: string, clues: string[]) => void;
  onRevoke: () => void;
  onBackup: (checks: string[]) => void;
  onSolve: (payload: unknown) => void;
}) {
  const [reaction, setReaction] = useState(false);
  const [line, setLine] = useState(0);
  const revoked = step !== "access" && step !== "revoke";

  useEffect(() => {
    if (step !== "seals") return;
    if (sessionStorage.getItem("eth-m6-react")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReaction(true);
      setLine(kadeAfterRevoke.length - 1);
      return;
    }
    setReaction(true);
  }, [step]);

  useEffect(() => {
    if (!reaction || line >= kadeAfterRevoke.length - 1) return;
    const timer = window.setTimeout(() => setLine((value) => value + 1), 1600);
    return () => window.clearTimeout(timer);
  }, [reaction, line]);

  return (
    <div className={`rv sd${revoked ? " sd-cut" : ""}`}>
      <div className="rv-main">
        {step === "access" && <p className="fp-nora">{noraShutdown}</p>}
        <Map revoked={revoked} />
        {step === "shutdown" && (
          <div className="sd-ready">
            {noraReady.map((item) => <p key={item}>{item}</p>)}
          </div>
        )}
      </div>
      {reaction && line < kadeAfterRevoke.length ? (
        <aside className="fp-side">
          <p className="kicker">KADE</p>
          <p>{kadeAfterRevoke[line]}</p>
          {line >= kadeAfterRevoke.length - 1 && (
            <button className="btn btn-mint" type="button" onClick={() => { sessionStorage.setItem("eth-m6-react", "1"); setReaction(false); }}>Verder</button>
          )}
        </aside>
      ) : step === "access" ? (
        <AccessCase busy={busy} onAccess={onAccess} />
      ) : step === "revoke" ? (
        <RevokeCase busy={busy} onRevoke={onRevoke} />
      ) : step === "seals" ? (
        <SealCase busy={busy} inventory={inventory} onSolve={onSolve} />
      ) : step === "backup-check" ? (
        <CheckCase busy={busy} onBackup={onBackup} />
      ) : (
        <OrderCase busy={busy} inventory={inventory} onSolve={onSolve} />
      )}
    </div>
  );
}

function Map({ revoked }: { revoked: boolean }) {
  const nodes = [
    { id: "nex", label: "NEX", at: "8% / 22%" },
    { id: "edge", label: "EDGE", at: "32% / 22%" },
    { id: "auth", label: "AUTH", at: "56% / 22%" },
    { id: "vault", label: "VAULT", at: "80% / 22%" },
    { id: "log", label: "LOG", at: "56% / 68%" },
  ];
  return (
    <div className="sd-map" aria-hidden>
      <span className={`sd-link${revoked ? " down" : ""}`} />
      {nodes.map((node) => <b key={node.id} style={{ left: node.at.split(" / ")[0], top: node.at.split(" / ")[1] }}>{node.label}</b>)}
      <i className={revoked ? "down" : ""}>export-node</i>
    </div>
  );
}

function AccessCase({ busy, onAccess }: { busy: boolean; onAccess: (id: string, clues: string[]) => void }) {
  const [session, setSession] = useDraft("access-session", "");
  const [clues, setClues] = useDraft<string[]>("access-clues", []);
  function toggle(id: string) {
    setClues((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }
  return (
    <aside className="fp-side">
      <p className="kicker">Sessies</p>
      <p>Kies de sessie die niet bij een gewone taak hoort, en minstens twee sporen die dat laten zien.</p>
      <div className="sd-sessions">
        {finaleSessions.map((item) => (
          <button key={item.id} className={session === item.id ? "on" : ""} type="button" onClick={() => setSession(item.id)}>
            <strong>{item.title}</strong>
            <span>{item.where}</span>
            <small>{item.note}</small>
          </button>
        ))}
      </div>
      <div className="sp-picks">
        {finaleClues.map((clue) => (
          <button key={clue.id} className={`fp-chip${clues.includes(clue.id) ? " on" : ""}`} type="button" onClick={() => toggle(clue.id)}>{clue.label}</button>
        ))}
      </div>
      <button className="btn btn-mint" type="button" disabled={busy || !session || clues.length < 2} onClick={() => onAccess(session, clues)}>Sessie vastleggen</button>
    </aside>
  );
}

function RevokeCase({ busy, onRevoke }: { busy: boolean; onRevoke: () => void }) {
  const [sure, setSure] = useState(false);
  return (
    <aside className="fp-side">
      <p className="kicker">Intrekken</p>
      <p>De gekozen sessie hangt aan EDGE, AUTH en de export-node. De log blijft bewaard.</p>
      <button className={`fp-chip${sure ? " on" : ""}`} type="button" onClick={() => setSure(true)}>Ik trek deze sessie in</button>
      <button className="btn btn-mint" type="button" disabled={busy || !sure} onClick={onRevoke}>Lijn verbreken</button>
    </aside>
  );
}

function SealCase({ busy, inventory, onSolve }: { busy: boolean; inventory: Token[]; onSolve: (payload: unknown) => void }) {
  const [picked, setPicked] = useDraft("seal-pick", "");
  const [placed, setPlaced] = useDraft<Record<string, string>>("seal-placed", {});
  const ready = Boolean(placed.perimeter && placed.trace && placed.lockout);
  return (
    <aside className="fp-side">
      <p className="kicker">Vastzetten</p>
      <p>Leg een token op het systeem dat daarbij past. De namen staan in de inventaris.</p>
      <div className="sp-picks">
        {inventory.map((token) => (
          <button key={token.id} className={`fp-chip${picked === token.id ? " on" : ""}`} type="button" onClick={() => setPicked(token.id)}>{token.label}</button>
        ))}
      </div>
      {sealNodes.map((node) => (
        <button key={node.id} className="sd-node" type="button" onClick={() => picked && setPlaced((current) => ({ ...current, [node.id]: picked }))}>
          <b>{node.label}</b>
          <span>{inventory.find((token) => token.id === placed[node.id])?.label ?? "leeg"}</span>
        </button>
      ))}
      <button className="btn btn-mint" type="button" disabled={busy || !ready} onClick={() => onSolve(placed)}>Systemen vastzetten</button>
    </aside>
  );
}

function CheckCase({ busy, onBackup }: { busy: boolean; onBackup: (checks: string[]) => void }) {
  const [checks, setChecks] = useDraft<string[]>("checks", []);
  function toggle(id: string) {
    setChecks((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }
  return (
    <aside className="fp-side">
      <p className="kicker">Herstelcontrole</p>
      <p>Vink wat klopt. Er staat nog één lijn open die niet bij de schone set hoort.</p>
      <div className="sp-picks">
        {restoreChecks.map((item) => (
          <button key={item.id} className={`fp-chip${checks.includes(item.id) ? " on" : ""}`} type="button" onClick={() => toggle(item.id)}>{item.label}</button>
        ))}
      </div>
      <button className="btn btn-mint" type="button" disabled={busy || checks.length === 0} onClick={() => onBackup(checks)}>Controle vastleggen</button>
    </aside>
  );
}

function OrderCase({ busy, inventory, onSolve }: { busy: boolean; inventory: Token[]; onSolve: (payload: unknown) => void }) {
  const [picked, setPicked] = useDraft("order-pick", "");
  const [order, setOrder] = useDraft<(string | null)[]>("order", [null, null, null, null]);
  const ready = order.every(Boolean);
  function place(index: number) {
    if (!picked) return;
    setOrder((current) => current.map((item, itemIndex) => (itemIndex === index ? picked : item === picked ? null : item)));
    setPicked("");
  }
  function finish() {
    onSolve({ order });
  }
  return (
    <aside className="fp-side">
      <p className="kicker">Afsluiten</p>
      <p>Zet de vier vondsten in de volgorde van de missies.</p>
      <div className="sp-picks">
        {inventory.map((token) => (
          <button key={token.id} className={`fp-chip${picked === token.id ? " on" : ""}`} type="button" onClick={() => setPicked(token.id)}>{token.label}</button>
        ))}
      </div>
      {shutdownSteps.map((step, index) => (
        <button key={step.id} className="sd-node" type="button" onClick={() => place(index)}>
          <b>{index + 1}. {step.label}</b>
          <span>{inventory.find((token) => token.id === order[index])?.label ?? "leeg"}</span>
        </button>
      ))}
      <button className="btn btn-mint sd-hold" type="button" disabled={busy || !ready} onPointerDown={(event) => {
        const target = event.currentTarget;
        const timer = window.setTimeout(() => { finish(); window.clearTimeout(timer); }, 700);
        const stop = () => window.clearTimeout(timer);
        target.addEventListener("pointerup", stop, { once: true });
        target.addEventListener("pointerleave", stop, { once: true });
      }}>Vasthouden om af te sluiten</button>
      <button className="btn" type="button" disabled={busy || !ready} onClick={finish}>Bevestig afsluiten</button>
    </aside>
  );
}
