# Productiegereedheid — fase 8

Datum van deze controle: 15 oktober 2026. Er is niets gecommit of gepusht.

## Oordeel

Een begeleide pilot op één laptop in het evenement-wifi is technisch redelijk. Beheer heeft in productie geen vast wachtwoord meer, een volledige ronde is automatisch groen, en de productieserver gaf op een vrije poort `smoke ok` met het eindscherm SYSTEM RESTORED.

Dit is geen certificering en geen uitspraak dat de organisatie aan NIS2 of de Cyberbeveiligingswet voldoet.

## Wat er in de code is veranderd

- Productie weigert beheer als `ADMIN_PASSWORD` ontbreekt. De fout noemt geen wachtwoord. Lokaal (`npm run dev`) blijft het ontwikkelwachtwoord werken en het loginscherm zegt dat expliciet.
- Het beheercookie is `Secure` als de site via HTTPS binnenkomt, en bruikbaar op HTTP op het evenement-wifi.
- Acht foute wachtwoorden vanaf hetzelfde adres binnen tien minuten worden geweigerd. Een ander adres telt apart. Een geslaagde login wist de teller.
- Spelers zonder beheercookie krijgen geen sessies, export of besturing. In productie zijn demoknoppen en `/api/demo` voor spelers dicht, ook als `DEMO_TOOLS` aan staat. Alleen een ingelogde instructeur kan de demo-API dan nog gebruiken.
- Een hint stuurt het niveau mee. Dezelfde hint nog een keer geeft geen tweede tijdstraf. Een juiste oplossing die al vastligt, ook de laatste, telt geen tweede score. Een tweede breach start de klok niet opnieuw.
- Na de aanvalsfilm blijft de KADE-toespraak van missie 1 staan. De film bevatte het incident, niet die missie-introductie.
- De werkbalk in het kantoor kan op een tablet van 1024 pixels breed omklappen, zodat Onderzoeksdossier en de meldingenknop in beeld blijven.
- `/api/health` laat zien of de opslag antwoordt, zonder wachtwoord of bestandspad.
- Het webmanifest komt uit de app zelf. De oude verwijzing die in de ontwikkelserver een kapotte JSON-fetch kon geven, is weg.
- Sora en Share Tech Mono staan in `fonts/` en gaan mee in de bouw. De bouw hoeft ze niet meer bij Google op te halen.

De scoreformule, de missies en het verhaal zijn niet herschreven.

## Commando's die echt zijn uitgevoerd


| Commando                                               | Resultaat                                                                                                                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                             | Geslaagd. 21 tests, 0 mislukt. Eerdere pogingen in deze run faalden eerst op de testlader en daarna op een dubbele laatste oplossing; dat is aangepast en daarna opnieuw groen. |
| `npm run typecheck`                                    | Geslaagd, na een typefout rond `NODE_ENV` in de tests.                                                                                                                          |
| `npm run build`                                        | Twee keer geslaagd. De tweede keer na de tablet-werkbalk.                                                                                                                       |
| `node scripts/smoke.mjs` tegen `http://127.0.0.1:3467` | Geslaagd. Afsluitregel: `smoke ok 4680 SYSTEM RESTORED`.                                                                                                                        |


Poort 3456 was al bezet. De rooktest en de tabletcontrole gebruikten poort 3467 en een apart sqlite-bestand in de tijdelijke map, niet `data/game.sqlite`. De testserver is daarna gestopt.

## Tablet

Gemeten in de browser, niet op een fysieke tablet.


| Scherm                     | 1024×768                                       | 1180×820                                                            | 1280×800                       | 1366×1024               |
| -------------------------- | ---------------------------------------------- | ------------------------------------------------------------------- | ------------------------------ | ----------------------- |
| Start                      | ja                                             | via dezelfde layout, geen horizontale overflow op de smallere maten | ja op de werkbalk van het spel | ja op beheer            |
| Lobby, proloog, briefing   | ja                                             | niet elk scherm opnieuw                                             | niet elk scherm opnieuw        | niet elk scherm opnieuw |
| Kantoor en phishingknoppen | ja, na de werkbalkfix                          | ja                                                                  | ja                             | ja                      |
| KADE missie 1              | ja                                             | niet apart                                                          | niet apart                     | niet apart              |
| Missies 1 tot en met 5     | ja                                             | de gedeelde bovenbalk is op missie 1 en de finale gecontroleerd     | idem                           | idem                    |
| Finale                     | ja, bevestigen zit in het scrollende zijpaneel | ja                                                                  | ja                             | ja, knop net in beeld   |
| Eindrapport                | ja, knoppen zitten in het scrollende rapport   | niet apart                                                          | niet apart                     | niet apart              |
| Beheer, inclusief pauzeren | ja                                             | ja                                                                  | ja                             | ja                      |


De aanvalsfilm tot de knop Onderzoek starten is niet op alle vier de formaten uitgespeeld. De phishingknoppen die de film starten stonden wel in beeld. De film zelf vult het scherm.

## Bewust niet als bug veranderd

- Hintniveau 3 legt het spoor uit. Niveau 1 noemt het antwoord niet. Dat is de hintladder, geen programmeerfout.
- De finalekaart van helix-svc noemt het kluisbezoek om 02:06. Ze noemt het account niet de hacker en niet “de deur van KADE”.
- Twee tablets met dezelfde teamcode delen de serverstand (score, hints, opgeloste puzzels, klok). Het kantooronderzoek en een half ingevulde puzzel zitten in de localStorage van die tablet.
- Pauze en hervatten bestonden al in beheer. Dat is niet opnieuw gebouwd.

## Wat een pilot nog niet bewijst

- Geen testronde op echte tablets in de zaal.
- Geen meting van het wifi-bereik of van tien gelijktijdige browsers; de tien teams zijn in de automatische test wel tegelijk op de server gezet.
- De ontwikkelserver op 3456 is niet opnieuw op de oude `loadManifest`-fout gejaagd. De productiebouw levert het manifest wel als route.
- Spraak gebruikt de stem van het toestel. Of die stem offline beschikbaar is, hangt van de tablet af.

