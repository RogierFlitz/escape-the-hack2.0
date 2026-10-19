"use client";

import { useEffect, useMemo, useState } from "react";
import { Pin, type Investigation } from "../Intranet";
import { projectTasks, tickets, type ProjectTask, type Ticket } from "./records";

const COLUMNS = [
  { id: "todo", label: "Nog te doen" },
  { id: "doing", label: "Bezig" },
  { id: "done", label: "Afgerond" },
] as const;

export function ProjectsApp({
  investigation,
  focusId,
  onOpenDoc,
  onPerson,
}: {
  investigation: Investigation;
  focusId?: string | null;
  onOpenDoc: (id: string) => void;
  onPerson: (name: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(focusId && projectTasks.some((task) => task.id === focusId) ? focusId : null);
  useEffect(() => {
    if (focusId && projectTasks.some((task) => task.id === focusId)) setOpenId(focusId);
  }, [focusId]);
  const open = projectTasks.find((task) => task.id === openId) ?? null;
  return (
    <div className="os-app">
      <header className="os-head">
        <div>
          <p className="os-kicker">Nexora Projecten</p>
          <h2>Nexora Day</h2>
          <p>Voorbereiding en uitvoering. Alleen bekijken, niets wordt hier gewijzigd.</p>
        </div>
      </header>
      {open ? (
        <TaskDetail task={open} investigation={investigation} onBack={() => setOpenId(null)} onOpenDoc={onOpenDoc} onPerson={onPerson} />
      ) : (
        <div className="os-kanban">
          {COLUMNS.map((column) => {
            const cards = projectTasks.filter((task) => task.column === column.id);
            return (
              <section key={column.id}>
                <header><strong>{column.label}</strong><span>{cards.length}</span></header>
                {cards.map((task) => (
                  <button key={task.id} type="button" className="os-task" onClick={() => setOpenId(task.id)}>
                    <strong>{task.title}</strong>
                    <span>{task.owner}</span>
                    <small>{task.when}</small>
                  </button>
                ))}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskDetail({
  task,
  investigation,
  onBack,
  onOpenDoc,
  onPerson,
}: {
  task: ProjectTask;
  investigation: Investigation;
  onBack: () => void;
  onOpenDoc: (id: string) => void;
  onPerson: (name: string) => void;
}) {
  return (
    <article className="os-detail os-pad">
      <button className="os-back" type="button" onClick={onBack}>← Bord</button>
      <h2>{task.title}</h2>
      <p><button className="os-link" type="button" onClick={() => onPerson(task.owner)}>{task.owner}</button> · {task.when} · {task.source}</p>
      <p>{task.body}</p>
      <div className="os-actions">
        {task.docId && <button className="ol-cmd" type="button" onClick={() => onOpenDoc(task.docId!)}>Document openen</button>}
        <Pin investigation={investigation} id={task.id} label="Bewaar in dossier" savedLabel="Bewaard in dossier" />
      </div>
    </article>
  );
}

const TICKET_FILTERS = ["Alles", "Open", "In behandeling", "Gesloten"] as const;

export function HelpdeskApp({ investigation, focusId }: { investigation: Investigation; focusId?: string | null }) {
  const [filter, setFilter] = useState<(typeof TICKET_FILTERS)[number]>("Alles");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(focusId && tickets.some((ticket) => ticket.id === focusId) ? focusId : tickets[0].id);
  useEffect(() => {
    if (focusId && tickets.some((ticket) => ticket.id === focusId)) setOpenId(focusId);
  }, [focusId]);
  const [file, setFile] = useState(false);
  const needle = query.trim().toLowerCase();
  const rows = useMemo(
    () => tickets.filter((ticket) => {
      const statusOk = filter === "Alles" || ticket.status === filter;
      const text = `${ticket.title} ${ticket.source} ${ticket.body}`.toLowerCase();
      return statusOk && (!needle || text.includes(needle));
    }),
    [filter, needle],
  );
  const open = tickets.find((ticket) => ticket.id === openId) ?? null;

  return (
    <div className="os-split">
      <aside className="os-list">
        <header>
          <p className="os-kicker">Nexora Helpdesk</p>
          <strong>Tickets</strong>
        </header>
        <label className="os-search">
          <span className="ol-sr">Zoek tickets</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek een melding..." />
        </label>
        <div className="os-chips" role="tablist" aria-label="Status">
          {TICKET_FILTERS.map((item) => (
            <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? "on" : ""} onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
        {rows.length === 0 ? <p className="os-empty">Geen tickets.</p> : rows.map((ticket) => (
          <button key={ticket.id} type="button" className={ticket.id === open?.id ? "on" : ""} onClick={() => { setOpenId(ticket.id); setFile(false); }}>
            <span><strong>{ticket.title}</strong><small>{ticket.source} · {ticket.status}</small></span>
            <time>{ticket.when}</time>
          </button>
        ))}
      </aside>
      <article className="os-detail">
        {open ? <TicketBody ticket={open} file={file} onFile={() => setFile((current) => !current)} investigation={investigation} /> : <p className="os-empty">Kies een ticket.</p>}
      </article>
    </div>
  );
}

function TicketBody({
  ticket,
  file,
  onFile,
  investigation,
}: {
  ticket: Ticket;
  file: boolean;
  onFile: () => void;
  investigation: Investigation;
}) {
  return (
    <>
      <header className="os-detail-head">
        <div>
          <h2>{ticket.title}</h2>
          <p>{ticket.source} · {ticket.when}</p>
        </div>
        <em className={`os-status ${ticket.status === "Gesloten" ? "done" : ticket.status === "Open" ? "open" : ""}`}>{ticket.status}</em>
      </header>
      <p>{ticket.body}</p>
      {ticket.attachment && (
        <div className="ol-files">
          <button className="ol-file" type="button" onClick={onFile}>
            <span className="ol-file-ico">TXT</span>
            <span><strong>notitie.txt</strong><small>Bijlage van dit ticket</small></span>
          </button>
          {file && <p className="ol-file-body">{ticket.attachment}</p>}
        </div>
      )}
      <Pin investigation={investigation} id={ticket.id} label="Bewaar in dossier" savedLabel="Bewaard in dossier" />
    </>
  );
}
