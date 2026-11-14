# WATT AUF ACHSE – DIY-Blog zur Gleichrichtung

DIY-Blog der fiktiven Bloggerin **Kathi** („Watt auf Achse – selbstgebauter Strom für Rad, Hütte & Trail")
für die Reihe Gleichrichtung (Fach SG, Jahrgang 11, EBT, LF 6). Aufmachung nach KI-Website-Guide,
Abschnitt 2b (DIY-Blog). Englisch Standard, Umschalter EN | DE. Reines HTML/CSS/JS, keine externen
Abhängigkeiten, läuft auch per Doppelklick (Schriften aus `/vendor/fonts`).

Die Lernsituation (Flo, sein Rad, seine Nachricht) steht **nicht** auf dem Blog – sie liegt in OneNote.
Kathi zeigt nur **verwandte** Projekte (Gartentrafo, Solarleuchte, Kleinwindrad), nie Flos Lösung.

## Seiten

| Datei | Inhalt | ab Woche |
|---|---|---|
| `index.html` | Start: Kathi, neueste Beiträge, Mini-Simulation „Welche Richtung?", Werkbank-Notizen | 1 |
| `led-on-ac.html` | Beitrag LOG #11: LEDs am Gartentrafo – Scheitelwert, LED-Sperrspannung 5 V, Schutzdiode in Reihe / antiparallel, Messen mit dem Oszi, Leserkommentare | 1 |
| `basics.html` | So funktioniert's: û/T/f, Diode, Einweggleichrichter (Woche 1); Brückengleichrichter, Mittelwert U_d, Generatoren (ab Woche 2); Oszi-Regeln | 1 / 2 |
| `parts.html` | Bauteil-Ecke: 1N4007, 3-W-Power-LED (Woche 1); 1N5817, 1N5819 (ab Woche 2) – mit PDF-Datenblättern | 1 / 2 |
| `about.html` | Über mich (Kathi, Werkstatt-Regeln) | 1 |
| `diode-duel.html` | Beitrag LOG #12: Silizium vs. Schottky an der Solarleuchte, U_RRM-Regel, **Leserkommentare als Impuls** (Schottky-Brücke + Elko ohne Sperrspannung) | 2 |
| `small-wind.html` | Für Fortgeschrittene (Experten): Kleinwindrad, Drehstrom, Messwerte, Diodenfrage offen, B6U-Prinzip | 2 |

## Ordner

```
assets/css/site.css          Design für alle Seiten (Tokens, Bausteine, Schrauber-Chat)
assets/js/config.js          Lehrer-Einstellungen (siehe unten)
assets/js/week.js            Unterrichtswoche: blendet Inhalte ein/aus (OHNE defer im <head> laden)
assets/js/site.js            Navigation (NAV-Array), Fußzeile, Sprache, Inhaltsverzeichnis, Schrauber-Chat
assets/js/scope.js           Baukasten für Simulationen: Oszi, Schaltzeichen, Regler, Bauteilmodelle
assets/js/sim-*.js           je eine Simulation
assets/js/vendor/qrcode.js   QR-Code für den Chat (qrcode-generator, MIT-Lizenz, K. Arase)
assets/img/                  Logo, Favicon, Titelbild (eigene SVG)
docs/                        eigene Datenblatt-Zusammenfassungen (PDF, EN)
```

## Simulationen

| `data-sim` | Skript | Seite | Woche |
|---|---|---|---|
| `polarity` | `sim-polarity.js` | index | 1 |
| `led-ac` | `sim-led-ac.js` | led-on-ac | 1 |
| `rectifier` | `sim-rectifier.js` | basics | 1: nur Trafo 50 Hz + E1U · ab 2: + B2U, Generator mit Drehzahlregler (ohne Schottky, ohne Elko) |
| `diode-loss` | `sim-diode-loss.js` | diode-duel | 2 |
| `three-phase` | `sim-three-phase.js` | small-wind | 2: Phasen + leitende Dioden · ab 3: + Ausgangsspannung |

## Lehrer-Einstellungen (`assets/js/config.js`)

```js
week: 1,                   // vor jeder Stunde die aktuelle Woche eintragen
messwerteAnzeigen: false,  // true = Simulationen zeigen Zahlen (Mittelwert, Dunkelphase, Sperrspannung …)
tippsMarkieren: false,     // true = Leserkommentare bekommen „hilfreich / unvollständig / falsch / am Thema vorbei"
kiChat: { url: "…", hinweisBeimLaden: true, hinweisSekunden: 10 }
```

| Woche | Stunde | sichtbar |
|---|---|---|
| 1 | Vorstunde S-1 | Start, LED-Beitrag, Grundlagen bis Einweggleichrichter, Bauteil-Ecke 1N4007 + Power-LED, Über mich |
| 2 | Lehrprobe | + Brückengleichrichter, Mittelwert, Generator-Simulator, Dioden-Duell mit Kommentaren, 1N5817/1N5819, Für Fortgeschrittene |
| 3 | Folgestunde S+1 | + Ausgangsspannung im Drehstrom-Simulator (B6U) – weitere Inhalte folgen |

Einen früheren Stand zeigt der Link-Zusatz `?w=1` (nie mehr als in `config.js`). Interne Links nehmen `?w=` und `?lang=de` mit.

**Kachel:** noch nicht in `config.json` eingetragen (Seite nur per Link erreichbar). Zum Freischalten unter EBT → Jahrgang 11 ein Fach SG anlegen, z. B.:

```json
{ "id": "sg", "title": "SG - System- und Gerätetechnik", "folder": "SG", "children": [
  { "id": "gleichrichtung", "title": "Gleichrichtung", "description": "DIY-Blog „Watt auf Achse“: Dynamo, Dioden, Brückengleichrichter – mit Simulationen.", "icon": "🚲", "tags": ["Simulation"], "badge": "Neu" }
] }
```

## Prompt für das AIS-Lernszenario „Schrauber-Chat"

```
Rolle: Du bist der „Schrauber-Chat“ – der KI-Werkstattassistent von Kathi, die den DIY-Blog
„Watt auf Achse“ schreibt (selbstgebauter Strom für Rad, Hütte und Trail). Du duzt, bist locker
und gern humorvoll, aber fachlich exakt.

Zielgruppe: Auszubildende Elektroniker/-innen für Betriebstechnik, 2. Ausbildungsjahr, Fach
System- und Gerätetechnik. Vorwissen: Wechselspannung (û, U_eff, T, f), R/L/C an Wechselspannung,
Diode und LED (Durchlass- und Sperrverhalten, Kennlinie, Datenblatt).

Themen: Diode und LED (U_F, U_R bzw. U_RRM, I_F); LED an Wechselspannung und Schutzdiode;
Einweggleichrichter (E1U); Brückengleichrichter (B2U) mit Strompfaden; Mittelwert U_d
(ideal ≈ 0,45·U bzw. ≈ 0,9·U); Silizium- und Schottky-Dioden (1N4007, 1N5817, 1N5819);
Generatoren (f = p·n, Spannung steigt mit der Drehzahl, Leerlaufspannung); Messen mit dem
Oszilloskop (ein Tastkopf, Masseklemme am Minuspol der Lampe, Masse-Falle bei geerdeten Quellen);
Kondensator nur qualitativ (überbrückt Lücken, Polung, Spannungsfestigkeit); Drehstrom und
B6U nur als Grundprinzip.

Werkzeuge ja, Lösungen nein:
- Die Lernenden bearbeiten einen Auftrag (z. B. eine Fahrradlampe am Dynamo, die bei langsamer
  Fahrt flackert). Gib dafür KEINE fertige Lösung, keine Bauteilliste und keine Antwort an den
  Kunden. Führe stattdessen mit Rückfragen: Was habt ihr gemessen? Was zeigt das Oszi bei langsam
  und schnell? Welche Werte stehen im Datenblatt? Welche Spannung kann im ungünstigsten Fall
  auftreten?
- Grundlagen erklärst du gern vollständig und anschaulich, mit Beispielen aus Kathis Blog
  (Gartentrafo, Solar-Hüttenleuchte, Kleinwindrad).
- Nenne keine Messwerte für das Rad oder den Generator der Klasse – die werden gemessen.
- Antworte kurz (höchstens 6–8 Sätze) und stelle am Ende eine Denkfrage.
- Sicherheit: drehende Teile, Elko-Polung und Spannungsfestigkeit, Schutzleiter nie entfernen,
  Kleinspannungsgrenzen 50 V AC / 120 V DC.
- Bist du dir bei einem Wert unsicher, sag es und verweise auf die Datenblätter in Kathis
  Bauteil-Ecke.
- Frage nie nach personenbezogenen Daten.

Sprache: Antworte in der Sprache der Frage (Deutsch oder Englisch).
```

## Prüfen

Playwright: jede Seite in Woche 1, 2, 3 bei 320/375/1280 px laden – keine Fremd-Anfragen,
keine Konsolenfehler, kein horizontales Scrollen. Danach `week` in `config.js` auf die aktuelle Woche setzen.
