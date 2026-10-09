# Sammlung MBG · Abi 2028

Ein begehbares 3D-Museum im Browser (three.js). Man läuft durch die Räume, schaut sich Bilder, Zitate und Vitrinen an und sammelt dabei alle Exponate („Entdeckt x/y“, wird im Browser gespeichert).

## Steuerung

- **Computer:** `W A S D` / Pfeiltasten laufen, Maus umschauen, `Shift` schneller, `E` oder Klick Exponat ansehen, `K` Katalog, `Esc` Pause
- **iPad / Handy:** Joystick links zum Laufen, rechts wischen zum Umschauen, Exponat antippen

Im **Katalog** stehen alle Exponate nach Räumen; ein Tipp darauf bringt dich direkt davor.

## Exponate hinzufügen

1. Bild in den Ordner `exponate/` legen (jpg/png, am besten nicht größer als ca. 2000 px).
2. In `sammlung.js` einen Eintrag ergänzen:

```js
{ art:'bild', titel:'Abiball', bild:'exponate/abiball.jpg', von:'Stufe', datum:'Juni 2028', beschreibung:'…' },
{ art:'zitat', titel:'Mathe-LK', text:'Das ist trivial.', von:'Herr X' },
{ art:'objekt', titel:'Der Stufen-Pokal', bild:'exponate/pokal.jpg' },
```

Pro Raum gibt es 8 Wandplätze (Bilder und Zitate) und 2 Vitrinen (Objekte). Werden es mehr, baut das Museum automatisch weitere Räume an.

## Starten

Bilder laden nur über einen Webserver, nicht per Doppelklick auf `index.html`:

```bash
python3 -m http.server 8000
```

Dann http://localhost:8000 öffnen. Online geht es z. B. über GitHub Pages (Settings → Pages → Branch wählen).
