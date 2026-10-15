import { NextResponse } from "next/server";
import { playSnapshot } from "@/lib/game/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const snapshot = await playSnapshot(code);
  if (!snapshot) return NextResponse.json({ ok: false, error: "Code niet herkend." }, { status: 404 });
  return NextResponse.json(snapshot);
}
