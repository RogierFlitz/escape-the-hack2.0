# Escape the Hack 2.0 — stappenplan voor de instructeur

Dit plan beschrijft wat het spel **nu** doet. Eén tablet per team van 3–5 personen. Jij zit op de laptop met het beheerscherm. De teams spelen zelf; jij grijpt alleen in als een team vastzit of de klok oneerlijk loopt.

Kies bij het aanmaken de modus **Escape Room**. De modi Cyber Awareness en NIS2 Training bestaan en voegen extra schermen toe. Die staan onderaan, apart. Ze horen niet bij een gewone escaperoom.

## 1. Vóór het evenement

1. Start de app op de laptop (`npm run dev` of, na een build, `npm start`). De server luistert op het hele netwerk, niet alleen op localhost.
2. Open op de laptop **`/admin`**. Dat is het instructeurscherm. De link staat ook op de startpagina als **Instructeur**.
3. Wachtwoord: de waarde van **`ADMIN_PASSWORD`** in de omgeving van de laptop (zie `.env.example`). Staat die variabele leeg, dan toont het inlogscherm zelf het ingebouwde standaardwachtwoord. Zet `ADMIN_PASSWORD` voordat de laptop buiten het evenement-wifi bereikbaar is. Het wachtwoord staat hier niet.
4. Maak een sessie:
   - Naam, bijvoorbeeld de naam van het bedrijf.
   - Duur: standaard 60 minuten. Knoppen: 30, 45, 60, 75, 90. Toegestaan is 10 tot 180.
   - Modus: **Escape Room**.
   - **Hints kosten tijd: aan**, seconden **30** (dat is de standaard). Zet het uit als je geen tijdstraf wilt.
   - Eén teamnaam per tablet. Maximaal 24 teams.
   - **Sessie klaarzetten**.
5. Op het bord verschijnt per team een **code van 4 tekens** en een QR. De code gebruikt geen I, O, 0 of 1. De QR opent `/play/` plus die code. Open je het beheer via localhost, dan gebruikt de QR het netwerkadres van de laptop. Zonder dat adres: open het beheer zelf via het IP-adres.
6. Op elke tablet: startpagina, code invullen, **Systeem openen**. Het team ziet dan: wacht tot de instructeur start. Niets telt nog.
7. **Geluid.** Standaard uit. Op de tablet staat rechtsboven **geluid aan**. Zet dat aan vóór de briefing van Mara als het team haar video en later KADE en NORA wil horen. Uit kan ook: Mara heeft ondertiteling (CC staat aan). De keuze blijft op die tablet staan.
8. **Liggend.** Zet de tablet in de landscape-stand en vergrendel de rotatie als dat kan. Na de aanval dekt een staande tablet (smaller dan 900 px) het scherm af met **Draai naar liggend**. In het kantoor gebeurt dat niet; daar mag de tablet ook rechtop, maar liggend leest een groep beter.
9. Als iedereen op het wachtscherm zit: **Iedereen starten**. Tot die knop blijft de sessie op concept en kunnen teams niets onderzoeken.

### De klok

De balk toont in het kantoor het woord **werkdag**, geen aftelling. De aftelling start pas als het team, ná de aanval en ná NORA, op **Onderzoek starten** drukt. Dan krijgen ze de volle sessieduur (standaard 60:00), min eventuele hintstraffen. De film ervoor telt niet mee. Een team kan in het kantoor niet op tijd verliezen.

Op jouw bord staat **kantoor** zolang nog niemand die knop heeft gedrukt. Daarna zie je de laagste resterende tijd van de teams die al in de crisis zitten.

## 2. Wat het team ziet, in volgorde

| Stap | Wat er gebeurt | Jouw aandacht |
| --- | --- | --- |
| Wachten | Scherm met de teamnaam | Nog niet starten tot elke tablet binnen is |
| Mara | Video, knop **Start onderzoek** | Geluid aan als je de stem wilt. CC staat aan |
| Kantoor | Werkbalk: Mail, Agenda, Documenten, Medewerkers, Leveranciers, Nieuws, Onderzoeksdossier. Rechtsboven: Mara de Vries | Klok zegt nog **werkdag** |
| Nieuwe mail | Verschijnt pas na genoeg rondkijken. Stip op Mail | Zie hieronder |
| Keuze in die mail | **Melden als verdacht** of **Bijlage openen** | Melden = +200. Openen = 0. De aanval komt toch |
| Aanval | Bestanden op slot, KADE, daarna NORA | Nog steeds geen klok |
| **Onderzoek starten** | Pas op het NORA-scherm, als haar tekst klaar is | **Hier start de klok** |
| Missie 1 t/m 6 | Puzzels, met tussendoor KADE en NORA | De klok loopt ook tijdens die teksten |

### Wanneer de phishingmail verschijnt

Het team moet **drie van deze vier groepen** openen. Bewaren in het dossier is niet nodig. Openen is genoeg.

1. Mail **Informatie die niet voor ons lijkt** (Astra Logistics).
2. Document **Conceptplanning bijeenkomst**.
3. Eén van deze drie: mail **Crew voor de bijeenkomst**, leverancier **Helix Events**, of document **Overeenkomst vloerpartner**.
4. Agenda **Over 3 dagen · Nexora Day**.

Daarna: stip op de bel en op Mail. De nieuwe mail heet **Definitieve planning Nexora Day**. Afzender oogt als Helix, het adres is `planning@helix-event.co`.

- **Melden als verdacht:** de aanval start, KADE zegt dat ze de mail herkenden, en bij NORA staat **Verdachte mail gemeld · +200**. Die 200 punten zitten in de score.
- **Bijlage openen:** dezelfde aanval, langere KADE-tekst, geen 200 punten. Op het eindscherm staat dan **niet gemeld**.

Een fout antwoord later kost geen tijd. Alleen een hint van het team kost tijd, als je die straf aan hebt gezet.

### Tussen de missies

Na **Onderzoek starten** slaat het spel de eerste KADE- en missie-1-tekst over. Die zaten al in de film. Daarna, steeds met de klok aan:

- Na missie 1: KADE **Wat hij al wist**, NORA **Openbare informatie**, dan missie 2.
- Midden in missie 2, na de afzender en vóór de bijlage: KADE **Het teken**.
- Na missie 2: KADE **Meer dan een mail**, NORA **De communicatie**, dan missie 3.
- Midden in missie 3, na de route en vóór het isoleren: KADE **De lijn**.
- Na missie 3: KADE **Te laat voor de bestanden**, NORA **De sessie is geïsoleerd**, dan missie 4.
- Na missie 4: KADE **De bestanden**, NORA **Herstel voltooid**, dan missie 5.
- Na missie 5: KADE **Een kans**, NORA **Het lek is rond**, dan de finale.
- Finale begint met drie alarmregels. Knop **Crisis openen**, daarna KADE **Final Shutdown**.

Een fout antwoord toont een NORA-zin onderaan, het scherm schudt, en de opdracht blijft open. Geen tijd eraf.

## 3. Hints

Drie niveaus per opdracht. Het team ziet **Hint · +30s** als de straf aan staat (of het aantal seconden dat jij invulde). Elke hint van het team telt die seconden bij de gebruikte tijd. Jouw knop **Hint geven** laat de volgende hint zien en kost **geen** tijd.

De teksten stapelen: niveau 2 toont ook niveau 1. Na drie hints is de knop uit. Hieronder staat het antwoord. De hinttekst zelf hoef je niet voor te lezen.

## 4. De puzzels

Tokens die het team bewaart: **N74192**, **DOCK-244**, **ROUTE-7**, **SEAL**, **HX-19**, **INSIDER:ADLER** (op het scherm: Lek: S. Adler). Andere opdrachten geven geen token.

### Missie 1 — Digital Footprint

**1. Wat wist KADE?** Twaalf openbare kaarten. Per bron één verband, daarna **Verbanden indienen**. Vijf juiste koppels:

| Bron op het scherm | Verband |
| --- | --- |
| Volgende week open ik het (Mara de Vries) | Wie Nexora Day leidt |
| Eerste opbouw (foto met het bord DOKZAAL) | Waar het plaatsvindt |
| Vloer en rigging | Welke partner meebouwt |
| Run-of-show (S. Adler, planning op tafel) | Wie te veel deelde |
| Helix Events (partnergids) | Waarom een mail van die partner geloofwaardig is |

Nieuws, Vale, de kantine, de kwartaalpost, de parkloop, de late shift en de pas bij de koffie horen er niet in. Fout: NORA, niets vastgelegd. Geen token.

Vastgelopen: “Vijf verschillende bronnen. Mara leidt. De foto noemt de zaal. De partnerpost noemt Helix. Adler fotografeerde de planning. De partnergids maakt een mail van die naam geloofwaardig.”

**2. De foto.** Inzoomen op de tafel. Markeer **bord**, **vel** (de planning), **pas** en **keycord**. Niet de mok, niet de plant. Fout als een van die vier mist of als mok of plant mee is gemarkeerd. Geen token.

Vastgelopen: “Laat mok en plant liggen. De rest op de tafel en het zaalbord wel.”

**3. Onderzoeksbord.** Koppel bewijs aan de vraag.

| Vraag | Bewijs |
| --- | --- |
| Wie leidt Nexora Day? | Mara de Vries |
| Waar is het evenement? | Dokzaal |
| Welke leverancier is publiek gekoppeld? | Helix Events |
| Wie zette interne informatie in beeld? | S. Adler |
| Waarom zou een mail van die leverancier worden vertrouwd? | Openbare partnervermelding |

J. Vale en de kantinepost zijn afleiders. Geen token.

Vastgelopen: “Adler is het lek, niet de baas. De openbare vermelding is het vertrouwen, niet de plek.”

**4. recon-nexora.zip.** Drie velden:

- Evenement: **Nexora Day** (niet de kwartaalpresentatie, niet de parkloop).
- Naam die hij kon misbruiken: **Helix Events**.
- Volgende stap: **Die naam als afzender gebruiken**.

Token: **N74192** (op het scherm: Dossier N74192).

Vastgelopen: “Alleen wat jullie al hebben aangetoond. Hoe hij het netwerk in kwam, hoort hier nog niet.”

### Missie 2 — The Fake Supplier

**5. De afzender.** Wijs de mail van **`planning@helix-event.co`** aan (onderwerp: Bijgewerkte planning voor het dok). Het echte adres in het dossier is **`events@helix-events.nl`**. Onderbouw met minstens twee van: **adres op het contract**, **eerder bericht van Helix**, **headers van het aangewezen bericht**. Alleen “de naam Helix in de ondertekening” telt niet. Geen token.

Vastgelopen: “Vergelijk het hele adres. Er mist een s en `.nl` is `.co`. Leg het contract en een oude mail ernaast.”

**6. De bijlage.** Markeer **maker van het bestand** en **regel die alleen in de nieuwe bijlage staat** (de dokregel). Extra markeringen mogen blijven staan; zonder die twee wijst NORA het af. Geen token. Daarna het korte KADE-tussendoor, als ze de afzender al hadden.

Vastgelopen: “De maker is niet het contractadres. In de nieuwe bijlage staat een regel over het dok die in de oude planning niet staat.”

**7. De nachtlog.** Zet precies deze drie, in deze volgorde:

1. Een werkplek opent een leveranciersmail (02:14).
2. Een pas wordt bij het dok gelezen (02:31).
3. Een exportjob verlaat het dok (02:44).

Niet: onderhoud aan rek 7, de spiegelkopie, het kantinelicht. Geen token.

Vastgelopen: “De tijden staan in de log. Eerst de mail, dan de pas, dan de export.”

**8. Het exportspoor.** Job **DOCK-244**. Niet CORE-011 (afgebroken) en niet DOCK-198 (afgekeurde proef). Vink **regel in de exportlog** en **dokregel in de bijlage**. Het kantinebericht telt niet. Token: **DOCK-244**.

Vastgelopen: “02:44, helix-svc, en hetzelfde nummer in de bijlage.”

### Missie 3 — Network Lockdown

**9. De sessie.** Wijs **helix-svc** aan. Minstens twee van deze drie aanwijzingen:

- Actief vóór 02:14, buiten de geplande back-up.
- Serviceaccount vanaf de buitenkant, niet het portaal overdag.
- De bestemming is de bestandskluis.

“Het account bevat het woord Helix” telt niet als bewijs. Geen token.

Vastgelopen: “Niet het portaal overdag en niet de back-up om 03:10. Kijk naar de lookup vóór 02:14 en naar de kluis.”

**10. De route.** Tik op de kaart, begin bij NEX. De lijn die de server goedkeurt:

**NEX → EDGE → DNS → AUTH → VAULT**

(intern: CRU, EDGE, DNS, AUTH, VAULT). Niet via HONEY, niet via PROXY, niet via LOG. Een honeypot- of log-node wijst de server af. Geen token. Daarna KADE **De lijn**.

Vastgelopen: “Volg de tijden 01:52, 01:58, 02:04, 02:06. De scan van 01:55 is geen doorgang.”

**11. Isoleren.** Zet aan:

- **Zet de leverancierssessie tijdelijk in TRAP**
- **Houd de logserver bereikbaar**

**Blokkeer nieuwe tunnels op EDGE** mag erbij. Deze vier niet: kluis uit, naamomzetting uit, log isoleren, al het verkeer naar TRAP. Token: **ROUTE-7**.

Vastgelopen: “Apart zetten, niet alles uitzetten. De log moet blijven.”

**12. Herstel (patchkast).** Kabels:

| Kabel | Poort |
| --- | --- |
| DNS | 53 |
| AUTH | 443 |
| LOG | 514 |
| TRAP | PARK |

Daarna starten: **DNS**, dan **AUTH**, dan **VAULT**. Geen token.

Vastgelopen: “De val hoort op PARK. Eerst wat nergens op wacht, dan wat op DNS wacht, dan de kluis.”

### Missie 4 — Encryption Protocol

**13. Getroffen bestanden.** Markeer de vijf die niet leesbaar zijn:

- planning-nexora-day.xlsx
- contract-helix.pdf
- personeel-nexora.csv
- financieel-q1.xlsx
- agenda-nexora-day.ics

Niet markeren: kantine-menu, herstelhandboek, contact-helix. Die kun je nog lezen. Het handboek noemt de cycli 4, 7, 11, 16. Geen token.

Vastgelopen: “Open ze. Een rij tekens is schade. Een gewone zin is dat niet.”

**14. Controlewaarde.** Volgende cyclus: **22**. De stappen zijn 4, 7, 11, 16. Het verschil groeit met één: +3, +4, +5, dus daarna +6. 16 + 6 = 22. Fout getal: NORA, geen tijd eraf. Geen token.

Vastgelopen: “Niet het laatste getal herhalen. Kijk hoe het gat tussen de getallen groeit.”

**15. Herstelzegel.** Rotor op **07** (het reknummer in ROUTE-7). Het scherm draait ZLHS dan naar **SEAL**. Cassetteteken: **vierkant**. De rijen schuiven door; op de open plek hoort het vierkant. Token: **SEAL** (Zegel SEAL). Alleen het woord of alleen de vorm is niet genoeg.

Vastgelopen: “ROUTE-7: zet de rotor op 07 tot er SEAL staat, en kies vierkant.”

**16. Back-up.** Kies **Nachtelijke Kluis** (gisteren 03:10, generatie 22, alleen backup-svc van VAULT naar LOG). Niet Live Mirror (vandaag 09:40, generatie 23, waarde wijkt af). Niet Shared Recovery (hash lijkt goed, maar er ging een kopie naar planning@helix-event.co). Geen token. Dit is de enige back-upkeuze in de gewone flow. Het id dat het spel bewaart is **kluis-nacht**.

Vastgelopen: “Nieuw is hier slechter. Gelijk uitziende hash is niet genoeg als de log een kopie naar buiten toont.”

**17. Terugzetten.** Herstelpunt **Cyclus 22** (niet 16, niet 23), dan **Integriteit en herstel**. Open **dok-toegang.log**. Kies pas **HX-19 · Helix Events · crew**. Niet 4418 (J. Vale) en niet 2201 (Noordlicht, geweigerd). Token: **HX-19**.

Vastgelopen: “Eerst cyclus 22, dan de log openen, dan de crewpas op de dokpoort.”

### Missie 5 — The Insider

Deze missie staat in het spel. Vier schermen, in deze volgorde.

**18. Camerabeelden.** Bewaar alleen deze fragmenten:

- Kantine **02:36** (cafe-0236): de pas ligt er nog, de tafel is leeg.
- Dokzaal **02:31** (dock-0231): werkjas bij de deur.
- Entree **02:48** (entry-0248): iemand uit de kantoren.
- Leveranciersingang **02:29** (gate-0229): werkjas bij de zijpoort.

Niet bewaren: lege hal 01:55, lege zaal 02:44, dichte poort 02:33. Het beeld van 02:10 (iemand nog aan tafel) hoort er ook niet bij; het spel wil het latere beeld waarop de pas blijft liggen. Geen token.

Vastgelopen: “Lege beelden weg. Bewaar waar een persoon of een pas in beeld blijft.”

**19. Waar was wie.**

| Wie | Plek |
| --- | --- |
| J. Vale | Kantine |
| De werkjas | Dokzaal |
| M. Okonkwo | Rek 7 |
| L. Crowe | Kantoren |

Pasregistratie tegenover het beeld van 02:31: **Wijken af** (niet “Horen bij elkaar”). Vale in het dok wijst NORA af. Geen token.

Vastgelopen: “Om 02:36 ligt de pas nog in de kantine. De log noemt die pas om 02:31 op het dok. Dat is niet dezelfde situatie. De werkjas staat bij de zaal.”

**20. Het document.** Drie tijden van de avond ervoor, niet van de nachtaanval:

- Deelinstelling: **19:04** (iedereen met de link). Niet 18:12.
- Opening: **19:06** (buiten Nexora en buiten Helix). Niet 02:14 en niet 02:44.
- Chatbericht: **19:05** (Adler: de link opengezet).

Geen token.

Vastgelopen: “De mail van 02:14 en de export van 02:44 zijn de latere aanval. Zoek de avond ervoor.”

**21. Incidentrapport.**

- Persoon: **S. Adler**
- Document: **planning-nexora-day.xlsx**
- Oorzaak: **De deellink stond te ruim**
- Opzet: **Fout bij het delen** (niet “bewust meegewerkt”)
- Bewijs, alle drie: **deelgeschiedenis van de planning**, **chat over de opengezette link**, **opening van buiten Nexora**

Alleen het dokbeeld en de pas in de kantine is niet genoeg. Phishing of de export als oorzaak wijst NORA af. Token: **INSIDER:ADLER**.

Vastgelopen: “Wie wijzigde de link in de documentgeschiedenis? Er is geen chat waarin iemand de aanval afspreekt.”

### Missie 6 — Final Shutdown

Deze finale staat in het spel. Vijf stappen, in deze volgorde. Eerst de alarmregels en KADE, zoals hierboven.

**22. Sessies.** Kies **helix-svc** (export-node, nog aangemeld, kluis om 02:06). Minstens twee van:

- Las de bestandskluis om 02:06
- Export om 02:44 vanaf de export-node
- Sprong via EDGE, DNS en AUTH

Niet genoeg: alleen de mailbox, rek 7, of de nachtelijke kluiskopie. j.vale, m.okonkwo, backup-svc en l.crowe horen bij een gewone taak. Geen token.

Vastgelopen: “De naam Helix is niet genoeg. Wijs aan wat die sessie deed: kluis, export, route.”

**23. Intrekken.** Vink **Ik trek deze sessie in**, dan **Lijn verbreken**. Er is geen code. De log blijft bewaard. Daarna een korte KADE-tekst; knop **Verder**.

**24. Vastzetten.** Leg deze tokens op deze systemen. Het dossiernummer, de route en het lek-token horen hier niet.

| Systeem | Token op het scherm | Code |
| --- | --- | --- |
| Perimeter | Zegel SEAL | SEAL |
| Trace | Export DOCK-244 | DOCK-244 |
| Lockout | Helix HX-19 | HX-19 |

Fout token op een systeem: NORA, “een token ligt op een systeem dat er niet bij past.”

Vastgelopen: “Zegel op de rand, exportspoor op trace, crewpas op het slot.”

**25. Herstelcontrole.** Vink deze vijf. De zesde niet.

- De gekozen sessie is ingetrokken
- De route naar de kluis is beperkt
- Herstel kwam uit de nachtelijke kluis
- Planning, contract en agenda zijn weer leesbaar
- De open deellink van de planning sluiten

Niet: **De deellink open laten staan**. Die ene vink maakt de hele controle fout.

Vastgelopen: “Alles wat de deur dichtdoet. De deellink niet open laten.”

**26. Afsluiten.** Vier vakken, in de volgorde van de missies. Vasthouden of **Bevestig afsluiten**.

| Vak | Token |
| --- | --- |
| 1. Onderzoek | Dossier N74192 |
| 2. Export | Export DOCK-244 |
| 3. Route | Route ROUTE-7 |
| 4. Leverancier | Helix HX-19 |

SEAL en het lek-token horen niet in deze rij. Daarna: **SYSTEM RESTORED**.

Vastgelopen: “De volgorde waarin jullie ze vonden. Het zegel is al gebruikt bij het vastzetten.”

## 5. Einde, score en tijd op

Gewonnen: de resterende toegang is ingetrokken, de gecontroleerde back-up is bevestigd, het netwerk kan weer vrij. Het scherm toont score, plek, hints, speeltijd, tijd over en of de valse mail is herkend.

Puntentelling, als iemand ernaar vraagt: 100 per opgeloste opdracht, 150 per afgeronde missie, 400 als ze het hele spel uitspelen, 20 per volle minuut die dan nog over is, en 200 als ze de mail meldden. Een fout antwoord haalt geen punten en geen tijd weg.

**Tijd op**, tijdens de crisis: bij de volgende verversing (ongeveer elke 2,5 seconde) gaat dat team op verloren. Scherm **SYSTEM COMPROMISED**. Tekst: de klok liep af voordat de laatste toegang werd ingetrokken; wat ze al hadden vastgelegd blijft in het rapport; de sessie stond nog open. Andere teams spelen door. Jij kunt met **+1 min** of **+5 min** een net-verlopen team terug in het spel zetten, zolang de sessie niet beëindigd is.

**Beëindigen** op jouw bord zet elk team dat nog speelt op hetzelfde verliesscherm.

## 6. Wat jij op het dashboard kunt

Per sessie:

- **Iedereen starten** — alleen zolang de sessie nog op concept staat. Eén keer.
- **Pauzeren** en **Hervatten** — de klok staat stil voor iedereen. Op de tablets: “De instructeur heeft de klok stilgezet.”
- **+1 min**, **+5 min**, **−1 min** — voor de hele sessie, ook voor teams die nog op kantoor zitten.
- **Beëindigen** — lopende teams verliezen.
- **Exporteer** — een bestand met de stand.
- **Proloog overslaan** — alleen zichtbaar bij Cyber Awareness of NIS2. Bij Escape Room niet.

Per team: code, QR, score, plek, hoeveel opdrachten, resterende tijd, of ze de mail meldden, en de huidige opdracht. **Vastgelopen** betekent: vijf minuten geen vooruitgang.

- **Hint geven** — volgende hint van de opdracht waar ze nu op staan. Geen tijdstraf.
- **Scène opnieuw** — de laatste KADE- of NORA-tekst nog een keer.
- **Volgend moment** — slaat het huidige moment over. Bij een puzzel rekent het spel die opdracht als opgelost en geeft het het token. Gebruik dit alleen als een team echt niet verder kan. Je geeft dan het antwoord weg.
- **Link kopiëren** — dezelfde URL als de QR.

## 7. Alleen als je níet Escape Room koos

Deze schermen bestaan. Ze starten de klok niet. In Escape Room komen ze niet voor.

**Cyber Awareness en NIS2** beginnen met een proloog vóór Mara. Het team kan **Naar Mara** drukken. Jij kunt **Proloog overslaan**. Daarna is de rest hetzelfde spel.

Twee verplichte keuzes, alleen in die modi. Een fout antwoord moet over, anders gaat de missie niet open.

- Na missie 2: **Intern escaleren naar de verantwoordelijke of het incidentteam.** Niet zelf melden bij een externe instantie, niet afwachten, niet sporen wissen.
- Na missie 3, vier vinkjes samen: toegang beperken, accounts opnieuw controleren, verifiëren via bekende contacten, de leverancier informeren via de afgesproken procedure. Niet de samenwerking voorgoed stoppen. Niet een inloggegeven doorsturen.

In missie 4 ligt er een extra vraag over voorrang. Elke keuze mag door. Voor het trainingsrapport is de beoogde keuze **Back-upomgeving eerst veiligstellen**.

**NIS2** toont na het einde een evaluatie van vijf situaties. Fout mag opnieuw tot het goed is. Het spel is dan al gewonnen of verloren; dit blokkeert de klok niet.

| Situatie | Antwoord |
| --- | --- |
| Nieuw rekeningnummer, factuur moet vandaag betaald | Niet betalen en intern laten verifiëren via een bekend contact |
| Vertrouwelijk document staat te open | Intern melden en de deling laten beperken |
| Login vanaf een onbekende plek | Melden en het account laten controleren |
| Iemand gebruikt het account van een collega | Melden volgens de incidentprocedure |
| Kritiek systeem ligt eruit, onbekend herstelprogramma | De incidentprocedure volgen en geen onbekende software gebruiken |

## 8. Snel, als een team vastzit

| Waar | Zeg dit |
| --- | --- |
| Geen nieuwe mail | Open Astra, de conceptplanning, Helix (mail, leverancier of contract) en Nexora Day in de agenda |
| Mail | Melden als verdacht. Niet de bijlage |
| Klok loopt niet | Eerst NORA uitkijken, dan Onderzoek starten |
| Missie 1 archief | Mara, Dokzaal-foto, Helix-vloer, Adler, partnergids |
| Foto | Bord, vel, pas, keycord |
| Bord | Mara, dok, Helix, Adler, openbare vermelding |
| Zip | Nexora Day, Helix Events, die naam als afzender. Token N74192 |
| Afzender | planning@helix-event.co, plus contract en een oude Helix-mail |
| Bijlage | Maker en de extra dokregel |
| Nacht | Mail, pas, export |
| Export | DOCK-244, log en bijlage |
| Sessie | helix-svc, tijd vóór 02:14 en de kluis |
| Route | NEX, EDGE, DNS, AUTH, VAULT |
| Isoleren | Sessie in TRAP, log aan laten. Token ROUTE-7 |
| Kabels | DNS 53, AUTH 443, LOG 514, TRAP op PARK. Start DNS, AUTH, VAULT |
| Schade | Planning, contract, personeel, financiën, agenda |
| Cyclus | 22 |
| Zegel | Rotor 07, woord SEAL, vorm vierkant |
| Kopie | Nachtelijke Kluis |
| Pas | HX-19 |
| Camera | 02:36 kantine, 02:31 dok, 02:48 entree, 02:29 zijpoort |
| Plekken | Vale kantine, werkjas dok, Okonkwo rek 7, Crowe kantoren, pas wijkt af |
| Delen | 19:04, 19:06, 19:05 |
| Rapport | Adler, de planning, te ruime link, een fout, drie bewijzen uit deelgeschiedenis, chat en opening van buiten |
| Finale sessie | helix-svc, plus twee van kluis, export en route |
| Zegels | SEAL, DOCK-244, HX-19 |
| Controle | Alles aan, behalve de deellink open laten |
| Afsluiten | N74192, DOCK-244, ROUTE-7, HX-19 |
