# Prüfungsvorbereitung AP Teil 2 – EBT 13

Kleine Online-Tests zur Abschlussprüfung Teil 2 (Elektroniker/-in für Betriebstechnik).
Kachel: **EBT → Jahrgang 13 → Prüfungsvorbereitung → Abschlussprüfung Teil 2** (`config.json`).

**Konzept:** neutraler Prüfungstrainer (kein Firmenauftritt), nur Deutsch, Sie-Form wie in der Prüfung.
Ankreuzaufgaben mit genau einer richtigen Antwort, Auswertung mit Punkten, IHK-Note und Erklärung je Aufgabe.
Kein Zeitlimit, keine Speicherung (keine Cookies, kein localStorage), keine Fremdserver.
Auf Übersicht und Testseite steht der Hinweis, dass Fehler möglich sind; unter jeder ausgewerteten Aufgabe gibt es
einen „Fehler melden“-Link (mailto an kontakt@herrniebel.de mit Aufgaben-Nr.).

**Quelle der Aufgaben:** 139 Ankreuzaufgaben der eigenen, umformulierten Übungen zur AP Teil 2 (Übung 1–3),
automatisch aus den PowerPoint-Dateien übernommen (Frage, Antworten, Lösung, Lehrkraft-Hinweise als Erklärung).
Keine Originaltexte der Prüfungen, keine Hinweise auf Prüfungstermine, Abbildungen sind die eigenen Grafiken (WebP).
Die Antwortreihenfolge bleibt wie im Übungsblatt, weil die Erklärungen die Antwortnummern nennen.
Die Freitextaufgaben (Teil B) sind nicht enthalten.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Übersicht: Fehlerhinweis, Testkarten (aus `tests.js`), Bedienhinweise |
| `test.html` | Testseite, Aufruf `test.html?t=<Test-ID>`; mit `&ids=B-01,B-03` nur diese Aufgaben |
| `assets/css/site.css` | Design-Tokens (EBT-Violett), Dark Mode, Druckansicht |
| `assets/js/site.js` | Kopf, Fuß, Rechtslinks, Fehlerhinweis, Textauszeichnung, Notenschlüssel |
| `assets/js/questions.js` | Aufgabenpool `AP2.Q` und Themen `AP2.TOPICS` |
| `assets/js/tests.js` | Testzusammenstellung `AP2.TESTS` |
| `assets/js/hub.js` | erzeugt die Testkarten |
| `assets/js/quiz.js` | Test anzeigen, Antworten mischen, auswerten, erklären |
| `assets/img/` | eigene Abbildungen (SVG) zu den Aufgaben |

## Aufgabe ergänzen

In `questions.js` einen Eintrag anlegen:

```js
{ id: "B-06", topic: "B",
  q: "Aufgabentext mit X_{C}, **fett**, 10^{-6}",
  o: ["Antwort 1", "Antwort 2", "Antwort 3", "Antwort 4", "Antwort 5"],   // Reihenfolge wird angezeigt wie hier
  a: 2,                                                                    // Index der richtigen Antwort (0 = erste)
  loes: "Lösung in einem Satz",
  weg: "So kommt man drauf …", warum: "…", falsch: "Die anderen Antworten …", merke: "…", erkl: "Erklärung …",
  figs: [{ src: "assets/img/b06.webp", alt: "Beschreibung" }],             // optional
  tables: [{ head: ["Spalte 1", "Spalte 2"], rows: [["…", "…"]] }],        // optional
  plate: [["Zeile 1", "…"], ["Zeile 2"]],                                  // optional: Leistungsschild
  notes: ["Text in einem Kasten, z. B. ein englisches Schild"],            // optional
  src: "Übung 1"                                                           // Herkunft (wird klein angezeigt)
}
// Antwort als Bild: o: [{ img: "assets/img/….webp", alt: "Antwort 1 (Diagramm)" }, …]
```

Die Nummer `id` nie nachträglich ändern – Schülerinnen und Schüler melden Fehler mit dieser Nummer.
Einen Test in `tests.js` ergänzen: `{ id, topic, title, short, icon, desc, ids: [...] }` oder `{ …, random: 10 }`.
Die Übersicht gruppiert die Tests nach `topic` (Reihenfolge `AP2.TOPIC_ORDER`).
Ein Test erscheint erst auf der Übersicht, wenn alle seine Aufgaben im Pool stehen.

## Themen (Nummernkreis) und Tests

| Buchstabe | Thema | Aufgaben | Tests |
|---|---|---|---|
| B | Betrieb, Arbeitsschutz und Qualität | 23 | b1–b3 |
| S | Schutzmaßnahmen und Prüfen | 20 | s1–s2 |
| A | Antriebe und Leistungselektronik | 25 | a1–a3 |
| E | Energietechnik und Beleuchtung | 29 | e1–e3 |
| T | Steuerungstechnik und Bussysteme | 20 | t1–t2 |
| R | Mess- und Regelungstechnik | 22 | r1–r2 |
|  | Gemischter Test (10 zufällige Aufgaben) |  | mix |
