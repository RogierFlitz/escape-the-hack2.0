"use client";

import { useEffect, useState } from "react";
import { puzzleCues } from "@/lib/game/content";
import { claims, sources } from "@/lib/game/footprint";
import { Mission1Briefing } from "./Briefing";
import { clearDraft, useDraft } from "./draft";
import { Mission1EvidenceBoard } from "./EvidenceBoard";
import type { DeskMode, FilterId, Pin } from "./meta";
import { Mission1SourceExplorer } from "./SourceExplorer";
import { Mission1Intro, Mission1SourceViewer } from "./SourceViewer";
import "./desk.css";

export function ArchivePuzzle({
  solved,
  busy,
  onSolve,
}: {
  solved: boolean;
  busy: boolean;
  onSolve: (payload: unknown) => void;
}) {
  const [pins, setPins] = useDraft<Pin[]>("ch1-bays", []);
  const [seen, setSeen] = useDraft<string[]>("ch1-bays-seen", []);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<DeskMode>("sources");
  const [linking, setLinking] = useState(false);
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [more, setMore] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const open = sources.find((source) => source.id === openId) ?? null;
  const cue = puzzleCues["ch1-bays"];
  const filled = claims.filter((item) => pins.some((pin) => pin.claim === item.id)).length;

  useEffect(() => {
    if (solved) clearDraft("ch1-bays");
  }, [solved]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function openSource(id: string, link = false) {
    setOpenId(id);
    setMode("sources");
    setLinking(link);
    setSeen((current) => (current.includes(id) ? current : [...current, id]));
  }

  function linkTo(claimId: string) {
    if (!open || solved) return;
    const label = claims.find((item) => item.id === claimId)?.label ?? "deze vraag";
    const already = pins.some((pin) => pin.id === open.id && pin.claim === claimId);
    if (!already) {
      setPins((current) => [
        ...current.filter((item) => item.id !== open.id && item.claim !== claimId),
        { id: open.id, claim: claimId },
      ]);
    }
    setLinking(false);
    setNotice(`Gekoppeld aan: ${label}`);
  }

  function unlink(claimId: string) {
    setPins((current) => current.filter((row) => row.claim !== claimId));
    setLinking(false);
    setNotice("Koppeling verwijderd");
  }

  return (
    <div className="m1-desk" data-mode={mode}>
      <Mission1Briefing
        filled={filled}
        total={claims.length}
        open={more}
        mode={mode}
        text={cue?.text}
        action={cue?.action}
        onToggle={() => setMore((value) => !value)}
        onMode={setMode}
      />
      {mode === "board" ? (
        <Mission1EvidenceBoard
          pins={pins}
          filled={filled}
          busy={busy}
          solved={solved}
          onOpen={(id) => openSource(id)}
          onRevise={(id) => openSource(id, true)}
          onUnlink={unlink}
          onSources={() => setMode("sources")}
          onSubmit={() => onSolve({ pins })}
        />
      ) : (
        <div className="m1-work">
          <Mission1SourceExplorer
            query={query}
            filter={filter}
            openId={openId}
            seen={seen}
            pins={pins}
            onQuery={setQuery}
            onFilter={setFilter}
            onOpen={openSource}
          />
          <div className="m1-stage">
            {open ? (
              <Mission1SourceViewer
                source={open}
                pins={pins}
                solved={solved}
                linking={linking}
                notice={notice}
                onToggleLink={() => setLinking((value) => !value)}
                onAssign={linkTo}
                onUnlink={unlink}
              />
            ) : (
              <Mission1Intro filled={filled} total={claims.length} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
