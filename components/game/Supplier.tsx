"use client";

import { useEffect, useState } from "react";
import { asSector } from "@/lib/game/sector";
import { useSector } from "./SectorSkin";
import {
  accessLog,
  contract,
  exportLog,
  fakePlan,
  fileMeta,
  jobs,
  mails,
  marks,
  nightCards,
  noraSupplier,
  realMeta,
  realPlan,
  sections,
  supports,
  traceSupports,
} from "@/lib/game/supplier";
import { puzzleCues } from "@/lib/game/content";

function useDraft<T>(id: string, initial: T) {
  const key = `eth-m2-${id}`;
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

export function SupplierDesk({
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
  const sector = useSector();
  const preferred = puzzleId === "ch2-meta" ? "file" : puzzleId === "ch2-timeline" ? "time" : puzzleId === "ch2-trace" ? "log" : "mail";
  const [section, setSection] = useState(preferred);
  const [openId, setOpenId] = useState<string>("prior");
  const [headers, setHeaders] = useState(false);
  const [query, setQuery] = useState("");
  const [lane, setLane] = useState<"all" | "intern" | "extern">("all");
  const [fileTab, setFileTab] = useState<"meta" | "body" | "compare" | "scan">("compare");
  const [dossier, setDossier] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [seen, setSeen] = useDraft<string[]>("ch2-seen", []);
  const [suspect, setSuspect] = useDraft("ch2-acrostic-mail", "");
  const [evidence, setEvidence] = useDraft<string[]>("ch2-acrostic-evidence", []);
  const open = mails.find((mail) => mail.id === openId) ?? null;
  const investigating = puzzleId === "ch2-acrostic";
  const cue = puzzleCues[puzzleId];

  useEffect(() => {
    setSection(preferred);
    setDossier(false);
    setInspect(false);
  }, [preferred]);
  useEffect(() => {
    if (!note) return;
    const timer = window.setTimeout(() => setNote(null), 2200);
    return () => window.clearTimeout(timer);
  }, [note]);
  useEffect(() => {
    if (!solved) return;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(`eth-m2-${puzzleId}`)) localStorage.removeItem(key);
    }
  }, [puzzleId, solved]);

  function selectMail(id: string) {
    setOpenId(id);
    setHeaders(false);
    setInspect(false);
    setSection("mail");
    setSeen((current) => (current.includes(id) ? current : [...current, id]));
  }

  function addEvidence(id: string) {
    setEvidence((current) => (current.includes(id) ? current : [...current, id]));
    const label = supports.find((item) => item.id === id)?.label ?? "Bewijs";
    setNote(`Vastgelegd: ${label}`);
    setInspect(false);
  }

  function showEvidence(id: string) {
    if (id.startsWith("mail:")) selectMail(id.slice(5));
    if (id === "contract") setSection("dossier");
    if (id === "prior") selectMail("prior");
    if (id === "header") {
      if (suspect) selectMail(suspect);
      setHeaders(true);
    }
    if (id === "logo" && suspect) selectMail(suspect);
    setDossier(false);
  }

  const visible = mails.filter((mail) => {
    const kind = mailKind(mail.from);
    if (lane !== "all" && kind !== lane) return false;
    const hay = `${mail.subject} ${mail.from} ${mail.body} ${senderName(mail.from)}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  return (
    <div className={`sp sp-app${puzzleId === "ch2-timeline" ? " sp-time" : ""}`}>
      <div className="sp-bar">
      <nav className="sp-tabs" aria-label="Bronnen">
        {sections.map((item) => (
          <button key={item.id} className={section === item.id ? "on" : ""} type="button" aria-pressed={section === item.id} onClick={() => setSection(item.id)}>
            <TabIcon id={item.id} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <button className="sp-open-case" type="button" aria-expanded={dossier} onClick={() => setDossier((value) => !value)}>
        Onderzoeksdossier
        {investigating && <b>{evidence.length}</b>}
      </button>
      </div>
      <div className={`sp-body${section === "mail" ? "" : " wide"}${section === "time" ? " time" : ""}`}>
        {section === "mail" && (
          <section className="sp-inbox" aria-label="E-mails">
            <header>
              <strong>E-mails</strong>
              <span>{visible.length}</span>
            </header>
            <label className="sp-search">
              <SearchIcon />
              <input value={query} placeholder="Zoek in e-mails..." onChange={(event) => setQuery(event.target.value)} />
            </label>
            <div className="sp-filters">
              {(["all", "intern", "extern"] as const).map((id) => (
                <button key={id} className={lane === id ? "on" : ""} type="button" onClick={() => setLane(id)}>
                  {id === "all" ? "Alle" : id === "intern" ? "Intern" : "Extern"} ({mails.filter((mail) => id === "all" || mailKind(mail.from) === id).length})
                </button>
              ))}
            </div>
            <div className="sp-list">
              {visible.map((mail) => (
                <button key={mail.id} className={`sp-mail${openId === mail.id ? " on" : ""}`} type="button" aria-current={openId === mail.id ? "true" : undefined} onClick={() => selectMail(mail.id)}>
                  <span className={`sp-ava${mail.from.includes("helix") ? " helix" : ""}`} aria-hidden="true">{initials(senderName(mail.from))}</span>
                  <span>
                    <b>{senderName(mail.from)}</b>
                    <small>{asSector(sector, mail.subject)}</small>
                    <em>{mail.from}</em>
                  </span>
                  <span className="sp-when">
                    <small>{shortWhen(mail.when)}</small>
                    <i className={`sp-badge${mailKind(mail.from) === "intern" ? " intern" : ""}`}>{mailKind(mail.from) === "intern" ? "Intern" : "Extern"}</i>
                    <i className="sp-state">{suspect === mail.id ? "Aangewezen" : seen.includes(mail.id) ? "Bekeken" : "Nieuw"}</i>
                  </span>
                </button>
              ))}
              {visible.length === 0 && <p className="sp-quiet">Geen berichten voor deze zoekopdracht.</p>}
            </div>
          </section>
        )}
        <section className="sp-read" aria-label="Bron">
          {puzzleId === "ch2-acrostic" && section === "mail" && (
            <details className="sp-nora">
              <summary>NORA</summary>
              <p>{noraSupplier}</p>
            </details>
          )}
          {section === "mail" && open && (
            <Letter
              mail={open}
              headers={headers}
              inspect={inspect && investigating}
              noted={suspect === open.id}
              saved={evidence}
              onHeaders={() => setHeaders((value) => !value)}
              onFile={() => { setSection("file"); setFileTab("compare"); }}
              onInspect={() => setInspect((value) => !value)}
              onPoint={() => { setSuspect(open.id); setNote(`Aangewezen: ${open.subject}`); setInspect(false); }}
              onAdd={addEvidence}
              showInspect={investigating}
            />
          )}
          {note && section === "mail" && <p className="sp-note" role="status">{note}</p>}
          {section === "dossier" && (
            <article className="sp-contract">
              <img src="/m2/port.jpg" alt="" />
              <p className="kicker">Leveranciersdossier</p>
              <h2>{asSector(sector, contract.party)}</h2>
              <p>{asSector(sector, contract.work)}</p>
              <p>Contract {contract.ref}</p>
              <p className="sp-addr">{contract.contact}</p>
              <p>{contract.note}</p>
              {investigating && (
                <button className="btn" type="button" onClick={() => addEvidence("contract")}>
                  {evidence.includes("contract") ? "Adres staat in het dossier" : "Adres op het contract vastleggen"}
                </button>
              )}
            </article>
          )}
          {section === "file" && <FileView tab={fileTab} onTab={setFileTab} />}
          {section === "log" && (
            <article className="sp-log">
              <p className="kicker">Nachtregistratie</p>
              <h2>Nachtlog</h2>
              <p>Vastgelegd tussen 02:00 en 03:00, vóór de aanval die jullie vandaag op kantoor zagen. KADE zette dit op terwijl het gebouw sliep.</p>
              <h3>Toegang</h3>
              <pre>{accessLog.join("\n")}</pre>
              <h3>Export</h3>
              <pre>{exportLog.join("\n")}</pre>
            </article>
          )}
          {section === "time" && (
            <article className="sp-log">
              <p className="kicker">Tijdlijn</p>
              <h2>De nacht op volgorde</h2>
              <p className="sp-quiet">De kaarten noemen geen tijdstip. De klok staat in de nachtlog, vastgelegd vóór de aanval van vandaag.</p>
            </article>
          )}
        </section>
      </div>
      <div className="sp-drawer" hidden={!dossier}>
        <header>
          <strong>Onderzoeksdossier</strong>
          <button type="button" onClick={() => setDossier(false)}>Sluiten</button>
        </header>
        {investigating ? (
          <MailDossier
            suspect={suspect}
            evidence={evidence}
            cue={cue?.text}
            solved={solved}
            busy={busy}
            onView={showEvidence}
            onRemove={(id) => setEvidence((current) => current.filter((item) => item !== id))}
            onClearSuspect={() => setSuspect("")}
            onSolve={() => onSolve({ mail: suspect, evidence })}
          />
        ) : (
          <Case puzzleId={puzzleId} cue={cue?.text} solved={solved} busy={busy} onSolve={onSolve} />
        )}
      </div>
    </div>
  );
}

function Letter({
  mail,
  headers,
  inspect,
  noted,
  saved,
  showInspect,
  onHeaders,
  onFile,
  onInspect,
  onPoint,
  onAdd,
}: {
  mail: (typeof mails)[number];
  headers: boolean;
  inspect: boolean;
  noted: boolean;
  saved: string[];
  showInspect: boolean;
  onHeaders: () => void;
  onFile: () => void;
  onInspect: () => void;
  onPoint: () => void;
  onAdd: (id: string) => void;
}) {
  const sector = useSector();
  const helixMail = mail.from.endsWith("@helix-events.nl");
  const signed = mail.body.includes("Helix");
  return (
    <div className="sp-letter">
      <div className="sp-who">
        <span className={`sp-ava${mail.from.includes("helix") ? " helix" : ""}`} aria-hidden="true">{initials(senderName(mail.from))}</span>
        <div>
          <p><b>Van</b> {senderName(mail.from)} <span className="sp-addr">&lt;{mail.from}&gt;</span></p>
          <p><b>Aan</b> <span className="sp-addr">{asSector(sector, mail.to)}</span></p>
        </div>
        <div className="sp-meta">
          <span>{mail.when}</span>
          <i className={`sp-badge${mailKind(mail.from) === "intern" ? " intern" : ""}`}>{mailKind(mail.from) === "intern" ? "Intern" : "Extern"}</i>
        </div>
      </div>
      <h2>{asSector(sector, mail.subject)}</h2>
      <p className="sp-copy">{asSector(sector, mail.body)}</p>
      <div className="sp-actions">
        <button className="sp-headbtn" type="button" aria-expanded={headers} onClick={onHeaders}>{headers ? "Bericht" : "Headers bekijken"}</button>
        {showInspect && (
          <button className="sp-headbtn" type="button" aria-expanded={inspect} onClick={onInspect}>Bewijs onderzoeken</button>
        )}
      </div>
      {inspect && (
        <div className="sp-inspect" role="group" aria-label="Bewijs vastleggen">
          <button type="button" onClick={onPoint}>{noted ? "Dit bericht is aangewezen" : "Dit bericht aanwijzen"}</button>
          {headers && <button type="button" onClick={() => onAdd("header")}>{saved.includes("header") ? "Headers staan in het dossier" : "Headers vastleggen"}</button>}
          {helixMail && <button type="button" onClick={() => onAdd("prior")}>{saved.includes("prior") ? "Eerder bericht staat in het dossier" : "Eerder bericht van Helix vastleggen"}</button>}
          {signed && <button type="button" onClick={() => onAdd("logo")}>{saved.includes("logo") ? "Ondertekening staat in het dossier" : "Naam Helix in de ondertekening vastleggen"}</button>}
        </div>
      )}
      {headers && (
        <dl className="sp-headers">
          {mail.headers.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {mail.file && (
        <div className="sp-files">
          <p>Bijlage</p>
          <article className="sp-filecard">
            <span className="sp-fileico">XLS</span>
            <div>
              <strong>{mail.file}</strong>
              <small>Alleen lezen · niet uitgevoerd</small>
            </div>
            <button className="btn" type="button" onClick={onFile}>Bekijken</button>
          </article>
        </div>
      )}
    </div>
  );
}

function senderName(from: string) {
  const known: Record<string, string> = {
    "events@helix-events.nl": "Helix Events",
    "mara.de.vries@nexora.internal": "Mara de Vries",
    "s.adler@helix-events.nl": "S. Adler",
    "planning@helix-event.co": "Planning",
    "facilitair@nexora.internal": "Facilitair",
    "finance@nexora.internal": "Finance",
    "l.crowe@nexora.internal": "L. Crowe",
    "m.okonkwo@nexora.internal": "M. Okonkwo",
    "planning@noordlicht-catering.nl": "Noordlicht",
  };
  return known[from] ?? from;
}

function mailKind(from: string) {
  return from.endsWith("@nexora.internal") ? "intern" : "extern";
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return name.slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function shortWhen(when: string) {
  const clock = when.match(/\d{1,2}:\d{2}/);
  const day = when.split(",")[0];
  return clock ? `${day.replace(/^[a-z]{2}\s/i, "")} ${clock[0]}` : when;
}

function TabIcon({ id }: { id: string }) {
  if (id === "dossier") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h6l2 2h10v10H3z" /></svg>;
  if (id === "file") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8l5 5-5 5" /><path d="M15 8v10" /><path d="M4 12h3" /></svg>;
  if (id === "log") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a7 7 0 1 0 7 7" /><path d="M12 7v5l3 2" /></svg>;
  if (id === "time") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h7" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v11H4z" /><path d="M4 7l8 6 8-6" /></svg>;
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></svg>;
}

function FileView({ tab, onTab }: { tab: "meta" | "body" | "compare" | "scan"; onTab: (tab: "meta" | "body" | "compare" | "scan") => void }) {
  const sector = useSector();
  return (
    <article className="sp-fileview">
      <header>
        <strong>planning-nexora-day.xlsx</strong>
        <span>alleen lezen · niet uitgevoerd</span>
      </header>
      <div className="sp-subnav">
        {([["meta", "Metadata"], ["body", "Inhoud"], ["compare", "Vergelijking"], ["scan", "Scan"]] as const).map(([id, label]) => (
          <button key={id} className={tab === id ? "on" : ""} type="button" onClick={() => onTab(id)}>{label}</button>
        ))}
      </div>
      {tab === "meta" && (
        <div className="sp-split">
          <dl>
            <dt>Nieuw bestand</dt>
            <dd>{fileMeta.name}</dd>
            <dd>gemaakt {fileMeta.created}</dd>
            <dd>gewijzigd {fileMeta.modified}</dd>
            <dd>{fileMeta.author}</dd>
            <dd>{asSector(sector, fileMeta.tool)}</dd>
          </dl>
          <dl>
            <dt>Eerdere planning</dt>
            <dd>{realMeta.name}</dd>
            <dd>gemaakt {realMeta.created}</dd>
            <dd>gewijzigd {realMeta.modified}</dd>
            <dd>{realMeta.author}</dd>
            <dd>{asSector(sector, realMeta.tool)}</dd>
          </dl>
        </div>
      )}
      {tab === "body" && (
        <ol>{fakePlan.map((line) => <li key={line}>{asSector(sector, line)}</li>)}</ol>
      )}
      {tab === "compare" && (
        <div className="sp-split">
          <div>
            <p>v3, eerder ontvangen</p>
            <ol>{realPlan.map((line) => <li key={line}>{asSector(sector, line)}</li>)}</ol>
          </div>
          <div>
            <p>xlsx uit de nacht</p>
            <ol>{fakePlan.map((line) => <li key={line}>{asSector(sector, line)}</li>)}</ol>
          </div>
        </div>
      )}
      {tab === "scan" && (
        <p>Deze weergave voert het bestand niet uit. Er is geen actieve lading gevonden. Het document bevat een instructie die in de vorige planning niet stond.</p>
      )}
    </article>
  );
}

function Case({
  puzzleId,
  cue,
  solved,
  busy,
  onSolve,
}: {
  puzzleId: string;
  cue?: string;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  if (puzzleId === "ch2-acrostic") return null;
  if (puzzleId === "ch2-meta") return <FileCase cue={cue} solved={solved} busy={busy} onSolve={onSolve} />;
  if (puzzleId === "ch2-timeline") return <TimeCase cue={cue} solved={solved} busy={busy} onSolve={onSolve} />;
  return <TraceCase cue={cue} solved={solved} busy={busy} onSolve={onSolve} />;
}

function Invest({ kicker, cue }: { kicker: string; cue?: string }) {
  return (
    <header className="sp-invest">
      <p className="kicker">Nu doen · {kicker}</p>
      {cue ? <p>{cue}</p> : null}
    </header>
  );
}

function MailDossier({
  suspect,
  evidence,
  cue,
  solved,
  busy,
  onView,
  onRemove,
  onClearSuspect,
  onSolve,
}: {
  suspect: string;
  evidence: string[];
  cue?: string;
  solved: boolean;
  busy: boolean;
  onView: (id: string) => void;
  onRemove: (id: string) => void;
  onClearSuspect: () => void;
  onSolve: () => void;
}) {
  const message = mails.find((item) => item.id === suspect);
  const ready = Boolean(suspect) && evidence.length >= 2;
  return (
    <div className="sp-case">
      <Invest kicker="Onderzoek" cue={cue} />
      <div className="sp-ask">
        <p className="sp-q">Aangewezen bericht</p>
        {message ? (
          <article className="sp-filed">
            <span>
              <small>{senderName(message.from)}</small>
              <strong>{message.subject}</strong>
            </span>
            <button type="button" onClick={() => onView(`mail:${message.id}`)}>Bekijk</button>
            {!solved && <button type="button" onClick={onClearSuspect}>Los</button>}
          </article>
        ) : (
          <p className="sp-quiet">Nog geen bericht aangewezen. Wijs er een aan vanuit de post.</p>
        )}
        <p className="sp-q">Bewijsbronnen · {evidence.length} vastgelegd, minstens 2</p>
        {evidence.length === 0 && <p className="sp-quiet">Nog niets vastgelegd. Onderzoek een bericht, de headers of het contract.</p>}
        {evidence.map((id) => {
          const item = supports.find((row) => row.id === id);
          return (
            <article key={id} className="sp-filed">
              <strong>{item?.label ?? id}</strong>
              <button type="button" onClick={() => onView(id)}>Bekijk</button>
              {!solved && <button type="button" onClick={() => onRemove(id)}>Los</button>}
            </article>
          );
        })}
      </div>
      <button className="btn sp-go" type="button" disabled={busy || solved || !ready} onClick={onSolve}>
        Conclusie vastleggen
      </button>
    </div>
  );
}

function FileCase({ cue, solved, busy, onSolve }: { cue?: string; solved: boolean; busy: boolean; onSolve: (payload: unknown) => void }) {
  const [picked, setPicked] = useDraft<string[]>("ch2-meta", []);
  function toggle(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }
  return (
    <div className="sp-case">
      <Invest kicker="Verschil" cue={cue} />
      <div className="sp-ask">
        <p className="sp-q">Wat maakte dit bestand een risico?</p>
        <div className="sp-picks">
          {marks.map((item) => (
            <button key={item.id} className={`fp-chip${picked.includes(item.id) ? " on" : ""}`} type="button" onClick={() => toggle(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <button className="btn sp-go" type="button" disabled={busy || solved || picked.length === 0} onClick={() => onSolve({ marks: picked })}>
        Verschillen vastleggen
      </button>
    </div>
  );
}

function TimeCase({ cue, solved, busy, onSolve }: { cue?: string; solved: boolean; busy: boolean; onSolve: (payload: unknown) => void }) {
  const [order, setOrder] = useDraft<string[]>("ch2-timeline", []);
  const [picked, setPicked] = useState<string | null>(null);
  function place(index: number) {
    if (!picked) return;
    setOrder((current) => {
      const next = [current[0] ?? "", current[1] ?? "", current[2] ?? ""];
      for (let slot = 0; slot < 3; slot += 1) if (next[slot] === picked) next[slot] = "";
      next[index] = picked;
      return next;
    });
    setPicked(null);
  }
  const filled = [0, 1, 2].every((index) => Boolean(order[index]));
  return (
    <div className="sp-case">
      <Invest kicker="Keten" cue={cue} />
      <div className="sp-ask">
      <div className="sp-picks">
        {nightCards.map((card) => (
          <button key={card.id} className={`fp-chip${picked === card.id ? " on" : ""}${order.includes(card.id) ? " used" : ""}`} type="button" onClick={() => setPicked(card.id)}>
            {card.label}
          </button>
        ))}
      </div>
      {[0, 1, 2].map((index) => {
        const card = nightCards.find((item) => item.id === order[index]);
        return (
          <button key={index} className={`fp-slot${card ? " filled" : ""}`} type="button" onClick={() => place(index)}>
            <small>{index + 1}</small>
            <strong>{card?.label ?? (picked ? "plaatsen" : "—")}</strong>
          </button>
        );
      })}
      </div>
      <button className="btn btn-ghost" type="button" onClick={() => setOrder([])}>Leegmaken</button>
      <button className="btn sp-go" type="button" disabled={busy || solved || !filled} onClick={() => onSolve({ order: order.slice(0, 3) })}>
        Keten vastleggen
      </button>
    </div>
  );
}

function TraceCase({ cue, solved, busy, onSolve }: { cue?: string; solved: boolean; busy: boolean; onSolve: (payload: unknown) => void }) {
  const [job, setJob] = useDraft("ch2-trace-job", "");
  const [supportsPicked, setSupports] = useDraft<string[]>("ch2-trace-supports", []);
  function toggle(id: string) {
    setSupports((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }
  const ready = Boolean(job) && supportsPicked.length >= 2;
  return (
    <div className="sp-case">
      <Invest kicker="Spoor" cue={cue} />
      <div className="sp-ask">
        <p className="sp-q">Welke job verliet het dok?</p>
        <div className="sp-picks">
          {jobs.map((item) => (
            <button key={item.id} className={`fp-chip${job === item.id ? " on" : ""}`} type="button" onClick={() => setJob(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <p className="sp-q">Waar zie je dat terug?</p>
        <div className="sp-picks">
          {traceSupports.map((item) => (
            <button key={item.id} className={`fp-chip${supportsPicked.includes(item.id) ? " on" : ""}`} type="button" onClick={() => toggle(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <button className="btn sp-go" type="button" disabled={busy || solved || !ready} onClick={() => onSolve({ job, supports: supportsPicked })}>
        Spoor bevestigen
      </button>
    </div>
  );
}
