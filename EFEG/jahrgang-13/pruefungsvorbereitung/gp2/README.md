# Prüfungsvorbereitung GP Teil 2 – EFEG 13

Kleine Online-Tests zur Gesellenprüfung Teil 2 (Elektroniker/-in Fachrichtung Energie- und Gebäudetechnik).
Kachel: **EFEG → Jahrgang 13 → Prüfungsvorbereitung → Gesellenprüfung Teil 2** (`config.json`).

**Konzept:** gleicher Aufbau wie der EBT-Prüfungstrainer (`EBT/jahrgang-13/pruefungsvorbereitung/ap2`): neutraler
Prüfungstrainer, nur Deutsch, Sie-Form wie in der Prüfung. Ankreuzaufgaben mit genau einer richtigen Antwort,
Auswertung mit Punkten, Note nach dem 100-Punkte-Schlüssel der Gesellenprüfung und Erklärung je Aufgabe.
Kein Zeitlimit, keine Speicherung (keine Cookies, kein localStorage), keine Fremdserver.
Auf Übersicht und Testseite steht der Hinweis, dass Fehler möglich sind; unter jeder ausgewerteten Aufgabe gibt es
einen „Fehler melden“-Link (mailto an kontakt@herrniebel.de mit Aufgaben-Nr.).

**Quelle der Aufgaben:** 121 eigene Ankreuzaufgaben zu den Themen der drei eigenen Übungsprüfungen
(Systementwurf, Funktions- und Systemanalyse, Kundenauftrag „Bäckerei Brandl“). In der echten Gesellenprüfung sind
die Aufgaben offen zu beantworten; die Tests prüfen das dafür nötige Wissen, die Erklärungen zeigen den Rechenweg.
Keine Originaltexte der Prüfungen (automatisch gegen die Originale geprüft), keine Hinweise auf Prüfungstermine.
Abbildungen sind die eigenen Grafiken aus den Übungsprüfungen (WebP).
Die Position der richtigen Antwort ist gleichmäßig verteilt; die Antwortlängen sind so angeglichen, dass die
richtige Antwort nicht an ihrer Länge zu erkennen ist. Die Erklärungen nennen keine Antwortnummern.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Übersicht: Fehlerhinweis, Testkarten (aus `tests.js`), Bedienhinweise |
| `test.html` | Testseite, Aufruf `test.html?t=<Test-ID>`; mit `&ids=S-01,S-03` nur diese Aufgaben |
| `assets/css/site.css` | Design-Tokens (EFEG-Amber), Dark Mode, Druckansicht |
| `assets/js/site.js` | Kopf, Fuß, Rechtslinks, Fehlerhinweis, Textauszeichnung, Notenschlüssel |
| `assets/js/questions.js` | Aufgabenpool `AP2.Q` und Themen `AP2.TOPICS` |
| `assets/js/tests.js` | Testzusammenstellung `AP2.TESTS` |
| `assets/js/hub.js` | erzeugt die Testkarten |
| `assets/js/quiz.js` | Test anzeigen, auswerten, erklären |
| `assets/img/` | eigene Abbildungen (Liniendiagramm, Meldelinie, Antennenanlage) |

Der Namensraum `AP2` in den Skripten ist vom EBT-Trainer übernommen, damit beide Trainer dieselbe Logik nutzen.

## Aufgabe ergänzen

In `questions.js` einen Eintrag anlegen (Format wie beim EBT-Trainer):

```js
{ id: "S-15", topic: "S",
  q: "Aufgabentext mit I_{ΔN}, **fett**, 10^{-6}",
  o: ["Antwort 1", "Antwort 2", "Antwort 3", "Antwort 4", "Antwort 5"],
  a: 2,                                   // Index der richtigen Antwort (0 = erste)
  loes: "Lösung in einem Satz",
  weg: "So kommt man drauf …", erkl: "…", falsch: "Die anderen Antworten …", merke: "…",
  figs: [{ src: "assets/img/….webp", alt: "Beschreibung" }],   // optional
  tables: [{ head: ["…", "…"], rows: [["…", "…"]] }],          // optional
  plate: [["…", "…"]],                                         // optional: Leistungsschild
  src: "Übung Systementwurf"                                    // Herkunft (wird klein angezeigt)
}
```

Die Nummer `id` nie nachträglich ändern – Schülerinnen und Schüler melden Fehler mit dieser Nummer.
Einen Test in `tests.js` ergänzen: `{ id, topic, title, short, icon, desc, ids: [...] }` oder `{ …, random: 10 }`.

## Themen (Nummernkreis) und Tests

| Buchstabe | Thema | Aufgaben | Tests |
|---|---|---|---|
| S | Schutzmaßnahmen und Netzsysteme | 14 | s1–s2 |
| R | RCD und Prüfen | 15 | r1–r2 |
| E | Energie- und Antriebstechnik | 18 | e1–e3 |
| L | Licht und Wärme | 14 | l1–l2 |
| H | Hausanschluss, Bad und E-Mobilität | 15 | h1–h2 |
| B | Blitzschutz und Erdung | 14 | b1–b2 |
| K | Kommunikation, Meldetechnik und Steuerung | 17 | k1–k2 |
| A | Arbeitssicherheit und Installation | 14 | a1–a2 |
|  | Gemischter Test (10 zufällige Aufgaben) |  | mix |
|  | Großer gemischter Test (20 zufällige Aufgaben) |  | mix20 |
