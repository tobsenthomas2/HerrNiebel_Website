# Visionary Displays – I²C-Protokoll

Firmenauftritt der fiktiven Visionary Displays GmbH zum I²C-Bus (EGS, Jahrgang 12, Fertigungs- und Prüftechnik).
Aufgebaut nach dem Website-Guide (`/CLAUDE.md`): Englisch als Standard, Umschalter EN | DE, reines HTML/CSS/JS,
keine Fremdserver. Funktioniert auch per Doppelklick (Schriften kommen aus `/vendor/fonts`).

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Hero „End the cable chaos“, Was ist I²C?, Vergleich parallel/I²C, Kacheln zu allen Bereichen |
| `hardware.html` | Open-Drain, Pull-up-Widerstände (Schaltbild), Adresseinstellung mit Jumpern, Hex-Umrechnung |
| `protocol.html` | Flanken als Trigger, Protokollbild, Schritte START…STOP, Live-Oszilloskop |
| `simulator.html` | Signal-Simulator (Logic Analyzer) mit Adresse, R/W, ACK/NACK, Datenbyte, PNG-Export |
| `wiring.html` | Arduino-Verdrahtung (Bild) |
| `assistant.html` | Wissens-Chat-Bot (Link zu fobizz, offene Zugangs-Codes) |
| `order.html` | „Bestellung“: Übergang zur echten Hardware im Labor |
| `expert.html` | nur Zusatzwissen: Controller/Target, zweiter Weg der Hex-Umrechnung, goldene Regel, R/W-Bit im Detail, FAQ, Arduino-Code für zwei Displays |

## Ordner

```
assets/css/site.css              Design aller Seiten (Farben als :root-Variablen)
assets/js/site.js                Navigation (NAV-Array), Fußzeile, Symbole, Sprache EN/DE
assets/js/sim-oscilloscope.js    Live-Oszilloskop  → <div data-sim="oscilloscope">   (protocol.html)
assets/js/sim-logic-analyzer.js  Signal-Simulator  → <div data-sim="logic-analyzer"> (simulator.html)
assets/img/                      Bilder als WebP; *-en / *-de = Bild mit Beschriftung je Sprache
```

## Pflege

- **Neue Seite:** vorhandene Seite kopieren, Inhalt ersetzen, in `site.js` im `NAV`-Array eintragen.
- **Texte:** stehen paarweise in derselben Datei: `<p data-lang="en">…</p><p data-lang="de">…</p>`.
  Texte aus JavaScript laufen über `SITE.t({ en: "…", de: "…" })`.
- **Bilder mit Text:** je Sprache eine Datei, eingebunden mit `data-lang` und `loading="lazy"`.
  `protocol-full-de.webp` und `read-write-de.webp` gibt es nur auf Deutsch (Hinweis in der englischen Fassung).
- **Fachlich:** Die Basisseiten sprechen von Master/Slave (wie im Arbeitsblatt), die Experten-Seite führt
  Controller/Target ein. Nach einem NACK auf die Adresse zeigt der Simulator kein Datenbyte mehr, sondern direkt STOP.
