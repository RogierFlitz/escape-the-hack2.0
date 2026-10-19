"use client";

import { useEffect } from "react";
import { sources, type Source } from "@/lib/game/footprint";
import { asSector } from "@/lib/game/sector";
import { useSector } from "../SectorSkin";
import { filters, readLabel, sourcePhoto, typeLabel, type FilterId, type Pin } from "./meta";

export function Mission1SourceExplorer({
  query,
  filter,
  openId,
  seen,
  pins,
  onQuery,
  onFilter,
  onOpen,
}: {
  query: string;
  filter: FilterId;
  openId: string | null;
  seen: string[];
  pins: Pin[];
  onQuery: (value: string) => void;
  onFilter: (id: FilterId) => void;
  onOpen: (id: string) => void;
}) {
  useEffect(() => {
    if (!openId) return;
    document.getElementById(`m1-src-${openId}`)?.scrollIntoView({ block: "nearest" });
  }, [openId]);

  const sector = useSector();
  const needle = query.trim().toLowerCase();
  const visible = sources.filter((source) => {
    if (filter !== "all" && source.kind !== filter) return false;
    if (!needle) return true;
    const hay = asSector(sector, `${source.title} ${source.author} ${source.body} ${source.outlet}`);
    return hay.toLowerCase().includes(needle);
  });

  return (
    <section className="m1-sources" aria-label="Bronnenonderzoek">
      <header>
        <strong>Bronnen</strong>
        <span>{visible.length}</span>
      </header>
      <label className="m1-search">
        <span className="sr">Zoek in bronnen</span>
        <input value={query} placeholder="Zoek op titel of inhoud" onChange={(event) => onQuery(event.target.value)} />
      </label>
      <div className="m1-filters" role="toolbar" aria-label="Brontype">
        {filters.map((item) => {
          const count = item.id === "all" ? sources.length : sources.filter((source) => source.kind === item.id).length;
          return (
            <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => onFilter(item.id)}>
              {item.label}
              <b>{count}</b>
            </button>
          );
        })}
      </div>
      <div className="m1-list">
        {visible.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            active={openId === source.id}
            status={readLabel(source.id, seen, pins)}
            onOpen={() => onOpen(source.id)}
          />
        ))}
        {visible.length === 0 && <p className="m1-empty">Geen bronnen voor deze zoekopdracht.</p>}
      </div>
    </section>
  );
}

function SourceCard({
  source,
  active,
  status,
  onOpen,
}: {
  source: Source;
  active: boolean;
  status: string;
  onOpen: () => void;
}) {
  const sector = useSector();
  const photo = sourcePhoto[source.id];
  return (
    <button id={`m1-src-${source.id}`} className={`m1-card${active ? " on" : ""}`} type="button" aria-current={active ? "true" : undefined} data-kind={source.kind} data-status={status} onClick={onOpen}>
      {photo ? <img src={photo} alt="" /> : <span className="m1-thumb" aria-hidden><KindIcon kind={source.kind} /></span>}
      <span className="m1-card-copy">
        <small>{typeLabel[source.kind]}</small>
        <strong>{asSector(sector, source.title)}</strong>
        <em>{asSector(sector, source.author)} · {source.when}</em>
        <i>{status}</i>
      </span>
    </button>
  );
}

function KindIcon({ kind }: { kind: Source["kind"] }) {
  if (kind === "nieuws") return <svg viewBox="0 0 24 24"><path d="M5 4h11v16H5z" /><path d="M16 7h3v13H8" /><path d="M8 8h6M8 12h6M8 16h4" /></svg>;
  if (kind === "post") return <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 10h8M8 14h5" /></svg>;
  if (kind === "profiel") return <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3" /><path d="M5 19c1.4-3 3.6-4.5 7-4.5s5.6 1.5 7 4.5" /></svg>;
  if (kind === "foto") return <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="M3 16l5-4 4 3 3-2 6 5" /></svg>;
  if (kind === "partner") return <svg viewBox="0 0 24 24"><path d="M4 10h16v9H4z" /><path d="M8 10V7h8v3" /></svg>;
  return <svg viewBox="0 0 24 24"><path d="M4 18V6h10l2 2h4v10z" /><path d="M8 12h8M8 15h5" /></svg>;
}
