/* =========================================================================
   LUMIATECH – Leitfähigkeit: Leiter, Halbleiter, Nichtleiter
   Platzhalter:
     <div data-sim="ladungstraeger" data-title="…"></div>   (drei Werkstoffproben mit Spannung)
     <div data-chart="leitfaehigkeit"></div>                 (logarithmische Skala)
   ========================================================================= */
(function () {
  "use strict";
  var LT = window.LT, svgEl = LT.svg;

  /* ---------- 1) Werkstoffproben ---------- */
  var SAMPLES = [
    { name: "Kupfer", group: "Leiter", n: 64, col: "#b87333", text: "sehr viele freie Elektronen" },
    { name: "Silizium", group: "Halbleiter", n: 7, col: "#6b7684", text: "wenige freie Ladungsträger" },
    { name: "Keramik", group: "Nichtleiter", n: 0, col: "#c9b79c", text: "praktisch keine freien Ladungsträger" }
  ];

  LT.$$('[data-sim="ladungstraeger"]').forEach(function (host) {
    var ui = LT.lab(host, { icon: "lab", top: true });
    var st = { on: false, warm: false };
    var sw = document.createElement("label");
    sw.className = "switch";
    sw.innerHTML = '<input type="checkbox"> Spannung anlegen';
    ui.controls.appendChild(sw);
    var sw2 = document.createElement("label");
    sw2.className = "switch";
    sw2.innerHTML = '<input type="checkbox"> Proben erwärmen';
    ui.controls.appendChild(sw2);
    var info = document.createElement("div");
    info.className = "pn-explain";
    ui.controls.appendChild(info);
    LT.$("input", sw).addEventListener("change", function (e) { st.on = e.target.checked; upd(); });
    LT.$("input", sw2).addEventListener("change", function (e) { st.warm = e.target.checked; seed(); upd(); });

    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Drei Werkstoffproben: Kupfer mit vielen, Silizium mit wenigen und Keramik ohne freie Ladungsträger. Mit angelegter Spannung fließt im Kupfer ein großer, im Silizium ein kleiner und in der Keramik kein Strom.");
    ui.stage.appendChild(canvas);

    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = 600, H = 300, parts = [];
    function seed() {
      parts = SAMPLES.map(function (s, i) {
        var n = s.n;
        if (st.warm) n = i === 0 ? s.n : i === 1 ? s.n * 3 : 1;
        var arr = [];
        for (var k = 0; k < n; k++) arr.push({ x: Math.random(), y: Math.random(), vx: 0, vy: 0 });
        return arr;
      });
    }
    function size() {
      W = Math.max(300, ui.stage.clientWidth - 40);
      H = W < 520 ? 3 * 150 + 10 : 236;
      canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.height = H + "px";
    }
    function boxes() {
      var narrow = W < 520, out = [];
      for (var i = 0; i < 3; i++) {
        if (narrow) out.push({ x: 20, y: 30 + i * 150, w: W - 40, h: 76 });
        else { var bw = (W - 80) / 3; out.push({ x: 20 + i * (bw + 20), y: 36, w: bw, h: 130 }); }
      }
      return out;
    }
    function upd() {
      info.innerHTML = st.on
        ? "<strong>Je mehr bewegliche Ladungsträger, desto größer die Leitfähigkeit.</strong><p>Die angelegte Spannung setzt die freien Elektronen in Bewegung. Im Kupfer fließt ein großer Strom, im Silizium ein kleiner, in der Keramik praktisch keiner." + (st.warm ? " Erwärmt steigt die Zahl der freien Ladungsträger im Silizium deutlich." : "") + "</p>"
        : "<strong>Ohne Spannung</strong><p>Die freien Elektronen bewegen sich ungeordnet durch das Material – im Mittel fließt kein Strom. Schalten Sie die Spannung ein.</p>";
    }
    var running = false, last = 0;
    function frame(ts) {
      if (!running) return;
      var dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
      var ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var font = getComputedStyle(document.body).fontFamily;
      boxes().forEach(function (b, i) {
        var s = SAMPLES[i], arr = parts[i];
        // Probe
        ctx.fillStyle = i === 0 ? "#f6e7da" : i === 1 ? "#e9edf1" : "#f4efe6";
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = "#17202b"; ctx.lineWidth = 1.5; ctx.strokeRect(b.x, b.y, b.w, b.h);
        // Kontakte
        ctx.fillStyle = "#4b5563"; ctx.fillRect(b.x - 6, b.y, 6, b.h); ctx.fillRect(b.x + b.w, b.y, 6, b.h);
        if (st.on) {
          ctx.font = "800 15px " + getComputedStyle(document.body).fontFamily; ctx.textAlign = "center";
          ctx.fillStyle = "#d3262b"; ctx.fillText("+", b.x - 3, b.y + b.h + 16);
          ctx.fillStyle = "#1f5bd8"; ctx.fillText("–", b.x + b.w + 3, b.y + b.h + 16);
        }
        // Teilchen
        var drift = st.on ? -0.22 : 0; // Elektronen wandern zum Pluspol (links)
        arr.forEach(function (p) {
          if (!LT.reducedMotion) { p.vx += (Math.random() - 0.5) * 0.9 * dt * 8; p.vy += (Math.random() - 0.5) * 0.9 * dt * 8; }
          p.vx *= 0.92; p.vy *= 0.92;
          p.x += (p.vx + drift) * dt; p.y += p.vy * dt;
          if (p.x < 0) p.x += 1; if (p.x > 1) p.x -= 1;
          if (p.y < 0.05) p.y = 0.05; if (p.y > 0.95) p.y = 0.95;
          var px = b.x + 6 + p.x * (b.w - 12), py = b.y + 6 + p.y * (b.h - 12);
          ctx.beginPath(); ctx.arc(px, py, 4.2, 0, Math.PI * 2); ctx.fillStyle = "#1f5bd8"; ctx.fill();
        });
        // Beschriftung
        ctx.fillStyle = "#17202b"; ctx.font = "700 14px " + font; ctx.textAlign = "left";
        ctx.fillText(s.name, b.x, b.y - 10);
        ctx.fillStyle = "#6b7684"; ctx.font = "600 12px " + font; ctx.textAlign = "right";
        ctx.fillText(s.group, b.x + b.w, b.y - 10);
        // Strommesser
        var I = st.on ? arr.length / SAMPLES[0].n : 0;
        var my = b.y + b.h + 24;
        ctx.fillStyle = "#e1e6eb"; ctx.fillRect(b.x, my, b.w, 8);
        ctx.fillStyle = "#e0a100"; ctx.fillRect(b.x, my, b.w * Math.min(1, I), 8);
        ctx.fillStyle = "#4a5563"; ctx.font = "600 12px " + font; ctx.textAlign = "left";
        ctx.fillText(st.on ? (I > 0.5 ? "großer Strom" : I > 0.01 ? "kleiner Strom" : "kein Strom") : "Spannung aus", b.x, my + 24);
      });
      if (running) requestAnimationFrame(frame);
    }
    seed(); size(); upd();
    running = true; frame(performance.now()); running = false;
    if ("ResizeObserver" in window) new ResizeObserver(function () { size(); if (!running) { running = true; frame(performance.now()); running = false; } }).observe(ui.stage);
    LT.whenVisible(host, function (v) {
      if (v && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); } else if (!v) running = false;
    });
  });

  /* ---------- 2) Logarithmische Leitfähigkeitsskala ---------- */
  var MAT = [
    { n: "Kupfer", v: 5.8e7, g: 2 }, { n: "Eisen", v: 1.0e7, g: 2 },
    { n: "Silizium, stark dotiert", v: 1e4, g: 1 }, { n: "Germanium, rein", v: 2.2, g: 1 }, { n: "Silizium, rein", v: 4.3e-4, g: 1 },
    { n: "Glas", v: 1e-12, g: 0 }, { n: "Keramik (Porzellan)", v: 1e-13, g: 0 }, { n: "PVC", v: 1e-14, g: 0 }, { n: "Polyethylen", v: 1e-16, g: 0 }
  ];
  var ZONES = [
    { from: -17, to: -8, label: "Nichtleiter", col: "#f4efe6" },
    { from: -8, to: 5, label: "Halbleiter", col: "#eef1f4" },
    { from: 5, to: 9, label: "Leiter", col: "#f6e7da" }
  ];

  LT.$$('[data-chart="leitfaehigkeit"]').forEach(function (host) {
    function draw() {
      host.innerHTML = "";
      var w = Math.max(300, host.clientWidth), narrow = w < 640;
      var h = narrow ? 300 : 220, m = { l: 14, r: 14 };
      var svg = svgEl("svg", { viewBox: "0 0 " + w + " " + h, width: w, height: h, role: "img", "aria-label": "Logarithmische Skala der elektrischen Leitfähigkeit von 10 hoch minus 17 bis 10 hoch 9 Siemens pro Meter mit den Bereichen Nichtleiter, Halbleiter und Leiter." });
      host.appendChild(svg);
      var axisY = narrow ? 170 : 120;
      function sx(e) { return m.l + (e + 17) / 26 * (w - m.l - m.r); }
      ZONES.forEach(function (z) {
        svgEl("rect", { x: sx(z.from), y: axisY - 26, width: sx(z.to) - sx(z.from), height: 52, fill: z.col }, svg);
        var t = svgEl("text", { x: (sx(z.from) + sx(z.to)) / 2, y: axisY + 4, "text-anchor": "middle", "font-size": 13.5, "font-weight": 700, fill: "#17202b" }, svg);
        t.textContent = z.label;
      });
      svgEl("line", { x1: sx(-17), x2: sx(9), y1: axisY + 26, y2: axisY + 26, stroke: "#17202b", "stroke-width": 1.4 }, svg);
      for (var e = -16; e <= 8; e += (narrow ? 4 : 2)) {
        var x = sx(e);
        svgEl("line", { x1: x, x2: x, y1: axisY + 26, y2: axisY + 32, stroke: "#17202b" }, svg);
        var t = svgEl("text", { x: x, y: axisY + 48, "text-anchor": "middle", "font-size": 12, fill: "#6b7684" }, svg);
        t.innerHTML = "10<tspan dy='-6' font-size='9'>" + (e < 0 ? "−" + (-e) : e) + "</tspan>";
      }
      var unit = svgEl("text", { x: w - m.r, y: axisY + 68, "text-anchor": "end", "font-size": 12, "font-weight": 600, fill: "#4a5563" }, svg);
      unit.textContent = "Leitfähigkeit γ in S/m (bei 20 °C)";
      // Werkstoffe mit Markierung, Beschriftung abwechselnd oben
      var placed = [];
      MAT.slice().sort(function (a, b) { return b.v - a.v; }).forEach(function (mt) {
        var x = sx(Math.log10(mt.v));
        var anchor = x < 70 ? "start" : x > w - 70 ? "end" : "middle";
        var lab = svgEl("text", { x: x, y: 0, "text-anchor": anchor, "font-size": 12, "font-weight": 600, fill: "#17202b" }, svg);
        lab.textContent = mt.n;
        var tw = lab.getComputedTextLength ? lab.getComputedTextLength() : mt.n.length * 6.5;
        var x0 = anchor === "start" ? x : anchor === "end" ? x - tw : x - tw / 2, x1 = x0 + tw;
        var row = 0;
        while (placed.some(function (p) { return p.row === row && x0 < p.x1 + 8 && x1 > p.x0 - 8; })) row++;
        placed.push({ x0: x0, x1: x1, row: row });
        var ly = axisY - 34 - row * 18;
        lab.setAttribute("y", ly);
        svgEl("line", { x1: x, x2: x, y1: ly + 4, y2: axisY - 26, stroke: "#9aa4af", "stroke-width": 1 }, svg);
        svgEl("circle", { cx: x, cy: axisY - 26, r: 4, fill: "#17202b" }, svg);
        var tt = svgEl("title", null, lab); tt.textContent = mt.n + ": etwa " + mt.v.toExponential(1).replace(".", ",") + " S/m";
      });
      var maxRow = Math.max.apply(null, placed.map(function (p) { return p.row; }));
      var top = axisY - 34 - maxRow * 18 - 16;
      if (top < 0) { svg.setAttribute("viewBox", "0 " + top + " " + w + " " + (h - top)); svg.setAttribute("height", h - top); }
    }
    draw();
    var lw = 0;
    if ("ResizeObserver" in window) new ResizeObserver(function () { var w = host.clientWidth; if (Math.abs(w - lw) > 4) { lw = w; draw(); } }).observe(host);
  });
})();
