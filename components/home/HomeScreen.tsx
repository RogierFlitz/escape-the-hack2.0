"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DemoJumps } from "./DemoJumps";
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
    const response = await fetch(`/api/play/${next}`, { cache: "no-store" });
    if (!response.ok) {
      setError("Deze code hoort bij geen enkel team.");
      return;
    }
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
          <input id="code" data-testid="join-code" autoCapitalize="characters" autoCorrect="off" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="K7MP" />
          {error && <p className="note">{error}</p>}
          <button className="btn btn-primary" data-testid="join-submit" type="submit">Systeem openen</button>
          <a className="linkish" href="/admin">Instructeur</a>
          <DemoJumps />
        </form>
      </div>
    </main>
  );
}
