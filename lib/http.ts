import "server-only";
import { NextResponse } from "next/server";
import { adminConfigError } from "./admin-gate";
import { isAdmin } from "./auth";

export async function adminGuard() {
  const problem = adminConfigError();
  if (problem) return NextResponse.json({ ok: false, error: problem }, { status: 503 });
  if (await isAdmin()) return null;
  return NextResponse.json({ ok: false, error: "Geen toegang." }, { status: 401 });
}

export function clip(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}
