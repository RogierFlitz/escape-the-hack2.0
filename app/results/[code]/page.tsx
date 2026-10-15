import { PlayApp } from "@/components/game/PlayApp";

export default async function ResultsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <PlayApp code={code.toUpperCase()} />;
}
