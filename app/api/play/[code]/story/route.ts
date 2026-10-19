import { NextResponse } from "next/server";
import { saveStory } from "@/lib/game/actions";
import { playSnapshot } from "@/lib/game/snapshot";
import type { StoryInput } from "@/lib/game/story";
import { guardPlay, unknownCode } from "@/lib/play-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const limited = guardPlay(code, "write");
  if (limited) return limited;
  const body = (await request.json().catch(() => null)) as StoryInput | null;
  if (!body) return NextResponse.json({ ok: false, error: "Geen verhaalactie." }, { status: 400 });
  const result = await saveStory(code, body);
  const snapshot = await playSnapshot(code);
  if ("error" in result) {
    if (result.error === "Code niet herkend.") return unknownCode();
    return NextResponse.json({ ok: false, error: result.error, snapshot }, { status: 400 });
  }
  return NextResponse.json(snapshot);
}
