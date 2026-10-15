import { NextResponse } from "next/server";
import { triggerBreach } from "@/lib/game/actions";
import { playSnapshot } from "@/lib/game/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => null)) as { reported?: boolean } | null;
  const result = await triggerBreach(code, body?.reported === true);
  const snapshot = await playSnapshot(code);
  if ("error" in result) {
    return NextResponse.json({ ok: false, error: result.error, snapshot }, { status: 400 });
  }
  return NextResponse.json(snapshot);
}
