"use client";

import { claims, sources } from "@/lib/game/footprint";
import type { Pin } from "./meta";

export function Mission1CaseFile({
  sourceId,
  pins,
  solved,
  onAssign,
  onUnlink,
  onClose,
}: {
  sourceId: string;
  pins: Pin[];
  solved: boolean;
  onAssign: (claimId: string) => void;
  onUnlink: (claimId: string) => void;
  onClose: () => void;
}) {
  const mine = pins.find((pin) => pin.id === sourceId);

  return (
    <div className="m1-pick" role="group" aria-label="Koppel aan een vraag">
      <header>
        <strong>Koppel aan dossier</strong>
        <button type="button" onClick={onClose}>Sluiten</button>
      </header>
      <div className="m1-pick-list">
        {claims.map((claim, index) => {
          const pin = pins.find((row) => row.claim === claim.id);
          const owner = sources.find((row) => row.id === pin?.id);
          const current = pin?.id === sourceId;
          return (
            <button
              key={claim.id}
              type="button"
              className={current ? "mine" : owner ? "taken" : ""}
              disabled={solved}
              onClick={() => onAssign(claim.id)}
            >
              <small>{index + 1}. {current ? "deze bron" : owner ? "bezet" : "open"}</small>
              <strong>{claim.label}</strong>
            </button>
          );
        })}
      </div>
      {mine && !solved && (
        <button className="m1-unlink" type="button" onClick={() => onUnlink(mine.claim)}>Verwijderen</button>
      )}
    </div>
  );
}
