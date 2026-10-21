/* =========================================================================
   LUMIATECH – gemeinsame Seitenlogik
   - Kopfzeile, Navigation und Fußzeile werden hier EINMAL gepflegt und auf
     jeder Seite eingesetzt (<header id="site-header">, <footer id="site-footer">).
   - Neue Seite? Nur das NAV-Array unten ergänzen.
   - Inhaltsverzeichnis (.toc) wird automatisch aus den <section id> mit <h2> erzeugt.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- Navigation: hier neue Seiten eintragen ---------- */
  var NAV = [
    {
      label: "Produkte",
      children: [
        { href: "dioden.html", label: "Silizium-Dioden", sub: "Serie BAY 44, BAY 45, BAY 46" },
        { href: "leds.html", label: "5-mm-LEDs", sub: "Serie L-7113 in Rot, Grün und Blau" }
      ]
    },
    {
      label: "Applikationen",
      children: [
        { href: "dioden-applikation.html", label: "Verpolschutz & Diodenschaltungen", sub: "Dioden richtig einsetzen und berechnen" },
        { href: "led-applikation.html", label: "LEDs richtig betreiben", sub: "Vorwiderstand, Arbeitspunkt, Signalsäulen-Retrofit" }
      ]
    },
    { href: "technologie.html", label: "Technologie" },
    { href: "unternehmen.html", label: "Unternehmen" },
    { href: "downloads.html", label: "Downloads" }
  ];

  var COMPANY = {
    name: "LUMIATECH Semiconductor GmbH",
    street: "Am Kristallfeld 3",
    city: "85276 Pfaffenhofen a. d. Ilm"
  };

  /* ---------- kleine Helfer, auch für die Simulationen ---------- */
  var LT = (window.LT = window.LT || {});
  LT.config = window.LT_CONFIG || { messwerteAnzeigen: false };
  // Ordner dieses Skripts (…/assets/js/), um weitere Skripte bei Bedarf nachzuladen
  var JS_BASE = (document.currentScript && document.currentScript.src || "assets/js/site.js").replace(/site\.js(\?.*)?$/, "");

  LT.$ = function (sel, root) { return (root || document).querySelector(sel); };
  LT.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /** Zahl im deutschen Format: LT.num(1.953, 2) -> "1,95" */
  LT.num = function (v, digits) {
    if (!isFinite(v)) return "–";
    return v.toLocaleString("de-DE", { minimumFractionDigits: digits || 0, maximumFractionDigits: digits || 0 });
  };
  /** Strom mit passender Einheit */
  LT.fmtI = function (amp) {
    var a = Math.abs(amp);
    if (a >= 1) return LT.num(amp, 2) + " A";
    if (a >= 1e-3) return LT.num(amp * 1e3, a >= 0.1 ? 0 : 1) + " mA";
    if (a >= 1e-6) return LT.num(amp * 1e6, 1) + " µA";
    if (a >= 1e-9) return LT.num(amp * 1e9, 0) + " nA";
    return "0 A";
  };
  LT.fmtR = function (ohm) {
    if (ohm >= 1000) return LT.num(ohm / 1000, ohm % 1000 === 0 ? 0 : 1) + " kΩ";
    return LT.num(ohm, 0) + " Ω";
  };
  LT.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  LT.reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Füllstand der Schieberegler (für den Verlauf im Track) */
  LT.paintRange = function (input) {
    var min = +input.min || 0, max = +input.max || 100, v = +input.value;
    input.style.setProperty("--fill", ((v - min) / (max - min)) * 100 + "%");
  };
  document.addEventListener("input", function (e) {
    if (e.target && e.target.type === "range") LT.paintRange(e.target);
  });

  /** SVG-Symbole */
  var ICONS = {
    chevron: '<path d="M3 5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    menu: '<path d="M3 5h14M3 10h14M3 15h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    close: '<path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    download: '<path d="M10 3v10m0 0l-4-4m4 4l4-4M4 16h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    ok: '<circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 10.2l2.4 2.4 4.6-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    warn: '<path d="M10 2.8l8 14H2l8-14z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 8v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14.6" r="1.1" fill="currentColor"/>',
    bad: '<circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    info: '<circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="6.2" r="1.1" fill="currentColor"/>',
    bulb: '<path d="M7 14h6M7.5 17h5M10 2.5a5.2 5.2 0 0 0-3.2 9.3c.5.4.7 1 .7 1.6V14h5v-.6c0-.6.3-1.2.7-1.6A5.2 5.2 0 0 0 10 2.5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    lab: '<path d="M7.5 2.5h5M8.5 2.5v5L3.6 15.4A1.4 1.4 0 0 0 4.8 17.5h10.4a1.4 1.4 0 0 0 1.2-2.1L11.5 7.5v-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M5.5 12.5h9" stroke="currentColor" stroke-width="1.7"/>',
    chart: '<path d="M3 3v14h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M5.5 15c4.5 0 6-1 8-11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    circuit: '<path d="M2 10h4M14 10h4M6 6v8l7-4-7-4zM13 6v8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    chat: '<path d="M3.6 3.8h12.8c.6 0 1.1.5 1.1 1.1v8.2c0 .6-.5 1.1-1.1 1.1H9.2l-4 3.1v-3.1H3.6c-.6 0-1.1-.5-1.1-1.1V4.9c0-.6.5-1.1 1.1-1.1z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="6.8" cy="9" r="1.05" fill="currentColor"/><circle cx="10" cy="9" r="1.05" fill="currentColor"/><circle cx="13.2" cy="9" r="1.05" fill="currentColor"/>',
    external: '<path d="M11.5 3H17v5.5M17 3l-7.5 7.5M14.5 12v3.9c0 .6-.5 1.1-1.1 1.1H4.1c-.6 0-1.1-.5-1.1-1.1V6.6c0-.6.5-1.1 1.1-1.1H8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    copy: '<rect x="7" y="7" width="10" height="10" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M13 7V4.6c0-.9-.7-1.6-1.6-1.6H4.6C3.7 3 3 3.7 3 4.6v6.8c0 .9.7 1.6 1.6 1.6H7" fill="none" stroke="currentColor" stroke-width="1.7"/>'
  };
  LT.icon = function (name, cls) {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : "") + ">" + (ICONS[name] || "") + "</svg>";
  };

  /**
   * Grundgerüst eines Messplatzes (Simulation) in einen Platzhalter schreiben.
   * <div class="lab" data-sim="…" data-title="…" data-hint="…"></div>
   * Rückgabe: { controls, stage, foot }
   */
  LT.lab = function (host, o) {
    o = o || {};
    host.classList.add("lab");
    var title = host.getAttribute("data-title") || o.title || "Simulation";
    var hint = host.getAttribute("data-hint") || o.hint || "";
    host.innerHTML =
      '<div class="lab__head"><h3 class="lab__title">' + LT.icon(o.icon || "lab") + title + "</h3>" +
      (hint ? '<p class="lab__hint">' + hint + "</p>" : "") + "</div>" +
      '<div class="lab__body' + (o.wide ? " lab__body--wide" : o.top ? " lab__body--top" : "") + '">' +
      (o.wide ? "" : '<div class="lab__controls"></div>') +
      '<div class="lab__stage"></div></div>' +
      (o.foot ? '<div class="lab__foot"></div>' : "");
    return { controls: LT.$(".lab__controls", host), stage: LT.$(".lab__stage", host), foot: LT.$(".lab__foot", host) };
  };

  /** Segment-Schalter erzeugen: options [{value,label,html}] */
  LT.segmented = function (parent, label, options, value, onChange) {
    var wrap = document.createElement("div");
    wrap.className = "ctl";
    wrap.innerHTML = (label ? '<span class="ctl__label">' + label + "</span>" : "") + '<div class="seg" role="group" aria-label="' + (label || "Auswahl") + '"></div>';
    var seg = LT.$(".seg", wrap);
    options.forEach(function (op) {
      var b = document.createElement("button");
      b.type = "button";
      b.innerHTML = op.html || op.label;
      b.setAttribute("aria-pressed", String(op.value === value));
      b.addEventListener("click", function () {
        LT.$$("button", seg).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        onChange(op.value);
      });
      b.dataset.value = op.value;
      seg.appendChild(b);
    });
    parent.appendChild(wrap);
    return {
      el: wrap,
      set: function (v) { LT.$$("button", seg).forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.value === String(v))); }); }
    };
  };

  /** Schieberegler mit Beschriftung und Wertanzeige */
  LT.slider = function (parent, o) {
    var wrap = document.createElement("div");
    wrap.className = "ctl";
    var id = "sl-" + Math.random().toString(36).slice(2, 8);
    wrap.innerHTML =
      '<label class="ctl__label" for="' + id + '"><span>' + o.label + '</span><span class="ctl__value"></span></label>' +
      '<input type="range" id="' + id + '" min="' + o.min + '" max="' + o.max + '" step="' + (o.step || 1) + '" value="' + o.value + '">' +
      (o.help ? '<span class="ctl__help">' + o.help + "</span>" : "");
    parent.appendChild(wrap);
    var input = LT.$("input", wrap), out = LT.$(".ctl__value", wrap);
    function upd() {
      out.textContent = o.format ? o.format(+input.value) : input.value;
      LT.paintRange(input);
    }
    input.addEventListener("input", function () { upd(); o.onInput && o.onInput(+input.value); });
    upd();
    return {
      el: wrap, input: input,
      get: function () { return +input.value; },
      set: function (v) { input.value = v; upd(); },
      setRange: function (min, max, step) { input.min = min; input.max = max; if (step) input.step = step; upd(); },
      refresh: upd
    };
  };

  /** Statuszeile: kind = ok | warn | bad | info */
  LT.status = function (el, kind, title, text) {
    var icon = kind === "ok" ? "ok" : kind === "warn" ? "warn" : kind === "bad" ? "bad" : "info";
    el.className = "status" + (kind && kind !== "info" ? " status--" + kind : "");
    el.innerHTML = LT.icon(icon) + "<div><strong>" + title + "</strong>" + (text ? "<span>" + text + "</span>" : "") + "</div>";
  };

  /** Animation nur laufen lassen, wenn sichtbar */
  LT.whenVisible = function (el, onChange) {
    if (!("IntersectionObserver" in window)) { onChange(true); return; }
    new IntersectionObserver(function (en) { onChange(en[0].isIntersecting); }, { threshold: 0.05 }).observe(el);
  };

  /** Logo: Transistorgehäuse mit Diode als Basis und den Lichtpfeilen der LED */
  LT.logo = function () {
    return '<svg class="brand__glyph" viewBox="0 0 40 40" aria-hidden="true">' +
      '<rect x="1" y="1" width="38" height="38" rx="7" fill="#17202b"/><circle cx="18.5" cy="20" r="12" fill="none" stroke="#ffc400" stroke-width="2"/><line x1="3" y1="20" x2="10.5" y2="20" stroke="#ffc400" stroke-width="2"/><path d="M10.5 14 L20.5 20 L10.5 26 Z" fill="#17202b" stroke="#ffc400" stroke-width="2"/><line x1="20.8" y1="13.5" x2="20.8" y2="26.5" stroke="#ffc400" stroke-width="2.4"/><path d="M20.8 16.2 L26.5 11.6 V1 M20.8 23.8 L26.5 28.4 V39" fill="none" stroke="#ffc400" stroke-width="2"/><path d="M27 28.8 l-5.6 -0.9 l2.9 -3.4z" fill="#ffc400"/><path d="M30.2 18.6 L34.6 14.2 M30.8 24.2 L35.2 19.8" stroke="#ffc400" stroke-width="1.7"/><path d="M36.6 12.2 l-4.7 .9 l3.8 3.8z M37.2 17.8 l-4.7 .9 l3.8 3.8z" fill="#ffc400"/>' +
      "</svg>";
  };

  /* ---------- Kopfzeile ---------- */
  var current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (current === "") current = "index.html";

  function buildHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    host.className = "site-header";
    var items = NAV.map(function (item, i) {
      if (item.children) {
        var isCur = item.children.some(function (c) { return c.href === current; });
        var links = item.children
          .map(function (c) {
            return '<a href="' + c.href + '"' + (c.href === current ? ' aria-current="page"' : "") + "><strong>" + c.label + "</strong>" + (c.sub ? "<span>" + c.sub + "</span>" : "") + "</a>";
          })
          .join("");
        return (
          '<div class="nav__item"><button class="nav__toggle' + (isCur ? " is-current" : "") + '" aria-expanded="false" aria-controls="menu-' + i + '">' +
          item.label + LT.icon("chevron") + '</button><div class="nav__menu" id="menu-' + i + '">' + links + "</div></div>"
        );
      }
      return '<div class="nav__item"><a class="nav__link" href="' + item.href + '"' + (item.href === current ? ' aria-current="page"' : "") + ">" + item.label + "</a></div>";
    }).join("");

    host.innerHTML =
      '<a class="skip-link" href="#main">Zum Inhalt springen</a>' +
      '<div class="container site-header__bar">' +
      '<a class="brand" href="index.html" aria-label="LUMIATECH – zur Startseite">' + LT.logo() +
      '<span><span class="brand__name">LUMIATECH</span><span class="brand__claim">Semiconductor GmbH</span></span></a>' +
      '<button class="menu-btn" aria-expanded="false" aria-controls="main-nav">' + LT.icon("menu") + "<span>Menü</span></button>" +
      '<nav class="nav" id="main-nav" aria-label="Hauptnavigation">' + items +
      '<a class="btn btn--litho nav__mobile-cta" href="downloads.html">' + LT.icon("download") + "Datenblätter</a></nav>" +
      '<a class="btn btn--litho btn--small header-cta" href="downloads.html">' + LT.icon("download") + "Datenblätter</a>" +
      "</div>";

    var toggles = LT.$$(".nav__toggle", host);
    function closeAll(except) {
      toggles.forEach(function (t) {
        if (t === except) return;
        t.setAttribute("aria-expanded", "false");
        document.getElementById(t.getAttribute("aria-controls")).classList.remove("is-open");
      });
    }
    toggles.forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = t.getAttribute("aria-expanded") !== "true";
        closeAll(t);
        t.setAttribute("aria-expanded", String(open));
        document.getElementById(t.getAttribute("aria-controls")).classList.toggle("is-open", open);
      });
    });
    document.addEventListener("click", function (e) { if (!host.contains(e.target)) closeAll(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeAll(); menuBtn.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); document.documentElement.classList.remove("nav-open"); }
    });

    var menuBtn = LT.$(".menu-btn", host), nav = LT.$(".nav", host);
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") !== "true";
      menuBtn.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.documentElement.classList.toggle("nav-open", open);
      menuBtn.innerHTML = LT.icon(open ? "close" : "menu") + "<span>" + (open ? "Schließen" : "Menü") + "</span>";
    });
  }

  /* ---------- Fußzeile ---------- */
  function buildFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    host.className = "site-footer";
    var year = new Date().getFullYear();
    host.innerHTML =
      '<div class="container"><div class="footer-grid">' +
      '<div class="footer-brand"><a class="brand" href="index.html">' + LT.logo() +
      '<span><span class="brand__name">LUMIATECH</span><span class="brand__claim">Semiconductor GmbH</span></span></a>' +
      "<address>" + COMPANY.name + "<br>" + COMPANY.street + "<br>" + COMPANY.city + "</address></div>" +
      '<div><h4>Produkte</h4><ul><li><a href="dioden.html">Silizium-Dioden BAY 44/45/46</a></li><li><a href="leds.html">5-mm-LEDs L-7113</a></li><li><a href="downloads.html">Datenblätter</a></li></ul></div>' +
      '<div><h4>Applikationen</h4><ul><li><a href="dioden-applikation.html">Verpolschutz</a></li><li><a href="dioden-applikation.html#schaltungen">Diodenschaltungen</a></li><li><a href="led-applikation.html">LED-Vorwiderstand</a></li><li><a href="led-applikation.html#signalsaeule">Signalsäulen-Retrofit</a></li></ul></div>' +
      '<div><h4>Unternehmen</h4><ul><li><a href="unternehmen.html">Über uns</a></li><li><a href="unternehmen.html#fertigung">Fertigung & Prüfung</a></li><li><a href="unternehmen.html#ausbildung">Ausbildung</a></li><li><a href="technologie.html">Halbleitertechnik</a></li></ul></div>' +
      "</div>" +
      '<div class="footer-bottom"><span>© ' + year + " " + COMPANY.name + "</span><span>Zertifiziert nach ISO 9001, alle Produkte RoHS-konform</span></div>" +
      '<div class="footer-legal"><p>KI-generierte Inhalte. Diese Website dient ausschließlich Lehrzwecken, LUMIATECH ist ein fiktives Unternehmen.</p>' +
      '<p>Impressum: Tobias Niebel · Kontakt und Feedback: <a href="mailto:tobias.niebel@bspaf.de">tobias.niebel@bspaf.de</a></p></div></div>';
  }

  /* ---------- KI-Support: Reiter, Hinweis beim Laden, Fenster mit QR-Code ----------
     Einstellungen in config.js (kiChat). Der QR-Code wird aus dem Link erzeugt
     (assets/js/vendor/qrcode.js, wird erst beim Öffnen des Fensters geladen). */
  function buildSupport() {
    var cfg = LT.config.kiChat || {};
    var url = cfg.url;
    if (!url || document.getElementById("support")) return;
    var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); };
    var U = esc(url);

    var wrap = document.createElement("div");
    wrap.className = "support";
    wrap.id = "support";
    wrap.innerHTML =
      '<button class="support-tab" type="button" aria-haspopup="dialog" aria-controls="support-dialog">' + LT.icon("chat") +
      '<span class="support-tab__long">Fragen? KI-Chat</span><span class="support-tab__short">Fragen?</span></button>' +
      '<div class="support-teaser" aria-live="polite">' +
      '<button class="support-teaser__close" type="button" aria-label="Hinweis schließen">' + LT.icon("close") + "</button>" +
      "<strong>Fragen zu Dioden oder LEDs?</strong>" +
      "<p>Unser KI-Support beantwortet sie direkt im Chat.</p>" +
      '<button class="btn btn--litho btn--small support-teaser__open" type="button">' + LT.icon("chat") + "Chat öffnen</button></div>";
    document.body.appendChild(wrap);

    var dlg = document.createElement("dialog");
    dlg.className = "support-dialog";
    dlg.id = "support-dialog";
    dlg.setAttribute("aria-labelledby", "support-title");
    dlg.innerHTML =
      '<div class="support-dialog__inner">' +
      '<div class="support-dialog__head"><span class="support-dialog__badge">' + LT.icon("chat") + "</span>" +
      '<div><span class="kicker">Technischer Support</span><h2 id="support-title">Stellen Sie Ihre Fragen im Chat</h2></div>' +
      '<button class="support-dialog__close" type="button" aria-label="Fenster schließen">' + LT.icon("close") + "</button></div>" +
      '<div class="support-dialog__body">' +
      '<figure class="support-qr"><div class="support-qr__code"><span class="support-qr__wait">QR-Code wird erzeugt …</span></div>' +
      '<figcaption>Mit der Smartphone-Kamera scannen</figcaption>' +
      '<a class="support-qr__save" href="#" download="KI-Chat_QR-Code.svg" hidden>QR-Code speichern</a></figure>' +
      '<div class="support-dialog__text">' +
      "<p>Unser KI-Assistent hilft bei Fragen zu Dioden, LEDs, Kennlinien, Vorwiderständen und unseren Applikationen.</p>" +
      '<a class="btn btn--litho support-dialog__go" href="' + U + '" target="_blank" rel="noopener">' + LT.icon("external") + "Chat im neuen Tab öffnen</a>" +
      '<div class="support-link"><span class="support-link__label">Link zum Chat</span>' +
      '<a class="support-link__url" href="' + U + '" target="_blank" rel="noopener">' + esc(url.replace(/^https?:\/\//, "")) + "</a>" +
      '<button class="support-link__copy" type="button">' + LT.icon("copy") + '<span>Link kopieren</span></button></div>' +
      '<p class="support-dialog__note">' + LT.icon("info") + "<span>Der Chat ist ein KI-Assistent. Antworten können Fehler enthalten – wichtige Werte bitte im Datenblatt prüfen.</span></p>" +
      "</div></div></div>";
    document.body.appendChild(dlg);

    var tab = LT.$(".support-tab", wrap), teaser = LT.$(".support-teaser", wrap), timer = null;
    function hideTeaser() { clearTimeout(timer); wrap.classList.remove("show-teaser"); }
    function open() {
      hideTeaser();
      renderQR();
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      tab.setAttribute("aria-expanded", "true");
    }
    function close() {
      if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
    }
    dlg.addEventListener("close", function () { tab.setAttribute("aria-expanded", "false"); });
    tab.addEventListener("click", open);
    LT.$(".support-teaser__open", wrap).addEventListener("click", open);
    LT.$(".support-teaser__close", wrap).addEventListener("click", hideTeaser);
    LT.$(".support-dialog__close", dlg).addEventListener("click", close);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); }); // Klick neben das Fenster

    // Link kopieren
    var copyBtn = LT.$(".support-link__copy", dlg), copyLabel = LT.$("span", copyBtn);
    copyBtn.addEventListener("click", function () {
      function done(ok) {
        copyLabel.textContent = ok ? "Kopiert" : "Bitte manuell kopieren";
        copyBtn.classList.toggle("is-done", ok);
        setTimeout(function () { copyLabel.textContent = "Link kopieren"; copyBtn.classList.remove("is-done"); }, 2200);
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

    // QR-Code aus dem Link erzeugen (Bibliothek erst bei Bedarf laden)
    var qrDone = false;
    function renderQR() {
      if (qrDone) return;
      var host = LT.$(".support-qr__code", dlg);
      function draw() {
        try {
          var q = window.qrcode(0, "M");
          q.addData(url); q.make();
          var n = q.getModuleCount(), b = 4, size = n + 2 * b, d = "";
          for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += "M" + (c + b) + " " + (r + b) + "h1v1h-1z";
          var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size + '" shape-rendering="crispEdges" role="img" aria-label="QR-Code zum KI-Support-Chat">' +
            '<rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="#17202b"/></svg>';
          host.innerHTML = svg;
          var save = LT.$(".support-qr__save", dlg);
          save.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
          save.hidden = false;
          qrDone = true;
        } catch (err) { fail(); }
      }
      function fail() { host.innerHTML = '<span class="support-qr__wait">QR-Code nicht verfügbar – bitte den Link nutzen.</span>'; }
      if (window.qrcode) { draw(); return; }
      var s = document.createElement("script");
      s.src = JS_BASE + "vendor/qrcode.js";
      s.onload = draw; s.onerror = fail;
      document.head.appendChild(s);
    }

    // Hinweis beim Laden der Seite
    if (cfg.hinweisBeimLaden !== false) {
      setTimeout(function () {
        if (dlg.open) return;
        wrap.classList.add("show-teaser");
        var sec = cfg.hinweisSekunden === undefined ? 10 : +cfg.hinweisSekunden;
        if (sec > 0) timer = setTimeout(hideTeaser, sec * 1000);
      }, 1200);
      // solange die Maus auf dem Hinweis ist, nicht automatisch schließen
      teaser.addEventListener("mouseenter", function () { clearTimeout(timer); });
      teaser.addEventListener("focusin", function () { clearTimeout(timer); });
    }
  }

  /* ---------- Inhaltsverzeichnis für lange Seiten ---------- */
  function buildToc() {
    LT.$$("[data-toc]").forEach(function (toc) {
      var root = LT.$(toc.getAttribute("data-toc"));
      if (!root) return;
      var sections = LT.$$(":scope > section[id]", root);
      var html = '<div class="toc__title">Auf dieser Seite</div><ol>' +
        sections.map(function (s) {
          var h = LT.$("h2", s);
          var label = s.getAttribute("data-toc-label") || (h ? h.textContent : s.id);
          return '<li><a href="#' + s.id + '">' + label + "</a></li>";
        }).join("") + "</ol>";
      toc.innerHTML = html;
      var links = LT.$$("a", toc);
      if (!("IntersectionObserver" in window)) return;
      var visible = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
        var firstVisible = sections.filter(function (s) { return visible[s.id]; })[0];
        if (!firstVisible) return;
        links.forEach(function (a) { a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + firstVisible.id)); });
      }, { rootMargin: "-20% 0px -60% 0px" });
      sections.forEach(function (s) { io.observe(s); });
    });
  }

  /* ---------- Hotspot-Abbildungen (Klick zeigt Erklärung) ---------- */
  function initHotspots() {
    LT.$$("[data-hotspots]").forEach(function (wrap) {
      var out = LT.$(wrap.getAttribute("data-hotspots"));
      var spots = LT.$$(".hotspot", wrap);
      function show(btn) {
        spots.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        var tpl = LT.$("#" + btn.getAttribute("data-info"));
        if (out && tpl) out.innerHTML = tpl.innerHTML;
        wrap.dispatchEvent(new CustomEvent("hotspot", { detail: btn.getAttribute("data-info") }));
      }
      spots.forEach(function (b) {
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () { show(b); });
      });
    });
  }

  function init() {
    buildHeader();
    buildFooter();
    buildSupport();
    buildToc();
    initHotspots();
    LT.$$('input[type="range"]').forEach(LT.paintRange);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
