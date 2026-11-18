/* =========================================================================
   WATT AUF ACHSE · Startseite
   - Werkbank-Widget: Fortschrittsbalken einfahren, Kaffee-Zähler
   - Beitrags-Stream: Nummern 01, 02 …, 7/5-Wechsel im 12er-Raster, Themen-Filter
   - Skizze im herausgehobenen Beitrag: „ac“ (Woche 1) bzw. „duel“ (ab Woche 2)
   ========================================================================= */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }
  function both(en, de) { return { en: en, de: de }; }
  function txt(parent, x, y, o, attrs) {          // zweisprachiger SVG-Text (CSS blendet die andere Sprache aus)
    var g = el("g", {}, parent);
    ["en", "de"].forEach(function (l) {
      var t = el("text", Object.assign({ x: x, y: y, "data-lang": l }, attrs || {}), g);
      t.textContent = o[l];
    });
    return g;
  }
  // Handgezeichnete Linie: kleine, feste Zitterbewegung (immer gleich, kein Zufall beim Neuladen)
  function wobble(points, amp) {
    var d = "", s = 7;
    points.forEach(function (p, i) {
      s = (s * 9301 + 49297) % 233280;
      var j = ((s / 233280) - 0.5) * 2 * (amp || 0.9);
      d += (i ? "L" : "M") + p[0].toFixed(1) + " " + (p[1] + j).toFixed(1);
    });
    return d;
  }
  var HAND = "Caveat, cursive", MONO = "JetBrains Mono, monospace";
  var INK = "#18181b", TERRA = "#b23a26", GREEN = "#2a6f4e", MUSTARD = "#e9b44c";

  /* ---------- Werkbank ---------- */
  function bench() {
    var bars = document.querySelectorAll(".bar > span");
    bars.forEach(function (b) { b.dataset.p = b.style.getPropertyValue("--p"); if (!reduced) b.style.setProperty("--p", "0%"); });
    setTimeout(function () { bars.forEach(function (b) { b.style.setProperty("--p", b.dataset.p); }); }, 250);
    var btn = document.getElementById("coffee-btn"), n = document.getElementById("coffee-n"), cups = 3;
    if (btn) btn.addEventListener("click", function () {
      cups += 1; n.textContent = cups;
      n.classList.add("pop"); setTimeout(function () { n.classList.remove("pop"); }, 260);
      if (cups === 7) n.title = SITE.t(both("Okay, that’s enough.", "Okay, jetzt reicht’s."));
    });
  }

  /* ---------- Stream: Nummern, 7/5-Wechsel, Filter ---------- */
  function stream() {
    var grid = document.querySelector(".stream__grid");
    if (!grid) return;
    var posts = Array.prototype.slice.call(grid.querySelectorAll(".post"));
    var empty = grid.querySelector(".stream__empty");
    var weekVisible = posts.filter(function (p) { return getComputedStyle(p).display !== "none"; });
    weekVisible.forEach(function (p, i) { p.querySelector(".post__num").textContent = (i < 9 ? "0" : "") + (i + 1); });
    function topics(p) { return (p.getAttribute("data-topics") || "").split(/\s+/); }
    function apply(filter) {
      var shown = [];
      weekVisible.forEach(function (p) {
        var ok = filter === "all" || topics(p).indexOf(filter) > -1;
        p.hidden = !ok;
        if (ok) shown.push(p);
      });
      shown.forEach(function (p, i) {
        var row = Math.floor(i / 2), first = i % 2 === 0;
        p.classList.toggle("is-5", first ? row % 2 === 1 : row % 2 === 0);
      });
      empty.hidden = shown.length > 0;
    }
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter [data-filter]"));
    buttons.forEach(function (b) {
      var f = b.getAttribute("data-filter");
      var count = f === "all" ? weekVisible.length : weekVisible.filter(function (p) { return topics(p).indexOf(f) > -1; }).length;
      b.querySelector(".filter__count").textContent = count;
      if (!count && f !== "all") b.hidden = true;
      b.addEventListener("click", function () {
        buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        apply(f);
      });
    });
    apply("all");
  }

  /* ---------- Skizze „ac“: LED am Gartentrafo ---------- */
  function sketchAC(host) {
    var W = 520, H = 300, y0 = 150, A = 92, x0 = 40, P = 176, xEnd = x0 + 2 * P;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Sketch: AC voltage and an LED" }, host);
    txt(svg, 22, 34, both("12 V~ at my terrace", "12 V~ an meiner Terrasse"), { "font-family": HAND, "font-size": 26, "font-weight": 600, fill: INK });
    el("path", { d: wobble([[x0 - 10, y0], [120, y0], [220, y0], [320, y0], [xEnd + 14, y0]], 0.8), stroke: INK, "stroke-width": 1.8, fill: "none", "stroke-linecap": "round" }, svg);
    el("path", { d: "M" + (xEnd + 14) + " " + y0 + " l-9 -5 M" + (xEnd + 14) + " " + y0 + " l-9 5", stroke: INK, "stroke-width": 1.8, fill: "none", "stroke-linecap": "round" }, svg);
    el("text", { x: xEnd + 8, y: y0 + 22, "font-family": MONO, "font-size": 12, fill: INK }, svg).textContent = "t";
    // −5-V-Grenze der LED
    var yLim = y0 + A * 5 / 17;
    el("path", { d: wobble([[x0, yLim], [150, yLim], [260, yLim], [xEnd, yLim]], 0.6), stroke: TERRA, "stroke-width": 1.6, "stroke-dasharray": "7 6", fill: "none" }, svg);
    txt(svg, x0 + 4, yLim + 24, both("−5 V = LED max.!", "−5 V = LED max.!"), { "font-family": HAND, "font-size": 21, "font-weight": 600, fill: TERRA });
    // Sinus
    var pts = [];
    for (var x = x0; x <= xEnd; x += 4) pts.push([x, y0 - A * Math.sin((x - x0) / P * 2 * Math.PI)]);
    el("path", { d: wobble(pts, 0.7), stroke: INK, "stroke-width": 2.6, fill: "none", "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
    var peak2 = x0 + 5 * P / 4, uhatLbl = el("text", { x: peak2 + 14, y: y0 - A + 6, "font-family": MONO, "font-size": 12, fill: INK }, svg);
    uhatLbl.textContent = "û ≈ +17 V";
    el("text", { x: x0 + 3 * P / 4 - 30, y: y0 + A + 22, "font-family": MONO, "font-size": 12, fill: INK }, svg).textContent = "≈ −17 V";
    // LED-Kritzelei rechts
    var lx = 466, ly = 118;
    var glow = el("circle", { cx: lx, cy: ly, r: 44, fill: MUSTARD, opacity: 0 }, svg);
    el("path", { d: "M" + (lx - 16) + " " + (ly + 14) + " v-18 a16 16 0 0 1 32 0 v18 z", fill: "#fffdf9", stroke: INK, "stroke-width": 2.2, "stroke-linejoin": "round" }, svg);
    el("path", { d: "M" + (lx - 20) + " " + (ly + 14) + " h40 M" + (lx - 7) + " " + (ly + 14) + " v34 M" + (lx + 7) + " " + (ly + 14) + " v26", stroke: INK, "stroke-width": 2.2, fill: "none", "stroke-linecap": "round" }, svg);
    var cross = el("path", { d: "M" + (lx - 12) + " " + (ly - 14) + " l24 24 M" + (lx + 12) + " " + (ly - 14) + " l-24 24", stroke: TERRA, "stroke-width": 3.4, "stroke-linecap": "round", opacity: 0 }, svg);
    var status = el("g", {}, svg);
    // Cursor
    var cur = el("line", { y1: 46, y2: 262, stroke: INK, "stroke-width": 1.4, "stroke-dasharray": "3 4" }, svg);
    var dot = el("circle", { r: 6, fill: MUSTARD, stroke: INK, "stroke-width": 2 }, svg);
    var val = el("text", { "font-family": MONO, "font-size": 13, "font-weight": 600, fill: INK, stroke: "#f2ece1", "stroke-width": 5, "paint-order": "stroke" }, svg);

    var range = document.createElement("input");
    range.type = "range"; range.min = 0; range.max = 1000; range.className = "sketch__range";
    host.appendChild(range);
    var hint = document.createElement("p");
    hint.className = "sketch__hint";
    hint.innerHTML = SITE.both(both("↑ move across the sketch (or drag the slider) – when does the LED suffer?", "↑ fahr über die Skizze (oder schieb den Regler) – wann leidet die LED?"));
    host.appendChild(hint);
    function label() { range.setAttribute("aria-label", SITE.t(both("Point in time on the AC curve", "Zeitpunkt auf der Wechselspannungskurve"))); }
    label(); document.addEventListener("langchange", label);

    function set(x) {
      x = Math.max(x0, Math.min(xEnd, x));
      var u = 17 * Math.sin((x - x0) / P * 2 * Math.PI), y = y0 - A * u / 17;
      cur.setAttribute("x1", x); cur.setAttribute("x2", x);
      uhatLbl.setAttribute("opacity", Math.abs(x - peak2) < 70 ? 0 : 1);
      dot.setAttribute("cx", x); dot.setAttribute("cy", y);
      val.setAttribute("x", Math.min(x + 10, xEnd - 70)); val.setAttribute("y", y + (u >= 0 ? -12 : 24));
      val.textContent = "u = " + (u >= 0 ? "+" : "−") + SITE.num(Math.abs(u), 0) + " V";
      var on = u > 3, bad = u < -5;
      glow.setAttribute("opacity", on ? Math.min(0.85, (u - 3) / 10 + 0.25).toFixed(2) : 0);
      cross.setAttribute("opacity", bad ? 1 : 0);
      while (status.firstChild) status.removeChild(status.firstChild);
      var s = on ? both("lights up ✓", "leuchtet ✓") : u >= 0 ? both("too little voltage", "zu wenig Spannung") : bad ? both("blocks – " + Math.round(-u) + " V reverse!", "sperrt – " + Math.round(-u) + " V Sperrsp.!") : both("blocks (still ok)", "sperrt (noch ok)");
      txt(status, lx, 212, s, { "font-family": HAND, "font-size": 22, "font-weight": 700, fill: on ? GREEN : bad ? TERRA : INK, "text-anchor": "middle" });
      range.value = Math.round((x - x0) / (xEnd - x0) * 1000);
    }
    var auto = !reduced, t0 = performance.now();
    function stopAuto() { auto = false; }
    function fromEvent(e) { var r = svg.getBoundingClientRect(); return (e.clientX - r.left) / r.width * W; }
    svg.addEventListener("pointermove", function (e) { stopAuto(); set(fromEvent(e)); });
    svg.addEventListener("pointerdown", function (e) { stopAuto(); set(fromEvent(e)); });
    range.addEventListener("input", function () { stopAuto(); set(x0 + range.value / 1000 * (xEnd - x0)); });
    function tick(now) {
      if (!auto) return;
      var ph = ((now - t0) / 7000) % 1;
      set(x0 + ph * (xEnd - x0));
      requestAnimationFrame(tick);
    }
    set(x0 + P / 4);
    if (auto) requestAnimationFrame(tick);
    document.addEventListener("langchange", function () { set(+cur.getAttribute("x1")); });
  }

  /* ---------- Skizze „duel“: Was frisst die Diode? ---------- */
  function sketchDuel(host) {
    var W = 520, H = 304;
    var DIODES = { si: { name: "1N4007", uf: 0.83 }, sch: { name: "1N5817", uf: 0.34 } };
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Sketch: how much of 6 V the diode takes" }, host);
    txt(svg, 22, 34, both("6 V from the sun – who gets what?", "6 V von der Sonne – wer kriegt was?"), { "font-family": HAND, "font-size": 25, "font-weight": 600, fill: INK });
    // Sonne + Modul
    el("circle", { cx: 60, cy: 82, r: 14, fill: MUSTARD, stroke: INK, "stroke-width": 2 }, svg);
    for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4; el("path", { d: "M" + (60 + 19 * Math.cos(a)) + " " + (82 + 19 * Math.sin(a)) + " l" + (7 * Math.cos(a)) + " " + (7 * Math.sin(a)), stroke: INK, "stroke-width": 2, "stroke-linecap": "round" }, svg); }
    el("path", { d: wobble([[40, 120], [130, 116], [138, 176], [46, 180], [40, 120]], 0.6), fill: "#dcebe1", stroke: INK, "stroke-width": 2.2 }, svg);
    el("path", { d: "M70 118 l4 60 M100 117 l4 61 M43 148 l94 -3", stroke: INK, "stroke-width": 1.4, fill: "none" }, svg);
    // Leitung → Diode → Akku
    el("path", { d: wobble([[138, 146], [175, 146], [196, 146]], 0.5), stroke: INK, "stroke-width": 2, fill: "none" }, svg);
    var dg = el("g", { style: "cursor:pointer" }, svg);
    el("path", { d: "M196 132 v28 l26 -14 z", fill: "#fffdf9", stroke: INK, "stroke-width": 2.2, "stroke-linejoin": "round" }, dg);
    var bar = el("path", { d: "M222 132 v28", stroke: INK, "stroke-width": 2.6 }, dg);
    var hooks = el("path", { d: "M222 132 h-5 M222 160 h5", stroke: INK, "stroke-width": 2.6, opacity: 0 }, dg);
    var dname = el("text", { x: 209, y: 122, "text-anchor": "middle", "font-family": MONO, "font-size": 12, fill: INK }, dg);
    el("path", { d: wobble([[222, 146], [250, 146], [268, 146]], 0.5), stroke: INK, "stroke-width": 2, fill: "none" }, svg);
    el("rect", { x: 268, y: 124, width: 62, height: 44, rx: 6, fill: "#fffdf9", stroke: INK, "stroke-width": 2.2 }, svg);
    el("rect", { x: 330, y: 138, width: 6, height: 16, fill: INK }, svg);
    txt(svg, 299, 151, both("4.8 V", "4,8 V"), { "text-anchor": "middle", "font-family": MONO, "font-size": 11, fill: INK });
    txt(svg, 270, 196, both("battery", "Akku"), { "font-family": HAND, "font-size": 20, fill: INK });
    // Spannungs-Balken
    var bx = 410, by = 50, bh = 220, bw = 56;
    el("rect", { x: bx, y: by, width: bw, height: bh, fill: "#2a6f4e", stroke: INK, "stroke-width": 2.2, rx: 4 }, svg);
    var hatch = el("pattern", { id: "hatch", width: 8, height: 8, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, el("defs", {}, svg));
    el("rect", { width: 8, height: 8, fill: "#e0533c" }, hatch);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 8, stroke: "#b23a26", "stroke-width": 3 }, hatch);
    var loss = el("rect", { x: bx, y: by, width: bw, height: 20, fill: "url(#hatch)", stroke: INK, "stroke-width": 2.2, rx: 4 }, svg);
    el("text", { x: bx + bw / 2, y: by + bh + 22, "text-anchor": "middle", "font-family": MONO, "font-size": 12, fill: INK }, svg).textContent = "6 V";
    var lossLbl = el("g", {}, svg), restLbl = el("g", {}, svg);

    var tabs = document.createElement("div");
    tabs.className = "sketch__tabs seg";
    host.appendChild(tabs);
    var cur = "si", h = 0;
    var buttons = Object.keys(DIODES).map(function (id) {
      var b = document.createElement("button");
      b.type = "button"; b.dataset.id = id;
      b.addEventListener("click", function () { pick(id); });
      tabs.appendChild(b);
      return b;
    });
    var hint = document.createElement("p");
    hint.className = "sketch__hint";
    hint.innerHTML = SITE.both(both("↑ swap the diode – or click it in the sketch", "↑ tausch die Diode – oder klick sie in der Skizze an"));
    host.appendChild(hint);
    dg.addEventListener("click", function () { pick(cur === "si" ? "sch" : "si"); });

    function labels() {
      buttons[0].textContent = SITE.t(both("silicon · 1N4007", "Silizium · 1N4007"));
      buttons[1].textContent = SITE.t(both("Schottky · 1N5817", "Schottky · 1N5817"));
    }
    function draw(hh) {
      loss.setAttribute("height", Math.max(4, hh).toFixed(1));
      var d = DIODES[cur], rest = 6 - d.uf;
      while (lossLbl.firstChild) lossLbl.removeChild(lossLbl.firstChild);
      while (restLbl.firstChild) restLbl.removeChild(restLbl.firstChild);
      txt(lossLbl, bx - 12, by + 14, both("the diode eats " + SITE.num(d.uf, 2) + " V", "die Diode frisst " + SITE.num(d.uf, 2) + " V"), { "font-family": HAND, "font-size": 21, "font-weight": 700, fill: TERRA, "text-anchor": "end" });
      txt(restLbl, bx - 12, by + bh - 34, both(SITE.num(rest, 2) + " V left", "bleiben " + SITE.num(rest, 2) + " V"), { "font-family": HAND, "font-size": 21, "font-weight": 700, fill: GREEN, "text-anchor": "end" });
      txt(restLbl, bx - 12, by + bh - 12, both("for the battery", "für den Akku"), { "font-family": HAND, "font-size": 19, fill: GREEN, "text-anchor": "end" });
    }
    function pick(id) {
      cur = id;
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.id === id)); });
      dname.textContent = DIODES[id].name;
      hooks.setAttribute("opacity", id === "sch" ? 1 : 0);
      var target = DIODES[id].uf / 6 * bh * 2.2;              // überzeichnet, damit man es sieht
      if (reduced) { h = target; draw(h); return; }
      var start = h, t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / 450), e = 1 - Math.pow(1 - p, 3) * (1 - 1.4 * p * (1 - p));
        h = start + (target - start) * e; draw(h);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
    labels(); pick("si");
    document.addEventListener("langchange", function () { labels(); draw(h); });
    txt(svg, 22, 294, both("(loss drawn 2.2× bigger – otherwise you’d hardly see it)", "(Verlust 2,2-fach überzeichnet – sonst sieht man’s kaum)"), { "font-family": HAND, "font-size": 16, fill: "#57534e" });
  }

  function boot() {
    bench();
    stream();
    document.querySelectorAll("[data-sketch]").forEach(function (h) {
      if (getComputedStyle(h.closest(".featured")).display === "none") return;   // Woche noch nicht freigeschaltet
      if (h.getAttribute("data-sketch") === "ac") sketchAC(h); else sketchDuel(h);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
