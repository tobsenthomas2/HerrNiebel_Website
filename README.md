# ⚡ Lernlandschaft Elektrotechnik

Digitales Dashboard und Startseite für Unterrichtsmaterialien und Web-Simulationen.
Schüler navigieren über **Bildungsgang → Jahrgang → Fach → Thema** zu den Lerninhalten.

🔗 **Live-Seite:** https://herrniebel.de

---

## ✨ Funktionen

- **Drill-down-Navigation** über beliebig viele Ebenen (Bildungsgang → Jahrgang → Fach → Thema)
- **Breadcrumbs & Zurück-Button** zum Springen zwischen den Ebenen
- **Direktlinks** auf jede Ebene, z. B. `…/#/eat/jg11/steuerungstechnik` (ideal für Moodle, IServ oder QR-Codes)
- **Suchfunktion** über alle Themen hinweg
- **Kachel-Design** mit Farbakzenten, Icons, Tags und „Neu“-Badges
- **Responsiv** für Smartphone, Tablet und Desktop · **Dark Mode** automatisch
- **Zentrale Konfiguration:** Neue Inhalte werden nur in `config.json` eingetragen
- **Automatische Pfade:** Die URL eines Themas wird aus den Ordnernamen gebildet

---

## 📁 Aufbau des Repositories

```
├── index.html          # Dashboard (nicht bearbeiten)
├── style.css           # Design
├── app.js              # Logik: Routing, Rendern, Suche
├── config.json         # ← Hier wird die gesamte Struktur gepflegt
│
├── ET10/                          # Bildungsgang (ohne Jahrgangsebene)
│   ├── elektrotechnik/
│   └── digitaltechnik/
│       └── Vorwärtszähler/
│           ├── index.html         # Einstiegsseite des Themas
│           ├── script.js          # beliebige weitere Dateien …
│           └── img/
│
├── EAT/                           # Bildungsgang
│   ├── jahrgang-11/               # Jahrgang
│   │   ├── steuerungstechnik/     # Fach
│   │   │   ├── wendeschaltung/    # Thema
│   │   │   │   └── index.html
│   │   │   └── sps-grundlagen/
│   │   │       └── index.html
│   │   └── mikrocontroller/
│   ├── jahrgang-12/
│   └── jahrgang-13/
│
├── EGS/
└── EEG/
```

Jedes Thema ist ein **eigener Ordner** mit einer `index.html` als Einstieg. Alle weiteren Dateien
(CSS, JS, Bilder, PDFs) liegen einfach mit im Ordner.

Der Pfad zu einem Thema entsteht automatisch aus den `folder`-Einträgen aller Ebenen:

```
EAT/jahrgang-11/steuerungstechnik/sps-grundlagen/index.html
```

Fehlt ein `folder`-Eintrag, wird die `id` als Ordnername verwendet.

---

## 🧾 Aufbau der `config.json`

Die Struktur ist ein Baum. **Jeder Eintrag mit `children` ist eine Ebene, jeder Eintrag ohne
`children` ist ein Thema** und verlinkt auf seine `index.html`.

```json
{
  "title": "Lernlandschaft Elektrotechnik",
  "subtitle": "Untertitel auf der Startseite",
  "footer": "Text in der Fußzeile",
  "levelNames": [
    ["Bildungsgang", "Bildungsgänge"],
    ["Jahrgang", "Jahrgänge"],
    ["Fach", "Fächer"],
    ["Thema", "Themen"]
  ],
  "children": [
    {
      "id": "eat",
      "title": "EAT",
      "description": "Elektroniker/in für Automatisierungstechnik",
      "icon": "🏭",
      "color": "#d97706",
      "folder": "EAT",
      "children": [
        {
          "id": "jg11",
          "title": "Jahrgang 11",
          "icon": "📗",
          "folder": "jahrgang-11",
          "children": [
            {
              "id": "steuerungstechnik",
              "title": "Steuerungstechnik",
              "icon": "🎛️",
              "children": [
                {
                  "id": "sps-grundlagen",
                  "title": "SPS-Grundlagen",
                  "description": "Vom Schaltplan zum SPS-Programm.",
                  "icon": "🖥️",
                  "tags": ["Skript", "Übung"],
                  "badge": "Neu"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### Felder

| Feld | Gilt für | Pflicht | Bedeutung |
|---|---|---|---|
| `id` | alle | ✅ | Kurzname ohne Leerzeichen/Umlaute, wird Teil der URL (`#/eat/jg11`) |
| `title` | alle | ✅ | Überschrift der Kachel |
| `children` | Ebenen | – | Liste der Unterelemente. **Fehlt es, ist der Eintrag ein Thema.** `[]` = noch leere Ebene |
| `folder` | alle | – | Tatsächlicher Ordnername, falls abweichend von `id` |
| `url` | Themen | – | Überschreibt den automatischen Pfad; `https://…` öffnet in neuem Tab |
| `description` | alle | – | Beschreibungstext auf der Kachel |
| `icon` | alle | – | Ein einzelnes Emoji |
| `color` | alle | – | Farbakzent als Hex-Code (`#rrggbb`); wird an Unterelemente vererbt |
| `childLabel` | Ebenen | – | `["Fach", "Fächer"]` – Bezeichnung der Unterelemente, wenn sie von `levelNames` abweicht |
| `tags` | Themen | – | Kleine Labels, z. B. `["Simulation", "Arbeitsblatt"]` |
| `badge` | Themen | – | Auffälliger Hinweis, z. B. `"Neu"` |

💡 `levelNames` liefert die Standard-Bezeichnungen für die Zähler auf den Kacheln („3 Fächer“).
Hat ein Bildungsgang keine Jahrgangsebene (wie ET10), gibst du ihm `"childLabel": ["Fach", "Fächer"]`.

---

## ➕ Neues Thema hinzufügen

1. Ordner mit der Simulation hochladen, z. B.
   `EAT/jahrgang-11/mikrocontroller/spi-bus/index.html`

2. In `config.json` beim passenden Fach im `children`-Array einen Eintrag ergänzen:

   ```json
   {
     "id": "spi-bus",
     "title": "SPI-Bus",
     "description": "MOSI, MISO, SCK, CS – Vergleich mit I²C.",
     "icon": "🔌",
     "tags": ["Simulation"],
     "badge": "Neu"
   }
   ```

   Heißt der Ordner anders als die `id`, zusätzlich `"folder": "SPI-Bus"` angeben.
   **Kein `children` angeben** – sonst wird das Thema als Ebene behandelt.

   ⚠️ Auf das **Komma** zwischen den Einträgen achten – der häufigste Fehler!

3. Committen. Die Kachel erscheint sofort auf der Live-Seite.

**Neue Fächer, Jahrgänge oder Bildungsgänge** legst du genauso an – nur mit einem
`"children": []`-Array, das du dann nach und nach füllst.

### Hinweise zu Ordnernamen

- **Groß-/Kleinschreibung zählt** (GitHub Pages läuft auf Linux) – `EAT` ≠ `eat`.
- Umlaute funktionieren, sind aber in Links unschön (`Vorw%C3%A4rtsz%C3%A4hler`).
  Empfehlung: Ordner ohne Umlaute, der Kacheltitel darf sie natürlich haben.
- Keine Leerzeichen in Ordnernamen.
- Vor dem Commit die JSON kurz auf [jsonlint.com](https://jsonlint.com) prüfen.

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
- **Python:** im Repo-Ordner `python -m http.server 8000` → http://localhost:8000

Mobile Ansicht prüfen: `F12` → Gerätesymbolleiste (`Strg + Umschalt + M`) → Gerät auswählen.

---

## 🛠️ Technik

- Reines HTML, CSS und JavaScript – **keine Abhängigkeiten, kein Build-Schritt**
- Beliebig tiefer Baum, Hash-Routing (`#/beruf/jahrgang/fach`) – Browser-Zurück und Lesezeichen funktionieren
- Inhalte werden per `textContent` eingefügt (kein Einschleusen von HTML aus der Config möglich)
- Cache-Busting beim Laden der `config.json`, damit Änderungen sofort sichtbar sind

---

## 📄 Lizenz

Code: [MIT-Lizenz](LICENSE) – frei verwendbar und anpassbar.
Unterrichtsmaterialien in den Unterordnern: © <dein-name>, sofern nicht anders angegeben.
