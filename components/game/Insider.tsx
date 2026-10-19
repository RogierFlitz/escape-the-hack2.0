"use client";

import { useEffect, useState } from "react";
import {
  accessRows,
  causes,
  chatLines,
  documents,
  intents,
  noraInsider,
  people,
  placeChoices,
  proof,
  sections,
  shareHistory,
  wall,
} from "@/lib/game/insider";
import { TaskCue } from "./puzzles/ui";

function useDraft<T>(id: string, initial: T) {
  const key = `eth-m5-${id}`;
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* keep the empty case file */
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, ready, value]);
  return [value, setValue] as const;
}

const blankPlaces = { vale: "", crew: "", okonkwo: "", crowe: "" };

export function InsiderDesk({
  puzzleId,
  solved,
  busy,
  onSolve,
}: {
  puzzleId: string;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const preferred = puzzleId === "ch5-places" ? "time" : puzzleId === "ch5-share" ? "doc" : puzzleId === "ch5-accuse" ? "board" : "wall";
  const [section, setSection] = useState(preferred);
  const [intro, setIntro] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const [index, setIndex] = useDraft<Record<string, number>>("ch5-camera-index", {});
  const [frames, setFrames] = useDraft<string[]>("ch5-camera", []);
  const [places, setPlaces] = useDraft<Record<string, string>>("ch5-places", blankPlaces);
  const [badge, setBadge] = useDraft("ch5-places-badge", "");
  const [setting, setSetting] = useDraft("ch5-share-setting", "");
  const [opened, setOpened] = useDraft("ch5-share-open", "");
  const [message, setMessage] = useDraft("ch5-share-msg", "");
  const [person, setPerson] = useDraft("ch5-accuse-person", "");
  const [documentId, setDocumentId] = useDraft("ch5-accuse-doc", "");
  const [cause, setCause] = useDraft("ch5-accuse-cause", "");
  const [intent, setIntent] = useDraft("ch5-accuse-intent", "");
  const [evidence, setEvidence] = useDraft<string[]>("ch5-accuse-proof", []);

  useEffect(() => {
    setSection(preferred);
    setZoom(null);
  }, [preferred]);

  useEffect(() => {
    if (puzzleId !== "ch5-camera") return;
    if (sessionStorage.getItem("eth-m5-intro")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem("eth-m5-intro", "1");
      return;
    }
    setIntro(true);
    const timer = window.setTimeout(() => {
      setIntro(false);
      sessionStorage.setItem("eth-m5-intro", "1");
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [puzzleId]);

  useEffect(() => {
    if (!solved) return;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(`eth-m5-${puzzleId}`)) localStorage.removeItem(key);
    }
  }, [puzzleId, solved]);

  const camera = wall.find((item) => item.stills.some((still) => still.id === zoom));
  const still = camera?.stills.find((item) => item.id === zoom) ?? null;

  return (
    <div className="rv in">
      <TaskCue id={puzzleId} nora={puzzleId === "ch5-camera" ? noraInsider : undefined} />
      <div className="rv-main">
        <div className="sp-nav">
          {sections.map((item) => (
            <button key={item.id} className={section === item.id ? "on" : ""} type="button" onClick={() => { setSection(item.id); setZoom(null); }}>{item.label}</button>
          ))}
        </div>
        {intro ? (
          <div className="in-banner">Nieuwe bewijsstukken beschikbaar.</div>
        ) : still && camera ? (
          <StillView
            code={camera.code}
            place={camera.place}
            still={still}
            saved={frames.includes(still.id)}
            onPrev={() => shift(camera.id, -1)}
            onNext={() => shift(camera.id, 1)}
            onSave={() => toggleFrame(still.id)}
            onBack={() => setZoom(null)}
          />
        ) : section === "wall" ? (
          <div className="in-wall">
            {wall.map((item) => {
              const frame = item.stills[index[item.id] ?? 0];
              return (
                <button key={item.id} type="button" onClick={() => setZoom(frame.id)}>
                  <img src={frame.image} alt="" />
                  <span><b>{item.code}</b> {item.place}</span>
                  <small>fragment {frame.time}{frames.includes(frame.id) ? " · bewaard" : ""}</small>
                </button>
              );
            })}
          </div>
        ) : section === "time" ? (
          <ol className="in-time">
            {accessRows.map((row) => (
              <li key={`${row.time}-${row.kind}`}>
                <b>{row.time}</b>
                <span>{row.kind}</span>
                <p>{row.text}</p>
              </li>
            ))}
          </ol>
        ) : section === "people" ? (
          <div className="in-people">
            {people.map((item) => (
              <article key={item.id}>
                <h3>{item.name}</h3>
                <p>{item.role}</p>
                <q>{item.quote}</q>
              </article>
            ))}
          </div>
        ) : section === "doc" ? (
          <article className="rv-doc">
            <h2>planning-nexora-day.xlsx</h2>
            <p>Eigenaar in de deellijst: S. Adler, namens de vloercrew. Versie v3. De nachtmail en de export staan apart.</p>
            <ul className="in-time">
              {shareHistory.map((row) => (
                <li key={row.id}><b>{row.time}</b><p>{row.text}</p></li>
              ))}
            </ul>
          </article>
        ) : section === "chat" ? (
          <div className="in-chat">
            {chatLines.map((line) => (
              <p key={line.id}><b>{line.time} {line.who}</b>{line.text}</p>
            ))}
          </div>
        ) : (
          <div className="in-board">
            <p>Bewaard uit de wand: {frames.length === 0 ? "nog geen momentopname" : frames.join(", ")}</p>
            <p>Koppel hier alleen bewijs dat het delen zelf laat zien. Een deurbeeld toont een plek, geen bestand.</p>
          </div>
        )}
      </div>
      {puzzleId === "ch5-camera" && (
        <aside className="fp-side">
          <p className="kicker">Momentopnames</p>
          <p>Elke camera heeft twee fragmenten. Bewaar het fragment dat iemand of een pas op een plek zet.</p>
          <p>{frames.length} bewaard</p>
          <button className="btn btn-mint" type="button" disabled={busy || solved || frames.length === 0} onClick={() => onSolve({ frames })}>Beelden vastleggen</button>
        </aside>
      )}
      {puzzleId === "ch5-places" && (
        <PlaceCase places={places} setPlaces={setPlaces} badge={badge} setBadge={setBadge} solved={solved} busy={busy} onSolve={onSolve} />
      )}
      {puzzleId === "ch5-share" && (
        <ShareCase setting={setting} setSetting={setSetting} opened={opened} setOpened={setOpened} message={message} setMessage={setMessage} solved={solved} busy={busy} onSolve={onSolve} />
      )}
      {puzzleId === "ch5-accuse" && (
        <ReportCase
          person={person}
          setPerson={setPerson}
          documentId={documentId}
          setDocumentId={setDocumentId}
          cause={cause}
          setCause={setCause}
          intent={intent}
          setIntent={setIntent}
          evidence={evidence}
          setEvidence={setEvidence}
          solved={solved}
          busy={busy}
          onSolve={onSolve}
        />
      )}
    </div>
  );

  function shift(cameraId: string, delta: number) {
    const item = wall.find((entry) => entry.id === cameraId);
    if (!item) return;
    setIndex((current) => {
      const next = ((current[cameraId] ?? 0) + delta + item.stills.length) % item.stills.length;
      const id = item.stills[next].id;
      setZoom(id);
      return { ...current, [cameraId]: next };
    });
  }

  function toggleFrame(id: string) {
    setFrames((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }
}

function StillView({
  code,
  place,
  still,
  saved,
  onPrev,
  onNext,
  onSave,
  onBack,
}: {
  code: string;
  place: string;
  still: { id: string; time: string; image: string; caption: string };
  saved: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
  onBack: () => void;
}) {
  return (
    <figure className="in-zoom">
      <img src={still.image} alt="" />
      <figcaption>
        <b>{code}</b> {place}
        <span>fragment {still.time} · stilstaand beeld</span>
        <p>{still.caption}</p>
      </figcaption>
      <div className="in-zoom-actions">
        <button className="btn btn-ghost" type="button" onClick={onBack}>Wand</button>
        <button className="btn" type="button" onClick={onPrev}>Vorig fragment</button>
        <button className="btn" type="button" onClick={onNext}>Volgend fragment</button>
        <button className="btn btn-mint" type="button" onClick={onSave}>{saved ? "Bewaard" : "Momentopname"}</button>
      </div>
    </figure>
  );
}

function PlaceCase({
  places,
  setPlaces,
  badge,
  setBadge,
  solved,
  busy,
  onSolve,
}: {
  places: Record<string, string>;
  setPlaces: (value: Record<string, string> | ((current: Record<string, string>) => Record<string, string>)) => void;
  badge: string;
  setBadge: (value: string) => void;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const slots = [
    { id: "vale", label: "J. Vale" },
    { id: "crew", label: "De werkjas" },
    { id: "okonkwo", label: "M. Okonkwo" },
    { id: "crowe", label: "L. Crowe" },
  ];
  const ready = slots.every((slot) => places[slot.id]) && Boolean(badge);
  return (
    <aside className="fp-side">
      <p className="kicker">Waar</p>
      <p>Zet elke persoon op de plek die de beelden of het ticket tonen. De log is een registratie, geen camera.</p>
      {slots.map((slot) => (
        <div key={slot.id} className="in-slot">
          <b>{slot.label}</b>
          <div className="sp-nav">
            {placeChoices.map((place) => (
              <button key={place.id} className={places[slot.id] === place.id ? "on" : ""} type="button" onClick={() => setPlaces((current) => ({ ...current, [slot.id]: place.id }))}>{place.label}</button>
            ))}
          </div>
        </div>
      ))}
      <p>Pas 4418 om 02:31 en de beelden van dat moment:</p>
      <div className="sp-nav">
        <button className={badge === "same" ? "on" : ""} type="button" onClick={() => setBadge("same")}>Horen bij elkaar</button>
        <button className={badge === "apart" ? "on" : ""} type="button" onClick={() => setBadge("apart")}>Wijken af</button>
      </div>
      <button className="btn btn-mint" type="button" disabled={busy || solved || !ready} onClick={() => onSolve({ places, badge })}>Plekken vastleggen</button>
    </aside>
  );
}

function ShareCase({
  setting,
  setSetting,
  opened,
  setOpened,
  message,
  setMessage,
  solved,
  busy,
  onSolve,
}: {
  setting: string;
  setSetting: (value: string) => void;
  opened: string;
  setOpened: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const ready = Boolean(setting && opened && message);
  return (
    <aside className="fp-side">
      <p className="kicker">Delen</p>
      <p>Wijs de wijziging aan, de opening van buitenaf, en het chatbericht dat daarbij hoort.</p>
      <b>Deelregel</b>
      <div className="sp-picks">
        {shareHistory.map((row) => (
          <button key={row.id} className={`fp-chip${setting === row.id ? " on" : ""}`} type="button" onClick={() => setSetting(row.id)}>{row.time}</button>
        ))}
      </div>
      <b>Opening</b>
      <div className="sp-picks">
        {shareHistory.map((row) => (
          <button key={row.id} className={`fp-chip${opened === row.id ? " on" : ""}`} type="button" onClick={() => setOpened(row.id)}>{row.time}</button>
        ))}
      </div>
      <b>Chat</b>
      <div className="sp-picks">
        {chatLines.map((line) => (
          <button key={line.id} className={`fp-chip${message === line.id ? " on" : ""}`} type="button" onClick={() => setMessage(line.id)}>{line.time} {line.who}</button>
        ))}
      </div>
      <button className="btn btn-mint" type="button" disabled={busy || solved || !ready} onClick={() => onSolve({ setting, opened, message })}>Delen vastleggen</button>
    </aside>
  );
}

function ReportCase({
  person,
  setPerson,
  documentId,
  setDocumentId,
  cause,
  setCause,
  intent,
  setIntent,
  evidence,
  setEvidence,
  solved,
  busy,
  onSolve,
}: {
  person: string;
  setPerson: (value: string) => void;
  documentId: string;
  setDocumentId: (value: string) => void;
  cause: string;
  setCause: (value: string) => void;
  intent: string;
  setIntent: (value: string) => void;
  evidence: string[];
  setEvidence: (value: string[] | ((current: string[]) => string[])) => void;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const ready = Boolean(person && documentId && cause && intent && evidence.length > 0);
  function toggle(id: string) {
    setEvidence((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }
  return (
    <aside className="fp-side">
      <p className="kicker">Rapport</p>
      <p>Stel de conclusie samen. Een camera alleen is geen bewijs van delen.</p>
      <div className="sp-picks">
        {people.map((item) => (
          <button key={item.id} className={`fp-chip${person === item.id ? " on" : ""}`} type="button" onClick={() => setPerson(item.id)}>{item.name}</button>
        ))}
      </div>
      <div className="sp-picks">
        {documents.map((item) => (
          <button key={item.id} className={`fp-chip${documentId === item.id ? " on" : ""}`} type="button" onClick={() => setDocumentId(item.id)}>{item.label}</button>
        ))}
      </div>
      <div className="sp-picks">
        {causes.map((item) => (
          <button key={item.id} className={`fp-chip${cause === item.id ? " on" : ""}`} type="button" onClick={() => setCause(item.id)}>{item.label}</button>
        ))}
      </div>
      <div className="sp-picks">
        {intents.map((item) => (
          <button key={item.id} className={`fp-chip${intent === item.id ? " on" : ""}`} type="button" onClick={() => setIntent(item.id)}>{item.label}</button>
        ))}
      </div>
      <div className="sp-picks">
        {proof.map((item) => (
          <button key={item.id} className={`fp-chip${evidence.includes(item.id) ? " on" : ""}`} type="button" onClick={() => toggle(item.id)}>{item.label}</button>
        ))}
      </div>
      <button className="btn btn-mint" type="button" disabled={busy || solved || !ready} onClick={() => onSolve({ person, document: documentId, cause, intent, evidence })}>Rapport vastleggen</button>
    </aside>
  );
}
