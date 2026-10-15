import { NextResponse } from "next/server";
import { checkPassword, isAdmin, setAdminCookie, usingDefaultPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, authenticated: await isAdmin(), devHint: usingDefaultPassword() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password || !checkPassword(body.password)) {
    return NextResponse.json({ ok: false, error: "Wachtwoord klopt niet." }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
