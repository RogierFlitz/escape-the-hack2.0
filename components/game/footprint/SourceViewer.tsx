"use client";

import { claims, type Source } from "@/lib/game/footprint";
import { asSector } from "@/lib/game/sector";
import { useSector } from "../SectorSkin";
import { Mission1CaseFile } from "./CaseFile";
import { initials, sourcePhoto, typeLabel, type Pin } from "./meta";

function useShown(source: Source): Source {
  const sector = useSector();
  return {
    ...source,
    title: asSector(sector, source.title),
    author: asSector(sector, source.author),
    body: asSector(sector, source.body),
    outlet: asSector(sector, source.outlet),
  };
}

export function Mission1Intro({
  filled,
  total,
}: {
  filled: number;
  total: number;
}) {
  const sector = useSector();
  return (
    <section className="m1-intro" aria-label="Onderzoeksintroductie">
      <img src="/nora/hq.jpg" alt="" />
      <div>
        <p className="m1-kicker">Openbaar archief</p>
        <h2>Onderzoek wat KADE openbaar vond</h2>
        <p>{asSector(sector, "KADE verzamelde openbare informatie over Nexora. Kies links een bron, lees hem, en koppel hem aan één van de zes vragen.")}</p>
        <ol>
          <li>Open een bron.</li>
          <li>Koppel die bron aan een vraag.</li>
          <li>Controleer de lijnen via Onderzoeksbord. Nu {filled}/{total}.</li>
        </ol>
      </div>
    </section>
  );
}

export function Mission1SourceViewer({
  source,
  pins,
  solved,
  linking,
  notice,
  onToggleLink,
  onAssign,
  onUnlink,
}: {
  source: Source;
  pins: Pin[];
  solved: boolean;
  linking: boolean;
  notice: string | null;
  onToggleLink: () => void;
  onAssign: (claimId: string) => void;
  onUnlink: (claimId: string) => void;
}) {
  const sector = useSector();
  const linked = pins.find((pin) => pin.id === source.id);
  const claim = claims.find((item) => item.id === linked?.claim);
  const photo = sourcePhoto[source.id];

  return (
    <article className={`m1-view view-${source.kind}`} data-linking={linking ? "true" : "false"} aria-label="Bron">
      <header>
        <span>{typeLabel[source.kind]}</span>
      </header>
      <div className="m1-split">
      <div className="m1-read">
        {source.kind === "post" ? (
          <Social source={source} photo={photo} />
        ) : source.kind === "profiel" ? (
          <Profile source={source} />
        ) : source.kind === "foto" ? (
          <Photo source={source} photo={photo} />
        ) : source.kind === "partner" ? (
          <Partner source={source} photo={photo} />
        ) : (
          <Article source={source} photo={photo} />
        )}
      </div>
      {linking && !solved && (
        <Mission1CaseFile
          sourceId={source.id}
          pins={pins}
          solved={solved}
          onAssign={onAssign}
          onUnlink={onUnlink}
          onClose={onToggleLink}
        />
      )}
      </div>
      <footer>
        <p>
          {claim ? `Gekoppeld aan: ${asSector(sector, claim.label)}` : "Nog niet gekoppeld aan een vraag."}
          <span className="m1-cite">Bron: {asSector(sector, source.outlet)}</span>
        </p>
        {notice && <p className="m1-note" role="status">{notice}</p>}
        {!solved && (
          <button className="m1-link-btn" type="button" aria-expanded={linking} onClick={onToggleLink}>
            {claim ? "Koppeling wijzigen" : "Koppel aan dossier"}
          </button>
        )}
      </footer>
    </article>
  );
}

function Article({ source: raw, photo }: { source: Source; photo?: string }) {
  const source = useShown(raw);
  const paper = source.kind === "nieuws";
  return (
    <div className={paper ? "m1-paper" : "m1-memo"}>
      <p className="m1-kicker">{paper ? "Nieuwsartikel" : "Bedrijfsbericht"} · {source.outlet}</p>
      <h2>{source.title}</h2>
      <p className="m1-by">{source.author} · {source.when}</p>
      {photo && <img src={photo} alt="" />}
      <p>{source.body}</p>
    </div>
  );
}

function Social({ source: raw, photo }: { source: Source; photo?: string }) {
  const source = useShown(raw);
  return (
    <div className="m1-social">
      <div className="m1-who">
        <span aria-hidden>{initials(source.author)}</span>
        <div>
          <strong>{source.author}</strong>
          <small>{source.when} · {source.outlet}</small>
        </div>
        {source.audience && <em>{source.audience}</em>}
      </div>
      <h2>{source.title}</h2>
      <p>{source.body}</p>
      {photo && <img src={photo} alt="" />}
    </div>
  );
}

function Profile({ source: raw }: { source: Source }) {
  const source = useShown(raw);
  return (
    <div className="m1-profile">
      <span aria-hidden>{initials(source.title)}</span>
      <div>
        <p className="m1-kicker">{source.outlet}</p>
        <h2>{source.title}</h2>
        <p className="m1-by">{source.author} · {source.when}</p>
        <p>{source.body}</p>
      </div>
    </div>
  );
}

function Photo({ source: raw, photo }: { source: Source; photo?: string }) {
  const source = useShown(raw);
  return (
    <div className="m1-photo">
      <p className="m1-kicker">{typeLabel.foto} · {source.outlet}</p>
      <h2>{source.title}</h2>
      <p className="m1-by">{source.author} · {source.when}</p>
      {photo && <img src={photo} alt="" />}
      <p>{source.body}</p>
    </div>
  );
}

function Partner({ source: raw, photo }: { source: Source; photo?: string }) {
  const source = useShown(raw);
  return (
    <div className="m1-partner">
      <p className="m1-kicker">Partnervermelding · {source.outlet}</p>
      {photo && <img src={photo} alt="" />}
      <h2>{source.title}</h2>
      <p className="m1-by">{source.author} · {source.when}</p>
      <p>{source.body}</p>
    </div>
  );
}
