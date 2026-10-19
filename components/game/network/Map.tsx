"use client";

import { network } from "@/lib/game/content";
import { nodeInfo, type Flow } from "@/lib/game/network";
import { hasEdge, nodeId, nodeLabel } from "./shared";

const spot: Record<string, { x: number; y: number }> = {
  CRU: { x: 280, y: 155 },
  EDGE: { x: 140, y: 70 },
  DNS: { x: 420, y: 58 },
  AUTH: { x: 700, y: 70 },
  VAULT: { x: 880, y: 150 },
  LOG: { x: 720, y: 240 },
  PROXY: { x: 460, y: 240 },
  HONEYPOT: { x: 140, y: 240 },
};

export function Mission3NetworkMap({
  focusId,
  flow,
  path,
  tracing,
  onTap,
}: {
  focusId: string | null;
  flow: Flow | null;
  path: string[];
  tracing: boolean;
  onTap: (id: string) => void;
}) {
  const selected = flow ? [nodeId(flow.source), nodeId(flow.dest)] : [];
  const hotEdge = selected.length === 2 && hasEdge(selected[0], selected[1]) ? selected : null;
  return (
    <div className="soc-map" aria-label="Netwerkkaart">
      <div className="soc-stage">
        <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet" className="soc-wires">
          {network.edges.map(([a, b]) => {
            const from = spot[a];
            const to = spot[b];
            if (!from || !to) return null;
            const walked = tracing && path.includes(a) && path.includes(b) && Math.abs(path.indexOf(a) - path.indexOf(b)) === 1;
            const hot = hotEdge && hotEdge.includes(a) && hotEdge.includes(b);
            return (
              <g key={`${a}-${b}`}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={hot ? "hot" : walked ? "walk" : ""} />
                <circle r="3" className="soc-packet">
                  <animate attributeName="cx" values={`${from.x};${to.x}`} dur="3.6s" repeatCount="indefinite" />
                  <animate attributeName="cy" values={`${from.y};${to.y}`} dur="3.6s" repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}
          {network.nodes.map((node) => {
            const at = spot[node.id];
            if (!at) return null;
            const on = focusId === node.id || selected.includes(node.id) || (tracing && path.includes(node.id));
            const now = tracing && path[path.length - 1] === node.id;
            return (
              <g
                key={node.id}
                className={`soc-node${on ? " on" : ""}${now ? " now" : ""}`}
                transform={`translate(${at.x} ${at.y})`}
                role="button"
                tabIndex={0}
                aria-label={`${node.label}. ${nodeInfo[node.id]?.role ?? ""}`}
                onClick={() => onTap(node.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onTap(node.id);
                  }
                }}
              >
                <rect className="soc-nodebox" x={-42} y={-20} width={84} height={40} rx={12} />
                <NodeGlyph id={node.id} />
                <text x={8} y={5}>{node.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="soc-legend">
        <span>{focusId ? `${nodeLabel(focusId)} geselecteerd` : "Tik een systeem"}</span>
        {flow && <span>{flow.source} → {flow.dest}</span>}
        {tracing && <span>{path.map((id) => nodeLabel(id)).join(" → ")}</span>}
      </p>
    </div>
  );
}

function NodeGlyph({ id }: { id: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6 };
  if (id === "AUTH") {
    return <path transform="translate(-28 -8) scale(0.55)" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" {...common} />;
  }
  if (id === "VAULT") {
    return <path transform="translate(-28 -8) scale(0.55)" d="M8 10V7a4 4 0 0 1 8 0v3M5 10h14v10H5z" {...common} />;
  }
  if (id === "DNS") {
    return <path transform="translate(-28 -8) scale(0.55)" d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16M4 12h16M12 4c2.5 2.4 2.5 13.6 0 16M12 4c-2.5 2.4-2.5 13.6 0 16" {...common} />;
  }
  return <path transform="translate(-28 -8) scale(0.55)" d="M4 5h16v6H4zM4 13h16v6H4z" {...common} />;
}
