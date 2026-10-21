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
 */
window.LT_CONFIG = {
  messwerteAnzeigen: false,
  kiChat: {
    url: "https://app.ais-chat.schule/ua/learning-scenarios/554d2d0d-b615-486d-802b-0a0486584b10/dialog?inviteCode=3BHIYHY9",
    hinweisBeimLaden: true,
    hinweisSekunden: 10
  }
};
