"use client";

import { createContext, useContext } from "react";
import { asSector, type Sector } from "@/lib/game/sector";

const SectorContext = createContext<Sector>("general");

export function SectorProvider({ sector, children }: { sector: Sector; children: React.ReactNode }) {
  return <SectorContext.Provider value={sector}>{children}</SectorContext.Provider>;
}

export function useSector() {
  return useContext(SectorContext);
}

export function useSkin(text: string) {
  return asSector(useContext(SectorContext), text);
}
