import { NextResponse } from "next/server";
import { getByCode } from "@/lib/db/store";
import { playerReport } from "@/lib/game/results";
import { settle } from "@/lib/game/snapshot";
import { guardPlay, unknownCode } from "@/lib/play-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const limited = guardPlay(code, "read");
  if (limited) return limited;
  const found = await getByCode(code);
  if (!found) return unknownCode();
  const now = Date.now();
  const teams = await settle(found.session, found.teams, now);
  const report = playerReport(found.session, teams, code, now);
  if (!report) return NextResponse.json({ ok: false, error: "Team niet gevonden." }, { status: 404 });
  return NextResponse.json(report);
}
