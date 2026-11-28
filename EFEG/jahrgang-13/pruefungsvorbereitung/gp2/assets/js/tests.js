/* Testzusammenstellung EFEG GP Teil 2. Erzeugt mit build_web.py. */
(function () {
  "use strict";
  var AP2 = (window.AP2 = window.AP2 || {});
  AP2.TESTS = [
    {"id": "s1", "topic": "S", "title": "Schutzmaßnahmen und Netzsysteme – Teil 1", "short": "Teil 1", "icon": "🛡️", "desc": "Schutzklassen, Netzsysteme, Abschaltzeiten, Erdungswiderstand im TT-System und das IT-System.", "ids": ["S-01", "S-02", "S-03", "S-04", "S-05", "S-06", "S-07"]},
    {"id": "s2", "topic": "S", "title": "Schutzmaßnahmen und Netzsysteme – Teil 2", "short": "Teil 2", "icon": "🛡️", "desc": "Fehlerarten, Schleifenimpedanz, LS-Charakteristiken, Kennzeichnung und Schutzebenen.", "ids": ["S-08", "S-09", "S-10", "S-11", "S-12", "S-13", "S-14"]},
    {"id": "r1", "topic": "R", "title": "RCD und Prüfen – Teil 1", "short": "Teil 1", "icon": "🔍", "desc": "Aufbau und Funktion des RCD, Kennzeichnung, RCD-Typen, TN-C-System, Typ F und Selektivität.", "ids": ["R-01", "R-02", "R-03", "R-04", "R-05", "R-06", "R-07", "R-08"]},
    {"id": "r2", "topic": "R", "title": "RCD und Prüfen – Teil 2", "short": "Teil 2", "icon": "🔍", "desc": "Zusätzlicher Schutz, Prüftaste, RCD-Prüfung sowie die Prüfung elektrischer Geräte.", "ids": ["R-09", "R-10", "R-11", "R-12", "R-13", "R-14", "R-15"]},
    {"id": "e1", "topic": "E", "title": "Energie- und Antriebstechnik – Teil 1", "short": "Teil 1", "icon": "⚡", "desc": "Liniendiagramm, Effektivwert, Phasenverschiebung, Leistung und Drehstrom-Heizregister.", "ids": ["E-01", "E-02", "E-03", "E-04", "E-05", "E-06"]},
    {"id": "e2", "topic": "E", "title": "Energie- und Antriebstechnik – Teil 2", "short": "Teil 2", "icon": "⚡", "desc": "Leistungsschild, Wirkungsgrad, Schlupf, Motorabsicherung und Sicherheitstransformator.", "ids": ["E-07", "E-08", "E-09", "E-10", "E-11", "E-12"]},
    {"id": "e3", "topic": "E", "title": "Energie- und Antriebstechnik – Teil 3", "short": "Teil 3", "icon": "⚡", "desc": "Akkumulatoren, Betriebsstrom, Strombelastbarkeit, Spannungsfall und Nennstromregel.", "ids": ["E-13", "E-14", "E-15", "E-16", "E-17", "E-18"]},
    {"id": "l1", "topic": "L", "title": "Licht und Wärme – Teil 1", "short": "Teil 1", "icon": "💡", "desc": "Wirkungsgradverfahren, Leuchtenauswahl, Lichtausbeute, Energiekosten und Lichtfarbe.", "ids": ["L-01", "L-02", "L-03", "L-04", "L-05", "L-06", "L-07"]},
    {"id": "l2", "topic": "L", "title": "Licht und Wärme – Teil 2", "short": "Teil 2", "icon": "💡", "desc": "LED-Dimmung, Beleuchtungsstärke, Wärmepumpe, § 14a EnWG und Warmwasserbereitung.", "ids": ["L-08", "L-09", "L-10", "L-11", "L-12", "L-13", "L-14"]},
    {"id": "h1", "topic": "H", "title": "Hausanschluss, Bad und E-Mobilität – Teil 1", "short": "Teil 1", "icon": "🏠", "desc": "Hausanschluss, TN-C-S-System, TAB, Wandlermessung und Bereiche im Duschbad.", "ids": ["H-01", "H-02", "H-03", "H-04", "H-05", "H-06", "H-07", "H-08"]},
    {"id": "h2", "topic": "H", "title": "Hausanschluss, Bad und E-Mobilität – Teil 2", "short": "Teil 2", "icon": "🏠", "desc": "Schutz im Duschbad, Ladebetriebsart, RCD für Ladepunkte, Anmeldung und Lastmanagement.", "ids": ["H-09", "H-10", "H-11", "H-12", "H-13", "H-14", "H-15"]},
    {"id": "b1", "topic": "B", "title": "Blitzschutz und Erdung – Teil 1", "short": "Teil 1", "icon": "🌩️", "desc": "Fundament- und Ringerder, Maschenweite, Durchgangswiderstand und äußerer Blitzschutz.", "ids": ["B-01", "B-02", "B-03", "B-04", "B-05", "B-06", "B-07"]},
    {"id": "b2", "topic": "B", "title": "Blitzschutz und Erdung – Teil 2", "short": "Teil 2", "icon": "🌩️", "desc": "Überspannungsschutz, Trennungsabstand, Varistor, Potentialausgleich und Erdungsleiter.", "ids": ["B-08", "B-09", "B-10", "B-11", "B-12", "B-13", "B-14"]},
    {"id": "k1", "topic": "K", "title": "Kommunikation, Meldetechnik und Steuerung – Teil 1", "short": "Teil 1", "icon": "📡", "desc": "Antennenanlage und Pegelberechnung, Netzformen, Meldelinie und Einbruchmeldetechnik.", "ids": ["K-01", "K-02", "K-03", "K-04", "K-05", "K-06", "K-07", "K-08", "K-09"]},
    {"id": "k2", "topic": "K", "title": "Kommunikation, Meldetechnik und Steuerung – Teil 2", "short": "Teil 2", "icon": "📡", "desc": "Rauchwarnmelder, KNX, Datennetze, PoE und Kleinsteuerung.", "ids": ["K-10", "K-11", "K-12", "K-13", "K-14", "K-15", "K-16", "K-17"]},
    {"id": "a1", "topic": "A", "title": "Arbeitssicherheit und Installation – Teil 1", "short": "Teil 1", "icon": "👷", "desc": "Sicherheitsregeln, Absturzsicherung, Erste Hilfe beim Stromunfall und DGUV Vorschrift 3.", "ids": ["A-01", "A-02", "A-03", "A-04", "A-05", "A-06", "A-07"]},
    {"id": "a2", "topic": "A", "title": "Arbeitssicherheit und Installation – Teil 2", "short": "Teil 2", "icon": "👷", "desc": "Baustromverteiler, Prüffristen, Leitungsroller, CEE-Farben, Schutzarten und Brandschutz.", "ids": ["A-08", "A-09", "A-10", "A-11", "A-12", "A-13", "A-14"]},
    {"id": "mix", "title": "Gemischter Test", "icon": "🎲", "random": 10, "desc": "10 zufällige Aufgaben aus allen Themen – bei jedem Start eine neue Auswahl."},
    {"id": "mix20", "title": "Großer gemischter Test", "icon": "🏁", "random": 20, "desc": "20 zufällige Aufgaben aus allen Themen – zum Abschluss der Vorbereitung."}
  ];
})();
