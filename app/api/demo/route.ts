import { NextResponse } from "next/server";
import { isDemoStop } from "@/lib/game/demo";
import { openDemo } from "@/lib/game/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function demoOff() {
  return process.env.NODE_ENV === "production" && process.env.DEMO_TOOLS !== "true";
}

export async function POST(request: Request) {
  if (demoOff()) return NextResponse.json({ ok: false, error: "Demo staat uit." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as { at?: unknown } | null;
  if (!isDemoStop(body?.at)) return NextResponse.json({ ok: false, error: "Onbekend demopunt." }, { status: 400 });
  const opened = await openDemo(body.at);
  if ("error" in opened) return NextResponse.json({ ok: false, error: opened.error }, { status: 409 });
  return NextResponse.json({ ok: true, code: opened.code });
}
