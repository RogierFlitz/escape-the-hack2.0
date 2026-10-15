"use client";

import type { Token } from "@/lib/types";
import { ArchivePuzzle, BoardPuzzle, PhotoPuzzle, ReconPuzzle } from "../Footprint";
import { SupplierDesk } from "../Supplier";
import { NetworkDesk } from "../Network";
import { RecoveryDesk } from "../Recovery";
import { InsiderDesk } from "../Insider";
import { SealPuzzle, ShutdownPuzzle } from "./late";

export function PuzzleStage({
  id,
  solved,
  busy,
  inventory,
  onSolve,
  onOpenFile,
  training = false,
  priorityDone = false,
  priorityText = "",
  onPriority,
}: {
  id: string;
  solved: boolean;
  busy: boolean;
  inventory: Token[];
  onSolve: (payload: unknown) => void;
  onOpenFile: (fileId: string) => void;
  training?: boolean;
  priorityDone?: boolean;
  priorityText?: string;
  onPriority?: (choice: string) => void;
}) {
  const props = { solved, busy, onSolve };
  switch (id) {
    case "ch1-bays":
      return <ArchivePuzzle {...props} />;
    case "ch1-login":
      return <PhotoPuzzle {...props} />;
    case "ch1-nodes":
      return <BoardPuzzle {...props} />;
    case "ch1-ports":
      return <ReconPuzzle {...props} />;
    case "ch2-acrostic":
    case "ch2-meta":
    case "ch2-timeline":
    case "ch2-trace":
      return <SupplierDesk puzzleId={id} solved={solved} busy={busy} onSolve={onSolve} />;
    case "ch3-path":
    case "ch3-logic":
    case "ch3-cables":
    case "ch3-boot":
      return <NetworkDesk puzzleId={id} solved={solved} busy={busy} onSolve={onSolve} />;
    case "ch4-symbols":
    case "ch4-sequence":
    case "ch4-rotor":
    case "ch4-backup":
    case "ch4-decode":
      return <RecoveryDesk puzzleId={id} solved={solved} busy={busy} inventory={inventory} onSolve={onSolve} training={training} priorityDone={priorityDone} priorityText={priorityText} onPriority={onPriority} />;
    case "ch5-camera":
    case "ch5-places":
    case "ch5-share":
    case "ch5-accuse":
      return <InsiderDesk puzzleId={id} solved={solved} busy={busy} onSolve={onSolve} />;
    case "ch6-seals":
      return <SealPuzzle {...props} inventory={inventory} />;
    case "ch6-shutdown":
      return <ShutdownPuzzle {...props} inventory={inventory} />;
    default:
      return <p>Deze opdracht is niet beschikbaar.</p>;
  }
}
