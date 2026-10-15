export const noraNetwork =
  "Ongeautoriseerde netwerkactiviteit gedetecteerd. We moeten de verdachte verbinding lokaliseren en isoleren. Let op: wanneer we de verkeerde systemen uitschakelen, verliezen we mogelijk toegang tot de back-ups. Onderzoek eerst de verbindingen voordat jullie ingrijpen.";

export type Flow = {
  id: string;
  time: string;
  bucket: "nacht" | "dag";
  account: string;
  source: string;
  dest: string;
  status: "toegekend" | "geweigerd";
  unusual: boolean;
  note: string;
};

export const flows: Flow[] = [
  { id: "t1", time: "01:52", bucket: "nacht", account: "helix-svc", source: "NEX", dest: "EDGE", status: "toegekend", unusual: true, note: "Tunnel naar buiten geopend." },
  { id: "t2", time: "01:55", bucket: "nacht", account: "scan-job", source: "NEX", dest: "HONEY", status: "geweigerd", unusual: true, note: "Scan viel meteen weg." },
  { id: "t3", time: "01:58", bucket: "nacht", account: "helix-svc", source: "EDGE", dest: "DNS", status: "toegekend", unusual: true, note: "Lookup vault.nexora.internal." },
  { id: "t4", time: "02:04", bucket: "nacht", account: "helix-svc", source: "DNS", dest: "AUTH", status: "toegekend", unusual: true, note: "Ticket aangevraagd na de lookup." },
  { id: "t5", time: "02:06", bucket: "nacht", account: "helix-svc", source: "AUTH", dest: "VAULT", status: "toegekend", unusual: true, note: "Lezen op de bestandskluis." },
  { id: "t6", time: "03:10", bucket: "nacht", account: "backup-svc", source: "VAULT", dest: "LOG", status: "toegekend", unusual: true, note: "Geplande nachtelijke kluis-kopie." },
  { id: "t7", time: "08:00", bucket: "dag", account: "monitor-svc", source: "LOG", dest: "AUTH", status: "toegekend", unusual: false, note: "Gezondheidscheck." },
  { id: "t8", time: "09:12", bucket: "dag", account: "mara.de.vries", source: "NEX", dest: "AUTH", status: "toegekend", unusual: false, note: "Aanmelding dagdienst." },
  { id: "t9", time: "09:40", bucket: "dag", account: "print-svc", source: "NEX", dest: "LOG", status: "toegekend", unusual: false, note: "Printerwachtrij." },
  { id: "t10", time: "10:05", bucket: "dag", account: "s.adler", source: "NEX", dest: "DNS", status: "toegekend", unusual: false, note: "Naam van de crewportal." },
  { id: "t11", time: "11:02", bucket: "dag", account: "finance", source: "NEX", dest: "AUTH", status: "toegekend", unusual: false, note: "Kwartaalmap." },
  { id: "t12", time: "11:20", bucket: "dag", account: "guest-wifi", source: "EDGE", dest: "PROXY", status: "geweigerd", unusual: true, note: "Gastnetwerk geweigerd." },
  { id: "t13", time: "14:02", bucket: "dag", account: "helix-events-portal", source: "EDGE", dest: "PROXY", status: "toegekend", unusual: false, note: "Leveranciersportaal, kantoortijd." },
  { id: "t14", time: "16:44", bucket: "dag", account: "m.okonkwo", source: "NEX", dest: "LOG", status: "toegekend", unusual: false, note: "Rapport rek 7." },
];

export const sessions = [...new Set(flows.map((row) => row.account))];

export const clues = [
  { id: "hours", label: "Actief vóór 02:14, buiten de geplande back-up" },
  { id: "account", label: "Serviceaccount vanaf de buitenkant, niet het portaal overdag" },
  { id: "vault", label: "De bestemming is de bestandskluis" },
  { id: "name", label: "Het account bevat het woord Helix" },
];

export const hops = [
  { id: "f", time: "01:52", text: "NEX opende een tunnel naar EDGE. Account helix-svc." },
  { id: "b", time: "01:55", text: "HONEY ontving een scan vanaf NEX. De verbinding viel meteen weg." },
  { id: "c", time: "01:58", text: "EDGE vroeg DNS om de naam vault.nexora.internal." },
  { id: "e", time: "02:04", text: "AUTH gaf een ticket uit, nadat DNS had geantwoord." },
  { id: "a", time: "02:06", text: "VAULT accepteerde een leesactie. Het ticket kwam van AUTH." },
  { id: "d", time: "11:20", text: "PROXY weigerde guest-wifi. Er kwam geen ticket." },
];

export const nodeInfo: Record<string, { name: string; role: string }> = {
  CRU: { name: "NEX", role: "Werkstation van Nexora." },
  EDGE: { name: "EDGE", role: "Externe toegang. Leveranciers komen hier binnen." },
  DNS: { name: "DNS", role: "Naamomzetting." },
  AUTH: { name: "AUTH", role: "Authenticatie. Geeft tickets uit." },
  LOG: { name: "LOG", role: "Logserver. Nodig om dit onderzoek te kunnen nalezen." },
  VAULT: { name: "VAULT", role: "Bestandskluis. Hier staan de back-ups." },
  HONEYPOT: { name: "HONEY", role: "Honeypot. Vangt losse scans op." },
  PROXY: { name: "PROXY", role: "Tussenstation voor het portaal en het gastnetwerk." },
};

export const measures = [
  { id: "isolate-session", label: "Zet de leverancierssessie tijdelijk in TRAP", preview: "Die sessie verlaat de productielijn en staat apart." },
  { id: "keep-log", label: "Houd de logserver bereikbaar", preview: "LOG blijft beschikbaar voor dit onderzoek." },
  { id: "hold-edge", label: "Blokkeer nieuwe tunnels op EDGE", preview: "Nieuwe binnenkomst via EDGE stopt. Bestaande systemen blijven staan." },
  { id: "cut-vault", label: "Schakel de bestandskluis uit", preview: "VAULT wordt onbereikbaar. De back-up hangt daaraan." },
  { id: "cut-dns", label: "Zet naamomzetting uit", preview: "DNS valt weg. Namen in het netwerk lossen niet meer op." },
  { id: "cut-log", label: "Isoleer de logserver", preview: "LOG valt weg. Jullie kunnen de nacht niet meer nalezen." },
  { id: "block-all", label: "Stuur al het verkeer naar TRAP", preview: "Ook DNS, AUTH, LOG en de kluis vallen dan weg." },
];

export const schema = [
  "Naamomzetting luistert op poort 53.",
  "Sessiecontrole luistert op poort 443.",
  "Logverzending luistert op poort 514.",
  "Een val sluit je niet aan. Die hoort op PARK.",
];

export const cableRole: Record<string, string> = {
  DNS: "naamomzetting",
  AUTH: "sessiecontrole",
  LOG: "logverzending",
  TRAP: "val",
};

export const sections = [
  { id: "map", label: "Kaart" },
  { id: "logs", label: "Logs" },
  { id: "measures", label: "Maatregelen" },
  { id: "patch", label: "Patchkast" },
];

export function feedFor(puzzleId: string) {
  if (puzzleId === "ch3-path") {
    return [
      { time: "02:06", text: "VAULT registreerde een leesactie. De sprongen staan in de authenticatielog." },
      { time: "01:55", text: "HONEY liet een scan vallen. Dat is geen doorgang." },
    ];
  }
  if (puzzleId === "ch3-boot") {
    return [
      { time: "nu", text: "De aanvalslijn is zichtbaar. De sessie is nog niet geïsoleerd." },
      { time: "nu", text: "VAULT bewaart de back-up. Zet die niet blind uit." },
    ];
  }
  if (puzzleId === "ch3-cables") {
    return [
      { time: "nu", text: "EDGE is beperkt. DNS, AUTH en VAULT antwoorden niet." },
      { time: "nu", text: "LOG staat nog, maar de kabel in de kast ligt los." },
    ];
  }
  return [
    { time: "01:58", text: "EDGE meldt een lookup buiten kantoortijd." },
    { time: "02:06", text: "VAULT registreert een leesactie. Herkomst nog niet bevestigd." },
  ];
}
