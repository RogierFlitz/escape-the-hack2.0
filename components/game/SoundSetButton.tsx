"use client";

import { useEffect, useState } from "react";
import { readSoundSet, setSoundSet, soundSetLabel, soundSets, type SoundSetId } from "./audio";

export function SoundSetButton({ className }: { className: string }) {
  const [id, setId] = useState<SoundSetId>("bureau");
  useEffect(() => {
    const sync = () => setId(readSoundSet());
    sync();
    window.addEventListener("eth-sound-set", sync);
    return () => window.removeEventListener("eth-sound-set", sync);
  }, []);
  const label = soundSetLabel(id);
  return (
    <button
      className={className}
      type="button"
      aria-label={`Soundset ${label}. Tik voor een andere set.`}
      onClick={() => {
        const index = soundSets.findIndex((set) => set.id === id);
        const next = soundSets[(index + 1) % soundSets.length];
        setSoundSet(next.id);
      }}
    >
      {label}
    </button>
  );
}
