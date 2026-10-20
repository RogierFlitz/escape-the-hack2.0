"use client";

import { useEffect, useState } from "react";
import { readSoundSet, setSoundSet, soundSetLabel, soundSets, type SoundSetId } from "./audio";
import { previewVoice, readVoicePreset, voicePresetLabel, voicePresets, type VoicePresetId } from "./narrate";

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

export function VoiceButton({ className }: { className: string }) {
  const [id, setId] = useState<VoicePresetId>("helder");
  useEffect(() => {
    const sync = () => setId(readVoicePreset());
    sync();
    window.addEventListener("eth-voice", sync);
    return () => window.removeEventListener("eth-voice", sync);
  }, []);
  const label = voicePresetLabel(id);
  return (
    <button
      className={className}
      type="button"
      aria-label={`Stem ${label}. Tik om een andere stem te horen.`}
      onClick={() => {
        const index = voicePresets.findIndex((preset) => preset.id === id);
        const next = voicePresets[(index + 1) % voicePresets.length];
        previewVoice(next.id);
      }}
    >
      Stem {label}
    </button>
  );
}
