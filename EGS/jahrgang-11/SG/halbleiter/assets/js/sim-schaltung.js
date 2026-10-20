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
     Diode: a = Anode im Grundzustand. Zeichnung: cx/cy = Mitte, alle Bauteile senkrecht,
     Kennzeichnung links daneben (Dioden nach DIN EN 81346-2 ebenfalls -R). */
  var CIRCUITS = [
    {
      id: "reihe", name: "Reihenschaltung",
      parts: [
        { t: "V", name: "-G1", a: 1, b: 0, U: 5, cx: 110, cy: 150 },
        { t: "R", name: "-R1", a: 1, b: 2, R: 1000, cx: 380, cy: 105 },
        { t: "D", name: "-R2", a: 2, b: 0, cx: 380, cy: 200 }
      ],
      wires: ["M110 126 V50 H380 V250 H110 V174"]
    },
    {
      id: "parallel", name: "Diode parallel zum Widerstand",
      parts: [
        { t: "V", name: "-G1", a: 1, b: 0, U: 9, cx: 110, cy: 150 },
        { t: "R", name: "-R1", a: 1, b: 2, R: 1000, cx: 300, cy: 98 },
        { t: "R", name: "-R2", a: 2, b: 0, R: 2200, cx: 300, cy: 202 },
        { t: "D", name: "-R3", a: 2, b: 0, cx: 440, cy: 202 }
      ],
      wires: ["M110 126 V50 H300 V250 H110 V174", "M300 150 H440 V250 H300"],
      dots: [[300, 150], [300, 250]]
    },
    {
      id: "zweige", name: "Zwei Zweige",
      parts: [
        { t: "V", name: "-G1", a: 1, b: 0, U: 5, cx: 110, cy: 150 },
        { t: "R", name: "-R1", a: 1, b: 2, R: 470, cx: 290, cy: 105 },
        { t: "D", name: "-R2", a: 2, b: 0, cx: 290, cy: 200 },
        { t: "R", name: "-R3", a: 1, b: 3, R: 1000, cx: 450, cy: 105 },
        { t: "D", name: "-R4", a: 0, b: 3, cx: 450, cy: 200 }
      ],
      wires: ["M110 126 V50 H450 V250 H110 V174", "M290 50 V250"],
      dots: [[290, 50], [290, 250]]
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

  /* ---------- Zeichnen (Schaltzeichen aus symbols.js) ---------- */
  function vals(res) { return LT.num(Math.abs(res.U), 2) + " V, " + LT.fmtI(Math.abs(res.I)); }
  function resistor(p, res, show) {
    var active = res && Math.abs(res.I) > 1e-7;
    return LT.sym.resistor({ cx: p.cx, cy: p.cy, fill: active ? "#fff3c4" : "#fff" }) +
      LT.sym.bmk({ x: p.cx, y: p.cy, gap: 20, name: p.name, value: LT.fmtR(p.R), extra: show && res ? vals(res) : null });
  }
  function diode(p, res, flipped, show) {
    var on = res && res.on;
    // Grundzustand: Anode oben (Knoten a liegt oben) bzw. unten, wenn a = 0
    var down = p.a !== 0;
    if (flipped) down = !down;
    var s = '<g class="sc-diode" data-name="' + p.name + '" tabindex="0" role="button" aria-label="Diode ' + p.name + ' umdrehen, zurzeit ' + (on ? "leitend" : "sperrend") + '" style="cursor:pointer">';
    s += '<rect x="' + (p.cx - 30) + '" y="' + (p.cy - 30) + '" width="60" height="60" fill="transparent"/>';
    s += LT.sym.diode({ cx: p.cx, cy: p.cy, s: 34, dir: down ? "down" : "up", lead: 0, hl: on ? "#fff3c4" : null });
    s += '<circle cx="' + (p.cx + 30) + '" cy="' + (p.cy - 20) + '" r="10" fill="#17202b"/><path d="M' + (p.cx + 25.5) + " " + (p.cy - 22) + "a4.6 4.6 0 1 1 1 4.6" + '" fill="none" stroke="#ffc400" stroke-width="1.8"/>';
    s += "</g>";
    s += LT.sym.bmk({ x: p.cx, y: p.cy, gap: 36, name: p.name, value: on ? "leitet" : "sperrt", extra: show && res ? vals(res) : null });
    return s;
  }
  function source(p, res, show) {
    return LT.sym.source({ cx: p.cx, cy: p.cy, r: 24 }) +
      LT.sym.bmk({ x: p.cx, y: p.cy, gap: 36, name: p.name, value: LT.num(p.U, 0) + " V", extra: show && res ? LT.fmtI(Math.abs(res.I)) : null });
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
      c.wires.forEach(function (d) { h += LT.sym.wire(d); });
      (c.dots || []).forEach(function (d) { h += LT.sym.dot(d[0], d[1]); });
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
        return "<li><b>" + p.name + (r && r.on ? " leitet</b> – das höhere Potenzial liegt an der Anode. Spannung an der Diode: 0,7 V." : " sperrt</b> – es fließt kein Strom durch die Diode, sie nimmt die anliegende Spannung auf.") + "</li>";
      });
      summary.innerHTML = "<strong>Ergebnis</strong><ul>" + lines.join("") + "</ul>" + (show ? "" : "<p>Spannungen und Ströme berechnen Sie mit Maschen- und Knotenregel selbst.</p>");
    }
    draw();
  });
})();
