"use client";

import { useEffect, useRef, useState } from "react";
import { mediaSlots } from "@/lib/game/media";
import { readFxVolume, readMusicVolume, readVoiceVolume, setMixVolume } from "../game/mix";
import { previewFragment, readSoundSet, setSoundSet, soundFragments, soundSets, type SoundSetId } from "../game/audio";
import { deviceVoices, previewKade, previewVoice, readVoicePreset, stopNarration, voicePresets, type VoicePresetId } from "../game/narrate";

const BLURB: Record<SoundSetId, string> = {
  bureau: "Zacht signaal op de werkvloer.",
  crisis: "Scherper. Dit is een alarm.",
  kade: "Laag, traag en dichtbij.",
};

export function SoundDesk() {
  const player = useRef<HTMLAudioElement | null>(null);
  const token = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [activeSet, chooseSet] = useState<SoundSetId>("bureau");
  const [voiceId, chooseVoice] = useState<VoicePresetId>("helder");
  const [voices, setVoices] = useState<{ name: string; lang: string }[]>([]);
  const [music, setMusicVolume] = useState(40);
  const [voice, setVoiceVolume] = useState(100);
  const [fx, setFxVolume] = useState(70);

  useEffect(() => {
    const syncSet = () => chooseSet(readSoundSet());
    const syncVoice = () => chooseVoice(readVoicePreset());
    const read = () => setVoices(deviceVoices());
    const syncMix = () => {
      setMusicVolume(readMusicVolume());
      setVoiceVolume(readVoiceVolume());
      setFxVolume(readFxVolume());
    };
    syncSet();
    syncVoice();
    syncMix();
    read();
    window.addEventListener("eth-mix", syncMix);
    window.addEventListener("eth-sound-set", syncSet);
    window.addEventListener("eth-voice", syncVoice);
    window.speechSynthesis?.addEventListener("voiceschanged", read);
    return () => {
      window.removeEventListener("eth-mix", syncMix);
      window.removeEventListener("eth-sound-set", syncSet);
      window.removeEventListener("eth-voice", syncVoice);
      window.speechSynthesis?.removeEventListener("voiceschanged", read);
    };
  }, []);

  function hush() {
    token.current += 1;
    player.current?.pause();
    setPlaying(false);
    stopNarration();
  }

  function playMara() {
    hush();
    const mine = ++token.current;
    const audio = player.current ?? new Audio("/mara-intro.mp4?v=20");
    player.current = audio;
    audio.playbackRate = 0.94;
    audio.currentTime = 0;
    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    window.setTimeout(() => {
      if (mine !== token.current) return;
      audio.pause();
      setPlaying(false);
    }, 20000);
  }

  return (
    <div className="gcc-hear">
      <h2>Stemmen en geluid</h2>
      <p className="gcc-note">Eerst de korte signalen uit het spel. Kies een klank, tik daarna een geluidje. Daaronder staan de stemmen.</p>
      <h3>Geluidjes</h3>
      <div className="gcc-row" role="group" aria-label="Klank van de geluidjes">
        {soundSets.map((set) => (
          <button key={set.id} className={`gcc-btn${set.id === activeSet ? " primary" : ""}`} type="button" aria-pressed={set.id === activeSet} onClick={() => { hush(); setSoundSet(set.id, false); previewFragment(set.id, "incoming"); }}>{set.label}</button>
        ))}
        <button className="gcc-btn" type="button" onClick={() => { hush(); const cue = new Audio("/audio/secure-connect.wav"); cue.volume = 0.7; void cue.play(); }}>Lijn open</button>
      </div>
      <div className="gcc-row" role="group" aria-label={`Geluidjes van ${activeSet}`}>
        {soundFragments.map((fragment) => (
          <button key={fragment.id} className="gcc-btn" type="button" onClick={() => { hush(); setSoundSet(activeSet, false); previewFragment(activeSet, fragment.id); }}>{fragment.label}</button>
        ))}
      </div>
      <p className="gcc-note">{BLURB[activeSet]}</p>
      <h3>Stemmen</h3>
      <div className="gcc-row" role="group" aria-label="Stemmen">
        {voicePresets.map((preset) => (
          <button key={preset.id} className={`gcc-btn${preset.id === voiceId ? " primary" : ""}`} type="button" aria-pressed={preset.id === voiceId} onClick={() => { hush(); previewVoice(preset.id); }}>{preset.label}</button>
        ))}
        <button className={`gcc-btn${playing ? " primary" : ""}`} type="button" onClick={() => (playing ? hush() : playMara())}>{playing ? "Stop Mara" : "Mara"}</button>
      </div>
      {voices.length > 0 && (
        <>
          <h3>Stemmen op dit apparaat</h3>
          <div className="gcc-row" role="group" aria-label="Geïnstalleerde stemmen">
            {voices.map((voice) => (
              <button key={voice.name} className="gcc-btn" type="button" onClick={() => { hush(); previewVoice(voiceId, voice.name); }}>{voice.name}</button>
            ))}
          </div>
        </>
      )}
      <h3>Audiofragmenten</h3>
      <div className="gcc-decks">
        {soundSets.map((set) => (
          <section key={set.id} className={`gcc-deck ${set.id}${set.id === activeSet ? " on" : ""}`}>
            <header>
              <div>
                <h3>{set.label}</h3>
                <p>{BLURB[set.id]}</p>
              </div>
              <div className="gcc-deck-mark">
                {set.id === activeSet && <em>Gekozen</em>}
                {set.id === "kade" && <button className="gcc-btn bad" type="button" onClick={() => { hush(); previewKade(); }}>Hoor KADE</button>}
              </div>
            </header>
            <div className="gcc-keys" role="group" aria-label={`Fragmenten van ${set.label}`}>
              {soundFragments.map((fragment) => (
                <button key={fragment.id} type="button" onClick={() => { hush(); setSoundSet(set.id, false); previewFragment(set.id, fragment.id); }}>{fragment.label}</button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <h3>Volume</h3>
      <div className="gcc-vols">
        <label>Muziek <input type="range" min={0} max={100} value={music} onChange={(event) => { const value = Number(event.target.value); setMusicVolume(value); setMixVolume("music", value); }} /></label>
        <label>Stem <input type="range" min={0} max={100} value={voice} onChange={(event) => { const value = Number(event.target.value); setVoiceVolume(value); setMixVolume("voice", value); }} /></label>
        <label>Effecten <input type="range" min={0} max={100} value={fx} onChange={(event) => { const value = Number(event.target.value); setFxVolume(value); setMixVolume("fx", value); }} /></label>
      </div>
      <p className="gcc-note">Tijdens gesproken tekst zakt de muziek vanzelf. Zonder audiobestand blijft de apparaatstem het woord doen.</p>
      <h3>Bestanden voor later</h3>
      <ul className="gcc-slots">
        {mediaSlots.map((slot) => (
          <li key={slot.id}><strong>{slot.role}</strong><span>{slot.path ? "aanwezig" : "wacht op bestand"}</span><small>{slot.note}</small></li>
        ))}
      </ul>
    </div>
  );
}
