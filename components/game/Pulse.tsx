"use client";

import { useState } from "react";
import { PULSE } from "@/lib/game/awareness";

export function PulseBoard({
  when,
  busy,
  onSubmit,
}: {
  when: "before" | "after";
  busy: boolean;
  onSubmit: (answers: Record<string, string>) => void;
}) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const ready = PULSE.every((item) => picked[item.id]);
  return (
    <section className="pulse" aria-label={when === "before" ? "Meting aan het begin" : "Meting aan het eind"}>
      <p className="kicker">{when === "before" ? "Voor het verhaal" : "Na het incident"}</p>
      <h1>{when === "before" ? "Hoe zouden jullie dit nu aanpakken?" : "Zouden jullie dit nu anders doen?"}</h1>
      <p>Vier situaties van de werkvloer. Overleg en kies samen. Dit telt niet mee in de score en is geen toets.</p>
      {PULSE.map((item) => (
        <fieldset key={item.id}>
          <legend>{item.prompt}</legend>
          {item.choices.map((choice) => (
            <button key={choice.id} type="button" aria-pressed={picked[item.id] === choice.id} className={picked[item.id] === choice.id ? "on" : ""} onClick={() => setPicked((current) => ({ ...current, [item.id]: choice.id }))}>
              {choice.label}
            </button>
          ))}
        </fieldset>
      ))}
      <button className="btn btn-primary" type="button" disabled={busy || !ready} onClick={() => onSubmit(picked)}>Meting vastleggen</button>
    </section>
  );
}
