import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { checkPassword, usingDefaultPassword } from "./admin-gate";

const COOKIE = "eth_admin";

export { checkPassword, usingDefaultPassword };

function secret() {
  const configured = process.env["SESSION_SECRET"];
  if (configured) return configured;
  const file = path.join(process.cwd(), "data", "secret");
  try {
    if (!existsSync(file)) {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, randomBytes(32).toString("hex"), { mode: 0o600 });
    }
    return readFileSync(file, "utf8");
  } catch {
    const password = process.env["ADMIN_PASSWORD"];
    if (!password) throw new Error("SESSION_SECRET ontbreekt.");
    return createHmac("sha256", "eth-session").update(password).digest("hex");
  }
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

export async function setAdminCookie(secure: boolean) {
  const exp = Date.now() + 1000 * 60 * 60 * 14;
  const body = Buffer.from(JSON.stringify({ exp, role: "admin" })).toString("base64url");
  const jar = await cookies();
  jar.set(COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure,
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
