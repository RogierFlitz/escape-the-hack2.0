import { PUZZLE_IDS } from "./content";

/** Sessies van vóór deze route. Zij houden de patchkast, de kluiscyclus en de rotor. */
export const LEGACY_ROUTE = 2;

/** Nieuwe sessies. Drie onderzoeken komen ervoor in de plaats. */
export const CURRENT_ROUTE = 3;

export const OPTIONAL_PUZZLES = ["ch3-cables", "ch4-sequence", "ch4-rotor"] as const;

const optional = new Set<string>(OPTIONAL_PUZZLES);

export function routeOf(session: { playRoute?: number }) {
  return session.playRoute === CURRENT_ROUTE ? CURRENT_ROUTE : LEGACY_ROUTE;
}

export function countsOnRoute(route: number, id: string) {
  return route < CURRENT_ROUTE || !optional.has(id);
}

export function requiredPuzzleIds(route: number) {
  return PUZZLE_IDS.filter((id) => countsOnRoute(route, id));
}

/**
 * Route 3 haalt 3 van de 23 opdrachten uit de verplichte keten.
 * Dat zijn de stappen waar teams bleven hangen. Drie onderzoeken komen ervoor terug.
 * De klok blijft de duur die de instructeur instelt, dus er gaat geen crisistijd af.
 */
export const ROUTE_TIME_NOTE =
  "Verplichte keten van 20 opdrachten plus 3 onderzoeken, in plaats van 23 opdrachten. De patchkast, de kluiscyclus en de rotor blijven beschikbaar voor sessies op route 2.";
