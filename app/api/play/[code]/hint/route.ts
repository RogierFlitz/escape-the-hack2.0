import { NextResponse } from "next/server";
import { takeHint } from "@/lib/game/actions";
import { playSnapshot } from "@/lib/game/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => null)) as { puzzleId?: string } | null;
  if (!body?.puzzleId) return NextResponse.json({ ok: false, error: "Geen opdracht." }, { status: 400 });
  const result = await takeHint(code, body.puzzleId);
  const snapshot = await playSnapshot(code);
  if ("error" in result) {
    return NextResponse.json({ ok: false, error: result.error, snapshot }, { status: 400 });
  }
  return NextResponse.json(snapshot);
}
