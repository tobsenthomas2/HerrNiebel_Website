# STALLWATT Agrartechnik GmbH – Herstellerauftritt Elektrowärme für Stall und Hof

Lernwebsite nach `KI_Website_Guide.md` für **EBT 12**, Lernfelder „Elektrotechnische Anlagen planen und realisieren“ und „Elektrotechnische Anlagen in Stand halten und ändern“. Reihe „Geflügelhof Federbichl“ (8 Wochen, Projektmanagement + Elektrowärme).

**Konzept:** STALLWATT ist ein fiktiver Hersteller von Elektrowärme für die Tierhaltung. Die Seite ist ein reiner Firmenauftritt: Der Kundenfall (Geflügelhof Federbichl) kommt auf der Website nicht vor – er steckt in den Unterrichtsunterlagen.

**Werkzeuge ja, Lösungen nein:** Die Seiten erklären Prinzipien und bieten Prüfstände; die Ergebnisse für den Fall müssen die SuS selbst erarbeiten. Schwesterseite für EFEG 12: `EFEG/jahrgang-12/betriebstechnik/thermovolt` (gleiche Technik, anderer Hersteller).

## Seiten

| Datei | Reiter (EN / DE) | Inhalt | Funktion im Unterricht |
|---|---|---|---|
| `index.html` | Home / Start | Firmenauftritt, Produktlinien RADIANT · CONTACT · AIR | Einstieg in die Seite |
| `about.html` | Company / Firma | Firmengeschichte, Fertigung, Qualität | Authentizität |
| `products.html` | Products / Produkte | Wärmestrahler SW-R250, Dunkelstrahler SW-D150, Wärmeplatte SW-P60, Stall-Heizgeräte SW-H6/H9, Steckdosenverteiler SW-V6, Vergleichstabelle | Geräteauswahl (Technik Wärme, Technik Elektro) |
| `technology.html` | Technology / Technik | 1 Wärmeübertragung · 2 Strahler oder Platte? mit Stall-Check · 3 Was hält ein Stromkreis aus? mit Prüfstand · 4 230 V oder 400 V? | Fehler des Kunden nachweisen |
| `configurator.html` | Planning / Planung | Tiere je Wärmequelle, Heizgerät nach Stallfläche, Kostenvergleich je Durchgang | Anzahl, Größe, Wirtschaftlichkeit |
| `project-guide.html` | Academy / Akademie | Kundendienst oder Projekt, 4 Phasen, Magisches Dreieck, SMART, Projektsteckbrief (Vorlage als PDF) | Projektleitung |
| `support.html` | Service | FAQ (Sicherung löst aus, stärkere Sicherung?, Kabeltrommel, Heizlüfter, Fassung), typische Planungsfehler | Rückruf vorbereiten |
| `expert.html` | Expert / Experten | Auslöser im LS, DIN VDE 0100-705 im Überblick, symmetrische Last | Differenzierung nach oben |
| `request.html` | (Footer) Contact / Kontakt | Kontaktformular – **sendet keine Daten** | Authentizität |

## Simulationen (`assets/js/`)

| Platzhalter | Datei | Seite | Inhalt |
|---|---|---|---|
| `data-sim="barncheck"` | `sim-barncheck.js` | technology | Stall-Check: Wärmequelle, Schutzkorb, Schutzart, Fassung, Aufhängung, Abstand → Meldungen |
| `data-sim="circuit"` | `sim-circuit.js` | technology | Geräte an einen 230-V-Stromkreis hängen, LS B10/B16, Kabeltrommel auf-/abgewickelt → Auslastung und Meldungen |
| `data-sim="brood"` | `sim-brood.js` | configurator | Zwei Lösungen: Leistung, kWh und Stromkosten je Durchgang, Anschaffung, Amortisation in Durchgängen |
| `data-sim="projectcheck"` | `sim-projectcheck.js` | project-guide | 3 Übungsaufträge + Schnell-Check der 5 Merkmale nach DIN 69901-5 |
| `data-sim="triangle"` | `sim-triangle.js` | project-guide | Magisches Dreieck mit Fixieren/Freigeben und „Was passiert, wenn …?“ |
| `data-sim="smart"` | `sim-smart.js` | project-guide | SMART-Baukasten am Beispiel Reiterhof |
| `data-sim="spec"` | `sim-spec.js` | project-guide | Übung „Lastenheft, Pflichtenheft oder Lösungswunsch?“ am Beispiel Hofkäserei (Woche 2) |

## Lehrer-Einstellungen (`assets/js/config.js`)

- `week: 1` – **Unterrichtswoche.** Die Website wächst mit der Reihe: Angezeigt wird nur, was bis zu dieser Woche freigegeben ist. **Vor jeder Einheit anpassen** (steht im UVP unter „Vorbereitung“). Ändern direkt auf GitHub: Datei öffnen → Stift → Zahl ändern → „Commit changes“; nach 1–2 Minuten live.
  - Früheren Stand zeigen: Link mit `?w=1` weitergeben. Der Zusatz wandert beim Klicken über alle Seiten mit. Mehr als in `week` freigegeben ist, lässt sich über den Link nicht anzeigen.
  - Im HTML: `data-week="N"` = erst ab Woche N sichtbar, `data-week-max="N"` = nur bis Woche N.
  - Die Einstellung ist unabhängig von der EFEG-Seite THERMOVOLT (eigene `config.js`).

| Woche | kommt dazu |
|---|---|
| 1 | Grundstand: Wärmequellen, Technik 1–4, Planungshilfe, Akademie (Projekt-Check, Phasen, Dreieck, SMART, Steckbrief) |
| 2 | Produkte: Linie AQUA (SW-DE21, SW-U5, SW-S80) · Technik: Formelkarte „Wasser erwärmen“ · Akademie: Lastenheft/Pflichtenheft mit Übung und Vorlage |

- `showValues: false` – Der Stromkreis-Prüfstand zeigt Leistung und Strom nicht als Zahl, sondern nur Balken und Meldung (Schüler rechnen selbst). `true` für Kontrolle/Besprechung.
- `hints: true` – Wo es einen Tipp gibt, sitzt ein kleines „!“. Ein Klick öffnet den Hinweis. `false` blendet alle Tipps aus.
- `kiChatUrl: ""` – Link zu einem KI-Chat eintragen, dann erscheint unten rechts ein Support-Button.
- `legalRoot` – Pfad zu Impressum/Datenschutz auf herrniebel.de (Standard `../../../../`).

## Technik

- Reines HTML/CSS/JS, kein Build, läuft per Doppelklick offline. Keine externen Dienste, keine Cookies, kein Storage.
- Für Tablets/iPads geprüft (hoch und quer).
- Sprache EN Standard, Umschalter EN | DE (`?lang=de`).
- Schrift Inter lokal als woff2 (`assets/fonts/`, SIL Open Font License 1.1).
- Downloads: `docs/Projektsteckbrief_Vorlage.pdf` (Woche 1) und `docs/Pflichtenheft_Vorlage.pdf` (Woche 2) – leere Vorlagen ohne Kundenfall.
- Alle Firmen, Personen und Produkte sind erfunden. Technische Angaben sind für den Unterricht vereinfacht; maßgeblich sind Normen und Herstellerangaben.
