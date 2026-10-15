# NIS2-game-implementatie

Escape the Hack 2.0 heeft een optionele laag gekregen: briefing, proloog The Origin, drie teamkeuzes, een kort herstelpakket in missie 4, en een NIS2-nabespreking. De zes bestaande missies en de finale zijn niet herschreven. De standaardmodus blijft de huidige escape room. De crisis-klok start nog steeds alleen na Onderzoek starten, na NORA.

## Wat er staat

- Sessie-modus bij aanmaken: Escape Room (standaard), Cyber Awareness, of NIS2 Training Experience. De instructeur ziet plantijden (ongeveer 60 minuten spel, ongeveer 75 minuten inclusief nabespreking). Dat is geen tweede klok.
- Cyber Awareness en NIS2: beveiligingsbriefing, titelkaart THE ORIGIN, zes scènes, daarna de bestaande Mara-video en het kantoor. Voortgang staat per team op de server. Een refresh slaat afgeronde scènes over via `eth-origin` in sessionStorage, op dezelfde manier als `eth-cine`. Demo-stop Proloog en de knop Proloog overslaan zetten de scènes op gezien zonder de klok te starten.
- Drie keuzes, alleen in Awareness en NIS2. Na de phishing-ontdekking: intern escaleren. Tijdens de versleuteling in missie 4: prioriteit, met gevolgen en een vastgelegde strategie; de puzzels blijven speelbaar. Na de geïsoleerde leveranciersverbinding: toegang beperken, accounts opnieuw controleren, verifiëren via bekende contacten, informeren via de afgesproken procedure. Beoordeling op de server. Opnieuw insturen van een vaststaande juiste keuze telt niet nog een keer. De keuzes veranderen de spelscore niet.
- Missie 4, alleen in die twee modi: een onbekend herstelpakket. Herkomst, verkopersclaim, vertrouwen en schade staan erbij. Herstel loopt via de Nachtelijke Kluis. Er is geen download. SEAL, HX-19, kluis-nacht en de herstelantwoorden zijn niet gewijzigd.
- NIS2-modus, na het bestaande eindscherm: vijf teamsituaties, server-side beoordeeld, met een kort tekstueel trainingsrapport. Geen pdf. Formulering: cybersecurity-awareness-training met NIS2-gerelateerde leerdoelen. Geen claim van compliance of certificering, geen score per persoon.
- NORA-kaartjes na missie 1 tot en met 5 gebruiken de drie vragen wat gebeurde er, waarom was dit gevaarlijk, en wat doe je op je eigen werk anders. Ze blijven kort en zijn overslaarbaar. Missie 6 krijgt die drie regels op het eindscherm van de trainingsmodi.

## Bestanden

- `lib/game/awareness.ts` — modi, proloog, beoordeling, rapport
- `lib/types.ts`, `lib/db/sql.ts`, `lib/db/store.ts` — modus en `awareness_json`, met migratie
- `lib/game/actions.ts`, `lib/game/snapshot.ts`, `lib/game/demo.ts`
- `app/api/sessions/route.ts`
- `app/api/play/[code]/origin/route.ts`, `decision/route.ts`, `eval/route.ts`
- `components/game/Origin.tsx`, `AwarenessBeats.tsx`, `PlayApp.tsx`, `Kade.tsx`, `Recovery.tsx`, `puzzles/index.tsx`
- `components/admin/AdminApp.tsx`, `components/home/DemoJumps.tsx`
- `lib/game/story.ts` — alleen de korte NORA-leerregels
- `app/globals.css`
- `tests/engine.test.ts`

De finale, `Shutdown.tsx` en `GAME_AUDIT_REPORT.md` zijn niet aangepast.

## Tests

- `npx tsx --test tests/engine.test.ts` — 15 geslaagd, 0 gefaald. Nieuw: standaardmodus escape, proloog laat `breachOffsetSec` null, keuzebeoordeling zonder dubbele of extra score, NIS2-evaluatie.
- `npx tsc --noEmit` — geslaagd.
- Browser op de bestaande server `http://127.0.0.1:3456`, landschap 1280×820: demo Proloog toont de briefing (eerste zin zichtbaar, geluid uit). Naar Mara opent de bestaande Mara-video met Start onderzoek. Daarna: modus awareness, fase kantoor, `running` false, resterend 3600, acht proloogscènes op de server.

Tijdens hot reload gaf `POST /api/play/DEMO/origin` één keer 500 met `Unexpected end of JSON input`. Een volgende POST gaf 200. Dat is de bekende Next-devfout, geen geslaagde smoke.

## Nog niet gedaan

- Geen pdf. Het rapport is een tekstbestand.
- Geen eigen muziekbed. Het moment waarop de muziek wegvalt is stilte, omdat er geen muziek start.
- Geen gegenereerde stills. De scènes gebruiken de bestaande foto's en het KADE-beeld.
- De verbindende briefingregels tussen de verplichte openings- en slotzin stonden niet als volledig script in de repo. Openings- en slotzin zijn letterlijk. De KADE-zinnen over werk, vertrouwen en prijs volgen de bestaande KADE-stem en de opdracht.
- Escape Room krijgt de proloog, de drie keuzes en de evaluatie niet.

## Juridische verificatie

De keuze over ongeautoriseerde toegang en het trainingsrapport noemen de drie NCSC-fasen voor significante incidenten: vroegtijdige waarschuwing uiterlijk 24 uur, melding uiterlijk 72 uur, eindverslag binnen een maand. Bron: [NCSC, meldplicht Cyberbeveiligingswet](https://www.ncsc.nl/cyberbeveiligingswet-nis2/meldplicht), geraadpleegd in deze sessie. De tekst staat gemarkeerd als leermoment ter juridische verificatie. Drempels verschillen per sector en er zijn uitzonderingen. Het spel stuurt geen melding en zegt niet dat een organisatie onder de wet valt.
