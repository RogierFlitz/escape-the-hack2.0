import { NextResponse } from "next/server";
import { savePulse } from "@/lib/game/actions";
import { playSnapshot } from "@/lib/game/snapshot";
import { guardPlay, unknownCode } from "@/lib/play-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const limited = guardPlay(code, "write");
  if (limited) return limited;
  const body = (await request.json().catch(() => null)) as { when?: string; answers?: Record<string, string> } | null;
  if (body?.when !== "before" && body?.when !== "after") return NextResponse.json({ ok: false, error: "Geen meting." }, { status: 400 });
  if (!body.answers || typeof body.answers !== "object") return NextResponse.json({ ok: false, error: "De meting is nog niet compleet." }, { status: 400 });
  const result = await savePulse(code, body.when, body.answers);
  const snapshot = await playSnapshot(code);
  if ("error" in result) {
    if (result.error === "Code niet herkend.") return unknownCode();
    return NextResponse.json({ ok: false, error: result.error, snapshot }, { status: 400 });
  }
  return NextResponse.json(snapshot);
}
