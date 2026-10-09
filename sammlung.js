/*
  Sammlung MBG – Abi 2028
  =======================
  Das Museum ist ein Gebäude mit Etagen. Man fährt mit dem Aufzug
  zwischen den Etagen hin und her. Die Reihenfolge unten ist die
  Reihenfolge im Aufzug (die erste Etage ist das Erdgeschoss).

  Eine Etage:
    id         kurzer Name ohne Leerzeichen (für Portale), z. B. "q11"
    name       Name im Aufzug und auf den Schildern
    untertitel optional, z. B. der Zeitraum
    layout     "lobby"   – große Eingangshalle mit Wegweiser
               "kette"   – große Räume hintereinander (für Halbjahre, Hall of Fame)
               "flur"    – ein Flur mit vielen kleineren Räumen links und rechts
                           (für Personen und Kurse)
               "portale" – Saal mit Portalen
    wand       optional: Wandfarbe, z. B. "#3b2330"
    raeume     Liste von Räumen: { name:'…', exponate:[ … ] }
    exponate   (nur Lobby) die Exponate der Lobby
    portale    (nur Portalsaal) Liste von Portalen, siehe unten

  Ein Exponat:
    art          "bild"   – gerahmtes Foto an der Wand
                 "zitat"  – Texttafel an der Wand
                 "objekt" – Foto eines Gegenstands in einer Glasvitrine
    titel        Name auf dem Schild
    bild         Pfad zur Bilddatei, z. B. "exponate/abiball.jpg"
                 (fehlt er, wird ein Platzhalter gezeichnet)
    text         nur bei "zitat": der Text auf der Tafel
    von, datum, beschreibung   optional

  Platz pro Raum: "kette" 8 Wandplätze + 2 Vitrinen, "flur" 6 + 1.
  Hat ein Raum mehr Exponate, wird er automatisch in Teil 1, Teil 2 … aufgeteilt.

  Ein Portal:
    titel        Schild über dem Portal
    link         Webadresse, die sich öffnet (z. B. Instagram, ein Video, ein Spiel)
    etage, raum  ODER: Ziel im Museum, z. B. etage:'personen', raum:'Person 1'
    beschreibung optional
    farbe        optional, z. B. "#7b5cff"
  Ohne link und etage ist das Portal noch geschlossen.

  Alles mit "Platzhalter" oder "Person 1" usw. wird später ersetzt.
*/
window.SAMMLUNG = {
  titel: 'Sammlung MBG',
  untertitel: 'Abi 2028',
  etagen: [
    {
      id: 'lobby', name: 'Lobby', layout: 'lobby',
      exponate: [
        { art:'bild', titel:'Stufenfoto (Platzhalter)', beschreibung:'Hier kommt das Foto der ganzen Stufe hin.' },
        { art:'zitat', titel:'Willkommen', text:'Willkommen in der Sammlung MBG – dem Museum des Abijahrgangs 2028.' }
      ]
    },
    {
      id: 'q11', name: 'Q1.1', untertitel: '1. Halbjahr · Aug 2026 – Jan 2027', layout: 'kette',
      raeume: [
        { name: 'Erste Tage', exponate: [
          { art:'bild', titel:'Platzhalter 1', von:'–', datum:'–', beschreibung:'Hier kommt das erste Exponat hin.' },
          { art:'bild', titel:'Platzhalter 2' },
          { art:'zitat', titel:'Platzhalter-Zitat', text:'Hier steht später ein legendäres Zitat.', von:'–' },
          { art:'objekt', titel:'Platzhalter-Vitrine', beschreibung:'Hier kommt ein Gegenstand in die Vitrine.' }
        ] },
        { name: 'Events', exponate: [
          { art:'bild', titel:'Platzhalter 3' },
          { art:'bild', titel:'Platzhalter 4' }
        ] }
      ]
    },
    { id: 'q12', name: 'Q1.2', untertitel: '2. Halbjahr · Feb – Jul 2027', layout: 'kette', raeume: [] },
    { id: 'q21', name: 'Q2.1', untertitel: '3. Halbjahr · Aug 2027 – Jan 2028', layout: 'kette', raeume: [] },
    { id: 'q22', name: 'Q2.2', untertitel: '4. Halbjahr · Feb – Jul 2028', layout: 'kette', raeume: [] },
    {
      id: 'kurse', name: 'Kurse', untertitel: 'Ein Raum für jeden Kurs', layout: 'flur',
      raeume: [ { name:'Kurs 1' }, { name:'Kurs 2' }, { name:'Kurs 3' } ]
    },
    {
      id: 'personen', name: 'Wir', untertitel: 'Ein Raum für jede Person', layout: 'flur',
      raeume: [ { name:'Person 1' }, { name:'Person 2' }, { name:'Person 3' }, { name:'Person 4' } ]
    },
    {
      id: 'hof', name: 'Hall of Fame', untertitel: 'Rekorde, Preise und Legenden', layout: 'kette', wand: '#3b2330',
      raeume: [ { name:'Legenden' } ]
    },
    {
      id: 'portale', name: 'Portalsaal', untertitel: 'Türen zu anderen Welten', layout: 'portale',
      portale: [
        { titel:'Hall of Fame', etage:'hof', beschreibung:'Bringt dich direkt in die Hall of Fame.', farbe:'#d8b46a' },
        { titel:'Portal 2', beschreibung:'Hier kommt später ein Link hin.' },
        { titel:'Portal 3' },
        { titel:'Portal 4' }
      ]
    }
  ]
};
