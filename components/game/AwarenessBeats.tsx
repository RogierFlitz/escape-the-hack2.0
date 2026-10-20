"use client";

import { useState } from "react";
import { decisionView, evalView } from "@/lib/game/awareness";
import { Pick } from "./puzzles/ui";

export function DecisionCard({
  id,
  busy,
  feedback,
  onSubmit,
}: {
  id: "escalate" | "supplier";
  busy: boolean;
  feedback: string | null;
  onSubmit: (choice: string) => void;
}) {
  const view = decisionView(id);
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <div className="stack aw">
      <p className="kicker">NORA</p>
      <h2>{view.prompt}</h2>
      <p className="muted">{view.multi ? "Meerdere antwoorden mogen. Het vakje vinkt aan. Tik nog eens om te wissen." : "Kies één antwoord. De ronde stip toont de keuze."}</p>
      <div className="stack">
        {view.choices.map((choice) => (
          <Pick
            key={choice.id}
            many={view.multi}
            className="token"
            on={picked.includes(choice.id)}
            disabled={busy}
            onClick={() => {
              if (!view.multi) {
                setPicked([choice.id]);
                return;
              }
              setPicked((current) => current.includes(choice.id) ? current.filter((item) => item !== choice.id) : [...current, choice.id]);
            }}
          >
            {choice.label}
          </Pick>
        ))}
      </div>
      <button className="btn btn-primary" type="button" disabled={busy || picked.length === 0} onClick={() => onSubmit(view.multi ? picked.join(",") : picked[0])}>Keuze vastleggen</button>
      {feedback && <p className="note">{feedback}</p>}
    </div>
  );
}

export function DecisionHold({ text, onNext }: { text: string; onNext: () => void }) {
  return (
    <div className="stack aw">
      <p className="kicker">NORA</p>
      <p>{text}</p>
      <button className="btn btn-primary" type="button" onClick={onNext}>Verder</button>
    </div>
  );
}

export function RecoveryAwareness({
  priorityDone,
  priorityText,
  busy,
  onPriority,
}: {
  priorityDone: boolean;
  priorityText: string;
  busy: boolean;
  onPriority: (choice: string) => void;
}) {
  const view = decisionView("priority");
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState("");
  return (
    <div className="rv-aware">
      <div className="token">
        <strong>UNKNOWN SOFTWARE PACKAGE</strong>
        <small>SOURCE UNVERIFIED · geen download</small>
        {!open ? (
          <button className="btn" type="button" onClick={() => setOpen(true)}>Herkomst bekijken</button>
        ) : (
          <div className="stack">
            <p>Herkomst onbekend. De verkoper beweert dat dit een herstel is. Dat is niet gecontroleerd.</p>
            <p>Vertrouwen is laag. Een onbekend pakket kan extra toegang vragen of het herstel beschadigen.</p>
            <p>Nexora heeft al een veiligere weg: de Nachtelijke Kluis, een gecontroleerde back-up. Het onbekende pakket blijft dicht.</p>
            <button className="btn" type="button" onClick={() => setOpen(false)}>Niet gebruiken</button>
          </div>
        )}
      </div>
      <div className="token">
        <p className="kicker">NORA</p>
        {priorityDone ? <p>{priorityText}</p> : (
          <>
            <p>{view.prompt}</p>
            <p className="muted">Kies één antwoord. De ronde stip toont de keuze.</p>
            <div className="stack">
              {view.choices.map((choice) => (
                <Pick key={choice.id} className="token" on={picked === choice.id} disabled={busy} onClick={() => setPicked(choice.id)}>{choice.label}</Pick>
              ))}
            </div>
            <button className="btn btn-primary" type="button" disabled={busy || !picked} onClick={() => onPriority(picked)}>Keuze vastleggen</button>
          </>
        )}
      </div>
    </div>
  );
}

export function EvalBoard({
  done,
  feedback,
  busy,
  onSubmit,
}: {
  done: string[];
  feedback: { id: string; text: string } | null;
  busy: boolean;
  onSubmit: (id: string, choice: string) => void;
}) {
  const ids = ["invoice", "public-doc", "login", "colleague", "outage"];
  const current = ids.find((id) => !done.includes(id)) ?? null;
  const view = current ? evalView(current) : null;
  const [picked, setPicked] = useState("");
  return (
    <div className="stack">
      <p className="kicker">Nabespreking</p>
      <p>Vijf situaties voor het team. Dit is oefening, geen melding en geen certificaat.</p>
      {ids.map((id) => done.includes(id) ? <div key={id} className="token"><strong>{id}</strong><small>vastgelegd</small></div> : null)}
      {view && current && (
        <>
          <h3>{view.prompt}</h3>
          <p className="muted">Kies één antwoord en bevestig.</p>
          {view.choices.map((choice) => (
            <Pick key={choice.id} className="token" on={picked === choice.id} disabled={busy} onClick={() => setPicked(choice.id)}>{choice.label}</Pick>
          ))}
          <button className="btn btn-primary" type="button" disabled={busy || !picked} onClick={() => { onSubmit(current, picked); setPicked(""); }}>Keuze vastleggen</button>
          {feedback?.id === current && <p className="note">{feedback.text}</p>}
        </>
      )}
      {!current && <p>De vijf situaties zijn besproken. Bewaar het trainingsrapport voor de nabespreking.</p>}
    </div>
  );
}
