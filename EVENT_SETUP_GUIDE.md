# Evenement starten

Dit is voor de instructeur op de laptop. Je hoeft geen programmeur te zijn. Het wachtwoord zet je zelf in de omgeving. Het staat bewust niet in deze gids.

## Voor je de zaal in gaat

1. Zet de laptop op het wifi van het evenement. De tablets moeten op hetzelfde wifi zitten. Mobiele data van de tablet is niet genoeg.
2. Kies zelf een lang wachtwoord voor beheer. Deel het alleen met de instructeur.
3. Open PowerShell in de map van het spel en typ, met jouw eigen wachtwoord tussen de aanhalingstekens:

```powershell
$env:ADMIN_PASSWORD = "hier-jouw-eigen-wachtwoord"
npm run build
npm start
```

4. De terminal toont een adres, meestal poort 3000. Laat dat venster open. Als er al een spelserver op poort 3456 draait, start dan geen tweede server op diezelfde poort.
5. Controleer voor de deelnemers binnenkomen dit adres in de browser van de laptop: `http://127.0.0.1:3000/api/health` (gebruik de poort uit de terminal). Je wilt `ok` en `storage` op `ready` zien. Staat daar een fout, start het spel dan niet.

## Wat wel en niet zonder internet werkt

- Foto’s, de intro van Mara en de afbeelding van KADE zitten op de laptop. Die hebben geen internet nodig.
- De lettertypen zitten ook op de laptop, zodra `npm run build` één keer is gelukt. Een bouw op een laptop die de lettertypen nog nooit heeft binnengehaald, heeft die bestanden in de map `fonts` nodig. Die map hoort bij het project.
- De stem van KADE en NORA komt van de tablet. Zet het geluid op de tablet aan en probeer één zin vóór de groep begint. Sommige tablets downloaden een stem de eerste keer.
- Het spel zelf praat alleen met de laptop. Een tablet heeft geen internet nodig zolang het wifi naar de laptop werkt.

## Beheer

1. Ga op de laptop naar `/admin`.
2. Log in met het wachtwoord dat je hierboven in `ADMIN_PASSWORD` hebt gezet.
3. Maak een sessie. Kies de duur, of hints tijd kosten, en de modus:
   - Escape Room: meteen het kantoor.
   - Cyber Awareness of NIS2 Training Experience: eerst een proloog.
4. NIS2 voegt na afloop een evaluatie en een trainingsrapport toe. Dat rapport is geen certificaat en zegt niet dat het bedrijf aan de wet voldoet.
5. Zet de teams erin. Elke ploeg krijgt een code van acht tekens en een QR. De QR wijst naar het adres dat de tablets kunnen openen, niet naar localhost. Deel een code alleen met die ploeg. Oude codes van vier tekens blijven werken.
6. Laat de tablets de QR scannen of de code intypen. Ze blijven in de lobby tot jij start.
7. Druk op starten als iedereen zover is.

Twee tablets met dezelfde code delen de score, de hints en de klok. Wat ze in het kantoor al hebben aangeklikt, blijft op die ene tablet staan. Geef elke ploeg daarom één tablet, of spreek af wie de code intypt.

## Tijdens het spel

- Pauzeren zet de klok voor iedereen stil. De tablets tonen dan dat de instructeur de klok heeft stilgezet. Hervatten laat hem weer lopen.
- Een hint kost alleen tijd als je dat bij de sessie hebt aangezet. Een tablet die de hint per ongeluk twee keer verstuurt, krijgt de straf één keer.
- De klok begint pas als de ploeg op Onderzoek starten drukt, niet tijdens de proloog of het kantoor.

## Na afloop

- Op de tablet staat het eindscherm met de score. Bij NIS2 kan de ploeg ook een trainingsrapport bewaren.
- In beheer kun je de sessie exporteren.
- Beëindigen sluit de sessie voor ploegen die nog bezig zijn.

## Uitzetten

1. In beheer: afmelden.
2. In het PowerShell-venster: Ctrl+C.
3. Klaar. De voortgang blijft in het databasebestand op de laptop staan tot je dat bestand zelf weggooit. Gooi tijdens een lopend evenement `data/game.sqlite` niet weg.
