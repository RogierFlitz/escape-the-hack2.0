"use client";

import { useEffect, useRef, useState } from "react";
import { boardEvidence, boardQuestions, reconChoices } from "@/lib/game/footprint";
import { asSector } from "@/lib/game/sector";
import { useSector } from "./SectorSkin";
import { TaskCue } from "./puzzles/ui";
import { clearDraft, useDraft } from "./footprint/draft";

export { ArchivePuzzle } from "./footprint/ArchiveDesk";

const hotspots = [
  { id: "sign", label: "Bord" },
  { id: "plan", label: "Vel" },
  { id: "badge", label: "Pas" },
  { id: "lanyard", label: "Keycord" },
  { id: "mug", label: "Mok" },
  { id: "plant", label: "Plant" },
] as const;

export function PhotoPuzzle({
  solved,
  busy,
  onSolve,
}: {
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const [spots, setSpots] = useDraft<string[]>("ch1-login", []);
  const [zoom, setZoom] = useState(1);
  const lens = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (solved) clearDraft("ch1-login");
  }, [solved]);
  useEffect(() => {
    const node = lens.current;
    if (!node || zoom === 1) return;
    node.scrollLeft = (node.scrollWidth - node.clientWidth) * 0.42;
    node.scrollTop = (node.scrollHeight - node.clientHeight) * 0.72;
  }, [zoom]);

  function toggle(id: string) {
    setSpots((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="fp fp-photo">
      <TaskCue id="ch1-login" />
      <div className="fp-lens" data-zoom={zoom >= 1.55 ? "in" : "out"} ref={lens}>
        <div className="fp-tools">
          <button className="btn" type="button" onClick={() => setZoom((value) => Math.max(1, Number((value - 0.45).toFixed(2))))}>−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button className="btn" type="button" onClick={() => setZoom((value) => Math.min(2.2, Number((value + 0.45).toFixed(2))))}>+</button>
        </div>
        <div className="fp-shot" style={{ width: `${zoom * 100}%`, height: `${Math.round(520 * zoom)}px` }}>
          <button className={`fp-hot sign${spots.includes("sign") ? " on" : ""}`} type="button" onClick={() => toggle("sign")}>
            <span className="fp-fine">DOKZAAL</span>
          </button>
          <button className={`fp-hot plan${spots.includes("plan") ? " on" : ""}`} type="button" onClick={() => toggle("plan")}>
            <span className="fp-fine"><b>Nexora Day</b><i>07:30 crew</i><i>Helix vloer</i></span>
          </button>
          <button className={`fp-hot badge${spots.includes("badge") ? " on" : ""}`} type="button" onClick={() => toggle("badge")}>
            <span className="fp-fine"><small>NEXORA</small><b>J. VALE</b><em>4418</em></span>
          </button>
          <button className={`fp-hot lanyard${spots.includes("lanyard") ? " on" : ""}`} type="button" onClick={() => toggle("lanyard")}>
            <span className="fp-fine">HELIX</span>
          </button>
          <button className={`fp-hot mug${spots.includes("mug") ? " on" : ""}`} type="button" onClick={() => toggle("mug")} aria-label="Mok" />
          <button className={`fp-hot plant${spots.includes("plant") ? " on" : ""}`} type="button" onClick={() => toggle("plant")} aria-label="Plant" />
        </div>
      </div>
      <aside className="fp-side">
        <p className="kicker">Gemarkeerd</p>
        {hotspots.map((spot) => (
          <button key={spot.id} className={`fp-slot${spots.includes(spot.id) ? " filled" : ""}`} type="button" onClick={() => toggle(spot.id)}>
            <strong>{spot.label}</strong>
            <small>{spots.includes(spot.id) ? "gemarkeerd" : "open"}</small>
          </button>
        ))}
        <button className="btn btn-mint" type="button" disabled={busy || solved || spots.length === 0} onClick={() => onSolve({ spots })}>
          Details vastleggen
        </button>
      </aside>
    </div>
  );
}

export function BoardPuzzle({
  solved,
  busy,
  onSolve,
}: {
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const sector = useSector();
  const [links, setLinks] = useDraft<Record<string, string>>("ch1-nodes", {});
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => {
    if (solved) clearDraft("ch1-nodes");
  }, [solved]);

  function assign(question: string) {
    if (!picked) return;
    setLinks((current) => ({ ...current, [question]: picked }));
    setPicked(null);
  }

  const ready = boardQuestions.every((question) => links[question.id]);

  return (
    <div className="fp fp-board">
      <TaskCue id="ch1-nodes" />
      <div className="fp-main">
        <p className="kicker">Bewijsstukken</p>
        <div className="fp-chips">
          {boardEvidence.map((item) => {
            const used = Object.values(links).includes(item.id);
            return (
              <button
                key={item.id}
                className={`fp-chip${picked === item.id ? " on" : ""}${used ? " used" : ""}`}
                type="button"
                onClick={() => setPicked((current) => (current === item.id ? null : item.id))}
              >
                {asSector(sector, item.label)}
              </button>
            );
          })}
        </div>
      </div>
      <div className="fp-main">
        <p className="kicker">Vragen</p>
        <div className="fp-questions">
          {boardQuestions.map((question) => {
            const evidence = boardEvidence.find((item) => item.id === links[question.id]);
            return (
              <div key={question.id} className={`fp-q${evidence ? " linked" : ""}${picked ? " armed" : ""}`}>
                <button type="button" onClick={() => assign(question.id)}>
                  <small>{asSector(sector, question.label)}</small>
                  <strong>{evidence ? asSector(sector, evidence.label) : (picked ? "koppelen" : "—")}</strong>
                </button>
                {evidence && (
                  <button
                    type="button"
                    onClick={() => setLinks((current) => {
                      const next = { ...current };
                      delete next[question.id];
                      return next;
                    })}
                  >
                    los
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button className="btn btn-mint" type="button" disabled={busy || solved || !ready} onClick={() => onSolve({ links })}>
          Bord controleren
        </button>
      </div>
    </div>
  );
}

export function ReconPuzzle({
  solved,
  busy,
  onSolve,
}: {
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const sector = useSector();
  const [file, setFile] = useDraft<{ event: string; name: string; step: string }>("ch1-ports", { event: "", name: "", step: "" });
  useEffect(() => {
    if (solved) clearDraft("ch1-ports");
  }, [solved]);
  const ready = Boolean(file.event && file.name && file.step);

  return (
    <div className="fp fp-recon">
      <TaskCue id="ch1-ports" />
      <div className="fp-zip">
        <header>
          <strong>{asSector(sector, "recon-nexora.zip")}</strong>
          <span>notes.txt · gedeeltelijk</span>
        </header>
        <pre>{`KADE / prep
public_sources: combined
target_event: ${file.event ? asSector(sector, reconChoices.event.find((item) => item.id === file.event)?.label ?? "") : "████"}
trusted_name: ${file.name ? asSector(sector, reconChoices.name.find((item) => item.id === file.name)?.label ?? "") : "████"}
next_step:    ${file.step ? asSector(sector, reconChoices.step.find((item) => item.id === file.step)?.label ?? "") : "████"}
network_entry: [nog niet in dit bestand]`}</pre>
      </div>
      <aside className="fp-side">
        <Field label="Evenement" value={file.event} options={reconChoices.event} onPick={(event) => setFile((current) => ({ ...current, event }))} />
        <Field label="Naam die hij kon gebruiken" value={file.name} options={reconChoices.name} onPick={(name) => setFile((current) => ({ ...current, name }))} />
        <Field label="Wat hij daarmee kon doen" value={file.step} options={reconChoices.step} onPick={(step) => setFile((current) => ({ ...current, step }))} />
        <button className="btn btn-mint" type="button" disabled={busy || solved || !ready} onClick={() => onSolve(file)}>
          Reconstructie vastleggen
        </button>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  options,
  onPick,
}: {
  label: string;
  value: string;
  options: readonly { id: string; label: string }[];
  onPick: (id: string) => void;
}) {
  const sector = useSector();
  return (
    <div className="fp-field">
      <p>{label}</p>
      <div className="fp-chips">
        {options.map((option) => (
          <button key={option.id} className={`fp-chip${value === option.id ? " on" : ""}`} type="button" onClick={() => onPick(option.id)}>
            {asSector(sector, option.label)}
          </button>
        ))}
      </div>
    </div>
  );
}
