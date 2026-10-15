"use client";

import { useEffect, useState } from "react";
import { phishReady } from "@/lib/game/office";
import { Briefing } from "./Briefing";
import { IntranetBody, type IntranetPage } from "./Intranet";

const NAV = ["Post", "Agenda", "Documenten", "Mensen", "Leveranciers", "Nieuws", "Dossier"] as const;
type Desk = (typeof NAV)[number];

function readOffice(teamCode: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`eth-office-${teamCode}`);
    return raw ? JSON.parse(raw) as { desk?: Desk; mailOpen?: boolean; briefed?: boolean; seen?: string[]; dossier?: string[]; noticed?: boolean } : null;
  } catch {
    return null;
  }
}

export function OfficeDesk({
  teamCode,
  busy,
  audio,
  onToggleAudio,
  onBreach,
}: {
  teamCode: string;
  busy: boolean;
  audio: boolean;
  onToggleAudio: () => void;
  onBreach: (reported: boolean) => void;
}) {
  const [desk, setDesk] = useState<Desk>("Post");
  const [mailOpen, setMailOpen] = useState(false);
  const [briefed, setBriefed] = useState(false);
  const [reading, setReading] = useState<string | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [dossier, setDossier] = useState<string[]>([]);
  const [noticed, setNoticed] = useState(false);
  const [grant, setGrant] = useState(false);
  const [toast, setToast] = useState(false);
  const [bell, setBell] = useState(false);
  const [restored, setRestored] = useState(false);
  const ready = phishReady(seen);

  useEffect(() => {
    const saved = readOffice(teamCode);
    if (saved?.desk && NAV.includes(saved.desk)) setDesk(saved.desk);
    if (saved?.mailOpen) {
      setMailOpen(true);
      setReading("phish");
    }
    if (saved?.seen) setSeen(saved.seen);
    if (saved?.dossier) setDossier(saved.dossier);
    if (saved?.noticed) setNoticed(true);
    if (saved?.briefed) setBriefed(true);
    setRestored(true);
  }, [teamCode]);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(`eth-office-${teamCode}`, JSON.stringify({ desk, mailOpen, briefed, seen, dossier, noticed }));
  }, [restored, teamCode, desk, mailOpen, briefed, seen, dossier, noticed]);

  useEffect(() => {
    if (!restored || !ready || noticed) return;
    setNoticed(true);
    setToast(true);
  }, [restored, ready, noticed]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!grant) return;
    const timer = window.setTimeout(() => setGrant(false), 4600);
    return () => window.clearTimeout(timer);
  }, [grant]);

  if (!restored) return null;
  if (!briefed) {
    return (
      <Briefing
        audio={audio}
        onToggleAudio={onToggleAudio}
        onStart={() => { setBriefed(true); setDesk("Post"); setGrant(true); }}
      />
    );
  }

  const page: IntranetPage = desk === "Post" ? "Mail" : desk === "Mensen" ? "Medewerkers" : desk === "Dossier" ? "Dossier" : desk;
  const unread = ready && !mailOpen;
  function see(id: string) {
    setSeen((current) => current.includes(id) ? current : [...current, id]);
  }
  function pin(id: string) {
    setDossier((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <section className="brief-app nx-work" aria-label="Nexora werkomgeving">
      <header className="brief-top">
        <div className="brief-brand"><span>N</span><strong>NEXORA<small>TECHNOLOGIES</small></strong></div>
        <nav className="brief-nav" aria-label="Werkbalk">
          {([
            ["Post", "M3 6h18v12H3zM3 6l9 7 9-7", "Mail"],
            ["Agenda", "M5 5h14v14H5zM5 9h14M9 5v4", "Agenda"],
            ["Documenten", "M7 3h7l5 5v13H7zM14 3v5h5", "Documenten"],
            ["Mensen", "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM4 20c.4-3 2.4-4.5 5-4.5S13.6 17 14 20", "Medewerkers"],
            ["Leveranciers", "M3 8h11v8H3zM14 11h3l4 3v2h-7zM6 16v2M14 16v2", "Leveranciers"],
            ["Nieuws", "M5 5h14v14H5zM8 9h8M8 13h5", "Nieuws"],
            ["Dossier", "M7 3h10v4H7zM6 7h12v14H6z", "Dossier"],
          ] as const).map(([id, icon, label]) => (
            <button key={id} type="button" className={page === label ? "on" : ""} onClick={() => { setDesk(id); setBell(false); if (id === "Post") setReading(null); }}>
              <svg viewBox="0 0 24 24" aria-hidden><path d={icon} /></svg>
              {label === "Dossier" ? "Onderzoeksdossier" : label}
              {id === "Post" && unread ? <i className="nx-dot" /> : null}
              {id === "Dossier" && dossier.length > 0 ? <small className="nx-count">{dossier.length}</small> : null}
            </button>
          ))}
        </nav>
        <button className="brief-bell-btn" type="button" aria-label={unread ? "Nieuw bericht" : "Meldingen"} onClick={() => { if (unread) { setDesk("Post"); setReading(null); setToast(false); setBell(false); } else setBell((value) => !value); }}>
          <svg viewBox="0 0 24 24" aria-hidden><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 19a2 2 0 0 0 4 0" /></svg>
          {unread ? <i className="nx-dot" /> : null}
        </button>
        {bell && !unread && <p className="nx-bell-note">Geen nieuwe meldingen.</p>}
        <div className="brief-user"><b>MV</b><span>Mara de Vries<small>Extern team</small></span></div>
      </header>
      <div className="brief-stage">
        <section className="nx-panel">
          {grant && <p className="nx-grant" role="status">Beveiligde toegang verleend. Onderzoeksomgeving beschikbaar.</p>}
          {toast && <p className="nx-toast" role="status">Nieuw bericht</p>}
          <IntranetBody
            page={page}
            investigation={{
              ready,
              busy,
              openMail: reading,
              dossier,
              onOpenMail: (id) => {
                setReading(id);
                if (id === "phish") setMailOpen(true);
              },
              onSeen: see,
              onPin: pin,
              onBreach,
            }}
          />
        </section>
      </div>
    </section>
  );
}
