# Escape the Hack 2.0 — The Breach

Digitale escape room voor tablets, bedoeld voor bedrijfsuitjes en teambuilding van Flitz-events. Alle hacks zijn fictie binnen het spel. Er wordt geen extern systeem benaderd.

## Starten op de evenementlaptop

```bash
npm install
npm run dev
```

Open het beheer op `http://<ip-van-deze-laptop>:3000/admin`.

Zolang `ADMIN_PASSWORD` niet is gezet, is het wachtwoord `flitz-admin`. Zet een eigen wachtwoord in `.env` (zie `.env.example`) voor je de laptop buiten het evenement-wifi bereikbaar maakt.

Tablets op hetzelfde wifi openen de QR-link. Staat het beheer op `localhost`, dan gebruikt de QR het gevonden netwerkadres.

## Sessie

1. Log in als instructeur.
2. Vul teamnamen, duur en hintstraf in.
3. Laat elk team de eigen QR of code openen. Ze wachten in de lobby.
4. Start iedereen tegelijk. Elk team begint op kantoor bij Nexora. De klok van 60 minuten start pas als dat team na NORA op Onderzoek starten drukt.

Voortgang, scores en oplossingen worden op de server gecontroleerd. Een tablet bewaart de laatste stand lokaal en stuurt invoer opnieuw na een korte netwerkonderbreking.

## Gegevens

Zonder `DATABASE_URL` gebruikt de app een SQLite-bestand in `data/game.sqlite`. Dat past bij één laptop op locatie.

Voor meerdere servers:

```bash
DATABASE_URL=postgres://user:pass@host:5432/escape
```

## Spel

Eén doorlopend incident: werkdag, phishingmail, aanval, en daarna negentien opdrachten in één spoor. Een herkende phishingmail levert 200 punten op; de aanval start dan alsnog. Hints hebben drie niveaus. De score telt opgeloste opdrachten, afgeronde missies, resterende crisistijd en een afrondingsbonus.

## Scripts

- `npm run dev` — ontwikkelserver op het netwerk
- `npm test` — oplossingen, timer en score
- `npm run build` — productiebouw
- `npm start` — productieserver op het netwerk
