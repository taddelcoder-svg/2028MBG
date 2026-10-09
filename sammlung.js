/*
  Sammlung MBG – Abi 2028
  =======================
  Hier stehen alle Exponate. Das Museum baut die Räume automatisch:
  Pro Raum gibt es 8 Plätze an den Wänden (für "bild" und "zitat")
  und 2 Vitrinen in der Mitte (für "objekt"). Werden es mehr, kommt
  einfach ein weiterer Raum dazu.

  Felder:
    art          "bild"   – gerahmtes Foto/Bild an der Wand
                 "zitat"  – Texttafel an der Wand (z. B. Lehrerzitat)
                 "objekt" – Foto eines Gegenstands in einer Glasvitrine
    titel        Name auf dem Schild
    bild         Pfad zur Bilddatei, z. B. "exponate/abiball.jpg"
                 (fehlt er, wird ein Platzhalter gezeichnet)
    text         nur bei "zitat": der Text auf der Tafel
    von          wer / woher (optional)
    datum        wann (optional)
    beschreibung längerer Text in der Detailansicht (optional)

  Die Einträge unten sind nur Platzhalter, bis die echten Sachen kommen.
*/
window.SAMMLUNG = {
  titel: 'Sammlung MBG',
  untertitel: 'Abi 2028',
  exponate: [
    {
      art: 'bild',
      titel: 'Platzhalter 1',
      von: '–',
      datum: '–',
      beschreibung: 'Hier kommt das erste Exponat hin.'
    },
    {
      art: 'bild',
      titel: 'Platzhalter 2',
      beschreibung: 'Hier kommt das zweite Exponat hin.'
    },
    {
      art: 'zitat',
      titel: 'Platzhalter-Zitat',
      text: 'Hier steht später ein legendäres Zitat.',
      von: '–'
    },
    {
      art: 'objekt',
      titel: 'Platzhalter-Vitrine',
      beschreibung: 'Hier kommt ein Gegenstand in die Vitrine.'
    },
    {
      art: 'bild',
      titel: 'Platzhalter 3'
    },
    {
      art: 'bild',
      titel: 'Platzhalter 4'
    }
  ]
};
