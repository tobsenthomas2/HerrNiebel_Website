# THERMOVOLT Systems GmbH – Herstellerauftritt Warmwassertechnik

Lernwebsite nach `KI_Website_Guide.md` für **EFEG 12**, LF 12 „Energie- und gebäudetechnische Anlagen planen und realisieren“ in Verbindung mit LF 10 „Elektrische Geräte und Anlagen der Haustechnik …“ (Einheit Projektmanagement & Warmwassergeräte, Woche 1).

**Konzept:** THERMOVOLT ist ein fiktiver Hersteller elektrischer Warmwasserbereiter. Die Seite ist ein reiner Firmenauftritt: Der Kundenfall Hesselholz kommt **nicht** auf der Website vor (er kommt als Sprachnachricht, Chat und Unterlagen in die Klasse). Der Chef des Ausbildungsbetriebs, **Andreas Grabmaier** (Elektro Grabmaier GmbH), ist nebenberuflich Referent der THERMOVOLT-Fachpartner-Akademie und Mitentwickler der Projektmethode **ProStart** – deshalb nutzt das Team dessen Leitfaden und Steckbrief-Vorlage.

**Werkzeuge ja, Lösungen nein:** Die Seiten erklären Prinzipien und bieten Prüfstände; die Ergebnisse für den Fall Hesselholz (Diagnose, Rechnung, Geräteauswahl, SMART-Ziel) stehen nirgends.

## Seiten

| Datei | Navigation (EN / DE) | Inhalt | Zweck in der Stunde |
|---|---|---|---|
| `index.html` | Home / Start | Claim, Produktlinien COMPACT · STORE · FLOW, Referenzen | Orientierung |
| `about.html` | Company / Firma | Geschichte, Fertigung, Ausbildung | Authentizität |
| `products.html` | Products / Produkte | 5 Geräte mit Kenndaten und Netto-Listenpreisen, Vergleichstabelle | Geräteauswahl, Kosten |
| `technology.html` | Technology / Technik | Speicher vs. Durchlauf, offen vs. druckfest, 230 V vs. 400 V, hydraulisch vs. elektronisch | Rollen Küche & Bad, Reflexionskarte A |
| `configurator.html` | Planning Tool / Planungshilfe | Anschluss-Check, Betriebskosten-Vergleich | Prüfen der Auswahl, Reflexionskarte B |
| `project-guide.html` | Partner Academy / Fachpartner-Akademie | ProStart: Kundendienst oder Projekt, 4 Phasen, Magisches Dreieck, SMART, Steckbrief-Download, Chef als Referent | Rolle Projektleitung, Reflexionskarte C |
| `support.html` | Service & FAQ | Montagefehler, Netzbetreiber, Inbetriebnahme „erst Wasser, dann Strom“ | Informationsauswahl, Sprinter |
| `expert.html` | Expert Know-how / Expertenwissen | Regelungstechnik, Netzrückwirkungen, Opferanode, Hygiene | Differenzierung nach oben |
| `request.html` | (Footer) Contact / Kontakt | Kontaktformular – **sendet keine Daten** | Authentizität |

## Simulationen (`assets/js/`)

| Platzhalter | Datei | Seite | Inhalt |
|---|---|---|---|
| `data-sim="power"` | `sim-power.js` | technology | Leistung im Durchlauf aus V̇ und Δϑ; Speicher: Q, Aufheizzeit, Mischwasser |
| `data-sim="tank"` | `sim-tank.js` | technology | offener/geschlossener Behälter × Nieder-/Druckarmatur → Druck im Behälter, Ventilstelle A/B |
| `data-sim="heater"` | `sim-heater.js` | configurator | Anschluss-Check: Gerät, Entnahmestellen, Armatur, Anschluss, Komfort → Meldungen |
| `data-sim="costs"` | `sim-costs.js` | configurator | Anschaffung + Strom über die Nutzungsdauer für DH18 / DE21 / S120 |
| `data-sim="projectcheck"` | `sim-projectcheck.js` | project-guide | 3 Übungsaufträge + Schnell-Check der 5 Merkmale nach DIN 69901-5 |
| `data-sim="triangle"` | `sim-triangle.js` | project-guide | Magisches Dreieck mit Fixieren/Freigeben und „Was passiert, wenn …?“ |
| `data-sim="smart"` | `sim-smart.js` | project-guide | SMART-Baukasten am Beispiel Vereinsheim |

`physics.js` enthält die gemeinsamen Rechenmodelle (c = 4,19 kJ/(kg·K), I = P/U, I = P/(√3·U)).

## Lehrer-Einstellungen (`assets/js/config.js`)

- `showValues: false` – Anschluss-Check zeigt den Strom nicht als Zahl, sondern nur die Formel (Schüler rechnen selbst). `true` für Kontrolle/Besprechung.
- `hints: true` – Wo es einen Tipp gibt, sitzt unten rechts am Kasten bzw. an der Simulation ein kleines „!“. Ein Klick öffnet den gelben Hinweis, ein zweiter schließt ihn. `false` blendet alle Tipps aus.
- `kiChatUrl: ""` – Link zu einem KI-Chat eintragen, dann erscheint unten rechts ein Support-Button.
- `legalRoot` – Pfad zu Impressum/Datenschutz auf herrniebel.de (Standard `../../../../`).

## Technik

- Reines HTML/CSS/JS, kein Build, läuft per Doppelklick offline.
- Für Tablets/iPads geprüft (hoch und quer): Produktkarten unter 1200 px einspaltig, Kostenvergleich unter 1100 px untereinander, größere Bedienflächen bei Touch-Bedienung, Eingabefelder mit 16 px (kein automatisches Zoomen).
- Sprache EN Standard, Umschalter EN | DE (`?lang=de`), keine Cookies, kein Storage.
- Schrift Inter lokal als woff2 (`assets/fonts/`, SIL Open Font License 1.1).
- Downloads: `docs/ProStart_Projektsteckbrief.pdf` (= leeres Arbeitsblatt der Stunde).

## Beim Hochladen auf herrniebel.de

- Kachel in `config.json`, fiktive Firma **THERMOVOLT Systems GmbH** ins Impressum eintragen.
- Keine externen Dienste → Datenschutzerklärung unverändert (außer ein KI-Chat-Link wird gesetzt).
