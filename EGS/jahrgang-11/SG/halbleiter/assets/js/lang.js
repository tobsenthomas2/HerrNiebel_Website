/* =========================================================================
   LUMIATECH – Sprache: Englisch ist Standard, Deutsch über den Link-Zusatz ?lang=de
   Wird OHNE defer als erstes Skript im <head> geladen, damit die andere
   Sprachfassung gar nicht erst aufblitzt.

   Auszeichnung in den Seiten:
     <span data-lang="en">English</span><span data-lang="de">Deutsch</span>
     aria-label="English" data-de-aria-label="Deutsch"   (auch alt, data-title, data-hint, data-toc-label)
     <html data-title-de="…">   deutscher Seitentitel
   In Skripten: LT.t("English", "Deutsch")

   Umschalten: Karte bzw. Reiter „Übersetzen?“ am rechten Rand (site.js).
   Die Wahl steht nur in der Adresse und wandert über die internen Links mit –
   es wird nichts gespeichert (keine Cookies, kein localStorage).
   ========================================================================= */
(function () {
  "use strict";
  var m = /[?&]lang=(de|en)(&|#|$)/.exec(location.search);
  var lang = m ? m[1] : "en";
  var html = document.documentElement;
  html.lang = lang;
  if (lang === "de") {
    var titel = html.getAttribute("data-title-de");
    if (titel) document.title = titel;
  }
  var LT = (window.LT = window.LT || {});
  LT.lang = lang;
  LT.langGewaehlt = !!m; // false = erster Aufruf ohne Sprachwahl → Karte „Übersetzen?“ zeigen
  LT.t = function (en, de) { return lang === "de" ? de : en; };
})();
