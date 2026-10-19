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
    circuit: '<path d="M2 10h4M14 10h4M6 6v8l7-4-7-4zM13 6v8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'
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

  /** Logo: Chip mit Diodensymbol */
  LT.logo = function () {
    return (
      '<svg class="brand__glyph" viewBox="0 0 34 34" aria-hidden="true">' +
      '<rect x="1" y="1" width="32" height="32" rx="5" fill="#17202b"/>' +
      '<path d="M5 17h5M24 17h5" stroke="#ffc400" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M10.5 9.5v15L22.5 17z" fill="#ffc400"/>' +
      '<path d="M23.5 9.5v15" stroke="#ffc400" stroke-width="2.6" stroke-linecap="round"/>' +
      "</svg>"
    );
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
      if (e.key === "Escape") { closeAll(); menuBtn.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); }
    });

    var menuBtn = LT.$(".menu-btn", host), nav = LT.$(".nav", host);
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") !== "true";
      menuBtn.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
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
      '<div class="footer-bottom"><span>© ' + year + " " + COMPANY.name + "</span><span>Zertifiziert nach ISO 9001, alle Produkte RoHS-konform</span></div></div>";
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
    buildToc();
    initHotspots();
    LT.$$('input[type="range"]').forEach(LT.paintRange);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
