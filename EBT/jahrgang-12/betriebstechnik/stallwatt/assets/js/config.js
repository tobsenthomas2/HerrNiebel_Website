/* =========================================================================
   STALLWATT Agrartechnik GmbH – Lehrer-Einstellungen
   Nur diese Datei ändern, um die Website an die Stunde anzupassen.
   ========================================================================= */
window.SITE_CONFIG = {
  companyName: "STALLWATT Agrartechnik GmbH",

  // UNTERRICHTSWOCHE: Die Website wächst mit der Reihe „Geflügelhof Federbichl“ (EBT 12).
  // Angezeigt wird nur, was bis zu dieser Woche freigegeben ist (1 = Stand Woche 1, 2 = Woche 2 …).
  // Vor jeder Einheit hier die Woche eintragen (steht auch im UVP unter „Vorbereitung“).
  // Einen früheren Stand zeigt der Link-Zusatz ?w=1 (z. B. für eine zweite Klasse) – nie mehr als hier freigegeben.
  week: 1,

  // Stromkreis-Prüfstand (technology.html): Stromstärke und Leistung als Zahl anzeigen?
  // false = nur Ampel/Meldung (Schüler rechnen selbst), true = Zahlenwerte sichtbar
  showValues: false,

  // Tipps anzeigen? Wo es einen Tipp gibt, sitzt ein kleines „!“; ein Klick öffnet ihn.
  hints: true,

  // Optional: Link zu einem KI-Chat (z. B. Fobizz). Leer lassen = kein Support-Reiter.
  kiChatUrl: "",

  contactEmail: "kontakt@herrniebel.de",

  // Pfad zur Wurzel von herrniebel.de (für Impressum/Datenschutz), je Ordnerebene ein ../
  legalRoot: "../../../../"
};
