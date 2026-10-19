/* =========================================================================
   LUMIATECH – Schaltungs-Check: Leitet die Diode oder sperrt sie?
   Platzhalter: <div data-sim="schaltung" data-title="…" data-hint="…"></div>
   Modell: Si-Diode leitet mit konstant 0,7 V oder sperrt (I = 0).
   Rechenkern: Knotenpotenzialverfahren (MNA) für alle Diodenzustände,
   gültig ist die Kombination, die mit dem Diodenmodell übereinstimmt.
   Neue Schaltung? Einfach im Array CIRCUITS ergänzen.
   ========================================================================= */
(function () {
  "use strict";
  var LT = window.LT;
  var UD = 0.7;

  /* Bauteile: V (Quelle), R (Widerstand), D (Diode). a/b = Knoten (0 = Masse).
     Zeichnung: x1,y1,x2,y2 = Anschlusspunkte im SVG (Diode: a = Anode im Grundzustand). */
  var CIRCUITS = [
    {
      id: "reihe", name: "Reihenschaltung",
      parts: [
        { t: "V", name: "G1", a: 1, b: 0, U: 5, x1: 70, y1: 70, x2: 70, y2: 230 },
        { t: "R", name: "R1", a: 1, b: 2, R: 1000, x1: 70, y1: 70, x2: 420, y2: 70, at: 0.45 },
        { t: "D", name: "V1", a: 2, b: 0, x1: 420, y1: 70, x2: 420, y2: 230 }
      ],
      wires: ["M70 70 H420 V230 H70 Z"]
    },
    {
      id: "parallel", name: "Diode parallel zu R2",
      parts: [
        { t: "V", name: "G1", a: 1, b: 0, U: 9, x1: 70, y1: 70, x2: 70, y2: 230 },
        { t: "R", name: "R1", a: 1, b: 2, R: 1000, x1: 70, y1: 70, x2: 300, y2: 70, at: 0.55 },
        { t: "R", name: "R2", a: 2, b: 0, R: 2200, x1: 300, y1: 70, x2: 300, y2: 230 },
        { t: "D", name: "V1", a: 2, b: 0, x1: 440, y1: 70, x2: 440, y2: 230 }
      ],
      wires: ["M70 70 H440 V230 H70 Z", "M300 70 V230"],
      dots: [[300, 70], [300, 230]]
    },
    {
      id: "zweige", name: "Zwei Zweige",
      parts: [
        { t: "V", name: "G1", a: 1, b: 0, U: 5, x1: 70, y1: 50, x2: 70, y2: 250 },
        { t: "R", name: "R1", a: 1, b: 2, R: 470, x1: 260, y1: 50, x2: 260, y2: 150 },
        { t: "D", name: "V1", a: 2, b: 0, x1: 260, y1: 150, x2: 260, y2: 250 },
        { t: "R", name: "R2", a: 1, b: 3, R: 1000, x1: 440, y1: 50, x2: 440, y2: 150 },
        { t: "D", name: "V2", a: 0, b: 3, x1: 440, y1: 250, x2: 440, y2: 150 }
      ],
      wires: ["M70 50 H440 V250 H70 Z", "M260 50 V250"],
      dots: [[260, 50], [260, 250]]
    }
  ];

  /* ---------- Rechenkern ---------- */
  function gauss(A, b) {
    var n = b.length;
    for (var i = 0; i < n; i++) {
      var p = i;
      for (var r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
      if (Math.abs(A[p][i]) < 1e-12) return null;
      var t = A[i]; A[i] = A[p]; A[p] = t; var tb = b[i]; b[i] = b[p]; b[p] = tb;
      for (var r2 = i + 1; r2 < n; r2++) {
        var f = A[r2][i] / A[i][i];
        for (var c = i; c < n; c++) A[r2][c] -= f * A[i][c];
        b[r2] -= f * b[i];
      }
    }
    var x = new Array(n);
    for (var k = n - 1; k >= 0; k--) {
      var s = b[k];
      for (var j = k + 1; j < n; j++) s -= A[k][j] * x[j];
      x[k] = s / A[k][k];
    }
    return x;
  }

  function solve(circ, flips) {
    var parts = circ.parts, N = 0;
    parts.forEach(function (p) { N = Math.max(N, p.a, p.b); });
    var diodes = parts.filter(function (p) { return p.t === "D"; });
    var nd = diodes.length;
    for (var mask = 0; mask < (1 << nd); mask++) {
      var srcs = [];
      parts.forEach(function (p) { if (p.t === "V") srcs.push({ p: p.a, n: p.b, E: p.U, part: p }); });
      diodes.forEach(function (d, i) {
        if (mask & (1 << i)) {
          var an = flips[d.name] ? d.b : d.a, ka = flips[d.name] ? d.a : d.b;
          srcs.push({ p: an, n: ka, E: UD, part: d });
        }
      });
      var size = N + srcs.length, A = [], rhs = [];
      for (var i = 0; i < size; i++) { A.push(new Array(size).fill(0)); rhs.push(0); }
      parts.forEach(function (p) {
        if (p.t !== "R") return;
        var g = 1 / p.R, a = p.a - 1, b = p.b - 1;
        if (a >= 0) A[a][a] += g; if (b >= 0) A[b][b] += g;
        if (a >= 0 && b >= 0) { A[a][b] -= g; A[b][a] -= g; }
      });
      srcs.forEach(function (s, k) {
        var row = N + k, pp = s.p - 1, nn = s.n - 1;
        if (pp >= 0) { A[pp][row] += 1; A[row][pp] += 1; }
        if (nn >= 0) { A[nn][row] -= 1; A[row][nn] -= 1; }
        rhs[row] = s.E;
      });
      var x = gauss(A, rhs);
      if (!x) continue;
      var V = [0].concat(x.slice(0, N));
      var ok = true, out = {};
      srcs.forEach(function (s, k) {
        var I = x[N + k];
        if (s.part.t === "D") { if (I < -1e-9) ok = false; out[s.part.name] = { on: true, I: I, U: UD }; }
        else out[s.part.name] = { I: -I, U: s.E };
      });
      diodes.forEach(function (d, i) {
        if (mask & (1 << i)) return;
        var an = flips[d.name] ? d.b : d.a, ka = flips[d.name] ? d.a : d.b;
        var uak = V[an] - V[ka];
        if (uak > UD + 1e-9) ok = false;
        out[d.name] = { on: false, I: 0, U: uak };
      });
      if (!ok) continue;
      parts.forEach(function (p) { if (p.t === "R") out[p.name] = { I: (V[p.a] - V[p.b]) / p.R, U: V[p.a] - V[p.b] }; });
      return out;
    }
    return null;
  }
  LT.solveDiodeCircuit = solve;

  /* ---------- Zeichnen ---------- */
  function resistor(p, res, show) {
    var vert = p.x1 === p.x2, at = p.at || 0.5;
    var cx = p.x1 + (p.x2 - p.x1) * at, cy = p.y1 + (p.y2 - p.y1) * at;
    var active = res && Math.abs(res.I) > 1e-7;
    var w = vert ? 22 : 64, h = vert ? 64 : 22;
    var s = '<rect x="' + (cx - w / 2) + '" y="' + (cy - h / 2) + '" width="' + w + '" height="' + h + '" fill="' + (active ? "#fff3c4" : "#fff") + '" stroke="#17202b" stroke-width="2.5"/>';
    var lx = vert ? cx + 20 : cx, ly = vert ? cy - 4 : cy - 20;
    s += '<text x="' + lx + '" y="' + ly + '" text-anchor="' + (vert ? "start" : "middle") + '" font-size="13" font-weight="700" fill="#17202b">' + p.name + "</text>";
    s += '<text x="' + lx + '" y="' + (ly + 15) + '" text-anchor="' + (vert ? "start" : "middle") + '" font-size="12" fill="#4a5563">' + LT.fmtR(p.R) + "</text>";
    if (show && res) s += '<text x="' + lx + '" y="' + (ly + (vert ? 31 : -16)) + '" text-anchor="' + (vert ? "start" : "middle") + '" font-size="11.5" font-weight="650" fill="#8a6400">' + LT.num(Math.abs(res.U), 2) + " V | " + LT.fmtI(Math.abs(res.I)) + "</text>";
    return s;
  }
  function diode(p, res, flipped, show) {
    var cx = (p.x1 + p.x2) / 2, cy = (p.y1 + p.y2) / 2;
    // Richtung Anode -> Kathode im Grundzustand
    var dx = Math.sign(p.x2 - p.x1), dy = Math.sign(p.y2 - p.y1);
    if (flipped) { dx = -dx; dy = -dy; }
    var on = res && res.on, f = on ? "#ffc400" : "#fff";
    var s = '<g class="sc-diode" data-name="' + p.name + '" tabindex="0" role="button" aria-label="Diode ' + p.name + ' umdrehen, zurzeit ' + (on ? "leitend" : "sperrend") + '" style="cursor:pointer">';
    s += '<rect x="' + (cx - 30) + '" y="' + (cy - 30) + '" width="60" height="60" fill="transparent"/>';
    var tri, bar;
    if (dy !== 0) {
      tri = "M" + (cx - 15) + " " + (cy - 15 * dy) + " h30 L" + cx + " " + (cy + 15 * dy) + "z";
      bar = '<line x1="' + (cx - 16) + '" y1="' + (cy + 15 * dy) + '" x2="' + (cx + 16) + '" y2="' + (cy + 15 * dy) + '" stroke="#17202b" stroke-width="3.5"/>';
    } else {
      tri = "M" + (cx - 15 * dx) + " " + (cy - 15) + " v30 L" + (cx + 15 * dx) + " " + cy + "z";
      bar = '<line x1="' + (cx + 15 * dx) + '" y1="' + (cy - 16) + '" x2="' + (cx + 15 * dx) + '" y2="' + (cy + 16) + '" stroke="#17202b" stroke-width="3.5"/>';
    }
    s += '<path d="' + tri + '" fill="' + f + '" stroke="#17202b" stroke-width="2.5" stroke-linejoin="round"/>' + bar;
    s += '<circle cx="' + (cx - 30) + '" cy="' + (cy - 26) + '" r="11" fill="#17202b"/><path d="M' + (cx - 35) + " " + (cy - 28) + "a5 5 0 1 1 1 5" + '" fill="none" stroke="#ffc400" stroke-width="1.8"/>';
    s += "</g>";
    var tx = cx + 26, ty = cy - 2;
    s += '<text x="' + tx + '" y="' + ty + '" font-size="13" font-weight="700" fill="#17202b">' + p.name + "</text>";
    s += '<text x="' + tx + '" y="' + (ty + 16) + '" font-size="12.5" font-weight="700" fill="' + (on ? "#0d5b2a" : "#6b7684") + '">' + (on ? "leitet" : "sperrt") + "</text>";
    if (show && res) s += '<text x="' + tx + '" y="' + (ty + 32) + '" font-size="11.5" font-weight="650" fill="#8a6400">' + LT.num(Math.abs(res.U), 2) + " V | " + LT.fmtI(Math.abs(res.I)) + "</text>";
    return s;
  }
  function source(p, res, show) {
    var cx = p.x1, cy = (p.y1 + p.y2) / 2;
    var s = '<circle cx="' + cx + '" cy="' + cy + '" r="24" fill="#fff" stroke="#17202b" stroke-width="2.5"/><line x1="' + cx + '" y1="' + (cy - 24) + '" x2="' + cx + '" y2="' + (cy + 24) + '" stroke="#17202b" stroke-width="2"/>';
    s += '<text x="' + (cx + 32) + '" y="' + (cy - 14) + '" font-size="16" font-weight="800" fill="#d3262b">+</text><text x="' + (cx + 32) + '" y="' + (cy + 24) + '" font-size="18" font-weight="800" fill="#1f5bd8">–</text>';
    s += '<text x="' + (cx - 32) + '" y="' + (cy - 2) + '" text-anchor="end" font-size="13" font-weight="700" fill="#17202b">' + p.name + '</text><text x="' + (cx - 32) + '" y="' + (cy + 14) + '" text-anchor="end" font-size="12" fill="#4a5563">' + LT.num(p.U, 0) + " V</text>";
    if (show && res) s += '<text x="' + (cx - 32) + '" y="' + (cy + 30) + '" text-anchor="end" font-size="11.5" font-weight="650" fill="#8a6400">' + LT.fmtI(Math.abs(res.I)) + "</text>";
    return s;
  }

  LT.$$('[data-sim="schaltung"]').forEach(function (host) {
    var ui = LT.lab(host, { icon: "circuit" });
    var show = !!LT.config.messwerteAnzeigen;
    var st = { idx: 0, flips: {} };
    LT.segmented(ui.controls, "Schaltung", CIRCUITS.map(function (c, i) { return { value: String(i), label: c.name }; }), "0", function (v) { st.idx = +v; st.flips = {}; draw(); });
    var hint = document.createElement("p");
    hint.className = "ctl__help";
    hint.textContent = "Tippen Sie auf eine Diode, um sie umzudrehen.";
    ui.controls.appendChild(hint);
    var summary = document.createElement("div");
    summary.className = "pn-explain";
    ui.controls.appendChild(summary);

    var stage = document.createElement("div");
    stage.className = "sc-stage";
    ui.stage.appendChild(stage);

    function draw() {
      var c = CIRCUITS[st.idx], res = solve(c, st.flips) || {};
      var h = '<svg viewBox="0 0 540 290" role="img" aria-label="Schaltplan ' + c.name + '">';
      c.wires.forEach(function (d) { h += '<path d="' + d + '" fill="none" stroke="#17202b" stroke-width="2.5"/>'; });
      (c.dots || []).forEach(function (d) { h += '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="4.5" fill="#17202b"/>'; });
      // Bauteile über die Leitung legen (weißer Hintergrund unter Symbolen)
      c.parts.forEach(function (p) {
        if (p.t === "D") {
          var cx = (p.x1 + p.x2) / 2, cy = (p.y1 + p.y2) / 2, vert = p.x1 === p.x2;
          h += '<rect x="' + (cx - (vert ? 4 : 17)) + '" y="' + (cy - (vert ? 17 : 4)) + '" width="' + (vert ? 8 : 34) + '" height="' + (vert ? 34 : 8) + '" fill="#fff"/>';
        }
      });
      c.parts.forEach(function (p) {
        if (p.t === "V") h += source(p, res[p.name], show);
        else if (p.t === "R") h += resistor(p, res[p.name], show);
        else h += diode(p, res[p.name], !!st.flips[p.name], show);
      });
      h += "</svg>";
      stage.innerHTML = h;
      LT.$$(".sc-diode", stage).forEach(function (g) {
        function flip() { var n = g.getAttribute("data-name"); st.flips[n] = !st.flips[n]; draw(); var again = LT.$('.sc-diode[data-name="' + n + '"]', stage); if (again) again.focus(); }
        g.addEventListener("click", flip);
        g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
      });
      var lines = c.parts.filter(function (p) { return p.t === "D"; }).map(function (p) {
        var r = res[p.name];
        return "<li><b>" + p.name + (r && r.on ? " leitet</b> – Plus liegt an der Anode. Spannung an der Diode: 0,7 V." : " sperrt</b> – es fließt kein Strom durch die Diode, sie nimmt die anliegende Spannung auf.") + "</li>";
      });
      summary.innerHTML = "<strong>Ergebnis</strong><ul>" + lines.join("") + "</ul>" + (show ? "" : "<p>Spannungen und Ströme berechnen Sie mit Maschen- und Knotenregel selbst.</p>");
    }
    draw();
  });
})();
