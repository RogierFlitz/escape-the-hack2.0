import type { ReactNode } from "react";

const TONE: Record<string, [string, string]> = {
  outlook: ["#4DA3FF", "#0B66C3"],
  crm: ["#3DCE78", "#0E8A48"],
  downloads: ["#FFD86A", "#E09612"],
  agenda: ["#FFFFFF", "#E7EDF3"],
  nieuws: ["#5B92FF", "#1E56D9"],
  dossier: ["#FBFCFD", "#E7EEF5"],
  social: ["#4C8DFF", "#1A4FBF"],
  chat: ["#7C6CFF", "#3A2E9A"],
  projecten: ["#2EC5B6", "#0E7C86"],
  contacten: ["#F0A05A", "#C45A1A"],
  notities: ["#FFE08A", "#E2A51A"],
  helpdesk: ["#FF8A4A", "#D24B16"],
  security: ["#3DDC97", "#0E8A55"],
  instellingen: ["#9AA8B8", "#4E5D6E"],
  center: ["#F8FAFC", "#E4EAF1"],
};

export function OsIcon({ id, uid }: { id: string; uid: string }) {
  const [from, to] = TONE[id] ?? ["#8FB4D4", "#245C86"];
  const ink = id === "agenda" || id === "dossier" || id === "notities" || id === "center" ? "#24384e" : "#ffffff";
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${uid}-bg)`} />
      <g fill="none" stroke={ink} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        <Glyph id={id} />
      </g>
    </svg>
  );
}

function Glyph({ id }: { id: string }) {
  if (id === "outlook") return <path d="M14 24h36v20H14zM14 24l18 12 18-12" />;
  if (id === "crm" || id === "contacten") return <><circle cx="26" cy="24" r="6" /><circle cx="40" cy="26" r="4.5" /><path d="M14 46c1.2-7 5-10 12-10s10.8 3 12 10M34 46c.6-4 2.4-6.4 6-7" /></>;
  if (id === "downloads") return <path d="M12 26h40v18H12zM18 26V20h16l6 6" />;
  if (id === "agenda") return <><rect x="16" y="16" width="32" height="32" rx="4" /><path d="M16 26h32M24 12v8M40 12v8" /></>;
  if (id === "nieuws") return <><rect x="16" y="14" width="32" height="36" rx="3" /><path d="M22 22h10M22 30h20M22 36h20M22 42h14" /></>;
  if (id === "dossier") return <path d="M18 14h18l10 10v26H18zM36 14v10h10" />;
  if (id === "social") return <><rect x="14" y="16" width="36" height="28" rx="4" /><path d="M22 28h12M22 34h8" /></>;
  if (id === "chat") return <path d="M16 18h32v22H28l-8 8v-8h-4z" />;
  if (id === "projecten") return <><rect x="14" y="16" width="10" height="32" rx="2" /><rect x="27" y="16" width="10" height="22" rx="2" /><rect x="40" y="16" width="10" height="14" rx="2" /></>;
  if (id === "notities") return <><path d="M18 14h22l8 8v28H18z" /><path d="M24 28h16M24 34h16M24 40h10" /></>;
  if (id === "helpdesk") return <><circle cx="32" cy="28" r="10" /><path d="M22 28v4a4 4 0 0 0 4 4h2M42 28v4a4 4 0 0 1-4 4h-2M26 44h12" /></>;
  if (id === "security") return <path d="M32 12l16 6v12c0 10-7 16-16 20-9-4-16-10-16-20V18z" />;
  if (id === "instellingen") return <><circle cx="32" cy="32" r="6" /><path d="M32 16v4M32 44v4M16 32h4M44 32h4M20 20l3 3M41 41l3 3M44 20l-3 3M23 41l-3 3" /></>;
  return <path d="M32 18v28M18 32h28" />;
}

export function OsMark({ children }: { children: ReactNode }) {
  return <span className="os-mark">{children}</span>;
}
