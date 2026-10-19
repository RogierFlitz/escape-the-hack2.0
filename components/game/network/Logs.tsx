"use client";

import { useMemo, useState } from "react";
import { flows, type Flow } from "@/lib/game/network";
import { actionType } from "./shared";

const systems = ["NEX", "EDGE", "DNS", "AUTH", "LOG", "VAULT", "PROXY", "HONEY"];

export function Mission3LogExplorer({
  selectedId,
  system,
  onSystem,
  onSelect,
}: {
  selectedId: string | null;
  system: string;
  onSystem: (id: string) => void;
  onSelect: (flow: Flow) => void;
}) {
  const [query, setQuery] = useState("");
  const [bucket, setBucket] = useState("alle");
  const [status, setStatus] = useState("alle");
  const [unusual, setUnusual] = useState(false);
  const rows = useMemo(() => flows.filter((row) => {
    if (bucket !== "alle" && row.bucket !== bucket) return false;
    if (status !== "alle" && row.status !== status) return false;
    if (system !== "alle" && row.source !== system && row.dest !== system) return false;
    if (unusual && !row.unusual) return false;
    const hay = `${row.time} ${row.account} ${row.source} ${row.dest} ${row.note} ${actionType(row)}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  }), [bucket, query, status, system, unusual]);

  return (
    <div className="soc-logs">
      <div className="soc-logbar">
        <label className="soc-search">
          <span className="sr">Zoek in logs</span>
          <input value={query} placeholder="Zoek in logs..." onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="soc-filters">
          {[["alle", "Alle tijden"], ["nacht", "Nacht"], ["dag", "Dag"]].map(([id, label]) => (
            <button key={id} className={bucket === id ? "on" : ""} type="button" onClick={() => setBucket(id)}>{label}</button>
          ))}
          {[["alle", "Elke status"], ["toegekend", "Toegekend"], ["geweigerd", "Geweigerd"]].map(([id, label]) => (
            <button key={`s-${id}`} className={status === id ? "on" : ""} type="button" onClick={() => setStatus(id)}>{label}</button>
          ))}
          <button className={unusual ? "on" : ""} type="button" onClick={() => setUnusual((value) => !value)}>Ongebruikelijk</button>
          <button className={system === "alle" ? "on" : ""} type="button" onClick={() => onSystem("alle")}>Elk systeem</button>
          {systems.map((id) => (
            <button key={id} className={system === id ? "on" : ""} type="button" onClick={() => onSystem(id)}>{id}</button>
          ))}
        </div>
      </div>
      <div className="soc-table" role="table" aria-label="Logregels">
        <div className="soc-head" role="row">
          <span>Tijd</span><span>Sessie</span><span>Bron</span><span>Doel</span><span>Type</span><span>Status</span><span>Details</span>
        </div>
        {rows.map((row) => (
          <button key={row.id} type="button" role="row" className={selectedId === row.id ? "on" : ""} onClick={() => onSelect(row)}>
            <b>{row.time}</b>
            <span>{row.account}</span>
            <span>{row.source}</span>
            <span>{row.dest}</span>
            <span>{actionType(row)}</span>
            <i className={`soc-status ${row.status}`}>{row.status}</i>
            <em>{row.note}</em>
          </button>
        ))}
        {rows.length === 0 && <p className="soc-empty">Geen regels met deze filters.</p>}
      </div>
    </div>
  );
}
