"use client";

import { useEffect, useState } from "react";
import { bootServers, cables, network, ports } from "@/lib/game/content";
import {
  cableRole,
  clues,
  feedFor,
  flows,
  hops,
  measures,
  nodeInfo,
  noraNetwork,
  schema,
  sections,
  sessions,
} from "@/lib/game/network";

function useDraft<T>(id: string, initial: T) {
  const key = `eth-m3-${id}`;
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

const attack = [
  ["CRU", "EDGE"],
  ["EDGE", "DNS"],
  ["DNS", "AUTH"],
  ["AUTH", "VAULT"],
];

export function NetworkDesk({
  puzzleId,
  solved,
  busy,
  onSolve,
}: {
  puzzleId: string;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const preferred = puzzleId === "ch3-logic" ? "logs" : puzzleId === "ch3-boot" ? "measures" : puzzleId === "ch3-cables" ? "patch" : "map";
  const [section, setSection] = useState(preferred);
  const [glitch, setGlitch] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [flash, setFlash] = useState("");
  const [session, setSession] = useDraft("ch3-logic-session", "");
  const [pickedClues, setClues] = useDraft<string[]>("ch3-logic-clues", []);
  const [path, setPath] = useDraft<string[]>("ch3-path", ["CRU"]);
  const [actions, setActions] = useDraft<string[]>("ch3-boot", []);
  const [cableMap, setCableMap] = useDraft<Record<string, string>>("ch3-cables", {});
  const [order, setOrder] = useDraft<string[]>("ch3-cables-order", []);
  const [cablePick, setCablePick] = useState<string | null>(null);

  useEffect(() => {
    setSection(preferred);
    setFlash("");
  }, [preferred]);

  useEffect(() => {
    if (puzzleId !== "ch3-logic") return;
    if (sessionStorage.getItem("eth-m3-glitch")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setGlitch(true);
    const timer = window.setTimeout(() => {
      setGlitch(false);
      sessionStorage.setItem("eth-m3-glitch", "1");
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [puzzleId]);

  useEffect(() => {
    if (!solved) return;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(`eth-m3-${puzzleId}`)) localStorage.removeItem(key);
    }
  }, [puzzleId, solved]);

  function tapNode(id: string) {
    setFocus(id);
    if (puzzleId !== "ch3-path") return;
    const last = path[path.length - 1] ?? "CRU";
    if (id === last && path.length > 1) {
      setPath(path.slice(0, -1));
      setFlash("");
      return;
    }
    const linked = network.edges.some(([a, b]) => (a === last && b === id) || (b === last && a === id));
    if (!linked) return setFlash("Geen kabel tussen deze twee.");
    if (network.nodes.find((node) => node.id === id)?.bad) return setFlash("Deze stap weigert het verkeer.");
    if (path.includes(id)) return;
    setPath([...path, id]);
    setFlash("");
  }

  function toggleAction(id: string) {
    setActions((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function assignPort(portId: string) {
    if (!cablePick) return;
    setCableMap((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) if (next[key] === portId) delete next[key];
      next[cablePick] = portId;
      return next;
    });
    setCablePick(null);
  }

  return (
    <div className="nw">
      <div className="nw-main">
        {puzzleId === "ch3-logic" && <p className="fp-nora">{noraNetwork}</p>}
        <div className="sp-nav">
          {sections.map((item) => (
            <button key={item.id} className={section === item.id ? "on" : ""} type="button" onClick={() => setSection(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <div className={`nw-view${glitch ? " glitch" : ""}`}>
          {section === "logs" ? (
            <LogView onPick={setSession} />
          ) : section === "measures" ? (
            <MeasureBoard actions={actions} onToggle={toggleAction} />
          ) : section === "patch" ? (
            <PatchBoard pick={cablePick} map={cableMap} onPick={setCablePick} onAssign={assignPort} />
          ) : (
            <MapView puzzleId={puzzleId} path={path} focus={focus} flash={flash} onTap={tapNode} />
          )}
        </div>
      </div>
      {puzzleId === "ch3-logic" && (
        <SessionCase session={session} clues={pickedClues} setSession={setSession} setClues={setClues} solved={solved} busy={busy} onSolve={onSolve} />
      )}
      {puzzleId === "ch3-path" && (
        <RouteCase path={path} flash={flash} solved={solved} busy={busy} onBack={() => path.length > 1 && setPath(path.slice(0, -1))} onSolve={onSolve} />
      )}
      {puzzleId === "ch3-boot" && (
        <IsolateCase actions={actions} solved={solved} busy={busy} onSolve={onSolve} />
      )}
      {puzzleId === "ch3-cables" && (
        <RestoreCase order={order} setOrder={setOrder} map={cableMap} solved={solved} busy={busy} onSolve={onSolve} />
      )}
    </div>
  );
}

function MapView({
  puzzleId,
  path,
  focus,
  flash,
  onTap,
}: {
  puzzleId: string;
  path: string[];
  focus: string | null;
  flash: string;
  onTap: (id: string) => void;
}) {
  const routed = puzzleId === "ch3-boot" || puzzleId === "ch3-cables";
  const tracing = puzzleId === "ch3-path";
  const info = focus === "TRAP" ? null : nodeInfo[focus ?? (tracing ? path[path.length - 1] : "EDGE")];
  return (
    <div className="nw-stage">
      <div className={`nw-map${puzzleId === "ch3-logic" ? " live" : ""}`}>
        <svg className="net-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {network.edges.map(([a, b]) => {
            const from = network.nodes.find((node) => node.id === a)!;
            const to = network.nodes.find((node) => node.id === b)!;
            const walked = tracing && path.includes(a) && path.includes(b) && Math.abs(path.indexOf(a) - path.indexOf(b)) === 1;
            const hit = routed && attack.some(([left, right]) => (left === a && right === b) || (left === b && right === a));
            const alert = !routed && a === "CRU" && b === "EDGE";
            const tone = hit ? "attack" : walked ? "on" : alert ? "alert" : "flow";
            return <line key={`${a}-${b}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={tone} />;
          })}
        </svg>
        {network.nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className={`nw-node${nodeClass(puzzleId, node.id, tracing ? path : [])}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onClick={() => onTap(node.id)}
          >
            {node.label}
          </button>
        ))}
        <button type="button" className={`nw-node trap${routed ? " held" : ""}`} style={{ left: "50%", top: "88%" }} onClick={() => onTap("TRAP")}>
          TRAP
        </button>
      </div>
      <div className="nw-feed">
        {feedFor(puzzleId).map((row) => (
          <p key={row.text}><b>{row.time}</b> {row.text}</p>
        ))}
        {info && <p>{info.name}: {info.role}</p>}
        {focus === "TRAP" && <p>TRAP: geïsoleerde omgeving. Leeg tot een sessie apart wordt gezet.</p>}
        {tracing && <p className="nw-chain">{path.map((id) => network.nodes.find((node) => node.id === id)?.label ?? id).join(" → ")}</p>}
        {flash && <p>{flash}</p>}
      </div>
    </div>
  );
}

function nodeClass(puzzleId: string, id: string, path: string[]) {
  if (puzzleId === "ch3-cables") {
    if (id === "LOG") return " up";
    if (id === "DNS" || id === "AUTH" || id === "VAULT") return " down";
    if (id === "EDGE") return " held";
  }
  if (puzzleId === "ch3-boot" && attack.some(([left, right]) => left === id || right === id)) return " hit";
  if (puzzleId === "ch3-logic" && id === "EDGE") return " watch";
  if (puzzleId === "ch3-path" && path.includes(id)) return path[path.length - 1] === id ? " now" : " on";
  return "";
}

function LogView({ onPick }: { onPick: (account: string) => void }) {
  const [bucket, setBucket] = useState("alle");
  const [status, setStatus] = useState("alle");
  const [source, setSource] = useState("alle");
  const [unusual, setUnusual] = useState(false);
  const rows = flows.filter((row) => {
    if (bucket !== "alle" && row.bucket !== bucket) return false;
    if (status !== "alle" && row.status !== status) return false;
    if (source !== "alle" && row.source !== source && row.dest !== source) return false;
    if (unusual && !row.unusual) return false;
    return true;
  });
  const sources = ["NEX", "EDGE", "DNS", "AUTH", "LOG", "VAULT", "PROXY", "HONEY"];
  return (
    <div className="nw-logs">
      <div className="sp-nav">
        {[["alle", "Alle tijden"], ["nacht", "Nacht"], ["dag", "Dag"]].map(([id, label]) => (
          <button key={id} className={bucket === id ? "on" : ""} type="button" onClick={() => setBucket(id)}>{label}</button>
        ))}
        {[["alle", "Elke status"], ["toegekend", "Toegekend"], ["geweigerd", "Geweigerd"]].map(([id, label]) => (
          <button key={id} className={status === id ? "on" : ""} type="button" onClick={() => setStatus(id)}>{label}</button>
        ))}
        <button className={unusual ? "on" : ""} type="button" onClick={() => setUnusual((value) => !value)}>Ongebruikelijk</button>
      </div>
      <div className="sp-nav">
        <button className={source === "alle" ? "on" : ""} type="button" onClick={() => setSource("alle")}>Elk systeem</button>
        {sources.map((id) => (
          <button key={id} className={source === id ? "on" : ""} type="button" onClick={() => setSource(id)}>{id}</button>
        ))}
      </div>
      <div className="nw-table">
        {rows.map((row) => (
          <button key={row.id} type="button" onClick={() => onPick(row.account)}>
            <b>{row.time}</b>
            <span>{row.account}</span>
            <span>{row.source} → {row.dest}</span>
            <small>{row.status}</small>
            <em>{row.note}</em>
          </button>
        ))}
        {rows.length === 0 && <p className="sp-quiet">Geen regels met deze filters.</p>}
      </div>
    </div>
  );
}

function MeasureBoard({ actions, onToggle }: { actions: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="nw-measures">
      <Lights actions={actions} restore={false} />
      <div className="nw-cards">
        {measures.map((item) => (
          <button key={item.id} type="button" className={actions.includes(item.id) ? "on" : ""} onClick={() => onToggle(item.id)}>
            <strong>{item.label}</strong>
            {actions.includes(item.id) && <small>{item.preview}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Lights({ actions, restore }: { actions: string[]; restore: boolean }) {
  const down = new Set<string>();
  if (actions.includes("block-all")) ["DNS", "AUTH", "LOG", "VAULT", "EDGE"].forEach((id) => down.add(id));
  if (actions.includes("cut-vault")) down.add("VAULT");
  if (actions.includes("cut-dns")) down.add("DNS");
  if (actions.includes("cut-log")) down.add("LOG");
  if (restore) ["DNS", "AUTH", "VAULT"].forEach((id) => down.add(id));
  const lights = ["NEX", "EDGE", "DNS", "AUTH", "LOG", "VAULT", "HONEY", "TRAP"];
  return (
    <div className="nw-lights">
      {lights.map((id) => {
        const tone = down.has(id) ? "down" : id === "TRAP" && actions.includes("isolate-session") ? "trap" : id === "LOG" && (actions.includes("keep-log") || restore) ? "up" : "";
        return <span key={id} className={tone}>{id}</span>;
      })}
    </div>
  );
}

function PatchBoard({
  pick,
  map,
  onPick,
  onAssign,
}: {
  pick: string | null;
  map: Record<string, string>;
  onPick: (id: string) => void;
  onAssign: (portId: string) => void;
}) {
  return (
    <div className="nw-patch">
      <Lights actions={[]} restore />
      <div className="nw-schema">
        {schema.map((line) => <p key={line}>{line}</p>)}
      </div>
      <div className="nw-bay">
        <div>
          {cables.map((cable) => (
            <button key={cable.id} type="button" className={pick === cable.id ? "on" : ""} onClick={() => onPick(cable.id)}>
              <strong>{cable.label}</strong>
              <small>{cableRole[cable.id]}{map[cable.id] ? ` → ${map[cable.id]}` : ""}</small>
            </button>
          ))}
        </div>
        <div>
          {ports.map((port) => (
            <button key={port.id} type="button" disabled={!pick} onClick={() => onAssign(port.id)}>{port.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SessionCase({
  session,
  clues: picked,
  setSession,
  setClues,
  solved,
  busy,
  onSolve,
}: {
  session: string;
  clues: string[];
  setSession: (id: string) => void;
  setClues: (value: string[] | ((current: string[]) => string[])) => void;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  function toggle(id: string) {
    setClues((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }
  const ready = Boolean(session) && picked.length >= 2;
  return (
    <aside className="fp-side">
      <p className="kicker">Sessie</p>
      <p>Welke sessie wijkt af?</p>
      <div className="sp-picks">
        {sessions.map((id) => (
          <button key={id} className={`fp-chip${session === id ? " on" : ""}`} type="button" onClick={() => setSession(id)}>{id}</button>
        ))}
      </div>
      <p>Waar blijkt dat uit?</p>
      <div className="sp-picks">
        {clues.map((item) => (
          <button key={item.id} className={`fp-chip${picked.includes(item.id) ? " on" : ""}`} type="button" onClick={() => toggle(item.id)}>{item.label}</button>
        ))}
      </div>
      <button className="btn btn-mint" type="button" disabled={busy || solved || !ready} onClick={() => onSolve({ session, clues: picked })}>
        Sessie markeren
      </button>
    </aside>
  );
}

function RouteCase({
  path,
  flash,
  solved,
  busy,
  onBack,
  onSolve,
}: {
  path: string[];
  flash: string;
  solved: boolean;
  busy: boolean;
  onBack: () => void;
  onSolve: (payload: unknown) => void;
}) {
  const labels = path.map((id) => network.nodes.find((node) => node.id === id)?.label ?? id);
  return (
    <aside className="fp-side">
      <p className="kicker">Sprongen</p>
      <div className="nw-hops">
        {hops.map((hop) => (
          <p key={hop.id}><b>{hop.time}</b> {hop.text}</p>
        ))}
      </div>
      <p className="nw-chain">{labels.join(" → ")}</p>
      {flash && <p>{flash}</p>}
      <button className="btn btn-ghost" type="button" onClick={onBack}>Stap terug</button>
      <button className="btn btn-mint" type="button" disabled={busy || solved || path.length < 2} onClick={() => onSolve({ path })}>
        Route vastleggen
      </button>
    </aside>
  );
}

function IsolateCase({
  actions,
  solved,
  busy,
  onSolve,
}: {
  actions: string[];
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const notes = measures.filter((item) => actions.includes(item.id));
  return (
    <aside className="fp-side">
      <p className="kicker">Isolatie</p>
      <p>Tijdelijk. De sessie blijft bestaan tot de finale.</p>
      {notes.map((item) => <p key={item.id}>{item.preview}</p>)}
      <button className="btn btn-mint" type="button" disabled={busy || solved || actions.length < 2} onClick={() => onSolve({ actions })}>
        Maatregelen uitvoeren
      </button>
    </aside>
  );
}

function RestoreCase({
  order,
  setOrder,
  map,
  solved,
  busy,
  onSolve,
}: {
  order: string[];
  setOrder: (value: string[] | ((current: string[]) => string[])) => void;
  map: Record<string, string>;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const rest = bootServers.filter((server) => !order.includes(server.id));
  const ready = Object.keys(map).length >= 4 && order.length === 3;
  return (
    <aside className="fp-side">
      <p className="kicker">Startvolgorde</p>
      <p>Een systeem start pas als datgene waar het op wacht al draait.</p>
      {order.map((id, index) => {
        const server = bootServers.find((item) => item.id === id);
        return (
          <button key={id} className="fp-slot filled" type="button" onClick={() => setOrder(order.filter((item) => item !== id))}>
            <small>{index + 1}</small>
            <strong>{server?.label}</strong>
          </button>
        );
      })}
      <div className="sp-picks">
        {rest.map((server) => (
          <button key={server.id} className="fp-chip" type="button" onClick={() => setOrder([...order, server.id])}>
            {server.label}
            <small>{server.need}</small>
          </button>
        ))}
      </div>
      <button className="btn btn-mint" type="button" disabled={busy || solved || !ready} onClick={() => onSolve({ ...map, order })}>
        Verbindingen herstellen
      </button>
    </aside>
  );
}
