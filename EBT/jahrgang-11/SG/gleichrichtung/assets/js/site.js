/* =========================================================================
   WATT AUF ACHSE – gemeinsame Bausteine
   - Navigation (NAV-Array), Fußzeile, Symbole, Inhaltsverzeichnis
   - Sprache EN (Standard) / DE ohne Cookies und ohne Speicher im Browser
   - Unterrichtswoche (week.js) und Lehrer-Schalter (config.js)
   - Schrauber-Chat: KI-Chat-Reiter mit QR-Code
   Neue Seite? Nur das NAV-Array ergänzen (week: N = erst ab Woche N).
   ========================================================================= */
(function () {
  "use strict";
  var SITE = (window.SITE = window.SITE || {});
  var ROOT = "../../../../";                       // Repo-Wurzel: Impressum, Datenschutz
  var JS_BASE = (function () {                      // Ordner dieser Datei (für vendor/qrcode.js)
    var s = document.querySelector('script[src*="assets/js/site.js"]');
    return s ? s.getAttribute("src").replace(/site\.js.*$/, "") : "assets/js/";
  })();
  SITE.config = window.WAA_CONFIG || {};
  var WK = window.WAA_WEEK || { week: 1, configured: 1, open: function () { return true; } };
  SITE.week = WK.week;
  SITE.open = WK.open;
  SITE.values = !!SITE.config.messwerteAnzeigen;

  var NAV = [
    { href: "index.html", en: "Blog", de: "Blog" },
    { href: "basics.html", en: "How it works", de: "So funktioniert’s" },
    { href: "parts.html", en: "Parts corner", de: "Bauteil-Ecke" },
    { href: "small-wind.html", en: "Advanced", de: "Für Fortgeschrittene", week: 2 },
    { href: "about.html", en: "About me", de: "Über mich" }
  ];

  /* ---------- Symbole (eigene Zeichnungen, 24 × 24) ---------- */
  var P = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    menu: '<path d="M4 7h16M4 12h16M4 17h16" ' + P + '/>',
    close: '<path d="M6 6l12 12M18 6L6 18" ' + P + '/>',
    check: '<path d="M4 12.5l5 5L20 6.5" ' + P + '/>',
    warn: '<path d="M12 3.5L2.5 20h19L12 3.5z" ' + P + '/><path d="M12 10v4.5" ' + P + '/><circle cx="12" cy="17.2" r="1.1" fill="currentColor"/>',
    bad: '<circle cx="12" cy="12" r="9" ' + P + '/><path d="M9 9l6 6M15 9l-6 6" ' + P + '/>',
    info: '<circle cx="12" cy="12" r="9" ' + P + '/><path d="M12 11v6" ' + P + '/><circle cx="12" cy="7.6" r="1.1" fill="currentColor"/>',
    chat: '<path d="M4 5h16v11H9l-5 4V5z" ' + P + '/><path d="M8 9.5h8M8 12.5h5" ' + P + '/>',
    wrench: '<path d="M14.5 5.5a4 4 0 0 0 4.9 4.9l-8.9 8.9a2.1 2.1 0 0 1-3-3l8.9-8.9a4 4 0 0 1-1.9-1.9z" ' + P + '/><path d="M15 3.8a4 4 0 0 1 5.2 5.2l-2.6-.6-.6-2.6z" ' + P + '/>',
    scope: '<rect x="3" y="4" width="18" height="13" rx="2" ' + P + '/><path d="M6 13c1.5-6 3-6 4.5 0s3 6 4.5 0 1.5-3 3-3M8 21h8" ' + P + '/>',
    bolt: '<path d="M13 2L5 14h6l-1 8 8-12h-6l1-8z" ' + P + '/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" ' + P + '/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2" ' + P + '/><path d="M5 15V5a1 1 0 0 1 1-1h10" ' + P + '/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M4 20h16" ' + P + '/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6" ' + P + '/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6" ' + P + '/>',
    wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7" ' + P + '/>',
    sun: '<circle cx="12" cy="12" r="4" ' + P + '/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5" ' + P + '/>',
    led: '<path d="M8 14V9a4 4 0 0 1 8 0v5H8zM6 14h12M10 14v6M14 14v4" ' + P + '/>'
  };
  SITE.icon = function (name, cls) {
    return '<svg class="ico' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  };
  function fillIcons(root) {
    (root || document).querySelectorAll("i[data-icon]").forEach(function (el) {
      el.outerHTML = SITE.icon(el.getAttribute("data-icon"), el.getAttribute("class"));
    });
  }
  function both(o) { return '<span data-lang="en">' + o.en + '</span><span data-lang="de">' + o.de + "</span>"; }
  SITE.both = both;
  SITE.$ = function (s, r) { return (r || document).querySelector(s); };
  SITE.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var BRAND = '<img src="assets/img/logo-mark.svg" width="38" height="38" alt=""><span>WATT<small>AUF</small>ACHSE</span>';

  /* ---------- Navigation ---------- */
  function buildNav() {
    var host = document.getElementById("site-nav");
    if (!host) return;
    var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    var links = NAV.filter(function (n) { return !n.week || SITE.open(n.week); }).map(function (n) {
      return '<a href="' + n.href + '"' + (n.href === here ? ' aria-current="page"' : "") + ">" + both(n) + "</a>";
    }).join("");
    host.outerHTML =
      '<nav class="nav" aria-label="Main">' +
        '<div class="container nav__bar">' +
          '<a class="brand" href="index.html" aria-label="Watt auf Achse – Blog">' + BRAND + "</a>" +
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
        '<a class="brand" href="index.html">' + BRAND + "</a>" +
        '<div class="footer__text">' +
          "<p>© " + year + " Kathi · Watt auf Achse – " + both({ en: "self-built power for bike, hut &amp; trail", de: "selbstgebauter Strom für Rad, Hütte &amp; Trail" }) + "</p>" +
          "<p>" + both({ en: "AI-generated content · for teaching purposes only", de: "KI-generierte Inhalte · ausschließlich für Lehrzwecke" }) +
          ' · <a href="mailto:kontakt@herrniebel.de">kontakt@herrniebel.de</a></p>' +
        "</div>" +
      "</div>" +
      '<p class="footer__legal"><a href="' + ROOT + 'impressum.html">Impressum</a> · <a href="' + ROOT + 'datenschutz.html">Datenschutz</a></p>';
  }

  /* ---------- Inhaltsverzeichnis: <nav data-toc></nav> ---------- */
  function buildToc() {
    SITE.$$("[data-toc]").forEach(function (toc) {
      var heads = SITE.$$(".article h2[id]").filter(function (h) {
        var w = h.closest("[data-week]:not(html)"), m = h.closest("[data-week-max]");
        return (!w || SITE.open(+w.getAttribute("data-week"))) && (!m || SITE.week <= +m.getAttribute("data-week-max"));
      });
      if (heads.length < 3) { toc.hidden = true; return; }
      toc.className = "toc";
      toc.innerHTML = both({ en: "In this post", de: "In diesem Beitrag" }) + "<ol>" + heads.map(function (h) {
        return '<li><a href="#' + h.id + '">' + h.innerHTML + "</a></li>";
      }).join("") + "</ol>";
    });
  }

  /* ---------- Sprache EN (Standard) / DE ---------- */
  var LANGS = ["en", "de"];
  function fromUrl() { var l = new URLSearchParams(location.search).get("lang"); return LANGS.indexOf(l) > -1 ? l : "en"; }
  SITE.lang = function () { return document.documentElement.lang === "de" ? "de" : "en"; };
  SITE.t = function (o) { return o[SITE.lang()] != null ? o[SITE.lang()] : o.en; };
  SITE.num = function (x, d) {                     // Zahl mit Dezimalkomma im Deutschen
    var s = (+x).toFixed(d == null ? 1 : d);
    return SITE.lang() === "de" ? s.replace(".", ",") : s;
  };
  SITE.setLang = function (l, updateUrl) {
    var html = document.documentElement;
    html.lang = l;
    var title = html.getAttribute("data-title-" + l); if (title) document.title = title;
    document.querySelectorAll("[data-set-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === l)); });
    if (updateUrl) { var u = new URL(location.href); if (l === "en") u.searchParams.delete("lang"); else u.searchParams.set("lang", l); history.replaceState(null, "", u.href); }
    // Zahlen in Tabellenzellen (.num) stehen im HTML mit Dezimalkomma; im Englischen mit Punkt
    document.querySelectorAll(".num").forEach(function (el) {
      if (!el.hasAttribute("data-de")) el.setAttribute("data-de", el.innerHTML);
      var de = el.getAttribute("data-de");
      el.innerHTML = l === "de" ? de : de.replace(/(\d),(\d)/g, "$1.$2");
    });
    document.dispatchEvent(new CustomEvent("langchange", { detail: l }));
  };
  // interne Links nehmen Sprache (?lang=de) und früheren Wochenstand (?w=) mit
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-lang]");
    if (b) { SITE.setLang(b.getAttribute("data-set-lang"), true); return; }
    var a = e.target.closest("a[href]");
    if (!a || a.target === "_blank") return;
    var href = a.getAttribute("href"); if (/^(#|mailto:|tel:|https?:)/i.test(href)) return;
    var u = new URL(href, location.href);
    if (!/\.html$/i.test(u.pathname) || /(impressum|datenschutz)\.html$/i.test(u.pathname)) return;
    if (SITE.lang() === "de") u.searchParams.set("lang", "de");
    if (WK.week < WK.configured) u.searchParams.set("w", WK.week);
    a.href = u.href;
  });

  /* ---------- Leserkommentare: Lehrer-Schalter tippsMarkieren ---------- */
  function verdicts() {
    if (!SITE.config.tippsMarkieren) return;
    SITE.$$(".comments").forEach(function (c) { c.classList.add("show-verdicts"); });
  }

  /* ---------- Schrauber-Chat (KI) ---------- */
  function buildSupport() {
    var cfg = SITE.config.kiChat || {};
    var url = cfg.url;
    if (!url || document.getElementById("support")) return;
    var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); };
    var U = esc(url);
    var topics = SITE.open(2)
      ? { en: "AC, diodes, LEDs, rectifiers, Schottky vs. silicon, generators and measuring with the scope", de: "Wechselspannung, Dioden, LEDs, Gleichrichter, Schottky vs. Silizium, Generatoren und Messen mit dem Oszi" }
      : { en: "AC, diodes, LEDs, half-wave rectifiers and measuring with the scope", de: "Wechselspannung, Dioden, LEDs, Einweggleichrichter und Messen mit dem Oszi" };

    var wrap = document.createElement("div");
    wrap.className = "support";
    wrap.id = "support";
    wrap.innerHTML =
      '<button class="support-tab" type="button" aria-haspopup="dialog" aria-controls="support-dialog">' + SITE.icon("wrench") +
      '<span class="support-tab__long">Schrauber-Chat</span><span class="support-tab__short">Schrauber-Chat</span></button>' +
      '<div class="support-teaser" aria-live="polite">' +
      '<button class="support-teaser__close" type="button" aria-label="Close / Schließen">' + SITE.icon("close") + "</button>" +
      "<strong>" + both({ en: "Stuck at the workbench?", de: "Hängst du fest?" }) + "</strong>" +
      "<p>" + both({ en: "Ask the Schrauber-Chat – my AI workshop assistant answers right away.", de: "Frag im Schrauber-Chat – mein KI-Werkstattassistent antwortet sofort." }) + "</p>" +
      '<button class="btn btn--small support-teaser__open" type="button">' + SITE.icon("chat") + both({ en: "Open chat", de: "Chat öffnen" }) + "</button></div>";
    document.body.appendChild(wrap);

    var dlg = document.createElement("dialog");
    dlg.className = "support-dialog";
    dlg.id = "support-dialog";
    dlg.setAttribute("aria-labelledby", "support-title");
    dlg.innerHTML =
      '<div class="support-dialog__head"><span class="support-dialog__badge">' + SITE.icon("wrench") + "</span>" +
      '<div><span class="kicker">' + both({ en: "Ask me!", de: "Frag mich!" }) + '</span><h2 id="support-title">Schrauber-Chat</h2></div>' +
      '<button class="support-dialog__close" type="button" aria-label="Close / Schließen">' + SITE.icon("close") + "</button></div>" +
      '<div class="support-dialog__body">' +
      '<figure class="support-qr"><div class="support-qr__code"><span>QR …</span></div>' +
      "<figcaption>" + both({ en: "Scan with your phone camera", de: "Mit der Handykamera scannen" }) + "</figcaption>" +
      '<a class="support-qr__save" href="#" download="Schrauber-Chat_QR.svg" hidden>' + both({ en: "Save QR code", de: "QR-Code speichern" }) + "</a></figure>" +
      '<div class="support-dialog__text">' +
      "<p>" + both({ en: "My AI workshop assistant knows my projects and helps with " + topics.en + ". It asks back instead of handing you finished solutions – that’s how you learn the craft.", de: "Mein KI-Werkstattassistent kennt meine Projekte und hilft bei " + topics.de + ". Er fragt lieber zurück, als dir fertige Lösungen hinzulegen – so lernst du das Handwerk." }) + "</p>" +
      '<a class="btn support-dialog__go" href="' + U + '" target="_blank" rel="noopener">' + SITE.icon("external") + both({ en: "Open chat in new tab", de: "Chat im neuen Tab öffnen" }) + "</a>" +
      '<div class="support-link"><span class="support-link__label">' + both({ en: "Link to the chat", de: "Link zum Chat" }) + "</span>" +
      '<a class="support-link__url" href="' + U + '" target="_blank" rel="noopener">' + esc(url.replace(/^https?:\/\//, "")) + "</a>" +
      '<button class="support-link__copy" type="button">' + SITE.icon("copy") + '<span class="copy-label">' + both({ en: "Copy link", de: "Link kopieren" }) + "</span></button></div>" +
      '<p class="support-dialog__note">' + SITE.icon("info") + both({ en: "AI assistant – it can be wrong. Always check values in the datasheet. Please don’t type in any personal data.", de: "KI-Assistent – kann sich irren. Werte immer im Datenblatt checken. Bitte keine persönlichen Daten eingeben." }) + "</p>" +
      "</div></div>";
    document.body.appendChild(dlg);

    var tab = SITE.$(".support-tab", wrap), teaser = SITE.$(".support-teaser", wrap), timer = null;
    function hideTeaser() { clearTimeout(timer); wrap.classList.remove("show-teaser"); }
    function open() {
      hideTeaser(); renderQR();
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      tab.setAttribute("aria-expanded", "true");
    }
    function close() { if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open"); }
    dlg.addEventListener("close", function () { tab.setAttribute("aria-expanded", "false"); });
    tab.addEventListener("click", open);
    SITE.$(".support-teaser__open", wrap).addEventListener("click", open);
    SITE.$(".support-teaser__close", wrap).addEventListener("click", hideTeaser);
    SITE.$(".support-dialog__close", dlg).addEventListener("click", close);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });

    var copyBtn = SITE.$(".support-link__copy", dlg), copyLabel = SITE.$(".copy-label", copyBtn), copyHtml = copyLabel.innerHTML;
    copyBtn.addEventListener("click", function () {
      function done(ok) {
        copyLabel.innerHTML = ok ? both({ en: "Copied", de: "Kopiert" }) : both({ en: "Please copy manually", de: "Bitte manuell kopieren" });
        copyBtn.classList.toggle("is-done", ok);
        setTimeout(function () { copyLabel.innerHTML = copyHtml; copyBtn.classList.remove("is-done"); }, 2200);
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = url; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        dlg.appendChild(ta); ta.select();
        var ok = false; try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
        dlg.removeChild(ta); done(ok);
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(function () { done(true); }, fallback);
      else fallback();
    });

    var qrDone = false;
    function renderQR() {
      if (qrDone) return;
      var host = SITE.$(".support-qr__code", dlg);
      function draw() {
        try {
          var q = window.qrcode(0, "M");
          q.addData(url); q.make();
          var n = q.getModuleCount(), b = 4, size = n + 2 * b, d = "";
          for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += "M" + (c + b) + " " + (r + b) + "h1v1h-1z";
          var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size + '" shape-rendering="crispEdges" role="img" aria-label="QR code Schrauber-Chat">' +
            '<rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="#1d2520"/></svg>';
          host.innerHTML = svg;
          var save = SITE.$(".support-qr__save", dlg);
          save.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
          save.hidden = false;
          qrDone = true;
        } catch (err) { fail(); }
      }
      function fail() { host.innerHTML = "<span>" + both({ en: "QR code not available – please use the link.", de: "QR-Code nicht verfügbar – bitte den Link nutzen." }) + "</span>"; }
      if (window.qrcode) { draw(); return; }
      var s = document.createElement("script");
      s.src = JS_BASE + "vendor/qrcode.js";
      s.onload = draw; s.onerror = fail;
      document.head.appendChild(s);
    }

    if (cfg.hinweisBeimLaden !== false) {
      setTimeout(function () {
        if (dlg.open) return;
        wrap.classList.add("show-teaser");
        var sec = cfg.hinweisSekunden === undefined ? 10 : +cfg.hinweisSekunden;
        if (sec > 0) timer = setTimeout(hideTeaser, sec * 1000);
      }, 1500);
      teaser.addEventListener("mouseenter", function () { clearTimeout(timer); });
      teaser.addEventListener("focusin", function () { clearTimeout(timer); });
    }
  }

  buildNav();
  buildFooter();
  fillIcons();
  verdicts();
  SITE.setLang(fromUrl(), false);
  buildToc();
  buildSupport();
  document.dispatchEvent(new CustomEvent("siteready"));
})();
