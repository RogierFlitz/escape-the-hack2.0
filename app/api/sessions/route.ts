import { NextResponse } from "next/server";
import { listSessionRollup, listSessions } from "@/lib/db/store";
import { parseMode } from "@/lib/game/awareness";
import { parseSector } from "@/lib/game/sector";
import { createSession } from "@/lib/game/actions";
import { adminGuard, clip } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;
  const sessions = await listSessions();
  const counts = await listSessionRollup();
  return NextResponse.json({ ok: true, sessions, counts });
}

export async function POST(request: Request) {
  const denied = await adminGuard();
  if (denied) return denied;
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    durationMin?: number;
    hintPenalty?: boolean;
    hintPenaltySec?: number;
    teams?: string[];
    mode?: string;
    sector?: string;
  } | null;
  const teams = (body?.teams ?? []).map((name) => clip(name, 32)).filter(Boolean);
  const durationMin = Number(body?.durationMin);
  const penalty = Number(body?.hintPenaltySec);
  if (!body || teams.length < 1 || teams.length > 24) {
    return NextResponse.json({ ok: false, error: "Voeg 1 tot 24 teams toe." }, { status: 400 });
  }
  if (!Number.isFinite(durationMin) || durationMin < 10 || durationMin > 180) {
    return NextResponse.json({ ok: false, error: "Speelduur moet tussen 10 en 180 minuten liggen." }, { status: 400 });
  }
  if (!Number.isFinite(penalty) || penalty < 0 || penalty > 300) {
    return NextResponse.json({ ok: false, error: "Tijdstraf per hint moet tussen 0 en 300 seconden liggen." }, { status: 400 });
  }
  try {
    const created = await createSession({
      name: clip(body.name, 60) || "Escape the Hack",
      durationSec: Math.round(durationMin * 60),
      hintPenalty: body.hintPenalty !== false,
      hintPenaltySec: Math.round(penalty),
      teamNames: teams,
      mode: parseMode(body.mode),
      sector: parseSector(body.sector),
    });
    return NextResponse.json({ ok: true, session: created.session, teams: created.teams });
  } catch (error) {
    const stored = error instanceof Error && error.message === "NO_STORE";
    return NextResponse.json(
      {
        ok: false,
        error: stored
          ? "Deze site kan nog geen sessie bewaren. Maak de sessie op de laptop, via het lokale beheerscherm."
          : "De sessie kon niet worden bewaard.",
      },
      { status: stored ? 503 : 500 },
    );
  }
}
