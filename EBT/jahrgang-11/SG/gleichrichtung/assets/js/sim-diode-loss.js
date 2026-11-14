/* =========================================================================
   Simulation „Dioden-Duell: Was kostet die Diode?“  ·  <div data-sim="diode-loss">
   Durchlasskennlinien 1N4007 / 1N5817 / 1N5819 (Modell aus scope.js, passend zur Bauteil-Ecke),
   Arbeitspunkt bei gewähltem Strom, Spannungs-„Budget“ der Quelle.
   U_F steht immer da (Datenblattwert), der prozentuale Verlust nur mit messwerteAnzeigen.
   ========================================================================= */
(function () {
  "use strict";
  var TYPES = ["1N4007", "1N5817", "1N5819"];
  var COLORS = { "1N4007": "#1d2520", "1N5817": "#e2552b", "1N5819": "#2f5d4c" };

  function init(host) {
    var S = SIM.shell(host, "sun");
    var st = { type: "1N4007", i: 0.3, u: 6 };

    var controls = document.createElement("div");
    controls.className = "controls";
    S.body.appendChild(controls);
    controls.appendChild(SIM.seg({ en: "Diode", de: "Diode" }, TYPES.map(function (t) { return { id: t, en: t, de: t }; }), st.type, function (id) { st.type = id; update(); }).el);
    var iS = SIM.slider({ en: "Current:", de: "Strom:" }, 0.05, 1, 0.05, st.i, function (v) { return SITE.num(v, 2) + " A"; }, function (v) { st.i = v; update(); });
    var uS = SIM.slider({ en: "Source voltage:", de: "Quellenspannung:" }, 2, 24, 0.5, st.u, function (v) { return SITE.num(v, 1) + " V"; }, function (v) { st.u = v; update(); });
    controls.appendChild(iS.el); controls.appendChild(uS.el);

    var row = document.createElement("div");
    row.className = "sim__row";
    S.body.appendChild(row);
    var chartBox = document.createElement("div");
    chartBox.className = "circuit";
    row.appendChild(chartBox);
    var right = document.createElement("div");
    row.appendChild(right);
    var svg = SIM.el("svg", { role: "img" }, chartBox);
    var budget = document.createElement("div");
    right.appendChild(budget);
    var status = SIM.status();
    S.body.appendChild(status.el);

    var W = 0;
    function drawChart() {
      W = Math.max(220, Math.round(chartBox.clientWidth - 16));
      var H = Math.round(SIM.clamp(W * 0.72, 210, 300)), m = { l: 44, r: 12, t: 26, b: 36 };
      var pw = W - m.l - m.r, ph = H - m.t - m.b;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("width", W); svg.setAttribute("height", H);
      svg.setAttribute("aria-label", SITE.t({ en: "Forward characteristics of three diodes", de: "Durchlasskennlinien von drei Dioden" }));
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var X = function (u) { return m.l + u / 1.2 * pw; }, Y = function (i) { return m.t + (1 - i) * ph; };
      var g = SIM.el("g", { "font-family": "Fira Code, monospace", "font-size": 11, fill: "#47524c" }, svg);
      for (var u = 0; u <= 1.2001; u += 0.2) {
        SIM.el("line", { x1: X(u), x2: X(u), y1: m.t, y2: m.t + ph, stroke: "#e4dccb" }, svg);
        SIM.el("text", { x: X(u), y: m.t + ph + 15, "text-anchor": "middle" }, g).textContent = SITE.num(u, 1);
      }
      for (var i = 0; i <= 1.0001; i += 0.25) {
        SIM.el("line", { x1: m.l, x2: m.l + pw, y1: Y(i), y2: Y(i), stroke: "#e4dccb" }, svg);
        SIM.el("text", { x: m.l - 6, y: Y(i) + 4, "text-anchor": "end" }, g).textContent = SITE.num(i, 2);
      }
      SIM.el("text", { x: m.l + pw, y: H - 4, "text-anchor": "end" }, g).innerHTML = 'U<tspan baseline-shift="sub" font-size="8">F</tspan> / V';
      SIM.el("text", { x: 4, y: 12 }, g).innerHTML = 'I<tspan baseline-shift="sub" font-size="8">F</tspan> / A';
      TYPES.forEach(function (t) {
        var d = "", first = true;
        for (var k = 0; k <= 200; k++) {
          var ii = 0.002 + k / 200 * 0.998, uu = SIM.uf(t, ii);
          if (uu > 1.2) break;
          d += (first ? "M" : "L") + X(uu).toFixed(1) + " " + Y(ii).toFixed(1); first = false;
        }
        var sel = t === st.type;
        SIM.el("path", { d: d, fill: "none", stroke: COLORS[t], "stroke-width": sel ? 3.2 : 1.6, opacity: sel ? 1 : 0.45 }, svg);
        var lvl = { "1N4007": 0.55, "1N5817": 0.8, "1N5819": 0.55 }[t], uL = SIM.uf(t, lvl), left = t === "1N5817";
        SIM.el("text", { x: X(uL) + (left ? -7 : 7), y: Y(lvl) + 4, "text-anchor": left ? "end" : "start", fill: COLORS[t], stroke: "#fbf8f1", "stroke-width": 4, "paint-order": "stroke", "font-family": "Fira Code, monospace", "font-size": 11, "font-weight": sel ? 700 : 400, opacity: sel ? 1 : 0.75 }, svg).textContent = t;
      });
      var uf = SIM.uf(st.type, st.i);
      SIM.el("line", { x1: m.l, x2: X(uf), y1: Y(st.i), y2: Y(st.i), stroke: COLORS[st.type], "stroke-dasharray": "4 4" }, svg);
      SIM.el("line", { x1: X(uf), x2: X(uf), y1: Y(st.i), y2: m.t + ph, stroke: COLORS[st.type], "stroke-dasharray": "4 4" }, svg);
      SIM.el("circle", { cx: X(uf), cy: Y(st.i), r: 6, fill: "#ffc633", stroke: "#1d2520", "stroke-width": 2 }, svg);
    }

    function drawBudget() {
      var uf = SIM.uf(st.type, st.i), share = uf / st.u;
      var lossW = Math.max(3, Math.min(100, share * 100));
      budget.innerHTML =
        '<div style="font:600 .8rem/1.3 var(--f-mono);color:var(--ink-2);margin-bottom:8px">' + SITE.t({ en: "Where does the source voltage go?", de: "Wohin geht die Quellenspannung?" }) + "</div>" +
        '<div style="display:flex;height:44px;border:2px solid var(--ink);border-radius:10px;overflow:hidden">' +
        '<div style="width:' + lossW.toFixed(1) + '%;background:var(--orange)" title="U_F"></div>' +
        '<div style="flex:1;background:var(--green)"></div></div>' +
        '<div style="display:flex;justify-content:space-between;gap:10px;margin-top:8px;font:500 .82rem/1.4 var(--f-mono)">' +
        '<span style="color:var(--orange-ink)">■ ' + SITE.t({ en: "lost in the diode", de: "bleibt in der Diode" }) + "</span>" +
        '<span style="color:var(--green)">■ ' + SITE.t({ en: "left for the load", de: "bleibt für den Verbraucher" }) + "</span></div>" +
        '<div class="readouts" style="margin-top:12px"><span class="readout">U<sub>F</sub> (' + st.type + ", " + SITE.num(st.i, 2) + " A) ≈ <b>" + SITE.num(uf, 2) + " V</b></span>" +
        (SITE.values ? '<span class="readout">' + SITE.t({ en: "share", de: "Anteil" }) + " = <b>" + SITE.num(share * 100, 1) + " %</b></span>" : "") + "</div>";
      if (share > 0.1) status.set("warn", SITE.t({ en: "At this low voltage the diode takes a noticeable bite – every tenth of a volt counts.", de: "Bei dieser kleinen Spannung beißt die Diode ein spürbares Stück ab – jedes Zehntelvolt zählt." }));
      else status.set("ok", SITE.t({ en: "Compared with the source voltage, the diode loss is small here.", de: "Im Vergleich zur Quellenspannung ist der Verlust an der Diode hier klein." }));
    }

    function update() { drawChart(); drawBudget(); }
    if (window.ResizeObserver) new ResizeObserver(function () { if (Math.abs(chartBox.clientWidth - 16 - W) > 1) drawChart(); }).observe(chartBox);
    S.foot.hidden = false;
    function foot() {
      S.foot.innerHTML = "<p>" + SITE.t({ en: "Curves: typical forward characteristics at 25 °C, matching the datasheets in my parts corner. Your own diode may differ a little – measure it!", de: "Kurven: typische Durchlasskennlinien bei 25 °C, passend zu den Datenblättern in meiner Bauteil-Ecke. Deine eigene Diode kann etwas abweichen – miss nach!" }) + "</p>";
    }
    foot(); update(); SIM.onLang(function () { foot(); update(); });
  }
  function boot() { document.querySelectorAll('[data-sim="diode-loss"]').forEach(init); }
  if (document.readyState === "loading") document.addEventListener("siteready", boot); else boot();
})();
