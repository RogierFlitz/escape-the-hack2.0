"use client";

import { useEffect, useState } from "react";
import { cipherText, symbolPalette, symbolRows } from "@/lib/game/content";
import {
  backupReports,
  noraRecovery,
  passes,
  restoreNames,
  restoredBodies,
  sections,
  vaultFiles,
} from "@/lib/game/recovery";
import type { Token } from "@/lib/types";
import { RecoveryAwareness } from "./AwarenessBeats";
import { Shape } from "./puzzles/ui";

function useDraft<T>(id: string, initial: T) {
  const key = `eth-m4-${id}`;
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

function turn(shift: number) {
  const step = ((shift % 26) + 26) % 26;
  return cipherText.replace(/[A-Z]/g, (char) => String.fromCharCode(((char.charCodeAt(0) - 65 - step + 26) % 26) + 65));
}

const shapeName: Record<string, string> = { diamond: "ruit", square: "vierkant", circle: "cirkel", triangle: "driehoek" };

export function RecoveryDesk({
  puzzleId,
  solved,
  busy,
  inventory,
  onSolve,
  training = false,
  priorityDone = false,
  priorityText = "",
  onPriority,
}: {
  puzzleId: string;
  solved: boolean;
  busy: boolean;
  inventory: Token[];
  onSolve: (payload: unknown) => void;
  training?: boolean;
  priorityDone?: boolean;
  priorityText?: string;
  onPriority?: (choice: string) => void;
}) {
  const preferred = puzzleId === "ch4-symbols" ? "files" : puzzleId === "ch4-decode" ? "restore" : puzzleId === "ch4-backup" ? "copies" : "protocol";
  const [section, setSection] = useState(preferred);
  const [openId, setOpenId] = useState<string | null>(null);
  const [intro, setIntro] = useState(false);
  const [damaged, setDamaged] = useDraft<string[]>("ch4-symbols", []);
  const [cycle, setCycle] = useDraft("ch4-sequence", "");
  const [shift, setShift] = useDraft("ch4-rotor-shift", 0);
  const [shape, setShape] = useDraft("ch4-rotor-shape", "");
  const [copy, setCopy] = useDraft("ch4-backup", "");
  const [checkpoint, setCheckpoint] = useDraft("ch4-decode-point", "");
  const [ran, setRan] = useDraft("ch4-decode-ran", false);
  const [opened, setOpened] = useDraft<string[]>("ch4-decode-open", []);
  const [pass, setPass] = useDraft("ch4-decode-pass", "");
  const [local, setLocal] = useState("");

  useEffect(() => {
    setSection(preferred);
    setLocal("");
  }, [preferred]);

  useEffect(() => {
    if (puzzleId !== "ch4-symbols") return;
    if (sessionStorage.getItem("eth-m4-intro")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem("eth-m4-intro", "1");
      return;
    }
    setIntro(true);
    const timer = window.setTimeout(() => {
      setIntro(false);
      sessionStorage.setItem("eth-m4-intro", "1");
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [puzzleId]);

  useEffect(() => {
    if (!solved) return;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(`eth-m4-${puzzleId}`)) localStorage.removeItem(key);
    }
  }, [puzzleId, solved]);

  const open = vaultFiles.find((file) => file.id === openId) ?? null;
  const route = inventory.find((token) => token.id.startsWith("ROUTE"));

  return (
    <div className="rv">
      <div className="rv-main">
        <div className="rv-status">
          <span className="up">VAULT bereikbaar</span>
          <span>EDGE beperkt</span>
          <span>LOG online</span>
        </div>
        {puzzleId === "ch4-symbols" && <p className="fp-nora">{noraRecovery}</p>}
        {training && onPriority && (
          <RecoveryAwareness priorityDone={priorityDone} priorityText={priorityText} busy={busy} onPriority={onPriority} />
        )}
        <div className="sp-nav">
          {sections.map((item) => (
            <button key={item.id} className={section === item.id ? "on" : ""} type="button" onClick={() => setSection(item.id)}>{item.label}</button>
          ))}
        </div>
        {intro ? (
          <div className="rv-lock">
            {restoreNames.slice(0, 5).map((name) => <p key={name}>{name} <b>vergrendeld</b></p>)}
          </div>
        ) : section === "files" ? (
          <Explorer open={open} onOpen={setOpenId} />
        ) : section === "protocol" ? (
          <Protocol shift={shift} setShift={setShift} shape={shape} setShape={setShape} cycle={cycle} setCycle={setCycle} route={route?.label ?? "route-token"} showRotor={puzzleId === "ch4-rotor"} showCycle={puzzleId !== "ch4-symbols"} />
        ) : section === "copies" ? (
          <Copies />
        ) : (
          <RestoreView ran={ran} opened={opened} onOpen={(id) => setOpened((current) => (current.includes(id) ? current : [...current, id]))} />
        )}
      </div>
      {puzzleId === "ch4-symbols" && (
        <FileCase damaged={damaged} setDamaged={setDamaged} solved={solved} busy={busy} onSolve={onSolve} />
      )}
      {puzzleId === "ch4-sequence" && (
        <CycleCase cycle={cycle} solved={solved} busy={busy} onSolve={onSolve} />
      )}
      {puzzleId === "ch4-rotor" && (
        <SealCase shift={shift} shape={shape} solved={solved} busy={busy} onSolve={onSolve} />
      )}
      {puzzleId === "ch4-backup" && (
        <CopyCase copy={copy} setCopy={setCopy} solved={solved} busy={busy} onSolve={onSolve} />
      )}
      {puzzleId === "ch4-decode" && (
        <RestoreCase
          checkpoint={checkpoint}
          setCheckpoint={setCheckpoint}
          ran={ran}
          setRan={setRan}
          opened={opened}
          pass={pass}
          setPass={setPass}
          local={local}
          setLocal={setLocal}
          solved={solved}
          busy={busy}
          onSolve={onSolve}
        />
      )}
    </div>
  );
}

function Explorer({ open, onOpen }: { open: { id: string; name: string; folder: string; version: string; modified: string; check: string; preview: string; readable: boolean } | null; onOpen: (id: string | null) => void }) {
  if (open) {
    return (
      <article className="rv-doc">
        <header>
          <button className="btn btn-ghost" type="button" onClick={() => onOpen(null)}>Alle bestanden</button>
          <span>{open.folder}</span>
        </header>
        <h2>{open.name}</h2>
        <p>Versie {open.version} · {open.modified} · controle {open.check}</p>
        <pre className={open.readable ? "" : "noise"}>{open.preview}</pre>
      </article>
    );
  }
  return (
    <div className="rv-list">
      {vaultFiles.map((file) => (
        <button key={file.id} type="button" onClick={() => onOpen(file.id)}>
          <strong>{file.name}</strong>
          <span>{file.folder}</span>
          <small>{file.modified} · {file.version}</small>
        </button>
      ))}
    </div>
  );
}

function Protocol({
  shift,
  setShift,
  shape,
  setShape,
  cycle,
  setCycle,
  route,
  showRotor,
  showCycle,
}: {
  shift: number;
  setShift: (value: number | ((current: number) => number)) => void;
  shape: string;
  setShape: (value: string) => void;
  cycle: string;
  setCycle: (value: string | ((current: string) => string)) => void;
  route: string;
  showRotor: boolean;
  showCycle: boolean;
}) {
  const step = ((shift % 26) + 26) % 26;
  function press(key: string) {
    setCycle((current) => (key === "wissen" ? current.slice(0, -1) : (current + key).slice(0, 2)));
  }
  return (
    <div className="rv-protocol">
      {showCycle && (
        <div className="rv-console">
          <p className="kicker">Kluiscycli uit het handboek</p>
          <div className="rv-bars">
            {[4, 7, 11, 16].map((item) => <span key={item}>{item}</span>)}
            <span>{cycle || "?"}</span>
          </div>
          {!showRotor && (
            <div className="rv-keys">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "wissen"].map((key) => (
                <button key={key} type="button" onClick={() => press(key)}>{key}</button>
              ))}
            </div>
          )}
        </div>
      )}
      {showRotor && (
        <>
          <p>De cassette. Elke rij is de vorige, één plek opgeschoven. Het routetoken ligt in de inventaris: {route}.</p>
          <div className="rv-rows">
            {symbolRows.map((row, index) => (
              <div key={index}>
                {row.map((cell, cellIndex) => (
                  <span key={cellIndex}>{cell ? <Shape name={cell} /> : "?"}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="sp-nav">
            {symbolPalette.map((item) => (
              <button key={item} className={shape === item ? "on" : ""} type="button" onClick={() => setShape(item)}>
                <Shape name={item} /> {shapeName[item]}
              </button>
            ))}
          </div>
          <div className="rv-rotor">
            <button type="button" onClick={() => setShift((value) => value - 1)}>−</button>
            <strong>{String(step).padStart(2, "0")}</strong>
            <button type="button" onClick={() => setShift((value) => value + 1)}>+</button>
          </div>
          <p className="rv-word">{cipherText} → {turn(shift)}</p>
        </>
      )}
      {!showRotor && !showCycle && <p>Het handboek in de bestanden noemt de cycli en de rotatie. De console opent zodra de schade is vastgelegd.</p>}
    </div>
  );
}

function Copies() {
  return (
    <div className="rv-copies">
      {backupReports.map((report) => (
        <article key={report.id}>
          <h3>{report.title}</h3>
          <p><b>Tijd</b> {report.time}</p>
          <p><b>Verbinding</b> {report.link}</p>
          <p><b>Integriteit</b> {report.integrity}</p>
          <p><b>Toegang</b> {report.access}</p>
          <p><b>Verschil</b> {report.diff}</p>
          <p><b>Controle</b> {report.check}</p>
        </article>
      ))}
    </div>
  );
}

function RestoreView({ ran, opened, onOpen }: { ran: boolean; opened: string[]; onOpen: (id: string) => void }) {
  const [reading, setReading] = useState<string | null>(null);
  const body = reading ? restoredBodies[reading] : "";
  if (!ran) {
    return <p className="sp-quiet">Het herstel start pas als het herstelpunt is bevestigd. De bestanden blijven tot dan vergrendeld.</p>;
  }
  if (reading && body) {
    return (
      <article className="rv-doc">
        <header>
          <button className="btn btn-ghost" type="button" onClick={() => setReading(null)}>Herstelde set</button>
          <span>leesbaar</span>
        </header>
        <pre>{body}</pre>
      </article>
    );
  }
  const items = [
    ["planning", "planning-nexora-day.xlsx"],
    ["contract", "contract-helix.pdf"],
    ["staff", "personeel-nexora.csv"],
    ["finance", "financieel-q1.xlsx"],
    ["agenda", "agenda-nexora-day.ics"],
    ["access", "dok-toegang.log"],
  ] as const;
  return (
    <div className="rv-restored">
      {items.map(([id, name], index) => (
        <button key={id} type="button" style={{ animationDelay: `${index * 180}ms` }} onClick={() => { onOpen(id); setReading(id); }}>
          <strong>{name}</strong>
          <small>{opened.includes(id) ? "gelezen" : "hersteld"}</small>
        </button>
      ))}
    </div>
  );
}

function FileCase({
  damaged,
  setDamaged,
  solved,
  busy,
  onSolve,
}: {
  damaged: string[];
  setDamaged: (value: string[] | ((current: string[]) => string[])) => void;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  function toggle(id: string) {
    setDamaged((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }
  return (
    <aside className="fp-side">
      <p className="kicker">Schade</p>
      <p>Markeer wat niet meer leesbaar is. Een open bestand is nog geen conclusie.</p>
      <div className="sp-picks">
        {vaultFiles.map((file) => (
          <button key={file.id} className={`fp-chip${damaged.includes(file.id) ? " on" : ""}`} type="button" onClick={() => toggle(file.id)}>{file.name}</button>
        ))}
      </div>
      <button className="btn btn-mint" type="button" disabled={busy || solved || damaged.length === 0} onClick={() => onSolve({ files: damaged })}>Schade vastleggen</button>
    </aside>
  );
}

function CycleCase({
  cycle,
  solved,
  busy,
  onSolve,
}: {
  cycle: string;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  return (
    <aside className="fp-side">
      <p className="kicker">Volgende cyclus</p>
      <p>De vier cycli staan in het handboek. Zet de controlewaarde die daarop volgt.</p>
      <p className="rv-word">{cycle || "--"}</p>
      <button className="btn btn-mint" type="button" disabled={busy || solved || !cycle} onClick={() => onSolve({ value: Number(cycle) })}>Controle vastzetten</button>
    </aside>
  );
}

function SealCase({
  shift,
  shape,
  solved,
  busy,
  onSolve,
}: {
  shift: number;
  shape: string;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const word = turn(shift);
  return (
    <aside className="fp-side">
      <p className="kicker">Zegel</p>
      <p>De rotor en het cassettetekken horen bij hetzelfde protocol. Bevestig ze samen.</p>
      <button className="btn btn-mint" type="button" disabled={busy || solved || !shape} onClick={() => onSolve({ word, shape })}>Protocol bevestigen</button>
    </aside>
  );
}

function CopyCase({
  copy,
  setCopy,
  solved,
  busy,
  onSolve,
}: {
  copy: string;
  setCopy: (value: string) => void;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  return (
    <aside className="fp-side">
      <p className="kicker">Kopie</p>
      <p>Een recente kopie is niet vanzelf de veiligste. Vergelijk tijd, verbinding en de toegangslog.</p>
      <div className="sp-picks">
        {backupReports.map((report) => (
          <button key={report.id} className={`fp-chip${copy === report.id ? " on" : ""}`} type="button" onClick={() => setCopy(report.id)}>{report.title}</button>
        ))}
      </div>
      <button className="btn btn-mint" type="button" disabled={busy || solved || !copy} onClick={() => onSolve({ id: copy })}>Deze kopie gebruiken</button>
    </aside>
  );
}

function RestoreCase({
  checkpoint,
  setCheckpoint,
  ran,
  setRan,
  opened,
  pass,
  setPass,
  local,
  setLocal,
  solved,
  busy,
  onSolve,
}: {
  checkpoint: string;
  setCheckpoint: (value: string) => void;
  ran: boolean;
  setRan: (value: boolean) => void;
  opened: string[];
  pass: string;
  setPass: (value: string) => void;
  local: string;
  setLocal: (value: string) => void;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const points = [
    { id: "16", label: "Cyclus 16" },
    { id: "22", label: "Cyclus 22" },
    { id: "23", label: "Cyclus 23" },
  ];
  function start() {
    if (checkpoint !== "22") {
      setLocal("Dit herstelpunt hoort niet bij de controlewaarde die jullie hebben vastgezet.");
      return;
    }
    setLocal("");
    setRan(true);
  }
  const ready = ran && opened.includes("access") && Boolean(pass);
  return (
    <aside className="fp-side">
      <p className="kicker">Terugzetten</p>
      <p>Bevestig het herstelpunt, laat de controle lopen en lees daarna de toegangslog.</p>
      <div className="sp-picks">
        {points.map((item) => (
          <button key={item.id} className={`fp-chip${checkpoint === item.id ? " on" : ""}`} type="button" onClick={() => setCheckpoint(item.id)}>{item.label}</button>
        ))}
      </div>
      {!ran && <button className="btn btn-mint" type="button" disabled={!checkpoint} onClick={start}>Integriteit en herstel</button>}
      {ran && <p>Controle komt overeen met de vastgezette cyclus. De set is leesbaar.</p>}
      {local && <p>{local}</p>}
      {ran && opened.includes("access") && (
        <div className="sp-picks">
          {passes.map((item) => (
            <button key={item.id} className={`fp-chip${pass === item.id ? " on" : ""}`} type="button" onClick={() => setPass(item.id)}>{item.label}</button>
          ))}
        </div>
      )}
      <button className="btn btn-mint" type="button" disabled={busy || solved || !ready} onClick={() => onSolve({ code: pass })}>Spoor vastleggen</button>
    </aside>
  );
}
