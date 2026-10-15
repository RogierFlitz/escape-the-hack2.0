"use client";

import { useState } from "react";
import { bays, bootServers, cables, mailDecoys, mailLines, metaChoices, network, ports, services, timelineCards } from "@/lib/game/content";
import { Keys, Seal } from "./ui";

export type PuzzleProps = {
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
};

export function BayPuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [open, setOpen] = useState<number[]>([]);
  const [code, setCode] = useState("");
  return (
    <div className="stack">
      <p>Open de mapjes. Drie hebben een stukje. Lees ze van map 1 naar map 9 en typ ze aan elkaar.</p>
      <div className="grid-3">
        {bays.map((bay) => (
          <button key={bay.n} type="button" className={open.includes(bay.n) ? "bay on" : "bay"} onClick={() => setOpen((list) => (list.includes(bay.n) ? list : [...list, bay.n]))}>
            <strong>Map {bay.n}</strong>
            <div>{open.includes(bay.n) ? bay.tag ?? "leeg" : "dicht"}</div>
          </button>
        ))}
      </div>
      <div className="mono rotor">{code || "------"}</div>
      <Keys
        keys={["N", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "⌫"]}
        disabled={solved}
        onKey={(key) => setCode((value) => (key === "⌫" ? value.slice(0, -1) : (value + key).slice(0, 8)))}
      />
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || code.length < 4} onClick={() => onSolve({ code })}>Code invoeren</button>}
    </div>
  );
}

export function LoginPuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  return (
    <div className="grid-2">
      <div className="stack">
        <div className="token"><strong>Badge 4418</strong><small>J. VALE · verdieping 3 · clearance B · stond op een borrelfoto</small></div>
        <div className="token"><strong>Briefje</strong><small>Gebruikersnaam: eerste letter, dan achternaam, kleine letters, punt weg. Wachtwoord: badge achterstevoren, plus de verdieping.</small></div>
      </div>
      <div className="stack">
        <p className="muted">Gebruikersnaam</p>
        <div className="mono">{user || "—"}</div>
        <div className="row">
          {["J", "VALE"].map((part) => (
            <button key={part} className="chip" type="button" disabled={solved} onClick={() => setUser((value) => (value + part).toLowerCase())}>{part}</button>
          ))}
          <button className="chip" type="button" onClick={() => setUser("")}>wis</button>
        </div>
        <p className="muted">Wachtwoord</p>
        <div className="mono">{pass || "—"}</div>
        <div className="row">
          {["4", "4", "1", "8"].map((digit, index) => (
            <button key={`${digit}-${index}`} className="key mono" type="button" disabled={solved} onClick={() => setPass((value) => (value + digit).slice(0, 5))}>{digit}</button>
          ))}
          <button className="chip mint" type="button" disabled={solved} onClick={() => setPass((value) => (value + "3").slice(0, 5))}>verdieping 3</button>
          <button className="chip" type="button" onClick={() => setPass("")}>wis</button>
        </div>
        {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || !user || pass.length < 5} onClick={() => onSolve({ username: user, password: pass })}>Aanmelden</button>}
      </div>
    </div>
  );
}

const nodeRules = [
  ["MESH", "staat aan. Dit is de ruggengraat."],
  ["LOG", "staat aan. Zonder log geen audit."],
  ["AUTH", "alleen aan als LOG aan staat."],
  ["DNS", "is het tegendeel van MESH."],
] as const;

export function NodePuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [state, setState] = useState({ AUTH: false, DNS: false, LOG: false, MESH: false });
  return (
    <div className="stack">
      {nodeRules.map(([name, rule]) => (
        <div key={name} className="row" style={{ justifyContent: "space-between" }}>
          <div><strong className="mono">{name}</strong><div className="muted">{rule}</div></div>
          <button
            type="button"
            className={state[name] ? "toggle on" : "toggle"}
            disabled={solved}
            onClick={() => setState((prev) => ({ ...prev, [name]: !prev[name] }))}
          >
            {state[name] ? "AAN" : "UIT"}
          </button>
        </div>
      ))}
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy} onClick={() => onSolve(state)}>Schakeling testen</button>}
    </div>
  );
}

export function PortPuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [order, setOrder] = useState<string[]>([]);
  const pool = services.filter((service) => !order.includes(service.id));
  return (
    <div className="stack">
      <p>Handshake volgt het poortnummer, van laag naar hoog.</p>
      <div className="rail">
        {order.map((id, index) => (
          <button key={id} className="slot on mono" type="button" onClick={() => setOrder(order.filter((item) => item !== id))}>{index + 1}. {id}</button>
        ))}
        {order.length === 0 && <span className="muted">Tik een dienst om hem vooraan te zetten.</span>}
      </div>
      <div className="row">
        {pool.map((service) => (
          <button key={service.id} className="chip mono" type="button" disabled={solved} onClick={() => setOrder([...order, service.id])}>{service.id} · {service.port}</button>
        ))}
      </div>
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || order.length !== 5} onClick={() => onSolve({ order })}>Handshake starten</button>}
    </div>
  );
}

export function AcrosticPuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [picked, setPicked] = useState<string[]>([]);
  function add(letter: string) {
    setPicked((list) => [...list, letter].slice(0, 8));
  }
  return (
    <div className="stack">
      <p className="muted">De nagemaakte leveranciersmail. Tik de beginletters, die noemen de eventlocatie.</p>
      {mailLines.map((line) => (
        <div key={line.lead} className="mail-line">
          <button className="letter mono" type="button" disabled={solved} onClick={() => add(line.lead)}>{line.lead}</button>
          <span>{line.rest}</span>
        </div>
      ))}
      <div className="row">
        {mailDecoys.map((word) => (
          <button key={word} className="chip" type="button" disabled={solved} onClick={() => add(word[0].toUpperCase())}>{word}</button>
        ))}
      </div>
      <div className="mono rotor">{picked.join("") || "----"}</div>
      <div className="row">
        <button className="btn btn-ghost" type="button" onClick={() => setPicked([])}>Wissen</button>
        {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || picked.length < 3} onClick={() => onSolve({ word: picked.join("") })}>Locatie bevestigen</button>}
      </div>
    </div>
  );
}

export function MetaPuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [scan, setScan] = useState("");
  const [log, setLog] = useState("");
  return (
    <div className="stack">
      <div className="grid-2">
        <div className="stack">
          <strong>badge-scan.meta</strong>
          {metaChoices.scan.map((id) => (
            <button key={id} className={scan === id ? "chip on mono" : "chip mono"} type="button" onClick={() => setScan(id)}>{id}</button>
          ))}
        </div>
        <div className="stack">
          <strong>export.log</strong>
          {metaChoices.log.map((id) => (
            <button key={id} className={log === id ? "chip on mono" : "chip mono"} type="button" onClick={() => setLog(id)}>{id}</button>
          ))}
        </div>
      </div>
      <p className="muted">Markeer het id dat in beide bronnen staat. De volledige bestanden staan in het dossier.</p>
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || !scan || !log} onClick={() => onSolve({ scan, log })}>Koppeling vastleggen</button>}
    </div>
  );
}

export function TimelinePuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [order, setOrder] = useState<string[]>([]);
  const rest = timelineCards.filter((card) => !order.includes(card.id));
  return (
    <div className="stack">
      <p>Zet de gebeurtenissen op klokvolgorde. De tijden staan in de logboeken, niet op de kaarten.</p>
      <div className="rail">
        {order.map((id, index) => {
          const card = timelineCards.find((item) => item.id === id)!;
          return <button key={id} className="slot on" type="button" onClick={() => setOrder(order.filter((item) => item !== id))}>{index + 1}. {card.title}</button>;
        })}
      </div>
      <div className="stack">
        {rest.map((card) => (
          <button key={card.id} className="token" type="button" disabled={solved} onClick={() => setOrder([...order, card.id])}>
            <strong>{card.title}</strong><small>{card.detail}</small>
          </button>
        ))}
      </div>
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || order.length !== 3} onClick={() => onSolve({ order })}>Tijdlijn sluiten</button>}
    </div>
  );
}

export function PathPuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [path, setPath] = useState(["CRU"]);
  const [local, setLocal] = useState("");
  const last = path[path.length - 1];
  function tap(id: string) {
    if (id === last && path.length > 1) {
      setPath(path.slice(0, -1));
      setLocal("");
      return;
    }
    const linked = network.edges.some(([a, b]) => (a === last && b === id) || (b === last && a === id));
    if (!linked) return setLocal("Geen verbinding vanaf de huidige node.");
    if (network.nodes.find((node) => node.id === id)?.bad) return setLocal("Node gecompromitteerd. Kies een andere route.");
    if (path.includes(id)) return;
    setPath([...path, id]);
    setLocal("");
  }
  return (
    <div className="stack">
      <p>Van Nexora naar de kluis. Rode nodes zijn van hem. Tik de laatste node om een stap terug te doen.</p>
      <div className="net">
        <svg className="net-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {network.edges.map(([a, b]) => {
            const from = network.nodes.find((node) => node.id === a)!;
            const to = network.nodes.find((node) => node.id === b)!;
            const active = path.includes(a) && path.includes(b) && Math.abs(path.indexOf(a) - path.indexOf(b)) === 1;
            return <line key={`${a}-${b}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={active ? "on" : ""} />;
          })}
        </svg>
        {network.nodes.map((node) => (
          <button key={node.id} type="button" className={`node${node.bad ? " bad" : ""}${node.id === last ? " now" : ""}${path.includes(node.id) ? " on" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => tap(node.id)}>
            {node.label}
          </button>
        ))}
      </div>
      <div className="mono">{path.map((id) => network.nodes.find((node) => node.id === id)?.label ?? id).join(" → ")}</div>
      {local && <div className="note">{local}</div>}
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || last !== "VAULT"} onClick={() => onSolve({ path })}>Route vergrendelen</button>}
    </div>
  );
}

export function LogicPuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [state, setState] = useState({ A: false, B: false, C: false });
  return (
    <div className="stack">
      <p>Poort OPEN als A én B onder spanning staan, tenzij C de demper is.</p>
      <div className="row">
        {(["A", "B", "C"] as const).map((key) => (
          <button key={key} type="button" className={state[key] ? "toggle on" : "toggle"} disabled={solved} onClick={() => setState((prev) => ({ ...prev, [key]: !prev[key] }))}>
            {key} {state[key] ? "AAN" : "UIT"}
          </button>
        ))}
      </div>
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy} onClick={() => onSolve(state)}>Spanningsproef</button>}
    </div>
  );
}

export function CablePuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [map, setMap] = useState<Record<string, string>>({});
  function assign(portId: string) {
    if (!picked) return;
    setMap((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) if (next[key] === portId) delete next[key];
      next[picked] = portId;
      return next;
    });
    setPicked(null);
  }
  return (
    <div className="grid-2">
      <div className="stack">
        <p className="muted">Kies een kabel, daarna een poort. De rode val mag de bus niet raken.</p>
        {cables.map((cable) => (
          <button key={cable.id} type="button" className={`chip ${cable.tone}${picked === cable.id ? " on" : ""}`} disabled={solved} onClick={() => setPicked(cable.id)}>
            {cable.label}{map[cable.id] ? ` → ${map[cable.id]}` : ""}
          </button>
        ))}
      </div>
      <div className="stack">
        {ports.map((port) => (
          <button key={port.id} type="button" className="slot" disabled={solved || !picked} onClick={() => assign(port.id)}>{port.label}</button>
        ))}
        {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || Object.keys(map).length < 4} onClick={() => onSolve(map)}>Kast sluiten</button>}
      </div>
    </div>
  );
}

export function BootPuzzle({ solved, busy, onSolve }: PuzzleProps) {
  const [order, setOrder] = useState<string[]>([]);
  const rest = bootServers.filter((server) => !order.includes(server.id));
  return (
    <div className="stack">
      <div className="rail">
        {order.map((id, index) => (
          <button key={id} className="slot on mono" type="button" onClick={() => setOrder(order.filter((item) => item !== id))}>{index + 1}. {id}</button>
        ))}
      </div>
      {rest.map((server) => (
        <button key={server.id} className="token" type="button" disabled={solved} onClick={() => setOrder([...order, server.id])}>
          <strong className="mono">{server.label}</strong><small>{server.need}</small>
        </button>
      ))}
      {solved ? <Seal /> : <button className="btn btn-primary" type="button" disabled={busy || order.length !== 3} onClick={() => onSolve({ order })}>Servers starten</button>}
    </div>
  );
}
