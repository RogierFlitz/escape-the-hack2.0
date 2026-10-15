"use client";

import { useEffect, useState } from "react";
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
  const preferred = puzzleId === "ch2-meta" ? "file" : puzzleId === "ch2-timeline" ? "time" : puzzleId === "ch2-trace" ? "log" : "mail";
  const [section, setSection] = useState(preferred);
  const [openId, setOpenId] = useState<string | null>(null);
  const [headers, setHeaders] = useState(false);
  const [fileTab, setFileTab] = useState<"meta" | "body" | "compare" | "scan">("compare");
  const open = mails.find((mail) => mail.id === openId) ?? null;

  useEffect(() => {
    setSection(preferred);
  }, [preferred]);
  useEffect(() => {
    if (!solved) return;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(`eth-m2-${puzzleId}`)) localStorage.removeItem(key);
    }
  }, [puzzleId, solved]);

  return (
    <div className={`sp${puzzleId === "ch2-timeline" ? " sp-time" : ""}`}>
      <div className="sp-main">
        {puzzleId === "ch2-acrostic" && !open && <p className="fp-nora">{noraSupplier}</p>}
        <div className="sp-nav">
          {sections.map((item) => (
            <button key={item.id} className={section === item.id ? "on" : ""} type="button" onClick={() => setSection(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        {section === "mail" && (
          open ? (
            <article className="sp-letter">
              <header>
                <button className="btn btn-ghost" type="button" onClick={() => { setOpenId(null); setHeaders(false); }}>Postkamer</button>
                <span>{open.when}</span>
              </header>
              <h2>{open.subject}</h2>
              <p><b>Van</b> {open.from}</p>
              <p><b>Aan</b> {open.to}</p>
              {open.file && <p className="sp-file">{open.file}</p>}
              <p>{open.body}</p>
              <button className="btn" type="button" onClick={() => setHeaders((value) => !value)}>{headers ? "Bericht" : "Headers"}</button>
              {headers && (
                <dl className="sp-headers">
                  {open.headers.map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </article>
          ) : (
            <div className="sp-list">
              {mails.map((mail) => (
                <button key={mail.id} className="sp-row" type="button" onClick={() => { setOpenId(mail.id); setHeaders(false); }}>
                  <strong>{mail.subject}</strong>
                  <span>{mail.from}</span>
                  <small>{mail.when}</small>
                </button>
              ))}
            </div>
          )
        )}
        {section === "dossier" && (
          <article className="sp-contract">
            <p className="kicker">Leveranciersdossier</p>
            <h2>{contract.party}</h2>
            <p>{contract.work}</p>
            <p>Contract {contract.ref}</p>
            <p className="sp-address">{contract.contact}</p>
            <p>{contract.note}</p>
          </article>
        )}
        {section === "file" && <FileView tab={fileTab} onTab={setFileTab} />}
        {section === "log" && (
          <article className="sp-log">
            <p className="kicker">Nachtregistratie</p>
            <p>Vastgelegd tussen 02:00 en 03:00, vóór de aanval die jullie vandaag op kantoor zagen. KADE zette dit op terwijl het gebouw sliep.</p>
            <h3>Toegang</h3>
            <pre>{accessLog.join("\n")}</pre>
            <h3>Export</h3>
            <pre>{exportLog.join("\n")}</pre>
          </article>
        )}
        {section === "time" && <p className="sp-quiet">De kaarten noemen geen tijdstip. De klok staat in de nachtlog, vastgelegd vóór de aanval van vandaag.</p>}
      </div>
      <Case puzzleId={puzzleId} solved={solved} busy={busy} onSolve={onSolve} />
    </div>
  );
}

function FileView({ tab, onTab }: { tab: "meta" | "body" | "compare" | "scan"; onTab: (tab: "meta" | "body" | "compare" | "scan") => void }) {
  return (
    <article className="sp-fileview">
      <header>
        <strong>planning-nexora-day.xlsx</strong>
        <span>alleen lezen · niet uitgevoerd</span>
      </header>
      <div className="sp-nav">
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
            <dd>{fileMeta.tool}</dd>
          </dl>
          <dl>
            <dt>Eerdere planning</dt>
            <dd>{realMeta.name}</dd>
            <dd>gemaakt {realMeta.created}</dd>
            <dd>gewijzigd {realMeta.modified}</dd>
            <dd>{realMeta.author}</dd>
            <dd>{realMeta.tool}</dd>
          </dl>
        </div>
      )}
      {tab === "body" && (
        <ol>{fakePlan.map((line) => <li key={line}>{line}</li>)}</ol>
      )}
      {tab === "compare" && (
        <div className="sp-split">
          <div>
            <p>v3, eerder ontvangen</p>
            <ol>{realPlan.map((line) => <li key={line}>{line}</li>)}</ol>
          </div>
          <div>
            <p>xlsx uit de nacht</p>
            <ol>{fakePlan.map((line) => <li key={line}>{line}</li>)}</ol>
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
  solved,
  busy,
  onSolve,
}: {
  puzzleId: string;
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  if (puzzleId === "ch2-acrostic") return <MailCase solved={solved} busy={busy} onSolve={onSolve} />;
  if (puzzleId === "ch2-meta") return <FileCase solved={solved} busy={busy} onSolve={onSolve} />;
  if (puzzleId === "ch2-timeline") return <TimeCase solved={solved} busy={busy} onSolve={onSolve} />;
  return <TraceCase solved={solved} busy={busy} onSolve={onSolve} />;
}

function MailCase({ solved, busy, onSolve }: { solved: boolean; busy: boolean; onSolve: (payload: unknown) => void }) {
  const [mail, setMail] = useDraft("ch2-acrostic-mail", "");
  const [evidence, setEvidence] = useDraft<string[]>("ch2-acrostic-evidence", []);
  const ready = Boolean(mail) && evidence.length >= 2;
  function toggle(id: string) {
    setEvidence((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }
  return (
    <aside className="fp-side">
      <p className="kicker">Conclusie</p>
      <p>Welk bericht wijkt af?</p>
      <div className="sp-picks">
        {mails.map((item) => (
          <button key={item.id} className={`fp-chip${mail === item.id ? " on" : ""}`} type="button" onClick={() => setMail(item.id)}>
            {item.subject}
          </button>
        ))}
      </div>
      <p>Waar blijkt dat uit?</p>
      <div className="sp-picks">
        {supports.map((item) => (
          <button key={item.id} className={`fp-chip${evidence.includes(item.id) ? " on" : ""}`} type="button" onClick={() => toggle(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <button className="btn btn-mint" type="button" disabled={busy || solved || !ready} onClick={() => onSolve({ mail, evidence })}>
        Conclusie vastleggen
      </button>
    </aside>
  );
}

function FileCase({ solved, busy, onSolve }: { solved: boolean; busy: boolean; onSolve: (payload: unknown) => void }) {
  const [picked, setPicked] = useDraft<string[]>("ch2-meta", []);
  function toggle(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }
  return (
    <aside className="fp-side">
      <p className="kicker">Verschil</p>
      <p>Wat maakte dit bestand een risico?</p>
      <div className="sp-picks">
        {marks.map((item) => (
          <button key={item.id} className={`fp-chip${picked.includes(item.id) ? " on" : ""}`} type="button" onClick={() => toggle(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <button className="btn btn-mint" type="button" disabled={busy || solved || picked.length === 0} onClick={() => onSolve({ marks: picked })}>
        Verschillen vastleggen
      </button>
    </aside>
  );
}

function TimeCase({ solved, busy, onSolve }: { solved: boolean; busy: boolean; onSolve: (payload: unknown) => void }) {
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
    <aside className="fp-side">
      <p className="kicker">Keten</p>
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
      <button className="btn btn-ghost" type="button" onClick={() => setOrder([])}>Leegmaken</button>
      <button className="btn btn-mint" type="button" disabled={busy || solved || !filled} onClick={() => onSolve({ order: order.slice(0, 3) })}>
        Keten vastleggen
      </button>
    </aside>
  );
}

function TraceCase({ solved, busy, onSolve }: { solved: boolean; busy: boolean; onSolve: (payload: unknown) => void }) {
  const [job, setJob] = useDraft("ch2-trace-job", "");
  const [supportsPicked, setSupports] = useDraft<string[]>("ch2-trace-supports", []);
  function toggle(id: string) {
    setSupports((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }
  const ready = Boolean(job) && supportsPicked.length >= 2;
  return (
    <aside className="fp-side">
      <p className="kicker">Spoor</p>
      <p>Welke job verliet het dok?</p>
      <div className="sp-picks">
        {jobs.map((item) => (
          <button key={item.id} className={`fp-chip${job === item.id ? " on" : ""}`} type="button" onClick={() => setJob(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <p>Waar zie je dat terug?</p>
      <div className="sp-picks">
        {traceSupports.map((item) => (
          <button key={item.id} className={`fp-chip${supportsPicked.includes(item.id) ? " on" : ""}`} type="button" onClick={() => toggle(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <button className="btn btn-mint" type="button" disabled={busy || solved || !ready} onClick={() => onSolve({ job, supports: supportsPicked })}>
        Spoor bevestigen
      </button>
    </aside>
  );
}
