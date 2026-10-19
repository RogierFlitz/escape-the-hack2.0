"use client";

import { useEffect, useMemo, useState } from "react";
import { Pin, type Investigation } from "../Intranet";
import { chatThreads } from "./records";

export function ChatApp({ investigation, focusId }: { investigation: Investigation; focusId?: string | null }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(focusId && chatThreads.some((thread) => thread.id === focusId) ? focusId : chatThreads[0].id);
  useEffect(() => {
    if (focusId && chatThreads.some((thread) => thread.id === focusId)) setOpenId(focusId);
  }, [focusId]);
  const needle = query.trim().toLowerCase();
  const threads = useMemo(
    () => chatThreads.filter((thread) => `${thread.title} ${thread.people} ${thread.body}`.toLowerCase().includes(needle)),
    [needle],
  );
  const open = chatThreads.find((thread) => thread.id === openId) ?? null;

  return (
    <div className="os-split">
      <aside className="os-list">
        <header>
          <p className="os-kicker">Nexora Chat</p>
          <strong>Gesprekken</strong>
        </header>
        <label className="os-search">
          <span className="ol-sr">Zoek gesprekken</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek een gesprek..." />
        </label>
        {threads.length === 0 ? <p className="os-empty">Geen gesprekken.</p> : threads.map((thread) => (
          <button key={thread.id} type="button" className={thread.id === openId ? "on" : ""} onClick={() => setOpenId(thread.id)}>
            <b>{thread.title.slice(0, 1)}</b>
            <span><strong>{thread.title}</strong><small>{thread.excerpt}</small></span>
            <time>{thread.when}</time>
          </button>
        ))}
      </aside>
      <article className="os-detail">
        {open ? (
          <>
            <header className="os-detail-head">
              <div>
                <h2>{open.title}</h2>
                <p>{open.people}</p>
              </div>
            </header>
            <div className="os-thread">
              {open.messages.map((message) => (
                <p key={`${message.time}-${message.from}`} className={message.from === "Mara de Vries" ? "mine" : ""}>
                  <strong>{message.from}</strong>
                  <span>{message.text}</span>
                  <time>{message.time}</time>
                </p>
              ))}
            </div>
            <p className="os-note">Dit is een lokaal gespreksarchief. Berichten versturen naar andere teams kan hier niet.</p>
            <Pin investigation={investigation} id={open.id} label="Bewaar in dossier" savedLabel="Bewaard in dossier" />
          </>
        ) : <p className="os-empty">Kies een gesprek.</p>}
      </article>
    </div>
  );
}
