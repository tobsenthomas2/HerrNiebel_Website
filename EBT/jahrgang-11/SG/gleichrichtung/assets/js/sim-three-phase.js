/* =========================================================================
   Simulation „Drei Kabel: Welche Dioden leiten?“  ·  <div data-sim="three-phase">
   Drei Strangspannungen eines Drehstromgenerators, Brücke aus sechs Dioden (B6U).
   Modus „2 Kabel“: nur L1 und L2 angeschlossen (L3 offen).
   Woche 2: Phasen + leitende Dioden.  Ab Woche 3: zusätzlich die Ausgangsspannung.
   ========================================================================= */
(function () {
  "use strict";
  function init(host) {
    var S = SIM.shell(host, "wind");
    var st = { mode: "3" };
    var UH = 20;                                          // Scheitelwert je Strang (Beispiel)
    var showOut = SITE.open(3);
    function ph(k, deg) { return UH * Math.sin((deg - 120 * k) * Math.PI / 180); }
    function out(deg) {
      var a = ph(0, deg), b = ph(1, deg), c = ph(2, deg);
      return st.mode === "2" ? Math.abs(a - b) : Math.max(a, b, c) - Math.min(a, b, c);
    }

    var controls = document.createElement("div");
    controls.className = "controls";
    S.body.appendChild(controls);
    controls.appendChild(SIM.seg({ en: "Wired up", de: "Angeschlossen" }, [
      { id: "2", en: "2 wires (L1, L2)", de: "2 Kabel (L1, L2)" },
      { id: "3", en: "3 wires (L1, L2, L3)", de: "3 Kabel (L1, L2, L3)" }
    ], st.mode, function (id) { st.mode = id; drawCircuit(); update(); }).el);

    var row = document.createElement("div");
    row.className = "sim__row";
    S.body.appendChild(row);
    var left = document.createElement("div"), right = document.createElement("div");
    left.className = "screens";
    row.appendChild(left); row.appendChild(right);
    var scPh = SIM.scope(left), scOut = showOut ? SIM.scope(left) : null;
    var circuitHost = document.createElement("div");
    right.appendChild(circuitHost);
    var C;
    var COL = ["#ffd43b", "#4fd1c5", "#ff8a65"];

    function drawCircuit() {
      circuitHost.innerHTML = "";
      C = SIM.circuit(circuitHost, 360, 240, { en: "Circuit: three-phase bridge (B6U)", de: "Schaltplan: Drehstrom-Brücke (B6U)" });
      var xs = [150, 205, 260], mids = [100, 125, 150], top = 35, bot = 205, LC = ["#a37c00", "#1b8a80", "#c2512b"];
      C.source(62, 120, 26, "3~", "src");
      C.text(31, 124, "-G1", { anchor: "end" });
      xs.forEach(function (x, k) {
        C.wire([[x, mids[k]], [x, top + 50]], "u" + k);
        C.diode(x, top + 50, x, top, "u" + k);
        C.wire([[x, bot - 50], [x, mids[k]]], "l" + k);
        C.diode(x, bot, x, bot - 50, "l" + k);
        C.dot(x, mids[k]);
        C.text(x + 10, top + 30, "-R" + (k + 1), { size: 11 });
        C.text(x + 10, bot - 20, "-R" + (k + 4), { size: 11 });
      });
      var ys = [105, 120, 135];
      xs.forEach(function (x, k) {
        var open = st.mode === "2" && k === 2;
        var x0 = 62 + Math.sqrt(26 * 26 - Math.pow(ys[k] - 120, 2));
        var g = C.wire(open ? [[x0, ys[k]], [96, ys[k]]] : [[x0, ys[k]], [100, ys[k]], [100, mids[k]], [x, mids[k]]], "p" + k);
        if (open) { g.querySelector("polyline").setAttribute("stroke-dasharray", "4 4"); C.text(100, ys[k] + 5, "✂", { size: 13, color: "#c0362c" }); }
        C.text(91, ys[k] - 3, "L" + (k + 1), { size: 9, color: LC[k], bold: true });
      });
      C.wire([[xs[0], top], [325, top], [325, 92]], "plus");
      C.diode(325, 92, 325, 148, "led", true);
      C.wire([[325, 148], [325, bot], [xs[0], bot]], "minus");
      C.dot(xs[1], top); C.dot(xs[2], top); C.dot(xs[1], bot); C.dot(xs[2], bot);
      C.text(307, 124, "-P1", { anchor: "end" });
      C.text(332, top + 4, "+", { size: 14, bold: true }); C.text(332, bot + 4, "−", { size: 14, bold: true });
    }

    var status = SIM.status();
    var M = { t: 0 };
    var player = SIM.player(S.body, host, function () { return 720; }, function (deg) {
      M.t = deg;
      scPh.cursor(deg); if (scOut) scOut.cursor(deg);
      var v = [ph(0, deg), ph(1, deg), ph(2, deg)], n = st.mode === "2" ? 2 : 3;
      var hi = 0, lo = 0;
      for (var k = 1; k < n; k++) { if (v[k] > v[hi]) hi = k; if (v[k] < v[lo]) lo = k; }
      C.highlight(["src", "u" + hi, "l" + lo, "p" + hi, "p" + lo, "plus", "minus", "led"]);
      C.svg.querySelector('[data-seg="led"]').classList.add("lit");
    }, 8, { label: { en: "Rotation angle (slow motion):", de: "Drehwinkel (Zeitlupe):" }, value: function (d) { return Math.round(d) + "°"; } });
    S.body.appendChild(status.el);

    function update() {
      scPh.draw({
        t0: 0, t1: 720, xStep: 90, yMin: -25, yMax: 25, yStep: 10, ratio: 0.42, minH: 190, maxH: 270,
        xFmt: function (d) { return Math.round(d) + "°"; }, xUnit: SITE.t({ en: "rotation angle", de: "Drehwinkel" }),
        traces: [0, 1, 2].map(function (k) { return { fn: function (d) { return ph(k, d); }, color: COL[k], width: 2, dash: st.mode === "2" && k === 2 ? "3 5" : null, opacity: st.mode === "2" && k === 2 ? 0.5 : 1 }; }),
        legend: [{ color: COL[0], text: { en: "L1", de: "L1" } }, { color: COL[1], text: { en: "L2", de: "L2" } }, { color: COL[2], text: { en: "L3", de: "L3" } }],
        aria: { en: "Scope: three phase voltages", de: "Oszi: drei Strangspannungen" }
      });
      if (scOut) scOut.draw({
        t0: 0, t1: 720, xStep: 90, yMin: 0, yMax: 40, yStep: 10, ratio: 0.32, minH: 160, maxH: 220,
        xFmt: function (d) { return Math.round(d) + "°"; }, xUnit: SITE.t({ en: "rotation angle", de: "Drehwinkel" }),
        traces: [{ fn: out, color: "#ffffff", width: 2.4 }],
        legend: [{ color: "#ffffff", text: { en: "output voltage (at the lamp)", de: "Ausgangsspannung (an der Lampe)" } }]
      });
      status.set("", SITE.t({ en: "At every moment two diodes conduct: the upper diode of the most positive wire and the lower diode of the most negative wire.", de: "In jedem Moment leiten zwei Dioden: die obere Diode am gerade positivsten Kabel und die untere Diode am gerade negativsten Kabel." }));
      player.refresh();
    }
    drawCircuit(); update(); SIM.onLang(update);
    S.foot.hidden = false;
    function foot() { S.foot.innerHTML = "<p>" + SITE.t({ en: "Example: 20 V peak per phase, ideal diodes. Real generators: voltage and frequency rise with the speed.", de: "Beispiel: 20 V Scheitelwert je Strang, ideale Dioden. Echte Generatoren: Spannung und Frequenz steigen mit der Drehzahl." }) + "</p>"; }
    foot(); SIM.onLang(foot);
  }
  function boot() { document.querySelectorAll('[data-sim="three-phase"]').forEach(init); }
  if (document.readyState === "loading") document.addEventListener("siteready", boot); else boot();
})();
