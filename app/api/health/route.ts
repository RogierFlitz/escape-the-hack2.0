import { NextResponse } from "next/server";
import { sql } from "@/lib/db/sql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await sql();
    await db.get("SELECT 1 AS ok");
    return NextResponse.json({ ok: true, storage: "ready" });
  } catch {
    return NextResponse.json({ ok: false, error: "Opslag is niet bereikbaar." }, { status: 503 });
  }
}
