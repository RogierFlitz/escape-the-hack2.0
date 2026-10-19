"use client";

import { useEffect, useState } from "react";
import { Pin, type Investigation } from "../Intranet";
import { deskNotes } from "./records";

type Person = {
  id: string;
  mark: string;
  title: string;
  source: string;
  when: string;
  body: string;
  address?: string;
  clue?: string;
};

export function ContactsApp({
  people,
  vendors,
  investigation,
  focusId,
}: {
  people: Person[];
  vendors: Person[];
  investigation: Investigation;
  focusId?: string | null;
}) {
  const all = [...people, ...vendors];
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"Mensen" | "Relaties">(focusId?.startsWith("vendor-") ? "Relaties" : "Mensen");
  const [openId, setOpenId] = useState<string | null>(focusId && all.some((item) => item.id === focusId) ? focusId : null);
  useEffect(() => {
    if (!focusId || !all.some((item) => item.id === focusId)) return;
    setOpenId(focusId);
    setTab(focusId.startsWith("vendor-") ? "Relaties" : "Mensen");
    const item = all.find((row) => row.id === focusId);
    if (item?.clue) investigation.onSeen(item.clue);
  }, [focusId, all, investigation]);
  const rows = tab === "Mensen" ? people : vendors;
  const needle = query.trim().toLowerCase();
  const visible = rows.filter((item) => `${item.title} ${item.source} ${item.when}`.toLowerCase().includes(needle));
  const open = all.find((item) => item.id === openId) ?? null;

  function choose(item: Person) {
    setOpenId(item.id);
    if (item.clue) investigation.onSeen(item.clue);
  }

  if (open) {
    return (
      <article className="os-detail os-pad">
        <button className="os-back" type="button" onClick={() => setOpenId(null)}>← Contacten</button>
        <h2>{open.title}</h2>
        <p>{open.source} · {open.when}</p>
        {open.address && <p className="mono">{open.address}</p>}
        <p>{open.body}</p>
        <Pin investigation={investigation} id={open.id} />
      </article>
    );
  }

  return (
    <div className="os-app">
      <header className="os-head">
        <div>
          <p className="os-kicker">Contacten</p>
          <h2>Mensen van Nexora</h2>
        </div>
        <label className="os-search">
          <span className="ol-sr">Zoek contacten</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek op naam of functie" />
        </label>
      </header>
      <div className="os-chips" role="tablist">
        <button type="button" className={tab === "Mensen" ? "on" : ""} onClick={() => setTab("Mensen")}>Mensen</button>
        <button type="button" className={tab === "Relaties" ? "on" : ""} onClick={() => setTab("Relaties")}>Relaties</button>
      </div>
      <div className="os-cards">
        {visible.map((item) => (
          <button key={item.id} type="button" className="os-person" onClick={() => choose(item)}>
            <b>{item.mark}</b>
            <strong>{item.title}</strong>
            <span>{item.source}</span>
            <small>{item.when}</small>
          </button>
        ))}
      </div>
      {visible.length === 0 && <p className="os-empty">Geen contacten.</p>}
    </div>
  );
}

export function NotesApp({ investigation, focusId, teamCode }: { investigation: Investigation; focusId?: string | null; teamCode: string }) {
  const [openId, setOpenId] = useState(focusId && deskNotes.some((note) => note.id === focusId) ? focusId : deskNotes[0].id);
  useEffect(() => {
    if (focusId && deskNotes.some((note) => note.id === focusId)) setOpenId(focusId);
  }, [focusId]);
  const [scratch, setScratch] = useState("");
  const [scratchReady, setScratchReady] = useState(false);
  useEffect(() => {
    setScratch(localStorage.getItem(`eth-scratch-${teamCode}`) ?? "");
    setScratchReady(true);
  }, [teamCode]);
  useEffect(() => {
    if (!scratchReady) return;
    localStorage.setItem(`eth-scratch-${teamCode}`, scratch);
  }, [scratch, teamCode, scratchReady]);
  const open = deskNotes.find((note) => note.id === openId) ?? deskNotes[0];
  return (
    <div className="os-split">
      <aside className="os-list">
        <header><p className="os-kicker">Notities</p><strong>Klad</strong></header>
        {deskNotes.map((note) => (
          <button key={note.id} type="button" className={note.id === open.id ? "on" : ""} onClick={() => setOpenId(note.id)}>
            <span><strong>{note.title}</strong><small>{note.when}</small></span>
          </button>
        ))}
      </aside>
      <article className="os-detail">
        <h2>{open.title}</h2>
        <p>{open.body}</p>
        <Pin investigation={investigation} id={open.id} label="Bewaar in dossier" savedLabel="Bewaard in dossier" />
        <label className="os-scratch">
          <span>Eigen klad op deze tablet</span>
          <textarea value={scratch} onChange={(event) => setScratch(event.target.value)} placeholder="Dit klad blijft op dit scherm en telt niet mee als bewijs." />
        </label>
      </article>
    </div>
  );
}

export function SecurityApp() {
  const rows = [
    ["Mailfilter", "Aan", "Gewone post van dit account komt binnen."],
    ["Deze tablet", "Onderzoeksomgeving", "Geen toegang tot andere apparaten of het echte netwerk."],
    ["Wachtwoorden", "Niet delen", "De servicedesk herhaalt dat wachtwoorden niet via de mail gaan."],
    ["Open incidenten", "Geen op dit scherm", "Een melding maak je vanuit de mail, niet vanuit dit bord."],
  ];
  return (
    <div className="os-app">
      <header className="os-head">
        <div>
          <p className="os-kicker">Security</p>
          <h2>Status van deze tablet</h2>
          <p>Neutraal overzicht. Hier staat geen oplossing en geen apparaatbediening.</p>
        </div>
      </header>
      <div className="os-status-grid">
        {rows.map(([title, state, text]) => (
          <article key={title}>
            <strong>{title}</strong>
            <em>{state}</em>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function SettingsApp({ audio, onToggleAudio }: { audio: boolean; onToggleAudio: () => void }) {
  return (
    <div className="os-app">
      <header className="os-head">
        <div>
          <p className="os-kicker">Instellingen</p>
          <h2>Deze werkplek</h2>
          <p>Alleen de weergave van Nexora OS. De tablet zelf verandert niet.</p>
        </div>
      </header>
      <div className="os-settings">
        <article>
          <strong>Geluid</strong>
          <p>Spraak en signalen van deze omgeving.</p>
          <button className="ol-cmd" type="button" onClick={onToggleAudio}>{audio ? "Geluid aan" : "Geluid uit"}</button>
        </article>
        <article>
          <strong>Weergave</strong>
          <p>Donker marineblauw in de apps, warme achtergrond op het beginscherm.</p>
        </article>
        <article>
          <strong>Appinformatie</strong>
          <p>Nexora OS 2.0. Lokale onderzoeksomgeving, zonder externe diensten.</p>
        </article>
        <article>
          <strong>Apparatuur</strong>
          <p>Batterij 100%. Verbonden met het evenementnetwerk. Geen live weer of internet nodig.</p>
        </article>
      </div>
    </div>
  );
}
