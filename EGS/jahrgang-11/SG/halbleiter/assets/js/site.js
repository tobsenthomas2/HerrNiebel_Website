/* =========================================================================
   LUMIATECH – gemeinsame Seitenlogik
   - Kopfzeile, Navigation und Fußzeile werden hier EINMAL gepflegt und auf
     jeder Seite eingesetzt (<header id="site-header">, <footer id="site-footer">).
   - Neue Seite? Nur das NAV-Array unten ergänzen.
   - Inhaltsverzeichnis (.toc) wird automatisch aus den <section id> mit <h2> erzeugt.
   - Unterrichtswoche: Einträge mit thema: "leds" erscheinen erst, wenn das Thema
     in config.js freigeschaltet ist (Logik in woche.js).
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- Sprache (lang.js): Englisch ist Standard, Deutsch über ?lang=de ----------
     Texte in den Seiten: <span data-lang="en">…</span><span data-lang="de">…</span>
     Texte in Skripten:   T("English", "Deutsch")
     Attribute:           aria-label="EN" data-de-aria-label="DE" (auch alt, data-title, data-hint, data-toc-label) */
  var LT = (window.LT = window.LT || {});
  if (!LT.t) { LT.lang = "en"; LT.langGewaehlt = true; LT.t = function (en) { return en; }; }
  var T = LT.t;

  /* ---------- Navigation: hier neue Seiten eintragen ---------- */
  var NAV = [
    {
      label: T("Products", "Produkte"),
      children: [
        { href: "dioden.html", label: T("Silicon diodes", "Silizium-Dioden"), sub: T("Series BAY 44, BAY 45, BAY 46", "Serie BAY 44, BAY 45, BAY 46") },
        { href: "leds.html", label: T("5 mm LEDs", "5-mm-LEDs"), sub: T("Series L-7113 in red, green and blue", "Serie L-7113 in Rot, Grün und Blau"), thema: "leds" },
        { href: "standardtypen.html", label: T("Standard types", "Standardtypen"), sub: T("1N4001 … 1N4007, Schottky 1N5817 … 1N5819, power LED", "1N4001 … 1N4007, Schottky 1N5817 … 1N5819, Power-LED") }
      ]
    },
    {
      label: T("Applications", "Applikationen"),
      children: [
        { href: "dioden-applikation.html", label: T("Reverse polarity protection & diode circuits", "Verpolschutz & Diodenschaltungen"), sub: T("Using and calculating diodes correctly", "Dioden richtig einsetzen und berechnen") },
        { href: "led-applikation.html", label: T("Operating LEDs correctly", "LEDs richtig betreiben"), sub: T("Series resistor, operating point, signal tower retrofit", "Vorwiderstand, Arbeitspunkt, Signalsäulen-Retrofit"), thema: "leds" }
      ]
    },
    { href: "technologie.html", label: T("Technology", "Technologie") },
    { href: "unternehmen.html", label: T("Company", "Unternehmen") },
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
  /* Unterrichtswoche (woche.js): LT.frei("leds") → ist das Thema schon freigeschaltet? */
  var WOCHE = window.LT_WOCHE || { woche: 1, eingestellt: 1, frei: function () { return true; } };
  /* Revisionsnummer in der Fußzeile (für die Lehrkraft): „Rev. 1.3“ = angezeigte Woche 1, höchste Woche 3.
     Die höchste Woche ergibt sich aus config.js (woche und themen). */
  function rev() {
    var cfg = window.LT_CONFIG || {}, max = Math.max(1, WOCHE.eingestellt || 1, +cfg.woche || 1);
    var th = cfg.themen || {};
    Object.keys(th).forEach(function (k) { max = Math.max(max, +th[k] || 0); });
    return (WOCHE.woche || 1) + "." + max;
  }
  LT.woche = WOCHE.woche;
  LT.frei = WOCHE.frei;
  function sichtbar(item) { return !item.thema || LT.frei(item.thema); }
  var NAV_FREI = NAV.map(function (item) {
    if (!item.children) return item;
    var c = item.children.filter(sichtbar);
    return c.length ? { label: item.label, children: c } : null;
  }).filter(function (item) { return item && sichtbar(item); });
  // Ordner dieses Skripts (…/assets/js/), um weitere Skripte bei Bedarf nachzuladen
  var JS_BASE = (document.currentScript && document.currentScript.src || "assets/js/site.js").replace(/site\.js(\?.*)?$/, "");

  LT.$ = function (sel, root) { return (root || document).querySelector(sel); };
  LT.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* deutsche Fassung der Attribute einsetzen (vor dem Start der Simulationen) */
  if (LT.lang === "de") {
    ["aria-label", "alt", "data-title", "data-hint", "data-toc-label"].forEach(function (n) {
      LT.$$("[data-de-" + n + "]").forEach(function (el) { el.setAttribute(n, el.getAttribute("data-de-" + n)); });
    });
  }
  /** Text eines Elements in der aktuellen Sprache (ohne die andere Sprachfassung) */
  LT.text = function (el) {
    var c = el.cloneNode(true);
    LT.$$("[data-lang]", c).forEach(function (x) { if (x.getAttribute("data-lang") !== LT.lang) x.parentNode.removeChild(x); });
    return c.textContent;
  };

  /** Zahl im Format der Sprache: LT.num(1.953, 2) -> "1.95" (en) bzw. "1,95" (de) */
  LT.num = function (v, digits) {
    if (!isFinite(v)) return "–";
    return v.toLocaleString(LT.lang === "de" ? "de-DE" : "en-US", { minimumFractionDigits: digits || 0, maximumFractionDigits: digits || 0 });
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
    circuit: '<path d="M2 10h16M6 6v8l7-4-7-4zM13 6v8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    chat: '<path d="M3.6 3.8h12.8c.6 0 1.1.5 1.1 1.1v8.2c0 .6-.5 1.1-1.1 1.1H9.2l-4 3.1v-3.1H3.6c-.6 0-1.1-.5-1.1-1.1V4.9c0-.6.5-1.1 1.1-1.1z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="6.8" cy="9" r="1.05" fill="currentColor"/><circle cx="10" cy="9" r="1.05" fill="currentColor"/><circle cx="13.2" cy="9" r="1.05" fill="currentColor"/>',
    external: '<path d="M11.5 3H17v5.5M17 3l-7.5 7.5M14.5 12v3.9c0 .6-.5 1.1-1.1 1.1H4.1c-.6 0-1.1-.5-1.1-1.1V6.6c0-.6.5-1.1 1.1-1.1H8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    globe: '<circle cx="10" cy="10" r="7.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M2.4 10h15.2M10 2.4c2.3 2.1 3.5 4.6 3.5 7.6s-1.2 5.5-3.5 7.6c-2.3-2.1-3.5-4.6-3.5-7.6S7.7 4.5 10 2.4z" fill="none" stroke="currentColor" stroke-width="1.7"/>',
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
    wrap.innerHTML = (label ? '<span class="ctl__label">' + label + "</span>" : "") + '<div class="seg" role="group" aria-label="' + (label || T("Selection", "Auswahl")) + '"></div>';
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
    var items = NAV_FREI.map(function (item, i) {
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
      '<a class="skip-link" href="#main">' + T('Skip to content', 'Zum Inhalt springen') + '</a>' +
      '<div class="container site-header__bar">' +
      '<a class="brand" href="index.html" aria-label="' + T('LUMIATECH – to the home page', 'LUMIATECH – zur Startseite') + '">' + LT.logo() +
      '<span><span class="brand__name">LUMIATECH</span><span class="brand__claim">Semiconductor GmbH</span></span></a>' +
      '<button class="menu-btn" aria-expanded="false" aria-controls="main-nav">' + LT.icon("menu") + "" + T("<span>Menu</span>", "<span>Menü</span>") + "</button>" +
      '<nav class="nav" id="main-nav" aria-label="' + T('Main navigation', 'Hauptnavigation') + '">' + items +
      '<a class="btn btn--litho nav__mobile-cta" href="downloads.html">' + LT.icon("download") + "" + T("Data sheets</a>", "Datenblätter</a>") + "</nav>" +
      '<a class="btn btn--litho btn--small header-cta" href="downloads.html">' + LT.icon("download") + "" + T("Data sheets</a>", "Datenblätter</a>") + "" +
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
      menuBtn.innerHTML = LT.icon(open ? "close" : "menu") + "<span>" + (open ? T("Close", "Schließen") : T("Menu", "Menü")) + "</span>";
    });
  }

  /* ---------- Fußzeile ---------- */
  function buildFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    host.className = "site-footer";
    var year = new Date().getFullYear();
    function links(list) {
      return list.filter(function (l) { return !l[2] || LT.frei(l[2]); })
        .map(function (l) { return '<li><a href="' + l[0] + '">' + l[1] + "</a></li>"; }).join("");
    }
    host.innerHTML =
      '<div class="container"><div class="footer-grid">' +
      '<div class="footer-brand"><a class="brand" href="index.html">' + LT.logo() +
      '<span><span class="brand__name">LUMIATECH</span><span class="brand__claim">Semiconductor GmbH</span></span></a>' +
      "<address>" + COMPANY.name + "<br>" + COMPANY.street + "<br>" + COMPANY.city + "</address></div>" +
      '<div><h4>' + T("Products", "Produkte") + '</h4><ul>' + links([["dioden.html", T("Silicon diodes BAY 44/45/46", "Silizium-Dioden BAY 44/45/46")], ["leds.html", T("5 mm LEDs L-7113", "5-mm-LEDs L-7113"), "leds"], ["standardtypen.html", T("Standard types", "Standardtypen")], ["downloads.html", T("Data sheets", "Datenblätter")]]) + "</ul></div>" +
      '<div><h4>' + T("Applications", "Applikationen") + '</h4><ul>' + links([["dioden-applikation.html", T("Reverse polarity protection", "Verpolschutz")], ["dioden-applikation.html#schaltungen", T("Diode circuits", "Diodenschaltungen")], ["led-applikation.html", T("LED series resistor", "LED-Vorwiderstand"), "leds"], ["led-applikation.html#signalsaeule", T("Signal tower retrofit", "Signalsäulen-Retrofit"), "leds"]]) + "</ul></div>" +
      '<div><h4>' + T("Company", "Unternehmen") + '</h4><ul><li><a href="unternehmen.html">' + T("About us", "Über uns") + '</a></li><li><a href="unternehmen.html#fertigung">' + T("Manufacturing & testing", "Fertigung & Prüfung") + '</a></li><li><a href="unternehmen.html#ausbildung">' + T("Vocational training", "Ausbildung") + '</a></li><li><a href="technologie.html">' + T("Semiconductor technology", "Halbleitertechnik") + "</a></li></ul></div>" +
      "</div>" +
      '<div class="footer-bottom"><span>© ' + year + " " + COMPANY.name + ' · <span class="footer-rev">Rev. ' + rev() + "</span></span>" + T("<span>Certified to ISO 9001, all products RoHS compliant</span>", "<span>Zertifiziert nach ISO 9001, alle Produkte RoHS-konform</span>") + "</div>" +
      '<div class="footer-legal"><p>' + T('AI-generated content. This website is for teaching purposes only, LUMIATECH is a fictitious company.', 'KI-generierte Inhalte. Diese Website dient ausschließlich Lehrzwecken, LUMIATECH ist ein fiktives Unternehmen.') + '</p>' +
      '<p><a href="../../../../impressum.html">' + T("Legal notice", "Impressum") + '</a> · <a href="../../../../datenschutz.html">' + T("Privacy policy", "Datenschutz") + "</a> · " + T("Contact and feedback", "Kontakt und Feedback") + ': <a href="mailto:kontakt@herrniebel.de">kontakt@herrniebel.de</a></p></div></div>';
  }

  /* ---------- Dock am rechten Rand: Übersetzen (oben) und KI-Support (darunter) ---------- */
  function buildDock() {
    if (document.getElementById("support")) return;
    var wrap = document.createElement("div");
    wrap.className = "support";
    wrap.id = "support";
    document.body.appendChild(wrap);
    buildSupport(wrap, buildLang(wrap));
  }

  /* ---------- Übersetzen: Englisch ist Standard, Deutsch auf Wunsch ----------
     Erster Aufruf (Adresse ohne ?lang=): Am rechten Rand schwebt eine Karte „Übersetzen?“.
     Nach dem Schließen (x) bleibt der Reiter „Übersetzen?“ am Rand, wie der KI-Chat-Reiter.
     In der deutschen Fassung heißt der Reiter „English?“.
     Die Wahl steht nur in der Adresse (?lang=de / ?lang=en) und wandert über die internen
     Links mit. Es wird nichts gespeichert (keine Cookies, kein localStorage). */
  function switchLang(to) {
    var u = new URL(location.href), max = document.documentElement.scrollHeight - window.innerHeight;
    u.searchParams.set("lang", to);
    if (max > 0 && window.scrollY > 0) u.searchParams.set("y", (window.scrollY / max).toFixed(4)); // Leseposition mitnehmen
    location.assign(u.href);
  }
  function buildLang(wrap) {
    var other = LT.lang === "de" ? "en" : "de", first = !LT.langGewaehlt, after = [];
    var slot = document.createElement("div");
    slot.className = "support-slot support-slot--lang";
    slot.innerHTML =
      '<div class="lang-card" lang="de" role="region" aria-label="Übersetzung"' + (first ? "" : " hidden") + ">" +
      '<button class="lang-card__close" type="button" aria-label="Schließen (close)">' + LT.icon("close") + "</button>" +
      '<span class="lang-card__badge">' + LT.icon("globe") + "</span>" +
      "<strong>Übersetzen?</strong>" +
      '<p><span lang="en">This website is in English.</span> Sie können sie auch auf Deutsch lesen.</p>' +
      '<button class="btn btn--litho btn--small lang-card__go" type="button">Auf Deutsch anzeigen</button></div>' +
      '<button class="support-tab support-tab--lang" type="button" lang="' + other + '" aria-label="' +
      (other === "de" ? "Seite auf Deutsch übersetzen" : "Show this page in English") + '"' + (first ? " hidden" : "") + ">" +
      LT.icon("globe") + "<span>" + (other === "de" ? "Übersetzen?" : "English?") + "</span></button>";
    wrap.appendChild(slot);
    var card = LT.$(".lang-card", slot), tab = LT.$(".support-tab--lang", slot);
    wrap.classList.toggle("has-card", first);
    tab.addEventListener("click", function () { switchLang(other); });
    LT.$(".lang-card__go", slot).addEventListener("click", function () { switchLang("de"); });
    LT.$(".lang-card__close", slot).addEventListener("click", function () {
      card.hidden = true; tab.hidden = false; wrap.classList.remove("has-card");
      LT.langGewaehlt = true; // ab jetzt nehmen die internen Links ?lang=en mit
      var u = new URL(location.href); u.searchParams.set("lang", LT.lang);
      try { history.replaceState(null, "", u.href); } catch (err) { /* z. B. lokal als Datei geöffnet */ }
      keepParams(document);
      tab.focus();
      after.forEach(function (fn) { fn(); });
    });
    return { open: first, onClose: function (fn) { after.push(fn); } };
  }

  /* ---------- KI-Support: Reiter, Hinweis beim Laden, Fenster mit QR-Code ----------
     Einstellungen in config.js (kiChat). Der QR-Code wird aus dem Link erzeugt
     (assets/js/vendor/qrcode.js, wird erst beim Öffnen des Fensters geladen). */
  function buildSupport(wrap, lang) {
    var cfg = LT.config.kiChat || {};
    var url = cfg.url;
    if (!url) return;
    var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); };
    var U = esc(url);

    var slot = document.createElement("div");
    slot.className = "support-slot support-slot--chat";
    wrap.appendChild(slot);
    slot.innerHTML =
      '<button class="support-tab" type="button" aria-haspopup="dialog" aria-controls="support-dialog">' + LT.icon("chat") +
      '<span class="support-tab__long">' + T('Questions? AI chat', 'Fragen? KI-Chat') + '</span><span class="support-tab__short">' + T('Questions?</span>', 'Fragen?</span>') + '</button>' +
      '<div class="support-teaser" aria-live="polite">' +
      '<button class="support-teaser__close" type="button" aria-label="' + T('Close hint', 'Hinweis schließen') + '">' + LT.icon("close") + "</button>" +
      "<strong>" + T("Questions about diodes" + (LT.frei("leds") ? " or LEDs" : ""), "Fragen zu Dioden" + (LT.frei("leds") ? " oder LEDs" : "")) + "?</strong>" +
      T("<p>Our AI support answers them directly in the chat.</p>", "<p>Unser KI-Support beantwortet sie direkt im Chat.</p>") +
      '<button class="btn btn--litho btn--small support-teaser__open" type="button">' + LT.icon("chat") + "" + T("Open chat</button></div>", "Chat öffnen</button></div>") + "";

    var dlg = document.createElement("dialog");
    dlg.className = "support-dialog";
    dlg.id = "support-dialog";
    dlg.setAttribute("aria-labelledby", "support-title");
    dlg.innerHTML =
      '<div class="support-dialog__inner">' +
      '<div class="support-dialog__head"><span class="support-dialog__badge">' + LT.icon("chat") + "</span>" +
      '<div><span class="kicker">' + T('Technical support', 'Technischer Support') + '</span><h2 id="support-title">' + T('Ask your questions in the chat', 'Stellen Sie Ihre Fragen im Chat') + '</h2></div>' +
      '<button class="support-dialog__close" type="button" aria-label="' + T('Close window', 'Fenster schließen') + '">' + LT.icon("close") + "</button></div>" +
      '<div class="support-dialog__body">' +
      '<figure class="support-qr"><div class="support-qr__code"><span class="support-qr__wait">' + T('Generating QR code …', 'QR-Code wird erzeugt …') + '</span></div>' +
      '<figcaption>' + T('Scan with your smartphone camera', 'Mit der Smartphone-Kamera scannen') + '</figcaption>' +
      '<a class="support-qr__save" href="#" download="KI-Chat_QR-Code.svg" hidden' + T('>Save QR code<', '>QR-Code speichern<') + '/a></figure>' +
      '<div class="support-dialog__text">' +
      "<p>" + T("Our AI assistant helps with questions about " + (LT.frei("leds") ? "diodes, LEDs, characteristic curves, series resistors" : "diodes, characteristic curves, diode circuits") + " and our application notes.", "Unser KI-Assistent hilft bei Fragen zu " + (LT.frei("leds") ? "Dioden, LEDs, Kennlinien, Vorwiderständen" : "Dioden, Kennlinien, Diodenschaltungen") + " und unseren Applikationen.") + "</p>" +
      '<a class="btn btn--litho support-dialog__go" href="' + U + '" target="_blank" rel="noopener">' + LT.icon("external") + "" + T("Open chat in a new tab</a>", "Chat im neuen Tab öffnen</a>") + "" +
      '<div class="support-link"><span class="support-link__label">' + T('Link to the chat', 'Link zum Chat') + '</span>' +
      '<a class="support-link__url" href="' + U + '" target="_blank" rel="noopener">' + esc(url.replace(/^https?:\/\//, "")) + "</a>" +
      '<button class="support-link__copy" type="button">' + LT.icon("copy") + '' + T('<span>Copy link</span>', '<span>Link kopieren</span>') + '</button></div>' +
      '<p class="support-dialog__note">' + LT.icon("info") + "" + T("<span>The chat is an AI assistant. Answers may contain errors – please check important values in the data sheet.</span>", "<span>Der Chat ist ein KI-Assistent. Antworten können Fehler enthalten – wichtige Werte bitte im Datenblatt prüfen.</span>") + "</p>" +
      "</div></div></div>";
    document.body.appendChild(dlg);

    var tab = LT.$(".support-tab", slot), teaser = LT.$(".support-teaser", slot), timer = null;
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
        copyLabel.textContent = ok ? T("Copied", "Kopiert") : T("Please copy manually", "Bitte manuell kopieren");
        copyBtn.classList.toggle("is-done", ok);
        setTimeout(function () { copyLabel.textContent = T("Copy link", "Link kopieren"); copyBtn.classList.remove("is-done"); }, 2200);
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
          var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size + '" shape-rendering="crispEdges" role="img" aria-label="' + T('QR code to the AI support chat', 'QR-Code zum KI-Support-Chat') + '">' +
            '<rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="#17202b"/></svg>';
          host.innerHTML = svg;
          var save = LT.$(".support-qr__save", dlg);
          save.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
          save.hidden = false;
          qrDone = true;
        } catch (err) { fail(); }
      }
      function fail() { host.innerHTML = '<span class="support-qr__wait">' + T('QR code not available – please use the link.', 'QR-Code nicht verfügbar – bitte den Link nutzen.') + '</span>'; }
      if (window.qrcode) { draw(); return; }
      var s = document.createElement("script");
      s.src = JS_BASE + "vendor/qrcode.js";
      s.onload = draw; s.onerror = fail;
      document.head.appendChild(s);
    }

    // Hinweis nur beim Aufruf der Startseite (index.html, auch mit ?lang=en/de) – nicht, wenn man von
    // einer anderen Seite dieser Website kommt oder die Sprache wechselt. Ohne Speicherung (nur document.referrer).
    // Solange die Übersetzen-Karte offen ist, erscheint er erst nach deren Schließen.
    var ordner = location.pathname.replace(/[^/]*$/, "");
    var startseite = /\/(index\.html)?$/i.test(location.pathname);
    var vonHier = false;
    try { var ref = new URL(document.referrer); vonHier = ref.origin === location.origin && ref.pathname.indexOf(ordner) === 0; } catch (err) { /* kein Referrer */ }
    if (cfg.hinweisBeimLaden !== false && startseite && !vonHier) {
      var showTeaser = function () {
        setTimeout(function () {
          if (dlg.open) return;
          wrap.classList.add("show-teaser");
          var sec = cfg.hinweisSekunden === undefined ? 10 : +cfg.hinweisSekunden;
          if (sec > 0) timer = setTimeout(hideTeaser, sec * 1000);
        }, 1200);
      };
      if (lang && lang.open) lang.onClose(showTeaser); else showTeaser();
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
      var sections = LT.$$(":scope > section[id]", root).filter(function (s) { return getComputedStyle(s).display !== "none"; });
      var html = '<div class="toc__title">' + T('On this page', 'Auf dieser Seite') + '</div><ol>' +
        sections.map(function (s) {
          var h = LT.$("h2", s);
          var label = s.getAttribute("data-toc-label") || (h ? LT.text(h) : s.id);
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

  /* Sprache (?lang=) und früheren Stand (?w=1) über alle internen Links mitnehmen */
  function keepLink(a) {
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    var href = a.getAttribute("href");
    if (!href || /^(#|mailto:|tel:)/i.test(href)) return;
    var u = new URL(href, location.href), vorher = u.search;
    if (u.origin !== location.origin || !/\.html$/i.test(u.pathname) || /(impressum|datenschutz)\.html$/i.test(u.pathname)) return;
    if (LT.langGewaehlt) u.searchParams.set("lang", LT.lang);
    if (WOCHE.woche < WOCHE.eingestellt) u.searchParams.set("w", WOCHE.woche);
    if (u.search !== vorher) a.href = u.href;
  }
  function keepParams(root) { LT.$$("a[href]", root).forEach(keepLink); }
  document.addEventListener("click", function (e) { keepLink(e.target.closest && e.target.closest("a[href]")); }, true); // später eingefügte Links

  /* Leseposition nach dem Sprachwechsel wiederherstellen (?y= wird danach aus der Adresse entfernt) */
  function restoreScroll() {
    var q = new URLSearchParams(location.search), y = parseFloat(q.get("y"));
    if (!q.has("y")) return;
    var u = new URL(location.href); u.searchParams.delete("y");
    try { history.replaceState(null, "", u.href); } catch (err) { /* lokal als Datei geöffnet */ }
    if (!(y > 0)) return;
    var go = function () { window.scrollTo({ top: y * (document.documentElement.scrollHeight - window.innerHeight), behavior: "instant" }); };
    go();
    window.addEventListener("load", function () { setTimeout(go, 60); });
  }

  function init() {
    buildHeader();
    buildFooter();
    buildDock();
    buildToc();
    initHotspots();
    keepParams(document);
    LT.$$('input[type="range"]').forEach(LT.paintRange);
    restoreScroll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
