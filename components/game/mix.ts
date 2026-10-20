"use client";

import { mediaFile, musicLevel, sceneVoice } from "@/lib/game/media";

export type MusicScene = "office" | "crisis" | "finale";

const MUSIC_KEY = "eth-vol-music";
const VOICE_KEY = "eth-vol-voice";
const FX_KEY = "eth-vol-fx";

let music: HTMLAudioElement | null = null;
let musicScene: MusicScene | null = null;
let ducked = false;
let fade = 0;

function clamp(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

export function readMusicVolume() {
  if (typeof window === "undefined") return 40;
  return clamp(localStorage.getItem(MUSIC_KEY), 40);
}

export function readVoiceVolume() {
  if (typeof window === "undefined") return 100;
  return clamp(localStorage.getItem(VOICE_KEY), 100);
}

export function readFxVolume() {
  if (typeof window === "undefined") return 70;
  return clamp(localStorage.getItem(FX_KEY), 70);
}

export function setMixVolume(kind: "music" | "voice" | "fx", value: number) {
  const next = Math.min(100, Math.max(0, Math.round(value)));
  const key = kind === "music" ? MUSIC_KEY : kind === "voice" ? VOICE_KEY : FX_KEY;
  localStorage.setItem(key, String(next));
  window.dispatchEvent(new Event("eth-mix"));
  if (kind === "music") applyMusicVolume();
}

function applyMusicVolume() {
  if (!music) return;
  music.volume = musicLevel(readMusicVolume(), ducked);
}

export function duckMusic(on: boolean) {
  ducked = on;
  applyMusicVolume();
}

export function stopMusic() {
  fade += 1;
  const current = music;
  music = null;
  musicScene = null;
  if (!current) return;
  const token = fade;
  const started = current.volume;
  const steps = 8;
  let step = 0;
  const timer = window.setInterval(() => {
    step += 1;
    if (token !== fade) {
      window.clearInterval(timer);
      return;
    }
    current.volume = Math.max(0, started * (1 - step / steps));
    if (step >= steps) {
      window.clearInterval(timer);
      current.pause();
    }
  }, 40);
}

export function setMusic(scene: MusicScene) {
  if (typeof window === "undefined") return;
  const path = mediaFile(`bed-${scene}`);
  if (!path) {
    if (music) stopMusic();
    return;
  }
  if (music && musicScene === scene) {
    applyMusicVolume();
    return;
  }
  stopMusic();
  const next = new Audio(path);
  next.loop = true;
  next.volume = 0;
  music = next;
  musicScene = scene;
  const token = fade;
  void next.play().then(() => {
    if (token !== fade || music !== next) return;
    const target = musicLevel(readMusicVolume(), ducked);
    const steps = 10;
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      if (token !== fade || music !== next) {
        window.clearInterval(timer);
        return;
      }
      next.volume = target * (step / steps);
      if (step >= steps) window.clearInterval(timer);
    }, 40);
  }).catch(() => undefined);
}

let clip: HTMLAudioElement | null = null;

export function stopSceneVoice() {
  clip?.pause();
  clip = null;
  duckMusic(false);
}

export function playSceneVoice(sceneId: string, index: number, onDone: () => void) {
  const path = sceneVoice(`${sceneId}:${index}`);
  if (!path || typeof window === "undefined") return false;
  stopSceneVoice();
  duckMusic(true);
  const next = new Audio(path);
  clip = next;
  next.volume = readVoiceVolume() / 100;
  const finish = () => {
    if (clip === next) clip = null;
    duckMusic(false);
    onDone();
  };
  next.addEventListener("ended", finish, { once: true });
  next.addEventListener("error", finish, { once: true });
  void next.play().catch(finish);
  return true;
}
