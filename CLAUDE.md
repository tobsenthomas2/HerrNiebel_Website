---
title: herrniebel.de – Website-Guide
aliases:
  - Website-Guide
  - herrniebel.de
  - Lernlandschaft Elektrotechnik
tags:
  - schule/website
  - herrniebel
  - prompt-kontext
version: 2
stand: 2026-11-07
---

# herrniebel.de – Website-Guide

> [!abstract] So verwendest du den Guide
> Prompt: **„Lies den Website-Guide und erstelle eine Website zu ‹Thema›.“** Material (Arbeitsblätter, Datenblätter, Lösungen) anhängen.
> Claude arbeitet dann den **Ablauf in Abschnitt 1** ab: Er stellt zuerst Fragen, baut dann, prüft selbst und zeigt das Ergebnis.
> Der Guide liegt in Obsidian, im Claude-Projekt „Schule Website ABs“ und als `CLAUDE.md` im Repo. Dort liest Claude ihn bei jeder Arbeit am Repo automatisch.

## Kurzregeln

1. **Echter Firmenauftritt:** Jede Lernwebsite ist der Auftritt einer **fiktiven Firma**, die ihre Technik vermarktet. Dabei erklärt sie die Inhalte, die Schüler laut Lernfeld können müssen, mit **Simulationen und interaktiven Elementen**.
2. **Sprache:** Standard **Englisch**. Oben rechts ein Umschalter **EN | DE** für die deutsche Fassung, ohne Google und ohne Speichern im Browser.
3. **Viele kleine Dateien:** **Mehrere verknüpfte HTML-Dateien** mit gemeinsamen `assets/` statt einer großen Datei. Jede Simulation steht in einer eigenen JS-Datei.
4. **Keine Fremdserver:** Kein Google Fonts, keine CDNs, keine Cookies und kein localStorage. Alles liegt lokal (`/vendor`, `assets/`).
5. **Rechtslinks:** Jede Seite verlinkt **Impressum und Datenschutz**. Eine neue fiktive Firma kommt ins Impressum.
6. **Normen:** Schaltzeichen nach **DIN EN 60617**, Kennzeichen nach **DIN EN 81346-2** mit „-“ davor, links bzw. oberhalb des Bauteils.
7. **Didaktik:** **Werkzeuge ja, Lösungen nein.** Inhalte kommen aus Tobias' Arbeitsblättern, Fachbegriffe sind präzise.
8. **Arbeitsweise:** Vor dem Bauen fragen, mit Tobias auf Deutsch sprechen. **Push nur, wenn der Prompt es sagt.**

---

## 1 · Ablauf für eine neue Website

1. **Lesen:** diesen Guide, das Repo (`git pull`), die Referenzbeispiele (Abschnitt 9) und das mitgeschickte Material.
2. **Fragen stellen**, gesammelt in **einer** Nachricht, bevor gebaut wird:
   - Wohin? Bildungsgang, Jahrgang, Fach, Ordnername
   - Lernziele und Material: Welche Arbeitsblätter, Datenblätter und Lösungen gibt es? Was müssen die Schüler können?
   - Umfang: Wie viele Seiten? Welche Simulationen wünscht Tobias?
   - Sollen Lösungen oder Zahlenwerte zuschaltbar sein? Braucht es eine Experten-Vertiefung zur Differenzierung?
   - Soll ein KI-Chat-Link eingebunden werden? Gibt es eine Lernsituation (Kundenauftrag, Bestellung)?
3. **Seitenplan vorlegen**, zusammen mit den Fragen:
   - Firmenidee: Name, Branche, Claim und Produktlinie (Claude erfindet sie)
   - Sitemap mit einem Satz Inhalt je Seite
   - geplante Simulationen
4. **Bauen** nach den Abschnitten 2–6.
5. **Einbinden** (Abschnitt 7):
   - Kachel in `config.json`
   - Firma ins Impressum
   - neue externe Links in die Datenschutzerklärung
6. **Prüfen** nach der Checkliste in Abschnitt 10.
7. **Zeigen:** Ergebnis kurz zusammenfassen. **Committen und pushen nur auf Ansage.** Nach einem Push den Deploy abwarten (GitHub Actions, ca. 1 min) und den Live-Link nennen.

## 2 · Konzept: Lernwebsite als Firmenauftritt

**Ziel:** Die Website sieht aus wie die echte Seite eines Technikherstellers, der seine Produkte und Technologie bewirbt und sich damit profiliert. Die Marketing-Geschichte ist der Aufhänger, darunter steckt der Unterrichtsstoff.

**Die Firma** erfindet Claude jedes Mal selbst, passend zum Thema:
- **Name, Branche, Claim, Standort** (Standort fiktiv)
- **Logo:** eigenes SVG. Die Bildmarke entsteht aus Schaltzeichen oder Bauteilen des Themas, z. B. Diode + LED + Transistor bei LUMIATECH.
- **Farben und Schrift**
- **Produkte** mit Typbezeichnungen und Kenndaten
- **Firmengeschichte, Fertigung, Qualität, Ausbildung**

> [!warning] Keine echten Firmen
> Keine echten Firmennamen, Marken, Logos, Personen oder Adressen. Die neue Firma wird in die Liste der fiktiven Firmen im Impressum eingetragen.

**Typische Seiten**, je nach Thema ausgewählt:

| Seite | Inhalt |
|---|---|
| Start | Hero mit Claim, Produktlinien, Vorteile, Praxisfälle, erste Mini-Interaktion |
| Technologie | Grundlagen, z. B. Halbleiter, Protokoll, Wirkprinzip |
| Produktseiten | Aufbau, Schaltzeichen, Kennlinien, Kenndaten, Datenblatt-Download |
| Applikation | Berechnen, Dimensionieren, Fehler vermeiden, mit Simulation |
| Unternehmen | Geschichte, Fertigung, Qualität, Ausbildung |
| Downloads | Datenblätter (eigene PDFs), Applikationsschriften, Logo |
| Support | KI-Chat-Reiter mit QR-Code (optional) |
| Lernsituation | z. B. „Bestellung“ oder Kundenauftrag: Übergang ins Labor (optional) |
| Experten-Vertiefung | zusätzliche Themen zur Differenzierung, **keine Kopie** der Basisseite (optional) |

**Didaktik:**
- Jeder Abschnitt beantwortet eine Frage aus dem Arbeitsblatt bzw. Lernfeld. Werbetexte bleiben kurz, die Erklärungen sind fachlich vollständig.
- Zu jedem Kernkonzept gehört mindestens ein **interaktives Element**: Simulation, Rechner, Konfigurator, Umschalter, Quiz oder Vergleich vorher/nachher.
- **Werkzeuge ja, Lösungen nein:**
  - Simulationen helfen beim Lösen, nennen aber nicht die Ergebnisse der Arbeitsblätter.
  - Zahlenwerte und Lösungshilfen sind per Lehrer-Einstellung bzw. Schalter zuschaltbar und standardmäßig aus.
- **Die Seite wirkt echt:** Im Inhalt stehen keine Hinweise wie „Lernseite“. Nur klein im Footer: „AI-generated content · for teaching purposes only“ plus Impressum, Datenschutz und `kontakt@herrniebel.de`.

## 3 · Aufbau: mehrere verknüpfte HTML-Dateien

**Warum:** Kleine Dateien lassen sich leichter warten. Bei Änderungen muss Claude nur eine Datei lesen und bearbeiten, das spart Tokens.

```
<thema>/
├── index.html              Startseite
├── technology.html         je Seite/Themenbereich eine HTML-Datei (englische Dateinamen)
├── products.html
├── application.html
├── downloads.html
├── assets/
│   ├── css/site.css        Design-Tokens + Bausteine für alle Seiten
│   ├── css/<seite>.css     nur wenn nötig
│   ├── js/site.js          Header, Navigation (NAV-Array), Footer, Sprachumschaltung, Helfer
│   ├── js/config.js        Lehrer-Einstellungen (z. B. messwerteAnzeigen, kiChat)
│   ├── js/physics.js       gemeinsame Rechenmodelle (falls nötig)
│   ├── js/sim-<name>.js    je Simulation eine Datei
│   ├── img/                eigene Bilder, Logo (SVG + PNG)
│   └── fonts/              Schriften als woff2
├── docs/                   eigene PDF-Datenblätter
└── README.md               Seiten, Simulationen, Einstellungen (Claude liest zuerst diese Datei)
```

- **Navigation zentral:** Header, Navigation und Footer erzeugt `site.js` aus dem `NAV`-Array. Eine neue Seite wird nur dort eingetragen.
- **Simulationen als Platzhalter:** `<div data-sim="kennlinie" data-title="…" data-hint="…"></div>` in der Seite, die Logik steht in `sim-kennlinie.js`.
- **Richtwerte:**
  - HTML ≤ ca. 600 Zeilen, Simulation ≤ ca. 400 Zeilen
  - keine Inline-Skripte über ca. 30 Zeilen
- **Keine Seitenkopien:** keine `index_en.html` oder `index_experten.html` als Kopie. Sprache per Umschalter, Vertiefung als eigene Seite oder einblendbare Abschnitte.
- **Bilder:** WebP oder JPG, ≤ 300 KB, höchstens 1600 px breit.
- **README.md** im Themenordner pflegen: Seitenliste, `data-sim`-Tabelle, Einstellungen.

## 4 · Sprache: Englisch Standard, Umschalter EN | DE

- Seiten stehen auf `<html lang="en">`. Die deutschen Texte stehen **direkt daneben in derselben Datei**, so bleibt jede Seite eine Datei.
- **Umschalter** oben rechts im Header, wie üblich als „EN | DE“. Die Wahl wird per `?lang=de` an interne Links weitergegeben.
  - Keine Cookies und kein localStorage, damit die Datenschutzerklärung stimmt.
- **Fachbegriffe:** in EN mit dem gängigen englischen Begriff (forward voltage, threshold voltage …), in DE wie im Arbeitsblatt bzw. Tabellenbuch.
  - **Formelzeichen und Kennzeichen bleiben in beiden Sprachen gleich** (U_F, I_F, -R1).
- Impressum und Datenschutz bleiben deutsch.

```html
<!-- im <head>, vor dem CSS: verhindert kurzes Aufblitzen der englischen Fassung -->
<html lang="en" data-title-en="Diodes – LUMIATECH" data-title-de="Dioden – LUMIATECH">
<script>if (/[?&]lang=de(&|$)/.test(location.search)) document.documentElement.lang = "de";</script>

<!-- im Header -->
<div class="lang-switch" role="group" aria-label="Language / Sprache">
  <button type="button" data-set-lang="en" aria-pressed="true">EN</button>
  <button type="button" data-set-lang="de" aria-pressed="false">DE</button>
</div>

<!-- Inhalte: Absätze paarweise, kurze Texte als span -->
<h2><span data-lang="en">How a diode works</span><span data-lang="de">So funktioniert eine Diode</span></h2>
<p data-lang="en">…</p>
<p data-lang="de">…</p>
```

```css
html[lang="en"] [data-lang="de"], html[lang="de"] [data-lang="en"] { display: none !important; }
```

```js
/* in site.js – Sprache EN (Standard) / DE, ohne Cookies und ohne Speicher im Browser */
(function () {
  var SITE = (window.SITE = window.SITE || {});
  var LANGS = ["en", "de"];
  function fromUrl() { var l = new URLSearchParams(location.search).get("lang"); return LANGS.indexOf(l) > -1 ? l : "en"; }
  SITE.lang = function () { return document.documentElement.lang === "de" ? "de" : "en"; };
  SITE.t = function (o) { return o[SITE.lang()] != null ? o[SITE.lang()] : o.en; };   // in Simulationen: SITE.t({ en: "Voltage", de: "Spannung" })
  SITE.setLang = function (l, updateUrl) {
    var html = document.documentElement;
    html.lang = l;
    var title = html.getAttribute("data-title-" + l); if (title) document.title = title;
    document.querySelectorAll("[data-set-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === l)); });
    if (updateUrl) { var u = new URL(location.href); if (l === "en") u.searchParams.delete("lang"); else u.searchParams.set("lang", l); history.replaceState(null, "", u.href); }
    document.dispatchEvent(new CustomEvent("langchange", { detail: l }));   // Simulationen zeichnen ihre Texte neu
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-lang]");
    if (b) { SITE.setLang(b.getAttribute("data-set-lang"), true); return; }
    var a = e.target.closest("a[href]");                                     // interne Links nehmen die Sprache mit
    if (!a || SITE.lang() === "en" || a.target === "_blank") return;
    var href = a.getAttribute("href"); if (/^(#|mailto:|tel:|https?:)/i.test(href)) return;
    var u = new URL(href, location.href);
    if (/\.html$/i.test(u.pathname) && !/(impressum|datenschutz)\.html$/i.test(u.pathname)) { u.searchParams.set("lang", "de"); a.href = u.href; }
  });
  SITE.setLang(fromUrl(), false);
})();
```

> [!tip] Simulationen
> Alle Texte, die per JavaScript entstehen, laufen über `SITE.t({ en, de })`. Beim Ereignis `langchange` zeichnet sich die Simulation neu.

## 5 · Technik- und Designstandards

- **Grundtechnik:** reines HTML, CSS und JavaScript, **kein Build-Schritt**.
  - Für neue Seiten **kein Tailwind**, sondern eigenes CSS mit Design-Tokens (`:root`-Variablen).
  - Die Seite soll auch per Doppelklick offline laufen.
- **Schriften:** woff2 lokal (`assets/fonts/` oder `/vendor/fonts/`). Für jede Firma ein eigener, stimmiger Look.
- **Bibliotheken:** möglichst keine. Diagramme und Schaltpläne als selbst gezeichnetes SVG. Falls doch nötig, nur aus `/vendor` (Abschnitt 8).
- **Simulationen:**
  - SVG in Containerbreite zeichnen, bei Größenänderung über `ResizeObserver` neu rendern.
  - Ziehen mit Pointer-Events und `touch-action: none`. Regler und Buttons auch per Tastatur bedienbar.
  - Tooltips am Rand begrenzen. Unter 560 px Breite Beschriftungen umsetzen oder als Liste unter das Diagramm.
- **Responsiv:**
  - Prüfbreiten 320, 375, 390, 1280 und 1440 px. Kein horizontales Scrollen.
  - Tabellen in `overflow-x: auto`-Wrappern.
  - Überschriften mit `overflow-wrap: break-word; hyphens: auto`.
- **Barrierefreiheit:** Buttons statt `div`, `aria-label` und `aria-pressed`, sichtbarer Fokus, `prefers-reduced-motion`.
- **Druck:** Schwebende Elemente (Support-Reiter, Rechtszeile) mit `@media print` ausblenden.
- **Bewährte Bausteine** (Vorlage in der Halbleiter-Website):
  - Lehrer-Einstellungen in `config.js`
  - KI-Support-Reiter mit QR-Code aus dem Link (`vendor/qrcode.js`)
  - Datenblatt- und Logo-Downloads
  - automatisches Inhaltsverzeichnis
  - Statusmeldungen OK/Warnung/Fehler in Simulationen

## 6 · Fachliche Standards

- **Schaltzeichen** nach **DIN EN 60617**:
  - Diode: Dreieck mit Querstrich
  - LED: Diode mit zwei Pfeilen nach außen
  - Quelle: **immer Kreis**
- **Kennzeichen** nach **DIN EN 81346-2** **mit „-“ davor**. Sie stehen **links** neben senkrechten und **oberhalb** waagerechter Bauteile.

| Kennzeichen | Betriebsmittel |
|---|---|
| `-G` | Spannungs-/Stromquelle |
| `-R` | Widerstand **und Diode** (wie im Arbeitsblatt) |
| `-P` | LED, Meldeleuchte, Messgerät |
| `-M` | Motor |
| `-F` | Sicherung |
| `-S` | Schalter, Taster |

- **Begriffe sauber trennen**, auch wenn umgangssprachlich vermischt. Beispiel:
  - Schleusenspannung U_S: Knick der Kennlinie, Tangente bis zur U-Achse
  - Durchlassspannung U_F: Spannung bei einem bestimmten I_F, steigt mit dem Strom
- **Werte immer mit Bedingungen** (Prüfstrom, Temperatur, Norm). **Vereinfachungen kennzeichnen**, z. B. „Näherung U_F ≈ U_S = 0,7 V“.
- **Normwerte** (z. B. DIN EN 62305-3 beim Blitzschutz) aus Tabellenbuch oder Norm übernehmen und die Quelle nennen.
- Bei Unklarheiten zu Normen oder Fachinhalt **nachfragen statt raten**.

## 7 · Einbinden in herrniebel.de

- **Ordner:** `<Bildungsgang>/jahrgang-XX/<fach>/<thema>/index.html`. Groß-/Kleinschreibung zählt, keine Leerzeichen, möglichst keine Umlaute. Heißt der Ordner anders als die `id`, `"folder": "…"` angeben.
- **Kachel:** Eintrag in `config.json` beim passenden Fach. Ein Thema hat **kein** `children`, sonst ist es eine Ebene. Kommas prüfen.

```json
{ "id": "spi-bus", "title": "SPI-Bus", "description": "MOSI, MISO, SCK, CS – mit Live-Simulator.",
  "icon": "🔌", "tags": ["Simulation"], "badge": "Neu" }
```

- **Rechtslinks:** Der eigene Footer enthält `Impressum · Datenschutz` mit relativem Pfad (je Ordnerebene ein `../`). Hat eine Seite keinen eigenen Footer, kommt diese Zeile vor `</body>`:

```html
<style>@media print{.hn-legal{display:none!important}}</style>
<p class="hn-legal" style="margin:0;padding:10px 12px;text-align:center;font:12px/1.4 system-ui,sans-serif;opacity:.8"><a href="../../../../impressum.html" style="color:inherit">Impressum</a> · <a href="../../../../datenschutz.html" style="color:inherit">Datenschutz</a></p>
```

- **Impressum** (`/impressum.html`): neue fiktive Firma in die Liste eintragen.
- **Datenschutz** (`/datenschutz.html`), Abschnitt 6: neue externe Dienste oder Links nennen (z. B. KI-Chat, Online-Simulator).
- **Lokal testen:**
  - Das Dashboard braucht einen Webserver (`python -m http.server 8000`), weil `config.json` per `fetch()` geladen wird.
  - Themenseiten laufen auch per Doppelklick.
- **Veröffentlichen:** Push auf `main` startet den GitHub-Actions-Deploy auf GitHub Pages (herrniebel.de).

## 8 · Recht und Datenschutz

> [!danger] Keine Daten an Dritte beim Seitenaufruf
> | ❌ nicht verwenden | ✅ stattdessen |
> |---|---|
> | Google Fonts | `/vendor/fonts/*.css` (Inter, Roboto, Montserrat, Fira Code, Roboto Mono, Google Sans, Material Icons) oder eigene woff2 |
> | `cdn.tailwindcss.com` | eigenes CSS |
> | cdnjs, jsDelivr, unpkg | `/vendor`: three.js 0.128/0.146, D3 7.9, d3-sankey, KaTeX, math.js, Mermaid, anime.js, Observable Plot, Matter.js, Font Awesome 6, html2canvas |
> | placehold.co, Fremdbilder | eigene SVG, Fotos oder Grafiken |
> | YouTube- oder Karten-iframes | normaler Link |
> | Analyse, Cookies, localStorage | weglassen |
>
> KI-generierte Seiten bringen diese Dinge fast immer mit. Vor dem Hochladen prüfen:
> `grep -rnE "googleapis|gstatic|cdn\.|jsdelivr|cdnjs|unpkg|placehold" --include=*.html <ordner>` muss leer sein.

- **Urheberrecht:** nur eigene oder frei lizenzierte Grafiken, Fotos und Datenblätter. Keine Herstellerdatenblätter kopieren, eigene PDFs erstellen. Keine Links auf fremde SharePoint- oder Schulserver-Dateien.
- **Kontakt** auf allen Seiten: `kontakt@herrniebel.de`.
- **Formulare** (z. B. eine „Bestellung“ als Lernsituation) dürfen **keine Daten versenden**.
- **Rechtsgrundlagen:** Impressum nach § 5 DDG und § 18 MStV, Datenschutz nach DSGVO und § 25 TDDDG. Keine Rechtsberatung: Im Zweifel juristisch prüfen lassen.

## 9 · Referenzbeispiele

**Halbleiter – LUMIATECH Semiconductor GmbH** · `EGS/jahrgang-11/SG/halbleiter/` · https://herrniebel.de/EGS/jahrgang-11/SG/halbleiter/
Vorlage für **Technik und Aufbau** (noch ohne Sprachumschalter, dieser kommt aus Abschnitt 4):
- 8 Seiten mit gemeinsamen `assets/`
- `site.js` mit `NAV`-Array, `config.js` für Lehrer-Einstellungen
- 11 Simulationen als `sim-*.js` mit `data-sim`-Platzhaltern
- Normsymbole aus `symbols.js`, Bauteilmodelle in `physics.js`
- KI-Support-Reiter, Logo- und Datenblatt-Downloads
- README im Ordner

Fachlich vorbildlich ist der Kennlinien-Explorer mit der Unterscheidung von U_S und U_F.

**I²C-Protokoll – Visionary Displays GmbH** · `EGS/jahrgang-12/fertigungs_und_prüftechnik/i2c_Protokoll/` · https://herrniebel.de/EGS/jahrgang-12/fertigungs_und_pr%C3%BCftechnik/i2c_Protokoll/index.html
Vorlage für **Geschichte und Didaktik**:
- Marketing-Aufhänger „Schluss mit dem Kabel-Chaos“
- Produktvergleich alt/neu (HD44780 parallel vs. I²C)
- roter Faden Hardware → Protokoll → Live-Oszilloskop, eigener Signal-Simulator
- Verdrahtungsseite, Wissens-Chat-Bot
- „Bestellung“ als Übergang zur echten Hardware im Labor
- Experten-Version zur Differenzierung, eigene Fotos

**Nicht übernehmen:**
- separate Sprachseite `index_en.html` (→ Umschalter)
- Experten-Seite als Komplettkopie
- lange Inline-Skripte
- Tailwind
- Bilder über 1 MB

## 10 · Qualitätscheck vor dem Zeigen

- [ ] Inhalte decken die Lernziele bzw. Arbeitsblätter ab, Begriffe und Werte sind fachlich korrekt, Normen eingehalten
- [ ] Jedes Kernkonzept hat ein interaktives Element. Lösungen sind nicht sichtbar, solange nicht zugeschaltet
- [ ] Wirkt wie ein echter Firmenauftritt. Lernhinweise stehen nur im Footer
- [ ] EN und DE vollständig, der Umschalter funktioniert auf jeder Seite und über die Links hinweg
- [ ] Keine Fremdressourcen (grep leer), keine Cookies oder Storage
- [ ] Impressum- und Datenschutz-Links funktionieren, Firma steht im Impressum, externe Links stehen in der Datenschutzerklärung
- [ ] Keine Konsolenfehler. 320/375 px ohne horizontales Scrollen und ohne Überlappungen, Desktop 1280 px
- [ ] Dateien klein und getrennt (Abschnitt 3), README im Ordner aktuell
- [ ] Kachel in `config.json`, JSON gültig (`python -m json.tool config.json`)

**Automatischer Test für Claude-Sessions** mit Playwright und Chromium:
- Jede Seite laden und Anfragen an fremde Hosts per `page.route` blockieren und protokollieren. Die Liste muss leer sein.
- `pageerror` und `console.error` sammeln.
- `scrollWidth − innerWidth` bei 320, 375 und 1280 px messen.
- Sprachumschalter klicken und interne Links folgen.
- Den Impressum-Link mit `scrollIntoView` und `elementFromPoint` auf Erreichbarkeit prüfen.

## 11 · Stolperfallen

- `<sub>` in Flex-Containern (Schalter, Notiztitel) bekommt den `gap` → „U S“. Text in `<span>` einpacken.
- Lange Komposita in `h1` (z. B. „Schutzwinkelverfahren“) sprengen 375 px.
- Absolut positionierte Tooltips verursachen horizontales Scrollen → Container `overflow: hidden` und Tooltip clampen.
- Viele Diagrammbeschriftungen überlappen am Handy → eigene Anordnung für schmale Darstellung.
- `file://` blockiert `fetch()` → das Dashboard lokal nur über einen Webserver testen.
- GitHub Pages unterscheidet Groß- und Kleinschreibung in Ordnernamen.
- Ein vergessenes Komma in `config.json` lässt die ganze Startseite leer.
- Ältere Tailwind-Seiten (Anhang): Neue Klassen erscheinen erst nach Neubau der `tailwind.css`.

---

## Anhang · Ältere Seiten mit Tailwind

Die Seiten Tippbetrieb, I²C-Protokoll, Projektmanagement, Prüfungstimer und RandomPicker nutzen eine **statisch erzeugte `tailwind.css`** (v3.4.17) im eigenen Ordner, kein CDN mehr. Nach neuen Klassen neu erzeugen:

```bash
printf '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' > /tmp/input.css
npx tailwindcss@3.4.17 -i /tmp/input.css -o tailwind.css --content "./*.html" --minify
```

Für die I²C-Seiten zusätzlich mit `-c tailwind.config.js` aufrufen. Die Datei im Ordner anlegen:

```js
module.exports = {
  content: ["./*.html"],
  theme: { extend: {
    colors: { vd_dark: "#0f172a", vd_blue: "#3b82f6", vd_cyan: "#06b6d4", vd_green: "#10b981" },
    fontFamily: { sans: ["Inter", "sans-serif"], mono: ["Fira Code", "monospace"] }
  } }
};
```
