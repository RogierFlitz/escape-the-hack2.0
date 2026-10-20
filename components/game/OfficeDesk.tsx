"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PHISH_AFTER_MS, phishDue, phishReady } from "@/lib/game/office";
import { Briefing } from "./Briefing";
import { IntranetBody, type IntranetPage } from "./Intranet";
import { OS_APPS, type OsAppId } from "./office/Center";
import { OfficeSuite } from "./office/Suite";

const APPS = ["home", "center", "outlook", "crm", "downloads", "agenda", "nieuws", "dossier", "social", "chat", "projecten", "contacten", "notities", "helpdesk", "security", "instellingen"] as const;
type AppId = (typeof APPS)[number];

const LEGACY: Record<string, AppId> = {
  Post: "outlook",
  Agenda: "agenda",
  Documenten: "downloads",
  Mensen: "crm",
  Leveranciers: "crm",
  Nieuws: "nieuws",
  Dossier: "dossier",
};

function asApp(value: unknown): AppId {
  if (typeof value === "string" && (APPS as readonly string[]).includes(value)) return value as AppId;
  if (typeof value === "string" && LEGACY[value]) return LEGACY[value];
  return "home";
}

function readOffice(teamCode: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`eth-office-${teamCode}`);
    return raw ? JSON.parse(raw) as { desk?: string; mailOpen?: boolean; briefed?: boolean; seen?: string[]; dossier?: string[]; noticed?: boolean; readMail?: string[]; startedAt?: number } : null;
  } catch {
    return null;
  }
}

const LABELS: Record<Exclude<AppId, "home">, string> = {
  center: "App Center",
  outlook: "Outlook",
  crm: "CRM",
  downloads: "Downloads",
  agenda: "Agenda",
  nieuws: "Nieuws",
  dossier: "Onderzoeksdossier",
  social: "Nexora Social",
  chat: "Nexora Chat",
  projecten: "Projecten",
  contacten: "Contacten",
  notities: "Notities",
  helpdesk: "IT Helpdesk",
  security: "Security",
  instellingen: "Instellingen",
};

const INTRANET = new Set<AppId>(["outlook", "crm", "downloads", "agenda", "nieuws", "dossier"]);

function StatusClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);
  const time = now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  const day = now.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
  return <p className="tb-clock"><strong>{time}</strong><span>{day}</span></p>;
}

function IconFrame({
  uid,
  from,
  to,
  children,
}: {
  uid: string;
  from: string;
  to: string;
  children: ReactNode;
}) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={`${uid}-gl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.38" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#041018" stopOpacity="0.16" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <rect width="64" height="64" rx="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}-clip)`}>
        <rect width="64" height="64" fill={`url(#${uid}-bg)`} />
        <rect width="64" height="32" fill={`url(#${uid}-gl)`} />
        {children}
        <rect x="0.7" y="0.7" width="62.6" height="62.6" rx="15.5" fill="none" stroke="#ffffff" strokeOpacity="0.38" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function AppGlyph({ id, day, uid }: { id: Exclude<AppId, "home">; day: number; uid: string }) {
  if (id === "outlook") {
    return (
      <IconFrame uid={uid} from="#4DA3FF" to="#0B66C3">
        <path fill="#ffffff" d="M13 26.5 32 38.2 51 26.5V45a2.4 2.4 0 0 1-2.4 2.4H15.4A2.4 2.4 0 0 1 13 45V26.5z" />
        <path fill="#D7EBFF" d="M13 25.4 32 36.2 51 25.4 32 17.2 13 25.4z" />
        <path fill="#ffffff" fillOpacity="0.55" d="M13 25.6 32 35.6 51 25.6 32 33.2 13 25.6z" />
      </IconFrame>
    );
  }
  if (id === "crm") {
    return (
      <IconFrame uid={uid} from="#3DCE78" to="#0E8A48">
        <circle cx="26" cy="23" r="7" fill="#ffffff" />
        <circle cx="41.5" cy="25" r="5.6" fill="#E7FFF2" />
        <path fill="#ffffff" d="M11 48.5c1.4-8.2 6.2-12.2 15-12.2s13.6 4 15 12.2H11z" />
        <path fill="#E7FFF2" d="M33 47.8c.8-5.2 3.4-8.2 8.2-8.8 3.2 1.5 5.2 4.4 6 8.8H33z" />
      </IconFrame>
    );
  }
  if (id === "downloads") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-tab`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE7A0" />
            <stop offset="1" stopColor="#F6C453" />
          </linearGradient>
          <linearGradient id={`${uid}-front`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFD86A" />
            <stop offset="1" stopColor="#E09612" />
          </linearGradient>
          <linearGradient id={`${uid}-gl`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path fill={`url(#${uid}-tab)`} d="M4 18.5C4 13 8 9 13.5 9H30c1.4 0 2.7.7 3.5 1.8L39 18.5h15c4.4 0 8 3.4 8 7.6V28H4v-9.5z" />
        <path fill={`url(#${uid}-front)`} d="M2.5 26h59c2 0 3.5 1.7 3.5 3.6V54c0 5-4 8.5-9 8.5h-48c-5 0-9-3.5-9-8.5V29.6c0-1.9 1.5-3.6 3.5-3.6z" />
        <path fill={`url(#${uid}-gl)`} d="M2.5 26h59c2 0 3.5 1.7 3.5 3.6V39c-14 5.2-32 7.2-62.5 2.6V29.6c0-1.9 1.5-3.6 3.5-3.6z" />
        <path fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.2" d="M4.8 18.5C4.8 13.6 8.4 10 13.2 10H30l5.6 8h18.2c3.8 0 6.8 2.8 6.8 6.4" />
      </svg>
    );
  }
  if (id === "agenda") {
    return (
      <IconFrame uid={uid} from="#FFFFFF" to="#F3F6FA">
        <path fill="#F0C9C9" d="M18 13.5h4.2a2 2 0 0 1 2 2V18h-8.2v-2.5a2 2 0 0 1 2-2zm23.6 0H46a2 2 0 0 1 2 2V18h-8.4v-2.5a2 2 0 0 1 2-2z" />
        <path fill="#E7EDF3" d="M14 18.5h36v3H14z" />
        <text
          x="32"
          y="40"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#D21F2C"
          fontSize="28"
          fontWeight="600"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          {day}
        </text>
      </IconFrame>
    );
  }
  if (id === "nieuws") {
    return (
      <IconFrame uid={uid} from="#5B92FF" to="#1E56D9">
        <rect x="14" y="13" width="36" height="38" rx="3" fill="#ffffff" />
        <rect x="18" y="17" width="15" height="12" rx="1.5" fill="#2F66E0" />
        <rect x="35.5" y="17.5" width="11" height="2.1" rx="1" fill="#A9C0EA" />
        <rect x="35.5" y="22" width="11" height="2.1" rx="1" fill="#C5D4EE" />
        <rect x="35.5" y="26.5" width="8" height="2.1" rx="1" fill="#C5D4EE" />
        <rect x="18" y="33" width="28" height="2.1" rx="1" fill="#A9C0EA" />
        <rect x="18" y="38" width="28" height="2.1" rx="1" fill="#C5D4EE" />
        <rect x="18" y="43" width="18" height="2.1" rx="1" fill="#C5D4EE" />
      </IconFrame>
    );
  }
  return (
    <IconFrame uid={uid} from="#FBFCFD" to="#E7EEF5">
      <path fill="#ffffff" d="M16 9h20.5L50 22.2V52a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3z" />
      <path fill="#D3DDE8" d="M36.5 9.4 49.6 22.2H39.4a2.8 2.8 0 0 1-2.9-2.8V9.4z" />
      <path fill="#8EA0B4" d="M21 32h20v2.3H21zm0 6.2h15v2.3H21zm0 6.2h17v2.3H21z" />
    </IconFrame>
  );
}

function MoreGlyph({ kind, uid }: { kind: "plus" | "dots"; uid: string }) {
  if (kind === "dots") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" />
        <circle cx="22" cy="32" r="2.7" fill="#ffffff" />
        <circle cx="32" cy="32" r="2.7" fill="#ffffff" />
        <circle cx="42" cy="32" r="2.7" fill="#ffffff" />
      </svg>
    );
  }
  return (
    <IconFrame uid={uid} from="#F8FAFC" to="#E4EAF1">
      <path fill="#6C7A8A" d="M30.1 18h3.8v12.1H46v3.8H33.9V46h-3.8V33.9H18v-3.8h12.1V18z" />
    </IconFrame>
  );
}

function pageFor(app: Exclude<AppId, "home">): IntranetPage {
  if (app === "outlook") return "Mail";
  if (app === "crm") return "CRM";
  if (app === "downloads") return "Documenten";
  if (app === "agenda") return "Agenda";
  if (app === "nieuws") return "Nieuws";
  return "Dossier";
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
  const [app, setApp] = useState<AppId>("home");
  const [mailOpen, setMailOpen] = useState(false);
  const [briefed, setBriefed] = useState(false);
  const [reading, setReading] = useState<string | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [dossier, setDossier] = useState<string[]>([]);
  const [readMail, setReadMail] = useState<string[]>([]);
  const [noticed, setNoticed] = useState(false);
  const [grant, setGrant] = useState(false);
  const [toast, setToast] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [forced, setForced] = useState(false);
  const ready = phishReady(seen) || forced;

  useEffect(() => {
    const saved = readOffice(teamCode);
    if (saved?.desk) setApp(asApp(saved.desk));
    const read = [...(saved?.readMail ?? [])];
    if (saved?.mailOpen) {
      setMailOpen(true);
      setReading("phish");
      if (!read.includes("phish")) read.push("phish");
    }
    setReadMail(read);
    if (saved?.seen) setSeen(saved.seen);
    if (saved?.dossier) setDossier(saved.dossier);
    if (saved?.noticed) setNoticed(true);
    if (saved?.briefed) setBriefed(true);
    if (typeof saved?.startedAt === "number") setStartedAt(saved.startedAt);
    setRestored(true);
  }, [teamCode]);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(`eth-office-${teamCode}`, JSON.stringify({ desk: app, mailOpen, briefed, seen, dossier, noticed, readMail, startedAt }));
  }, [restored, teamCode, app, mailOpen, briefed, seen, dossier, noticed, readMail, startedAt]);

  useEffect(() => {
    if (!restored || !briefed) return;
    if (startedAt === null) {
      setStartedAt(Date.now());
      return;
    }
    const left = PHISH_AFTER_MS - (Date.now() - startedAt);
    if (phishDue(startedAt, Date.now())) {
      setForced(true);
      return;
    }
    const timer = window.setTimeout(() => setForced(true), left);
    return () => window.clearTimeout(timer);
  }, [restored, briefed, startedAt]);

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
        onStart={() => { setBriefed(true); setApp("home"); setGrant(true); setStartedAt((current) => current ?? Date.now()); }}
      />
    );
  }

  const unread = ready && !mailOpen;
  const mailCue = ready && !readMail.includes("phish");
  function see(id: string) {
    setSeen((current) => current.includes(id) ? current : [...current, id]);
  }
  function pin(id: string) {
    setDossier((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }
  function openApp(id: AppId, piece?: string | null) {
    setApp(id);
    setFocus(piece ?? null);
    setToast(false);
    if (id === "outlook" && piece) {
      setReading(piece);
      if (piece === "phish") setMailOpen(true);
    }
  }
  function openPiece(id: string) {
    if (id.startsWith("doc-")) return openApp("downloads", id);
    if (id.startsWith("p-") || id.startsWith("vendor-")) return openApp("crm", id);
    if (id.startsWith("news-")) return openApp("nieuws", id);
    if (id.startsWith("ag-") || id === "agenda-event") return openApp("agenda", id);
    if (id.startsWith("social-")) return openApp("social", id);
    if (id.startsWith("chat-")) return openApp("chat", id);
    if (id.startsWith("hd-")) return openApp("helpdesk", id);
    if (id.startsWith("task-")) return openApp("projecten", id);
    if (id.startsWith("note-")) return openApp("notities", id);
    openApp("outlook", id);
  }
  function openPerson(name: string) {
    const ids: Record<string, string> = {
      "Mara de Vries": "p-mara",
      "J. Vale": "p-vale",
      "L. Crowe": "p-crowe",
      "M. Okonkwo": "p-okon",
      "S. Adler": "p-adler",
      "T. Berg": "p-berg",
      "Helix Events": "vendor-helix",
    };
    const id = ids[name];
    if (id) openPiece(id);
  }

  const investigation = {
    ready,
    busy,
    openMail: reading,
    dossier,
    readMail,
    onOpenMail: (id: string | null) => {
      setReading(id);
      if (id === "phish") setMailOpen(true);
    },
    onSeen: see,
    onPin: pin,
    onRead: (id: string) => setReadMail((current) => current.includes(id) ? current : [...current, id]),
    onBreach,
  };

  const dayNumber = new Date().getDate();
  const mailBadge = ["mara", "room", "it", "dock-mail"].filter((id) => !readMail.includes(id)).length + (ready && !readMail.includes("phish") ? 1 : 0);
  const homeApps = ["outlook", "crm", "downloads", "agenda", "nieuws", "dossier"] as const;
  function badgeFor(id: (typeof homeApps)[number]) {
    const count = id === "outlook" ? mailBadge : id === "crm" ? 12 : id === "nieuws" ? 1 : id === "dossier" ? dossier.length : 0;
    return count > 0 ? String(count) : "";
  }
  if (app === "home") {
    return (
      <section className="brief-app nx-work tb-home-shell" aria-label="Nexora tablet">
        <div className="tb-home">
          <header className="tb-status">
            <StatusClock />
            <p className="tb-sys" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M4 16c1.5-2 3.2-3 5-3s3.5 1 5 3M7 12c1-.9 2.1-1.4 3.2-1.4S12.4 11 13.4 12M10 8.5c.4-.3.8-.5 1.2-.5s.8.2 1.2.5" /></svg>
              <svg viewBox="0 0 24 24"><rect x="2" y="7" width="18" height="10" rx="2" /><rect x="21" y="10" width="1.6" height="4" rx="0.4" /><rect x="4" y="9" width="12" height="6" /></svg>
              <span>100%</span>
            </p>
          </header>
          <div className="tb-scroll">
            {grant && <p className="nx-grant tb-note" role="status">Beveiligde toegang verleend. Onderzoeksomgeving beschikbaar.</p>}
            {mailCue && (
              <button className="nx-toast tb-note" type="button" onClick={() => openApp("outlook", "phish")}>
                Nieuw bericht in Outlook. Open de mail.
              </button>
            )}
            <div className="tb-dash">
              <div className="tb-top">
                <div className="tb-hi">
                  <span aria-hidden="true">👋</span>
                  <div>
                    <Hello />
                    <p>Fijn dat je er bent. Dit is je overzicht voor vandaag.</p>
                  </div>
                </div>
                <p className="tb-weather">
                  <span aria-hidden="true">☀</span>
                  <strong>18°</strong>
                  <span>Scheveningen<small>Zonnig</small></span>
                </p>
                <p className="tb-profile"><b>MV</b><span>Mara de Vries</span></p>
              </div>
              <div className="tb-iconbar">
                {homeApps.map((id) => {
                  const badge = badgeFor(id);
                  return (
                    <button key={id} className="tb-app" type="button" onClick={() => openApp(id)}>
                      <i className="tb-ico">
                        <AppGlyph id={id} day={dayNumber} uid={`h-${id}`} />
                        {badge ? <em className="tb-badge">{badge}</em> : null}
                      </i>
                      <span>{id === "dossier" ? "Onderzoeksdossier" : LABELS[id]}</span>
                    </button>
                  );
                })}
                <button className="tb-app" type="button" aria-label="Meer apps" onClick={() => openApp("center")}>
                  <i className="tb-ico tb-ico-quiet">
                    <MoreGlyph kind="plus" uid="h-more" />
                  </i>
                  <span>Meer apps</span>
                </button>
              </div>
              <div className="tb-stats">
                <button type="button" onClick={() => openApp("outlook")}><i aria-hidden="true">▤</i><span>Nieuwe aanvragen</span><strong>4</strong><small>post van vandaag</small></button>
                <button type="button" onClick={() => openApp("projecten")}><i aria-hidden="true">▦</i><span>Bevestigde boekingen</span><strong>2</strong><small>zaal en crew</small></button>
                <button type="button" onClick={() => openApp("agenda")}><i aria-hidden="true">☺</i><span>Uitvoering vandaag</span><strong>3</strong><small>afspraken op kantoor</small></button>
                <button type="button" onClick={() => openApp("projecten")}><i aria-hidden="true">✓</i><span>Openstaande taken</span><strong>5</strong><small>voor vandaag</small></button>
              </div>
              <div className="tb-panels">
                <section className="tb-card">
                  <header><strong>Mijn taken</strong></header>
                  <ul>
                    {[
                      ["Stand-up voorbereiden", "Vandaag", "ag-stand"],
                      ["Terugbellen Astra Logistics", "Vandaag", "ag-astra"],
                      ["Vergaderzaal 3 controleren", "13:00", "room"],
                      ["Kwartaalcijfers nalopen", "15:00", "ag-board"],
                      ["Lunchlijst vrijdag", "17:00", "lunch"],
                    ].map(([label, when, id]) => (
                      <li key={id}>
                        <button type="button" onClick={() => openPiece(id)}>
                          <span>{label}</span>
                          {when === "Vandaag" ? <em>{when}</em> : <time>{when}</time>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="tb-card">
                  <header><strong>Recente bestanden</strong><button type="button" onClick={() => openApp("downloads")}>Toon alles</button></header>
                  <ul>
                    {[
                      ["doc-plan", "Conceptplanning-bijeenkomst.pdf", "Intern"],
                      ["doc-contract", "Overeenkomst-vloerpartner.pdf", "Getekend"],
                      ["doc-rules", "Huisregels-kantoor.pdf", "Facilitair"],
                      ["doc-quote", "Offerte-Noordlicht.pdf", "Inkoop"],
                    ].map(([id, name, meta]) => (
                      <li key={id}>
                        <button type="button" onClick={() => openPiece(id)}>
                          <i>PDF</i>
                          <span>{name}<small>{meta}</small></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="tb-card">
                  <header><strong>Nieuws & updates</strong><button type="button" onClick={() => openApp("nieuws")}>Toon alles</button></header>
                  <ul className="tb-news">
                    {[
                      ["news-day", "a", "Nexora Day komt eraan", "Intern nieuws"],
                      ["news-coffee", "b", "Nieuwe koffie op verdieping 3", "Facilitair"],
                      ["news-quarter", "c", "Kwartaalcijfers volgende week", "Directie"],
                    ].map(([id, tone, title, meta]) => (
                      <li key={id}>
                        <button type="button" onClick={() => openPiece(id)}>
                          <i className={`tb-thumb ${tone}`} aria-hidden="true" />
                          <span>{title}<small>{meta}</small></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
              <aside className="tb-card tb-today">
                <header><strong>Vandaag</strong><button type="button" onClick={() => openApp("agenda")}>Bekijk agenda</button></header>
                <ul>
                  {[
                    ["09:00", "Stand-up operatie", "Operationeel team", "g", "ag-stand"],
                    ["10:30", "Terugbel Astra Logistics", "Mara de Vries", "b", "ag-astra"],
                    ["13:00", "Vergaderzaal 3", "Facilitair", "o", "room"],
                    ["15:00", "Kwartaalcijfers", "Boardroom", "p", "ag-board"],
                    ["17:00", "Lunchlijst", "Kantine", "t", "lunch"],
                  ].map(([time, title, place, tone, id]) => (
                    <li key={id}>
                      <button type="button" onClick={() => openPiece(id)}>
                        <time>{time}</time>
                        <i className={tone} aria-hidden="true" />
                        <span>{title}<small>{place}</small></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
          <nav className="tb-dock" aria-label="Dock">
            {(["outlook", "crm", "agenda", "downloads", "nieuws", "dossier"] as const).map((id) => {
              const badge = badgeFor(id);
              return (
                <button key={id} className="tb-app" type="button" onClick={() => openApp(id)}>
                  <i className="tb-ico">
                    <AppGlyph id={id} day={dayNumber} uid={`d-${id}`} />
                    {badge ? <em className="tb-badge">{badge}</em> : null}
                  </i>
                  <span>{id === "dossier" ? "Onderzoeksdossier" : LABELS[id]}</span>
                </button>
              );
            })}
            <button className="tb-app" type="button" aria-label="Meer apps" onClick={() => openApp("center")}>
              <i className="tb-ico tb-ico-quiet">
                <MoreGlyph kind="dots" uid="d-more" />
              </i>
              <span>Meer apps</span>
            </button>
          </nav>
        </div>
      </section>
    );
  }

  const ownChrome = app === "nieuws" || app === "dossier";
  return (
    <section className={`brief-app nx-work tb-shell os-shell os-in${ownChrome ? "" : " has-bar"}`} aria-label={LABELS[app]}>
      {!ownChrome && (
        <header className="tb-bar">
          <button className="tb-back" type="button" onClick={() => openApp("home")}>← Beginscherm</button>
          <strong>{LABELS[app]}</strong>
          {mailCue && app !== "outlook" && (
            <button className="nx-toast tb-note" type="button" onClick={() => openApp("outlook", "phish")}>
              Nieuw bericht in Outlook
            </button>
          )}
          {app === "outlook" && unread ? <em className="tb-inline-badge">1</em> : null}
          <div className="brief-user"><b>MV</b><span>Mara de Vries<small>Extern team</small></span></div>
        </header>
      )}
      <div className="brief-stage">
        <section className="nx-panel">
          {INTRANET.has(app) ? (
            <IntranetBody page={pageFor(app as Exclude<AppId, "home" | "center" | "social" | "chat" | "projecten" | "contacten" | "notities" | "helpdesk" | "security" | "instellingen">)} investigation={investigation} onJump={(target) => openApp(target)} focusId={focus} onOpenSource={openPiece} />
          ) : (
            <OfficeSuite
              app={app}
              investigation={investigation}
              focusId={focus}
              audio={audio}
              teamCode={teamCode}
              onToggleAudio={onToggleAudio}
              onOpen={(id: OsAppId) => openApp(id)}
              onOpenDoc={(id) => openPiece(id)}
              onPerson={openPerson}
            />
          )}
        </section>
      </div>
      <Dock day={dayNumber} badgeFor={badgeFor} onOpen={openApp} />
    </section>
  );
}

function hello(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

function Hello() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  return <strong>{hello(now)}, Mara</strong>;
}

function Dock({
  day,
  badgeFor,
  onOpen,
}: {
  day: number;
  badgeFor: (id: "outlook" | "crm" | "downloads" | "agenda" | "nieuws" | "dossier") => string;
  onOpen: (id: AppId) => void;
}) {
  return (
    <nav className="tb-dock" aria-label="Dock">
      {(["outlook", "crm", "agenda", "downloads", "nieuws", "dossier"] as const).map((id) => {
        const badge = badgeFor(id);
        return (
          <button key={id} className="tb-app" type="button" onClick={() => onOpen(id)}>
            <i className="tb-ico">
              <AppGlyph id={id} day={day} uid={`dock-${id}`} />
              {badge ? <em className="tb-badge">{badge}</em> : null}
            </i>
            <span>{id === "dossier" ? "Onderzoeksdossier" : LABELS[id]}</span>
          </button>
        );
      })}
      <button className="tb-app" type="button" aria-label="Meer apps" onClick={() => onOpen("center")}>
        <i className="tb-ico tb-ico-quiet">
          <MoreGlyph kind="dots" uid="dock-more" />
        </i>
        <span>Meer apps</span>
      </button>
    </nav>
  );
}
