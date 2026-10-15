import { NextResponse } from "next/server";
import { adminSnapshot } from "@/lib/game/snapshot";
import { adminGuard } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;
  const { id } = await context.params;
  const snapshot = await adminSnapshot(id);
  if (!snapshot) return NextResponse.json({ ok: false, error: "Sessie niet gevonden." }, { status: 404 });
  return NextResponse.json(snapshot);
}
