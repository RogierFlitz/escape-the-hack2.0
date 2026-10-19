"use client";

import { flows, nodeInfo, type Flow } from "@/lib/game/network";
import { actionType, nodeId } from "./shared";

export function Mission3SessionInspector({ flow, focusId }: { flow: Flow | null; focusId: string | null }) {
  if (!flow && !focusId) {
    return (
      <section className="soc-inspect">
        <p className="kicker">Sessie bekijken</p>
        <p>Tik een logregel of een systeem. Dat wijst nog geen antwoord aan.</p>
      </section>
    );
  }
  if (!flow) {
    const info = nodeInfo[focusId ?? ""];
    const label = info?.name ?? focusId;
    const related = flows.filter((row) => row.source === label || row.dest === label);
    return (
      <section className="soc-inspect">
        <p className="kicker">Systeem bekijken</p>
        <h3>{label}</h3>
        <p>{info?.role}</p>
        <p className="soc-meta">{related.length} logregels noemen dit systeem.</p>
      </section>
    );
  }
  const same = flows.filter((row) => row.account === flow.account);
  const infoFrom = nodeInfo[nodeId(flow.source)];
  const infoTo = nodeInfo[nodeId(flow.dest)];
  return (
    <section className="soc-inspect">
      <p className="kicker">Sessie bekijken</p>
      <h3>{flow.account}</h3>
      <dl>
        <div><dt>Tijd</dt><dd>{flow.time}</dd></div>
        <div><dt>Bron</dt><dd>{flow.source}</dd></div>
        <div><dt>Bestemming</dt><dd>{flow.dest}</dd></div>
        <div><dt>Type</dt><dd>{actionType(flow)}</dd></div>
        <div><dt>Status</dt><dd>{flow.status}</dd></div>
      </dl>
      <p>{flow.note}</p>
      <p className="soc-meta">{infoFrom?.role} {infoTo?.role}</p>
      <p className="soc-meta">Zelfde sessie: {same.map((row) => row.time).join(" · ")}</p>
      <p className="soc-look">Dit is kijken. Je antwoord kies je in het onderzoek.</p>
    </section>
  );
}
