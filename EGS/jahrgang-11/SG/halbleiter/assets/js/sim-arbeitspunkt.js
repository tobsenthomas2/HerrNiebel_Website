/* =========================================================================
   LUMIATECH – Grafische Arbeitspunktbestimmung LED + Vorwiderstand
   Platzhalter: <div data-sim="arbeitspunkt" data-title="…" data-hint="…"></div>
   Zahlenwerte des Arbeitspunkts nur bei LT_CONFIG.messwerteAnzeigen = true.
   ========================================================================= */
(function () {
  "use strict";
  var LT = window.LT, P = LT.phys, D = P.devices;
  var LEDS = ["red", "green", "blue"];
  var RS = P.e12Range(100, 2200);

  LT.$$('[data-sim="arbeitspunkt"]').forEach(function (host) {
    var ui = LT.lab(host, { icon: "chart" });
    var show = !!LT.config.messwerteAnzeigen;
    var st = { led: "red", Ub: 12, ri: RS.indexOf(1000) };

    LT.segmented(ui.controls, "LED", [
      { value: "red", html: '<span class="dot" style="background:#d3262b"></span>Rot' },
      { value: "green", html: '<span class="dot" style="background:#14873d"></span>Grün' },
      { value: "blue", html: '<span class="dot" style="background:#1f5bd8"></span>Blau' },
      { value: "all", label: "Alle drei" }
    ], "red", function (v) { st.led = v; update(); });
    LT.slider(ui.controls, {
      label: "Betriebsspannung U<sub>b</sub>", min: 3, max: 24, step: 0.5, value: st.Ub,
      format: function (v) { return LT.num(v, v % 1 ? 1 : 0) + " V"; },
      onInput: function (v) { st.Ub = v; update(); }
    });
    LT.slider(ui.controls, {
      label: "Vorwiderstand R<sub>V</sub> (E12)", min: 0, max: RS.length - 1, step: 1, value: st.ri,
      format: function (i) { return LT.fmtR(RS[i]); },
      onInput: function (i) { st.ri = i; update(); }
    });
    var leds = document.createElement("div");
    leds.className = "ap-leds";
    ui.controls.appendChild(leds);
    var status = document.createElement("div");
    ui.controls.appendChild(status);
    var values = document.createElement("dl");
    values.className = "readout readout--list";
    if (show) ui.controls.appendChild(values);

    var chart = LT.chart(ui.stage, {
      ariaLabel: "Kennlinie der LED mit Widerstandsgerade und Arbeitspunkt",
      height: function (w) { return LT.clamp(w * 0.64, 300, 460); },
      margin: { t: 20, r: 24, b: 50, l: 52 },
      x: { domain: [0, 13], ticks: [], label: "U in V" },
      y: { domain: [0, 60], ticks: [0, 10, 20, 30, 40, 50, 60], minor: 5, label: "I in mA" },
      draw: drawChart
    });

    function xMax() { return Math.max(5, Math.ceil(st.Ub) + 1); }

    function drawChart(c) {
      var R = RS[st.ri], Ub = st.Ub, IK = Ub / R * 1000;
      var sel = st.led === "all" ? LEDS : [st.led];
      // Kennlinien: zulässiger Teil durchgezogen, darüber gepunktet
      sel.forEach(function (k) {
        var d = D[k], u0 = Math.max(0, P.U_of_I(d, 1e-5));
        var uMax = P.U_of_I(d, d.IFmax), uEnd = P.U_of_I(d, 0.065);
        c.path(c.sample(function (u) { return P.I_of_U(d, u) * 1e3; }, u0, uMax, 120), { class: "series", stroke: d.color, "stroke-width": 2.5 });
        c.path(c.sample(function (u) { return P.I_of_U(d, u) * 1e3; }, uMax, uEnd, 40), { class: "series", stroke: d.color, "stroke-width": 2.5, "stroke-dasharray": "2 4" });
        c.text(c.sx(uEnd) + 6, c.sy(57), d.short.replace("LED ", ""), { class: "series-label", "text-anchor": "start" });
        if (st.led !== "all") {
          c.el("line", { x1: c.sx(0), x2: c.sx(xMax()), y1: c.sy(d.IFmax * 1e3), y2: c.sy(d.IFmax * 1e3), class: "limit" }, c.gData);
          c.text(c.sx(xMax()) - 4, c.sy(d.IFmax * 1e3) - 6, "I<sub>F,max</sub>", { "text-anchor": "end", class: "limit-label" }, c.gOver);
        }
      });
      // Widerstandsgerade P1 (Ub | 0) – P2 (0 | Ub/R)
      c.path([[0, IK], [Ub, 0]], { stroke: "#17202b", "stroke-width": 2, fill: "none" });
      c.el("circle", { cx: c.sx(Ub), cy: c.sy(0), r: 5.5, fill: "#17202b" }, c.gOver);
      c.text(c.sx(Ub), c.sy(0) - 12, "P1", { "text-anchor": "middle", class: "series-label" });
      if (IK <= 60) {
        c.el("circle", { cx: c.sx(0), cy: c.sy(IK), r: 5.5, fill: "#17202b" }, c.gOver);
        c.text(c.sx(0) + 10, c.sy(IK) - 8, "P2", { class: "series-label" });
      } else {
        c.text(c.sx(0) + 10, c.sy(58), "P2 liegt oberhalb (I<sub>K</sub> > 60 mA)", { class: "series-label", "font-size": 11.5 });
      }
      // Arbeitspunkte
      sel.forEach(function (k) {
        var op = P.operatingPoint(D[k], Ub, R), I = op.I * 1e3;
        if (I > 60) return;
        var x = c.sx(op.U), y = c.sy(I);
        c.el("line", { x1: x, x2: x, y1: y, y2: c.sy(0), class: "guide" }, c.gOver);
        c.el("line", { x1: c.sx(0), x2: x, y1: y, y2: y, class: "guide" }, c.gOver);
        c.el("circle", { cx: x, cy: y, r: 7, fill: "#ffc400", stroke: D[k].color, "stroke-width": 3 }, c.gOver);
      });
    }

    function update() {
      var xm = xMax(), ticks = [];
      var narrow = (ui.stage.clientWidth || 600) < 520;
      var step = xm > 16 ? (narrow ? 4 : 2) : (narrow && xm > 8 ? 2 : 1);
      for (var t = 0; t <= xm; t += step) ticks.push(t);
      chart.opts.x.domain = [0, xm];
      chart.opts.x.ticks = ticks;
      chart.opts.x.minor = step / 2;
      chart.render();

      var R = RS[st.ri], sel = st.led === "all" ? LEDS : [st.led], worst = "ok", dim = false, lines = [], vals = [];
      sel.forEach(function (k) {
        var op = P.operatingPoint(D[k], st.Ub, R), d = D[k];
        if (op.I > d.IFmax) worst = "bad";
        if (op.I < 0.006) dim = true;
        vals.push("<div><dt>" + d.short + "</dt><dd>U<sub>F</sub> = " + LT.num(op.U, 2) + " V, I<sub>F</sub> = " + LT.num(op.I * 1e3, 1) + " mA</dd></div>");
        lines.push('<span class="ap-led" style="--c:' + LT.LED_COLORS[k].glow + ";--a:" + LT.clamp(op.I / 0.02, 0, 1.5).toFixed(2) + '" title="' + d.short + '"></span>');
      });
      leds.innerHTML = lines.join("");
      if (worst === "bad") LT.status(status, "bad", "Arbeitspunkt über I<sub>F,max</sub>", "Die LED wird überlastet und fällt früher oder später aus. Vorwiderstand vergrößern.");
      else if (dim) LT.status(status, "warn", "Zulässig, aber sehr dunkel", "Der Strom ist deutlich kleiner als der Nennstrom von 20 mA.");
      else LT.status(status, "ok", "Arbeitspunkt im zulässigen Bereich", "Der Strom bleibt unter dem maximalen Durchlassstrom.");
      values.innerHTML = vals.join("");
    }

    update();
  });
})();
