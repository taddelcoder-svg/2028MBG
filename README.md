# Sammlung MBG · Abi 2028

Ein begehbares 3D-Museum im Browser (three.js). Man läuft durch die Räume, schaut sich Bilder, Zitate und Vitrinen an und sammelt dabei alle Exponate („Entdeckt x/y“, wird im Browser gespeichert).

## Steuerung

- **Computer:** `W A S D` / Pfeiltasten laufen, Maus umschauen, `Shift` schneller, `E` oder Klick ansehen bzw. benutzen, `F` Aufzug, `K` Katalog, `Esc` Pause
- **iPad / Handy:** Joystick links zum Laufen, rechts wischen zum Umschauen, Exponate, Aufzug und Portale antippen

Im **Katalog** stehen alle Etagen, Räume und Exponate; ein Tipp darauf bringt dich direkt hin.

## Aufbau

Lobby (Erdgeschoss), je eine Etage pro Halbjahr, eine Etage „Kurse“, eine Etage „Wir“ (ein Raum pro Person), Hall of Fame und ein Portalsaal. Alles wird in `sammlung.js` beschrieben – die Datei erklärt oben alle Felder. Bilder kommen in den Ordner `exponate/`.

Beispiel für einen Raum mit Exponaten:

```js
{ name:'Stufenfahrt', exponate:[
  { art:'bild', titel:'Ankunft', bild:'exponate/stufenfahrt-1.jpg', datum:'Sep 2026' },
  { art:'zitat', titel:'Mathe-LK', text:'Das ist trivial.', von:'Herr X' },
  { art:'objekt', titel:'Der Stufen-Pokal', bild:'exponate/pokal.jpg' }
] }
```

Beispiel für Portale:

```js
{ titel:'Unser Insta', link:'https://instagram.com/…' },
{ titel:'Zu Person 1', etage:'personen', raum:'Person 1' }
```

## Starten

Bilder laden nur über einen Webserver, nicht per Doppelklick auf `index.html`:

```bash
python3 -m http.server 8000
```

Dann http://localhost:8000 öffnen.

**Render (Docker):** Das `Dockerfile` startet `server.js` auf `$PORT`. Health-Check: `/healthz`.
