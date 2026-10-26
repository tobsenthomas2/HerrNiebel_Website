/* =========================================================================
   Äußerer Blitzschutz – gemeinsame Daten und Helfer für alle Simulationen
   Kennwerte nach DIN EN 62305-3 (VDE 0185-305-3), Schutzwinkel nach Bild 1
   (Tabellenwerte des VDE-Ausschusses Blitzschutz und Blitzforschung).
   ========================================================================= */
(function () {
  "use strict";
  var BS = (window.BS = window.BS || {});

  /** Kennwerte je Blitzschutzklasse */
  BS.CLASSES = {
    I:   { id: "I",   R: 20, mesh: 5,  down: 10, Imin: 3,  hmax: 20 },
    II:  { id: "II",  R: 30, mesh: 10, down: 10, Imin: 5,  hmax: 30 },
    III: { id: "III", R: 45, mesh: 15, down: 15, Imin: 10, hmax: 45 },
    IV:  { id: "IV",  R: 60, mesh: 20, down: 20, Imin: 16, hmax: 60 }
  };
  BS.ORDER = ["I", "II", "III", "IV"];

  /** Schutzwinkel α in Grad je Höhe h (2 … 60 m) */
  var A = {
    I:   [71, 66, 62, 59, 56, 53, 50, 48, 45, 43, 40, 38, 36, 34, 32, 30, 27, 25, 23],
    II:  [74, 71, 68, 65, 62, 60, 58, 56, 54, 52, 50, 49, 47, 45, 44, 42, 40, 39, 37, 36, 35, 33, 32, 30, 29, 27, 26, 25, 23],
    III: [77, 74, 72, 70, 68, 66, 64, 62, 61, 59, 58, 57, 55, 54, 53, 52, 50, 49, 48, 47, 46, 45, 44, 43, 42, 40, 39, 38, 37, 36, 35, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23],
    IV:  [79, 76, 74, 72, 71, 69, 68, 66, 65, 64, 62, 61, 60, 59, 58, 57, 56, 55, 54, 53, 52, 51, 50, 49, 49, 48, 47, 46, 45, 44, 44, 43, 42, 41, 40, 40, 39, 38, 37, 37, 36, 35, 35, 34, 33, 32, 32, 31, 30, 30, 29, 28, 27, 27, 26, 25, 25, 24, 23]
  };
  BS.ANGLES = A;

  /**
   * Schutzwinkel für Höhe h (m) über der Bezugsebene.
   * h ≤ 2 m: Wert bei 2 m. Oberhalb der Grenzhöhe: null (Verfahren nicht anwendbar).
   * Zwischenwerte linear interpoliert.
   */
  BS.alpha = function (cls, h) {
    var t = A[cls], hmax = BS.CLASSES[cls].hmax;
    if (h > hmax + 1e-9) return null;
    if (h <= 2) return t[0];
    var i = Math.floor(h) - 2, f = h - Math.floor(h);
    if (i >= t.length - 1) return t[t.length - 1];
    return t[i] + (t[i + 1] - t[i]) * f;
  };

  /** Mindest-Scheitelwert des Blitzstroms aus dem Kugelradius: R = 10 · I^0,65 */
  BS.currentFromR = function (R) { return Math.pow(R / 10, 1 / 0.65); };
  /** Eindringtiefe der Blitzkugel zwischen zwei Fangeinrichtungen im Abstand d */
  BS.penetration = function (R, d) { return d / 2 >= R ? Infinity : R - Math.sqrt(R * R - (d / 2) * (d / 2)); };

  /* ---------- Formatierung ---------- */
  BS.num = function (v, d) {
    if (v === null || !isFinite(v)) return "–";
    return v.toLocaleString("de-DE", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  };
  BS.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  BS.$ = function (s, r) { return (r || document).querySelector(s); };
  BS.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- SVG ---------- */
  var NS = "http://www.w3.org/2000/svg";
  BS.svg = function (tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  BS.text = function (parent, x, y, str, attrs) {
    var t = BS.svg("text", Object.assign({ x: x, y: y, "font-family": "inherit" }, attrs || {}), parent);
    if (String(str).indexOf("<") >= 0) t.innerHTML = str.replace(/<sub>(.*?)<\/sub>/g, '<tspan baseline-shift="sub" font-size="75%">$1</tspan>');
    else t.textContent = str;
    return t;
  };

  /* ---------- Bedienelemente ---------- */
  BS.paintRange = function (r) {
    var mn = +r.min || 0, mx = +r.max || 100;
    r.style.setProperty("--fill", ((+r.value - mn) / (mx - mn)) * 100 + "%");
  };
  document.addEventListener("input", function (e) { if (e.target.type === "range") BS.paintRange(e.target); });

  BS.segmented = function (parent, label, options, value, onChange, cls) {
    var wrap = document.createElement("div");
    wrap.className = "ctl";
    wrap.innerHTML = (label ? '<span class="ctl__label">' + label + "</span>" : "") + '<div class="seg ' + (cls || "") + '" role="group" aria-label="' + (label || "Auswahl") + '"></div>';
    var seg = BS.$(".seg", wrap);
    options.forEach(function (op) {
      var b = document.createElement("button");
      b.type = "button"; b.innerHTML = op.label; b.dataset.value = op.value;
      b.setAttribute("aria-pressed", String(op.value === value));
      b.addEventListener("click", function () {
        BS.$$("button", seg).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        onChange(op.value);
      });
      seg.appendChild(b);
    });
    parent.appendChild(wrap);
    return wrap;
  };

  BS.slider = function (parent, o) {
    var wrap = document.createElement("div");
    wrap.className = "ctl";
    var id = "s" + Math.random().toString(36).slice(2, 8);
    wrap.innerHTML = '<label class="ctl__label" for="' + id + '"><span>' + o.label + '</span><span class="ctl__value"></span></label>' +
      '<input type="range" id="' + id + '" min="' + o.min + '" max="' + o.max + '" step="' + (o.step || 1) + '" value="' + o.value + '">' +
      (o.help ? '<span class="ctl__help">' + o.help + "</span>" : "");
    parent.appendChild(wrap);
    var inp = BS.$("input", wrap), out = BS.$(".ctl__value", wrap);
    function upd() { out.textContent = o.format ? o.format(+inp.value) : inp.value; BS.paintRange(inp); }
    inp.addEventListener("input", function () { upd(); o.onInput(+inp.value); });
    upd();
    return { el: wrap, input: inp, set: function (v) { inp.value = v; upd(); }, range: function (mn, mx) { inp.min = mn; inp.max = mx; upd(); }, refresh: upd };
  };

  BS.toggle = function (parent, label, checked, onChange) {
    var l = document.createElement("label");
    l.className = "switch";
    l.innerHTML = '<input type="checkbox"' + (checked ? " checked" : "") + "> " + label;
    BS.$("input", l).addEventListener("change", function (e) { onChange(e.target.checked); });
    parent.appendChild(l);
    return l;
  };

  var ICON = {
    ok: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 10.2l2.4 2.4 4.6-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    bad: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.6l8 14H2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 8v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14.6" r="1.1" fill="currentColor"/></svg>',
    info: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="6.2" r="1.1" fill="currentColor"/></svg>'
  };
  BS.status = function (el, kind, title, text) {
    el.className = "status" + (kind === "ok" ? " status--ok" : kind === "bad" ? " status--bad" : kind === "warn" ? " status--warn" : "");
    el.innerHTML = (ICON[kind === "warn" ? "bad" : kind] || ICON.info) + "<div><strong>" + title + "</strong>" + (text ? "<span>" + text + "</span>" : "") + "</div>";
  };

  /** Bühne mit automatischer Neuberechnung bei Größenänderung */
  BS.onResize = function (el, fn) {
    var last = 0;
    if ("ResizeObserver" in window) new ResizeObserver(function () { var w = el.clientWidth; if (Math.abs(w - last) > 3) { last = w; fn(w); } }).observe(el);
    else window.addEventListener("resize", function () { fn(el.clientWidth); });
  };

  /* ---------- Kopf- und Fußzeile ---------- */
  var PAGES = [
    { href: "index.html", label: "Übersicht" },
    { href: "blitzkugel.html", label: "Blitzkugel" },
    { href: "schutzwinkel.html", label: "Schutzwinkel" },
    { href: "maschen.html", label: "Maschen" }
  ];
  var LOGO = '<svg viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="7" fill="#16253b"/><path d="M17 4 L9 17 h6 l-2 9 L22 12 h-6 z" fill="#f5b301"/></svg>';
  function chrome() {
    var cur = (location.pathname.split("/").pop() || "index.html").toLowerCase() || "index.html";
    var top = document.getElementById("top-bar");
    if (top) {
      top.innerHTML = '<div class="container top__bar"><a class="brand" href="index.html">' + LOGO + '<span>Äußerer Blitzschutz<small>Fangeinrichtungen nach DIN EN 62305-3</small></span></a>' +
        '<nav class="nav" aria-label="Simulationen">' + PAGES.map(function (p) {
          return '<a href="' + p.href + '"' + (p.href === cur ? ' aria-current="page"' : "") + ">" + p.label + "</a>";
        }).join("") + "</nav></div>";
    }
    var foot = document.getElementById("foot");
    if (foot) {
      foot.className = "foot";
      foot.innerHTML = '<div class="container"><p>© ' + new Date().getFullYear() + " Tobias Niebel. KI-generierte Inhalte, Website ausschließlich für Lehrzwecke. Werte zur Orientierung – maßgeblich ist DIN EN 62305-3.</p>" +
        '<p><a href="../../../../impressum.html">Impressum</a> · <a href="../../../../datenschutz.html">Datenschutz</a> · Kontakt und Feedback: <a href="mailto:kontakt@herrniebel.de">kontakt@herrniebel.de</a></p></div>';
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", chrome); else chrome();
})();
