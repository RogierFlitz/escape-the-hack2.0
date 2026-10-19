import { NextResponse } from "next/server";
import { playSnapshot } from "@/lib/game/snapshot";
import { guardPlay, unknownCode } from "@/lib/play-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const limited = guardPlay(code, "read");
  if (limited) return limited;
  const snapshot = await playSnapshot(code);
  if (!snapshot) return unknownCode();
  return NextResponse.json(snapshot);
}
