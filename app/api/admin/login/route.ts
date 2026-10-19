import { NextResponse } from "next/server";
import {
  adminConfigError,
  checkPassword,
  clearLoginFailures,
  loginClientKey,
  loginLimited,
  noteLoginFailure,
  requestIsHttps,
  usingDefaultPassword,
} from "@/lib/admin-gate";
import { isAdmin, setAdminCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const problem = adminConfigError();
  if (problem) {
    return NextResponse.json({ ok: false, configured: false, authenticated: false, error: problem }, { status: 503 });
  }
  return NextResponse.json({ ok: true, configured: true, authenticated: await isAdmin(), devHint: usingDefaultPassword() });
}

export async function POST(request: Request) {
  const problem = adminConfigError();
  if (problem) {
    return NextResponse.json({ ok: false, configured: false, error: problem }, { status: 503 });
  }
  const key = loginClientKey(request);
  if (loginLimited(key).limited || loginLimited("login-global", Date.now(), 40).limited) {
    return NextResponse.json({ ok: false, error: "Te veel pogingen. Probeer het later opnieuw." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password || !checkPassword(body.password)) {
    const failure = noteLoginFailure(key);
    const global = noteLoginFailure("login-global", Date.now(), 40);
    if (failure.limited || global.limited) {
      return NextResponse.json({ ok: false, error: "Te veel pogingen. Probeer het later opnieuw." }, { status: 429 });
    }
    return NextResponse.json({ ok: false, error: "Wachtwoord klopt niet." }, { status: 401 });
  }
  clearLoginFailures(key);
  clearLoginFailures("login-global");
  await setAdminCookie(requestIsHttps(request));
  return NextResponse.json({ ok: true });
}
