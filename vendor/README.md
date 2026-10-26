# vendor – lokal eingebundene Schriften und Bibliotheken

Alle Schriften und Programmbibliotheken liegen hier, damit beim Aufruf der Website
**keine Verbindung zu Drittanbietern** (Google Fonts, CDNs) entsteht (DSGVO).
Die Dateien stammen unverändert aus den angegebenen npm-Paketen.

| Ordner / Datei | Paket (npm) | Lizenz |
|---|---|---|
| `fonts/inter.css` | @fontsource/inter 5.3.0 | SIL Open Font License 1.1 |
| `fonts/fira-code.css` | @fontsource/fira-code 5.3.0 | SIL Open Font License 1.1 |
| `fonts/montserrat.css` | @fontsource/montserrat 5.3.0 | SIL Open Font License 1.1 |
| `fonts/roboto.css` | @fontsource/roboto 5.3.0 | SIL Open Font License 1.1 |
| `fonts/roboto-mono.css` | @fontsource/roboto-mono 5.3.0 | Apache License 2.0 |
| `fonts/material-icons.css` | @fontsource/material-icons 5.3.0 | Apache License 2.0 |
| `fonts/google-sans.css` | @fontsource/google-sans 5.3.2 | SIL Open Font License 1.1 |
| `fonts/google-sans-flex.css` | @fontsource-variable/google-sans-flex 5.3.2 | SIL Open Font License 1.1 |
| `fonts/google-sans-code.css` | @fontsource-variable/google-sans-code 5.3.2 | SIL Open Font License 1.1 |
| `fontawesome-free-6.0.0/` | @fortawesome/fontawesome-free 6.0.0 | Icons CC BY 4.0, Fonts OFL 1.1, Code MIT |
| `three-0.128.0/`, `three-0.146.0/` | three | MIT |
| `katex-0.16.9/` | katex | MIT |
| `mathjs-12.4.0/` | mathjs | Apache License 2.0 |
| `mermaid-9.4.3/` | mermaid | MIT |
| `d3-7.9.0/` | d3 | ISC |
| `d3-sankey-0.12.3/` | d3-sankey | ISC |
| `animejs-3.2.2/` | animejs | MIT |
| `observablehq-plot-0.6.16/` | @observablehq/plot | ISC |
| `matter-js-0.19.0/` | matter-js | MIT |
| `html2canvas-1.4.1/` | html2canvas | MIT |

Die Lizenztexte liegen in den jeweiligen Ordnern (`LICENSE.txt`) bzw. in `fonts/LICENSE-*.txt`.

Tailwind CSS (MIT) wird nicht mehr über `cdn.tailwindcss.com` geladen. Für jede Seite bzw.
jeden Ordner liegt daneben eine fertig erzeugte `tailwind.css` (Tailwind 3.4.17).

## Neue Seiten

- Keine Schriften, Skripte oder Bilder von fremden Servern einbinden
  (`fonts.googleapis.com`, `cdn.tailwindcss.com`, `cdnjs`, `jsdelivr`, `unpkg`, `placehold.co` …).
  Stattdessen die Dateien hier aus `vendor/` verwenden, z. B.
  `<link rel="stylesheet" href="../../vendor/fonts/inter.css">`.
- Unten auf jeder Seite muss der Link zu Impressum und Datenschutz stehen
  (Zeile mit `class="hn-legal"` aus einer bestehenden Seite kopieren, Pfad `../` anpassen).
