# LUMIATECH – Halbleiter-Website

Firmenauftritt der fiktiven LUMIATECH Semiconductor GmbH zu Dioden und LEDs
(Fach SG, Jahrgang 11, EGS). Die Website wächst mit dem Unterricht: Woche 1 nur Dioden,
dann LEDs, später Transistoren (Einstellung `woche` in `config.js`). Reines HTML/CSS/JS, keine externen Abhängigkeiten,
funktioniert auch offline und per Doppelklick auf `index.html`.

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: umschaltbare Diode (Woche 1) bzw. LED, Produktlinien, Praxisfälle Signalsäule und Verpolschutz |
| `technologie.html` | Leiter/Halbleiter/Nichtleiter, Dotierung, PN-Übergang |
| `dioden.html` | BAY 44/45/46: Aufbau, Schaltzeichen, Polung, Kennlinie, Kenndaten, Datenblatt |
| `dioden-applikation.html` | Verpolschutz, Diode auswählen, Diodenschaltungen berechnen, Diode als Widerstand |
| `leds.html` | L-7113: Vorteile, Aufbau, Lichtentstehung, Farben/Werkstoffe, Kennlinien, Kenndaten, Datenblätter |
| `led-applikation.html` | Vorwiderstand, Arbeitspunkt grafisch, gemeinsamer Vorwiderstand, Signalsäulen-Konfigurator, Verpolung, Energie |
| `unternehmen.html` | Geschichte, Fertigung, Qualität, Ausbildung |
| `standardtypen.html` | Standardtypen 1N4001 … 1N4007, Schottky 1N5817 … 1N5819, 3-W-Power-LED L-3W-WW (immer sichtbar; Datenblätter EN, verlinkt aus dem EBT-Blog „Watt auf Achse“) |
| `downloads.html` | alle Datenblätter (PDF) und Applikationsschriften |

## Ordner

```
assets/css/site.css        Design für alle Seiten (Farben, Schrift, Bausteine)
assets/css/home.css        nur Startseite
assets/css/products.css    Produkt- und Applikationsseiten
assets/js/config.js        Einstellungen (siehe unten)
assets/js/lang.js          Sprache: Englisch ist Standard, Deutsch über ?lang=de (ohne defer als erstes Skript laden!)
assets/js/woche.js         Unterrichtswoche: blendet Inhalte je nach Woche ein/aus (ohne defer laden!)
assets/js/site.js          Kopfzeile, Navigation, Fußzeile, Inhaltsverzeichnis, Helfer
assets/js/physics.js       Bauteilmodelle (Kennlinien von BAY 44 und den drei LEDs)
assets/js/plot.js          Diagramm-Baukasten (SVG)
assets/js/symbols.js      Schaltzeichen (DIN EN 60617) und Betriebsmittelkennzeichnung (DIN EN 81346-2)
assets/js/illustrations.js Produktzeichnungen: LED, Diode, Signalsäule
assets/js/sim-*.js         je eine Simulation
assets/js/vendor/qrcode.js QR-Code-Erzeugung für den KI-Support (qrcode-generator, MIT-Lizenz, K. Arase)
assets/img/logo/           Logo als SVG und PNG (auch auf downloads.html zum Herunterladen)
assets/fonts/              Schriften lokal (Archivo, griechische Zeichen aus IBM Plex Sans)
applikationen/             AN-G03 Prüfprotokoll-Vorlage (PDF, leer) – Watt auf Achse/EBT 11: daraus entsteht das vorausgefüllte Prüfprotokoll
datenblaetter/             PDF-Datenblätter (die Standardtypen verlinkt der EBT-Blog „Watt auf Achse“ direkt – Dateinamen nicht ändern)
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

## Sprache: Englisch als Standard, Deutsch auf Knopfdruck

Die Website erscheint auf Englisch. Beim ersten Aufruf (Adresse ohne `?lang=`) schwebt am rechten
Rand die Karte „Übersetzen?“. Nach dem Schließen (x) bleibt dort der Reiter „Übersetzen?“ über dem
KI-Chat-Reiter; in der deutschen Fassung heißt er „English?“. Die Wahl steht nur in der Adresse
(`?lang=de` bzw. `?lang=en`) und wandert über die internen Links mit – es wird nichts gespeichert
(keine Cookies, kein localStorage). Direktlink zur deutschen Fassung: `index.html?lang=de`.

Beide Sprachen stehen in derselben Datei:

```html
<p><span data-lang="en">Forward voltage</span><span data-lang="de">Durchlassspannung</span></p>
<nav aria-label="Breadcrumb" data-de-aria-label="Brotkrumen">   <!-- auch alt, data-title, data-hint, data-toc-label -->
<html lang="en" data-title-de="Deutscher Seitentitel">
```

```js
T("Forward direction", "Durchlassrichtung")   // in Skripten: var T = LT.t;
LT.num(1.95, 2)                               // "1.95" (en) bzw. "1,95" (de)
```

Formelzeichen (U_F, U_S, I_F …) und Betriebsmittelkennzeichen (-R1, -P1 …) sind in beiden Sprachen
gleich. Feste Begriffe: forward voltage U_F, threshold voltage U_S, reverse voltage U_R,
series resistor, depletion layer, operating point, load line, signal tower.
Die PDF-Datenblätter sind deutsch.

## Einstellung: Unterrichtswoche (die Website wächst mit)

Zuerst gibt es nur Dioden, dann kommen LEDs dazu, später weitere Halbleiter wie Transistoren.
In `assets/js/config.js`:

```js
woche: 1,                              // vor jeder Stunde die aktuelle Woche eintragen
themen: { leds: 2, transistoren: 3 },  // ab welcher Woche erscheint welches Thema?
```

| Woche (Standard) | sichtbar |
|---|---|
| 1 | Technologie, Dioden, Dioden-Applikation, Unternehmen, Downloads (nur Dioden) – Startseite mit Dioden-Hero |
| 2 | zusätzlich LEDs: Produktseite, LED-Applikation, Signalsäule, LED-Datenblätter, LED-Hero |
| 3 | vorbereitet für Transistoren (Seiten folgen) |

Braucht ein Thema länger, nur die Zahl unter `themen` erhöhen. Einen früheren Stand zeigt der
Link-Zusatz `?w=1` (z. B. für eine Parallelklasse); interne Links nehmen ihn mit. Mehr als in
`config.js` eingestellt lässt sich per Link nicht freischalten.

**Auszeichnung in den Seiten** (Logik in `woche.js`, ohne `defer` direkt nach `config.js` laden):

| Markierung | Wirkung |
|---|---|
| `data-thema="leds"` | erst sichtbar, wenn das Thema freigeschaltet ist |
| `data-ohne="leds"` | nur sichtbar, solange das Thema noch gesperrt ist (Ersatztext, z. B. „Dioden“ statt „Dioden und LEDs“) |
| `<html data-seite="leds">` | ganze Seite gesperrt → Weiterleitung zur Startseite |
| `<html data-titel-ohne-leds="…">` | Seitentitel, solange das Thema gesperrt ist |
| `thema: "leds"` im `NAV`-Array (`site.js`) | Menüeintrag erst ab der Freischaltung |
| `LT.frei("leds")` in JavaScript | Abfrage, z. B. für Texte im Support-Fenster und in der Fußzeile |

**Neues Thema (z. B. Transistoren):** Seiten mit `<html data-seite="transistoren">` anlegen, im `NAV`
mit `thema: "transistoren"` eintragen, Hinweise auf anderen Seiten mit `data-thema="transistoren"`
markieren. Ein neuer Schlüssel unter `themen` funktioniert ohne weitere Programmierung.

## Einstellung: Messwerte anzeigen

In `assets/js/config.js`:

```js
window.LT_CONFIG = { messwerteAnzeigen: false };
```

`false` (Standard): Arbeitspunkt, Signalsäule, Verpolschutz und Schaltungs-Check zeigen
Ergebnisse nur grafisch bzw. qualitativ. `true`: zusätzlich alle berechneten Zahlenwerte.

## Einstellung: KI-Support-Chat

Auf jeder Seite gibt es rechts einen Reiter „Fragen? KI-Chat“ (auf dem Handy unten rechts „Fragen?“).
Er öffnet ein Fenster mit QR-Code, Link und Kopier-Knopf. Beim Aufruf der Startseite
(`index.html`, auch mit `?lang=en` oder `?lang=de`) klappt zusätzlich kurz ein Hinweis neben dem
Reiter auf. Auf den anderen Seiten, beim Zurückkehren zur Startseite und nach dem Sprachwechsel
bleibt es beim Reiter (erkannt über die Herkunftsseite, ohne Speicherung).

In `assets/js/config.js`:

```js
kiChat: {
  url: "https://app.ais-chat.schule/…",   // neuer Link = neuer QR-Code, "" blendet alles aus
  hinweisBeimLaden: true,                 // false = nur der Reiter, kein Hinweis
  hinweisSekunden: 10                     // 0 = Hinweis bleibt, bis er geschlossen wird
}
```

Der QR-Code wird im Browser aus dem Link erzeugt, es muss keine Bilddatei ausgetauscht werden.

## Neue Seite hinzufügen

1. Vorhandene Seite kopieren (z. B. `leds.html`) und Inhalt ersetzen.
2. In `assets/js/site.js` im Array `NAV` eintragen – Kopf- und Fußzeile passen sich überall an.
   Gehört die Seite zu einem späteren Thema: `thema: "…"` dazuschreiben (siehe Unterrichtswoche).
3. Abschnitte als `<section id="…">` mit `<h2>` anlegen; das Inhaltsverzeichnis entsteht automatisch.

## Schaltpläne und Kennzeichnung

Alle Schaltzeichen kommen aus `assets/js/symbols.js` (`LT.sym.diode`, `LT.sym.source`, …).
Kennbuchstaben: -G Quelle, -R Widerstand und Diode, -P LED/Meldeleuchte, -M Motor, -F Sicherung.
Die Kennzeichnung steht links neben senkrechten und oberhalb von waagerechten Bauteilen.

## Revisionsnummer in der Fußzeile (für die Lehrkraft)

Hinter dem © steht unauffällig „Rev. 1.3“: erste Zahl = Woche, die die Seite gerade zeigt (auch mit `?w=`),
zweite Zahl = höchste Woche der Website (aus `woche` und `themen` in `config.js`).
Für Schüler wirkt es wie eine normale Revisionsnummer.
