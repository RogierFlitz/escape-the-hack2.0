# Escape the Hack 2.0 — game-audit

Datum van deze lezing: 14 oktober 2026. De code is gelezen in de werkboom. Missie 6 (Final Shutdown) veranderde tijdens het lezen; die bestanden zijn niet herschreven en niet teruggedraaid.

## Samenvatting

Het spel is één incident: externe onderzoekers bij Nexora, openbare informatie over Nexora Day en de Dokzaal, een valse leverancier, een netwerkroute, herstel uit een gecontroleerde back-up, en pas daarna de conclusie dat S. Adler de planning onbedoeld deelde. Daarna moet de resterende toegang van KADE dicht.

Missies 1 tot en met 5 zijn in de code aangesloten op serverbeoordeling. De unittests daarover slagen. Missie 6 heeft een nieuwe shutdown-desk die in het spel hangt, en de unittest voor sporen plus een gesloten deellink slaagt. De live API-smoke is niet afgemaakt, en de finale is in deze audit niet in de browser uitgespeeld. Daarom staat missie 6 op **deels**.

De 60-minutenklok start in de server pas bij de breach, en de client roept die aan bij **Onderzoek starten** na NORA. De README zei nog dat de klok bij de bijlage of de melding start. Die ene zin is rechtgezet.

Er is geen P0 gevonden dat het spel onspeelbaar maakt. Het belangrijkste open punt voor een echt evenement is het beheerderswachtwoord: zolang `ADMIN_PASSWORD` leeg is, geldt een vaste fallback in de code. Zet een eigen wachtwoord voordat de laptop buiten het evenement-wifi staat. Het wachtwoord zelf staat hier niet.

## Status per missie

| Onderdeel | Status | Wat er nu staat |
| --- | --- | --- |
| 1 Digital Footprint | werkt | Archief, foto, bord en recon-zip. Server beoordeelt. Browser toonde het archief van een vers team. |
| 2 Fake Supplier | werkt | Afzender, bijlage, nachtlog, exportspoor. Token DOCK-244. |
| 3 Network Lockdown | werkt | Sessie, route, tijdelijke isolatie, patchkast. Token ROUTE-7. helix-svc wordt hier niet “KADE” genoemd. |
| 4 Encryption Protocol | werkt | Schade, controlewaarde, rotorzegel SEAL, keuze `kluis-nacht`, pas HX-19 uit de herstelde log. |
| 5 The Insider | werkt | Beelden, plekken, deelgeschiedenis, rapport. Token INSIDER:ADLER pas bij een compleet rapport met onbedoeld delen. |
| 6 Final Shutdown | deels | Nieuwe shutdown-desk is aangesloten (sessie plus twee sporen, intrekken, zegels, herstelcontrole, volgorde). Unittest slaagt. Live pad en browser zijn niet bevestigd; de bestanden waren nog in bewerking. |

## Overige schermen

| Onderdeel | Status | Wat er nu staat |
| --- | --- | --- |
| Startscherm | werkt | Join, instructeurlink, demoknoppen. In de browser geen horizontale scroll op 1024×768, 1180×820 en 1366×1024. |
| Mara-intro | werkt | `Briefing` blokkeert het kantoor tot de intro is gezien. In deze audit niet afgespeeld in de browser. |
| Kantoor | werkt | Intranet met post, agenda, documenten, mensen, leveranciers, nieuws en dossier. Stand alleen in de browser. |
| Phishing | werkt | De mail verschijnt na genoeg onderzoek, zonder vaste volgorde. **Bijlage openen** en **Melden als verdacht** starten de film, niet de klok. Melden zet wel de bonus van 200 punten. |
| KADE-aanval | werkt | Film met bestand, glitch, KADE en daarna NORA. De klok loopt daar nog niet. |
| NORA | werkt | Knop **Onderzoek starten** roept de breach aan. NORA-teksten tijdens de missies wijzen de oplossing niet aan. Hintniveau 3 is wel scherp. |
| Missieovergangen | werkt | Unittest loopt het verhaal van missie 1 tot de finale. Na NORA worden de scènes `incident` en `m1` meteen als gezien opgeslagen, dus de aparte KADE-toespraak van missie 1 speelt in het normale pad niet. |
| Eindscherm | werkt | Win: SYSTEM RESTORED. Fail: SYSTEM COMPROMISED. Score, hints, speeltijd, dossier en lessen. In deze audit niet visueel gehaald. |
| Incidentrapport | werkt | Dezelfde eindweergave, plus een tekstbestand via **Resultaat bewaren**. `/results/[code]` opent hetzelfde speelscherm. |
| Instructeursdashboard | werkt | Sessies aanmaken en starten lukte via de API. Het scherm `/admin` is niet aangeklikt. |

## Verhaallijncontrole

De boog klopt met de opdracht:

- Het startscherm en KADE noemen een extern team dat voor Nexora werkt.
- Nexora Day en de Dokzaal zitten in de openbare bronnen, de leveranciersmail en de planning.
- Missie 1 is openbare informatie. Adler staat daar als auteur van een post met de planning in beeld. Dat is het openbare spoor, nog niet de conclusie “onbedoeld gedeeld”.
- Missie 2 is de valse leverancier. KADE zegt dat hij al binnen was vóór de bijlage. De phishingmail is dus niet de oorzaak van de eerdere toegang.
- De nachtlog is voorbereiding vóór de aanval die het kantoor overdag ziet.
- Missie 3 volgt de route. De sessie helix-svc is een accountnaam in de log. De kaart in de finale noemt hem niet “de deur van KADE”.
- Missie 4 zet bestanden terug vanuit de gecontroleerde kopie `kluis-nacht`. Een nieuwere of gedeelde kopie wordt afgewezen.
- Missie 5 toont eerst beelden, plekken en de deelgeschiedenis. Het rapport eist persoon, document, oorzaak, onbedoelde opzet, en drie bewijzen van het delen. Een deurbeeld alleen is niet genoeg. Phishing of de export als oorzaak van het lek wordt afgewezen. NORA zegt “onbedoelde fout” pas in de ontdekking ná dat rapport. Hint 3 van het rapport noemt Adler niet.
- Missie 6 moet daarna de resterende toegang intrekken. De nieuwe desk vraagt twee sporen bij de sessie, en de herstelcontrole weigert een deellink die open blijft.

NORA geeft tijdens het spelen de codes niet. Hintniveau 3 van vroege puzzels drukt N74192, DOCK-244, ROUTE-7, SEAL en HX-19 niet af. Dat dekken de tests.

De finalekaart van helix-svc zegt wel: “Nog aangemeld. Bezocht de kluis om 02:06.” Dat is geen KADE-label, wel een sterk herkenningspunt op de antwoordkaart. Omdat missie 6 nog bewerkt werd, is die zin niet aangepast.

## Speelduurinschatting

Dit zijn schattingen. Een echte speeltest met mensen moet ze bevestigen. De tijd van een API-script of van automatisch doorklikken is geen menselijke speeltijd. Er is in deze audit geen team van begin tot eind geklokt.

- **Snel:** ongeveer 40 tot 50 minuten. Het team ziet de sporen snel, maakt weinig fouten en gebruikt weinig hints. De films en NORA/KADE-regels kosten alsnog tijd, want de zinnen lopen vanzelf door tot de laatste regel.
- **Gemiddeld:** ongeveer 60 tot 75 minuten. Eén verkeerde afslag per missie, af en toe overleg, de klok komt in de buurt van nul.
- **Met hints:** ongeveer 75 tot 100 minuten aan denkwerk, terwijl de klok korter wordt door de hintstraf. Een team dat vaak hint 3 pakt en blijft gokken, haalt de klok eerder dan de puzzels.

De kantoorfase telt niet mee op de 60-minutenklok. Die tijd zit bovenop de schatting hierboven, grofweg 8 tot 15 minuten, afhankelijk van hoe snel ze de drie onderzoeksgroepen vinden.

## Puzzelkwaliteit per puzzel

Legenda: **spoiler** = het antwoord staat te vroeg in beeld. **Te makkelijk** = weinig te ontdekken. **Vastlopen** = een team kan blijven hangen zonder een bruikbare volgende stap. **Hints** = wat niveau 3 doet.

### Missie 1

- Archief. Echte selectie uit lokkertjes. Vastlopen als ze alleen de kantine of de parkloop bewaren; NORA zegt dan dat een bron de verkeerde vraag beantwoordt. Hint 3 noemt de vijf koppelingen, inclusief Adler bij het openbare lek.
- Foto. Vier details, mok en plant zijn fout. Redelijk. Hint 3 noemt de vier juiste voorwerpen.
- Bord. Koppelen. Hint 3 is bijna de sleutel.
- Recon-zip. Meerkeuze nadat het bord af is. Te makkelijk als het bord al klopte. De code N74192 staat niet in de hint.

### Missie 2

- Afzender. Domein vergelijken plus twee bronnen. Redelijk. Vastlopen als ze op de bekende naam afgaan; de fouttekst stuurt naar het volledige adres.
- Bijlage. Maker en extra dokregel. Redelijk.
- Nachtlog. Volgorde uit de tijden, niet van de kaarttekst. De tekst zegt dat dit vóór de kantooraanval is. Redelijk.
- Exportspoor. Het jobnummer staat in de log die ze moeten openen. Hint 3 wijst naar 02:44 en helix-svc en drukt DOCK-244 niet af.

### Missie 3

- Sessie. Minstens twee echte afwijkingen. Alleen “het woord Helix” is niet genoeg. Goed. Niet gelabeld als KADE.
- Route. De honeypot en de proxy zijn afleiders. Hint 3 beschrijft de lijn zonder de knoopcode te geven.
- Isoleren. De kluis, DNS of de log uitzetten is fout. Redelijk. ROUTE-7 staat niet in de hint.
- Patchkast. Het schema noemt de poorten. Vastlopen mogelijk op de startvolgorde; de fouttekst noemt de afhankelijkheid.

### Missie 4

- Getroffen bestanden. Eerst openen. Hint 3 noemt de vijf kapotte bestanden. Dat is een sterke hint, pas na drie keer vragen.
- Controlewaarde. Het verschil groeit met één. Hint 3 zegt het getal 22 niet.
- Rotor. Route-token plus patroon. Hint 3 zegt SEAL niet.
- Back-up. Drie rapporten. De nachtelijke kluis is de schone. Hint 3 noemt het id `kluis-nacht` niet.
- Terugzetten. De pas staat in de toegangslog. De toetsen bieden de tekens van de pas aan, dus gokken is mogelijk. Licht te makkelijk. Hint 3 zegt HX-19 niet.

### Missie 5

- Camera’s. Lege fragmenten tellen niet. Redelijk.
- Plekken. Pasregistratie is geen camera. Vastlopen mogelijk bij Vale op het dok; de fouttekst wijst op het beeld van die minuut.
- Delen. Drie regels die bij elkaar horen. 02:14 en 02:44 zijn de latere aanval. Goed.
- Rapport. De conclusie mag pas hier vallen. Hint 3 noemt Adler niet en zegt “onbedoeld” niet. Opzettelijk of “de phishing was de oorzaak” wordt afgewezen.

### Missie 6

Nog deels, en nog in beweging bij een andere bewerking.

- Sessie kiezen. Twee sporen zijn verplicht. De kaart zelf noemt al het kluisbezoek van 02:06. Daardoor is de keuze makkelijker dan de sporen alleen. Geen KADE-label.
- Intrekken. Bevestigen en de lijn verbreken. Bewust kort.
- Zegels. De vakken noemen de systemen, niet de codes. De inventaris toont de tokennamen wel, inclusief de code. Hint 3 drukt de drie codes niet af.
- Herstelcontrole. De open deellink is een val. Goed voor het verhaal.
- Afsluiten. Volgorde van de vondsten, vasthouden of een gewone bevestigknop. Hint 3 beschrijft de volgorde zonder de tokens te drukken.

## Tablet-UX

Gemeten in een eigen browsertab, niet op het DEMO-team. Liggend, na het weghalen van de apparaatmaten.

Startscherm op 1024×768, 1180×820 en 1366×1024: geen horizontale scroll. Join, instructeur en demoknoppen vielen in beeld. Er was geen modal **Begrepen**.

Missie 1-archief van team Audittablet, zelfde drie maten: geen horizontale scroll. **Verbanden indienen** viel in beeld. Op 1024×768 vallen de onderste bronkaarten buiten het eerste zicht; ze zitten in een kolom die zelf scrolt (`fp-main`), dus ze zijn bereikbaar. De hintknop in de balk valt binnen het scherm, met weinig marge naast **volledig**.

Niet gecontroleerd: kantoor, film, missie 2 tot en met 6, eindscherm, en een echt tablet-toestel buiten deze browser.

## Meerdere teams

Elk team heeft een eigen code, eigen opgeloste puzzels, eigen hints, eigen straf, eigen breach-moment en eigen verhaal. De score komt uit die lijst. Een tweede keer dezelfde opdracht oplossen voegt de puzzel niet opnieuw toe, dus een verversing geeft geen dubbele score.

Het scorebord toont van andere teams de naam, de score, het hoofdstuk en de status. Niet hun antwoorden of inventaris.

Een tweede tablet met dezelfde code deelt de serverstand. De kantoorpins staan alleen in `localStorage` van dat ene toestel.

De unittest dekt de scoreformule en de klok per team. De live smoke die isolatie zou aantonen, is niet afgemaakt. Isolatie is dus in de code en in de unittest aanwezig, en niet live tot het einde bevestigd.

## Technische betrouwbaarheid

- Hervatten: de laatste serverstand gaat naar `localStorage` (`eth-snap`). Kantoor, en de concepten van missie 3, 4, 5 en 6, gaan ook naar lokale opslag. Een verversing op hetzelfde toestel haalt dat terug.
- Offline: een mislukte POST gaat in `eth-queue` en wordt opnieuw gestuurd. Oplossen is veilig bij een herhaling. Een hint die de server al heeft geteld terwijl het antwoord verloren ging, kan bij een herhaling een extra hint en extra straf geven.
- Dubbel indienen: de server negeert een opdracht die al opgelost is.
- Internet tijdens het evenement: beelden, de Mara-film en KADE-foto staan in `public/`. De service worker cachet alleen dezelfde oorsprong, geen API. Lettertypen komen via `next/font` (Sora en Share Tech Mono). Na een geslaagde bouw of een eerdere dev-compile serveert Next ze lokaal. De eerste compile op een laptop zonder internet kan de lettertypen niet ophalen. Spraak gebruikt de stem van het toestel.
- Productiebouw is niet gedraaid. De ontwikkelserver op poort 3456 was in gebruik, en een Next-build kan die verstoren.

## Beveiligingsbevindingen

- Beheer: `ADMIN_PASSWORD` hoort gezet te zijn voordat de laptop buiten het evenement-wifi bereikbaar is. Is de variabele leeg, dan accepteert de code een vaste fallback. Op deze draaiende server lukte inloggen zonder een gezet omgevingswachtwoord, dus die fallback is daar actief. Het loginscherm kan tonen dat de standaard nog aan staat. Auth is niet zwakker gemaakt.
- Cookie: `COOKIE_SECURE` staat in het voorbeeld op false, passend bij http op het evenement-wifi. Achter HTTPS moet die op true.
- Teamisolatie: zonder de code van een ander team lees je hun antwoorden niet. De code is vier tekens. Op een open wifi is uitproberen niet theoretisch. Het scorebord lekt wel hoever een ander team is (hoofdstuk en score).
- Server beoordeelt elke opdracht. De client kan een token niet zelf toevoegen.
- Demo: in development is `POST /api/demo` niet achter het beheerderscookie, en de demoknoppen staan op het startscherm. Die knoppen zetten het DEMO-team terug. In productie staat demo uit, tenzij `DEMO_TOOLS` aan staat.

## Testresultaten

Alleen wat echt is gedraaid.

- `npx tsx --test tests/engine.test.ts`: 11 tests, 11 geslaagd, 0 gefaald. Inclusief oplossingen, verhaalvolgorde, klok na de breach, pauze, score, back-up `kluis-nacht`, en de finale-eis van sporen plus een gesloten deellink.
- `npx tsc --noEmit`: geslaagd, geen fouten.
- `npm run build`: niet gedraaid. De ontwikkelserver op `http://127.0.0.1:3456` was in gebruik.
- `node scripts/smoke.mjs` tegen `127.0.0.1:3456`: niet afgemaakt. Het script kwam voorbij inloggen, een eigen sessie, start, kantoorfase, breach en story-stappen, en brak daarna op een HTML-500 van Next (`loadManifest`, “Unexpected end of JSON input”). Dat is de bekende dev-serverfout, geen cijfer voor de puzzels. Smoke is geen geslaagde run. DEMO is niet gebruikt.
- Browser: startscherm en het archief van een vers team (niet DEMO), drie liggende maten. Geen horizontale scroll. Geen modal **Begrepen**. Het crisisscherm toonde een lopende klok (ongeveer 59 minuten) omdat de breach al via de API was gezet vóór het openen. Dat bewijst niet zelf dat de kantoorklok stil blijft; dat zit in de code en in de unittest.
- Niet gedaan: een menselijke speelsessie, het kantoor aanklikken, de film, missie 2 tot en met 6 in de browser, het dashboard aanklikken, een netwerkdip, en een tweede indiening live.

Er staan testsessies in de lokale database (onder andere Smoke en Audit). Die horen niet bij een echt evenement.

## Uitgevoerde reparaties

- `README.md`, één zin: de klok start wanneer het team na NORA op **Onderzoek starten** drukt. De vorige zin noemde de bijlage of de melding. De rest van de README is niet herschreven.

Geen spelbestanden van missie 6 aangepast. De zin “Dit is de deur van KADE” stond al niet meer op de sessiekaart toen die plek opnieuw werd gelezen.

## Openstaande problemen

### P0

Geen. Er is geen fout gevonden die het spel nu onspeelbaar maakt in de code die de tests dekken.

### P1

- Zet `ADMIN_PASSWORD` op de evenementlaptop. Zonder die variabele blijft de ingebouwde fallback gelden. Dit is een bevinding, geen codewijziging.
- Demoknoppen op het startscherm en een open demo-API in development. Een speler op hetzelfde wifi kan het DEMO-team verzetten of een finale openen. Voor het evenement de productieserver gebruiken, of de knoppen van het join-scherm halen.
- Missie 6 is deels en was tijdens deze audit nog in bewerking. Niet live uitgespeeld.

### P2

- De aparte KADE-toespraak van missie 1 wordt bij de normale start overgeslagen.
- De finalekaart noemt het kluisbezoek van helix-svc om 02:06 vóór de speler die sessie heeft verdiend.
- Hint 3 van het missie-1-bord noemt Adler bij het openbare lek. Dat is vroeger dan de onbedoelde deelactie van missie 5.
- Teamcodes van vier tekens, en het scorebord toont het hoofdstuk van andere teams.
- Kantooronderzoek staat niet op de server. Een tweede tablet met dezelfde code ziet die pins niet.
- Een herhaalde hint na een verloren antwoord kan straf dubbel tellen. De score van een opdracht niet.
- Lettertypen kunnen bij de eerste compile internet nodig hebben.
- De live smoke is niet afgemaakt door de dev-serverfout. Draai hem opnieuw op een stabiele server.

### P3

- Oude finalecomponent in `StoryBoards.tsx` wordt niet meer getekend; het spel gebruikt de shutdown-desk.
- Het sociale prikbord en het losse back-upbord in datzelfde bestand zijn geen stap meer in `nextBeat`.
- `helix-key.txt` staat bij hoofdstuk 2 en is dus vroeg in het dossier zichtbaar.
- De toetsen bij de pas in missie 4 maken gokken makkelijker.

## Advies voor de volgende fase

1. Laat de bewerking van Final Shutdown aflopen. Speel die finale daarna één keer met de hand, inclusief een foutieve sessie en een open deellink.
2. Zet op de evenementlaptop een productieserver, een eigen `ADMIN_PASSWORD`, en geen demoknoppen voor de spelers.
3. Doe de speeltest uit `PLAYTEST_CHECKLIST.md` met 3 tot 5 mensen die het spel niet kennen. Klok pas vanaf **Onderzoek starten**. Gebruik die tijden, niet deze audit, om de 60 minuten te bevestigen.
4. Draai daarna opnieuw `npm test`, `npx tsc --noEmit` en `node scripts/smoke.mjs` op een server die niet midden in een compile zit. Draai `npm run build` alleen als er geen `next dev` op dezelfde map draait.
