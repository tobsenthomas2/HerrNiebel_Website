/*
 * WATT AUF ACHSE – Lehrer-Einstellungen für alle Seiten und Simulationen.
 *
 * week  (UNTERRICHTSWOCHE – die Website wächst mit der Reihe)
 *   Vor jeder Stunde die aktuelle Woche eintragen. Sichtbar ist nur, was bis
 *   zu dieser Woche freigeschaltet ist:
 *     1 = Vorstunde S-1   LED an Wechselspannung, Einweggleichrichter (fest 50 Hz),
 *                         Bauteil-Ecke 1N4007 + Power-LED
 *     2 = Lehrprobe        + Brückengleichrichter mit Drehzahlregler, Dioden-Duell
 *                         mit Leserkommentaren, 1N5817/1N5819, Kleinwind (Experten)
 *     3 = Folgestunde S+1  vorbereitet (B6U-Ausgangsspannung im Kleinwind-Simulator)
 *   Einen früheren Stand zeigt der Link-Zusatz ?w=1 (z. B. Parallelklasse) –
 *   nie mehr, als hier eingestellt ist.
 *
 * messwerteAnzeigen
 *   false (Standard): Simulationen zeigen Kurven und Zustände, aber keine
 *                     berechneten Zahlen (Mittelwert, Dunkelphase, Sperrspannung …).
 *   true:             zusätzlich die Zahlenwerte – z. B. zum Vergleich in der Besprechung.
 *   Datenblattwerte (U_F einer Diode) stehen immer da.
 *
 * tippsMarkieren
 *   false (Standard): Leserkommentare stehen unkommentiert da (Informationen selbst prüfen!).
 *   true:             Kommentare bekommen ein Etikett „hilfreich“, „unvollständig“ oder „falsch“.
 *
 * kiChat  (Schrauber-Chat: Reiter am rechten Rand bzw. unten rechts auf dem Handy)
 *   url:              Link zum KI-Chat. Der QR-Code wird daraus erzeugt.
 *                     Leer lassen (""), um den Chat-Reiter auszublenden.
 *   hinweisBeimLaden: true = beim Laden klappt kurz ein Hinweis neben dem Reiter auf.
 *   hinweisSekunden:  wie lange der Hinweis stehen bleibt (0 = bis er geschlossen wird).
 */
window.WAA_CONFIG = {
  week: 1,

  messwerteAnzeigen: false,
  tippsMarkieren: false,

  kiChat: {
    url: "https://app.ais-chat.schule/ua/learning-scenarios/0c2fb146-e7e4-447d-a06e-949461142630/dialog?inviteCode=T4JSE8CQ",
    hinweisBeimLaden: true,
    hinweisSekunden: 10
  }
};
