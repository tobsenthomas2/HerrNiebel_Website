# ⚡ Lernlandschaft Elektrotechnik

Digitales Dashboard und Startseite für Unterrichtsmaterialien und Web-Simulationen.
Schüler navigieren von hier aus über **Jahrgang → Fach → Thema** zu den einzelnen Lerninhalten.

🔗 **Live-Seite:** https://herrniebel.de

---

## ✨ Funktionen

- **Drill-down-Navigation** in drei Ebenen (Jahrgang → Fach → Thema)
- **Breadcrumbs & Zurück-Button** zum Springen zwischen den Ebenen
- **Direktlinks** auf jede Ebene, z. B. `…/#/jg11/steuerungstechnik` (ideal für Moodle, IServ oder QR-Codes)
- **Suchfunktion** über alle Themen hinweg
- **Kachel-Design** mit Farbakzenten, Icons, Tags und „Neu“-Badges
- **Responsiv** für Smartphone, Tablet und Desktop
- **Dark Mode** automatisch nach Systemeinstellung
- **Zentrale Konfiguration:** Neue Inhalte werden nur in `config.json` eingetragen – kein HTML-Code anfassen

---

## 📁 Aufbau des Repositories

```
├── index.html          # Dashboard (nicht bearbeiten)
├── style.css           # Design
├── app.js              # Logik: Routing, Rendern, Suche
├── config.json         # ← Hier werden Jahrgänge, Fächer und Themen gepflegt
│
├── jahrgang-10/
│   ├── elektrotechnik/
│   │   ├── ohmsches-gesetz/index.html
│   │   └── …
│   └── digitaltechnik/
│       └── …
├── jahrgang-11/
│   └── …
└── jahrgang-12/
    └── …
```

Jedes Thema liegt in einem eigenen Ordner mit einer `index.html`. Die Ordnernamen sind frei wählbar,
müssen aber mit dem `url`-Eintrag in der `config.json` übereinstimmen
(Groß-/Kleinschreibung beachten, keine Leerzeichen oder Umlaute).

---

## ➕ Neues Thema hinzufügen

1. Ordner mit der Simulation/dem Material hochladen, z. B.
   `jahrgang-11/mikrocontroller/spi-bus/index.html`

2. In `config.json` beim passenden Fach im `topics`-Array einen Eintrag ergänzen:

   ```json
   {
     "id": "spi-bus",
     "title": "SPI-Bus",
     "description": "MOSI, MISO, SCK, CS – Vergleich mit I²C.",
     "icon": "🔌",
     "url": "jahrgang-11/mikrocontroller/spi-bus/index.html",
     "tags": ["Simulation"],
     "badge": "Neu"
   }
   ```

   ⚠️ Auf das **Komma** zwischen den Einträgen achten – der häufigste Fehler!

3. Committen. Die Kachel erscheint sofort auf der Live-Seite.

Neue **Fächer** oder **Jahrgänge** werden genauso angelegt: ein weiteres Objekt im
`subjects`- bzw. `levels`-Array der `config.json`.

---

## 🧾 Aufbau der `config.json`

```json
{
  "title": "Lernlandschaft Elektrotechnik",
  "subtitle": "Untertitel auf der Startseite",
  "footer": "Text in der Fußzeile",
  "levels": [
    {
      "id": "jg10",
      "title": "Jahrgang 10",
      "description": "…",
      "icon": "📗",
      "color": "#2563eb",
      "subjects": [
        {
          "id": "digitaltechnik",
          "title": "Digitaltechnik",
          "description": "…",
          "icon": "🔢",
          "color": "#7c3aed",
          "topics": [
            {
              "id": "logikgatter",
              "title": "Logikgatter",
              "description": "…",
              "icon": "🧩",
              "url": "jahrgang-10/digitaltechnik/logikgatter/index.html",
              "tags": ["Simulation", "Übung"],
              "badge": "Neu"
            }
          ]
        }
      ]
    }
  ]
}
```

| Feld | Ebene | Pflicht | Bedeutung |
|---|---|---|---|
| `id` | alle | ✅ | Kurzname ohne Leerzeichen, wird Teil der URL |
| `title` | alle | ✅ | Überschrift der Kachel |
| `url` | Thema | ✅ | Relativer Pfad **oder** `https://…` (öffnet in neuem Tab) |
| `description` | alle | – | Beschreibungstext auf der Kachel |
| `icon` | alle | – | Ein einzelnes Emoji |
| `color` | Jahrgang, Fach | – | Farbakzent als Hex-Code (`#rrggbb`); Fach erbt sonst vom Jahrgang |
| `tags` | Thema | – | Kleine Labels, z. B. `["Simulation", "Arbeitsblatt"]` |
| `badge` | Thema | – | Auffälliger Hinweis, z. B. `"Neu"` |

💡 Vor dem Commit die JSON kurz auf [jsonlint.com](https://jsonlint.com) prüfen.
Bei einem Syntaxfehler zeigt das Dashboard eine verständliche Fehlermeldung an.

---

## 🚀 GitHub Pages aktivieren (einmalig)

1. Repository → **Settings** → **Pages**
2. *Source:* „Deploy from a branch“ · *Branch:* `main` · *Folder:* `/ (root)` → **Save**
3. Nach 1–2 Minuten ist die Seite unter `https://<dein-name>.github.io/<dein-repo>/` erreichbar.

---

## 💻 Lokal testen

Die Seite lädt `config.json` per `fetch()`. Das funktioniert **nicht**, wenn die `index.html`
per Doppelklick (`file://`) geöffnet wird. Stattdessen einen lokalen Webserver verwenden:

- **VS Code:** Erweiterung „Live Server“ → Rechtsklick auf `index.html` → *Open with Live Server*
- **Python:** im Repo-Ordner `python -m http.server 8000` ausführen → http://localhost:8000

Mobile Ansicht prüfen: `F12` → Gerätesymbolleiste (`Strg + Umschalt + M`) → Gerät auswählen.

---

## 🛠️ Technik

- Reines HTML, CSS und JavaScript – **keine Abhängigkeiten, kein Build-Schritt**
- Hash-Routing (`#/jahrgang/fach`), dadurch funktionieren Browser-Zurück und Lesezeichen
- Inhalte werden per `textContent` eingefügt (kein Einschleusen von HTML aus der Config möglich)
- Cache-Busting beim Laden der `config.json`, damit Änderungen sofort sichtbar sind

---

## 📄 Lizenz

Code: [MIT-Lizenz](LICENSE) – frei verwendbar und anpassbar.
Unterrichtsmaterialien in den Unterordnern: © <dein-name>, sofern nicht anders angegeben.
