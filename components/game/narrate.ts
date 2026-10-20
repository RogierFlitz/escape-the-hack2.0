const RATE = 0.94;
const REST_MS = 380;
const MALE = ["maarten", "frank", "daan", "xander", "ruben", "guy", "bart", "bram"];
const FEMALE = ["fenna", "fleur", "colette", "mara", "emma", "hanna", "claire", "sabrina"];

let token = 0;
let active = "";
let pendingDone: (() => void) | null = null;

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

export function narrateHoldMs(text: string) {
  const chars = Math.max(24, text.trim().length);
  return Math.round((chars / 8) * 1000 + 1800);
}

export function stopNarration() {
  token += 1;
  active = "";
  pendingDone = null;
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

export function narrate(line: string, audio: boolean, onDone?: () => void) {
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
    window.setTimeout(() => {
      if (mine !== token) return;
      next?.();
    }, REST_MS);
  };
  const start = () => {
    if (mine !== token || started) return;
    started = true;
    const synth = window.speechSynthesis;
    synth.cancel();
    window.setTimeout(() => {
      if (mine !== token) return;
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      const name = voice?.name.toLowerCase() ?? "";
      const male = MALE.some((part) => name.includes(part)) || /\bmale\b/.test(name);
      const natural = /natural|neural|premium/i.test(name);
      utterance.lang = voice?.lang || "nl-NL";
      if (voice) utterance.voice = voice;
      utterance.rate = RATE;
      utterance.pitch = male ? (natural ? 0.74 : 0.68) : 0.62;
      utterance.volume = 1;
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
