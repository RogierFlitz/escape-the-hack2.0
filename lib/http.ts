import "server-only";
import { NextResponse } from "next/server";
import { isAdmin } from "./auth";

export async function adminGuard() {
  if (await isAdmin()) return null;
  return NextResponse.json({ ok: false, error: "Geen toegang." }, { status: 401 });
}

export function clip(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}
