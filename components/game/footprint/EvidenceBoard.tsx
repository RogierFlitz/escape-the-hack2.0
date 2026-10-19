"use client";

import { claims, sources } from "@/lib/game/footprint";
import { sourcePhoto, typeLabel, type Pin } from "./meta";

export function Mission1EvidenceBoard({
  pins,
  filled,
  busy,
  solved,
  onOpen,
  onRevise,
  onUnlink,
  onSources,
  onSubmit,
}: {
  pins: Pin[];
  filled: number;
  busy: boolean;
  solved: boolean;
  onOpen: (id: string) => void;
  onRevise: (id: string) => void;
  onUnlink: (claimId: string) => void;
  onSources: () => void;
  onSubmit: () => void;
}) {
  return (
    <section className="m1-board" aria-label="Onderzoeksbord">
      <header>
        <div>
          <p>Onderzoeksbord</p>
          <span>Een lijn is een koppeling, nog geen oordeel.</span>
        </div>
        <strong>{filled}/{claims.length} verbanden</strong>
        <button className="m1-submit" type="button" disabled={busy || solved} onClick={onSubmit}>Verbanden indienen</button>
      </header>
      <div className="m1-map">
        {claims.map((claim, index) => {
          const pin = pins.find((row) => row.claim === claim.id);
          const source = sources.find((row) => row.id === pin?.id);
          const photo = source ? sourcePhoto[source.id] : undefined;
          return (
            <div key={claim.id} className={`m1-row${source ? " linked" : ""}${solved ? " done" : ""}`}>
              {source ? (
                <button type="button" className="m1-chip" onClick={() => onOpen(source.id)}>
                  {photo ? <img src={photo} alt="" /> : <span aria-hidden>{typeLabel[source.kind].slice(0, 1)}</span>}
                  <span>
                    <small>{typeLabel[source.kind]}</small>
                    <strong>{source.title}</strong>
                  </span>
                </button>
              ) : (
                <button type="button" className="m1-chip empty" onClick={onSources}>Nog geen bron</button>
              )}
              <span className="m1-wire" aria-hidden />
              <article>
                <small>{index + 1}. {solved ? "Vastgelegd" : source ? "Gekoppeld" : "Open"}</small>
                <strong>{claim.label}</strong>
                {source && (
                  <div>
                    <button type="button" onClick={() => onOpen(source.id)}>Bekijk</button>
                    {!solved && <button type="button" onClick={() => onRevise(source.id)}>Wijzig</button>}
                    {!solved && <button type="button" onClick={() => onUnlink(claim.id)}>Los</button>}
                  </div>
                )}
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
