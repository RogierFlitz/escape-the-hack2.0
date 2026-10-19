"use client";

import { useEffect, useRef, useState } from "react";
import { files, network, puzzleCues } from "@/lib/game/content";
import { flows, nodeInfo } from "@/lib/game/network";
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
import { playGlitch, playLock, playOk } from "./audio";
import "./shutdown/desk.css";

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

const phases = [
  { id: "overview", label: "Overzicht" },
  { id: "sessions", label: "Sessie-analyse" },
  { id: "links", label: "Verbindingen" },
  { id: "actions", label: "Acties" },
  { id: "close", label: "Afsluiten" },
] as const;

type Phase = (typeof phases)[number]["id"];
type Step = "access" | "revoke" | "seals" | "backup-check" | "shutdown";

const actionOrder: Step[] = ["access", "revoke", "seals", "backup-check", "shutdown"];

const mapNodes = [
  ...network.nodes.map((node) => ({ id: node.id, label: node.label, x: node.x, y: node.y })),
  { id: "EXPORT", label: "export-node", x: 90, y: 78 },
];

const exportLog = (files.find((file) => file.id === "export")?.body ?? "").split("\n").filter(Boolean);

function labelOf(id: string) {
  return mapNodes.find((node) => node.id === id)?.label ?? id;
}

function pairKey(left: string, right: string) {
  return [left, right].sort().join(">");
}

function edgeTone(a: string, b: string, revoked: boolean) {
  const key = pairKey(labelOf(a), labelOf(b));
  const match = flows.filter((row) => pairKey(row.source, row.dest) === key && row.unusual);
  if (match.some((row) => row.account === "helix-svc")) return revoked ? "cut" : "hot";
  if (match.some((row) => row.account === "backup-svc")) return "warm";
  if (match.some((row) => row.status === "geweigerd")) return revoked ? "cut" : "hot";
  return "";
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
    <div className="m6-open">
      {shown.map((item) => <p key={item}>{item}</p>)}
      {ready && <button className="m6-go" type="button" onClick={onDone}>Crisis openen</button>}
    </div>
  );
}

export function RestoreCine({ score, onDone }: { score: number; onDone: () => void }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(onDone, 2800);
    return () => window.clearTimeout(timer);
  }, [onDone]);
  return (
    <div className="m6-restored" role="status">
      <div className="m6-safe" aria-hidden>
        {["NEX", "EDGE", "DNS", "AUTH", "VAULT", "LOG"].map((node) => <b key={node}>{node}</b>)}
      </div>
      <h2>SYSTEM RESTORED</h2>
      <p>{score} pt</p>
      <button className="m6-go" type="button" onClick={onDone}>Naar het rapport</button>
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
  step: Step;
  busy: boolean;
  inventory: Token[];
  onAccess: (id: string, clues: string[]) => void;
  onRevoke: () => void;
  onBackup: (checks: string[]) => void;
  onSolve: (payload: unknown) => void;
}) {
  const preferred: Phase = step === "access" ? "sessions" : step === "shutdown" ? "close" : step === "revoke" ? "links" : "actions";
  const [section, setSection] = useState<Phase>(preferred);
  const [node, setNode] = useState<string | null>(null);
  const [flowId, setFlowId] = useState<string | null>(flows.find((row) => row.account === "helix-svc")?.id ?? null);
  const [flash, setFlash] = useState("");
  const [cut, setCut] = useState(false);
  const [kade, setKade] = useState(false);
  const previous = useRef(step);
  const revoked = step !== "access" && step !== "revoke";
  const cue = puzzleCues[step];

  useEffect(() => {
    setSection(preferred);
  }, [preferred]);

  useEffect(() => {
    if (previous.current === step) return;
    const from = previous.current;
    previous.current = step;
    const text = from === "access" ? "Sessie vastgelegd." : from === "revoke" ? "Sessie ingetrokken." : from === "seals" ? "Systemen vastgezet." : from === "backup-check" ? "Herstel gecontroleerd." : "";
    if (!text) return;
    setFlash(text);
    if (from === "revoke") {
      setCut(true);
      playLock();
    } else playOk();
    const timer = window.setTimeout(() => { setFlash(""); setCut(false); }, 1600);
    return () => window.clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step !== "seals" || sessionStorage.getItem("eth-m6-react")) return;
    setKade(true);
  }, [step]);

  return (
    <div className="m6">
      <div className="m6-top">
        <div className="m6-status">
          <span className={revoked ? "up" : "bad"}>{revoked ? "Sessie ingetrokken" : "Sessie open"}</span>
          <span className="up">LOG online</span>
          <span className={step === "shutdown" ? "up" : "warn"}>{step === "shutdown" ? "Herstel gecontroleerd" : "Herstel open"}</span>
        </div>
        {cue && <p className="m6-cue"><b>Nu doen. </b>{cue.text}</p>}
        {step === "access" && (
          <details className="m6-kade">
            <summary>NORA</summary>
            <p>{noraShutdown}</p>
          </details>
        )}
        {kade && <KadeNote onDone={() => { sessionStorage.setItem("eth-m6-react", "1"); setKade(false); }} />}
      </div>
      <nav className="m6-tabs" aria-label="Commandocentrale">
        {phases.map((item, index) => (
          <button key={item.id} className={section === item.id ? "on" : ""} type="button" aria-pressed={section === item.id} onClick={() => setSection(item.id)}>
            {index + 1}. {item.label}
          </button>
        ))}
      </nav>
      <div className="m6-stage">
        {section === "overview" && <Overview revoked={revoked} node={node} onNode={setNode} step={step} />}
        {section === "sessions" && <Sessions step={step} busy={busy} onAccess={onAccess} />}
        {section === "links" && <Links flowId={flowId} onFlow={setFlowId} revoked={revoked} />}
        {section === "actions" && (
          <Actions step={step} busy={busy} inventory={inventory} onRevoke={onRevoke} onBackup={onBackup} onSolve={onSolve} />
        )}
        {section === "close" && <CloseStep step={step} busy={busy} inventory={inventory} onSolve={onSolve} />}
        {flash && <div className="m6-flash" role="status">{flash}</div>}
        {cut && <div className="m6-cut" role="status">Verbinding verbroken. De log blijft staan.</div>}
      </div>
    </div>
  );
}

function KadeNote({ onDone }: { onDone: () => void }) {
  const [line, setLine] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLine(kadeAfterRevoke.length - 1);
      return;
    }
    if (line >= kadeAfterRevoke.length - 1) return;
    const timer = window.setTimeout(() => setLine((value) => value + 1), 1400);
    return () => window.clearTimeout(timer);
  }, [line]);
  return (
    <details className="m6-kade" open>
      <summary>KADE</summary>
      <p>{kadeAfterRevoke[line]}</p>
      {line >= kadeAfterRevoke.length - 1 && <button className="m6-mini" type="button" onClick={onDone}>Verder</button>}
    </details>
  );
}

function Overview({ revoked, node, onNode, step }: { revoked: boolean; node: string | null; onNode: (id: string) => void; step: Step }) {
  const current = mapNodes.find((item) => item.id === node);
  const info = node ? nodeInfo[node] : null;
  const spot = (id: string) => {
    const item = mapNodes.find((entry) => entry.id === id);
    return item ? { x: 50 + item.x * 9, y: 40 + item.y * 5.2 } : { x: 0, y: 0 };
  };
  return (
    <div className="m6-split wide">
      <section className="m6-pane" aria-label="Netwerk">
        <header><h2>Netwerk</h2></header>
        <div className="m6-mapwrap">
          <svg className="m6-map" viewBox="0 0 1000 620">
            {network.edges.map(([a, b]) => {
              const from = spot(a);
              const to = spot(b);
              return <line key={`${a}-${b}`} className={`m6-edge ${edgeTone(a, b, revoked)}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
            })}
            {mapNodes.map((item) => {
              const at = spot(item.id);
              const tone = step === "shutdown" ? "safe" : "";
              return (
                <g key={item.id} className={`m6-node${node === item.id ? " on" : ""} ${tone}`} onClick={() => onNode(item.id)}>
                  <circle cx={at.x} cy={at.y} r="46" />
                  <text x={at.x} y={at.y + 5}>{item.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>
      <section className="m6-pane">
        <header><h2>{current ? current.label : "Systeem"}</h2></header>
        <div className="m6-detail">
          {!current && <p className="m6-empty">Tik een systeem voor de rol die het al in het netwerk heeft.</p>}
          {info && <p><b>Rol</b>{info.role}</p>}
          {current?.id === "EXPORT" && <pre className="m6-warn">{exportLog.join("\n")}</pre>}
          {!revoked && alertLines.map((item) => <p key={item} className="m6-warn">{item}</p>)}
          {step === "shutdown" && noraReady.map((item) => <p key={item}>{item}</p>)}
        </div>
      </section>
    </div>
  );
}

function Sessions({ step, busy, onAccess }: { step: Step; busy: boolean; onAccess: (id: string, clues: string[]) => void }) {
  const [session, setSession] = useDraft("access-session", "");
  const [marked, setMarked] = useDraft("access-marked", "");
  const [clues, setClues] = useDraft<string[]>("access-clues", []);
  const open = finaleSessions.find((item) => item.id === session);
  const locked = step !== "access";
  function toggle(id: string) {
    setClues((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }
  return (
    <div className="m6-split">
      <section className="m6-pane" aria-label="Sessies">
        <header><h2>Actieve sessies</h2><span className="m6-count">{finaleSessions.length}</span></header>
        <div className="m6-scroll">
          {finaleSessions.map((item) => (
            <button key={item.id} className={`m6-card${session === item.id ? " on" : ""}`} type="button" onClick={() => setSession(item.id)}>
              <b>{item.title}</b>
              <span>{item.where}</span>
              <small>{item.note}</small>
              {session === item.id && !locked && <i className="m6-badge">Geselecteerd</i>}
              {locked && marked === item.id && <i className="m6-badge">Aangewezen</i>}
            </button>
          ))}
        </div>
      </section>
      <section className="m6-pane">
        <header><h2>{open ? open.title : "Sessie"}</h2></header>
        <div className="m6-detail">
          {!open && <p className="m6-empty">Kies een sessie. Een open kaart is nog geen conclusie.</p>}
          {open && (
            <>
              <p><b>Plaats</b>{open.where}</p>
              <p><b>Wat de log zegt</b>{open.note}</p>
              <p className="m6-count">Sporen {clues.length} · minstens 2</p>
              <div className="m6-chips">
                {finaleClues.map((clue) => (
                  <button key={clue.id} className={`m6-chip${clues.includes(clue.id) ? " on" : ""}`} type="button" disabled={locked} onClick={() => toggle(clue.id)}>{clue.label}</button>
                ))}
              </div>
              {!locked && <button className="m6-go" type="button" disabled={busy || !session || clues.length < 2} onClick={() => { setMarked(session); onAccess(session, clues); }}>Sessie vastleggen</button>}
              {locked && <p>Deze aanwijzing is vastgelegd. De volgende actie staat onder Acties.</p>}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function Links({ flowId, onFlow, revoked }: { flowId: string | null; onFlow: (id: string) => void; revoked: boolean }) {
  const [account, setAccount] = useState("alle");
  const accounts = ["alle", ...new Set(flows.filter((row) => row.bucket === "nacht").map((row) => row.account))];
  const visible = flows.filter((row) => row.bucket === "nacht" && (account === "alle" || row.account === account));
  const open = flows.find((row) => row.id === flowId) ?? null;
  return (
    <div className="m6-split">
      <section className="m6-pane" aria-label="Verbindingen">
        <header><h2>Nachtelijke verbindingen</h2></header>
        <div className="m6-filters">
          {accounts.map((item) => (
            <button key={item} className={account === item ? "on" : ""} type="button" onClick={() => setAccount(item)}>{item}</button>
          ))}
        </div>
        <div className="m6-scroll">
          {visible.map((row) => (
            <button key={row.id} className={`m6-row${flowId === row.id ? " on" : ""}`} type="button" onClick={() => onFlow(row.id)}>
              <b>{row.time}</b>
              <span>{row.source} → {row.dest}<small>{row.account} · {row.status}</small></span>
            </button>
          ))}
          {exportLog.map((line) => (
            <button key={line} className={`m6-row${flowId === line ? " on" : ""}`} type="button" onClick={() => onFlow(line)}>
              <b>log</b>
              <span>{line}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="m6-pane">
        <header><h2>{open ? `${open.source} → ${open.dest}` : "Exportlog"}</h2></header>
        <div className="m6-detail">
          {open && (
            <>
              <p><b>Tijd</b>{open.time}</p>
              <p><b>Account</b>{open.account}</p>
              <p><b>Status</b>{open.status}</p>
              <p><b>Notitie</b>{open.note}</p>
              {revoked && open.account === "helix-svc" && <p className="m6-warn">Deze lijn is ingetrokken. De regel blijft in de log.</p>}
            </>
          )}
          {!open && flowId && <pre className="m6-warn">{flowId}</pre>}
          {!flowId && <p className="m6-empty">Tik een regel om de sprong te lezen.</p>}
        </div>
      </section>
    </div>
  );
}

function Actions({
  step,
  busy,
  inventory,
  onRevoke,
  onBackup,
  onSolve,
}: {
  step: Step;
  busy: boolean;
  inventory: Token[];
  onRevoke: () => void;
  onBackup: (checks: string[]) => void;
  onSolve: (payload: unknown) => void;
}) {
  const items = [
    { id: "access" as const, title: "Sessie aanwijzen", detail: "Kies de sessie en minstens twee sporen." },
    { id: "revoke" as const, title: "Sessie intrekken", detail: "De log blijft bewaard." },
    { id: "seals" as const, title: "Systemen vastzetten", detail: "Leg een token op elk systeem." },
    { id: "backup-check" as const, title: "Herstelcontrole", detail: "Vink wat bij de schone set hoort." },
    { id: "shutdown" as const, title: "Afsluiten", detail: "Zet de vondsten in de volgorde van de missies." },
  ];
  const at = actionOrder.indexOf(step);
  return (
    <div className="m6-split">
      <section className="m6-pane" aria-label="Acties">
        <header><h2>Shutdownprocedure</h2></header>
        <div className="m6-scroll">
          {items.map((item, index) => {
            const state = index < at ? "done" : index === at ? "now" : "wait";
            const label = state === "done" ? "Voltooid" : state === "now" ? (busy ? "Bezig" : "Beschikbaar") : "Geblokkeerd";
            return (
              <article key={item.id} className={`m6-step ${state}`}>
                <i>{index + 1}</i>
                <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                <em>{label}</em>
              </article>
            );
          })}
        </div>
      </section>
      <section className="m6-pane">
        <header><h2>{items.find((item) => item.id === step)?.title}</h2></header>
        <div className="m6-detail">
          {step === "access" && <p>Wijs eerst de sessie aan onder Sessie-analyse. Intrekken blijft geblokkeerd tot die aanwijzing is vastgelegd.</p>}
          {step === "revoke" && <Revoke busy={busy} onRevoke={onRevoke} />}
          {step === "seals" && <Seals busy={busy} inventory={inventory} onSolve={onSolve} />}
          {step === "backup-check" && <Checks busy={busy} onBackup={onBackup} />}
          {step === "shutdown" && <p>De controles zijn rond. De afsluitvolgorde staat onder Afsluiten.</p>}
        </div>
      </section>
    </div>
  );
}

function Revoke({ busy, onRevoke }: { busy: boolean; onRevoke: () => void }) {
  const [sure, setSure] = useState(false);
  return (
    <>
      <p>De gekozen sessie hangt aan EDGE, AUTH en de export-node. De log blijft bewaard.</p>
      <button className={`m6-chip${sure ? " on" : ""}`} type="button" onClick={() => setSure(true)}>Ik trek deze sessie in</button>
      <button className="m6-go" type="button" disabled={busy || !sure} onClick={onRevoke}>Lijn verbreken</button>
    </>
  );
}

function Seals({ busy, inventory, onSolve }: { busy: boolean; inventory: Token[]; onSolve: (payload: unknown) => void }) {
  const [picked, setPicked] = useDraft("seal-pick", "");
  const [placed, setPlaced] = useDraft<Record<string, string>>("seal-placed", {});
  const ready = Boolean(placed.perimeter && placed.trace && placed.lockout);
  function place(id: string, token = picked) {
    if (!token) return;
    setPlaced((current) => ({ ...current, [id]: token }));
    setPicked("");
  }
  return (
    <>
      <p>Leg een token op het systeem dat daarbij past.</p>
      <div className="m6-chips">
        {inventory.map((token) => (
          <button key={token.id} className={`m6-chip${picked === token.id ? " on" : ""}`} type="button" draggable onDragStart={(event) => event.dataTransfer.setData("token", token.id)} onClick={() => setPicked(token.id)}>{token.label}</button>
        ))}
      </div>
      {sealNodes.map((node) => (
        <button
          key={node.id}
          className="m6-slot"
          type="button"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => { event.preventDefault(); place(node.id, event.dataTransfer.getData("token")); }}
          onClick={() => place(node.id)}
        >
          <b>{node.label}</b>
          <span>{inventory.find((token) => token.id === placed[node.id])?.label ?? "leeg"}</span>
        </button>
      ))}
      <button className="m6-go" type="button" disabled={busy || !ready} onClick={() => onSolve(placed)}>Systemen vastzetten</button>
    </>
  );
}

function Checks({ busy, onBackup }: { busy: boolean; onBackup: (checks: string[]) => void }) {
  const [checks, setChecks] = useDraft<string[]>("checks", []);
  function toggle(id: string) {
    setChecks((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }
  return (
    <>
      <p>Vink wat klopt. Er staat nog één lijn open die niet bij de schone set hoort.</p>
      <div className="m6-chips">
        {restoreChecks.map((item) => (
          <button key={item.id} className={`m6-chip${checks.includes(item.id) ? " on" : ""}`} type="button" onClick={() => toggle(item.id)}>{item.label}</button>
        ))}
      </div>
      <button className="m6-go" type="button" disabled={busy || checks.length === 0} onClick={() => onBackup(checks)}>Controle vastleggen</button>
    </>
  );
}

function CloseStep({ step, busy, inventory, onSolve }: { step: Step; busy: boolean; inventory: Token[]; onSolve: (payload: unknown) => void }) {
  const [picked, setPicked] = useDraft("order-pick", "");
  const [order, setOrder] = useDraft<(string | null)[]>("order", [null, null, null, null]);
  const ready = order.every(Boolean);
  function place(index: number, token = picked) {
    if (!token) return;
    setOrder((current) => current.map((item, itemIndex) => (itemIndex === index ? token : item === token ? null : item)));
    setPicked("");
  }
  function finish() {
    onSolve({ order });
  }
  if (step !== "shutdown") {
    return (
      <section className="m6-pane" style={{ flex: 1 }}>
        <header><h2>Afsluiten</h2></header>
        <div className="m6-detail">
          <p>De afsluitvolgorde opent pas nadat de sessie is ingetrokken, de systemen zijn vastgezet en de herstelcontrole klopt.</p>
        </div>
      </section>
    );
  }
  return (
    <div className="m6-split">
      <section className="m6-pane">
        <header><h2>Volgorde van de missies</h2></header>
        <div className="m6-scroll">
          {shutdownSteps.map((item, index) => (
            <button
              key={item.id}
              className={`m6-slot${order[index] ? " on" : ""}`}
              type="button"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); place(index, event.dataTransfer.getData("token")); }}
              onClick={() => place(index)}
            >
              <b>{index + 1}. {item.label}</b>
              <span>{inventory.find((token) => token.id === order[index])?.label ?? "leeg"}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="m6-pane">
        <header><h2>Vondsten</h2></header>
        <div className="m6-detail">
          {noraReady.map((item) => <p key={item}>{item}</p>)}
          <div className="m6-chips">
            {inventory.map((token) => (
              <button key={token.id} className={`m6-chip${picked === token.id ? " on" : ""}`} type="button" draggable onDragStart={(event) => event.dataTransfer.setData("token", token.id)} onClick={() => setPicked(token.id)}>{token.label}</button>
            ))}
          </div>
          <button className="m6-go" type="button" disabled={busy || !ready} onPointerDown={(event) => {
            if (!ready) return;
            const target = event.currentTarget;
            const timer = window.setTimeout(() => finish(), 700);
            const stop = () => window.clearTimeout(timer);
            target.addEventListener("pointerup", stop, { once: true });
            target.addEventListener("pointerleave", stop, { once: true });
          }}>Vasthouden om af te sluiten</button>
          <button className="m6-go" type="button" disabled={busy || !ready} onClick={finish}>Bevestig afsluiten</button>
        </div>
      </section>
    </div>
  );
}
