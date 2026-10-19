import { NextResponse } from "next/server";
import { saveEval } from "@/lib/game/actions";
import { playSnapshot } from "@/lib/game/snapshot";
import { guardPlay, unknownCode } from "@/lib/play-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const limited = guardPlay(code, "write");
  if (limited) return limited;
  const body = (await request.json().catch(() => null)) as { id?: string; choice?: string } | null;
  if (!body?.id || typeof body.choice !== "string") {
    return NextResponse.json({ ok: false, error: "Geen situatie." }, { status: 400 });
  }
  const result = await saveEval(code, body.id, body.choice);
  const snapshot = await playSnapshot(code);
  if ("error" in result) {
    if (result.error === "Code niet herkend.") return unknownCode();
    return NextResponse.json({ ok: false, error: result.error, snapshot }, { status: 400 });
  }
  return NextResponse.json({ ...snapshot, feedback: result.note ?? null });
}
