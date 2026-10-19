import "server-only";
import { network } from "./content";

export type Grade = { ok: true; token?: string } | { ok: false; reason: "mismatch" | "incomplete"; note?: string };

function text(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function upper(value: unknown) {
  return String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

function list(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function same(a: string[], b: string[]) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function edgeSet() {
  const set = new Set<string>();
  for (const [a, b] of network.edges) {
    set.add(`${a}>${b}`);
    set.add(`${b}>${a}`);
  }
  return set;
}

const bad = new Set(network.nodes.filter((node) => node.bad).map((node) => node.id));

const archiveKey = ["adler-table:leak", "berg-vrij:public", "dock-shot:where", "helix-card:trust", "helix-floor:vendor", "mara-lead:who"];
const photoKey = ["badge", "lanyard", "plan", "sign"];
const boardKey: Record<string, string> = {
  lead: "mara",
  place: "dok",
  vendor: "helix",
  leak: "adler",
  trust: "listing",
};

function nora(note: string, reason: "mismatch" | "incomplete"): Grade {
  return { ok: false, reason, note: `NORA: ${note}` };
}

function gradeArchive(body: Record<string, unknown>): Grade {
  const pins = Array.isArray(body.pins) ? body.pins : [];
  if (pins.length === 0) return nora("Leg eerst een verband vast. Een bron openen is nog geen bewijs.", "incomplete");
  const pairs = pins.map((item) => {
    const row = record(item);
    return `${String(row.id ?? "")}:${String(row.claim ?? "")}`;
  });
  const ids = pairs.map((pair) => pair.split(":")[0]);
  if (new Set(ids).size !== ids.length) return nora("Elke bron hoort bij één vraag.", "mismatch");
  if (pins.length < archiveKey.length) return nora("Er mist nog een soort informatie. Elke vraag heeft een eigen bron nodig.", "incomplete");
  if (pins.length > archiveKey.length) return nora("Niet elke bron die je bewaarde hoort in zijn voorbereiding.", "mismatch");
  const sorted = [...pairs].sort();
  if (!same(sorted, archiveKey)) return nora("Een bron beantwoordt een andere vraag dan je koos.", "mismatch");
  return { ok: true };
}

function gradePhoto(body: Record<string, unknown>): Grade {
  const spots = [...new Set(list(body.spots))].sort();
  if (spots.length === 0) return nora("Markeer de details die hij kon gebruiken.", "incomplete");
  if (spots.some((spot) => spot === "mug" || spot === "plant")) return nora("Niet alles op die tafel hielp hem.", "mismatch");
  if (spots.length < photoKey.length) return nora("Er staat nog een bruikbaar detail op de foto.", "incomplete");
  if (!same(spots, photoKey)) return nora("Die selectie vormt nog geen voorbereiding.", "mismatch");
  return { ok: true };
}

function gradeBoard(body: Record<string, unknown>): Grade {
  const links = record(body.links);
  const keys = Object.keys(boardKey);
  if (keys.some((key) => !links[key])) return nora("Niet elke vraag heeft een bewijsstuk.", "incomplete");
  if (keys.some((key) => String(links[key]) !== boardKey[key])) {
    return nora("Die combinatie legt dit verband niet. Probeer een andere koppeling.", "mismatch");
  }
  return { ok: true };
}

function gradeRecon(body: Record<string, unknown>): Grade {
  if (!body.event || !body.name || !body.step) return nora("Het bestand is nog niet ingevuld.", "incomplete");
  if (body.event === "nexora-day" && body.name === "helix" && body.step === "impersonate") {
    return { ok: true, token: "N74192" };
  }
  return nora("Dat klopt niet met wat je al hebt vastgelegd. Het bestand vraagt wat hij wist, niet hoe hij later op het netwerk kwam.", "mismatch");
}

const supplierEvidence = ["contract", "prior", "header"];

function gradeSupplier(body: Record<string, unknown>): Grade {
  const mail = String(body.mail ?? "");
  const evidence = list(body.evidence);
  if (!mail) return nora("Wijs eerst een bericht aan.", "incomplete");
  if (evidence.length < 2) return nora("Een gok zonder twee bronnen is nog geen conclusie.", "incomplete");
  if (mail !== "phish") return nora("Die afzender sluit aan op een spoor dat al in het dossier staat. Kijk naar het volledige adres.", "mismatch");
  const strong = evidence.filter((item) => supplierEvidence.includes(item));
  if (strong.length < 2) return nora("Eén aanwijzing is nog geen bewijs. Leg er een tweede naast uit het contract of een eerder bericht.", "incomplete");
  return { ok: true };
}

function gradeAttachment(body: Record<string, unknown>): Grade {
  const marks = new Set(list(body.marks));
  if (marks.size === 0) return nora("Markeer wat er in dit bestand anders is dan de planning die Helix eerder stuurde.", "incomplete");
  if (!marks.has("author") || !marks.has("dock-row")) {
    return nora("Die eigenschap verklaart het risico nog niet. Vergelijk de maker en de inhoud met de planning die Helix eerder stuurde.", "mismatch");
  }
  return { ok: true };
}

function gradeNight(body: Record<string, unknown>): Grade {
  const order = list(body.order);
  if (order.length < 3) return nora("De keten heeft drie stappen. De tijden staan in de nachtlog, niet op de kaarten.", "incomplete");
  if (order.some((item) => !["phish", "dock", "export"].includes(item))) {
    return nora("Niet elke gebeurtenis van die nacht hoort bij zijn voorbereiding.", "mismatch");
  }
  if (!same(order, ["phish", "dock", "export"])) {
    return nora("De volgorde klopt niet met de klok in de log. Dit is de nacht vóór de aanval die jullie vandaag zagen.", "mismatch");
  }
  return { ok: true };
}

function gradeTrace(body: Record<string, unknown>): Grade {
  const job = upper(body.job);
  const supports = list(body.supports);
  if (!job) return nora("Welke job is het dok uit gegaan?", "incomplete");
  if (supports.length < 2) return nora("Koppel het spoor aan de nachtlog en aan de bijlage.", "incomplete");
  if (job !== "DOCK-244") return nora("Die job is niet de export die het dok verliet.", "mismatch");
  if (!supports.includes("export-log") || !supports.includes("attachment")) {
    return nora("Het nummer moet terugkomen in de nachtlog en in de gewijzigde bijlage.", "incomplete");
  }
  return { ok: true, token: "DOCK-244" };
}

const sessionClues = ["hours", "account", "vault"];
const isolateDanger = ["cut-vault", "cut-dns", "cut-log", "block-all"];

function gradeSession(body: Record<string, unknown>): Grade {
  const session = text(body.session);
  const picked = list(body.clues);
  if (!session) return nora("Wijs eerst een sessie aan.", "incomplete");
  if (picked.length < 2) return nora("Eén afwijking is nog geen bewijs. Leg er een tweede naast.", "incomplete");
  if (session !== "helix-svc") return nora("Die sessie past bij ander verkeer. Vergelijk tijd, herkomst en bestemming.", "mismatch");
  if (picked.filter((item) => sessionClues.includes(item)).length < 2) {
    return nora("Eén echte afwijking is nog geen bewijs. Leg er een tweede naast uit de log.", "incomplete");
  }
  return { ok: true };
}

function gradeIsolate(body: Record<string, unknown>): Grade {
  const picked = list(body.actions);
  if (picked.length < 2) return nora("Eén schakelaar is nog geen isolatie. Kies wat apart moet en wat open moet blijven.", "incomplete");
  if (picked.some((item) => isolateDanger.includes(item))) {
    return nora("Die maatregel haalt een systeem weg dat jullie nog nodig hebben.", "mismatch");
  }
  if (!picked.includes("isolate-session") || !picked.includes("keep-log")) {
    return nora("De sessie staat nog tussen de andere systemen, of de log valt weg.", "mismatch");
  }
  return { ok: true, token: "ROUTE-7" };
}

function gradeDamage(body: Record<string, unknown>): Grade {
  const wanted = ["agenda", "contract", "finance", "planning", "staff"];
  const clean = ["contacts", "handbook", "menu"];
  const picked = [...new Set(list(body.files))].sort();
  if (picked.length === 0) return nora("Open de bestanden en markeer wat niet meer leesbaar is.", "incomplete");
  if (picked.some((id) => clean.includes(id))) return nora("Een bestand dat je nog kunt lezen, hoort niet bij de schade.", "mismatch");
  if (picked.length < wanted.length) return nora("Er is nog een bestand dat niet meer leest.", "incomplete");
  if (!same(picked, wanted)) return nora("Die selectie dekt de schade niet.", "mismatch");
  return { ok: true };
}

function gradeCopy(body: Record<string, unknown>): Grade {
  const id = text(body.id);
  if (!id) return nora("Kies een kopie nadat je de rapporten hebt vergeleken.", "incomplete");
  if (id === "live-mirror") return nora("Deze kopie is nieuwer dan het moment waarop de bestanden op slot gingen. De controlewaarde wijkt af.", "mismatch");
  if (id === "shared-recovery") return nora("De controlewaarde lijkt te kloppen, maar de toegangslog toont een kopie naar buiten.", "mismatch");
  if (id !== "kluis-nacht") return nora("Die kopie hoort niet bij de schone cyclus.", "mismatch");
  return { ok: true };
}

function gradeStills(body: Record<string, unknown>): Grade {
  const wanted = ["cafe-0236", "dock-0231", "entry-0248", "gate-0229"];
  const picked = [...new Set(list(body.frames))].sort();
  if (picked.length === 0) return nora("Bewaar de fragmenten waarop iemand of een pas te zien is.", "incomplete");
  if (picked.some((id) => ["dock-0244", "entry-0155", "gate-0233"].includes(id))) {
    return nora("Een leeg fragment zet niemand op een plek.", "mismatch");
  }
  if (!same(picked, wanted)) return nora("Er mist een moment waarop een persoon of een pas ergens blijft.", "mismatch");
  return { ok: true };
}

function gradePlaces(body: Record<string, unknown>): Grade {
  const places = record(body.places);
  if (!text(places.vale) || !text(places.crew) || !text(places.okonkwo) || !text(places.crowe) || !text(body.badge)) {
    return nora("Zet elke persoon op een plek en zeg of de pasregistratie daarbij past.", "incomplete");
  }
  if (text(places.vale) === "dok") return nora("De registratie noemt zijn pas. Het beeld van die minuut toont hem niet bij die deur.", "mismatch");
  if (text(body.badge) === "same") return nora("De pasregistratie en de beelden van 02:31 noemen niet dezelfde situatie.", "mismatch");
  const ok = text(places.vale) === "kantine" && text(places.crew) === "dok" && text(places.okonkwo) === "rek" && text(places.crowe) === "kantoor" && text(body.badge) === "apart";
  return ok ? { ok: true } : nora("Een verklaring en een beeld wijzen nog niet naar dezelfde plek.", "mismatch");
}

function gradeShare(body: Record<string, unknown>): Grade {
  if (!text(body.setting) || !text(body.opened) || !text(body.message)) return nora("Koppel de deelinstelling, de openingsregel en het chatbericht.", "incomplete");
  if (text(body.opened) === "02:14" || text(body.opened) === "02:44") {
    return nora("Dat tijdstip hoort bij de latere aanval, niet bij het eerste moment waarop het bestand buiten stond.", "mismatch");
  }
  if (text(body.setting) === "18:12") return nora("Die instelling hield het bestand bij één adres.", "mismatch");
  const ok = text(body.setting) === "19:04" && text(body.opened) === "19:06" && text(body.message) === "19:05";
  return ok ? { ok: true } : nora("Die drie regels horen niet bij dezelfde deelactie.", "mismatch");
}

function gradeReport(body: Record<string, unknown>): Grade {
  const evidence = [...new Set(list(body.evidence))];
  if (!text(body.person) || !text(body.document) || !text(body.cause) || !text(body.intent) || evidence.length === 0) {
    return nora("Het rapport is nog niet compleet.", "incomplete");
  }
  const visualOnly = evidence.every((id) => id === "cam-dock" || id === "badge-cafe");
  if (visualOnly) return nora("Een beeld van een deur bewijst niet dat een bestand is gedeeld.", "mismatch");
  if (text(body.intent) === "deliberate") return nora("De geschiedenis toont een deelactie voor de vloer. Er is geen bericht waarin iemand de aanval afspreekt.", "mismatch");
  if (text(body.cause) === "phish" || text(body.cause) === "export") return nora("Dat hoort bij de latere aanval, niet bij het eerste moment waarop de planning buiten stond.", "mismatch");
  const needed = ["chat-link", "external-open", "share-log"];
  const hasProof = needed.every((id) => evidence.includes(id));
  const ok = text(body.person) === "adler" && text(body.document) === "planning" && text(body.cause) === "open-link" && text(body.intent) === "unintended" && hasProof;
  return ok ? { ok: true, token: "INSIDER:ADLER" } : nora("Die combinatie legt het delen nog niet uit. Kijk wie de link wijzigde.", "mismatch");
}

function gradeCables(body: Record<string, unknown>): Grade {
  const portsOk = body.DNS === "53" && body.AUTH === "443" && body.LOG === "514" && body.TRAP === "PARK";
  const order = list(body.order);
  if (!portsOk && order.length < 3) return nora("De kast en de startvolgorde zijn nog niet compleet.", "incomplete");
  if (!portsOk) return nora("Een kabel zit op een poort die niet bij dat systeem past, of de val raakt de bus.", "mismatch");
  if (!same(order, ["DNS", "AUTH", "VAULT"])) return nora("De systemen starten niet in de volgorde van hun afhankelijkheid.", "mismatch");
  return { ok: true };
}

export function grade(puzzleId: string, payload: unknown): Grade {
  const body = record(payload);
  switch (puzzleId) {
    case "ch1-bays":
      return gradeArchive(body);
    case "ch1-login":
      return gradePhoto(body);
    case "ch1-nodes":
      return gradeBoard(body);
    case "ch1-ports":
      return gradeRecon(body);
    case "ch2-acrostic":
      return gradeSupplier(body);
    case "ch2-meta":
      return gradeAttachment(body);
    case "ch2-timeline":
      return gradeNight(body);
    case "ch2-trace":
      return gradeTrace(body);
    case "ch3-logic":
      return gradeSession(body);
    case "ch3-path": {
      const path = list(body.path);
      if (path.length < 2 || path[0] !== "CRU" || path[path.length - 1] !== "VAULT") {
        return nora("De lijn moet bij Nexora beginnen en bij de kluis eindigen.", "incomplete");
      }
      const edges = edgeSet();
      const seen = new Set<string>();
      for (let i = 0; i < path.length; i++) {
        if (bad.has(path[i]) || seen.has(path[i])) return nora("Die sprong staat niet in de authenticatielog.", "mismatch");
        seen.add(path[i]);
        if (i > 0 && !edges.has(`${path[i - 1]}>${path[i]}`)) return nora("Die sprong staat niet in de authenticatielog.", "mismatch");
      }
      return { ok: true };
    }
    case "ch3-boot":
      return gradeIsolate(body);
    case "ch3-cables":
      return gradeCables(body);
    case "ch4-symbols":
      return gradeDamage(body);
    case "ch4-sequence":
      return Number(body.value) === 22 ? { ok: true } : nora("Die waarde volgt niet uit de cycli in het handboek.", "mismatch");
    case "ch4-rotor":
      if (text(body.shape) !== "square") return nora("Het zegel op de cassette is nog niet compleet.", "mismatch");
      return upper(body.word) === "SEAL" ? { ok: true, token: "SEAL" } : nora("Deze rotorstand levert het zegel nog niet.", "mismatch");
    case "ch4-backup":
      return gradeCopy(body);
    case "ch4-decode":
      if (!upper(body.code)) return nora("Lees de herstelde toegangslog en wijs de pas aan.", "incomplete");
      return upper(body.code).replace("-", "") === "HX19" ? { ok: true, token: "HX-19" } : nora("Die pas hoort niet bij de leverancier op het dok.", "mismatch");
    case "ch5-camera":
      return gradeStills(body);
    case "ch5-places":
      return gradePlaces(body);
    case "ch5-share":
      return gradeShare(body);
    case "ch5-accuse":
      return gradeReport(body);
    case "ch6-seals":
      if (!upper(body.perimeter) || !upper(body.trace) || !upper(body.lockout)) return nora("Elk systeem wacht nog op een token.", "incomplete");
      return upper(body.perimeter) === "SEAL" && upper(body.trace) === "DOCK-244" && upper(body.lockout) === "HX-19"
        ? { ok: true }
        : nora("Een token ligt op een systeem dat er niet bij past.", "mismatch");
    case "ch6-shutdown":
      if (list(body.order).filter(Boolean).length < 4) return nora("De vier stappen zijn nog niet gevuld.", "incomplete");
      return same(list(body.order).map((item) => item.toUpperCase()), ["N74192", "DOCK-244", "ROUTE-7", "HX-19"])
        ? { ok: true }
        : nora("Die volgorde volgt de missies niet.", "mismatch");
    default:
      return { ok: false, reason: "mismatch" };
  }
}
