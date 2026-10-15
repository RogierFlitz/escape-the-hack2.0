import { NextResponse } from "next/server";
import { solve } from "@/lib/game/actions";
import { playSnapshot } from "@/lib/game/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => null)) as { puzzleId?: string; payload?: unknown } | null;
  if (!body?.puzzleId) return NextResponse.json({ ok: false, error: "Geen opdracht." }, { status: 400 });
  const result = await solve(code, body.puzzleId, body.payload ?? {});
  const snapshot = await playSnapshot(code);
  if ("error" in result) {
    return NextResponse.json({ ok: false, error: result.error, snapshot }, { status: result.error === "Code niet herkend." ? 404 : 400 });
  }
  if (result.mismatch) {
    return NextResponse.json(
      { ok: false, error: result.note ?? "Geen match. Het systeem weigert de invoer.", snapshot },
      { status: 422 },
    );
  }
  return NextResponse.json(snapshot);
}
