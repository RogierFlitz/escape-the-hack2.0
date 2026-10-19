import { network } from "@/lib/game/content";
import { flows, type Flow } from "@/lib/game/network";

export function nodeId(label: string) {
  if (label === "NEX") return "CRU";
  if (label === "HONEY") return "HONEYPOT";
  return label;
}

export function nodeLabel(id: string) {
  return network.nodes.find((node) => node.id === id)?.label ?? id;
}

export function hasEdge(a: string, b: string) {
  return network.edges.some(([left, right]) => (left === a && right === b) || (left === b && right === a));
}

export function actionType(flow: Flow) {
  const note = flow.note.toLowerCase();
  if (note.includes("tunnel")) return "Tunnel";
  if (note.includes("scan")) return "Scan";
  if (note.includes("lookup") || note.includes("naam van")) return "Lookup";
  if (note.includes("ticket")) return "Ticket";
  if (note.includes("lees")) return "Toegang";
  if (note.includes("kopie")) return "Backup";
  if (note.includes("gezond")) return "Controle";
  if (note.includes("aanmelding")) return "Aanmelding";
  if (note.includes("printer")) return "Wachtrij";
  if (note.includes("portaal")) return "Portaal";
  if (note.includes("rapport")) return "Rapport";
  if (note.includes("map")) return "Map";
  if (flow.status === "geweigerd") return "Geweigerd";
  return "Verkeer";
}

export const orderedFlows = [...flows].sort((a, b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id));
