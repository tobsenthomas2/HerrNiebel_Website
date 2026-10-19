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
 */
window.LT_CONFIG = {
  messwerteAnzeigen: false
};
