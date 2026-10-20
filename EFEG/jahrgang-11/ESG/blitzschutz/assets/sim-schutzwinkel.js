/* =========================================================================
   Schutzwinkelverfahren – 2D-Schnitt und Diagramm α(h)
   Schutzbereich einer Fangstange: Kegel mit Spitze an der Stangenspitze,
   Öffnungswinkel α aus DIN EN 62305-3 Bild 1 (abhängig von Klasse und Höhe h
   über der Bezugsebene). Ein Punkt in der Höhe y ist geschützt, wenn
   |x − x_Stange| ≤ (h_Spitze − y) · tan α.
   ========================================================================= */
(function () {
  "use strict";
  var BS = window.BS, S = BS.svg;
  var host = document.getElementById("sim-schutzwinkel");
  if (!host) return;

  var HB = 8; // Gebäudehöhe
  var SCENES = {
    dach: { id: "dach", name: "Fangstange auf dem Dach", info: "Flachdach in 8 m Höhe mit Klimagerät (3 m breit, 1,5 m hoch).", bx: [-10, 10], ac: [-7, -4, 1.5] },
    mast: { id: "mast", name: "Mast neben dem Gebäude", info: "Freistehender Fangmast neben einem 8 m hohen Gebäude (12 m breit).", bx: [-2, 10], ac: null }
  };
  var st = { scene: "dach", cls: "II", plane: "dach", x: -3, h: 4, mx: -8, H: 16 };

  var stage = BS.$(".sim__stage", host), panel = BS.$(".sim__panel", host);
  BS.segmented(panel, "Aufbau", [{ value: "dach", label: "Stange auf dem Dach" }, { value: "mast", label: "Mast neben Gebäude" }], st.scene, function (v) { st.scene = v; setup(); });
  BS.segmented(panel, "Blitzschutzklasse", BS.ORDER.map(function (k) { return { value: k, label: k }; }), st.cls, function (v) { st.cls = v; update(); }, "seg--classes");
  var planeSeg = BS.segmented(panel, "Bezugsebene (zu schützende Fläche)", [{ value: "dach", label: "Dachfläche" }, { value: "boden", label: "Erdboden" }], st.plane, function (v) { st.plane = v; update(); });
  var xSl = BS.slider(panel, { label: "Position der Fangstange", min: -9.5, max: 9.5, step: 0.5, value: st.x, format: function (v) { return BS.num(v, 1) + " m"; }, onInput: function (v) { st.x = v; update(); } });
  var hSl = BS.slider(panel, { label: "Länge der Fangstange", min: 0.5, max: 10, step: 0.5, value: st.h, format: function (v) { return BS.num(v, 1) + " m"; }, onInput: function (v) { st.h = v; update(); } });
  var mxSl = BS.slider(panel, { label: "Abstand Mast – Gebäude", min: 1, max: 20, step: 0.5, value: -2 - st.mx, format: function (v) { return BS.num(v, 1) + " m"; }, onInput: function (v) { st.mx = -2 - v; update(); } });
  var HSl = BS.slider(panel, { label: "Höhe des Mastes", min: 2, max: 60, step: 0.5, value: st.H, format: function (v) { return BS.num(v, 1) + " m"; }, onInput: function (v) { st.H = v; update(); } });
  var readout = document.createElement("dl"); readout.className = "readout"; panel.appendChild(readout);
  var status = document.createElement("div"); panel.appendChild(status);

  var svg = S("svg", { role: "img" });
  stage.insertBefore(svg, BS.$(".legend", stage));

  /** aktuelle Geometrie: Spitze, Bezugsebene, Höhe h, Winkel */
  function geo() {
    var sc = SCENES[st.scene], g = { sc: sc };
    if (sc.id === "dach") {
      g.rx = st.x; g.base = HB; g.tip = HB + st.h;
      g.plane = st.plane === "dach" ? HB : 0;
    } else {
      g.rx = st.mx; g.base = 0; g.tip = st.H; g.plane = 0;
    }
    g.h = g.tip - g.plane;
    g.alpha = BS.alpha(st.cls, g.h);
    g.tan = g.alpha === null ? 0 : Math.tan(g.alpha * Math.PI / 180);
    g.r = g.h * g.tan;
    return g;
  }
  function inside(g, x, y) { return g.alpha !== null && y <= g.tip && Math.abs(x - g.rx) <= (g.tip - y) * g.tan + 1e-6; }

  function check(g) {
    var sc = g.sc, res = { items: [] };
    if (sc.ac) {
      var ok = inside(g, sc.ac[0], HB + sc.ac[2]) && inside(g, sc.ac[1], HB + sc.ac[2]);
      res.items.push({ name: "Klimagerät", ok: ok });
    }
    if (st.plane === "boden" || sc.id === "mast") {
      var l = inside(g, sc.bx[0], HB), r = inside(g, sc.bx[1], HB);
      res.items.push({ name: "Dachkante links", ok: l });
      res.items.push({ name: "Dachkante rechts", ok: r });
    }
    return res;
  }

  /* ---------- Zeichnen ---------- */
  var view = {};
  function draw() {
    var g = geo(), sc = g.sc;
    var W = Math.max(300, stage.clientWidth || 700);
    var stacked = window.matchMedia("(max-width: 980px)").matches;
    var legendH = (BS.$(".legend", stage) || { offsetHeight: 0 }).offsetHeight;
    var narrow = W < 560, soil = 44, topPad = narrow ? 64 : 24;
    var Hpx = stacked ? BS.clamp(Math.round(W * (narrow ? 1.05 : 0.85)), 330, 600) : BS.clamp(Math.max(Math.round(W * 0.62), panel.offsetHeight - legendH - 2), 360, 900);
    var worldH = Math.max(g.tip, HB + 2) + 2;
    var spanL = Math.min(sc.bx[0], g.rx - (g.alpha !== null ? g.r : 0)) - 1.5, spanR = Math.max(sc.bx[1], g.rx + (g.alpha !== null ? g.r : 0)) + 1.5;
    var minSpan = narrow ? 11.5 : 16;
    spanL = Math.min(spanL, -minSpan); spanR = Math.max(spanR, minSpan);
    var s = Math.min(W / (spanR - spanL), (Hpx - soil - topPad) / worldH);
    var ox = W / 2 - ((spanL + spanR) / 2) * s, oy = Hpx - soil;
    function X(x) { return ox + x * s; }
    function Y(y) { return oy - y * s; }
    view = { s: s, ox: ox, oy: oy, W: W, H: Hpx };
    svg.setAttribute("viewBox", "0 0 " + W + " " + Hpx); svg.setAttribute("width", W); svg.setAttribute("height", Hpx);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var defs = S("defs", null, svg);
    var gr = S("linearGradient", { id: "sw-sky", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    S("stop", { offset: 0, "stop-color": "#dfe9f6" }, gr); S("stop", { offset: 1, "stop-color": "#f8fbff" }, gr);
    var pat = S("pattern", { id: "sw-soil", width: 8, height: 8, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    S("rect", { width: 8, height: 8, fill: "#e6dccb" }, pat); S("line", { x1: 0, y1: 0, x2: 0, y2: 8, stroke: "#d4c7b0", "stroke-width": 2 }, pat);
    S("rect", { x: 0, y: 0, width: W, height: oy, fill: "url(#sw-sky)" }, svg);
    S("rect", { x: 0, y: oy, width: W, height: Hpx - oy, fill: "url(#sw-soil)" }, svg);

    var res = check(g);
    // Gebäude
    var bad = res.items.some(function (i) { return !i.ok && i.name !== "Klimagerät"; });
    S("rect", { x: X(sc.bx[0]), y: Y(HB), width: (sc.bx[1] - sc.bx[0]) * s, height: HB * s, fill: "#aab6c4", stroke: "#2b3a4f", "stroke-width": 1.6 }, svg);
    // Bezugsebene
    S("line", { x1: 0, x2: W, y1: Y(g.plane), y2: Y(g.plane), stroke: "#2f6fdb", "stroke-width": 1.2, "stroke-dasharray": "8 5" }, svg);
    BS.text(svg, 10, Y(g.plane) - 6, "Bezugsebene", { "font-size": 12, "font-weight": 650, fill: "#1d4fa3", "paint-order": "stroke", stroke: "#fff", "stroke-width": 3 });
    // Schutzkegel
    if (g.alpha !== null) {
      var pts = [X(g.rx) + "," + Y(g.tip), X(g.rx - g.r) + "," + Y(g.plane), X(g.rx + g.r) + "," + Y(g.plane)].join(" ");
      S("polygon", { points: pts, fill: "rgba(21,138,69,.2)", stroke: "#158a45", "stroke-width": 1.6 }, svg);
    }
    // Dachaufbau
    if (sc.ac) {
      var acOk = res.items[0].ok;
      S("rect", { x: X(sc.ac[0]), y: Y(HB + sc.ac[2]), width: (sc.ac[1] - sc.ac[0]) * s, height: sc.ac[2] * s, fill: acOk ? "#8fd1a8" : "#f2a59e", stroke: acOk ? "#0c5a2c" : "#8d241c", "stroke-width": 1.6 }, svg);
      // Beschriftung im Gerät; bei schmaler Darstellung gekürzt
      var acW = (sc.ac[1] - sc.ac[0]) * s, acLabel = acW >= 72 ? "Klimagerät" : acW >= 38 ? "Klima" : "";
      if (acLabel) BS.text(svg, X((sc.ac[0] + sc.ac[1]) / 2), Y(HB + sc.ac[2] / 2) + 4, acLabel, { "font-size": 11.5, "font-weight": 700, fill: acOk ? "#0c5a2c" : "#8d241c", "text-anchor": "middle" });
    }
    // Dachkanten markieren
    res.items.forEach(function (i) {
      if (i.name.indexOf("Dachkante") < 0) return;
      var x = i.name.indexOf("links") > 0 ? sc.bx[0] : sc.bx[1];
      S("circle", { cx: X(x), cy: Y(HB), r: 6, fill: i.ok ? "#158a45" : "#c8372d", stroke: "#fff", "stroke-width": 2 }, svg);
    });
    // Stange / Mast
    S("line", { x1: X(g.rx), y1: Y(g.base), x2: X(g.rx), y2: Y(g.tip), stroke: "#c8372d", "stroke-width": sc.id === "mast" ? 5 : 3.5, "stroke-linecap": "round" }, svg);
    S("circle", { cx: X(g.rx), cy: Y(g.tip), r: 7, fill: "#f5b301", stroke: "#142032", "stroke-width": 1.5, style: "cursor:grab" }, svg);
    // Winkel α
    if (g.alpha !== null) {
      var ar = BS.clamp(g.h * s * 0.55, 18, 48);
      var p0 = [X(g.rx), Y(g.tip) + ar], p1 = [X(g.rx) - ar * Math.sin(g.alpha * Math.PI / 180), Y(g.tip) + ar * Math.cos(g.alpha * Math.PI / 180)];
      S("line", { x1: X(g.rx), y1: Y(g.tip), x2: X(g.rx), y2: Y(g.plane), stroke: "#142032", "stroke-width": 1, "stroke-dasharray": "3 3" }, svg);
      S("path", { d: "M" + p0[0] + " " + p0[1] + " A" + ar + " " + ar + " 0 0 1 " + p1[0] + " " + p1[1], fill: "none", stroke: "#142032", "stroke-width": 1.5 }, svg);
      BS.text(svg, X(g.rx) - ar * 0.55, Y(g.tip) + ar * 1.05, "α", { "font-size": 15, "font-weight": 800, fill: "#142032", "text-anchor": "middle", "paint-order": "stroke", stroke: "#fff", "stroke-width": 4 });
      // r unterhalb der Bezugsebene bemaßen (im Gebäude bzw. im Erdreich), damit nichts mit h kollidiert
      var yr = Y(g.plane) + 12, xr0 = X(g.rx), xr1 = X(g.rx + g.r);
      S("line", { x1: xr0, y1: yr, x2: xr1, y2: yr, stroke: "#0c5a2c", "stroke-width": 1.5 }, svg);
      S("line", { x1: xr0, y1: yr - 5, x2: xr0, y2: yr + 5, stroke: "#0c5a2c", "stroke-width": 1.5 }, svg);
      S("line", { x1: xr1, y1: yr - 5, x2: xr1, y2: yr + 5, stroke: "#0c5a2c", "stroke-width": 1.5 }, svg);
      var rLab = "r = " + BS.num(g.r, 1) + " m", rx = BS.clamp((xr0 + xr1) / 2, 40, W - 40);
      BS.text(svg, rx, yr + 18, rLab, { "font-size": 12.5, "font-weight": 700, fill: "#0c5a2c", "text-anchor": "middle", "paint-order": "stroke", stroke: "#fff", "stroke-width": 4 });
    }
    var hx = X(g.rx) + 14;
    S("line", { x1: hx, y1: Y(g.tip), x2: hx, y2: Y(g.plane), stroke: "#2f6fdb", "stroke-width": 1.5 }, svg);
    BS.text(svg, hx + 5, Y(g.tip) + 0.36 * (Y(g.plane) - Y(g.tip)) + 4, "h = " + BS.num(g.h, 1) + " m", { "font-size": 12.5, "font-weight": 700, fill: "#1d4fa3", "paint-order": "stroke", stroke: "#fff", "stroke-width": 4 });
    svg.setAttribute("aria-label", "Schutzkegel einer Fangstange, Höhe " + BS.num(g.h, 1) + " m, Schutzwinkel " + (g.alpha === null ? "nicht anwendbar" : BS.num(g.alpha, 0) + " Grad"));
    return { g: g, res: res };
  }

  function update() {
    var out = draw(), g = out.g, res = out.res, cls = BS.CLASSES[st.cls];
    readout.innerHTML = "<div><dt>Höhe h über Bezugsebene</dt><dd>" + BS.num(g.h, 1) + " m</dd></div>" +
      "<div><dt>Schutzwinkel α</dt><dd>" + (g.alpha === null ? "–" : BS.num(g.alpha, 0) + "°") + "</dd></div>" +
      '<div class="wide"><dt>Schutzradius auf der Bezugsebene r = h · tan α</dt><dd>' + (g.alpha === null ? "–" : BS.num(g.r, 2) + " m") + "</dd></div>";
    if (g.alpha === null) {
      BS.status(status, "warn", "Schutzwinkelverfahren nicht anwendbar", "Für Klasse " + cls.id + " gilt das Verfahren nur bis h = " + cls.hmax + " m. Darüber Blitzkugel- oder Maschenverfahren verwenden.");
    } else {
      var badItems = res.items.filter(function (i) { return !i.ok; }).map(function (i) { return i.name; });
      if (!res.items.length) BS.status(status, "info", "Schutzbereich auf der Dachfläche", "Alles innerhalb des Kegels ist geschützt. Bezugsebene „Erdboden“ wählen, um das ganze Gebäude zu prüfen.");
      else if (badItems.length) BS.status(status, "bad", "Nicht geschützt: " + badItems.join(", "), "Liegt ein Punkt außerhalb des Kegels, kann der Blitz dort einschlagen. Stange verschieben, verlängern oder weitere Stangen setzen.");
      else BS.status(status, "ok", "Alles im Schutzbereich", "Alle geprüften Punkte liegen innerhalb des Schutzkegels.");
    }
    if (window.BSChart) window.BSChart.mark(st.cls, g.h);
  }

  function setup() {
    var sc = SCENES[st.scene];
    planeSeg.style.display = sc.id === "dach" ? "" : "none";
    xSl.el.style.display = hSl.el.style.display = sc.id === "dach" ? "" : "none";
    mxSl.el.style.display = HSl.el.style.display = sc.id === "mast" ? "" : "none";
    BS.$(".sim__hint", host).textContent = sc.info;
    update();
  }

  /* ---------- Ziehen der Stangenspitze ---------- */
  var drag = false;
  function fromPointer(e) {
    var r = svg.getBoundingClientRect();
    var x = ((e.clientX - r.left) * (view.W / r.width) - view.ox) / view.s;
    var y = (view.oy - (e.clientY - r.top) * (view.H / r.height)) / view.s;
    if (st.scene === "dach") {
      st.x = BS.clamp(Math.round(x * 2) / 2, -9.5, 9.5); st.h = BS.clamp(Math.round((y - HB) * 2) / 2, 0.5, 10);
      xSl.set(st.x); hSl.set(st.h);
    } else {
      var d = BS.clamp(Math.round((-2 - x) * 2) / 2, 1, 20); st.mx = -2 - d; st.H = BS.clamp(Math.round(y * 2) / 2, 2, 60);
      mxSl.set(d); HSl.set(st.H);
    }
    update();
  }
  svg.addEventListener("pointerdown", function (e) { drag = true; svg.setPointerCapture(e.pointerId); fromPointer(e); });
  svg.addEventListener("pointermove", function (e) { if (drag) fromPointer(e); });
  svg.addEventListener("pointerup", function () { drag = false; });

  BS.onResize(stage, function () { update(); });
  setup();
})();

/* ---------- Diagramm α(h) nach DIN EN 62305-3 Bild 1 ---------- */
(function () {
  "use strict";
  var BS = window.BS, S = BS.svg;
  var host = document.getElementById("chart-schutzwinkel");
  if (!host) return;
  var COL = { I: "#c8372d", II: "#e08a00", III: "#2f6fdb", IV: "#158a45" };
  var DASH = { I: "", II: "8 4", III: "2 4", IV: "10 4 2 4" };
  var mark = { cls: "II", h: 4 }, svg = S("svg", { role: "img", "aria-label": "Schutzwinkel α in Abhängigkeit von der Höhe h für die Blitzschutzklassen I bis IV" }, host);
  var tip = document.createElement("div"); tip.className = "chart-tip"; host.appendChild(tip);

  function draw() {
    var W = Math.max(300, host.clientWidth), H = BS.clamp(Math.round(W * 0.5), 260, 420), m = { l: 48, r: 22, t: 26, b: 42 };
    function X(h) { return m.l + h / 60 * (W - m.l - m.r); }
    function Y(a) { return H - m.b - a / 80 * (H - m.t - m.b); }
    svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("width", W); svg.setAttribute("height", H);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    for (var a = 0; a <= 80; a += 10) {
      S("line", { x1: m.l, x2: W - m.r, y1: Y(a), y2: Y(a), stroke: "#e3e9f0" }, svg);
      BS.text(svg, m.l - 8, Y(a) + 4, a + "°", { "font-size": 11.5, fill: "#6c7a8f", "text-anchor": "end" });
    }
    for (var h = 0; h <= 60; h += 10) {
      S("line", { x1: X(h), x2: X(h), y1: m.t, y2: H - m.b, stroke: "#e3e9f0" }, svg);
      BS.text(svg, X(h), H - m.b + 18, String(h), { "font-size": 11.5, fill: "#6c7a8f", "text-anchor": "middle" });
    }
    BS.text(svg, W - m.r, H - 6, "h in m", { "font-size": 12, "font-weight": 650, fill: "#46546a", "text-anchor": "end" });
    BS.text(svg, m.l - 8, 14, "α in °", { "font-size": 12, "font-weight": 650, fill: "#46546a", "text-anchor": "start" });
    S("line", { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: "#142032" }, svg);
    S("line", { x1: m.l, x2: m.l, y1: m.t, y2: H - m.b, stroke: "#142032" }, svg);
    BS.ORDER.forEach(function (k) {
      var t = BS.ANGLES[k], d = "M" + X(0) + " " + Y(t[0]) + " L" + X(2) + " " + Y(t[0]);
      for (var i = 1; i < t.length; i++) d += " L" + X(i + 2) + " " + Y(t[i]);
      var active = k === mark.cls;
      S("path", { d: d, fill: "none", stroke: COL[k], "stroke-width": active ? 3.2 : 2, "stroke-dasharray": DASH[k], opacity: active ? 1 : 0.55 }, svg);
      var last = t.length + 1;
      BS.text(svg, X(last) + 4, Y(t[t.length - 1]) - 6, k, { "font-size": 12.5, "font-weight": 800, fill: COL[k], "paint-order": "stroke", stroke: "#fff", "stroke-width": 3 });
    });
    var a2 = BS.alpha(mark.cls, mark.h);
    if (a2 !== null && mark.h <= 60) {
      S("line", { x1: X(mark.h), x2: X(mark.h), y1: Y(a2), y2: H - m.b, stroke: "#142032", "stroke-dasharray": "3 3" }, svg);
      S("line", { x1: m.l, x2: X(mark.h), y1: Y(a2), y2: Y(a2), stroke: "#142032", "stroke-dasharray": "3 3" }, svg);
      S("circle", { cx: X(mark.h), cy: Y(a2), r: 6, fill: "#f5b301", stroke: "#142032", "stroke-width": 1.5 }, svg);
    }
    var hit = S("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: "transparent" }, svg);
    hit.addEventListener("pointermove", function (e) {
      var r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * (W / r.width);
      var hh = BS.clamp(Math.round((px - m.l) / (W - m.l - m.r) * 60), 0, 60);
      tip.innerHTML = "<b>h = " + hh + " m</b><br>" + BS.ORDER.map(function (k) { var v = BS.alpha(k, hh); return "Klasse " + k + ": " + (v === null ? "–" : v + "°"); }).join("<br>");
      tip.classList.add("is-on"); var tw = tip.offsetWidth || 110; tip.style.left = BS.clamp(px + 12, 0, W - tw - 4) + "px"; tip.style.top = "10px";
    });
    hit.addEventListener("pointerleave", function () { tip.classList.remove("is-on"); });
  }
  window.BSChart = { mark: function (cls, h) { mark.cls = cls; mark.h = h; draw(); } };
  BS.onResize(host, draw);
  draw();
})();
