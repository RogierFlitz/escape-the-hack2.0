import { NextResponse } from "next/server";
import { saveDecision } from "@/lib/game/actions";
import { playSnapshot } from "@/lib/game/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => null)) as { id?: string; choice?: string } | null;
  if (!body?.id || typeof body.choice !== "string") {
    return NextResponse.json({ ok: false, error: "Geen keuze." }, { status: 400 });
  }
  const result = await saveDecision(code, body.id, body.choice);
  const snapshot = await playSnapshot(code);
  if ("error" in result) return NextResponse.json({ ok: false, error: result.error, snapshot }, { status: 400 });
  return NextResponse.json({ ...snapshot, feedback: result.note ?? null });
}
