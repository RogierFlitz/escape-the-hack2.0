# Escape the Hack 2.0 — THE BREACH

Projectreview van de bestaande implementatie. Dit document beschrijft wat de software nu doet, niet wat een eerdere prompt als doel had. Er is voor deze review geen gameplay, vormgeving of speldata aangepast.

Datum van de review: 14 oktober 2026.

## Samenvatting

Escape the Hack 2.0 is een speelbare, tabletgerichte escape room in het Nederlands. Eén team deelt één code en één scherm. Het spel heeft twee werelden:

1. **Kantoor bij Nexora.** Mara de Vries geeft een briefing. Het team bladert vrij door mail, agenda, documenten, medewerkers, leveranciers, nieuws en een lokaal dossier. Na genoeg relevant onderzoek verschijnt een phishingmail.
2. **Crisis.** Een filmische aanval, daarna een incident-response-dashboard met een vaste verhaalvolgorde, 19 beoordeelde puzzels, hints, score en een eindscherm.

De voortgang van puzzels, verhaal, score en timer staat op de server. Het kantooronderzoek (welke mails zijn geopend, welke stukken zijn gepind) staat alleen in de browser.

Het spel is inhoudelijk rond. Een team kan niet zomaar doorklikken naar de volgende puzzel: de server keurt elk antwoord. Wel zijn meerdere puzzels zo geschreven dat de oplossing bijna in de opdracht zelf staat. De derde hint geeft het antwoord letterlijk.

De 60-minutenklok start **niet** bij het openen van de bijlage. Ze start wanneer het team na NORA op **Onderzoek starten** drukt. `README.md` zegt nog het tegenovergestelde.

## Technische architectuur

### Talen en frameworks

- TypeScript en React 19.
- Next.js 15.5, App Router.
- Tailwind CSS 4, aangevuld met een groot eigen stylesheet in `app/globals.css`.
- Lettertypen: Sora en Share Tech Mono.
- Testloper: `tsx` met `node:test` (`tests/engine.test.ts`).
- Geen externe spel-API, geen AI in de runtime, geen betaal- of mailprovider.

### Mappen

| Pad | Rol |
| --- | --- |
| `app/page.tsx` | Startscherm |
| `app/play/[code]/page.tsx` | Spelscherm |
| `app/results/[code]/page.tsx` | Zelfde spelscherm, andere URL |
| `app/admin/page.tsx` | Instructeursdashboard |
| `app/api/play/[code]/` | Team-API: stand, oplossing, hint, verhaal, breach, ack |
| `app/api/sessions/` | Sessies aanmaken, besturen, exporteren |
| `app/api/admin/` | Login en logout |
| `app/api/demo/route.ts` | Demoteam terugzetten, alleen buiten productie tenzij `DEMO_TOOLS=true` |
| `components/game/` | Alle speelschermen |
| `components/admin/AdminApp.tsx` | Beheer |
| `lib/game/` | Verhaal, puzzels, antwoorden, hints, scoring, demo |
| `lib/db/` | SQLite of Postgres |
| `public/` | Briefingvideo, portretten, PWA |
| `data/game.sqlite` | Lokale database, niet in git bedoeld |

### Database en hosting

Zonder `DATABASE_URL` gebruikt de app `node:sqlite` in `data/game.sqlite` (WAL). Met `DATABASE_URL` gebruikt ze Postgres via `pg`. Het schema staat in `lib/db/sql.ts`: tabellen `sessions` en `teams`. Verhaal, opgeloste puzzels, hints en inventaris zitten als JSON in de teamrij.

Er is geen vaste host in de repository. Geen `vercel.json`. Het ontwerp is één laptop op het evenement-wifi: `npm run dev` of `npm start` op `0.0.0.0`. Tablets openen een QR of een code. Het LAN-adres komt uit `lib/net.ts`.

### Teamsessies

Een instructeur maakt een sessie met teamnamen, duur (30–90 minuten) en optionele hintstraf. Elk team krijgt een code van 4 tekens. Tot de instructeur op **Iedereen starten** drukt, blijven teams in de lobby.

Daarna is elk team onafhankelijk: eigen opgeloste puzzels, eigen hints, eigen strafseconden, eigen breach-moment, eigen verhaal. De leaderboard vergelijkt teams binnen dezelfde sessie.

De tablet pollt `GET /api/play/{code}` ongeveer elke 2,5 seconde. Bij een netwerkfout wordt een POST in `localStorage` (`eth-queue-{code}`) gezet en later opnieuw verstuurd. De laatste serverstand wordt ook lokaal bewaard (`eth-snap-{code}`).

### Timer, score, hints, voortgang

De sessieklok loopt vanaf **Iedereen starten**, maar een team in het kantoor ziet die klok niet aftellen. `breachOffsetSec` wordt gezet op het moment van `POST /api/play/{code}/breach`. De client roept dat pas aan bij **Onderzoek starten**. Vanaf dat moment is de resterende tijd `duur + correctie − straf − (sessietijd − offset)`.

Pauze bevriest de sessieklok. Een hintstraf telt alleen voor dat team. Bij tijd op wordt het team `failed`. Bij alle puzzels én de laatste verhaalstappen wordt het team `completed`.

Score (`lib/scoring.ts`):

- 100 punten per opgeloste puzzel (19 puzzels).
- 150 punten per volledig afgerond hoofdstuk (6 hoofdstukken).
- 400 punten bij een geslaagde afronding.
- 20 punten per resterende minuut, alleen bij winst.
- 200 punten als de phishingmail is gemeld.

Hints hebben drie niveaus per puzzel. Niveau 3 bevat het antwoord. Een instructeur kan een hint geven zonder dat het team daarom vraagt. Alleen de teamhint telt als straf, als de sessie dat aan heeft.

Antwoorden worden alleen op de server beoordeeld (`lib/game/grade.ts`). De client stuurt een payload. Een fout antwoord telt als mislukking en kan een KADE-bericht tonen. Een goed antwoord kan een token in de inventaris zetten.

### Externe diensten

Geen. Geluid is Web Audio (pieptonen) plus `speechSynthesis` voor KADE en NORA als het geluid aan staat. De briefingvideo heeft een eigen Nederlandse stem in het bestand. Er is een PWA-manifest en een service worker (`public/sw.js`, netwerk eerst). De installatieknop in `components/Pwa.tsx` geeft niets terug.

### Lokaal starten

```bash
npm install
npm run dev
```

De ontwikkelserver in deze review draaide op poort 3456. Het beheerscherm is `/admin`. Zolang `ADMIN_PASSWORD` leeg is, is het wachtwoord `flitz-admin` (`lib/auth.ts`, `.env.example`).

In ontwikkeling staat op het startscherm een testbalk. Die zet het vaste team `DEMO` terug op Briefing, KADE, Missie 1–5 of Finale. Die knoppen zitten niet in het spelscherm. In productie zijn ze verborgen, tenzij `NEXT_PUBLIC_DEMO_TOOLS` of `DEMO_TOOLS` aan staat.

## Verhaallijn zoals die in de software staat

Bedrijf: Nexora Technologies. Gebeurtenis: Nexora Day in de Dokzaal. Echte leverancier: Helix Events, `events@helix-events.nl`. Valse afzender: `planning@helix-event.co`. Aanvaller: KADE. Noodassistent na de hack: NORA. Opdrachtgever: Mara de Vries, operationeel manager. Het team is een extern beveiligingsteam.

Medewerkers die terugkomen: J. Vale (badge 4418, verdieping 3), L. Crowe, M. Okonkwo (rek 7), S. Adler (Helix, op het dok). Klantmail: P. Hendriks, Astra Logistics.

### Start

Het startscherm zegt dat Nexora het team heeft ingehuurd omdat informatie buiten het bedrijf ligt. Het team vult een code in. Tot de instructeur start, wacht het team in een lobby.

### Mara

`public/mara-intro.mp4` duurt ongeveer 62 seconden. De ondertiteling staat in `public/mara-intro.json`. Mara zegt, verkort:

- Welkom bij Nexora. Zij is operationeel manager.
- Gisteren had een externe partij informatie die intern had moeten blijven.
- Het is onbekend of iets onbedoeld is gedeeld of dat er meer aan de hand is.
- Het team krijgt de werkomgeving: mail, documenten, agenda, medewerkers, leveranciers.
- Zoek zelf, leg verbanden, bewaar bewijs, trek niet te snel conclusies.
- Wees voorzichtig met onverwachte berichten. Het is niet zeker dat de omgeving veilig is.

Zij noemt Helix, een medewerker of een hack niet. **Start onderzoek** kan meteen, zonder de video uit te kijken.

### Onderzoek vóór de aanval

Na de start verschijnt even: “Beveiligde toegang verleend. Onderzoeksomgeving beschikbaar.”

Het team mag vrij klikken. Er is geen verplichte volgorde en geen checklist op het scherm. De phishingmail komt pas als minstens 3 van deze 4 groepen zijn geopend (`lib/game/office.ts`):

1. De mail van Astra Logistics.
2. Het document Conceptplanning bijeenkomst.
3. Eén van: de echte Helix-mail, de leverancier Helix, of het contract met de vloerpartner.
4. De agenda-afspraak Nexora Day.

Dan verschijnt een toast “Nieuw bericht” en een rode stip bij Mail. De nieuwe mail heet **Definitieve planning Nexora Day**, afzender Helix Events, adres `planning@helix-event.co`. De tekst vraagt Mara de indeling voor de Dokzaal vandaag te bevestigen. Het adres is niet rood gemarkeerd.

Knoppen op die mail: **Bewaar in dossier**, **Bijlage openen**, **Melden als verdacht**.

Wat het team in het kantoor kan vinden, zonder dat het als antwoord wordt voorgeschoteld:

- Astra schrijft dat een buitenstaander datum, locatie en indeling van een interne bijeenkomst had.
- De interne planning noemt Nexora Day, de Dokzaal, Mara en Helix Events.
- Het contract en het relatiebestand noemen `events@helix-events.nl`.
- De agenda noemt de Dokzaal en Helix.
- S. Adler werkt bij Helix en staat op het dok. Zijn pasnummer HX-19 staat hier nog niet.
- J. Vale, badge 4418, badge in de kantine. M. Okonkwo, rek 7.
- Er zijn ook afleiders: facturen, schoonmaak, koffie, kwartaalcijfers.

### Bijlage of melding

**Bijlage openen.** Het kantoor blijft staan. Eerst opent `planning-nexora-day.xlsx` met een laadbalk, een korte preview en daarna “Bestand reageert niet. Macro geweigerd.” Daarna hapert het scherm ongeveer 8 seconden (serververbinding verbroken, venster reageert niet). Daarna worden vijf bestanden één voor één vergrendeld: `planning-nexora-day.xlsx`, `leveranciers.xlsx`, `contract-helix.pdf`, `agenda.ics`, `personeelsgegevens.xlsx`. Een paneel meldt een onbekende sessie, ongeautoriseerde toegang, aangetaste integriteit en een instabiel netwerk. Die teksten noemen nog geen accountnaam of pasnummer.

**Melden als verdacht.** Er is geen bestandsvenster. Het scherm hapert meteen. De melding is niet de oorzaak van de aanval. Bij NORA staat: “Verdachte mail gemeld · +200. De aanval was al voorbereid.” De 200 punten worden echt opgeteld zodra de crisis start.

### KADE

Na de vergrendeling: zwart scherm, “INCOMING TRANSMISSION”, “SOURCE: UNKNOWN”. KADE is een groot stilstaand portret (`public/kade.jpg`) met lichte beweging, scanlines en één ondertitel tegelijk. Het is geen videospeler. Spraak komt alleen uit de browserstem als geluid aan staat. Er is geen opgenomen KADE-stem.

Als de bijlage is geopend, zegt hij onder andere: het externe team is te laat; hij weet medewerkers, partners en bestandslocaties; Nexora heeft hem geholpen; zijn naam is KADE; de belangrijkste bestanden zijn vergrendeld; over zestig minuten volgt zijn laatste fase; volg zijn sporen.

Als de mail is gemeld: hij had niet verwacht dat het vervalste bericht zou worden herkend; hij was al binnen vóór die mail; één aanval is voorkomen; de rest moet nog worden gestopt.

Daarna valt de transmissie weg.

### NORA

Tekst: “EMERGENCY SECURITY PROTOCOL ACTIVATED.” NORA stelt zich voor als digitale noodassistent, zegt dat meerdere systemen gecompromitteerd zijn, dat er een geïsoleerde onderzoeksomgeving is, en dat het team de aanval moet reconstrueren, KADE moet blokkeren en de systemen moet herstellen. Zij heeft het eerste spoor gevonden. De knop is **Onderzoek starten**.

Pas op dat moment gaan breach en de 60-minutenklok aan. De scènes `incident` en `m1` worden meteen als gezien opgeslagen. Daardoor slaat het normale spel de aparte KADE-toespraak van missie 1 over. Die toespraak is wel te zien via de demoknop Missie 1.

### Na NORA

Het dashboard opent op het openbare archief (Digital Footprint). NORA zegt dat KADE bij openbare berichten begon en dat zij het antwoord niet geeft.

Als de vijf juiste berichten zijn gemarkeerd, verschijnt KADE één keer: “Goed gevonden. Maar openbare informatie was slechts het begin. Om echt binnen te komen, had ik iemand nodig die jullie vertrouwden.” Die zin zit niet in de serververhaalstaat. Een verversing na dit moment toont hem niet opnieuw. Een verouderde lokale cache kan hem juist te laat tonen, boven op een latere missie.

Daarna volgen de puzzels van missie 1. Tussen missies spreekt KADE een korte introductie. Na een afgeronde missie legt NORA in drie regels uit wat er gebeurde, hoe het werkte en hoe het voorkomen kan worden. Die lessen komen in het dossier.

### Finale en einde

KADE zegt dat het team weet hoe hij binnenkwam, maar dat hij kan terugkomen zolang zijn toegang bestaat. Het team wijst zijn sessie aan (`helix-svc`), trekt die in, legt drie eerder gevonden tokens op de juiste systemen, controleert de schone back-up en zet vier tokens in de shutdown-volgorde.

Bij winst: **SYSTEM RESTORED**. “KADE is van het scherm.” NORA zegt dat de sessie is ingetrokken, de schone back-up is bevestigd en het netwerk is vrijgegeven. Score, positie, hints en crisistijd. Knoppen: resultaat als tekst downloaden, of het scherm opnieuw openen via `/results/{code}`.

Bij tijd op: **SYSTEM COMPROMISED**. KADE’s toegang staat nog open. NORA zegt dat de missie is mislukt en toont wat wel is vastgesteld.

Als hetzelfde toestel kantoorstukken had gepind, staan die ook op het eindscherm. NORA-lessen staan erbij zodra die scènes in het verhaal zitten.

## Schermen en navigatie

```text
Start (/)
  └─ code ─► Lobby (wacht op instructeur)
              └─ start ─► Briefing van Mara
                            └─ Start onderzoek ─► Nexora-werkomgeving
                                                    ├─ Mail, Agenda, Documenten,
                                                    │  Medewerkers, Leveranciers,
                                                    │  Nieuws, Dossier
                                                    └─ bijlage of melding
                                                          └─ Aanval (bestand, storing,
                                                             vergrendeling, KADE, NORA)
                                                                └─ Onderzoek starten
                                                                     └─ Noodkern
                                                                          ├─ verhaalscènes
                                                                          ├─ sociale posts
                                                                          ├─ 19 puzzels
                                                                          ├─ back-upkeuze
                                                                          └─ finale
                                                                               └─ Eindscherm

Instructeur: /admin
```

Er is geen apart resultatenscherm. `/results/{code}` laadt hetzelfde `PlayApp`. Een afgerond team ziet meteen het eindscherm.

### Startscherm

Doel: een team binnenlaten. Zichtbaar: titel, korte opdracht, codeveld, **Systeem openen**, link **Instructeur**. In ontwikkeling ook de demoknoppen. Een onbekende code geeft een fout. Een geldige code opent `/play/{code}`. Functioneel.

### Lobby

Alleen als de sessie nog niet live is voor dit team. Tekst: wacht tot de instructeur start. Geen spelacties.

### Briefing

Volledig scherm, donker. Video van Mara, label CONFIDENTIAL BRIEFING, live-badge, naam, ondertiteling, pauze, tijdbalk, geluid, CC, opnieuw. **Start onderzoek** zet het kantoor open. De video heeft echte audio. Het beeld is een bewegend portret, geen lipsync. Functioneel.

### Nexora-werkomgeving

Donkere intranetbalk: Mail, Agenda, Documenten, Medewerkers, Leveranciers, Nieuws, Onderzoeksdossier, meldingen. Elke pagina is een lijst. Een item opent een tekst. **Bewaar in dossier** pint het stuk lokaal. Geen verplichte “volgende stap”. Functioneel, maar de inhoud is statische tekst, geen echte documentviewer.

### Verdachte mail

Zelfde mailbox. Twee acties leiden allebei naar de aanval, met andere KADE-tekst en alleen bij melden +200.

### Aanval

`components/game/AttackCine.tsx`. Vier fases plus NORA. Het kantoor blijft onder de eerste fases liggen. Geluid kan uit. Bij een verversing tijdens de aanval slaat het spel de film over en zet het team bij NORA, zodat de aanval niet opnieuw verplicht is. **Aanval opnieuw** in het crisisdossier speelt de film nog eens, zonder de klok te resetten.

### Noodkern

Bovenbalk: ESCAPE THE HACK 2.0, teamnaam, missienaam, voortgang van 6 hoofdstukken, score, grote timer, geluid, volledig scherm. Hints staan in de balk zodra er een puzzel actief is. **Dossier** en **Bewijs** zijn lades, niet altijd zichtbare kolommen. Het midden is de actieve opdracht. NORA heeft een korte regel boven de opdracht. KADE verschijnt als transmissie, niet permanent als icoon.

Onderaan: statusregel, hintpuntjes en een hintknop bij een onopgeloste puzzel.

### Eindscherm

Overlay over het dashboard. Zie hierboven. Functioneel. Het beveiligingsrapport is kort (één preventieregel per les). Er is geen uitgebreide nabespreking per fout of per teamlid.

### Instructeur

Login, sessie klaarzetten, QR en link per team, starten, pauzeren, hervatten, tijd +1 / +5 / −1 minuut, beëindigen. Per team: score, hoofdstuk, hints, of het team nog op kantoor zit, of de mail is gemeld, laatste scène. Acties: hint geven, scène opnieuw, volgend moment, link kopiëren, export. **Volgend moment** zet de server een stap vooruit. Dat is een echte skip voor de instructeur, niet voor het team.

## De zes missies

De volgorde is vast in `nextBeat()` in `lib/game/story.ts`. Een puzzel gaat alleen open als de vorige missie dicht is, de KADE-introductie is gezien en eventuele tussenstappen (sociale posts, back-up, finale-stappen) klaar zijn. Een fout antwoord blijft op dezelfde puzzel. Componenten: `components/game/puzzles/early.tsx`, `late.tsx`, `StoryBoards.tsx`. Teksten: `lib/game/content.ts`. Antwoorden: `lib/game/grade.ts`. Hints: `lib/game/hints.ts`.

### 1. Digital Footprint

**Verhaal.** KADE begon met kijken: LinkedIn, Instagram, een openbaar bericht over het evenement. In het normale spel hoort het team die toespraak niet; die is al als gezien gemarkeerd. Het archief vraagt zelf om vijf berichten. NORA zegt dat zij het antwoord niet geeft. Na succes wijst KADE naar iemand die het team vertrouwde.

**Gameplay.** Acht kaarten. Vijf zijn bruikbaar (Mara, personeelsfeest, Helix, Dokzaal, borrelfoto met badge en planning). Drie afleiders zeggen zelf dat ze niet relevant zijn (“Geen namen”, “Dit gaat niet over Nexora”). Daarna:

1. Researchmap. Negen mapjes, drie met een fragment. Samen `N74192`.
2. Badge op de foto. Het briefje legt de bouwregel uit: `jvale` en `81443`.
3. Open bronnen. Schakelaars MESH, LOG en AUTH aan, DNS uit. De opdracht noemt die regel.
4. Handshake. Diensten op poortnummer: ICMP, SSH, DNS, TLS, VAULT.

**Techniek.** Sociale keuze via `POST .../story`. Puzzels via `POST .../solve`. Token `N74192`.

**Beoordeling.** Speelbaar. Het archief is een echte keuze, maar de afleiders maken hem makkelijk. De mapjes zijn een echte zoekpuzzel. Login en schakelaars zijn bijna een invuloefening omdat de regel op het scherm staat. Niemand komt hier voorbij zonder de juiste set en de juiste codes, behalve via de instructeur.

### 2. The Fake Supplier

**Verhaal.** KADE: een bekende naam, een kleine wijziging in het adres. NORA na afloop: de naam was Helix, het contract zegt `events@helix-events.nl`, de mail kwam van `planning@helix-event.co`.

**Gameplay.**

1. Valse planning. Eerste letters van vier regels vormen `DOCK`.
2. Bijlage. Het id dat zowel op de scan als in de log staat: `DOCK-244`. De bestanden moeten in het dossier worden geopend.
3. Tijdlijn. De kaarten hebben geen klok. De tijden staan in `access.csv` en `export.log`: phishing 02:14, dok 02:31, export 02:44.

**Techniek.** Bestanden uit `content.ts`, geopend in het hoofscherm. Token `DOCK-244` na de tijdlijn.

**Beoordeling.** Dit is de sterkste onderzoekmissie: twee bronnen vergelijken en een tijdlijn uit logboeken halen. De acrostichon is een klassieke letterpuzzel. Speelbaar. De nachtlijn (02:14) sluit niet vanzelf aan op de werkdag die het team net heeft gespeeld. Dat vraagt een vertaalslag die het spel niet uitlegt.

### 3. Network Lockdown

**Verhaal.** KADE gebruikte systemen die elkaar vertrouwden. NORA: een eerder open leveranciersaccount, één route naar de kluis, bestanden nog versleuteld.

**Gameplay.**

1. Schone route. Een netwerkkaart. Tik van NEX via EDGE, DNS en AUTH naar VAULT. Rode nodes (HONEY, LOG) worden geweigerd. Terug via de laatste node.
2. Firewall. A en B aan, C uit. De zin op het scherm is de oplossing.
3. Patchkast. DNS op 53, AUTH op 443, LOG op 514, TRAP op PARK. Kabel kiezen, dan poort.
4. Opstart. DNS, dan AUTH, dan VAULT. Elke server zegt zelf waarop hij wacht.

**Techniek.** Token `ROUTE-7`. Geen drag-and-drop; tikken.

**Beoordeling.** De kaart is een echte route. De andere drie zijn kort en sterk gestuurd. Speelbaar. Voelt meer als een reeks schakelaars dan als een lockdown die het team zelf ontdekt.

### 4. Encryption Protocol

**Verhaal.** KADE heeft contracten, planning en financiën vergrendeld en vraagt of er een back-up is. Na de puzzels kiest het team een kopie. Alleen “Nachtelijke kluis” is goed, en de tekst zegt dat die kopie geen verbinding met de werkplekken heeft. De andere twee zeggen dat ze op het getroffen netwerk stonden. NORA herhaalt daarna dat die kluis schoon was.

**Gameplay.**

1. Rotor. Draai tot het reknummer 7. `ZLHS` wordt `SEAL`.
2. Bakens. De verschillen +3, +4, +5. Volgende is 22.
3. Patroon. Elke rij schuift één plek. Het ontbrekende teken is het vierkant.
4. Helix-sleutel. Symbolen plus `helix-key.txt`. Uitkomst `HX-19`.

**Techniek.** Token `SEAL` en `HX-19`. De rotor gebruikt het eerdere route-token als aanwijzing.

**Beoordeling.** Vier verschillende minipuzzels, allemaal speelbaar. De back-upkeuze is te doorzichtig voor een escape room. De rotor en de reeks zijn echte puzzels. Er wordt niets echt ontsleuteld op bestandsniveau; het blijft een code intoetsen.

### 5. The Insider

**Verhaal.** KADE: er is geen verrader nodig, één iemand deelde te veel. NORA zegt dat al vóór de puzzel (“Dit is geen verrader”). Na afloop: S. Adler zette de planning onbedoeld buiten, geen kwade opzet.

**Gameplay.**

1. Camerawand. Vier getekende beelden. Het juiste is het dok om 02:31 met een Helix-jack. De andere beelden geven Vale, Okonkwo en Crowe een alibi.
2. De lek. Kies een persoon en drie bewijzen. Juist: S. Adler, met de dok-camera, de chat “key is live” en de badge in de kantine.

**Techniek.** Token `INSIDER:ADLER`. Dossiers en de chat staan als bestanden in het dossier.

**Beoordeling.** Speelbaar en inhoudelijk de ontknoping. De camera’s zijn CSS-vlakken, geen beelden. NORA en de KADE-introductie nemen de conclusie “geen verrader” al weg. Het combineren van drie bewijzen is wel een echte stap. Adler’s pasnummer staat in zijn dossier; de code HX-19 is dan al gevonden in missie 4.

### 6. Final Shutdown

**Verhaal.** KADE: zolang zijn toegang bestaat, kan hij terugkomen. NORA: zijn laatste toegang moet dicht.

**Gameplay.**

1. Kies de sessie. Drie kaarten. `helix-svc` zegt op de kaart: “Dit is de deur van KADE.”
2. Trek de sessie in. Eén knop.
3. Drie zegels. Leg SEAL, DOCK-244 en HX-19 op perimeter, trace en lockout. De vakken zeggen welk token ze willen.
4. Bevestig de schone back-up. Eén knop, alleen als de kluis al gekozen is.
5. Shutdown. Zet `N74192`, `DOCK-244`, `ROUTE-7`, `HX-19` in die volgorde.

**Techniek.** Zegels en shutdown gebruiken de inventaris. Geen nieuw onderzoek.

**Beoordeling.** Speelbaar als slotceremonie. Weinig nieuwe denkwerk. De sessiekeuze is weggegeven. Intrekken en back-up controleren zijn klikken. De shutdown is een volgorde van tokens die het team al heeft, met een hint die de volgorde noemt.

## Wat er echt aan gameplay werkt

| Mechaniek | Status |
| --- | --- |
| Documenten en mails lezen | Werkt, statische tekst |
| Echte en valse Helix-mail vergelijken | Werkt in kantoor en opnieuw in missie 2 |
| Bewijs pinnen in het kantoor | Werkt alleen op dat toestel |
| Bewijs in de crisis (lessen en bestanden) | Werkt, server |
| Codes intoetsen | Werkt, server keurt |
| Informatie uit twee bestanden combineren | Werkt bij de bijlage en de tijdlijn |
| Netwerkroute tikken | Werkt, geen slepen |
| Kabels op poorten zetten | Werkt via tikken, geen slepen |
| Tijdlijn ordenen | Werkt via tikken |
| Back-up kiezen | Werkt, antwoord is leesbaar |
| Verdachte aanwijzen met drie bewijzen | Werkt |
| Beslissing met gevolg | Alleen de phishingkeuze (+200 en andere KADE-tekst). Beide wegen openen dezelfde crisis |
| Samenwerking van 3–5 spelers | Eén gedeeld scherm. Geen rollen, geen verborgen info per speler |
| Drag-and-drop | Niet aanwezig |
| Bestanden echt herstellen of ontsleutelen | Niet aanwezig. Herstel is een goedgekeurde code |
| Timer, hints, score, pauze, mislukte poging | Werken server-side |
| Doorklikken zonder oplossing | Nee, behalve verhaalscènes (daar is “verder” genoeg) en de instructeursknop |

## UX en uitstraling

**Wat al goed is**

- Donker, cyaan en rood. Het kantoor, de briefing en de noodkern horen bij elkaar.
- De briefing voelt als een product: video, ondertiteling, geluid, opnieuw.
- De aanval begint in het kantoor en eindigt bij een groot KADE-portret. Dat is het sterkste moment.
- De noodkern gebruikt het midden voor de opdracht. Dossier en bewijs zitten in lades.
- Knoppen zijn groot genoeg voor een tablet. Liggend gebruik is de bedoeling. Staand onder de 900 px vraagt het spel om te draaien.
- `prefers-reduced-motion` zet animaties uit.
- Geluid staat uit tot het team het aanzet. Dat respecteert de browser.
- Geen debugknoppen in het spel. Demoknoppen alleen op het startscherm in ontwikkeling.
- Tekst op 1280×820 bleef binnen het scherm bij de gecontroleerde schermen. Er is geen horizontale scroll nodig.

**Wat verbetering nodig heeft**

- KADE is op missie 2 tot en met de finale steeds hetzelfde portret met een tekstblok. De scènes lijken daardoor op elkaar.
- NORA is een gloedcirkel, geen personage.
- Camerabeelden zijn gekleurde vlakken met een poppetje.
- Geopende kantoormails zijn een paar regels in een groot leeg vlak.
- De startpagina vult een liggend scherm niet. Titel en codekaart staan linksboven.
- Meerdere puzzels geven de regel of het antwoord bijna zelf. Niveau 3 van elke hint is het antwoord. Dat past bij een vangnet, niet bij spanning als teams hints vroeg gebruiken.
- Afleiders in het sociale bord en de back-upkaarten diskwalificeren zichzelf.
- De werkdag en de nachtelijke forensische tijdlijn voelen als twee verhalen die alleen via Helix, de Dokzaal en Adler aan elkaar vastzitten.
- Het eindscherm is een scorekaart met drie zinnen. Voor een bedrijfsuitje mist een gedeelde nabespreking.
- De ontwikkelaars-N van Next.js ligt in development over de linkeronderhoek. Die is er niet in een productieserver.
- Schermfoto’s van de browser tonen vaak zwart onder of naast de inhoud. Op 1280×820 vult het kantoor en de noodkern het vlak wel. De aanval en NORA zijn bewust gecentreerd op een zwart veld, en daardoor leeg aan de randen.

## Teamsessies en een latere tweede tablet

De architectuur kan twee apparaten op dezelfde code aan, maar is niet voor een gesplitst spel gebouwd.

Wat al centraal staat: opgeloste puzzels, verhaalscènes, sociale posts, back-up, finale-stappen, inventaris, hints, score, fouten, breach-moment, phishingvlag, pauze. Een tweede tablet die dezelfde code opent, ziet na hooguit een paar seconden dezelfde serverstand.

Wat per browser blijft: kantooronderzoek, gepinde stukken, geluid, de filmische aanval, de eenmalige KADE-zin na het archief, een half ingevulde puzzel tot op verzenden. Twee tablets in het kantoor onderzoeken dus niet hetzelfde dossier. Eén tablet kan de phishingmail al zien terwijl de andere hem nog niet heeft.

Er is geen websocket. Synchronisatie is pollen. Twee spelers die tegelijk een antwoord sturen, worden door een versiecontrole op `updatedAt` gescheiden. De verliezer moet opnieuw. Dat is veilig, niet realtime.

Voor een Dual Tablet Edition later moet minimaal dit veranderen:

- Kantoorstaat en dossier naar de server, of bewust per rol.
- Een rol per apparaat (wat tablet A wel en tablet B niet ziet).
- De aanval één keer afspelen en op beide schermen op hetzelfde moment laten eindigen.
- Puzzel-UI die de invoer van het andere scherm toont, of puzzels die informatie splitsen.
- Een kanaal sneller dan 2,5 seconde als zetten meteen zichtbaar moeten zijn.
- Conflicten als beide tablets dezelfde puzzel open hebben.

De huidige API en de teamrij zijn een bruikbare kern. De client is één scherm zonder rol.

## Tests in deze review

### Geslaagd

`npx tsx --test tests/engine.test.ts` — 8 van 8.

De tests dekken: elk puzzelantwoord, de vaste verhaalvolgorde, demolanding, de phishingmail na drie onderzoeksgroepen zonder vaste volgorde, gesloten hoofdstukken, de crisisklok pas na de breach, pauze en hintstraf, en de scoreformule.

### In de browser bekeken

Op `http://127.0.0.1:3456`, landschap 1280×820, team DEMO tenzij anders vermeld.

- Startscherm, inclusief demoknoppen.
- Briefing. Ondertiteling liep mee (“Mijn naam is Mara de Vries…”). Duur ongeveer 1:02. Start onderzoek opent het kantoor.
- Mailbox zonder phishingmail.
- Na Astra, de conceptplanning en Helix Events: toast en de mail “Definitieve planning Nexora Day”.
- Bijlage: bestandsvenster over de mail, daarna de fout over de macro. Het kantoor bleef staan.
- Direct daarna bevestigde de pagina de vergrendelingsfase. De schermfoto landde op KADE’s eerste zin, omdat die fase al was afgelopen.
- NORA met **Onderzoek starten**.
- Daarna het archief, timer 59:49, score 0. De klok was dus niet tijdens de film gaan lopen.
- Missie 2 tot en met 5 en de finale via de demoknoppen. Elke landing toont de KADE-tekst van die missie. De timer staat dan weer bijna op 60:00, omdat de demo de crisis net laat beginnen.
- Eindscherm van een al bestaand voltooid team (Noord, code D4ZP): SYSTEM RESTORED, score 4080, 1 hint, speeltijd 00:04. Dat is een oud team in de lokale database, geen nieuwe speelsessie van deze review. De drie winstzinnen, score, positie en downloadknop zijn zichtbaar.

### Niet gelukt of niet gedaan

- `node scripts/smoke.mjs` maakte een sessie aan en kwam tot in de puzzelreeks. Daarna gaf de ontwikkelserver een HTML-500 (`Unexpected end of JSON input` in een Next-manifest). De smoke eindigde daardoor niet. Dit is een bekende instabiliteit van `next dev` in dit project, geen aangetoonde fout in de puzzelketen. De unit tests dekken dezelfde antwoorden zonder de server.
- Niet alle 19 puzzels zijn in de browser aangeklikt.
- De meld-route (andere KADE-tekst en +200) is in deze review niet opnieuw doorklikt. De code en een eerdere speelbeurt doen dat wel: melden slaat het bestandsvenster over, de vlag `phishReported` wordt gezet, de score krijgt 200.
- Geluid en Nederlandse spraak zijn niet beluisterd. Op deze machine is de enige geïnstalleerde systeemstem Engels. De briefingvideo heeft wel een eigen Nederlandse track.
- Een productiebouw (`npm run build` en `npm start`) is niet gedraaid.
- Het instructeursdashboard is niet opnieuw doorklikt. De knoppen en API’s zijn in de code aanwezig. De smoke kwam niet ver genoeg om het bord na een afgeronde smoke te controleren.
- Verversen midden in de aanval is in deze review niet herhaald. De code zet `sessionStorage` `eth-cine-{code}` en opent dan NORA in plaats van de film. Servervoortgang overleeft een verversing via de API en de lokale snapshot.

De smoke kan een sessie “Smoke” met teams in de lokale database hebben achtergelaten. Die is niet verwijderd.

## Waar het verhaal nog niet sluit

- De KADE-introductie van missie 1 wordt in het normale spel overgeslagen. De demoknop Missie 1 toont haar wel.
- “Goed gevonden…” hoort bij geen scène. Hij kan wegvallen of, bij een oude cache, boven een latere missie verschijnen. Dat is gezien bij een sprong naar missie 2 terwijl de lokale snapshot nog van vóór het archief was.
- `README.md` zegt dat de klok start bij de bijlage of de melding. De code start haar bij **Onderzoek starten**.
- Het kantoor speelt overdag rond een lek. De crisislogboeken spelen om 02:14–02:44 met een badge op het dok. Het spel legt die sprong niet uit.
- NORA zegt in missie 5 al dat er geen verrader is.
- De kaart `helix-svc` noemt zichzelf de deur van KADE.
- Twee dossiers: gepinde kantoorstukken (alleen dit toestel) en crisislessen (server). Op een ander toestel mist het eindscherm de kantoorstukken.
- KADE zegt “over zestig minuten”, ook als de instructeur een andere duur heeft gekozen.

## Prioriteiten

### P0 — nodig om het spel betrouwbaar te draaien

- Instructietekst gelijk trekken met de klok. Operators moeten weten dat de 60 minuten pas na NORA starten, en dat een team vóór de phishingmail kan blijven hangen als het te weinig opent.
- Voor een evenement de productieserver gebruiken, niet `next dev`. De ontwikkelserver kan midden in een API-reeks een 500 geven door een kapot manifest. Dat is hier gebeurd.
- Controleren of een team dat vastzit in het kantoor voor de instructeur zichtbaar genoeg is. Het bord kent de vlag “kantoor”, maar er is geen seintje dat de phishingmail nog niet is verschenen.

Het puzzelpad zelf blokkeert een voltooiing niet. Een team kan het einde halen zonder een puzzel over te slaan.

### P1 — nodig voor een spannende, professionele kamer

- Minder antwoorden op het scherm. Afleiders die zichzelf wegcijferen, de firewallzin, het loginbriefje, de back-uptekst, de sessie “deur van KADE” en hintniveau 3.
- Missie 1 niet stil overslaan, of de eerste KADE-zin in de aanval laten eindigen op het archief zodat er geen gat zit.
- De nachtlijn en de werkdag aan elkaar vastmaken, zodat missie 2 voortkomt uit wat het team in het kantoor vond.
- KADE en NORA minder herhalend. Eén portret en een gloedcirkel dragen zes missies niet.
- Camerabeelden en kantoordocumenten meer laten lijken op bewijs dan op tekstkaarten.
- Het eindscherm uitbreiden tot een nabespreking: wat het team vond, welke les, hoe snel, of de mail was herkend.
- De eenmalige KADE-zin na het archief op de server zetten, zodat een verversing hem niet kwijt is en een oude cache hem niet te laat toont.
- Lege vlakken in geopende mails en op het startscherm vullen met bruikbare inhoud, niet met extra uitleg.

### P2 — later

- Dual Tablet Edition: rollen, gedeeld kantoordossier, gesplitste informatie, snellere sync.
- Opgenomen stem voor KADE en NORA, in plaats van de browserstem.
- Echte korte video voor KADE, als die er komt. Het huidige portret mag niet als videoplayer worden gepresenteerd. Dat gebeurt nu ook niet.
- Meer samenwerking dan één scherm: een speler met de logboeken, een speler met de kaart.
- Rijkere documenten in het kantoor, zonder de puzzels te vervangen.
- Productiehosting als de laptop niet het evenement draait. De databasekeuze (SQLite of Postgres) staat daar al klaar voor.

## Schermfoto’s

Map: `project-review/screenshots/`.

| Bestand | Scherm |
| --- | --- |
| `01-startscherm.png` | Start, code en demoknoppen |
| `02-mara-briefing.png` | Briefing van Mara |
| `03-nexora-kantoor.png` | Mailbox vóór de phishingmail |
| `04-verdachte-mail.png` | Definitieve planning Nexora Day |
| `05-aanval-bijlage.png` | Bestandsvenster over de mail, met de macrofout |
| `06-kade.png` | KADE, eerste zin van de open route |
| `07-nora.png` | Noodprotocol en Onderzoek starten |
| `08-missie-1-digital-footprint.png` | Noodkern, openbaar archief, timer net gestart |
| `09-missie-2-fake-supplier.png` | KADE-introductie missie 2 |
| `10-missie-3-network-lockdown.png` | KADE-introductie missie 3 |
| `11-missie-4-encryption.png` | KADE-introductie missie 4 |
| `12-missie-5-insider.png` | KADE-introductie missie 5 |
| `13-finale.png` | KADE-introductie Final Shutdown |
| `14-eindrapport.png` | SYSTEM RESTORED van een eerder voltooid team |

Er is geen aparte foto van de vergrendelde bestanden. Die fase was in de DOM zichtbaar en was voorbij op het moment dat de foto werd geschreven. De foto daarna is `06-kade.png`.

## Belangrijkste bestanden

- Verhaal en volgorde: `lib/game/story.ts`
- Puzzelteksten, bestanden, netwerk: `lib/game/content.ts`
- Antwoorden: `lib/game/grade.ts`
- Hints: `lib/game/hints.ts`
- Wanneer de phishingmail komt: `lib/game/office.ts`
- Breach, hints, verhaalopslag, afronding: `lib/game/actions.ts`
- Wat de tablet ontvangt: `lib/game/snapshot.ts`
- Score: `lib/scoring.ts`
- Klok: `lib/time.ts`
- Spelscherm: `components/game/PlayApp.tsx`
- Aanval: `components/game/AttackCine.tsx`
- Kantoor: `components/game/OfficeDesk.tsx`, `components/game/Intranet.tsx`
- Briefing: `components/game/Briefing.tsx`
- Puzzels: `components/game/puzzles/early.tsx`, `late.tsx`
- Mara: `public/mara-intro.mp4`, `public/mara-intro.json`
- KADE-portret: `public/kade.jpg`
- Beheer: `components/admin/AdminApp.tsx`
- Tests: `tests/engine.test.ts`, `scripts/smoke.mjs`
