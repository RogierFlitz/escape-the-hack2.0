export const noraShutdown =
  "Er staat nog een sessie open die niet bij de gewone werkdag hoort. We moeten die verbinding herkennen aan wat ze heeft gedaan, de kritieke systemen vastzetten, de sessie intrekken en daarna controleren of het herstel nog klopt. Ik wijs de sessie niet aan.";

export const noraReady = [
  "De sessie is ingetrokken.",
  "De kritieke systemen zijn vastgezet.",
  "De gecontroleerde back-up klopt.",
  "We kunnen het incident nu afsluiten.",
];

export const kadeAfterRevoke = [
  "Die sessie is dicht.",
  "Dat had ik niet verwacht.",
  "Maar een dichte deur is nog geen schoon systeem.",
  "Kijk of wat jullie terugzetten nog klopt.",
  "Eén open lijn is genoeg om opnieuw binnen te lopen.",
];

export const alertLines = [
  "Ongeautoriseerde sessie nog actief.",
  "Kritieke systemen wachten op bevestiging.",
  "Het herstel is nog niet afgerond.",
];

export const finaleSessions = [
  { id: "vale", title: "j.vale", where: "Workstation-14", note: "Mailbox om 02:14. Geen export." },
  { id: "okonkwo", title: "m.okonkwo", where: "Rek 7", note: "Onderhoudsticket van 01:00 tot 03:00." },
  { id: "backup-svc", title: "backup-svc", where: "VAULT naar LOG", note: "Kluiskopie om 03:10." },
  { id: "helix-svc", title: "helix-svc", where: "Export-node", note: "Nog aangemeld. Bezocht de kluis om 02:06." },
  { id: "crowe", title: "l.crowe", where: "Analyse", note: "Rapport om 02:51. Geen export." },
];

export const finaleClues = [
  { id: "vault", label: "Las de bestandskluis om 02:06" },
  { id: "export", label: "Export om 02:44 vanaf de export-node" },
  { id: "route", label: "Sprong via EDGE, DNS en AUTH" },
  { id: "mail", label: "Opende alleen de mailbox" },
  { id: "rack", label: "Stond bij rek 7" },
  { id: "copy", label: "Schreef de nachtelijke kluiskopie" },
];

export const sealNodes = [
  { id: "perimeter", label: "Perimeter", place: "12% / 28%" },
  { id: "trace", label: "Trace", place: "48% / 62%" },
  { id: "lockout", label: "Lockout", place: "78% / 34%" },
];

export const shutdownSteps = [
  { id: "onderzoek", label: "Onderzoek" },
  { id: "export", label: "Export" },
  { id: "route", label: "Route" },
  { id: "leverancier", label: "Leverancier" },
];

export const restoreChecks = [
  { id: "revoked", label: "De gekozen sessie is ingetrokken" },
  { id: "route", label: "De route naar de kluis is beperkt" },
  { id: "kluis", label: "Herstel kwam uit de nachtelijke kluis" },
  { id: "files", label: "Planning, contract en agenda zijn weer leesbaar" },
  { id: "share-closed", label: "De open deellink van de planning sluiten" },
  { id: "share-open", label: "De deellink open laten staan" },
];
