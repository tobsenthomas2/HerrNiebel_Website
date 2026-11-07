/* =========================================================================
   Visionary Displays – gemeinsame Bausteine
   - Navigation (NAV-Array), Fußzeile, Symbole
   - Sprache EN (Standard) / DE ohne Cookies und ohne Speicher im Browser
   Neue Seite? Nur das NAV-Array ergänzen.
   ========================================================================= */
(function () {
  "use strict";
  var SITE = (window.SITE = window.SITE || {});
  var ROOT = "../../../../";   // Repo-Wurzel: Impressum, Datenschutz

  var NAV = [
    { href: "index.html", en: "Why I²C?", de: "Warum I²C?" },
    { href: "hardware.html", en: "Hardware", de: "Hardware" },
    { href: "protocol.html", en: "Protocol", de: "Protokoll" },
    { href: "simulator.html", en: "Simulator", de: "Simulator" },
    { href: "wiring.html", en: "Arduino wiring", de: "Arduino-Verdrahtung" },
    { href: "expert.html", en: "Expert", de: "Experten" }
  ];

  /* ---------- Symbole (eigene Zeichnungen, 24 × 24) ---------- */
  var P = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    chip: '<rect x="6" y="6" width="12" height="12" rx="2" ' + P + '/><rect x="9.5" y="9.5" width="5" height="5" rx=".5" fill="currentColor"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" ' + P + '/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16" ' + P + '/>',
    close: '<path d="M6 6l12 12M18 6L6 18" ' + P + '/>',
    check: '<path d="M4 12.5l5 5L20 6.5" ' + P + '/>',
    warn: '<path d="M12 3.5L2.5 20h19L12 3.5z" ' + P + '/><path d="M12 10v4.5" ' + P + '/><circle cx="12" cy="17.2" r="1.1" fill="currentColor"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" ' + P + '/>',
    info: '<circle cx="12" cy="12" r="9" ' + P + '/><path d="M12 11v6" ' + P + '/><circle cx="12" cy="7.6" r="1.1" fill="currentColor"/>',
    chat: '<path d="M4 5h16v11H9l-5 4V5z" ' + P + '/><path d="M8 9.5h8M8 12.5h5" ' + P + '/>',
    robot: '<rect x="4" y="8" width="16" height="12" rx="3" ' + P + '/><path d="M12 4v4M9 13h.01M15 13h.01M9 17h6" ' + P + '/><circle cx="12" cy="3.5" r="1.2" fill="currentColor"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0V8zM12 17v4" ' + P + '/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6" ' + P + '/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6" ' + P + '/>',
    wave: '<path d="M2 16h4V8h5v8h5V8h4v8h2" ' + P + '/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M4 20h16" ' + P + '/>',
    screen: '<rect x="3" y="4" width="18" height="12" rx="2" ' + P + '/><path d="M8 20h8M12 16v4" ' + P + '/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" ' + P + '/>',
    question: '<circle cx="12" cy="12" r="9" ' + P + '/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.4" ' + P + '/><circle cx="12" cy="16.9" r="1.1" fill="currentColor"/>',
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" ' + P + '/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z" ' + P + '/><path d="M3 13l9 5 9-5" ' + P + '/>',
    cart: '<path d="M3 4h2l2.4 11h10.8L21 8H6.3" ' + P + '/><circle cx="9.5" cy="19.5" r="1.4" fill="currentColor"/><circle cx="17" cy="19.5" r="1.4" fill="currentColor"/>'
  };
  SITE.icon = function (name, cls) {
    return '<svg class="ico' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  };
  // <i data-icon="check"></i> im HTML durch das Symbol ersetzen
  function fillIcons(root) {
    (root || document).querySelectorAll("i[data-icon]").forEach(function (el) {
      el.outerHTML = SITE.icon(el.getAttribute("data-icon"), el.getAttribute("class"));
    });
  }
  function both(o) { return '<span data-lang="en">' + o.en + '</span><span data-lang="de">' + o.de + "</span>"; }
  SITE.both = both;

  /* ---------- Navigation ---------- */
  function buildNav() {
    var host = document.getElementById("site-nav");
    if (!host) return;
    var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    var links = NAV.map(function (n) {
      return '<a href="' + n.href + '"' + (n.href === here ? ' aria-current="page"' : "") + ">" + both(n) + "</a>";
    }).join("");
    host.outerHTML =
      '<nav class="nav" aria-label="Main">' +
        '<div class="container nav__bar">' +
          '<a class="brand" href="index.html">' + SITE.icon("chip") + "<span>VISIONARY<b>DISPLAYS</b></span></a>" +
          '<div class="nav__links">' + links + "</div>" +
          '<div class="lang-switch" role="group" aria-label="Language / Sprache">' +
            '<button type="button" data-set-lang="en" aria-pressed="true">EN</button>' +
            '<button type="button" data-set-lang="de" aria-pressed="false">DE</button>' +
          "</div>" +
          '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav-panel">' +
            '<span class="visually-hidden">Menu</span>' + SITE.icon("menu") + "</button>" +
        "</div>" +
        '<div class="nav__panel" id="nav-panel" hidden><div class="container">' + links + "</div></div>" +
      "</nav>";
    var btn = document.querySelector(".menu-btn"), panel = document.getElementById("nav-panel");
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      btn.innerHTML = '<span class="visually-hidden">Menu</span>' + SITE.icon(open ? "close" : "menu");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { btn.click(); btn.focus(); }
    });
  }

  /* ---------- Fußzeile ---------- */
  function buildFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    var year = new Date().getFullYear();
    host.className = "footer";
    host.innerHTML =
      '<div class="container footer__bar">' +
        '<a class="brand" href="index.html">' + SITE.icon("chip") + "<span>VISIONARY<b>DISPLAYS</b></span></a>" +
        '<div class="footer__text">' +
          "<p>© " + year + " Visionary Displays GmbH</p>" +
          "<p>" + both({ en: "AI-generated content · for teaching purposes only", de: "KI-generierte Inhalte · ausschließlich für Lehrzwecke" }) +
          ' · <a href="mailto:kontakt@herrniebel.de">kontakt@herrniebel.de</a></p>' +
        "</div>" +
      "</div>" +
      '<p class="footer__legal"><a href="' + ROOT + 'impressum.html">Impressum</a> · <a href="' + ROOT + 'datenschutz.html">Datenschutz</a></p>';
  }

  /* ---------- Sprache EN (Standard) / DE ---------- */
  var LANGS = ["en", "de"];
  function fromUrl() { var l = new URLSearchParams(location.search).get("lang"); return LANGS.indexOf(l) > -1 ? l : "en"; }
  SITE.lang = function () { return document.documentElement.lang === "de" ? "de" : "en"; };
  SITE.t = function (o) { return o[SITE.lang()] != null ? o[SITE.lang()] : o.en; };   // Texte in Simulationen
  SITE.setLang = function (l, updateUrl) {
    var html = document.documentElement;
    html.lang = l;
    var title = html.getAttribute("data-title-" + l); if (title) document.title = title;
    document.querySelectorAll("[data-set-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === l)); });
    if (updateUrl) { var u = new URL(location.href); if (l === "en") u.searchParams.delete("lang"); else u.searchParams.set("lang", l); history.replaceState(null, "", u.href); }
    document.dispatchEvent(new CustomEvent("langchange", { detail: l }));   // Simulationen zeichnen ihre Texte neu
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-lang]");
    if (b) { SITE.setLang(b.getAttribute("data-set-lang"), true); return; }
    var a = e.target.closest("a[href]");                                     // interne Links nehmen die Sprache mit
    if (!a || SITE.lang() === "en" || a.target === "_blank") return;
    var href = a.getAttribute("href"); if (/^(#|mailto:|tel:|https?:)/i.test(href)) return;
    var u = new URL(href, location.href);
    if (/\.html$/i.test(u.pathname) && !/(impressum|datenschutz)\.html$/i.test(u.pathname)) { u.searchParams.set("lang", "de"); a.href = u.href; }
  });

  buildNav();
  buildFooter();
  fillIcons();
  SITE.setLang(fromUrl(), false);
})();
