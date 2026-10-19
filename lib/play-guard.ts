import "server-only";
import { NextResponse } from "next/server";

const WINDOW_MS = 60_000;

type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();

export function takeSlot(key: string, max: number, now = Date.now(), windowMs = WINDOW_MS) {
  const row = buckets.get(key);
  if (!row || row.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true as const, retrySec: 0 };
  }
  if (row.count >= max) {
    return { ok: false as const, retrySec: Math.max(1, Math.ceil((row.reset - now) / 1000)) };
  }
  row.count += 1;
  return { ok: true as const, retrySec: 0 };
}

export function resetPlayGuards() {
  buckets.clear();
}

function limited(retrySec: number) {
  return NextResponse.json(
    { ok: false, error: "Te veel pogingen. Wacht even." },
    { status: 429, headers: { "Retry-After": String(retrySec) } },
  );
}

export function guardPlay(code: string, kind: "read" | "write") {
  const normalized = code.trim().toUpperCase();
  if (normalized === "DEMO" && process.env.NODE_ENV === "production" && process.env["DEMO_TOOLS"] !== "true") {
    return NextResponse.json({ ok: false, error: "Code niet herkend." }, { status: 404 });
  }
  const slot = takeSlot(`${kind}:${normalized}`, kind === "write" ? 40 : 90);
  if (!slot.ok) return limited(slot.retrySec);
  return null;
}

export function unknownCode() {
  const slot = takeSlot("play-miss", 20);
  if (!slot.ok) return limited(slot.retrySec);
  return NextResponse.json({ ok: false, error: "Code niet herkend." }, { status: 404 });
}
