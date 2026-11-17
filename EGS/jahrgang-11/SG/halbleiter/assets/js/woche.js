/* =========================================================================
   LUMIATECH – Unterrichtswoche: die Website wächst mit dem Unterricht
   Wird OHNE defer direkt nach config.js im <head> geladen, damit gesperrte
   Inhalte gar nicht erst aufblitzen.

   Einstellungen in config.js:
     woche:  aktuelle Unterrichtswoche
     themen: ab welcher Woche ein Thema erscheint, z. B. { leds: 2, transistoren: 3 }
             (Dioden und alles Unmarkierte sind immer sichtbar)

   Auszeichnung in den Seiten:
     data-thema="leds"   erst sichtbar, wenn das Thema freigeschaltet ist
     data-ohne="leds"    nur sichtbar, SOLANGE das Thema noch gesperrt ist
                         (Ersatztext für die frühen Wochen, z. B. „Dioden“ statt „Dioden und LEDs“)
     <html data-seite="leds">            ganze Seite gesperrt → Weiterleitung zur Startseite
     <html data-titel-ohne-leds="…">     Seitentitel, solange das Thema gesperrt ist
                                         (deutsch: data-titel-ohne-leds-de, Sprache siehe lang.js)
     NAV-Eintrag in site.js: thema: "leds"

   Link-Zusatz ?w=1 zeigt einen früheren Stand (z. B. für eine Parallelklasse),
   nie einen späteren als in config.js eingestellt. Interne Links nehmen ihn mit.
   ========================================================================= */
(function () {
  "use strict";
  var CFG = window.LT_CONFIG || {};
  var THEMEN = CFG.themen || { leds: 2, transistoren: 3 };
  var cfgW = Math.max(1, parseInt(CFG.woche, 10) || 1);
  var urlW = parseInt(new URLSearchParams(location.search).get("w"), 10);
  var W = urlW >= 1 && urlW < cfgW ? urlW : cfgW;
  var html = document.documentElement;

  function frei(thema) { return !Object.prototype.hasOwnProperty.call(THEMEN, thema) || W >= THEMEN[thema]; }

  // ganze Seite noch gesperrt → zur Startseite (Sprung im Verlauf ersetzen)
  var seite = html.getAttribute("data-seite");
  if (seite && !frei(seite)) {
    var q = [], lm = /[?&]lang=(de|en)(&|#|$)/.exec(location.search);
    if (W < cfgW) q.push("w=" + W);
    if (lm) q.push("lang=" + lm[1]); // gewählte Sprache behalten
    location.replace("index.html" + (q.length ? "?" + q.join("&") : ""));
    return;
  }

  var css = "";
  Object.keys(THEMEN).forEach(function (t) {
    if (frei(t)) {
      html.classList.add("t-" + t);
      css += '[data-ohne~="' + t + '"]{display:none!important}';
    } else {
      css += '[data-thema~="' + t + '"]{display:none!important}';
      var titel = (html.lang === "de" && html.getAttribute("data-titel-ohne-" + t + "-de")) || html.getAttribute("data-titel-ohne-" + t);
      if (titel) document.title = titel;
    }
  });
  var style = document.createElement("style");
  style.id = "woche-css";
  style.textContent = css;
  (document.head || html).appendChild(style);

  window.LT_WOCHE = { woche: W, eingestellt: cfgW, frei: frei };
})();
