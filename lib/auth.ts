import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { cookies } from "next/headers";

const COOKIE = "eth_admin";

function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const file = path.join(process.cwd(), "data", "secret");
  if (!existsSync(file)) {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, randomBytes(32).toString("hex"), { mode: 0o600 });
  }
  return readFileSync(file, "utf8");
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function usingDefaultPassword() {
  return !process.env.ADMIN_PASSWORD;
}

export function checkPassword(input: string) {
  return safeEqual(input, process.env.ADMIN_PASSWORD || "flitz-admin");
}

export async function setAdminCookie() {
  const exp = Date.now() + 1000 * 60 * 60 * 14;
  const body = Buffer.from(JSON.stringify({ exp, role: "admin" })).toString("base64url");
  const jar = await cookies();
  jar.set(COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 60 * 60 * 14,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdmin() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return false;
  const [body, mac] = raw.split(".");
  if (!body || !mac || !safeEqual(mac, sign(body))) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { exp: number; role: string };
    return payload.role === "admin" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
