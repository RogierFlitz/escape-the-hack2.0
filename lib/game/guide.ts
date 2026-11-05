export type NoraBrief = {
  situatie: string;
  doel: string;
  actie: string;
};

const alias: Record<string, string> = {
  seals: "ch6-seals",
  shutdown: "ch6-shutdown",
};

function idOf(id: string) {
  return alias[id] ?? id;
}

const briefs: Record<string, NoraBrief> = {
  "ch1-bays": {
    situatie: "KADE keek naar openbare berichten voordat hij een naam gebruikte.",
    doel: "Bepaal welke bron bij welke vraag hoort.",
    actie: "Open een bron, koppel die aan één vraag en dien de verbanden in.",
  },
  "ch1-login": {
    situatie: "Op een openbare foto liggen spullen die een vreemde kan lezen.",
    doel: "Markeer wat hij uit die foto kon halen.",
    actie: "Vergroot de foto, tik leesbare details aan en laat lege plekken open.",
  },
  "ch1-nodes": {
    situatie: "De bronnen liggen los. Samen vertellen ze hoe hij jullie leerde kennen.",
    doel: "Koppel elk bewijsstuk aan de vraag die het beantwoordt.",
    actie: "Kies een bewijsstuk, koppel het aan één vraag en controleer het bord.",
  },
  "ch1-ports": {
    situatie: "Zijn klad vat samen wat hij al wist, nog vóór een vervalst bericht.",
    doel: "Reconstrueer welk evenement, welke naam en welke volgende stap hij had.",
    actie: "Kies rechts alleen wat je al hebt aangetoond en leg de reconstructie vast.",
  },
  social: {
    situatie: "Niet elk openbaar bericht helpt iemand die zich voorbereidt.",
    doel: "Kies de vijf sporen die een geloofwaardig verhaal over Nexora maken.",
    actie: "Tik vijf berichten aan. Een tweede tik haalt een keuze weg.",
  },
  "ch2-acrostic": {
    situatie: "Er ligt post die op Helix lijkt, tussen gewone berichten.",
    doel: "Wijs het bericht aan dat niet van de echte leverancier komt.",
    actie: "Vergelijk naam, volledig adres en verzoek met het dossier, en onderbouw met twee bronnen.",
  },
  "ch2-meta": {
    situatie: "De bijlage hoort bij een planning die Helix eerder stuurde.",
    doel: "Zie wat dit bestand riskant maakt.",
    actie: "Zet de bijlage naast de eerdere planning en markeer het verschil.",
  },
  "ch2-timeline": {
    situatie: "Die nacht gebeurde meer dan de aanval die jullie vandaag zagen.",
    doel: "Zet zijn voorbereiding in de juiste volgorde.",
    actie: "Gebruik de tijden in de log. Niet elke gebeurtenis hoort in de keten.",
  },
  "ch2-trace": {
    situatie: "Er zijn meerdere exports. Eén daarvan verliet het dok.",
    doel: "Bevestig welke export echt vertrok.",
    actie: "Kies die export en minstens twee bronnen die hetzelfde spoor laten zien.",
  },
  "ch3-logic": {
    situatie: "Er zijn sessies van de nacht en van de werkdag. Eén hoort niet bij normaal werk.",
    doel: "Wijs de sessie aan die afwijkt.",
    actie: "Vergelijk tijd, herkomst en bestemming, en kies minstens twee aanwijzingen.",
  },
  "ch3-path": {
    situatie: "De sessie bewoog in sprongen. Niet elke sprong is een doorgang.",
    doel: "Teken de route die in de log staat.",
    actie: "Tik alleen stappen die de log noemt, van het begin tot de plek met de bestanden.",
  },
  "ch3-boot": {
    situatie: "De sessie staat nog tussen de andere systemen.",
    doel: "Zet haar tijdelijk apart zonder het herstel onmogelijk te maken.",
    actie: "Kies wat apart moet en wat bereikbaar moet blijven, en voer dat uit.",
  },
  "ch3-cables": {
    situatie: "Na het apart zetten moeten de veilige verbindingen terug.",
    doel: "Herstel de kast en start de systemen in een volgorde die klopt.",
    actie: "Koppel elke functie aan de poort uit het schema en start wat nergens op wacht eerst.",
  },
  "ch4-symbols": {
    situatie: "Een deel van de kluis is niet meer leesbaar.",
    doel: "Markeer alleen de bestanden die op slot zitten.",
    actie: "Open elk bestand. Wat je nog kunt lezen, is geen schade.",
  },
  "ch4-sequence": {
    situatie: "Het herstel vraagt een volgende controlewaarde uit het handboek.",
    doel: "Vul de waarde die op de reeks volgt.",
    actie: "Lees het patroon in het handboek en zet de controle vast.",
  },
  "ch4-rotor": {
    situatie: "De kluis vraagt een zegel voordat een kopie terug mag.",
    doel: "Maak het zegel af met wat je al hebt gevonden.",
    actie: "Gebruik een token uit de inventaris voor de rotor en maak de cassette af.",
  },
  "ch4-backup": {
    situatie: "Er zijn drie kopieën. Een nieuwere kopie is niet vanzelf veilig.",
    doel: "Kies de kopie die je durft terug te zetten.",
    actie: "Vergelijk tijdstip, controlewaarde en of de kopie al ergens naartoe ging.",
  },
  backup: {
    situatie: "De bestanden zijn op slot. Iemand biedt kopieën aan.",
    doel: "Kies de kopie die de aanval niet opnieuw binnenhaalt.",
    actie: "Lees de drie rapporten en kies er één.",
  },
  "ch4-decode": {
    situatie: "De gekozen kopie staat klaar. De toegangslog hoort erbij.",
    doel: "Zet de schone set terug en lees wie erbij kon.",
    actie: "Kies het controlepunt, open het logboek en wijs de pas van de leverancier aan.",
  },
  "ch5-camera": {
    situatie: "De camera's tonen personen en passen. Dat is niet hetzelfde.",
    doel: "Bewaar de beelden waarop iemand of een pas echt te zien is.",
    actie: "Bekijk beide stills per camera. Lege beelden laat je liggen.",
  },
  "ch5-places": {
    situatie: "Een pasregistratie en een beeld kunnen over dezelfde minuut gaan en toch iets anders tonen.",
    doel: "Leg vast waar iedereen was.",
    actie: "Koppel elke persoon aan één plek en zeg of pas en beeld hetzelfde laten zien.",
  },
  "ch5-share": {
    situatie: "De planning was even leesbaar buiten Nexora.",
    doel: "Vind hoe dat delen ontstond.",
    actie: "Wijs de wijziging, het moment van openen en het bericht aan dat daarbij hoort.",
  },
  "ch5-accuse": {
    situatie: "Er zijn beelden, een document en een deelgeschiedenis.",
    doel: "Trek één conclusie die al dat bewijs dekt.",
    actie: "Vul persoon, document, oorzaak, bedoeling en bewijs in. Een camera alleen is niet genoeg.",
  },
  access: {
    situatie: "Er staan nog sessies open. Eén hoort niet bij de gewone werkdag.",
    doel: "Wijs de sessie aan die de aanval in stand houdt.",
    actie: "Vergelijk wat elke sessie deed en kies minstens twee sporen die daarbij passen.",
  },
  revoke: {
    situatie: "De sessie is aangewezen. Zolang ze openstaat, is de deur niet dicht.",
    doel: "Sluit die verbinding.",
    actie: "Bevestig de sluiting pas als de sporen kloppen.",
  },
  "ch6-seals": {
    situatie: "De kritieke systemen wachten op een bevestiging.",
    doel: "Zet elk systeem vast met het token dat daarbij past.",
    actie: "Leg de tokens die je al hebt op de juiste systemen.",
  },
  "backup-check": {
    situatie: "Terugzetten is pas klaar als de open lijnen ook dicht zijn.",
    doel: "Controleer of het herstel schoon is.",
    actie: "Vink alleen af wat bij een schone set hoort, inclusief een deling die nog openstaat.",
  },
  "ch6-shutdown": {
    situatie: "De vondsten uit de eerdere missies liggen klaar.",
    doel: "Sluit het incident in de volgorde waarin jullie het ontdekten.",
    actie: "Zet de vondsten op volgorde en bevestig de afsluiting.",
  },
};

const hits: Record<string, string> = {
  "ch1-bays": "KADE: Openbare berichten zijn mijn voorbereiding, niet een inbraak. Het signaal is planning, een naam of een locatie die iedereen kon lezen.",
  "ch1-login": "KADE: Een feestfoto voelt onschuldig, en daar rekende ik op. Het signaal is een pas, een planning of een bord dat op de achtergrond leesbaar is.",
  "ch1-nodes": "KADE: Losse feitjes zijn ongevaarlijk tot iemand ze combineert. Het signaal is een verhaal dat klopt: wie, waar en met welke partner.",
  "ch1-ports": "KADE: Ik hoefde nog niets te kraken. Het signaal is dat ik al een evenement, een vertrouwde naam en een volgende stap had.",
  social: "KADE: Ik zocht geen wachtwoord. Ik zocht feiten die een vreemde een geloofwaardig verhaal geven.",
  "ch2-acrostic": "KADE: Een bekende naam en een logo moesten de haast winnen. Het signaal zat in het volledige adres en in een verzoek dat je niet verwachtte.",
  "ch2-meta": "KADE: Een bijlage van een bekende afzender voelt als het echte bestand. Het signaal is een andere maker of een regel die er eerder niet stond.",
  "ch2-timeline": "KADE: Ik was al bezig voordat jullie de mail van vandaag zagen. Het signaal is de volgorde in de log, niet de drukte van die nacht.",
  "ch2-trace": "KADE: Meerdere exports laten het lijken alsof er niets bijzonders vertrok. Het signaal is de export die het dok echt verliet, terug te zien in log en bijlage.",
  "ch3-logic": "KADE: Een account dat al mocht inloggen, vroeg niemand om een extra controle. Het signaal is een sessie buiten de werkdag, naar de plek waar de bestanden liggen.",
  "ch3-path": "KADE: Systemen die elkaar vertrouwen, laten mij doorlopen. Het signaal is de sprong die in de log staat, niet elke lijn op de kaart.",
  "ch3-boot": "KADE: Alles uitzetten voelt daadkrachtig, en dan raken jullie de log en de kopie kwijt. Het signaal is apart zetten zonder het herstel te sluiten.",
  "ch3-cables": "KADE: Een kast die half los hangt, lokt een snelle herstart. Het signaal is de volgorde: eerst wat nergens op wacht, dan wat daarop leunt.",
  "ch4-symbols": "KADE: Bestanden op slot zetten stopt het werk, ook als er nog een kopie is. Het signaal is een bestand dat je niet meer kunt lezen.",
  "ch4-sequence": "KADE: Een controlewaarde oogt als techniek, zodat je gaat gokken. Het signaal staat als patroon in het handboek, niet in een wachtwoord.",
  "ch4-rotor": "KADE: Een zegel dat er ingewikkeld uitziet, jaagt je naar een gok. Het signaal ligt in een token dat je al had en in het patroon op de cassette.",
  "ch4-backup": "KADE: Een nieuwere kopie voelt veiliger, en daar rekende ik op. Het signaal is het tijdstip en of die kopie al naar buiten ging.",
  backup: "KADE: Ik bied een snelle kopie aan op het moment dat het werk stilstaat. Het signaal is een kopie van ná het slot, of een kopie die al ergens naartoe ging.",
  "ch4-decode": "KADE: Terugzetten voelt als het einde, terwijl de toegang nog in het logboek staat. Het signaal is wie erbij kon, niet alleen dat het bestand weer opent.",
  "ch5-camera": "KADE: Een persoon in beeld trekt de schuld naar zich toe. Het signaal is het verschil tussen iemand en een pas die blijft liggen.",
  "ch5-places": "KADE: Een pasregistratie klinkt als bewijs dat die persoon daar stond. Het signaal is een beeld van diezelfde minuut dat iets anders toont.",
  "ch5-share": "KADE: Een link is sneller dan een gecontroleerde verzending, en haast wint. Het signaal is een deling die ruimer werd dan één bekende ontvanger.",
  "ch5-accuse": "KADE: Ik had geen medeplichtige nodig. Het signaal is een document dat buiten leesbaar werd, niet een gezicht op een camera.",
  access: "KADE: Een gewone functienaam is mijn dekmantel. Het signaal is wat de sessie deed, niet hoe de naam klinkt.",
  revoke: "KADE: Een aangewezen sessie die open blijft, is nog steeds een deur. Het signaal is de sluiting zelf, niet het onderzoek ervoor.",
  "ch6-seals": "KADE: Herstel zonder de systemen vast te zetten laat mij terugkomen. Het signaal is een token op het systeem dat daarbij hoort.",
  "backup-check": "KADE: Een leesbaar bestand voelt als winst, ook als een deellink nog openstaat. Het signaal is een lijn naar buiten die je nog niet hebt gesloten.",
  "ch6-shutdown": "KADE: De aanval stopte niet bij het eerste spoor. Het signaal is de volgorde: eerst wat ik wist, dan hoe ik binnenkwam, dan wat jullie sloten.",
};

const misses: Record<string, string> = {
  "ch1-bays": "KADE: Niet elke openbare post helpt mij. Zoek wat een vreemde een geloofwaardig verhaal over jullie werk geeft.",
  "ch1-login": "KADE: Ik gebruik wat leesbaar is, niet de aankleding. Een mok of een plant opent geen deur.",
  "ch1-nodes": "KADE: Een bewijsstuk bij de verkeerde vraag maakt mijn verhaal slordig. Elk stuk hoort bij één vraag.",
  "ch1-ports": "KADE: Dit klad gaat over wat ik wist, niet over hoe ik later binnenkwam. Blijf bij het evenement, de naam en de volgende stap.",
  social: "KADE: Sfeer zonder naam, plek of partner kan ik niet gebruiken. Kies wat een vreemde over jullie werk kan naspelen.",
  "ch2-acrostic": "KADE: Ik leunde op een naam die jullie al vertrouwden. Het signaal is het hele adres en een verzoek dat je niet verwachtte.",
  "ch2-meta": "KADE: De bestandsnaam moest vertrouwd ogen. Het signaal is wie het maakte en welke regel er nieuw in staat.",
  "ch2-timeline": "KADE: Drukte in de log is geen keten. Het signaal is de volgorde van de stappen die bij mijn voorbereiding horen.",
  "ch2-trace": "KADE: Een afgebroken of geweigerde export leidt af. Het signaal is de export die het dok verliet en in de bijlage terugkomt.",
  "ch3-logic": "KADE: Ik gebruikte een account dat al mocht, geen nieuw wachtwoord. Vergelijk tijd, herkomst en bestemming.",
  "ch3-path": "KADE: Een geweigerde sprong is geen doorgang. Volg alleen de stappen die de log echt toelaat.",
  "ch3-boot": "KADE: Alles uitzetten lijkt veilig en kost jullie het bewijs. Apart zetten is iets anders dan de log of de kopie sluiten.",
  "ch3-cables": "KADE: Een kabel op de verkeerde poort of een val op de live lijn houdt de deur open. Het schema zegt welke functie waar hoort.",
  "ch4-symbols": "KADE: Een bestandsnaam zegt niet of ik het slot heb gezet. Het signaal is een bestand dat je niet meer kunt lezen.",
  "ch4-sequence": "KADE: Dit is geen code om te gokken. Het handboek laat zien hoe de reeks loopt.",
  "ch4-rotor": "KADE: Het zegel oogt technisch zodat je raadt. Gebruik wat je al vond, niet een nieuwe gok.",
  "ch4-backup": "KADE: Nieuw voelt veilig, en dat is de truc. Kijk wanneer de kopie is gemaakt en of iemand haar al had aangeraakt.",
  backup: "KADE: Een snelle kopie op een stil moment is mijn aanbod. Nieuw of al doorgestuurd is het signaal om haar te laten staan.",
  "ch4-decode": "KADE: Openen is niet hetzelfde als controleren wie erbij kon. Het logboek noemt de pas.",
  "ch5-camera": "KADE: Een leeg beeld zet niemand op een plek. Bewaar alleen waar een persoon of een pas echt te zien is.",
  "ch5-places": "KADE: Een pas in het log is niet automatisch die persoon in beeld. Leg registratie en beeld naast elkaar.",
  "ch5-share": "KADE: Een later tijdstip hoort bij de aanval, niet bij het eerste delen. Zoek wanneer de planning voor het eerst ruimer openstond.",
  "ch5-accuse": "KADE: Een gezicht op een camera is nog geen oorzaak. Koppel het document en de manier waarop het gedeeld werd.",
  access: "Aanvaller: Een functienaam is een dekmantel. Het signaal is wat de sessie deed, niet hoe de titel klinkt.",
  revoke: "Aanvaller: Onderzoek zonder sluiten laat de deur open. De keuze is de verbinding verbreken.",
  "ch6-seals": "KADE: Een token op het verkeerde systeem zet niets vast. Elk systeem vraagt het token dat daarbij past.",
  "backup-check": "Aanvaller: Een open deellink laat de planning leesbaar voor wie de link heeft. Die hoort dicht bij een schone afsluiting.",
  "ch6-shutdown": "KADE: De afsluiting is de volgorde van wat jullie vonden. Een andere volgorde vertelt een ander incident.",
};

export function noraBrief(id: string): NoraBrief | null {
  return briefs[idOf(id)] ?? null;
}

export function kadeHit(id: string): string | null {
  return hits[idOf(id)] ?? null;
}

export function kadeMiss(id: string): string | null {
  return misses[idOf(id)] ?? null;
}

export const GUIDE_IDS = Object.keys(briefs);
