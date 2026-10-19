/* =========================================================================
   LUMIATECH – Kennlinien im Vergleich: Si-Diode und LEDs rot, grün, blau
   Platzhalter: <div data-sim="vergleich" data-title="…" data-hint="…"></div>
   ========================================================================= */
(function () {
  "use strict";
  var LT = window.LT, P = LT.phys, D = P.devices;
  var ORDER = ["si", "red", "green", "blue"];

  LT.$$('[data-sim="vergleich"]').forEach(function (host) {
    var ui = LT.lab(host, { icon: "chart" });
    var st = { IF: 20, on: { si: true, red: true, green: true, blue: true } };

    var slider = LT.slider(ui.controls, {
      label: "Durchlassstrom I<sub>F</sub>", min: 1, max: 30, step: 1, value: st.IF,
      format: function (v) { return v + " mA"; },
      onInput: function (v) { st.IF = v; chart.render(); table(); }
    });
    LT.$(".ctl__label span", slider.el).innerHTML = "Durchlassstrom I<sub>F</sub>";

    var boxes = document.createElement("fieldset");
    boxes.className = "series-pick";
    boxes.innerHTML = "<legend>Kennlinien</legend>" + ORDER.map(function (k) {
      return '<label class="switch switch--sm"><input type="checkbox" checked data-k="' + k + '">' + LT.legendLine(D[k].color, D[k].dash) + D[k].short + "</label>";
    }).join("");
    ui.controls.appendChild(boxes);
    LT.$$("input", boxes).forEach(function (i) {
      i.addEventListener("change", function () { st.on[i.getAttribute("data-k")] = i.checked; chart.render(); table(); });
    });
    var tbl = document.createElement("div");
    ui.controls.appendChild(tbl);

    var chart = LT.chart(ui.stage, {
      ariaLabel: "Durchlasskennlinien von Silizium-Diode und LEDs in Rot, Grün und Blau",
      height: function (w) { return LT.clamp(w * 0.66, 300, 460); },
      margin: { t: 20, r: 20, b: 50, l: 52 },
      x: { domain: [0, 4.5], ticks: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5], minor: 0.1, digits: 1, label: "U<sub>F</sub> in V", fmt: function (v) { return LT.num(v, 1); } },
      y: { domain: [0, 30], ticks: [0, 5, 10, 15, 20, 25, 30], minor: 1, label: "I<sub>F</sub> in mA" },
      draw: function (c) {
        ORDER.forEach(function (k) {
          if (!st.on[k]) return;
          var d = D[k];
          var u0 = P.U_of_I(d, 1e-5), u1 = P.U_of_I(d, 0.032);
          var pts = c.sample(function (u) { return P.I_of_U(d, u) * 1e3; }, Math.max(0, u0), u1, 160);
          c.path(pts, { class: "series", stroke: d.color, "stroke-dasharray": d.dash || null, "stroke-width": 2.5 });
          var ut = P.U_of_I(d, 0.0285), right = k === "si" || k === "green";
          c.text(c.sx(ut) + (right ? 8 : -8), c.sy(28.5), d.short, { class: "series-label", "text-anchor": right ? "start" : "end" });
        });
        // gewählter Strom
        var y = c.sy(st.IF);
        c.el("line", { x1: c.sx(0), x2: c.sx(4.5), y1: y, y2: y, class: "guide", stroke: "#c42b2b" }, c.gOver);
        ORDER.forEach(function (k) {
          if (!st.on[k]) return;
          var u = P.U_of_I(D[k], st.IF / 1000), x = c.sx(u);
          c.el("line", { x1: x, x2: x, y1: y, y2: c.sy(0), class: "guide" }, c.gOver);
          c.el("circle", { cx: x, cy: y, r: 5.5, fill: D[k].color, stroke: "#fff", "stroke-width": 2 }, c.gOver);
        });
      },
      hover: function (c, u, i, px, py) {
        if (u < 0 || u > 4.5) return;
        c.el("line", { x1: px, x2: px, y1: c.sy(0), y2: c.sy(30), class: "crosshair" }, c.gHover);
        var rows = [];
        ORDER.forEach(function (k) {
          if (!st.on[k]) return;
          var I = P.I_of_U(D[k], u) * 1e3;
          if (I <= 30) c.el("circle", { cx: px, cy: c.sy(I), r: 4.5, fill: D[k].color, stroke: "#fff", "stroke-width": 1.5 }, c.gHover);
          rows.push('<span class="sw" style="background:' + D[k].color + '"></span>' + D[k].short + ": <b>" + (I > 30 ? "&gt; 30" : LT.num(I, I < 1 ? 2 : 1)) + " mA</b>");
        });
        c.showTip("U<sub>F</sub> = " + LT.num(u, 2) + " V<br>" + rows.join("<br>"), px, Math.max(py, 70));
      }
    });

    function table() {
      var rows = ORDER.filter(function (k) { return st.on[k]; }).map(function (k) {
        return "<div><dt>" + LT.legendLine(D[k].color, D[k].dash).replace("<svg", '<svg style="width:20px;height:10px;display:inline-block;margin-right:6px"') + D[k].short + "</dt><dd>U<sub>F</sub> = " + LT.num(P.U_of_I(D[k], st.IF / 1000), 2) + " V</dd></div>";
      }).join("");
      tbl.innerHTML = '<p class="ctl__title">Abgelesen bei I<sub>F</sub> = ' + st.IF + " mA</p><dl class=\"readout readout--list\">" + rows + "</dl>";
    }
    table();
  });
})();
