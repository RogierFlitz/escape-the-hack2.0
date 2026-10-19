"use client";

import { useState } from "react";
import { DEMO_CODE, demoStops, type DemoStop } from "@/lib/game/demo";

export function demoToolsOn() {
  return process.env.NODE_ENV !== "production";
}

function clearDemoClient(code: string) {
  localStorage.removeItem(`eth-office-${code}`);
  localStorage.removeItem(`eth-snap-${code}`);
  localStorage.removeItem(`eth-queue-${code}`);
  sessionStorage.removeItem(`eth-hack-${code}`);
  sessionStorage.removeItem(`eth-cine-${code}`);
  sessionStorage.removeItem(`eth-origin-${code}`);
}

export function DemoJumps() {
  const [busy, setBusy] = useState<DemoStop | null>(null);
  const [error, setError] = useState("");
  if (!demoToolsOn()) return null;

  async function open(at: DemoStop) {
    setBusy(at);
    setError("");
    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ at }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Demo lukte niet.");
        setBusy(null);
        return;
      }
      clearDemoClient(data.code ?? DEMO_CODE);
      const preview = at === "resultaten" ? "?voorbeeld=1" : "";
      window.location.assign(`/play/${data.code ?? DEMO_CODE}${preview}`);
    } catch {
      setError("Demo lukte niet.");
      setBusy(null);
    }
  }

  return (
    <div className="demo-jumps">
      <p className="kicker">Testen</p>
      <p className="muted">Zet het demoteam terug op dit punt. Je hoeft geen nieuw spel te starten.</p>
      <div className="demo-row">
        {demoStops.map((stop) => (
          <button key={stop.id} className="btn" type="button" disabled={busy !== null} onClick={() => void open(stop.id)}>
            {busy === stop.id ? "…" : stop.label}
          </button>
        ))}
      </div>
      {error && <p className="note">{error}</p>}
    </div>
  );
}
