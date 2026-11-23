import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { skipDemo } from "@/lib/game/actions";
import { playSnapshot } from "@/lib/game/snapshot";
import { guardPlay, unknownCode } from "@/lib/play-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  if (code.trim().toUpperCase() !== "DEMO") {
    return NextResponse.json({ ok: false, error: "Alleen de testcode kan worden doorgeschoven." }, { status: 404 });
  }
  if (process.env.NODE_ENV === "production" && !(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Code niet herkend." }, { status: 404 });
  }
  const limited = await guardPlay(code, "write");
  if (limited) return limited;
  const result = await skipDemo(code);
  const snapshot = await playSnapshot(code);
  if ("error" in result) {
    if (result.error === "Code niet herkend.") return unknownCode();
    return NextResponse.json({ ok: false, error: result.error, snapshot }, { status: 400 });
  }
  return NextResponse.json(snapshot);
}
