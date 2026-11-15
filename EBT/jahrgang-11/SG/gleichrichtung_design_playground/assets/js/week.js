/* =========================================================================
   WATT AUF ACHSE – Unterrichtswoche: die Website wächst mit der Reihe
   OHNE defer direkt nach config.js im <head> laden, damit nichts aufblitzt.

   Auszeichnung in den Seiten:
     data-week="2"       erst ab Woche 2 sichtbar
     data-week-max="1"   nur bis einschließlich Woche 1 sichtbar (Ersatztext)
     <html data-week="2">  ganze Seite erst ab Woche 2 → sonst Weiterleitung zur Startseite
     NAV-Eintrag in site.js: week: 2

   Link-Zusatz ?w=1 zeigt einen früheren Stand, nie einen späteren als config.js.
   ========================================================================= */
(function () {
  "use strict";
  var CFG = window.WAA_CONFIG || {};
  var MAX = 6;                                            // so viele Wochen kennt die Seite höchstens
  var cfgW = Math.min(MAX, Math.max(1, parseInt(CFG.week, 10) || 1));
  var urlW = parseInt(new URLSearchParams(location.search).get("w"), 10);
  var W = urlW >= 1 && urlW < cfgW ? urlW : cfgW;
  var html = document.documentElement;

  var pageWeek = parseInt(html.getAttribute("data-week"), 10);
  if (pageWeek > W) {                                     // ganze Seite noch gesperrt
    location.replace("index.html" + (W < cfgW ? "?w=" + W : ""));
    return;
  }

  var css = "";
  for (var k = 1; k <= MAX; k++) {
    if (k > W) css += '[data-week="' + k + '"]:not(html){display:none!important}';
    if (k < W) css += '[data-week-max="' + k + '"]{display:none!important}';
  }
  var style = document.createElement("style");
  style.id = "week-css";
  style.textContent = css;
  (document.head || html).appendChild(style);
  html.classList.add("w-" + W);

  window.WAA_WEEK = { week: W, configured: cfgW, open: function (n) { return W >= n; } };
})();
