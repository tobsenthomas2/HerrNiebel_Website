/*
 * LUMIATECH – zentrale Einstellungen für alle Seiten und Simulationen.
 *
 * messwerteAnzeigen
 *   false (Standard): Simulationen zum Arbeitspunkt, zur Signalsäule, zum Verpolschutz
 *                     und zum Schaltungs-Check zeigen Ergebnisse nur grafisch bzw.
 *                     qualitativ (leitet / sperrt, zulässig / Überlast). Exakte Zahlen
 *                     müssen selbst abgelesen oder berechnet werden.
 *   true:             Dieselben Simulationen blenden zusätzlich die berechneten
 *                     Zahlenwerte (Spannungen, Ströme, Leistungen) ein.
 *
 * Kennlinien-Explorer und Datenblattwerte zeigen ihre Zahlen immer an.
 *
 * kiChat  (Support-Reiter am rechten Rand bzw. unten rechts auf dem Handy)
 *   url:              Link zum KI-Chatbot. Der QR-Code im Support-Fenster wird
 *                     daraus automatisch erzeugt – neuer Link = neuer QR-Code.
 *                     Leer lassen (""), um den Support-Reiter auszublenden.
 *   hinweisBeimLaden: true  = beim Laden jeder Seite klappt kurz ein Hinweis
 *                             „Fragen? …“ neben dem Reiter auf.
 *                     false = nur der Reiter ist sichtbar.
 *   hinweisSekunden:  wie lange der Hinweis stehen bleibt (0 = bis er geschlossen wird).
 *
 * woche  (UNTERRICHTSWOCHE – die Website wächst mit dem Unterricht)
 *   Vor jeder Stunde die aktuelle Woche eintragen. Angezeigt wird nur, was bis
 *   zu dieser Woche freigeschaltet ist. Dioden und Halbleiter-Grundlagen sind
 *   immer sichtbar.
 *   Einen früheren Stand zeigt der Link-Zusatz ?w=1, z. B. für eine Parallelklasse:
 *   …/halbleiter/index.html?w=1 – nie mehr, als hier eingestellt ist.
 *
 * themen  (ab welcher Woche erscheint welches Thema?)
 *   leds:         LED-Produktseite, LED-Applikation, Signalsäule, LED-Datenblätter
 *   transistoren: vorbereitet – die Transistor-Seiten folgen noch
 *   Braucht ein Thema länger, einfach die Zahl erhöhen.
 */
window.LT_CONFIG = {
  woche: 1,
  themen: { leds: 2, transistoren: 3 },

  messwerteAnzeigen: false,
  kiChat: {
    url: "https://app.ais-chat.schule/ua/learning-scenarios/554d2d0d-b615-486d-802b-0a0486584b10/dialog?inviteCode=3BHIYHY9",
    hinweisBeimLaden: true,
    hinweisSekunden: 10
  }
};
