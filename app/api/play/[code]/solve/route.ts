import { NextResponse } from "next/server";
import { solve } from "@/lib/game/actions";
import { playSnapshot } from "@/lib/game/snapshot";
import { guardPlay, unknownCode } from "@/lib/play-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const limited = guardPlay(code, "write");
  if (limited) return limited;
  const body = (await request.json().catch(() => null)) as { puzzleId?: string; payload?: unknown } | null;
  if (!body?.puzzleId) return NextResponse.json({ ok: false, error: "Geen opdracht." }, { status: 400 });
  const result = await solve(code, body.puzzleId, body.payload ?? {});
  const snapshot = await playSnapshot(code);
  if ("error" in result) {
    if (result.error === "Code niet herkend.") return unknownCode();
    return NextResponse.json({ ok: false, error: result.error, snapshot }, { status: 400 });
  }
  if (result.mismatch) {
    return NextResponse.json(
      { ok: false, error: result.note ?? "Geen match. Het systeem weigert de invoer.", snapshot },
      { status: 422 },
    );
  }
  return NextResponse.json(snapshot);
}
