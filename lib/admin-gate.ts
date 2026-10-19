import { createHmac, timingSafeEqual } from "crypto";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 8;

type Bucket = { count: number; reset: number };

const failures = new Map<string, Bucket>();

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value : "";
}

export function usingDefaultPassword() {
  return readEnv("NODE_ENV") !== "production" && !readEnv("ADMIN_PASSWORD");
}

export function adminConfigError() {
  if (readEnv("NODE_ENV") === "production" && !readEnv("ADMIN_PASSWORD")) {
    return "Beheer is niet geconfigureerd. Zet ADMIN_PASSWORD in de omgeving en start de server opnieuw.";
  }
  return null;
}

function safeEqual(a: string, b: string) {
  const left = createHmac("sha256", "eth-admin").update(a).digest();
  const right = createHmac("sha256", "eth-admin").update(b).digest();
  return timingSafeEqual(left, right);
}

export function checkPassword(input: string) {
  const configured = readEnv("ADMIN_PASSWORD");
  if (readEnv("NODE_ENV") === "production") {
    if (!configured) return false;
    return safeEqual(input, configured);
  }
  return safeEqual(input, configured || "flitz-admin");
}

export function requestIsHttps(request: { url: string; headers: { get(name: string): string | null } }) {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]?.trim().toLowerCase() === "https";
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

export function loginClientKey(request: { headers: { get(name: string): string | null } }) {
  if (readEnv("TRUST_PROXY") === "true") {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (forwarded) return forwarded.slice(0, 80);
  }
  return "local";
}

export function noteLoginFailure(key: string, now = Date.now(), max = MAX_FAILURES) {
  const row = failures.get(key);
  if (!row || row.reset <= now) {
    failures.set(key, { count: 1, reset: now + WINDOW_MS });
    return { limited: false, retrySec: 0 };
  }
  row.count += 1;
  if (row.count > max) {
    return { limited: true, retrySec: Math.max(1, Math.ceil((row.reset - now) / 1000)) };
  }
  return { limited: false, retrySec: 0 };
}

export function loginLimited(key: string, now = Date.now(), max = MAX_FAILURES) {
  const row = failures.get(key);
  if (!row || row.reset <= now) return { limited: false, retrySec: 0 };
  if (row.count >= max) return { limited: true, retrySec: Math.max(1, Math.ceil((row.reset - now) / 1000)) };
  return { limited: false, retrySec: 0 };
}

export function clearLoginFailures(key: string) {
  failures.delete(key);
}

export function resetLoginLimits() {
  failures.clear();
}
