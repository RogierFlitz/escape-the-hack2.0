import { NextResponse } from "next/server";
import { openDemo } from "@/lib/game/actions";
import { DEMO_CODE, demoToolsEnabled } from "@/lib/game/demo";
import { playSnapshot } from "@/lib/game/snapshot";
import { guardPlay, unknownCode } from "@/lib/play-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const limited = guardPlay(code, "read");
  if (limited) return limited;
  let snapshot = await playSnapshot(code);
  const demo = code.trim().toUpperCase() === DEMO_CODE;
  if (!snapshot && demo && (process.env.NODE_ENV !== "production" || demoToolsEnabled())) {
    try {
      const opened = await openDemo("briefing");
      if (!("error" in opened)) snapshot = await playSnapshot(code);
    } catch {
      return NextResponse.json({ ok: false, error: "Demo kon niet worden geopend." }, { status: 503 });
    }
  }
  if (!snapshot) return unknownCode();
  return NextResponse.json(snapshot);
}
