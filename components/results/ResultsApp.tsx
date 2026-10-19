"use client";

import { useEffect, useState } from "react";
import type { PlayerReport, SessionReport } from "@/lib/game/results";
import { ManageBoard, PlayerBoard, StageBoard } from "./Board";
import "./desk.css";

function usePoll<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!url) return;
    const target = url;
    let stop = false;
    async function load() {
      try {
        const response = await fetch(target, { cache: "no-store" });
        const body = await response.json().catch(() => null);
        if (stop) return;
        if (!response.ok) {
          setError(body?.error ?? "Het verslag is niet beschikbaar.");
          return;
        }
        setError("");
        setData(body as T);
      } catch {
        if (!stop) setError("Het verslag is niet bereikbaar.");
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 8000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [url]);
  return { data, error };
}

export function PlayerResults({ code, onClose }: { code: string; onClose: () => void }) {
  const { data, error } = usePoll<PlayerReport>(`/api/play/${code}/report`);
  if (error) {
    return <div className="rs rs-overlay"><div className="rs-wrap"><p>{error}</p><button type="button" className="rs-go" onClick={onClose}>Terug</button></div></div>;
  }
  if (!data) return <div className="rs rs-overlay"><div className="rs-wrap"><p>Verslag laden…</p></div></div>;
  return (
    <div className="rs-overlay">
      <PlayerBoard report={data} onClose={onClose} />
    </div>
  );
}

export function AdminResults({ sessionId, view, onClose }: { sessionId: string; view: "report" | "stage"; onClose: () => void }) {
  const { data, error } = usePoll<SessionReport>(`/api/sessions/${sessionId}/report`);
  if (error) return <div className="rs"><p>{error}</p></div>;
  if (!data) return <div className="rs"><p>Verslag laden…</p></div>;
  function pdf() { window.print(); }
  if (view === "stage") return <StageBoard report={data} onClose={onClose} />;
  return (
    <div>
      <div className="rs-row rs-noprint" style={{ marginBottom: 12 }}>
        <button type="button" className="btn" onClick={pdf}>PDF</button>
        <a className="btn" href={`/api/sessions/${sessionId}/report?format=csv`}>CSV voor Excel</a>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Sluiten</button>
      </div>
      <ManageBoard report={data} />
    </div>
  );
}
