import { NextResponse } from "next/server";
import { savePrologue } from "@/lib/game/actions";
import { playSnapshot } from "@/lib/game/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => null)) as { scene?: string } | null;
  if (!body?.scene) return NextResponse.json({ ok: false, error: "Geen scène." }, { status: 400 });
  const result = await savePrologue(code, body.scene);
  const snapshot = await playSnapshot(code);
  if ("error" in result) return NextResponse.json({ ok: false, error: result.error, snapshot }, { status: 400 });
  return NextResponse.json(snapshot);
}
