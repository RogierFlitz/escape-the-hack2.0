import "server-only";

const hints: Record<string, [string, string, string]> = {
  "ch1-bays": [
    "Open bronnen die over het evenement, een partner of een medewerker gaan. Niet elke foto hoort daarbij.",
    "Zes vragen, zes verschillende bronnen. Eén noemt wie leidt, één waar, één de partner, één iemand die iets meefotografeerde, één waarom die partnernaam vertrouwen wekt, en één wat iedereen kon lezen.",
    "De leider staat in het bedrijfsbericht. De zaal staat op de opbouwfoto. De partner heet in het bericht over vloer en rigging. De post met de planning op tafel is het lek. De openbare partnerkaart maakt een vervalste mail geloofwaardig. Het socialbericht over twee weken vrij laat zien dat iedereen die vakantie kon lezen.",
  ],
  "ch1-login": [
    "Zoom in op de tafel en de achtergrond. Niet elk voorwerp is een spoor.",
    "Een pas, een vel papier, een bord van de zaal en een keycord horen bij zijn voorbereiding.",
    "Laat de mok en de plant liggen. Markeer pas, planning, zaalbord en keycord.",
  ],
  "ch1-nodes": [
    "Koppel elk bewijsstuk aan de vraag die het echt beantwoordt.",
    "De leider is niet de leverancier. Degene die de planning deelde is niet degene die alleen op een profiel staat.",
    "Mara hoort bij wie leidt. De zaal bij de plek. Helix bij de partner. Adler bij het lek. De openbare vermelding bij het vertrouwen.",
  ],
  "ch1-ports": [
    "Het zip-bestand is zijn klad. Vul alleen in wat je al hebt aangetoond.",
    "Het evenement is niet de kwartaalpost. De naam die hij kon misbruiken is de bouwpartner.",
    "Nexora Day, Helix Events, en de volgende stap is die naam als afzender gebruiken. Hoe hij binnenkwam, staat hier nog niet.",
  ],
  "ch2-acrostic": [
    "Vergelijk het adres in het leveranciersdossier met de afzender van elk bericht. Een bekende naam is nog geen bewijs.",
    "Eén mail wijkt af in het domein. Leg die naast het contract en een eerder bericht van het echte adres.",
    "Het dossier noemt helix-events.nl. Het bericht waarin een letter en het land ontbreken, is de vreemde. Gebruik het contract en de eerdere correspondentie.",
  ],
  "ch2-meta": [
    "Zet de bijlage naast de planning uit de eerdere mail van Helix.",
    "Kijk naar wie het bestand maakte en welke regel alleen in de nieuwe versie staat.",
    "De maker hoort niet bij het contractadres. De extra regel stuurt iemand naar het dok. Dat is het risico.",
  ],
  "ch2-timeline": [
    "De tijden staan in de nachtlog, niet op de kaarten. Dit speelt vóór de aanval die jullie vandaag zagen.",
    "Zoek wat er om 02:14, 02:31 en 02:44 gebeurde. Onderhoud en een spiegelkopie horen niet in de keten.",
    "Eerst de geopende mail, dan de pas bij het dok, dan de export die het dok verliet.",
  ],
  "ch2-trace": [
    "Niet elke job in de log is vertrokken. Zoek welke export het dok daadwerkelijk verliet.",
    "Leg die job naast de gewijzigde bijlage. Hetzelfde spoor moet in beide terugkomen.",
    "De afgebroken job en de afgekeurde proef zijn het niet. De job die om 02:44 als helix-svc vertrok, hoort bij de dokregel in de bijlage.",
  ],
  "ch3-logic": [
    "Filter op nacht en op ongebruikelijk. Niet elke nachtelijke regel is de sessie die je zoekt.",
    "Vergelijk het leveranciersportaal overdag met het serviceaccount dat vóór de mail een kluisnaam opvroeg. De geplande back-up schrijft de andere kant op.",
    "Twee sporen: het tijdstip vóór 02:14, en de bestemming van die lookup. De naam Helix alleen is niet genoeg.",
  ],
  "ch3-path": [
    "De tijden in de sprongenlog bepalen de volgorde. Een geweigerde scan is geen doorgang.",
    "Begin bij het werkstation, ga naar buiten, en volg daarna de lookup naar het ticket en de kluis.",
    "Sla de honeypot en de proxy over. De lijn loopt via de naamserver en authenticatie.",
  ],
  "ch3-boot": [
    "Isoleer tijdelijk. De finale trekt de sessie pas echt in.",
    "De logserver moet blijven, de kluis en de naamomzetting ook. Apart zetten is niet hetzelfde als alles uitzetten.",
    "Zet de leverancierssessie in de valomgeving en laat de log bereikbaar. Nieuwe tunnels op de buitenkant mogen dicht.",
  ],
  "ch3-cables": [
    "Het schema noemt de poort bij elke functie. De status toont wat geen link meer heeft.",
    "De val hoort niet op een live poort. Daarna start je wat nergens op wacht, en eindig je bij wat op authenticatie wacht.",
    "Koppel elke functie aan de poort uit het schema en parkeer de val. Start naamomzetting, dan sessiecontrole, dan de kluis.",
  ],
  "ch4-symbols": [
    "Open elk bestand. Een naam alleen zegt nog niet of het geraakt is.",
    "Vergelijk de controlewaarde en het tijdstip. Wat je nog als tekst kunt lezen, is niet de schade.",
    "De planning, het contract, het personeelsbestand, de financiën en de agenda lezen niet meer. Het menu, het handboek en het contact wel.",
  ],
  "ch4-sequence": [
    "De cycli staan in het herstelhandboek, niet op de rotor.",
    "Kijk naar het verschil tussen de vier getallen. Dat verschil wordt steeds groter.",
    "Het verschil groeit telkens met één. Pas die regel nog één keer toe op de laatste cyclus.",
  ],
  "ch4-rotor": [
    "Het handboek zegt waar de rotatie vandaan komt. De cassette hoort bij dezelfde stap.",
    "Gebruik het routetoken voor de rotor, en het patroon voor het ontbrekende teken op de cassette.",
    "De rotatie is het reknummer in dat token. Het ontbrekende teken is wat de verschuiving op de open plek achterlaat.",
  ],
  "ch4-backup": [
    "Een nieuwere kopie is niet vanzelf beter. Lees de drie rapporten.",
    "Leg het tijdstip naast het moment waarop de bestanden op slot gingen. Kijk ook wie de kopie heeft aangeraakt.",
    "Een gelijke controlewaarde is niet genoeg als de toegangslog een kopie naar buiten toont. De nachtelijke job naar de logserver hoort bij de schone cyclus.",
  ],
  "ch4-decode": [
    "Zet het herstelpunt op de cyclus die je hebt vastgezet, niet op een latere.",
    "Na de controle kun je de bestanden openen. De pas die je zoekt staat in de toegangslog van het dok.",
    "Niet de Nexora-badge en niet de geweigerde cateringpas. De crewpas van de leverancier op de dokpoort.",
  ],
  "ch5-camera": [
    "Niet elk fragment is leeg. Bewaar het moment waarop er iemand of een pas te zien is.",
    "Vergelijk 02:31 in de dokzaal met de kantine ervoor en erna. Kijk ook naar de zijpoort en naar wie later de hal in komt.",
    "Bewaar het kantinebeeld waarop de pas blijft liggen, het dokbeeld van 02:31, de aankomst bij de zijpoort en de persoon uit de kantoren. De lege fragmenten niet.",
  ],
  "ch5-places": [
    "Een pasregistratie noemt een naam. Een camera laat een plek zien. Dat hoeft niet dezelfde persoon te zijn.",
    "Leg de kantinebeelden naast de regel van 02:31. Het onderhoudsticket en de entree horen bij twee andere mensen.",
    "De pas ligt nog in de kantine wanneer de log het dok noemt. De werkjas staat bij de zaal. Rek 7 en de kantoren kloppen met de verklaringen die daarbij horen.",
  ],
  "ch5-share": [
    "Het eerste moment waarop het bestand buiten stond, ligt vóór de nacht van de aanval.",
    "Zet de wijziging in de deelgeschiedenis naast het chatbericht van die avond en de regel over een opening van buitenaf.",
    "Niet de mail van 02:14 en niet de export van 02:44. De link die de avond ervoor voor iedereen is opengezet, en het bericht daarover.",
  ],
  "ch5-accuse": [
    "Een deurbeeld laat zien wie ergens stond. Het zegt niet wie een bestand heeft gedeeld.",
    "Het rapport heeft de deelgeschiedenis, de chat over die link en de opening van buitenaf nodig. Kijk daarna of iemand de aanval afsprak.",
    "De persoon in de documentgeschiedenis hoort bij de deellink, niet bij de export of de phishingmail. Er is geen bericht dat de aanval afspreekt.",
  ],
  "ch6-seals": [
    "De inventaris noemt waar elk token vandaan komt. Het scherm noemt de systemen, niet de codes.",
    "Het zegel uit de herstelcassette hoort bij de rand. Het exportspoor hoort bij trace. De crewpas hoort bij het slot.",
    "Drie plekken: rand, spoor en slot. Het dossiernummer en het routetoken horen niet op deze drie.",
  ],
  "ch6-shutdown": [
    "De volgorde volgt de missies, van de eerste vondst tot de laatste code.",
    "Eerst het onderzoek, dan het exportspoor, dan de route, dan de leverancierscode.",
    "Vier stappen, in de volgorde waarin jullie ze vonden. Het herstelzegel hoort niet in deze rij.",
  ],
};

const rescue: Record<string, string> = {
  "ch1-bays": "Zet de leider op het bedrijfsbericht, de zaal op de opbouwfoto, de partner op het vloerbericht, het lek op de post met de planning, het vertrouwen op de openbare partnerkaart en de vakantie op het socialbericht.",
  "ch1-login": "Markeer alleen de pas, de planning, het zaalbord en het keycord. Laat de mok en de plant liggen.",
  "ch1-nodes": "Mara bij wie leidt. De zaal bij de plek. Helix bij de partner. Adler bij het lek. De openbare vermelding bij het vertrouwen.",
  "ch1-ports": "Vul het evenement Nexora Day in, de partner Helix Events, en als volgende stap die naam als afzender gebruiken.",
  "ch2-acrostic": "Kies het bericht waarvan het domein helix-events.nl afwijkt. Leg daarnaast het contract en de eerdere mail van het echte adres.",
  "ch2-meta": "Markeer de maker die niet bij het contractadres hoort, en de extra regel die iemand naar het dok stuurt.",
  "ch2-timeline": "Zet op volgorde: eerst de geopende mail, dan de pas bij het dok, dan de export die het dok verliet.",
  "ch2-trace": "Kies de job die om 02:44 als helix-svc het dok verliet. Niet de afgebroken job en niet de afgekeurde proef.",
  "ch3-logic": "Kies het serviceaccount dat vóór 02:14 een kluisnaam opvroeg. Het tijdstip en die bestemming zijn de twee sporen.",
  "ch3-path": "Loop van het werkstation naar buiten, dan via de naamserver en authenticatie naar de kluis. Sla de honeypot en de proxy over.",
  "ch3-boot": "Zet de leverancierssessie in de valomgeving, laat de log bereikbaar en sluit nieuwe tunnels op de buitenkant.",
  "ch3-cables": "Parkeer de val. Start daarna naamomzetting, dan sessiecontrole, dan de kluis, elk op de poort uit het schema.",
  "ch4-symbols": "Markeer de planning, het contract, het personeelsbestand, de financiën en de agenda. Het menu, het handboek en het contact niet.",
  "ch4-sequence": "Het verschil tussen de cycli wordt steeds één groter. Pas diezelfde regel nog één keer toe op het laatste getal.",
  "ch4-rotor": "Zet het reknummer uit het routetoken op de rotor. Het ontbrekende teken is wat de verschuiving op de open plek achterlaat.",
  "ch4-backup": "Kies de nachtelijke kopie naar de logserver. Een gelijke controlewaarde is niet genoeg als de log een kopie naar buiten toont.",
  "ch4-decode": "Kies de crewpas van de leverancier op de dokpoort. Niet de Nexora-badge en niet de geweigerde cateringpas.",
  "ch5-camera": "Bewaar het kantinebeeld waar de pas blijft liggen, het dokbeeld van 02:31, de aankomst bij de zijpoort en de persoon uit de kantoren.",
  "ch5-places": "De pas blijft in de kantine. De werkjas hoort bij de zaal. Rek 7 en de kantoren horen bij de verklaringen die daarbij passen.",
  "ch5-share": "Kies de link die de avond ervoor voor iedereen open is gezet, en het bericht daarover. Niet de mail van 02:14 en niet de export van 02:44.",
  "ch5-accuse": "Wijs de persoon uit de documentgeschiedenis aan, met de deellink. Er is geen bericht dat de aanval afspreekt.",
  "ch6-seals": "Rand is het zegel uit de herstelcassette, spoor is het exportspoor, slot is de crewpas. Laat het dossiernummer en het routetoken weg.",
  "ch6-shutdown": "Zet de vier vondsten in missievolgorde: eerst het onderzoek, dan het exportspoor, dan de route, dan de leverancierscode. Het herstelzegel hoort er niet in.",
};

export function hintText(puzzleId: string, level: number) {
  const row = hints[puzzleId];
  if (!row || level <= 0) return [];
  return row.slice(0, Math.min(3, level));
}

export function rescueHint(puzzleId: string) {
  return rescue[puzzleId] ?? null;
}

export function puzzleIds() {
  return Object.keys(hints);
}
