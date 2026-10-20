import { duckMusic, readVoiceVolume } from "./mix";

const VOICE_KEY = "eth-voice";
const SAMPLE = "Zo, daar zijn jullie dan. Jullie zijn te laat.";

export const voicePresets = [
  { id: "helder", label: "Helder", rate: 0.92, pitch: 0.92, rest: 480 },
  { id: "dreigend", label: "Dreigend", rate: 0.74, pitch: 0.86, rest: 1100 },
  { id: "hard", label: "Hard", rate: 1.04, pitch: 0.86, rest: 240 },
] as const;

export type VoicePresetId = (typeof voicePresets)[number]["id"];

const MALE = ["maarten", "frank", "daan", "xander", "ruben", "guy", "bart", "bram"];
const FEMALE = ["fenna", "fleur", "colette", "mara", "emma", "hanna", "claire", "sabrina"];

const KADE_VOICE = voicePresets.find((preset) => preset.id === "dreigend") ?? voicePresets[0];

let token = 0;
let active = "";
let pendingDone: (() => void) | null = null;
let bed: { stop: () => void } | null = null;
let previewGen = 0;

function startBed() {
  if (bed) return;
  const audio = new AudioContext();
  const low = audio.createOscillator();
  const grit = audio.createOscillator();
  const filter = audio.createBiquadFilter();
  const amp = audio.createGain();
  low.type = "sawtooth";
  grit.type = "square";
  low.frequency.value = 46;
  grit.frequency.value = 49;
  filter.type = "lowpass";
  filter.frequency.value = 120;
  low.connect(filter);
  grit.connect(filter);
  filter.connect(amp);
  amp.connect(audio.destination);
  const now = audio.currentTime;
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(0.04, now + 0.35);
  low.start(now);
  grit.start(now);
  let stopped = false;
  bed = {
    stop() {
      if (stopped) return;
      stopped = true;
      const at = audio.currentTime;
      amp.gain.cancelScheduledValues(at);
      amp.gain.setValueAtTime(Math.max(amp.gain.value, 0.0001), at);
      amp.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);
      low.stop(at + 0.3);
      grit.stop(at + 0.3);
      window.setTimeout(() => void audio.close(), 400);
    },
  };
}

function stopBed() {
  bed?.stop();
  bed = null;
}

function scoreVoice(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  if (!lang.startsWith("nl")) return -1;
  let score = lang.startsWith("nl-nl") ? 10 : 4;
  if (name.includes("natural") || name.includes("neural") || name.includes("premium")) score += 24;
  if (name.includes("online")) score += 6;
  if (MALE.some((part) => name.includes(part)) || /\bmale\b/.test(name)) score += 80;
  if (FEMALE.some((part) => name.includes(part)) || /\bfemale\b/.test(name)) score -= 70;
  return score;
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const voice of voices) {
    const score = scoreVoice(voice);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return best;
}

export function readVoicePreset(): VoicePresetId {
  if (typeof window === "undefined") return "helder";
  const saved = localStorage.getItem(VOICE_KEY);
  return voicePresets.some((preset) => preset.id === saved) ? (saved as VoicePresetId) : "helder";
}

export function voicePresetLabel(id: VoicePresetId) {
  return voicePresets.find((preset) => preset.id === id)?.label ?? "Helder";
}

export function narratorName() {
  if (typeof window === "undefined" || !window.speechSynthesis) return "Standaardstem";
  return pickVoice()?.name ?? "Standaardstem van dit apparaat";
}

function applyVoice(utterance: SpeechSynthesisUtterance, threat = false) {
  const preset = threat ? KADE_VOICE : (voicePresets.find((item) => item.id === readVoicePreset()) ?? voicePresets[0]);
  const voice = pickVoice();
  utterance.lang = voice?.lang || "nl-NL";
  if (voice) utterance.voice = voice;
  utterance.rate = preset.rate;
  utterance.pitch = preset.pitch;
  utterance.volume = readVoiceVolume() / 100;
  return preset;
}

export function deviceVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("nl"))
    .map((voice) => ({ name: voice.name, lang: voice.lang }));
}

export function previewVoice(id: VoicePresetId, voiceName?: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  localStorage.setItem(VOICE_KEY, id);
  window.dispatchEvent(new Event("eth-voice"));
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(SAMPLE);
  const threat = id === "dreigend" && !voiceName;
  applyVoice(utterance, threat);
  if (voiceName) {
    const chosen = synth.getVoices().find((voice) => voice.name === voiceName);
    if (chosen) {
      utterance.voice = chosen;
      utterance.lang = chosen.lang;
    }
  }
  const mine = ++previewGen;
  if (threat) {
    stopBed();
    startBed();
  } else stopBed();
  const done = () => {
    if (mine === previewGen) stopBed();
  };
  utterance.onend = done;
  utterance.onerror = done;
  synth.speak(utterance);
}

export function previewKade() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const mine = ++previewGen;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(SAMPLE);
  applyVoice(utterance, true);
  stopBed();
  startBed();
  const done = () => {
    if (mine === previewGen) stopBed();
  };
  utterance.onend = done;
  utterance.onerror = done;
  synth.speak(utterance);
}

export function narrateHoldMs(text: string) {
  const chars = Math.max(24, text.trim().length);
  return Math.round((chars / 8) * 1000 + 1800);
}

export function stopNarration() {
  token += 1;
  active = "";
  pendingDone = null;
  stopBed();
  duckMusic(false);
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

export function narrate(line: string, audio: boolean, onDone?: () => void, threat = false) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const text = line.trim();
  if (!audio || !text) {
    stopNarration();
    return;
  }
  if (text === active) {
    if (onDone) pendingDone = onDone;
    return;
  }
  if (threat) previewGen += 1;
  else stopBed();
  const mine = ++token;
  active = text;
  pendingDone = onDone ?? null;
  let started = false;
  let settled = false;
  const finish = () => {
    if (settled || mine !== token) return;
    settled = true;
    const next = pendingDone;
    pendingDone = null;
    active = "";
    const preset = threat ? KADE_VOICE : (voicePresets.find((item) => item.id === readVoicePreset()) ?? voicePresets[0]);
    if (!threat) stopBed();
    duckMusic(false);
    window.setTimeout(() => {
      if (mine !== token) return;
      next?.();
    }, preset.rest);
  };
  const start = () => {
    if (mine !== token || started) return;
    started = true;
    const synth = window.speechSynthesis;
    synth.cancel();
    window.setTimeout(() => {
      if (mine !== token) return;
      const utterance = new SpeechSynthesisUtterance(text);
      applyVoice(utterance, threat);
      duckMusic(true);
      if (threat) startBed();
      utterance.onend = finish;
      utterance.onerror = (event) => {
        if (event.error === "interrupted" || event.error === "canceled") return;
        finish();
      };
      synth.speak(utterance);
      const startedAt = Date.now();
      const watch = () => {
        if (mine !== token || settled) return;
        const stuck = Date.now() - startedAt > narrateHoldMs(text) * 2.2;
        if (!stuck && (synth.speaking || synth.pending)) {
          window.setTimeout(watch, 350);
          return;
        }
        finish();
      };
      window.setTimeout(watch, narrateHoldMs(text));
    }, 60);
  };
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", start, { once: true });
    window.setTimeout(start, 300);
    return;
  }
  start();
}
