"use client";

import { useCallback, useEffect, useState } from "react";
import { bootServers, cables, network, ports, puzzleCues } from "@/lib/game/content";
import {
  cableRole,
  clues,
  flows,
  hops,
  measures,
  noraNetwork,
  schema,
  sections,
  sessions,
} from "@/lib/game/network";
import { Mission3SessionInspector } from "./network/Inspector";
import { Mission3LogExplorer } from "./network/Logs";
import { Mission3NetworkMap } from "./network/Map";
import { nodeLabel } from "./network/shared";
import { Mission3Timeline } from "./network/Timeline";
import "./network/soc.css";

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
  const preferred = puzzleId === "ch3-boot" ? "measures" : puzzleId === "ch3-cables" ? "patch" : "board";
  const [section, setSection] = useState(preferred);
  const [glitch, setGlitch] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [flowId, setFlowId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [system, setSystem] = useState("alle");
  const [flash, setFlash] = useState("");
  const [session, setSession] = useDraft("ch3-logic-session", "");
  const [pickedClues, setClues] = useDraft<string[]>("ch3-logic-clues", []);
  const [path, setPath] = useDraft<string[]>("ch3-path", ["CRU"]);
  const [actions, setActions] = useDraft<string[]>("ch3-boot", []);
  const [cableMap, setCableMap] = useDraft<Record<string, string>>("ch3-cables", {});
  const [order, setOrder] = useDraft<string[]>("ch3-cables-order", []);
  const [cablePick, setCablePick] = useState<string | null>(null);
  const flow = flows.find((row) => row.id === flowId) ?? null;
  const tracing = puzzleId === "ch3-path";

  useEffect(() => {
    setSection(preferred);
    setFlash("");
    setPlaying(false);
  }, [preferred]);

  useEffect(() => {
    if (puzzleId !== "ch3-logic") return;
    if (sessionStorage.getItem("eth-m3-glitch")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setGlitch(true);
    const timer = window.setTimeout(() => {
      setGlitch(false);
      sessionStorage.setItem("eth-m3-glitch", "1");
    }, 900);
    return () => window.clearTimeout(timer);
  }, [puzzleId]);

  useEffect(() => {
    if (!solved) return;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(`eth-m3-${puzzleId}`)) localStorage.removeItem(key);
    }
  }, [puzzleId, solved]);

  const pickFlow = useCallback((id: string) => {
    setFlowId(id);
    const row = flows.find((item) => item.id === id);
    if (row) setFocus(row.source === "NEX" ? "CRU" : row.source === "HONEY" ? "HONEYPOT" : row.source);
  }, []);

  function tapNode(id: string) {
    setFocus(id);
    setFlowId(null);
    setSystem(nodeLabel(id));
    setPlaying(false);
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

  const tabs = [
    { id: "board", label: "Overzicht" },
    ...sections.filter((item) => item.id === "measures" || item.id === "patch"),
  ];

  return (
    <div className={`soc${glitch ? " glitch" : ""}`}>
      {puzzleId === "ch3-logic" && <p className="soc-nora">{noraNetwork}</p>}
      <nav className="soc-tabs" aria-label="Netwerk">
        {tabs.map((item) => (
          <button key={item.id} className={section === item.id ? "on" : ""} type="button" onClick={() => setSection(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="soc-grid">
        <div className="soc-main">
          {section === "measures" ? (
            <MeasureBoard actions={actions} onToggle={toggleAction} />
          ) : section === "patch" ? (
            <PatchBoard pick={cablePick} map={cableMap} onPick={setCablePick} onAssign={assignPort} />
          ) : (
            <>
              <Mission3NetworkMap focusId={focus} flow={flow} path={path} tracing={tracing} onTap={tapNode} />
              <Mission3Timeline selectedId={flowId} playing={playing} onPick={pickFlow} onPlaying={setPlaying} />
              <Mission3LogExplorer
                selectedId={flowId}
                system={system}
                onSystem={setSystem}
                onSelect={(row) => { setPlaying(false); pickFlow(row.id); }}
              />
            </>
          )}
        </div>
        <aside className="soc-rail">
          {section === "board" && <Mission3SessionInspector flow={flow} focusId={focus} />}
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
        </aside>
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
  const cue = puzzleCues["ch3-logic"];
  return (
    <div className="soc-case">
      <p className="kicker">Onderzoek</p>
      {cue && <p className="soc-cue"><b>Nu doen. </b>{cue.text}</p>}
      <div className="soc-ask">
        <p>Welke sessie wijkt af?</p>
        <div className="soc-picks">
          {sessions.map((id) => (
            <button key={id} className={session === id ? "on" : ""} type="button" onClick={() => setSession(id)}>{id}</button>
          ))}
        </div>
        <p>Waar blijkt dat uit?</p>
        <div className="soc-picks stack">
          {clues.map((item) => (
            <button key={item.id} className={picked.includes(item.id) ? "on" : ""} type="button" onClick={() => toggle(item.id)}>{item.label}</button>
          ))}
        </div>
      </div>
      <p className="soc-count">{picked.length} aanwijzing{picked.length === 1 ? "" : "en"} gekozen</p>
      <button className="btn soc-go" type="button" disabled={busy || solved || !ready} onClick={() => onSolve({ session, clues: picked })}>
        Conclusie vastleggen
      </button>
    </div>
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
  const cue = puzzleCues["ch3-path"];
  return (
    <div className="soc-case">
      <p className="kicker">Sprongen</p>
      {cue && <p className="soc-cue"><b>Nu doen. </b>{cue.text}</p>}
      <div className="soc-ask">
        {hops.map((hop) => (
          <p key={hop.id}><b>{hop.time}</b> {hop.text}</p>
        ))}
        <p className="soc-chain">{labels.join(" → ")}</p>
        {flash && <p>{flash}</p>}
      </div>
      <button className="btn btn-ghost" type="button" onClick={onBack}>Stap terug</button>
      <button className="btn soc-go" type="button" disabled={busy || solved || path.length < 2} onClick={() => onSolve({ path })}>
        Route vastleggen
      </button>
    </div>
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
  const cue = puzzleCues["ch3-boot"];
  return (
    <div className="soc-case">
      <p className="kicker">Isolatie</p>
      {cue && <p className="soc-cue"><b>Nu doen. </b>{cue.text}</p>}
      <div className="soc-ask">
        <p>Tijdelijk. De sessie blijft bestaan tot de finale.</p>
        {notes.map((item) => <p key={item.id}>{item.preview}</p>)}
      </div>
      <button className="btn soc-go" type="button" disabled={busy || solved || actions.length < 2} onClick={() => onSolve({ actions })}>
        Maatregelen uitvoeren
      </button>
    </div>
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
  const cue = puzzleCues["ch3-cables"];
  return (
    <div className="soc-case">
      <p className="kicker">Startvolgorde</p>
      {cue && <p className="soc-cue"><b>Nu doen. </b>{cue.text}</p>}
      <div className="soc-ask">
        <p>Een systeem start pas als datgene waar het op wacht al draait.</p>
        {order.map((id, index) => {
          const server = bootServers.find((item) => item.id === id);
          return (
            <button key={id} className="soc-slot" type="button" onClick={() => setOrder(order.filter((item) => item !== id))}>
              <small>{index + 1}</small>
              <strong>{server?.label}</strong>
            </button>
          );
        })}
        <div className="soc-picks stack">
          {rest.map((server) => (
            <button key={server.id} type="button" onClick={() => setOrder([...order, server.id])}>
              {server.label}
              <small>{server.need}</small>
            </button>
          ))}
        </div>
      </div>
      <button className="btn soc-go" type="button" disabled={busy || solved || !ready} onClick={() => onSolve({ ...map, order })}>
        Verbindingen herstellen
      </button>
    </div>
  );
}

function MeasureBoard({ actions, onToggle }: { actions: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="soc-tools">
      <Lights actions={actions} restore={false} />
      <div className="soc-cards">
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
    <div className="soc-lights">
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
    <div className="soc-tools">
      <Lights actions={[]} restore />
      <div className="soc-schema">
        {schema.map((line) => <p key={line}>{line}</p>)}
      </div>
      <div className="soc-bay">
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
