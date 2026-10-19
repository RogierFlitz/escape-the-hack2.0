import { NextResponse } from "next/server";
import { getByCode } from "@/lib/db/store";
import { playerReport } from "@/lib/game/results";
import { settle } from "@/lib/game/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const found = await getByCode(code);
  if (!found) return NextResponse.json({ ok: false, error: "Code niet herkend." }, { status: 404 });
  const now = Date.now();
  const teams = await settle(found.session, found.teams, now);
  const report = playerReport(found.session, teams, code, now);
  if (!report) return NextResponse.json({ ok: false, error: "Team niet gevonden." }, { status: 404 });
  return NextResponse.json(report);
}
