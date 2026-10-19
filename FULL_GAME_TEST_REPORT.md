# Volledige speltest — fase 8

De automatische ronde gebruikt de payloads die `lib/game/grade.ts` goedkeurt. Ze draait tegen een aparte sqlite-database, niet tegen de live evenementdata.

## `npm test` — geslaagd, 21 van 21

De nieuwe ronde dekt dit:

- Lobby vóór de start. Oplossen is dan geblokkeerd.
- Escape Room heeft geen proloog. Awareness en NIS2 wel. Dezelfde proloogscène twee keer opslaan maakt geen tweede exemplaar. Tijdens de proloog loopt de crisisklok niet.
- De klok gaat aan bij de breach (Onderzoek starten). Een tweede breach houdt hetzelfde startpunt. Melden van de valse mail geeft +200, één keer.
- Na het incident is de KADE-toespraak van missie 1 nog niet als gezien opgeslagen. Een verversing van die scène verdubbelt haar niet.
- Missies 1 tot en met 6 zijn oplosbaar. Een fout antwoord laat de puzzel staan. Een juiste oplossing nog een keer verhoogt de score niet, ook niet na het eindscherm.
- Een hint op niveau 1, direct herhaald, kost één tijdstraf van 30 seconden.
- Finale, in deze volgorde: verkeerde sessie, juiste sessie met te weinig sporen, juiste sessie met genoeg sporen, intrekken, zegels, herstelcontrole terwijl de deellink nog open staat, daarna met de link dicht, en de afsluitvolgorde. Het eindscherm is SYSTEM RESTORED, 23 puzzels.
- NIS2: drie keuzes (escalatie, leverancier, herstelprioriteit in missie 4), vijf evaluaties pas na de finale, en een trainingsrapport uit de opgeslagen antwoorden. Het rapport zegt geen certificaat en geen “NIS2-compliant”.
- Escape Room weigert die keuzes en die evaluatie.
- Tien teams tegelijk. Een fout bij ploeg 3 verandert de score, de missers, de inventaris en de hintstraf van de anderen niet. Ploeg 1 lost missie 1 helemaal op en houdt één token N74192. Een dubbele hint bij ploeg 2 kost 30 seconden, niet 60. De klokken lopen apart: het verschil in resterende tijd zit bij die ene straf.
- Twee keer dezelfde teamcode lezen geeft dezelfde serverstand. Wat alleen op het toestel staat (kantoor en half ingevulde puzzels) deelt de server niet.

Daarnaast blijven de bestaande eenheidstests groen, inclusief de scoreformule zonder wijziging.

## Rooktest tegen de productiebouw — geslaagd

`node scripts/smoke.mjs` op `http://127.0.0.1:3467`, met `ADMIN_PASSWORD` uit de omgeving en een sqlite-bestand buiten `data/game.sqlite`.

Afsluitregel: `smoke ok 4680 SYSTEM RESTORED`.

Onderweg gecontroleerd: gezondheidscheck, spelers krijgen geen beheer, demo geeft 404, een fout wachtwoord lekt geen ontwikkelwachtwoord, kantoor zonder lopende klok, +200 één keer, tweede breach start de klok niet opnieuw, missie 1 is na het incident nog te zien, hint-retry houdt 30 seconden, het andere team blijft op 0 opgeloste puzzels, pauze blokkeert spelen.

## Browser

Geen tweede server op 3456. De controle liep op 3467.

- Startscherm in productie toont geen demoknoppen.
- Proloog van Awareness opent.
- Kantoor, briefing en de knoppen Bijlage openen en Melden als verdacht.
- KADE-tekst van missie 1, met de knop Onderzoek openen.
- Puzzelschermen van missie 1, 2, 3, 4 en 5, de finale met de sessiekeuze, en het eindrapport.
- Beheer na login: pauzeren, tijd aanpassen, teams en codes. Het loginscherm noemde geen wachtwoord.

De aanvalsfilm is niet tot NORA doorgelopen op elk formaat. De knoppen die haar starten stonden wel in beeld.

## Niet bewezen

- Geen handmatige klikronde van elke puzzel op een fysieke tablet.
- Geen tien echte browsers tegelijk, alleen tien teams in één testproces.
- De oude ontwikkelserverfout `loadManifest` is niet opnieuw op poort 3456 nagespeeld.
