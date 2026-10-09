# Konzept: Sammlung MBG · Abi 2028

Ein begehbares 3D-Museum, das von jetzt (Oktober 2026) bis zum Abi im August 2028 wächst. Jedes Halbjahr kommt ein neuer Flügel dazu. Am Ende steht die komplette Geschichte des Jahrgangs als Ausstellung, die man beim Abiball zeigen und danach für immer online lassen kann.

## 1. Idee

- **Ein Raum = ein Kapitel.** Die Räume sind chronologisch: Man läuft von der Oberstufe bis zum Abi durch die Zeit.
- **Es wächst live mit.** Was passiert, kommt zeitnah rein. So bleibt es spannend, regelmäßig reinzuschauen.
- **Es ist ein Spiel.** Exponate entdecken, Zähler „Entdeckt x/y“, später versteckte Exponate und Rätsel.

## 2. Raumplan (Vorschlag)

| Raum | Thema | Zeitraum |
|---|---|---|
| Eingang | Titel, Willkommen, Wer wir sind (Stufenfoto) | – |
| 1 | Anfang der Oberstufe: erste Tage, Kurswahl, Stufenfahrt | bis Feb 2027 |
| 2 | Q1-Halbjahr 1: Klausuren, Events, Partys | Feb – Jul 2027 |
| 3 | Q1-Halbjahr 2 | Aug 2027 – Jan 2028 |
| 4 | Q2 und Abiturprüfungen: Lernphase, Mottowoche, letzter Schultag | Feb – Mai 2028 |
| 5 | Abistreich, Zeugnisse, Abiball | Jun – Aug 2028 |
| Sonderräume | **Zitatwand** (Lehrer- und Schülerzitate), **Hall of Fame** (Rekorde, Preise), **Lehrerzimmer** (Danke an die Lehrer), **Kursräume** (ein Raum pro LK) | laufend |

Die Reihenfolge ist flexibel. Räume kommen hinzu, sobald es genug Material gibt (8 Wandplätze und 2 Vitrinen pro Raum).

## 3. Was ich von dir brauche

Für jedes Exponat:

1. **Das Material:** ein Foto, ein Screenshot, ein Scan (Plakat, Zettel, Kunstwerk) oder bei Zitaten nur den Text.
2. **Titel**, kurz, zum Beispiel „Stufenfahrt Berlin“.
3. **Art:** Bild an der Wand, Zitattafel oder Gegenstand in der Vitrine.
4. **Optional:** von wem oder woher, Datum und 1 bis 3 Sätze dazu, also die Geschichte dahinter.
5. **Raum:** in welches Kapitel es gehört. Wenn du es nicht weißt, ordne ich es nach Datum ein.

**Am einfachsten:** Schick mir alles einfach im Chat, Bilder plus eine Zeile Text. Ich trage es ein, mache die Bilder klein und pushe.

## 4. Regeln (wichtig!)

- **Einverständnis:** Fotos, auf denen Leute klar zu erkennen sind, nur mit deren OK (DSGVO, Recht am eigenen Bild). Das gilt besonders für Lehrer.
- **Zitate:** nur Lustiges, nichts Bloßstellendes. Lehrerzitate sind anonym oder mit Absprache.
- **Keine privaten Daten:** keine Nachnamen, Adressen oder Handynummern im Museum.
- **Sichtbarkeit:** Vorschlag ist, dass das Museum bis zum Abiball per Passwort geschützt oder nur über einen nicht öffentlichen Link erreichbar ist.

## 5. Zeitplan & Ausbaustufen

| Wann | Was |
|---|---|
| **Okt – Dez 2026** | Grundgerüst steht ✓. Eingang und Raum 1 befüllen. Eine kleine Gruppe sammelt Material (2 bis 4 Leute). |
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
