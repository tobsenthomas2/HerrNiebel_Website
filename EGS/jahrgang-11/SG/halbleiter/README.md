# LUMIATECH – Halbleiter-Website

Firmenauftritt der fiktiven LUMIATECH Semiconductor GmbH zu Dioden und LEDs
(Fach SG, Jahrgang 11, EGS). Reines HTML/CSS/JS, keine externen Abhängigkeiten,
funktioniert auch offline und per Doppelklick auf `index.html`.

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: umschaltbare LED, Produktlinien, Praxisfälle Signalsäule und Verpolschutz |
| `technologie.html` | Leiter/Halbleiter/Nichtleiter, Dotierung, PN-Übergang |
| `dioden.html` | BAY 44/45/46: Aufbau, Schaltzeichen, Polung, Kennlinie, Kenndaten, Datenblatt |
| `dioden-applikation.html` | Verpolschutz, Diode auswählen, Diodenschaltungen berechnen, Diode als Widerstand |
| `leds.html` | L-7113: Vorteile, Aufbau, Lichtentstehung, Farben/Werkstoffe, Kennlinien, Kenndaten, Datenblätter |
| `led-applikation.html` | Vorwiderstand, Arbeitspunkt grafisch, gemeinsamer Vorwiderstand, Signalsäulen-Konfigurator, Verpolung, Energie |
| `unternehmen.html` | Geschichte, Fertigung, Qualität, Ausbildung |
| `downloads.html` | alle Datenblätter (PDF) und Applikationsschriften |

## Ordner

```
assets/css/site.css        Design für alle Seiten (Farben, Schrift, Bausteine)
assets/css/home.css        nur Startseite
assets/css/products.css    Produkt- und Applikationsseiten
assets/js/config.js        Einstellungen (siehe unten)
assets/js/site.js          Kopfzeile, Navigation, Fußzeile, Inhaltsverzeichnis, Helfer
assets/js/physics.js       Bauteilmodelle (Kennlinien von BAY 44 und den drei LEDs)
assets/js/plot.js          Diagramm-Baukasten (SVG)
assets/js/symbols.js      Schaltzeichen (DIN EN 60617) und Betriebsmittelkennzeichnung (DIN EN 81346-2)
assets/js/illustrations.js Produktzeichnungen: LED, Diode, Signalsäule
assets/js/sim-*.js         je eine Simulation
assets/fonts/              Schriften lokal (Archivo, griechische Zeichen aus IBM Plex Sans)
datenblaetter/             PDF-Datenblätter
```

## Simulationen

Eine Simulation wird mit einem Platzhalter eingebunden und das passende Skript im `<head>` geladen:

```html
<div data-sim="arbeitspunkt" data-title="Arbeitspunkt-Werkzeug" data-hint="Kurze Anleitung"></div>
```

| `data-sim` | Skript | Seite |
|---|---|---|
| `ladungstraeger` | `sim-leitfaehigkeit.js` | technologie |
| `dotierung` | `sim-dotierung.js` | technologie |
| `pn` (`data-mode="diode"` oder `"led"`) | `sim-pn.js` | technologie, leds |
| `polung` | `sim-polung.js` | dioden |
| `kennlinie` | `sim-kennlinie.js` | dioden |
| `verpolschutz` | `sim-verpolschutz.js` | dioden-applikation |
| `schaltung` | `sim-schaltung.js` | dioden-applikation |
| `spektrum` | `sim-spektrum.js` | leds |
| `vergleich` | `sim-vergleich.js` | leds |
| `arbeitspunkt` | `sim-arbeitspunkt.js` | led-applikation |
| `signalsaeule` | `sim-signalsaeule.js` | led-applikation |

## Einstellung: Messwerte anzeigen

In `assets/js/config.js`:

```js
window.LT_CONFIG = { messwerteAnzeigen: false };
```

`false` (Standard): Arbeitspunkt, Signalsäule, Verpolschutz und Schaltungs-Check zeigen
Ergebnisse nur grafisch bzw. qualitativ. `true`: zusätzlich alle berechneten Zahlenwerte.

## Neue Seite hinzufügen

1. Vorhandene Seite kopieren (z. B. `leds.html`) und Inhalt ersetzen.
2. In `assets/js/site.js` im Array `NAV` eintragen – Kopf- und Fußzeile passen sich überall an.
3. Abschnitte als `<section id="…">` mit `<h2>` anlegen; das Inhaltsverzeichnis entsteht automatisch.

## Schaltpläne und Kennzeichnung

Alle Schaltzeichen kommen aus `assets/js/symbols.js` (`LT.sym.diode`, `LT.sym.source`, …).
Kennbuchstaben: -G Quelle, -R Widerstand und Diode, -P LED/Meldeleuchte, -M Motor, -F Sicherung.
Die Kennzeichnung steht links neben senkrechten und oberhalb von waagerechten Bauteilen.
