# Konzept: Sammlung MBG · Abi 2028

Ein begehbares 3D-Museum, das von jetzt (Oktober 2026) bis zum Abi im August 2028 wächst. Jedes Halbjahr kommt ein neuer Flügel dazu. Am Ende steht die komplette Geschichte des Jahrgangs als Ausstellung, die man beim Abiball zeigen und danach für immer online lassen kann.

## 1. Idee

- **Ein Raum = ein Kapitel.** Die Räume sind chronologisch: Man läuft von der Oberstufe bis zum Abi durch die Zeit.
- **Es wächst live mit.** Was passiert, kommt zeitnah rein. So bleibt es spannend, regelmäßig reinzuschauen.
- **Es ist ein Spiel.** Exponate entdecken, Zähler „Entdeckt x/y“, später versteckte Exponate und Rätsel.

## 2. Gebäudeplan

Das Museum ist ein Gebäude mit Aufzug. Ein Wegweiser in der Lobby zeigt alle Etagen.

| Etage | Name | Aufbau |
|---|---|---|
| E | **Lobby** | Große Halle mit Titel, Wegweiser, Stufenfoto und Begrüßung |
| 1 | **Q1.1** (Aug 2026 – Jan 2027) | Große Räume hintereinander, ein Raum pro Thema (z. B. Erste Tage, Events) |
| 2 | **Q1.2** (Feb – Jul 2027) | wie oben |
| 3 | **Q2.1** (Aug 2027 – Jan 2028) | wie oben |
| 4 | **Q2.2** (Feb – Jul 2028) | wie oben, mit Mottowoche, Abistreich und Abiball |
| 5 | **Kurse** | Flur mit einem Raum für jeden Kurs |
| 6 | **Wir** | Flur mit einem Raum für jede Person, mit dem Namen groß an der Wand |
| 7 | **Hall of Fame** | Dunkle Räume mit Goldrahmen für Rekorde, Preise und Legenden |
| 8 | **Portalsaal** | Leuchtende Portale. Jedes führt entweder zu einem Link (Instagram, Video, Spiel …) oder an einen Ort im Museum, z. B. in den Raum einer Person |

Neue Halbjahre, Räume, Personen und Portale kommen einfach in `sammlung.js` dazu. Die Räume und Flure bauen sich dann von selbst. Wird ein Raum zu voll, wird er automatisch in „Teil 1, Teil 2“ geteilt.

## 3. Was ich von dir brauche

Für jedes Exponat:

1. **Das Material:** ein Foto, ein Screenshot, ein Scan (Plakat, Zettel, Kunstwerk) oder bei Zitaten nur den Text.
2. **Titel**, kurz, zum Beispiel „Stufenfahrt Berlin“.
3. **Art:** Bild an der Wand, Zitattafel oder Gegenstand in der Vitrine.
4. **Optional:** von wem oder woher, Datum und 1 bis 3 Sätze dazu, also die Geschichte dahinter.
5. **Wohin:** welche Etage und welcher Raum, z. B. „Q1.1 · Stufenfahrt“, „Wir · Person X“ oder „Hall of Fame“. Wenn du es nicht weißt, ordne ich es nach Datum ein.

Für die Etagen „Wir“ und „Kurse“ brauche ich außerdem die Liste der Namen und Kurse. Für die Portale brauche ich den Titel und den Link oder das Ziel im Museum.

**Am einfachsten:** Schick mir alles einfach im Chat, Bilder plus eine Zeile Text. Ich trage es ein, mache die Bilder klein und pushe.

## 4. Regeln (wichtig!)

- **Einverständnis:** Fotos, auf denen Leute klar zu erkennen sind, nur mit deren OK (DSGVO, Recht am eigenen Bild). Das gilt besonders für Lehrer.
- **Zitate:** nur Lustiges, nichts Bloßstellendes. Lehrerzitate sind anonym oder mit Absprache.
- **Keine privaten Daten:** keine Nachnamen, Adressen oder Handynummern im Museum.
- **Sichtbarkeit:** Vorschlag ist, dass das Museum bis zum Abiball per Passwort geschützt oder nur über einen nicht öffentlichen Link erreichbar ist.

## 5. Zeitplan & Ausbaustufen

| Wann | Was |
|---|---|
| **Okt – Dez 2026** | Gebäude mit allen Etagen, Aufzug und Portalsaal steht ✓. Lobby und Q1.1 befüllen, Namensliste für „Wir“ und Kursliste sammeln. |
| **Anfang 2027** | Raumnamen über den Türen statt nur „Raum 2“. Jeder Raum bekommt eigene Wandfarbe und eigenes Thema. Passwortschutz. |
| **Frühjahr 2027** | **Einreichungs-Funktion:** Mitschüler können selbst Bilder und Zitate einreichen, du gibst sie frei. |
| **Sommer 2027** | Spiel-Features: versteckte Exponate, Rätsel oder Quiz pro Raum, Erfolge. |
| **Herbst 2027** | Videos als Exponate (Bildschirm an der Wand), Hintergrundmusik und Audio-Kommentare. |
| **Anfang 2028** | **Abschlussraum** mit allen Namen der Stufe (Wand der Abiturienten), interaktive Abi-Zeitleiste. |
| **Juni 2028** | Feinschliff, Test auf Handy, iPad und Beamer. |
| **Abiball Juli/Aug 2028** | Große Eröffnung: Präsentation auf dem Beamer, QR-Code zum Selbst-Durchlaufen. |
| **Danach** | Das Museum bleibt online als digitales Abibuch für immer. |

## 6. Organisation in der Stufe

- **Kurator/in (du):** entscheidet, was rein kommt.
- **Sammelteam:** ein paar Leute, die bei Events Fotos machen und Zitate aufschreiben, zum Beispiel in einer WhatsApp-Gruppe „Museum“.
- **Rhythmus:** etwa einmal im Monat ein Paket an mich, dann ist das Museum immer aktuell.
- **Teaser:** ab und zu einen Screenshot oder einen neuen Raum in der Stufengruppe teilen, damit Leute neugierig bleiben.

## 7. Technik (kurz)

- Läuft im Browser auf PC, iPad und Handy, ohne App.
- Hosting auf Render (Docker), Code auf GitHub.
- Exponate stehen in `sammlung.js`, Bilder in `exponate/`.
- Bilder sollten jpg sein und unter 2000 px groß. Ich verkleinere zu große Bilder, damit es auf dem Handy flüssig bleibt.
