"use client";

import { useEffect, useState } from "react";
import { cipherText, puzzleCues, symbolPalette, symbolRows } from "@/lib/game/content";
import {
  backupReports,
  noraRecovery,
  passes,
  restoreNames,
  restoredBodies,
  sections,
  vaultFiles,
  type BackupReport,
  type VaultFile,
} from "@/lib/game/recovery";
import type { Token } from "@/lib/types";
import { RecoveryAwareness } from "./AwarenessBeats";
import { Shape } from "./puzzles/ui";
import "./recovery/desk.css";

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

const restoredItems = [
  ["planning", "planning-nexora-day.xlsx"],
  ["contract", "contract-helix.pdf"],
  ["staff", "personeel-nexora.csv"],
  ["finance", "financieel-q1.xlsx"],
  ["agenda", "agenda-nexora-day.ics"],
  ["access", "dok-toegang.log"],
] as const;

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
  const [openId, setOpenId] = useState<string | null>(vaultFiles[0]?.id ?? null);
  const [intro, setIntro] = useState(false);
  const [damageOpen, setDamageOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [damaged, setDamaged] = useDraft<string[]>("ch4-symbols", []);
  const [cycle, setCycle] = useDraft("ch4-sequence", "");
  const [shift, setShift] = useDraft("ch4-rotor-shift", 0);
  const [shape, setShape] = useDraft("ch4-rotor-shape", "");
  const [copy, setCopy] = useDraft("ch4-backup", "");
  const [compare, setCompare] = useState<string[]>([]);
  const [checkpoint, setCheckpoint] = useDraft("ch4-decode-point", "");
  const [ran, setRan] = useDraft("ch4-decode-ran", false);
  const [opened, setOpened] = useDraft<string[]>("ch4-decode-open", []);
  const [pass, setPass] = useDraft("ch4-decode-pass", "");
  const [local, setLocal] = useState("");
  const [reading, setReading] = useState<string | null>(null);
  const cue = puzzleCues[puzzleId];

  useEffect(() => {
    setSection(preferred);
    setLocal("");
    setDamageOpen(false);
  }, [preferred]);

  useEffect(() => {
    if (!note) return;
    const timer = window.setTimeout(() => setNote(null), 2200);
    return () => window.clearTimeout(timer);
  }, [note]);

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
    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 1600);
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(`eth-m4-${puzzleId}`)) localStorage.removeItem(key);
    }
    return () => window.clearTimeout(timer);
  }, [puzzleId, solved]);

  const open = vaultFiles.find((file) => file.id === openId) ?? null;
  const route = inventory.find((token) => token.id.startsWith("ROUTE"));
  const marking = puzzleId === "ch4-symbols";

  function toggleDamage(id: string) {
    setDamaged((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      setNote(current.includes(id) ? "Markering verwijderd" : "Gemarkeerd als niet leesbaar");
      return next;
    });
  }

  return (
    <div className="m4">
      <div className="m4-top">
        <div className="m4-status">
          <span className="up">VAULT bereikbaar</span>
          <span className="warn">EDGE beperkt</span>
          <span className="up">LOG online</span>
        </div>
        {cue && <p className="m4-cue">{cue.text}</p>}
        {puzzleId === "ch4-symbols" && (
          <details className="m4-nora">
            <summary>NORA</summary>
            <p>{noraRecovery}</p>
          </details>
        )}
      </div>
      {training && onPriority && (
        <RecoveryAwareness priorityDone={priorityDone} priorityText={priorityText} busy={busy} onPriority={onPriority} />
      )}
      <nav className="m4-tabs" aria-label="Herstelconsole">
        {sections.map((item) => (
          <button key={item.id} className={section === item.id ? "on" : ""} type="button" aria-pressed={section === item.id} onClick={() => setSection(item.id)}>
            <TabIcon id={item.id} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="m4-stage">
        {section === "files" && (
          <Files
            open={open}
            damaged={damaged}
            marking={marking}
            note={note}
            onOpen={setOpenId}
            onToggle={toggleDamage}
            damageOpen={damageOpen}
            onDamage={() => setDamageOpen((value) => !value)}
            onRemove={(id) => setDamaged((current) => current.filter((item) => item !== id))}
            solved={solved}
            busy={busy}
            onSolve={() => onSolve({ files: damaged })}
          />
        )}
        {section === "protocol" && (
          <Protocol
            shift={shift}
            setShift={setShift}
            shape={shape}
            setShape={setShape}
            cycle={cycle}
            setCycle={setCycle}
            route={route?.label ?? "route-token"}
            showRotor={puzzleId === "ch4-rotor"}
            showCycle={puzzleId !== "ch4-symbols"}
            canCycle={puzzleId === "ch4-sequence"}
            canSeal={puzzleId === "ch4-rotor"}
            solved={solved}
            busy={busy}
            onCycle={() => onSolve({ value: Number(cycle) })}
            onSeal={() => onSolve({ word: turn(shift), shape })}
          />
        )}
        {section === "copies" && (
          <Copies
            copy={copy}
            compare={compare}
            choosing={puzzleId === "ch4-backup"}
            solved={solved}
            busy={busy}
            onCompare={(id) => setCompare((current) => {
              if (current.includes(id)) return current.filter((item) => item !== id);
              return [...current, id].slice(-2);
            })}
            onChoose={setCopy}
            onSolve={() => onSolve({ id: copy })}
          />
        )}
        {section === "restore" && (
          <RestoreConsole
            active={puzzleId === "ch4-decode"}
            checkpoint={checkpoint}
            setCheckpoint={setCheckpoint}
            ran={ran}
            setRan={setRan}
            opened={opened}
            onOpen={(id) => setOpened((current) => (current.includes(id) ? current : [...current, id]))}
            pass={pass}
            setPass={setPass}
            local={local}
            setLocal={setLocal}
            reading={reading}
            setReading={setReading}
            solved={solved}
            busy={busy}
            onSolve={() => onSolve({ code: pass })}
          />
        )}
        {flash && <div className="m4-flash" role="status">Bevestigd door de herstelconsole.</div>}
        {intro && section === "files" && (
          <div className="m4-intro" aria-hidden="true">
            {restoreNames.slice(0, 5).map((name) => <p key={name}>{name} <b>vergrendeld</b></p>)}
          </div>
        )}
      </div>
    </div>
  );
}

function Files({
  open,
  damaged,
  marking,
  note,
  onOpen,
  onToggle,
  damageOpen,
  onDamage,
  onRemove,
  solved,
  busy,
  onSolve,
}: {
  open: VaultFile | null;
  damaged: string[];
  marking: boolean;
  note: string | null;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
  damageOpen: boolean;
  onDamage: () => void;
  onRemove: (id: string) => void;
  solved: boolean;
  busy: boolean;
  onSolve: () => void;
}) {
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const folders = ["all", ...new Set(vaultFiles.map((file) => file.folder))];
  const visible = vaultFiles.filter((file) => {
    if (folder !== "all" && file.folder !== folder) return false;
    const hay = `${file.name} ${file.folder} ${file.version}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });
  return (
    <div className="m4-files">
      <section className="m4-pane" aria-label="Bestanden">
        <header>
          <h2>Bestandsverkenner</h2>
          {marking && (
            <button className="m4-mini" type="button" aria-expanded={damageOpen} onClick={onDamage}>
              Schade {damaged.length}
            </button>
          )}
        </header>
        <label className="m4-search">
          <input value={query} placeholder="Zoek op naam" onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="m4-filters">
          {folders.map((id) => (
            <button key={id} className={folder === id ? "on" : ""} type="button" onClick={() => setFolder(id)}>
              {id === "all" ? "Alle" : id}
            </button>
          ))}
        </div>
        <div className="m4-list">
          {visible.map((file) => (
            <button key={file.id} className={`m4-file${open?.id === file.id ? " on" : ""}`} type="button" aria-current={open?.id === file.id ? "true" : undefined} onClick={() => onOpen(file.id)}>
              <Glyph name={file.name} locked={!file.readable} />
              <span>
                <b>{file.name}</b>
                <small>{file.version} · {file.modified} · {file.folder}</small>
              </span>
              <span>
                <i className={`m4-badge${file.readable ? " ok" : ""}`}>{file.readable ? "Leesbaar" : "Versleuteld"}</i>
                {damaged.includes(file.id) && <i className="m4-badge pick">Aangewezen</i>}
              </span>
            </button>
          ))}
          {visible.length === 0 && <p className="m4-empty">Geen bestand voor deze zoekopdracht.</p>}
        </div>
      </section>
      <section className="m4-pane" aria-label="Voorbeeld">
        {open ? <Preview file={open} marking={marking} marked={damaged.includes(open.id)} onToggle={() => onToggle(open.id)} /> : <p className="m4-empty">Open een bestand.</p>}
        {note && <p className="m4-note" role="status">{note}</p>}
      </section>
      {marking && damageOpen && (
        <aside className="m4-damage" aria-label="Schadeoverzicht">
          <header>
            <strong>Schadeoverzicht</strong>
            <button type="button" onClick={onDamage}>Sluiten</button>
          </header>
          <p>Markeer wat niet meer leesbaar is. Een open bestand is nog geen conclusie.</p>
          {damaged.length === 0 && <p className="m4-empty">Nog niets aangewezen.</p>}
          {damaged.map((id) => {
            const file = vaultFiles.find((item) => item.id === id);
            return (
              <article key={id}>
                <strong>{file?.name ?? id}</strong>
                <button type="button" onClick={() => onOpen(id)}>Bekijk</button>
                {!solved && <button type="button" onClick={() => onRemove(id)}>Los</button>}
              </article>
            );
          })}
          <button className="m4-go" type="button" disabled={busy || solved || damaged.length === 0} onClick={onSolve}>Schade vastleggen</button>
        </aside>
      )}
    </div>
  );
}

function Preview({ file, marking, marked, onToggle }: { file: VaultFile; marking: boolean; marked: boolean; onToggle: () => void }) {
  const kind = file.name.split(".").pop() ?? "bestand";
  return (
    <div className="m4-preview">
      <header>
        <h2>{file.name}</h2>
        <i className={`m4-badge${file.readable ? " ok" : ""}`}>{file.readable ? "Leesbaar" : "Versleuteld"}</i>
      </header>
      <div className="m4-view">
        {file.readable ? <Readable kind={kind} text={file.preview} /> : <Locked kind={kind} text={file.preview} />}
      </div>
      <div className="m4-meta">
        <span><b>Versie</b>{file.version}</span>
        <span><b>Gewijzigd</b>{file.modified}</span>
        <span><b>Map</b>{file.folder}</span>
        <span><b>Controle</b>{file.check}</span>
      </div>
      {marking && (
        <div className="m4-actions">
          <button className="m4-mark" type="button" onClick={onToggle}>{marked ? "Markering verwijderen" : "Markeer als niet leesbaar"}</button>
        </div>
      )}
    </div>
  );
}

function Locked({ kind, text }: { kind: string; text: string }) {
  return (
    <>
      <div className="m4-lock">
        <LockIcon />
        <span>
          <strong>Bestand is versleuteld</strong>
          <p>Dit bestand kan nu niet worden gelezen. De controle komt niet overeen met een leesbare versie.</p>
        </span>
      </div>
      <Frame kind={kind} text={text} locked />
    </>
  );
}

function Readable({ kind, text }: { kind: string; text: string }) {
  return <Frame kind={kind} text={text} locked={false} />;
}

function Frame({ kind, text, locked }: { kind: string; text: string; locked: boolean }) {
  if (kind === "xlsx") return <Sheet text={text} locked={locked} />;
  if (kind === "csv") return <Table text={text} locked={locked} />;
  if (kind === "ics") return <Calendar text={text} locked={locked} />;
  if (kind === "pdf") return <article className="m4-doc"><p className="kicker">Document</p><pre>{text}</pre></article>;
  return <article className="m4-text"><p className="kicker">Tekstbestand</p><pre>{text}</pre></article>;
}

function Sheet({ text, locked }: { text: string; locked: boolean }) {
  const cells = text.split(/\s+/).filter(Boolean);
  const rows: string[][] = [];
  for (let index = 0; index < cells.length; index += 4) rows.push(cells.slice(index, index + 4));
  return (
    <div className="m4-sheet" aria-hidden={locked ? true : undefined}>
      <div className="m4-cols"><span /><span>A</span><span>B</span><span>C</span><span>D</span></div>
      {rows.map((row, rowIndex) => (
        <div className="m4-row" key={rowIndex}>
          <b>{rowIndex + 1}</b>
          {row.map((cell, index) => <span key={index}>{cell}</span>)}
        </div>
      ))}
    </div>
  );
}

function Table({ text, locked }: { text: string; locked: boolean }) {
  const cells = text.split(/\s+/).filter(Boolean);
  return (
    <div className="m4-sheet table" aria-hidden={locked ? true : undefined}>
      <div className="m4-row head"><b /><span>kolom</span><span>waarde</span></div>
      {cells.map((cell, index) => (
        <div className="m4-row" key={`${cell}-${index}`}><b>{index + 1}</b><span>{locked ? "—" : cell}</span><span>{cell}</span></div>
      ))}
    </div>
  );
}

function Calendar({ text, locked }: { text: string; locked: boolean }) {
  return (
    <div className="m4-cal" aria-hidden={locked ? true : undefined}>
      <strong>Agenda</strong>
      <p>{locked ? "Geen leesbare afspraak" : text}</p>
      {locked && <pre>{text}</pre>}
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
  canCycle,
  canSeal,
  solved,
  busy,
  onCycle,
  onSeal,
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
  canCycle: boolean;
  canSeal: boolean;
  solved: boolean;
  busy: boolean;
  onCycle: () => void;
  onSeal: () => void;
}) {
  const step = ((shift % 26) + 26) % 26;
  function press(key: string) {
    setCycle((current) => (key === "wissen" ? current.slice(0, -1) : (current + key).slice(0, 2)));
  }
  function place(name: string) {
    setShape(name);
  }
  return (
    <div className={`m4-protocol${showRotor ? "" : " solo"}`}>
      <section className="m4-pane">
        <header><h2>Herstelprotocol</h2></header>
        {showCycle && (
          <>
            <p className="m4-cue" style={{ padding: "0 12px" }}>De kluiscycli staan in het herstelhandboek. De volgende controlewaarde vul je zelf in.</p>
            <div className="m4-cycles">
              {[4, 7, 11, 16].map((item, index) => (
                <div key={item} className="m4-cycle"><small>{index + 1}</small>{item}</div>
              ))}
              <div className="m4-cycle next"><small>volgende</small>{cycle || "?"}</div>
            </div>
            {canCycle && (
              <>
                <div className="m4-keys">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "wissen"].map((key) => (
                    <button key={key} type="button" onClick={() => press(key)}>{key}</button>
                  ))}
                </div>
                <div className="m4-actions" style={{ padding: "0 12px 12px" }}>
                  <button className="m4-go" type="button" disabled={busy || solved || !cycle} onClick={onCycle}>Controle vastzetten</button>
                </div>
              </>
            )}
          </>
        )}
        {!showRotor && !showCycle && <p className="m4-empty">Het handboek in de bestanden noemt de cycli en de rotatie. De console opent zodra de schade is vastgelegd.</p>}
        {showRotor && <p className="m4-cue" style={{ padding: "0 12px" }}>Het routetoken ligt in de inventaris: {route}.</p>}
      </section>
      {showRotor && <section className="m4-pane">
        <header><h2>Cassette en rotor</h2></header>
          <>
            <div className="m4-rows">
              {symbolRows.map((row, index) => (
                <div key={index}>
                  {row.map((cell, cellIndex) => (
                    <button
                      key={cellIndex}
                      className={`m4-slot${cell ? "" : " open"}`}
                      type="button"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const name = event.dataTransfer.getData("shape");
                        if (!cell && name) place(name);
                      }}
                      onClick={() => { if (!cell && shape) place(shape); }}
                    >
                      {cell ? <Shape name={cell} /> : shape ? <Shape name={shape} /> : "?"}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="m4-shapes">
              {symbolPalette.map((item) => (
                <button
                  key={item}
                  className={shape === item ? "on" : ""}
                  type="button"
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("shape", item)}
                  onClick={() => place(item)}
                >
                  <Shape name={item} /> {shapeName[item]}
                </button>
              ))}
            </div>
            <div className="m4-rotor">
              <button type="button" onClick={() => setShift((value) => value - 1)} aria-label="Rotor terug">−</button>
              <strong>{String(step).padStart(2, "0")}</strong>
              <button type="button" onClick={() => setShift((value) => value + 1)} aria-label="Rotor vooruit">+</button>
            </div>
            <p className="m4-word">{cipherText} → {turn(shift)}</p>
            {canSeal && (
              <div className="m4-actions" style={{ padding: "0 12px 12px" }}>
                <button className="m4-go" type="button" disabled={busy || solved || !shape} onClick={onSeal}>Protocol bevestigen</button>
              </div>
            )}
          </>
      </section>}
    </div>
  );
}

function Copies({
  copy,
  compare,
  choosing,
  solved,
  busy,
  onCompare,
  onChoose,
  onSolve,
}: {
  copy: string;
  compare: string[];
  choosing: boolean;
  solved: boolean;
  busy: boolean;
  onCompare: (id: string) => void;
  onChoose: (id: string) => void;
  onSolve: () => void;
}) {
  const reports = compare.map((id) => backupReports.find((item) => item.id === id)).filter((item): item is BackupReport => Boolean(item));
  return (
    <div className="m4-copies">
      <section className="m4-pane" aria-label="Back-ups">
        <header><h2>Beschikbare kopieën</h2></header>
        <div className="m4-list">
          {backupReports.map((report) => (
            <button key={report.id} className={`m4-snap${compare.includes(report.id) || copy === report.id ? " on" : ""}`} type="button" onClick={() => onCompare(report.id)}>
              <b>{report.title}</b>
              <small>{report.time}</small>
              <small>{report.check}</small>
              {copy === report.id && <i className="m4-badge pick">Gekozen</i>}
            </button>
          ))}
        </div>
      </section>
      <section className="m4-pane">
        <div className={`m4-detail${reports.length > 1 ? " m4-split" : ""}`}>
          {reports.length === 0 && <p className="m4-empty">Tik een kopie om haar te openen. Tik een tweede om ze naast elkaar te zetten.</p>}
          {reports.map((report) => (
            <article key={report.id} className="m4-card">
              <h2>{report.title}</h2>
              <p><b>Tijd</b> {report.time}</p>
              <p><b>Verbinding</b> {report.link}</p>
              <p><b>Integriteit</b> {report.integrity}</p>
              <p><b>Toegang</b> {report.access}</p>
              <p><b>Verschil</b> {report.diff}</p>
              <p><b>Controle</b> {report.check}</p>
              {choosing && (
                <button className={`m4-mini${copy === report.id ? " on" : ""}`} type="button" onClick={() => onChoose(report.id)}>
                  {copy === report.id ? "Deze kopie is gekozen" : "Kies deze kopie"}
                </button>
              )}
            </article>
          ))}
          {choosing && <button className="m4-go" type="button" disabled={busy || solved || !copy} onClick={onSolve}>Deze kopie gebruiken</button>}
        </div>
      </section>
    </div>
  );
}

function RestoreConsole({
  active,
  checkpoint,
  setCheckpoint,
  ran,
  setRan,
  opened,
  onOpen,
  pass,
  setPass,
  local,
  setLocal,
  reading,
  setReading,
  solved,
  busy,
  onSolve,
}: {
  active: boolean;
  checkpoint: string;
  setCheckpoint: (value: string) => void;
  ran: boolean;
  setRan: (value: boolean) => void;
  opened: string[];
  onOpen: (id: string) => void;
  pass: string;
  setPass: (value: string) => void;
  local: string;
  setLocal: (value: string) => void;
  reading: string | null;
  setReading: (value: string | null) => void;
  solved: boolean;
  busy: boolean;
  onSolve: () => void;
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
  const body = reading ? restoredBodies[reading] : "";
  const steps = [
    { n: "1", title: "Herstelpunt", detail: checkpoint ? points.find((item) => item.id === checkpoint)?.label ?? checkpoint : "Nog niet gekozen", state: checkpoint ? "done" : "now" },
    { n: "2", title: "Integriteit", detail: ran ? "Controle komt overeen met de vastgezette cyclus" : "Wacht op bevestiging", state: ran ? "done" : checkpoint ? "now" : "wait" },
    { n: "3", title: "Bestanden lezen", detail: opened.includes("access") ? "Toegangslog gelezen" : ran ? "Open de herstelde set" : "Nog vergrendeld", state: opened.includes("access") ? "done" : ran ? "now" : "wait" },
    { n: "4", title: "Pas uit het log", detail: pass || "Nog niet gekozen", state: pass ? "done" : opened.includes("access") ? "now" : "wait" },
  ];
  return (
    <div className="m4-restore">
      <section className="m4-pane">
        <header><h2>Herstelconsole</h2></header>
        <div className="m4-steps">
          {steps.map((step) => (
            <article key={step.n} className={`m4-step ${step.state}`}>
              <i>{step.n}</i>
              <span>
                <strong>{step.title}</strong>
                <small>{step.detail}</small>
              </span>
            </article>
          ))}
          {active && (
            <>
              <div className="m4-picks">
                {points.map((item) => (
                  <button key={item.id} className={checkpoint === item.id ? "on" : ""} type="button" onClick={() => setCheckpoint(item.id)}>{item.label}</button>
                ))}
              </div>
              {!ran && <button className="m4-go" type="button" disabled={!checkpoint} onClick={start}>Integriteit en herstel</button>}
              {local && <p className="m4-note" role="status">{local}</p>}
              {ran && body && (
                <article className="m4-text">
                  <button className="m4-mini" type="button" onClick={() => setReading(null)}>Herstelde set</button>
                  <pre>{body}</pre>
                </article>
              )}
              {ran && !body && (
                <div className="m4-log">
                  {restoredItems.map(([id, name]) => (
                    <button key={id} type="button" onClick={() => { onOpen(id); setReading(id); }}>
                      {name} · {opened.includes(id) ? "gelezen" : "hersteld"}
                    </button>
                  ))}
                </div>
              )}
              {ran && opened.includes("access") && (
                <>
                  <div className="m4-picks">
                    {passes.map((item) => (
                      <button key={item.id} className={pass === item.id ? "on" : ""} type="button" onClick={() => setPass(item.id)}>{item.label}</button>
                    ))}
                  </div>
                  <button className="m4-go" type="button" disabled={busy || solved || !ready} onClick={onSolve}>Spoor vastleggen</button>
                </>
              )}
            </>
          )}
          {!active && <p className="m4-empty">Het herstel start pas als het herstelpunt is bevestigd. De bestanden blijven tot dan vergrendeld.</p>}
        </div>
      </section>
      <aside className="m4-pane">
        <header><h2>Systeemstatus</h2></header>
        <div className="m4-side">
          <div className={`m4-stat ${ran ? "good" : "bad"}`}><span>Bestanden</span><em>{ran ? "Set leesbaar" : "Vergrendeld"}</em></div>
          <div className="m4-stat wait"><span>EDGE</span><em>Beperkt</em></div>
          <div className="m4-stat good"><span>LOG</span><em>Online</em></div>
          <div className={`m4-stat ${solved ? "good" : "wait"}`}><span>Bevestiging</span><em>{solved ? "Server bevestigd" : "Wacht op controle"}</em></div>
          {ran && <p>De controle is lokaal gestart. Het spoor telt pas nadat de console het bevestigt.</p>}
        </div>
      </aside>
    </div>
  );
}

function TabIcon({ id }: { id: string }) {
  if (id === "protocol") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7h8M8 12h8M8 17h5" /></svg>;
  if (id === "copies") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v12H7z" /><path d="M9 7V5h10v12h-2" /></svg>;
  if (id === "restore") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v4M8 9h8l-1 10H9z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h8l4 4v12H6z" /></svg>;
}

function Glyph({ name, locked }: { name: string; locked: boolean }) {
  const ext = (name.split(".").pop() ?? "").slice(0, 4).toUpperCase();
  return <span className={`m4-ico${locked ? " lock" : " ok"}`}>{ext}</span>;
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
