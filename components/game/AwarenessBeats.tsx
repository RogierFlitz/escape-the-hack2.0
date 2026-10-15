"use client";

import { useState } from "react";
import { decisionView, evalView } from "@/lib/game/awareness";

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
      <div className="stack">
        {view.choices.map((choice) => (
          <button
            key={choice.id}
            className={picked.includes(choice.id) ? "token on" : "token"}
            type="button"
            disabled={busy}
            onClick={() => {
              if (!view.multi) {
                onSubmit(choice.id);
                return;
              }
              setPicked((current) => current.includes(choice.id) ? current.filter((item) => item !== choice.id) : [...current, choice.id]);
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {view.multi && (
        <button className="btn btn-primary" type="button" disabled={busy || picked.length === 0} onClick={() => onSubmit(picked.join(","))}>Keuze vastleggen</button>
      )}
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
            <div className="stack">
              {view.choices.map((choice) => (
                <button key={choice.id} className="btn" type="button" disabled={busy} onClick={() => onPriority(choice.id)}>{choice.label}</button>
              ))}
            </div>
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
  return (
    <div className="stack">
      <p className="kicker">Nabespreking</p>
      <p>Vijf situaties voor het team. Dit is oefening, geen melding en geen certificaat.</p>
      {ids.map((id) => done.includes(id) ? <div key={id} className="token"><strong>{id}</strong><small>vastgelegd</small></div> : null)}
      {view && current && (
        <>
          <h3>{view.prompt}</h3>
          {view.choices.map((choice) => (
            <button key={choice.id} className="btn" type="button" disabled={busy} onClick={() => onSubmit(current, choice.id)}>{choice.label}</button>
          ))}
          {feedback?.id === current && <p className="note">{feedback.text}</p>}
        </>
      )}
      {!current && <p>De vijf situaties zijn besproken. Bewaar het trainingsrapport voor de nabespreking.</p>}
    </div>
  );
}
