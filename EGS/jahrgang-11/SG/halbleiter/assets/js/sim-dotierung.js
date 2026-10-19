/* =========================================================================
   LUMIATECH – Kristallgitter: Eigenleitung, N- und P-Dotierung
   Platzhalter: <div data-sim="dotierung" data-title="…" data-hint="…"></div>
   ========================================================================= */
(function () {
  "use strict";
  var LT = window.LT, svgEl = LT.svg;
  var COLS = 5, ROWS = 4, DX = 112, DY = 92, OX = 76, OY = 62, R = 23;
  var C = { electron: "#1f5bd8", hole: "#d3262b", bond: "#c4ccd5", atom: "#eef1f4", ink: "#17202b" };

  LT.$$('[data-sim="dotierung"]').forEach(init);

  function init(host) {
    var ui = LT.lab(host, { icon: "lab" });
    var st = { mode: "eigen", temp: 1 };

    LT.segmented(ui.controls, "Kristall", [
      { value: "eigen", label: "Reines Silizium" },
      { value: "n", label: "N-dotiert (Phosphor)" },
      { value: "p", label: "P-dotiert (Bor)" }
    ], "eigen", function (v) { st.mode = v; tempCtl.el.style.display = v === "eigen" ? "" : "none"; build(); });

    var TEMPS = ["sehr kalt (–200 °C)", "Raumtemperatur", "warm (80 °C)", "heiß (150 °C)"];
    var tempCtl = LT.slider(ui.controls, {
      label: "Temperatur", min: 0, max: 3, step: 1, value: 1,
      format: function (v) { return TEMPS[v]; },
      onInput: function (v) { st.temp = v; build(); },
      help: "Wärme bricht einzelne Bindungen auf – es entstehen freie Elektronen und Löcher."
    });
    var text = document.createElement("div");
    text.className = "pn-explain";
    ui.controls.appendChild(text);

    var svg = svgEl("svg", { viewBox: "0 0 600 360", role: "img", class: "lattice" });
    ui.stage.appendChild(svg);
    var legend = document.createElement("div");
    legend.className = "legend";
    legend.innerHTML =
      '<span><svg viewBox="0 0 26 26" style="width:20px;height:20px"><circle cx="13" cy="13" r="11" fill="' + C.atom + '" stroke="#6b7684" stroke-width="1.5"/></svg>Atom mit 4 Außenelektronen (Si)</span>' +
      '<span><svg viewBox="0 0 26 26" style="width:20px;height:20px"><circle cx="9" cy="13" r="4" fill="#4b5563"/><circle cx="17" cy="13" r="4" fill="#4b5563"/></svg>Elektronenpaarbindung</span>' +
      '<span><svg viewBox="0 0 26 26" style="width:20px;height:20px"><circle cx="13" cy="13" r="6" fill="' + C.electron + '"/></svg>freies Elektron</span>' +
      '<span><svg viewBox="0 0 26 26" style="width:20px;height:20px"><circle cx="13" cy="13" r="6" fill="#fff" stroke="' + C.hole + '" stroke-width="2" stroke-dasharray="3 2"/></svg>Loch (fehlendes Elektron)</span>';
    ui.stage.appendChild(legend);

    var atoms = [], slots = [], frees = [], holes = [], dopant = null, tick = 0;

    function pos(c, r) { return { x: OX + c * DX, y: OY + r * DY }; }

    function build() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      atoms = []; slots = []; frees = []; holes = []; dopant = null;
      var gB = svgEl("g", null, svg), gA = svgEl("g", null, svg);
      // Bindungen mit je zwei Elektronenplätzen
      for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
        var p = pos(c, r);
        [[1, 0], [0, 1]].forEach(function (d) {
          var c2 = c + d[0], r2 = r + d[1];
          if (c2 >= COLS || r2 >= ROWS) return;
          var q = pos(c2, r2);
          svgEl("line", { x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: C.bond, "stroke-width": 9, "stroke-linecap": "round" }, gB);
          svgEl("line", { x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: "#fff", "stroke-width": 4, "stroke-linecap": "round" }, gB);
          var mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
          [-1, 1].forEach(function (s) {
            slots.push({ x: mx + (d[1] ? s * 7 : 0), y: my + (d[0] ? s * 7 : 0), filled: true, bond: [c, r, c2, r2] });
          });
        });
      }
      // Außenbindungen am Rand (angedeutet)
      for (var rr = 0; rr < ROWS; rr++) [[-1, 0], [COLS, 0]].forEach(function (d) {
        var a = pos(d[0] < 0 ? 0 : COLS - 1, rr), x2 = a.x + (d[0] < 0 ? -48 : 48);
        svgEl("line", { x1: a.x, y1: a.y, x2: x2, y2: a.y, stroke: C.bond, "stroke-width": 9, "stroke-linecap": "round", opacity: 0.5 }, gB);
      });
      for (var cc = 0; cc < COLS; cc++) [[0, -1], [0, ROWS]].forEach(function (d) {
        var a = pos(cc, d[1] < 0 ? 0 : ROWS - 1), y2 = a.y + (d[1] < 0 ? -40 : 40);
        svgEl("line", { x1: a.x, y1: a.y, x2: a.x, y2: y2, stroke: C.bond, "stroke-width": 9, "stroke-linecap": "round", opacity: 0.5 }, gB);
      });
      // Atome
      for (var r3 = 0; r3 < ROWS; r3++) for (var c3 = 0; c3 < COLS; c3++) {
        var pp = pos(c3, r3), isDop = st.mode !== "eigen" && c3 === 2 && r3 === 1;
        var g = svgEl("g", null, gA);
        svgEl("circle", { cx: pp.x, cy: pp.y, r: R, fill: isDop ? (st.mode === "n" ? "#dfe8fb" : "#fbe3e2") : C.atom, stroke: isDop ? C.ink : "#6b7684", "stroke-width": isDop ? 2.5 : 1.5 }, g);
        var t = svgEl("text", { x: pp.x, y: pp.y + 6, "text-anchor": "middle", "font-size": 17, "font-weight": 750, fill: C.ink }, g);
        t.textContent = isDop ? (st.mode === "n" ? "P" : "B") : "Si";
        if (isDop) dopant = { g: g, x: pp.x, y: pp.y };
      }
      var gE = svgEl("g", null, svg);
      st.gE = gE;

      if (st.mode === "eigen") {
        var broken = [0, 1, 2, 4][st.temp];
        var cand = slots.slice();
        for (var k = 0; k < broken; k++) {
          var s = cand.splice(Math.floor((k * 0.37 + 0.13) * cand.length) % cand.length, 1)[0];
          s.filled = false; holes.push(s);
          frees.push(newFree(s.x, s.y, k));
        }
      } else if (st.mode === "n") {
        frees.push(newFree(dopant.x + 30, dopant.y - 30, 0));
      } else {
        // Bor hat nur drei Außenelektronen: ein Platz bleibt leer
        var s2 = slots.filter(function (s) { return s.bond[0] === 2 && s.bond[1] === 1 && s.bond[2] === 3; })[0];
        s2.filled = false; holes.push(s2);
      }
      render();
      updateText();
    }

    function newFree(x, y, k) {
      return { x: x, y: y, a: Math.random() * 6.28, sp: 0.6 + 0.25 * k, cx: 300, cy: 180, rx: 230 - 20 * k, ry: 120 - 10 * k, ph: k * 1.7 };
    }

    function render() {
      var g = st.gE;
      while (g.firstChild) g.removeChild(g.firstChild);
      slots.forEach(function (s) {
        if (s.filled) svgEl("circle", { cx: s.x, cy: s.y, r: 4.6, fill: "#4b5563" }, g);
        else {
          svgEl("circle", { cx: s.x, cy: s.y, r: 8, fill: "#fff", stroke: C.hole, "stroke-width": 2.2, "stroke-dasharray": "4 3" }, g);
          svgEl("path", { d: "M" + (s.x - 4) + "," + s.y + "h8M" + s.x + "," + (s.y - 4) + "v8", stroke: C.hole, "stroke-width": 2 }, g);
        }
      });
      frees.forEach(function (f) {
        svgEl("circle", { cx: f.x, cy: f.y, r: 12, fill: C.electron, opacity: 0.18 }, g);
        svgEl("circle", { cx: f.x, cy: f.y, r: 6.5, fill: C.electron }, g);
        svgEl("path", { d: "M" + (f.x - 3.5) + "," + f.y + "h7", stroke: "#fff", "stroke-width": 1.8 }, g);
      });
      // Ladung des Fremdatoms, sobald Elektron/Loch weg ist
      if (dopant) {
        var away = st.mode === "n" ? (frees[0] && Math.hypot(frees[0].x - dopant.x, frees[0].y - dopant.y) > 60)
                                   : (holes[0] && Math.hypot(holes[0].x - dopant.x, holes[0].y - dopant.y) > 70);
        if (away) {
          svgEl("circle", { cx: dopant.x + 19, cy: dopant.y - 19, r: 9, fill: st.mode === "n" ? C.hole : C.electron }, g);
          svgEl("path", { d: st.mode === "n" ? "M" + (dopant.x + 15) + "," + (dopant.y - 19) + "h8M" + (dopant.x + 19) + "," + (dopant.y - 23) + "v8" : "M" + (dopant.x + 15) + "," + (dopant.y - 19) + "h8", stroke: "#fff", "stroke-width": 2 }, g);
        }
      }
    }

    function updateText() {
      var t;
      if (st.mode === "eigen") {
        t = "<strong>Reines Silizium (Eigenleitung)</strong><p>Jedes Si-Atom ist über vier Elektronenpaarbindungen mit seinen Nachbarn verbunden. " +
          (st.temp === 0 ? "Bei sehr tiefer Temperatur sind alle Elektronen gebunden – der Kristall isoliert nahezu." :
           "Durch Wärme brechen einzelne Bindungen auf. Es entstehen freie Elektronen und Löcher – je wärmer, desto mehr. Deshalb leiten Halbleiter bei Wärme besser, Metalle dagegen schlechter.") + "</p>";
      } else if (st.mode === "n") {
        t = "<strong>N-Dotierung mit Phosphor (5 Außenelektronen)</strong><p>Vier Elektronen gehen Bindungen ein, das fünfte ist nur schwach gebunden und wird zum <b>freien Elektron</b>. Zurück bleibt ein ortsfestes positives Ion. Die beweglichen Ladungsträger sind negativ: N-Leiter.</p>";
      } else {
        t = "<strong>P-Dotierung mit Bor (3 Außenelektronen)</strong><p>Für die vierte Bindung fehlt ein Elektron – es entsteht ein <b>Loch</b>. Springt ein Nachbarelektron hinein, wandert das Loch weiter. Zurück bleibt ein ortsfestes negatives Ion. Die beweglichen Ladungsträger wirken positiv: P-Leiter.</p>";
      }
      text.innerHTML = t;
      svg.setAttribute("aria-label", text.textContent);
    }

    // Animation: freie Elektronen wandern, Löcher springen
    var running = false, last = 0, hopT = 0;
    function loop(ts) {
      if (!running) return;
      var dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
      tick += dt;
      frees.forEach(function (f) {
        f.a += dt * f.sp * (LT.reducedMotion ? 0.15 : 1);
        f.x = f.cx + f.rx * Math.sin(f.a + f.ph) * Math.cos(f.a * 0.37);
        f.y = f.cy + f.ry * Math.sin(f.a * 1.31 + f.ph);
      });
      hopT += dt;
      if (hopT > (LT.reducedMotion ? 3 : 0.9) && holes.length) {
        hopT = 0;
        holes = holes.map(function (h) {
          var near = slots.filter(function (s) { return s.filled && Math.hypot(s.x - h.x, s.y - h.y) < 80 && Math.hypot(s.x - h.x, s.y - h.y) > 10; });
          if (!near.length) return h;
          var n = near[Math.floor(Math.random() * near.length)];
          n.filled = false; h.filled = true;
          return n;
        });
      }
      render();
      requestAnimationFrame(loop);
    }
    LT.whenVisible(host, function (vis) {
      if (vis && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
      else if (!vis) running = false;
    });
    build();
  }
})();
