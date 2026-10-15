"use client";

import { useState } from "react";
import { backups, sessions, socialPosts } from "@/lib/game/story";
import type { Token } from "@/lib/types";
import { SealPuzzle, ShutdownPuzzle } from "./puzzles/late";

export function SocialBoard({ busy, onSubmit }: { busy: boolean; onSubmit: (ids: string[]) => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  function toggle(id: string) {
    setPicked((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 5 ? current : [...current, id]);
  }
  return (
    <div className="stack">
      <p className="kicker">Missie 1 · Digital Footprint</p>
      <h2>Openbaar archief</h2>
      <p>KADE verzamelde dit vóór de aanval. Markeer de vijf berichten die een naam, een bijeenkomst, een plaats of een partner prijsgeven.</p>
      <div className="feed">
        {socialPosts.map((post) => (
          <button key={post.id} type="button" className={picked.includes(post.id) ? "post on" : "post"} onClick={() => toggle(post.id)}>
            <small>{post.source}</small>
            <strong>{post.text}</strong>
          </button>
        ))}
      </div>
      <button className="btn btn-primary" type="button" disabled={busy || picked.length !== 5} onClick={() => onSubmit(picked)}>
        Dit zijn de vijf sporen
      </button>
    </div>
  );
}

export function BackupBoard({ busy, onSubmit }: { busy: boolean; onSubmit: (id: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="stack">
      <p className="kicker">Onderzoek · back-ups</p>
      <h2>Welke kopie is nog schoon?</h2>
      <p>KADE versleutelde wat aan het netwerk hing. Kies de kopie die hij niet kon bereiken.</p>
      {backups.map((item) => (
        <button key={item.id} type="button" className={picked === item.id ? "token on" : "token"} onClick={() => setPicked(item.id)}>
          <strong>{item.title}</strong>
          <small>{item.detail}</small>
        </button>
      ))}
      <button className="btn btn-primary" type="button" disabled={busy || !picked} onClick={() => picked && onSubmit(picked)}>Deze back-up terugzetten</button>
    </div>
  );
}

export function FinaleBoard({
  step,
  busy,
  inventory,
  onAccess,
  onRevoke,
  onBackup,
  onSolve,
}: {
  step: "access" | "revoke" | "backup-check" | "seals" | "shutdown";
  busy: boolean;
  inventory: Token[];
  onAccess: (id: string) => void;
  onRevoke: () => void;
  onBackup: () => void;
  onSolve: (payload: unknown) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="stack">
      <p className="kicker">Finale · laatste toegang</p>
      {step === "access" && (
        <>
          <h2>Welke sessie is van KADE?</h2>
          <p>Drie sessies staan nog open. Eén daarvan is zijn deur terug.</p>
          {sessions.map((item) => (
            <button key={item.id} type="button" className={picked === item.id ? "token on" : "token"} onClick={() => setPicked(item.id)}>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </button>
          ))}
          <button className="btn btn-primary" type="button" disabled={busy || !picked} onClick={() => picked && onAccess(picked)}>Sessie aanwijzen</button>
        </>
      )}
      {step === "revoke" && (
        <>
          <h2>Trek de sessie in</h2>
          <p>helix-svc op de export-node is nog ingelogd. Zolang die openstaat, kan hij terug.</p>
          <button className="btn btn-primary" type="button" disabled={busy} onClick={onRevoke}>Sessie intrekken</button>
        </>
      )}
      {step === "seals" && (
        <>
          <h2>Zet de beveiliging terug</h2>
          <p>Leg elk gevonden zegel op het systeem dat ernaar vraagt.</p>
          <SealPuzzle solved={false} busy={busy} inventory={inventory} onSolve={onSolve} />
        </>
      )}
      {step === "backup-check" && (
        <>
          <h2>Controleer de kluis</h2>
          <p>De nachtelijke kluis stond los van het netwerk. Bevestig dat dit de kopie is die je terugzet.</p>
          <button className="btn btn-primary" type="button" disabled={busy} onClick={onBackup}>Kluisbackup bevestigen</button>
        </>
      )}
      {step === "shutdown" && (
        <>
          <h2>Geef het systeem vrij</h2>
          <p>Zet de ontdekkingen in de volgorde van de aanval en sluit KADE buiten.</p>
          <ShutdownPuzzle solved={false} busy={busy} inventory={inventory} onSolve={onSolve} />
        </>
      )}
    </div>
  );
}
