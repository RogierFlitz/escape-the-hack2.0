let ctx: AudioContext | null = null;

const SET_KEY = "eth-sound-set";

export const soundSets = [
  { id: "bureau", label: "Bureau" },
  { id: "crisis", label: "Crisis" },
  { id: "kade", label: "KADE" },
] as const;

export type SoundSetId = (typeof soundSets)[number]["id"];

type Wave = OscillatorType;
type Note = [number, number, Wave, number, number?];

const cues: Record<SoundSetId, Record<string, Note[]>> = {
  bureau: {
    click: [[640, 0.03, "sine", 0.03]],
    alert: [[392, 0.12, "sine", 0.03], [330, 0.16, "sine", 0.025, 0.12]],
    ok: [[523, 0.08, "sine", 0.035], [784, 0.14, "sine", 0.03, 0.08]],
    glitch: [[180, 0.08, "triangle", 0.02], [240, 0.06, "triangle", 0.015, 0.08]],
    lock: [[360, 0.05, "sine", 0.03], [280, 0.08, "sine", 0.02, 0.06]],
    incoming: [[440, 0.08, "sine", 0.03], [554, 0.1, "sine", 0.028, 0.12], [659, 0.14, "sine", 0.025, 0.24]],
    secure: [[392, 0.16, "sine", 0.022], [523, 0.22, "sine", 0.018, 0.14], [659, 0.18, "sine", 0.012, 0.32]],
    message: [[680, 0.06, "sine", 0.03], [910, 0.09, "sine", 0.025, 0.07]],
    win: [[523, 0.16, "sine", 0.03], [659, 0.16, "sine", 0.03, 0.14], [784, 0.22, "sine", 0.028, 0.28]],
    lose: [[330, 0.18, "sine", 0.03], [262, 0.2, "sine", 0.028, 0.16], [196, 0.26, "sine", 0.025, 0.32]],
  },
  crisis: {
    click: [[880, 0.025, "square", 0.02]],
    alert: [[220, 0.1, "sawtooth", 0.03], [160, 0.14, "square", 0.028, 0.1], [220, 0.1, "sawtooth", 0.025, 0.22]],
    ok: [[660, 0.06, "square", 0.025], [990, 0.1, "square", 0.022, 0.07]],
    glitch: [[90, 0.05, "sawtooth", 0.03], [140, 0.04, "square", 0.025, 0.05], [70, 0.08, "sawtooth", 0.02, 0.1]],
    lock: [[180, 0.04, "square", 0.035], [90, 0.08, "square", 0.03, 0.05]],
    incoming: [[740, 0.08, "square", 0.025], [620, 0.1, "square", 0.025, 0.1], [740, 0.12, "square", 0.022, 0.22]],
    secure: [[300, 0.08, "square", 0.02], [480, 0.1, "square", 0.02, 0.1], [720, 0.14, "square", 0.018, 0.22]],
    message: [[988, 0.05, "square", 0.025], [988, 0.07, "square", 0.02, 0.08]],
    win: [[523, 0.1, "square", 0.025], [659, 0.1, "square", 0.025, 0.1], [784, 0.1, "square", 0.025, 0.2], [1046, 0.18, "square", 0.022, 0.3]],
    lose: [[220, 0.14, "sawtooth", 0.03], [174, 0.16, "sawtooth", 0.028, 0.12], [130, 0.22, "sawtooth", 0.025, 0.26]],
  },
  kade: {
    click: [[110, 0.05, "sawtooth", 0.03]],
    alert: [[73, 0.22, "sawtooth", 0.035], [55, 0.28, "square", 0.03, 0.18]],
    ok: [[196, 0.1, "triangle", 0.035], [247, 0.16, "triangle", 0.03, 0.1]],
    glitch: [[48, 0.1, "sawtooth", 0.04], [36, 0.14, "square", 0.03, 0.08], [62, 0.08, "sawtooth", 0.025, 0.18]],
    lock: [[98, 0.08, "square", 0.035], [65, 0.14, "sawtooth", 0.03, 0.08]],
    incoming: [[146, 0.16, "sawtooth", 0.03], [110, 0.18, "square", 0.028, 0.16], [82, 0.24, "sawtooth", 0.025, 0.34]],
    secure: [[130, 0.18, "triangle", 0.03], [164, 0.2, "triangle", 0.025, 0.16], [196, 0.24, "triangle", 0.02, 0.34]],
    message: [[220, 0.08, "triangle", 0.035], [165, 0.12, "sawtooth", 0.025, 0.09]],
    win: [[110, 0.16, "triangle", 0.03], [165, 0.16, "triangle", 0.03, 0.16], [220, 0.28, "triangle", 0.028, 0.32]],
    lose: [[55, 0.24, "sawtooth", 0.035], [49, 0.28, "sawtooth", 0.03, 0.2], [41, 0.36, "square", 0.025, 0.42]],
  },
};

export function soundOn() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("eth-sound") === "on";
}

export function setSound(on: boolean) {
  localStorage.setItem("eth-sound", on ? "on" : "off");
  if (on) context();
}

export function readSoundSet(): SoundSetId {
  if (typeof window === "undefined") return "bureau";
  const saved = localStorage.getItem(SET_KEY);
  return soundSets.some((set) => set.id === saved) ? (saved as SoundSetId) : "bureau";
}

export function soundSetLabel(id: SoundSetId) {
  return soundSets.find((set) => set.id === id)?.label ?? "Bureau";
}

export function setSoundSet(id: SoundSetId) {
  localStorage.setItem(SET_KEY, id);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("eth-sound-set"));
  if (soundOn()) playIncoming();
}

function context() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.045, delay = 0) {
  if (!soundOn()) return;
  const audio = context();
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(amp);
  amp.connect(audio.destination);
  const start = audio.currentTime + delay;
  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function burst(name: string) {
  for (const [freq, duration, wave, gain, delay] of cues[readSoundSet()][name]) tone(freq, duration, wave, gain, delay ?? 0);
}

export function playClick() {
  burst("click");
}

export function playAlert() {
  burst("alert");
}

export function playOk() {
  burst("ok");
}

export function playGlitch() {
  burst("glitch");
}

export function playLock() {
  burst("lock");
}

export function playIncoming() {
  burst("incoming");
}

export function playSecureConnect() {
  burst("secure");
}

export function playMessage() {
  burst("message");
}

export function playFinale(win: boolean) {
  burst(win ? "win" : "lose");
}
