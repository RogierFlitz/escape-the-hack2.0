"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_CODE } from "@/lib/game/demo";
import { clearDemoClient, DemoJumps } from "./DemoJumps";
import { Pwa } from "../Pwa";

export function HomeScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function join(event: React.FormEvent) {
    event.preventDefault();
    const next = code.trim().toUpperCase();
    if (next.length < 4) {
      setError("Vul de teamcode in.");
      return;
    }
    const opening = next === DEMO_CODE;
    const response = await fetch(`/api/play/${next}${opening ? "?start=1" : ""}`, { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(typeof data?.error === "string" ? data.error : "Deze code hoort bij geen enkel team.");
      return;
    }
    if (opening) clearDemoClient(next);
    router.push(`/play/${next}`);
  }

  return (
    <main className="scroll-page">
      <Pwa />
      <div className="home">
        <section className="hero">
          <p className="kicker">Flitz-events · Nexora</p>
          <h1>ESCAPE THE HACK<span>2.0 · THE BREACH</span></h1>
          <p className="lede">Jullie zijn ingehuurd door Nexora Technologies. Er is een signaal dat informatie buiten het bedrijf ligt. Zoek zelf uit wat er is gebeurd.</p>
        </section>
        <form className="panel join" onSubmit={join}>
          <p className="kicker">Teamtoegang</p>
          <label htmlFor="code">Deelnamecode</label>
          <input id="code" data-testid="join-code" autoCapitalize="characters" autoCorrect="off" spellCheck={false} maxLength={12} value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="K7MP4Q2R" />
          {error && <p className="note">{error}</p>}
          <button className="btn btn-primary" data-testid="join-submit" type="submit">Systeem openen</button>
          <a className="linkish" href="/admin">Instructeur</a>
          <DemoJumps />
        </form>
      </div>
    </main>
  );
}
