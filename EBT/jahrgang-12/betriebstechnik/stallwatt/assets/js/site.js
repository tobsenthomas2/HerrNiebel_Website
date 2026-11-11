/* =========================================================================
   STALLWATT Agrartechnik GmbH – gemeinsame Bausteine
   Kopf (NAV-Array), Fußzeile, Symbole, Sprache EN/DE ohne Cookies/Storage,
   Tipps per „!“-Symbol, Unterrichtswoche (config.js week / ?w=), optionaler KI-Chat-Reiter
   ========================================================================= */
(function () {
  "use strict";
  var SITE = (window.SITE = window.SITE || {});
  var CFG = window.SITE_CONFIG || {};
  var ROOT = CFG.legalRoot || "../../../../";

  /* ---------- Unterrichtswoche: Inhalte mit data-week="N" erst ab Woche N, data-week-max="N" nur bis Woche N ----------
     Obergrenze = config.js (week); ?w=1 im Link zeigt einen früheren Stand, nie einen späteren. */
  var MAXW = 12;
  var cfgWeek = Math.min(MAXW, Math.max(1, parseInt(CFG.week, 10) || 1));
  var urlWeek = parseInt(new URLSearchParams(location.search).get("w"), 10);
  var WEEK = urlWeek >= 1 && urlWeek < cfgWeek ? urlWeek : cfgWeek;
  SITE.week = WEEK;
  for (var wk = 2; wk <= WEEK; wk++) document.documentElement.classList.add("wk" + wk);

  var NAV = [
    { href: "index.html", en: "Home", de: "Start" },
    { href: "about.html", en: "Company", de: "Firma" },
    { href: "products.html", en: "Products", de: "Produkte" },
    { href: "technology.html", en: "Technology", de: "Technik" },
    { href: "configurator.html", en: "Planning", de: "Planung" },
    { href: "project-guide.html", en: "Academy", de: "Akademie" },
    { href: "support.html", en: "Service", de: "Service" },
    { href: "expert.html", en: "Expert", de: "Experten" }
  ];

  /* ---------- Symbole (eigene SVG, 24 × 24) ---------- */
  var P = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    drop: '<path d="M12 3c3.5 4.6 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6.4 6-11z" ' + P + '/>',
    flame: '<path d="M12 3c2 3 6 5.5 6 10a6 6 0 1 1-12 0c0-2.5 1.5-4.5 3-6 0 2 1.5 3 3 3 0-3 0-5 0-7z" ' + P + '/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" ' + P + '/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0V8zM12 17v4" ' + P + '/>',
    gauge: '<path d="M4 16a8 8 0 1 1 16 0" ' + P + '/><path d="M12 16l4-5" ' + P + '/><circle cx="12" cy="16" r="1.4" fill="currentColor"/>',
    check: '<path d="M4 12.5l5 5L20 6.5" ' + P + '/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6" ' + P + '/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16" ' + P + '/>',
    close: '<path d="M6 6l12 12M18 6L6 18" ' + P + '/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" ' + P + '/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z" ' + P + '/>',
    shield: '<path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z" ' + P + '/><path d="M8.5 12l2.5 2.5 4.5-5" ' + P + '/>',
    compass: '<circle cx="12" cy="12" r="9" ' + P + '/><polygon points="16,8 14,14 8,16 10,10" ' + P + '/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" ' + P + '/>',
    users: '<circle cx="9" cy="8" r="3.5" ' + P + '/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.2A6.5 6.5 0 0 1 21.5 20" ' + P + '/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" ' + P + '/><path d="M14 3v5h5M9 13h6M9 17h6" ' + P + '/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6z" ' + P + '/>',
    clock: '<circle cx="12" cy="12" r="9" ' + P + '/><path d="M12 7v5l3 2" ' + P + '/>',
    euro: '<path d="M17 6.5A7 7 0 1 0 17 17.5M4 10h9M4 14h9" ' + P + '/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" ' + P + '/>',
    factory: '<path d="M3 21V10l6 3V10l6 3V6l6 3v12H3z" ' + P + '/><path d="M7 17h2M11 17h2M15 17h2" ' + P + '/>',
    info: '<circle cx="12" cy="12" r="9" ' + P + '/><path d="M12 11v6" ' + P + '/><circle cx="12" cy="7.6" r="1.1" fill="currentColor"/>'
  };
  SITE.icon = function (name, cls) {
    return '<svg class="ico' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.info) + "</svg>";
  };
  function fillIcons(root) {
    (root || document).querySelectorAll("i[data-icon]").forEach(function (el) {
      var st = el.getAttribute("style");
      el.outerHTML = SITE.icon(el.getAttribute("data-icon"), el.getAttribute("class")).replace("<svg ", st ? '<svg style="' + st + '" ' : "<svg ");
    });
  }

  /* Bildmarke: Ei mit Heizwiderstand (Schaltzeichen nach DIN EN 60617) */
  SITE.logo = function () {
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="swlg" x1="0" y1="1" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#2f6b3c"/><stop offset="1" stop-color="#e08a1e"/></linearGradient></defs>' +
      '<rect width="40" height="40" rx="10" fill="url(#swlg)"/>' +
      '<path d="M20 6c4.6 0 8.6 7.6 8.6 14.6a8.6 9 0 0 1-17.2 0C11.4 13.6 15.4 6 20 6z" fill="none" stroke="#fff" stroke-width="2.3" stroke-linejoin="round"/>' +
      '<path d="M8 23.5h7M25 23.5h7" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/>' +
      '<rect x="15" y="20.6" width="10" height="5.8" fill="none" stroke="#fff" stroke-width="2.3"/></svg>';
  };

  function both(o) { return '<span data-lang="en">' + o.en + '</span><span data-lang="de">' + o.de + "</span>"; }
  SITE.both = both;

  /* ---------- Kopf ---------- */
  function buildNav() {
    var host = document.getElementById("site-nav");
    if (!host) return;
    var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    var links = NAV.map(function (n) {
      return '<a href="' + n.href + '"' + (n.href === here ? ' aria-current="page"' : "") + ">" + both(n) + "</a>";
    }).join("");
    host.outerHTML =
      '<div class="topbar"></div>' +
      '<nav class="nav" aria-label="Main">' +
        '<div class="container nav__bar">' +
          '<a class="brand" href="index.html">' + SITE.logo() + "<span>STALL<b>WATT</b></span></a>" +
          '<div class="nav__links">' + links + "</div>" +
          '<div class="lang-switch" role="group" aria-label="Language / Sprache">' +
            '<button type="button" data-set-lang="en" aria-pressed="true">EN</button>' +
            '<button type="button" data-set-lang="de" aria-pressed="false">DE</button>' +
          "</div>" +
          '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav-panel"><span class="visually-hidden">Menu</span>' + SITE.icon("menu") + "</button>" +
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
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { btn.click(); btn.focus(); } });
  }

  /* ---------- Tipps: kleines „!“ an der Stelle des Tipps, Klick öffnet/schließt ---------- */
  var hintBtns = [];
  function hintLabel(b) {
    var open = b.getAttribute("aria-expanded") === "true";
    var t = SITE.t(open ? { en: "Hide tip", de: "Tipp ausblenden" } : { en: "Show tip", de: "Tipp anzeigen" });
    b.setAttribute("aria-label", t); b.title = t;
  }
  function buildHints() {
    if (!CFG.hints) return;                       /* config.js: hints = false → keine Tipps */
    document.querySelectorAll(".hint").forEach(function (h, i) {
      h.id = h.id || "tip-" + (i + 1);
      var b = document.createElement("button");
      b.type = "button"; b.className = "hint-btn"; b.textContent = "!";
      b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", h.id);
      b.addEventListener("click", function () {
        var open = b.getAttribute("aria-expanded") !== "true";
        b.setAttribute("aria-expanded", String(open));
        h.classList.toggle("is-open", open);
        hintLabel(b);
      });
      h.parentNode.insertBefore(b, h);
      hintBtns.push(b);
    });
    document.addEventListener("langchange", function () { hintBtns.forEach(hintLabel); });
  }

  /* ---------- Fußzeile ---------- */
  function buildFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    var mail = CFG.contactEmail || "kontakt@herrniebel.de";
    host.className = "footer";
    host.innerHTML =
      '<div class="container">' +
        '<div class="footer__grid">' +
          "<div>" +
            '<a class="brand" href="index.html">' + SITE.logo() + "<span>STALL<b>WATT</b></span></a>" +
            '<p style="margin-top:1rem;max-width:340px">' + both({
              en: "Electric heating for barn and farm: brooders, radiant heaters, barn air heaters. Developed and tested at our Auenried plant.",
              de: "Elektrowärme für Stall und Hof: Kükenwärme, Wärmestrahler, Stall-Heizgeräte. Entwickelt und geprüft in unserem Werk Auenried."
            }) + "</p>" +
          "</div>" +
          "<div><h4>" + both({ en: "Products & Planning", de: "Produkte & Planung" }) + "</h4><ul>" +
            '<li><a href="products.html">' + both({ en: "Product range", de: "Produktprogramm" }) + "</a></li>" +
            '<li><a href="technology.html">' + both({ en: "Technology", de: "Technik" }) + "</a></li>" +
            '<li><a href="configurator.html">' + both({ en: "Planning guide", de: "Planungshilfe" }) + "</a></li>" +
            '<li><a href="expert.html">' + both({ en: "Expert know-how", de: "Expertenwissen" }) + "</a></li>" +
          "</ul></div>" +
          "<div><h4>" + both({ en: "For Professionals", de: "Für Fachbetriebe" }) + "</h4><ul>" +
            '<li><a href="project-guide.html">' + both({ en: "Partner Academy", de: "Partner-Akademie" }) + "</a></li>" +
            '<li><a href="support.html">' + both({ en: "Service & FAQ", de: "Service & FAQ" }) + "</a></li>" +
            '<li><a href="request.html">' + both({ en: "Contact", de: "Kontakt" }) + "</a></li>" +
            '<li><a href="about.html">' + both({ en: "Company", de: "Unternehmen" }) + "</a></li>" +
          "</ul></div>" +
        "</div>" +
        '<div class="footer__legal">' +
          "<span>© " + new Date().getFullYear() + " STALLWATT Agrartechnik GmbH · " +
            both({ en: "AI-generated content · for teaching purposes only", de: "KI-generierte Inhalte · ausschließlich für Lehrzwecke" }) +
            ' · <a href="mailto:' + mail + '">' + mail + "</a></span>" +
          '<span><a href="' + ROOT + 'impressum.html">Impressum</a> · <a href="' + ROOT + 'datenschutz.html">Datenschutz</a></span>' +
        "</div>" +
      "</div>";
  }

  /* ---------- optionaler KI-Chat-Reiter ---------- */
  function buildChat() {
    if (!CFG.kiChatUrl) return;
    var a = document.createElement("a");
    a.href = CFG.kiChatUrl; a.target = "_blank"; a.rel = "noopener";
    a.className = "btn btn--hot";
    a.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:60;box-shadow:0 8px 24px rgba(0,0,0,.2)";
    a.innerHTML = SITE.icon("chat") + both({ en: "Ask our tech support", de: "Technik-Support fragen" });
    document.body.appendChild(a);
  }

  /* ---------- Sprache EN (Standard) / DE ohne Cookies und ohne Speicher ---------- */
  var LANGS = ["en", "de"];
  function fromUrl() { var l = new URLSearchParams(location.search).get("lang"); return LANGS.indexOf(l) > -1 ? l : "en"; }
  SITE.lang = function () { return document.documentElement.lang === "de" ? "de" : "en"; };
  SITE.t = function (o) { return o[SITE.lang()] != null ? o[SITE.lang()] : o.en; };
  SITE.fmt = function (x, d) {
    return Number(x).toLocaleString(SITE.lang() === "de" ? "de-DE" : "en-GB", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  };
  SITE.setLang = function (l, updateUrl) {
    var html = document.documentElement;
    html.lang = l;
    var title = html.getAttribute("data-title-" + l); if (title) document.title = title;
    document.querySelectorAll("[data-set-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === l)); });
    if (updateUrl) { var u = new URL(location.href); if (l === "en") u.searchParams.delete("lang"); else u.searchParams.set("lang", l); history.replaceState(null, "", u.href); }
    document.dispatchEvent(new CustomEvent("langchange", { detail: l }));
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-lang]");
    if (b) { SITE.setLang(b.getAttribute("data-set-lang"), true); return; }
    var a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || (SITE.lang() === "en" && WEEK === cfgWeek)) return;
    var href = a.getAttribute("href"); if (/^(#|mailto:|tel:|https?:)/i.test(href)) return;
    var u = new URL(href, location.href);
    if (/\.html$/i.test(u.pathname) && !/(impressum|datenschutz)\.html$/i.test(u.pathname)) {
      if (SITE.lang() === "de") u.searchParams.set("lang", "de");
      if (WEEK < cfgWeek) u.searchParams.set("w", WEEK);      /* früheren Stand über alle Seiten mitnehmen */
      a.href = u.href;
    }
  });

  buildNav();
  buildHints();
  buildFooter();
  buildChat();
  fillIcons();
  SITE.setLang(fromUrl(), false);
})();
