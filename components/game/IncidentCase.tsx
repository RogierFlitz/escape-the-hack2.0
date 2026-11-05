"use client";

import { useState } from "react";
import { TaskCue } from "./puzzles/ui";

type CaseId = "mfa" | "share" | "tool";

const CASES: Record<CaseId, {
  openLabel: string;
  evidenceTitle: string;
  lines: string[];
  choices: { id: string; label: string }[];
}> = {
  mfa: {
    openLabel: "Open de melding",
    evidenceTitle: "Melding op het scherm",
    lines: [
      "Goedkeuren om in te loggen?",
      "Account: leveranciersservice",
      "Plaats: buiten dit kantoor",
      "Tijd: nu",
      "Jullie zijn zelf niet aan het inloggen.",
    ],
    choices: [
      { id: "approve", label: "Goedkeuren" },
      { id: "report", label: "Niet goedkeuren en melden" },
      { id: "ignore", label: "Laten liggen" },
    ],
  },
  share: {
    openLabel: "Open het bericht",
    evidenceTitle: "Bericht van Administratie",
    lines: [
      "Van: Administratie <administratie@nexora-mail.com>",
      "Onderwerp: de volledige klantenlijst, nog voor twaalf uur",
      "Bijlage: klanten.xlsx",
      "De afdeling klinkt bekend. Het verzoek is haast.",
    ],
    choices: [
      { id: "send", label: "De lijst versturen" },
      { id: "verify", label: "Eerst controleren via een bekend kanaal" },
      { id: "ignore", label: "Negeren" },
    ],
  },
  tool: {
    openLabel: "Open het aanbod",
    evidenceTitle: "Herstel-hulp",
    lines: [
      "Dit programma belooft de bestanden terug te zetten.",
      "Uitgever: onbekend",
      "Het vraagt extra rechten.",
      "Het komt niet van Nexora.",
    ],
    choices: [
      { id: "run", label: "Het programma starten" },
      { id: "hold", label: "Niet starten en het bewaren als spoor" },
    ],
  },
};

export function IncidentCase({ id, busy, onSubmit }: { id: CaseId; busy: boolean; onSubmit: (choice: string, opened: boolean) => void }) {
  const data = CASES[id];
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("");
  const reason = !open ? "Open eerst de melding." : !choice ? "Kies eerst een actie." : "";
  return (
    <div className="panel case-board">
      <TaskCue id={id} />
      {!open ? (
        <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>{data.openLabel}</button>
      ) : (
        <article className="token">
          <small>{data.evidenceTitle}</small>
          {data.lines.map((line) => <p key={line}>{line}</p>)}
        </article>
      )}
      {open && (
        <div className="choices">
          {data.choices.map((item) => (
            <button key={item.id} className={`btn${choice === item.id ? " btn-primary" : ""}`} type="button" onClick={() => setChoice(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      )}
      <button className="btn btn-primary" type="button" disabled={busy || !open || !choice} onClick={() => onSubmit(choice, open)}>
        {reason || "Keuze vastleggen"}
      </button>
      {reason && <p className="sp-quiet">{reason}</p>}
    </div>
  );
}
