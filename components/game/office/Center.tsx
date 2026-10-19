"use client";

import { useMemo, useState } from "react";
import { asSector } from "@/lib/game/sector";
import { useSector } from "../SectorSkin";
import { OsIcon } from "./icons";

export const OS_APPS = [
  { id: "outlook", name: "Outlook", blurb: "E-mail en bijlagen", group: "Communicatie" },
  { id: "chat", name: "Nexora Chat", blurb: "Gesprekken met collega's", group: "Communicatie" },
  { id: "social", name: "Nexora Social", blurb: "Berichten en bedrijfspagina", group: "Communicatie" },
  { id: "contacten", name: "Contacten", blurb: "Mensen en relaties", group: "Communicatie" },
  { id: "crm", name: "CRM", blurb: "Medewerkers en leveranciers", group: "Productiviteit" },
  { id: "downloads", name: "Downloads", blurb: "Documenten en bestanden", group: "Productiviteit" },
  { id: "agenda", name: "Agenda", blurb: "Afspraken van vandaag", group: "Productiviteit" },
  { id: "projecten", name: "Projecten", blurb: "Nexora Day, alleen lezen", group: "Productiviteit" },
  { id: "notities", name: "Notities", blurb: "Klad van Mara", group: "Productiviteit" },
  { id: "nieuws", name: "Nieuws", blurb: "Het Netwerk", group: "Intern" },
  { id: "dossier", name: "Onderzoeksdossier", blurb: "Bewaarde sporen", group: "Intern" },
  { id: "helpdesk", name: "IT Helpdesk", blurb: "Meldingen en status", group: "Intern" },
  { id: "security", name: "Security", blurb: "Status van deze tablet", group: "Beveiliging" },
  { id: "instellingen", name: "Instellingen", blurb: "Geluid en weergave", group: "Beveiliging" },
] as const;

export type OsAppId = (typeof OS_APPS)[number]["id"];

const FILTERS = ["Alle apps", "Communicatie", "Productiviteit", "Intern", "Beveiliging"] as const;

export function AppCenter({ onOpen }: { onOpen: (id: OsAppId) => void }) {
  const sector = useSector();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Alle apps");
  const needle = query.trim().toLowerCase();
  const apps = useMemo(
    () => OS_APPS.filter((app) => {
      const groupOk = filter === "Alle apps" || app.group === filter;
      const text = `${app.name} ${app.blurb}`.toLowerCase();
      return groupOk && (!needle || text.includes(needle));
    }),
    [filter, needle],
  );

  return (
    <div className="os-app">
      <header className="os-head">
        <div>
          <p className="os-kicker">{asSector(sector, "Nexora Technologies")}</p>
          <h2>App Center</h2>
          <p>Alle applicaties van deze digitale werkplek.</p>
        </div>
        <label className="os-search">
          <span className="ol-sr">Zoek een app</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek een app..." />
        </label>
      </header>
      <div className="os-chips" role="tablist" aria-label="Categorie">
        {FILTERS.map((item) => (
          <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? "on" : ""} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>
      {apps.length === 0 ? <p className="os-empty">Geen apps voor deze zoekopdracht.</p> : (
        <div className="os-grid">
          {apps.map((app) => (
            <button key={app.id} type="button" className="os-tile" onClick={() => onOpen(app.id)}>
              <i><OsIcon id={app.id} uid={`c-${app.id}`} /></i>
              <strong>{asSector(sector, app.name)}</strong>
              <span>{asSector(sector, app.blurb)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
