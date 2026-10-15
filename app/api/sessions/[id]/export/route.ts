import { adminSnapshot } from "@/lib/game/snapshot";
import { adminGuard } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csv(value: string | number) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminGuard();
  if (denied) return denied;
  const { id } = await context.params;
  const snapshot = await adminSnapshot(id);
  if (!snapshot) return new Response("Niet gevonden", { status: 404 });
  const header = ["positie", "team", "code", "status", "score", "hoofdstuk", "opgelost", "hints", "instructeurhints", "strafseconden", "mislukt", "vastgelopen", "resterend"];
  const lines = [header.join(",")];
  for (const team of snapshot.teams) {
    lines.push(
      [
        team.rank,
        team.name,
        team.code,
        team.status,
        team.score,
        team.chapter,
        `${team.solved}/${team.total}`,
        team.hints,
        team.instructorHints,
        team.penaltySec,
        team.fails,
        team.stuck ? "ja" : "nee",
        team.remainingSec,
      ]
        .map(csv)
        .join(","),
    );
  }
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="escape-the-hack-${snapshot.session.name.replaceAll(" ", "-")}.csv"`,
    },
  });
}
