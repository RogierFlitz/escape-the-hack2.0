let ctx: AudioContext | null = null;

export function soundOn() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("eth-sound") === "on";
}

export function setSound(on: boolean) {
  localStorage.setItem("eth-sound", on ? "on" : "off");
  if (on) context();
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

export function playClick() {
  tone(520, 0.035, "square", 0.02);
}

export function playAlert() {
  tone(196, 0.18, "sawtooth", 0.03);
  tone(146, 0.22, "square", 0.025, 0.1);
}

export function playOk() {
  tone(523, 0.08, "triangle", 0.04);
  tone(784, 0.14, "triangle", 0.04, 0.08);
}

export function playGlitch() {
  tone(90, 0.12, "sawtooth", 0.02);
  tone(140, 0.08, "square", 0.015, 0.14);
}

export function playLock() {
  tone(240, 0.07, "square", 0.03);
  tone(180, 0.1, "triangle", 0.02, 0.06);
}

export function playIncoming() {
  tone(440, 0.08, "sine", 0.03);
  tone(554, 0.1, "sine", 0.028, 0.12);
  tone(659, 0.14, "sine", 0.025, 0.24);
}

export function playMessage() {
  tone(680, 0.06, "sine", 0.035);
  tone(910, 0.09, "sine", 0.03, 0.07);
}

export function playFinale(win: boolean) {
  const notes = win ? [523, 659, 784, 1046] : [220, 174, 130];
  notes.forEach((freq, index) => tone(freq, 0.22, win ? "triangle" : "sawtooth", 0.04, index * 0.12));
}
