/* =========================================================================
   Blitzkugelverfahren – 2D-Schnitt
   Die Kugel (Radius R) rollt über Gebäude, Fangstangen und Erdboden.
   Rechenweg:
   1. Alle Konturen werden in Punkte zerlegt (Abstand 0,1 m).
   2. Für jede Kugelposition x gilt: Mittelpunkthöhe = max(py + √(R² − (x − px)²)).
   3. Punkte, die die Kugel dabei berührt, sind einschlaggefährdet.
   4. Der Schutzraum liegt unterhalb der Einhüllenden aller Kugelpositionen.
   ========================================================================= */
(function () {
  "use strict";
  var BS = window.BS, S = BS.svg;
  var host = document.getElementById("sim-blitzkugel");
  if (!host) return;

  /* ---------- Szenen ---------- */
  function rodsFor(sc, st) {
    if (sc.id === "turm") return st.rods ? [{ x: -2, y0: 16, h: st.rodH, name: "Fangstange" }] : [];
    if (sc.id === "sattel") return st.rods ? [{ x: 2.5, y0: 12.5, h: st.rodH, name: "Fangstange" }] : [];
    if (sc.id === "aufbau") return [{ x: -st.d / 2, y0: 8, h: st.rodH, name: "Fangstange" }, { x: st.d / 2, y0: 8, h: st.rodH, name: "Fangstange" }];
    return [];
  }
  var SCENES = {
    turm: {
      id: "turm", name: "Gebäude mit Turm", rodOpt: true, rodLabel: "Fangstange an der Turmkante",
      polys: [{ pts: [[-14, 0], [-14, 16], [-2, 16], [-2, 8], [14, 8], [14, 0]], labels: ["Turmfassade", "Turmdach", "Turmwand", "Flachdach", "Fassade"] }],
      halfW: 14, info: "Zweistöckiges Gebäude: Flachdach in 8 m, Turm in 16 m Höhe."
    },
    sattel: {
      id: "sattel", name: "Satteldach mit Schornstein", rodOpt: true, rodLabel: "Fangstange am Schornstein",
      polys: [
        { pts: [[-7, 0], [-7, 6], [0, 11], [7, 6], [7, 0]], labels: ["Fassade", "Dachfläche", "Dachfläche", "Fassade"] },
        { pts: [[2, 9.6], [2, 12.5], [3, 12.5], [3, 8.9]], labels: ["Schornstein", "Schornstein", "Schornstein"] }
      ],
      halfW: 7, info: "Einfamilienhaus: Traufe 6 m, First 11 m, Schornsteinkopf 12,5 m."
    },
    aufbau: {
      id: "aufbau", name: "Dachaufbau zwischen zwei Fangstangen", rodOpt: false, twoRods: true,
      polys: [
        { pts: [[-16, 0], [-16, 8], [16, 8], [16, 0]], labels: ["Fassade", "Flachdach", "Fassade"] },
        { pts: [[-2.5, 8], [-2.5, 9.5], [2.5, 9.5], [2.5, 8]], labels: ["Klimagerät", "Klimagerät", "Klimagerät"] }
      ],
      halfW: 16, info: "Flachdach in 8 m Höhe mit Klimagerät (5 m breit, 1,5 m hoch)."
    },
    hoch: {
      id: "hoch", name: "Hochhaus", rodOpt: false,
      polys: [{ pts: [[-10, 0], [-10, 70], [10, 70], [10, 0]], labels: ["Fassade", "Dach", "Fassade"] }],
      halfW: 10, info: "Hochhaus mit 70 m Höhe: Ist das Gebäude höher als R, kann der Blitz auch seitlich in die Fassade einschlagen."
    }
  };

  var st = { scene: "turm", cls: "I", pos: 0.38, rods: false, rodH: 4, d: 12, path: true, expo: true, prot: true };

  /* ---------- Bedienfeld ---------- */
  var stage = BS.$(".sim__stage", host), panel = BS.$(".sim__panel", host);
  BS.segmented(panel, "Gebäude", Object.keys(SCENES).map(function (k) { return { value: k, label: SCENES[k].name.replace(" zwischen zwei Fangstangen", "") }; }), st.scene, function (v) { st.scene = v; setup(); });
  BS.segmented(panel, "Blitzschutzklasse", BS.ORDER.map(function (k) { return { value: k, label: k + "<br><small>R = " + BS.CLASSES[k].R + " m</small>" }; }), st.cls, function (v) { st.cls = v; compute(); draw(); }, "seg--classes");
  var posSl = BS.slider(panel, { label: "Kugel abrollen", min: 0, max: 1000, step: 1, value: st.pos * 1000, format: function () { return ""; }, onInput: function (v) { st.pos = v / 1000; stopPlay(); draw(); }, help: "Oder die Kugel im Bild direkt mit der Maus bzw. dem Finger verschieben." });
  var playRow = document.createElement("div"); playRow.className = "btn-row";
  var playBtn = document.createElement("button"); playBtn.type = "button"; playBtn.className = "btn"; playBtn.textContent = "Kugel automatisch abrollen";
  playRow.appendChild(playBtn); panel.appendChild(playRow);
  var rodBox = document.createElement("div"); rodBox.className = "ctl"; panel.appendChild(rodBox);
  var rodToggle = BS.toggle(rodBox, "Fangstange setzen", st.rods, function (v) { st.rods = v; rodSl.el.style.display = v ? "" : "none"; compute(); draw(); });
  var rodSl = BS.slider(rodBox, { label: "Höhe der Fangstange", min: 0.5, max: 10, step: 0.5, value: st.rodH, format: function (v) { return BS.num(v, 1) + " m"; }, onInput: function (v) { st.rodH = v; compute(); draw(); } });
  var dSl = BS.slider(panel, { label: "Abstand der Fangstangen d", min: 6, max: 30, step: 0.5, value: st.d, format: function (v) { return BS.num(v, 1) + " m"; }, onInput: function (v) { st.d = v; compute(); draw(); } });
  var viewBox = document.createElement("div"); viewBox.className = "ctl"; panel.appendChild(viewBox);
  BS.toggle(viewBox, "Einschlaggefährdete Stellen markieren", st.expo, function (v) { st.expo = v; draw(); });
  BS.toggle(viewBox, "Schutzraum einfärben", st.prot, function (v) { st.prot = v; draw(); });
  BS.toggle(viewBox, "Bahn des Kugelmittelpunkts", st.path, function (v) { st.path = v; draw(); });
  var readout = document.createElement("dl"); readout.className = "readout"; panel.appendChild(readout);
  var status = document.createElement("div"); panel.appendChild(status);

  var svg = S("svg", { role: "img", "aria-label": "Schnitt durch das Gebäude mit Blitzkugel" });
  stage.insertBefore(svg, BS.$(".legend", stage));

  /* ---------- Geometrie ---------- */
  var M = {}; // Rechenergebnisse

  function samplesOf(sc) {
    var pts = [], rods = rodsFor(sc, st);
    sc.polys.forEach(function (p, pi) {
      for (var i = 0; i < p.pts.length - 1; i++) {
        var a = p.pts[i], b = p.pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / 0.1));
        var vertical = Math.abs(b[0] - a[0]) < 1e-9;
        for (var k = 0; k <= n; k++) {
          // Ecken gehören zur Dachkante, nicht zur senkrechten Wand
          if (vertical && (k === 0 || k === n)) continue;
          var x = a[0] + (b[0] - a[0]) * k / n, y = a[1] + (b[1] - a[1]) * k / n;
          if (y < 0.05) continue;
          pts.push({ x: x, y: y, label: p.labels[i], kind: "bau", edge: pi + ":" + i, wall: vertical });
        }
      }
    });
    rods.forEach(function (r, ri) {
      var n = Math.ceil(r.h / 0.1);
      for (var k = 0; k <= n; k++) pts.push({ x: r.x, y: r.y0 + r.h * k / n, label: r.name, kind: "rod", edge: "r" + ri });
    });
    // Erdboden außerhalb des Gebäudes
    var span = sc.halfW + BS.CLASSES.IV.R * 1.6;
    for (var gx = -span; gx <= span; gx += 0.25) {
      if (Math.abs(gx) < sc.halfW - 0.01) continue;
      pts.push({ x: gx, y: 0, label: "Erdboden", kind: "ground", edge: "g" });
    }
    return pts;
  }

  function compute() {
    var sc = SCENES[st.scene], R = BS.CLASSES[st.cls].R;
    var pts = samplesOf(sc);
    var xmin = -(sc.halfW + R * 1.15), xmax = sc.halfW + R * 1.15, dc = 0.1;
    var cxs = [], cys = [];
    // Punkte nach x sortieren für schnellen Bereichszugriff
    pts.sort(function (a, b) { return a.x - b.x; });
    var xs = pts.map(function (p) { return p.x; });
    function lowerIdx(v) { var lo = 0, hi = xs.length; while (lo < hi) { var m = (lo + hi) >> 1; if (xs[m] < v) lo = m + 1; else hi = m; } return lo; }
    var touched = new Uint8Array(pts.length);
    for (var cx = xmin; cx <= xmax + 1e-9; cx += dc) {
      var i0 = lowerIdx(cx - R), i1 = lowerIdx(cx + R), best = R, j;
      for (j = i0; j < i1; j++) {
        var dx = pts[j].x - cx, c = pts[j].y + Math.sqrt(Math.max(0, R * R - dx * dx));
        if (c > best) best = c;
      }
      for (j = i0; j < i1; j++) {
        var dx2 = pts[j].x - cx, c2 = pts[j].y + Math.sqrt(Math.max(0, R * R - dx2 * dx2));
        if (c2 >= best - 0.025) touched[j] = 1;
      }
      cxs.push(cx); cys.push(best);
    }
    // Schutzraum: untere Einhüllende aller Kugelpositionen
    var prot = [];
    for (var a = 0; a < cxs.length; a++) {
      var x = cxs[a], lo = Infinity;
      for (var b = Math.max(0, a - Math.ceil(R / dc)); b <= Math.min(cxs.length - 1, a + Math.ceil(R / dc)); b++) {
        var ddx = x - cxs[b];
        if (Math.abs(ddx) > R) continue;
        var yb = cys[b] - Math.sqrt(R * R - ddx * ddx);
        if (yb < lo) lo = yb;
      }
      prot.push(Math.max(0, lo));
    }
    // Seitliche Berührung senkrechter Flächen (Kugel gleitet an der Fassade herab)
    function emptyCircle(cx, cy, self) {
      if (cy < R - 1e-6) return false;
      var i0 = lowerIdx(cx - R), i1 = lowerIdx(cx + R);
      for (var q = i0; q < i1; q++) {
        if (q === self) continue;
        if (Math.hypot(pts[q].x - cx, pts[q].y - cy) < R - 0.03) return false;
      }
      return true;
    }
    for (var v = 0; v < pts.length; v++) {
      if (touched[v] || pts[v].kind !== "bau" || !pts[v].wall) continue;
      if (emptyCircle(pts[v].x - R, pts[v].y, v) || emptyCircle(pts[v].x + R, pts[v].y, v)) touched[v] = 1;
    }
    // Bahn des Mittelpunkts mit senkrechten Gleitstücken
    var path = [];
    for (var u = 0; u < cxs.length; u++) {
      if (u > 0 && Math.abs(cys[u] - cys[u - 1]) > 0.3) {
        var xs2 = cys[u] < cys[u - 1] ? cxs[u] : cxs[u - 1], ya = cys[u - 1], yb = cys[u], n2 = Math.ceil(Math.abs(yb - ya) / 0.2);
        for (var w = 1; w < n2; w++) path.push({ x: xs2, y: ya + (yb - ya) * w / n2 });
      }
      path.push({ x: cxs[u], y: cys[u] });
    }
    M = { sc: sc, R: R, pts: pts, touched: touched, cxs: cxs, cys: cys, prot: prot, path: path, xmin: xmin, xmax: xmax, rods: rodsFor(sc, st) };
    summary();
  }

  function centerAt(t) {
    var i = Math.round(t * (M.path.length - 1));
    return { i: i, x: M.path[i].x, y: M.path[i].y };
  }

  /* ---------- Zeichnen ---------- */
  var view = {};
  function draw() {
    var W = Math.max(300, stage.clientWidth || 700), sc = M.sc, R = M.R;
    var maxH = 0;
    sc.polys.forEach(function (p) { p.pts.forEach(function (q) { maxH = Math.max(maxH, q[1]); }); });
    M.rods.forEach(function (r) { maxH = Math.max(maxH, r.y0 + r.h); });
    var worldH = maxH + Math.min(R * 0.8, Math.max(14, R * 0.8)) + 4;
    var halfX = Math.max(sc.halfW + R * 0.75, 30);
    var stacked = window.matchMedia("(max-width: 980px)").matches;
    var legendH = (BS.$(".legend", stage) || { offsetHeight: 0 }).offsetHeight;
    var Hpx = stacked ? BS.clamp(Math.round(W * 0.9), 320, 620) : BS.clamp(Math.max(Math.round(W * 0.62), panel.offsetHeight - legendH - 2), 360, 980);
    var s = Math.min(W / (2 * halfX), (Hpx - 36) / (worldH + 2));
    var ox = W / 2, oy = Hpx - 28;
    function X(x) { return ox + x * s; }
    function Y(y) { return oy - y * s; }
    view = { s: s, ox: ox, oy: oy, W: W, H: Hpx };
    svg.setAttribute("viewBox", "0 0 " + W + " " + Hpx);
    svg.setAttribute("width", W); svg.setAttribute("height", Hpx);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var defs = S("defs", null, svg);
    var g1 = S("linearGradient", { id: "bk-sky", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    S("stop", { offset: 0, "stop-color": "#dfe9f6" }, g1); S("stop", { offset: 1, "stop-color": "#f8fbff" }, g1);
    var pat = S("pattern", { id: "bk-soil", width: 8, height: 8, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    S("rect", { width: 8, height: 8, fill: "#e6dccb" }, pat); S("line", { x1: 0, y1: 0, x2: 0, y2: 8, stroke: "#d4c7b0", "stroke-width": 2 }, pat);
    S("rect", { x: 0, y: 0, width: W, height: oy, fill: "url(#bk-sky)" }, svg);
    S("rect", { x: 0, y: oy, width: W, height: Hpx - oy, fill: "url(#bk-soil)" }, svg);

    // Schutzraum
    if (st.prot) {
      var d = "M" + X(M.cxs[0]) + " " + Y(0);
      for (var i = 0; i < M.cxs.length; i += 2) d += " L" + X(M.cxs[i]).toFixed(1) + " " + Y(M.prot[i]).toFixed(1);
      d += " L" + X(M.cxs[M.cxs.length - 1]) + " " + Y(0) + " Z";
      S("path", { d: d, fill: "rgba(21,138,69,.22)", stroke: "#158a45", "stroke-width": 1.5, "stroke-dasharray": "5 4" }, svg);
    }
    // Bahn des Mittelpunkts
    if (st.path) {
      var dp = "";
      for (var j = 0; j < M.path.length; j += 3) dp += (j ? " L" : "M") + X(M.path[j].x).toFixed(1) + " " + Y(M.path[j].y).toFixed(1);
      S("path", { d: dp, fill: "none", stroke: "#2f6fdb", "stroke-width": 1.2, "stroke-dasharray": "2 5", opacity: 0.8 }, svg);
    }
    // Kugel (Fläche)
    var c = centerAt(st.pos);
    S("circle", { cx: X(c.x), cy: Y(c.y), r: R * s, fill: "rgba(47,111,219,.13)" }, svg);
    // Gebäude
    sc.polys.forEach(function (p) {
      S("polygon", { points: p.pts.map(function (q) { return X(q[0]) + "," + Y(q[1]); }).join(" "), fill: "#aab6c4", stroke: "#2b3a4f", "stroke-width": 1.6, "stroke-linejoin": "round" }, svg);
    });
    // Fangstangen
    M.rods.forEach(function (r) {
      S("line", { x1: X(r.x), y1: Y(r.y0), x2: X(r.x), y2: Y(r.y0 + r.h), stroke: "#c8372d", "stroke-width": 3.5, "stroke-linecap": "round" }, svg);
    });
    // Einschlaggefährdete Stellen
    if (st.expo) {
      var runs = {}, k;
      for (k = 0; k < M.pts.length; k++) {
        if (!M.touched[k] || M.pts[k].kind === "rod") continue;
        (runs[M.pts[k].edge] = runs[M.pts[k].edge] || []).push(M.pts[k]);
      }
      Object.keys(runs).forEach(function (e) {
        var arr = runs[e];
        arr.sort(function (a, b) { return a.x - b.x || a.y - b.y; });
        var seg = [arr[0]];
        function flush() {
          if (seg.length === 1) S("circle", { cx: X(seg[0].x), cy: Y(seg[0].y), r: 3.6, fill: "#c8372d" }, svg);
          else S("polyline", { points: seg.map(function (p) { return X(p.x) + "," + Y(p.y); }).join(" "), fill: "none", stroke: e === "g" ? "rgba(200,55,45,.55)" : "#c8372d", "stroke-width": e === "g" ? 3 : 5, "stroke-linecap": "round" }, svg);
        }
        for (var m = 1; m < arr.length; m++) {
          var prev = seg[seg.length - 1];
          if (Math.hypot(arr[m].x - prev.x, arr[m].y - prev.y) < 0.6) seg.push(arr[m]);
          else { flush(); seg = [arr[m]]; }
        }
        flush();
      });
    }
    // Kugel (Umriss) und Berührungspunkte
    S("circle", { cx: X(c.x), cy: Y(c.y), r: R * s, fill: "none", stroke: "#2f6fdb", "stroke-width": 2 }, svg);
    var contacts = contactsAt(c);
    var cp = contacts.length ? contacts[0] : null;
    if (cp) {
      S("line", { x1: X(c.x), y1: Y(c.y), x2: X(cp.x), y2: Y(cp.y), stroke: "#2f6fdb", "stroke-width": 1.5 }, svg);
      var mx = (X(c.x) + X(cp.x)) / 2, my = (Y(c.y) + Y(cp.y)) / 2;
      BS.text(svg, mx + 8, my, "R = " + R + " m", { "font-size": 13, "font-weight": 700, fill: "#1d4fa3", "paint-order": "stroke", stroke: "#fff", "stroke-width": 4 });
    }
    S("circle", { cx: X(c.x), cy: Y(c.y), r: 3.5, fill: "#2f6fdb" }, svg);
    contacts.forEach(function (p) {
      S("circle", { cx: X(p.x), cy: Y(p.y), r: 9, fill: "rgba(245,179,1,.45)" }, svg);
      S("path", { d: "M" + (X(p.x) + 2) + " " + (Y(p.y) - 26) + " l-7 12 h6 l-4 11 l11 -15 h-6 z", fill: "#f5b301", stroke: "#7a5800", "stroke-width": 1 }, svg);
    });
    // Maßstab
    var step = R >= 45 ? 20 : 10, bx = 14, by = Hpx - 10;
    S("line", { x1: bx, y1: by, x2: bx + step * s, y2: by, stroke: "#142032", "stroke-width": 2 }, svg);
    S("line", { x1: bx, y1: by - 4, x2: bx, y2: by + 2, stroke: "#142032", "stroke-width": 2 }, svg);
    S("line", { x1: bx + step * s, y1: by - 4, x2: bx + step * s, y2: by + 2, stroke: "#142032", "stroke-width": 2 }, svg);
    BS.text(svg, bx + step * s + 6, by + 4, step + " m", { "font-size": 12, fill: "#142032", "font-weight": 600 });
    // Abstand d bei zwei Fangstangen
    if (sc.twoRods) {
      var yd = Y(8 + st.rodH) - 14;
      S("line", { x1: X(-st.d / 2), y1: yd, x2: X(st.d / 2), y2: yd, stroke: "#142032", "stroke-width": 1.2 }, svg);
      BS.text(svg, X(0), yd - 5, "d = " + BS.num(st.d, 1) + " m", { "font-size": 12.5, "font-weight": 700, fill: "#142032", "text-anchor": "middle", "paint-order": "stroke", stroke: "#fff", "stroke-width": 4 });
    }
    svg.setAttribute("aria-label", "Blitzkugel mit R = " + R + " m über " + sc.name + ". Berührt: " + (contacts.map(function (p) { return p.label; }).filter(uniq).join(", ") || "nichts"));
    // Positionsanzeige im Bedienfeld
    posSl.el.querySelector(".ctl__value").textContent = contacts.length ? "berührt " + contacts.map(function (p) { return p.label; }).filter(uniq).join(", ") : "";
  }
  function uniq(v, i, a) { return a.indexOf(v) === i; }

  function contactsAt(c) {
    var out = [], R = M.R;
    M.pts.forEach(function (p) {
      if (Math.abs(p.x - c.x) > R + 0.2) return;
      if (Math.hypot(p.x - c.x, p.y - c.y) <= R + 0.15) out.push(p);
    });
    // Mehrere Punkte derselben Stelle zusammenfassen
    var merged = [];
    out.forEach(function (p) { if (!merged.some(function (q) { return Math.hypot(q.x - p.x, q.y - p.y) < 1.2; })) merged.push(p); });
    return merged;
  }

  /* ---------- Auswertung ---------- */
  function summary() {
    var cls = BS.CLASSES[st.cls], sc = M.sc, exposed = [];
    M.pts.forEach(function (p, i) { if (M.touched[i] && p.kind === "bau" && exposed.indexOf(p.label) < 0) exposed.push(p.label); });
    var rows = "<div><dt>Klasse</dt><dd>" + cls.id + "</dd></div><div><dt>Kugelradius R</dt><dd>" + cls.R + " m</dd></div>" +
      '<div class="wide"><dt>Kleinster erfasster Blitzstrom (R = 10 · I<sup>0,65</sup>)</dt><dd>' + cls.Imin + " kA</dd></div>";
    if (sc.twoRods) {
      var p = BS.penetration(cls.R, st.d);
      var free = 8 + st.rodH - p; // tiefster Punkt der Kugel zwischen den Stangen
      rows += '<div class="wide"><dt>Eindringtiefe p = R − √(R² − (d/2)²)</dt><dd>' + BS.num(p, 2) + " m</dd></div>" +
        '<div class="wide"><dt>Tiefster Kugelpunkt zwischen den Stangen</dt><dd>' + BS.num(free, 2) + " m über Grund (Dach 8 m, Klimagerät 9,5 m)</dd></div>";
    }
    readout.innerHTML = rows;
    var bad = exposed;
    if (sc.twoRods) {
      var ac = exposed.indexOf("Klimagerät") >= 0;
      if (ac) BS.status(status, "bad", "Klimagerät ungeschützt", "Die Kugel sinkt zwischen den Fangstangen bis auf das Gerät. Stangen höher setzen oder enger stellen.");
      else BS.status(status, "ok", "Klimagerät im Schutzraum", "Die Kugel liegt nur auf den Fangstangen auf. Die Dachfläche außerhalb braucht weiterhin eine Fangeinrichtung.");
    } else if (sc.id === "hoch") {
      var side = M.pts.some(function (q, i) { return M.touched[i] && q.label === "Fassade" && q.y > 1; });
      BS.status(status, side ? "bad" : "ok", side ? "Seiteneinschlag möglich" : "Kein Seiteneinschlag", side ? "Oberhalb der Höhe R berührt die Kugel die Fassade. Hier kann der Blitz seitlich einschlagen. Bei hohen Gebäuden sieht die Norm deshalb Fangeinrichtungen im oberen Fassadenbereich vor, besonders an Kanten und Ecken." : "Die Kugel berührt nur Dach und Dachkanten.");
    } else if (bad.length) {
      BS.status(status, "bad", "Einschlaggefährdet: " + bad.join(", "), "An den rot markierten Stellen berührt die Kugel das Gebäude. Dort ist eine Fangeinrichtung nötig.");
    } else {
      BS.status(status, "ok", "Alle Gebäudeteile geschützt", "Die Kugel berührt nur Fangeinrichtungen und den Erdboden.");
    }
  }

  /* ---------- Szene wechseln ---------- */
  function setup() {
    var sc = SCENES[st.scene];
    rodBox.style.display = sc.rodOpt ? "" : "none";
    BS.$("input", rodToggle).checked = st.rods;
    rodToggle.lastChild.textContent = " " + (sc.rodLabel || "Fangstange setzen");
    rodSl.el.style.display = (sc.rodOpt && st.rods) || sc.twoRods ? "" : "none";
    if (sc.twoRods) { rodBox.style.display = ""; rodToggle.style.display = "none"; rodSl.el.style.display = ""; }
    else rodToggle.style.display = "";
    dSl.el.style.display = sc.twoRods ? "" : "none";
    BS.$(".sim__hint", host).textContent = sc.info;
    compute(); draw();
  }

  /* ---------- Ziehen und Abrollen ---------- */
  function setFromPointer(e) {
    var r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * (view.W / r.width);
    var py = (e.clientY - r.top) * (view.H / r.height);
    var x = (px - view.ox) / view.s, y = (view.oy - py) / view.s, best = 0, bd = Infinity;
    // nächstgelegene Stelle der Mittelpunktsbahn suchen (Zeiger zieht die Kugel)
    for (var i = 0; i < M.path.length; i += 2) {
      var dd = Math.abs(M.path[i].x - x) * 3 + Math.abs(M.path[i].y - y - M.R * 0.5) * 0.15;
      if (dd < bd) { bd = dd; best = i; }
    }
    st.pos = best / (M.path.length - 1);
    posSl.set(st.pos * 1000);
    draw();
  }
  var dragging = false;
  svg.addEventListener("pointerdown", function (e) { dragging = true; stopPlay(); svg.setPointerCapture(e.pointerId); setFromPointer(e); });
  svg.addEventListener("pointermove", function (e) { if (dragging) setFromPointer(e); });
  svg.addEventListener("pointerup", function () { dragging = false; });
  var timer = null;
  function stopPlay() { if (timer) { cancelAnimationFrame(timer); timer = null; playBtn.textContent = "Kugel automatisch abrollen"; } }
  playBtn.addEventListener("click", function () {
    if (timer) { stopPlay(); return; }
    if (st.pos > 0.99) st.pos = 0;
    playBtn.textContent = "Anhalten";
    var last = performance.now();
    function step(t) {
      var dt = (t - last) / 1000; last = t;
      st.pos = Math.min(1, st.pos + dt * 0.08);
      posSl.set(st.pos * 1000); draw();
      if (st.pos < 1) timer = requestAnimationFrame(step); else stopPlay();
    }
    timer = requestAnimationFrame(step);
  });

  BS.onResize(stage, function () { if (M.cxs) draw(); });
  setup();
})();
