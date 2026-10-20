import { NextResponse } from "next/server";
import { controlSession, guideTeam, instructorHint } from "@/lib/game/actions";
import { adminSnapshot } from "@/lib/game/snapshot";
import { adminGuard } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    seconds?: number;
    teamId?: string;
    puzzleId?: string;
    requestId?: string;
    reason?: string;
    name?: string;
    durationMin?: number;
    hintPenalty?: boolean;
    hintPenaltySec?: number;
    mode?: string;
    sector?: string;
  } | null;
  if (!body?.action) return NextResponse.json({ ok: false, error: "Geen actie." }, { status: 400 });
  const result =
    body.action === "hint"
      ? await instructorHint(id, String(body.teamId ?? ""), body.puzzleId)
      : body.action === "replay" || body.action === "advance"
        ? await guideTeam(id, String(body.teamId ?? ""), body.action)
        : await controlSession(id, body.action, Number(body.seconds ?? 0), {
            teamId: body.teamId,
            requestId: body.requestId,
            reason: body.reason,
            name: body.name,
            durationMin: body.durationMin,
            hintPenalty: body.hintPenalty,
            hintPenaltySec: body.hintPenaltySec,
            mode: body.mode,
            sector: body.sector,
          });
  if ("error" in result) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  const snapshot = await adminSnapshot(id);
  return NextResponse.json({ ...result, snapshot });
}
