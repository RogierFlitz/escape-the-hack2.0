import { NextResponse } from "next/server";
import { getSession } from "@/lib/db/store";
import { resultsCsv, sessionReport } from "@/lib/game/results";
import { settle } from "@/lib/game/snapshot";
import { adminGuard } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;
  const { id } = await context.params;
  const found = await getSession(id);
  if (!found) return NextResponse.json({ ok: false, error: "Sessie niet gevonden." }, { status: 404 });
  const now = Date.now();
  const teams = await settle(found.session, found.teams, now);
  const report = sessionReport(found.session, teams, now);
  const format = new URL(request.url).searchParams.get("format");
  if (format === "csv") {
    const name = report.session.name.replaceAll(" ", "-").replace(/[^\w.-]+/g, "");
    return new Response(resultsCsv(report, true), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="resultaten-${name || "sessie"}.csv"`,
      },
    });
  }
  return NextResponse.json(report);
}
