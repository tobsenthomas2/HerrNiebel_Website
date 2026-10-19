/* =========================================================================
   LUMIATECH – Farbe, Wellenlänge und Halbleiterwerkstoff
   Platzhalter: <div data-sim="spektrum" data-title="…" data-hint="…"></div>
   Werte: Richtwerte (Auswahl). Für Berechnungen gilt das Datenblatt.
   ========================================================================= */
(function () {
  "use strict";
  var LT = window.LT, svgEl = LT.svg;
  var MAT = [
    { w: "GaAsSi", c: "Infrarot", nm: 930, uf: 1.2 },
    { w: "GaAsP", c: "Rot", nm: 655, uf: 1.6 },
    { w: "GaAsPN", c: "Orange", nm: 625, uf: 1.6 },
    { w: "GaAsPN", c: "Gelb", nm: 590, uf: 1.8 },
    { w: "GaPN", c: "Grün", nm: 555, uf: 1.8 },
    { w: "InGaN", c: "Blau", nm: 465, uf: 3.0 },
    { w: "GaN/InGaN", c: "Weiß", nm: null, uf: 3.5 }
  ];
  var PRODUCTS = [
    { n: "L-7113SURDK", nm: 630 }, { n: "L-7113SGD", nm: 568 }, { n: "L-7113MBTL", nm: 466 }
  ];

  LT.$$('[data-sim="spektrum"]').forEach(function (host) {
    var ui = LT.lab(host, { icon: "bulb", top: true });
    var st = { sel: 1 };
    var picker = LT.segmented(ui.controls, "Werkstoff wählen", MAT.map(function (m, i) {
      var col = m.nm ? (m.nm > 780 ? "#5b2a2a" : LT.phys.wavelengthToRGB(m.nm)) : "#f4f4f4";
      return { value: String(i), html: '<span class="dot" style="background:' + col + ';box-shadow:inset 0 0 0 1px rgba(0,0,0,.2)"></span>' + m.c };
    }), "1", function (v) { st.sel = +v; draw(); });

    var wrap = document.createElement("div");
    wrap.className = "spec-wrap";
    ui.stage.appendChild(wrap);
    var bar = document.createElement("div");
    bar.className = "spec-bar";
    wrap.appendChild(bar);
    var info = document.createElement("div");
    info.className = "spec-info";
    wrap.appendChild(info);

    function draw() {
      var w = Math.max(300, bar.clientWidth || 600), h = 160, m = { l: 10, r: 10 };
      var x0 = 380, x1 = 1000;
      function sx(nm) { return m.l + (nm - x0) / (x1 - x0) * (w - m.l - m.r); }
      var svg = svgEl("svg", { viewBox: "0 0 " + w + " " + h, width: w, height: h, role: "img", "aria-label": "Spektrum von 380 bis 1000 Nanometer mit den Wellenlängen typischer LED-Werkstoffe" });
      for (var nm = 380; nm < 780; nm += 4) svgEl("rect", { x: sx(nm), y: 48, width: sx(nm + 4) - sx(nm) + 0.6, height: 34, fill: LT.phys.wavelengthToRGB(nm + 2) }, svg);
      var defs = svgEl("defs", null, svg), pat = svgEl("pattern", { id: "ir-hatch", width: 8, height: 8, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
      svgEl("rect", { width: 8, height: 8, fill: "#3a2626" }, pat); svgEl("line", { x1: 0, y1: 0, x2: 0, y2: 8, stroke: "#5b3a3a", "stroke-width": 4 }, pat);
      svgEl("rect", { x: sx(780), y: 48, width: sx(1000) - sx(780), height: 34, fill: "url(#ir-hatch)" }, svg);
      var t = svgEl("text", { x: (sx(780) + sx(1000)) / 2, y: 70, "text-anchor": "middle", "font-size": 12, "font-weight": 650, fill: "#f2dede" }, svg); t.textContent = "Infrarot, unsichtbar";
      [400, 500, 600, 700, 800, 900, 1000].forEach(function (v) {
        svgEl("line", { x1: sx(v), x2: sx(v), y1: 82, y2: 88, stroke: "#17202b" }, svg);
        var tt = svgEl("text", { x: sx(v), y: 102, "text-anchor": v === 1000 ? "end" : "middle", "font-size": 12, fill: "#6b7684" }, svg); tt.textContent = v;
      });
      var u = svgEl("text", { x: w - m.r, y: 120, "text-anchor": "end", "font-size": 12, "font-weight": 600, fill: "#4a5563" }, svg); u.textContent = "Wellenlänge λ in nm";
      // Werkstoffe (oben)
      var order = MAT.filter(function (q) { return q.nm; }).sort(function (a, b) { return a.nm - b.nm; });
      MAT.forEach(function (mt, i) {
        if (!mt.nm) return;
        var x = sx(mt.nm), act = i === st.sel, row = order.indexOf(mt) % 2;
        var g = svgEl("g", { style: "cursor:pointer", role: "button", tabindex: 0, "aria-label": mt.c + ", " + mt.w }, svg);
        svgEl("line", { x1: x, x2: x, y1: 40, y2: 82, stroke: "#17202b", "stroke-width": act ? 2.5 : 1.2 }, g);
        svgEl("path", { d: "M" + (x - 7) + " 34 h14 l-7 9z", fill: act ? "#17202b" : "#fff", stroke: "#17202b", "stroke-width": 1.5 }, g);
        var lt = svgEl("text", { x: x, y: row ? 29 : 13, "text-anchor": "middle", "font-size": 11.5, "font-weight": act ? 800 : 600, fill: "#17202b" }, g); lt.textContent = mt.c;
        g.addEventListener("click", function () { st.sel = i; picker.set(String(i)); draw(); });
        g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); st.sel = i; picker.set(String(i)); draw(); } });
      });
      // eigene Produkte (unten)
      PRODUCTS.forEach(function (p, i) {
        var x = sx(p.nm);
        svgEl("path", { d: "M" + x + " 128 l-6 10 h12z", fill: "#ffc400", stroke: "#17202b", "stroke-width": 1.2 }, svg);
        var lt = svgEl("text", { x: x + (i === 1 ? 0 : i === 0 ? 8 : -8), y: 152, "text-anchor": i === 1 ? "middle" : i === 0 ? "start" : "end", "font-size": 11, "font-weight": 650, fill: "#4a5563" }, svg);
        lt.textContent = p.n;
      });
      bar.innerHTML = "";
      bar.appendChild(svg);

      var mt = MAT[st.sel];
      var col = mt.nm ? (mt.nm > 780 ? "#7a2f2f" : LT.phys.wavelengthToRGB(mt.nm)) : "#ffffff";
      var glow = mt.nm && mt.nm > 780 ? "rgba(120,40,40,.0)" : col;
      var E = mt.nm ? 1240 / mt.nm : null;
      info.innerHTML =
        '<div class="spec-led" style="--glow:' + glow + '"><span></span></div>' +
        '<dl class="readout readout--list">' +
        "<div><dt>Werkstoff</dt><dd>" + mt.w + "</dd></div>" +
        "<div><dt>Farbe, Bereich</dt><dd>" + mt.c + "</dd></div>" +
        "<div><dt>Wellenlänge</dt><dd>" + (mt.nm ? mt.nm + " nm" : "– (Mischlicht)") + "</dd></div>" +
        "<div><dt>Photonenenergie</dt><dd>" + (E ? "≈ " + LT.num(E, 2) + " eV" : "–") + "</dd></div>" +
        "<div><dt>Durchlassspannung U<sub>F</sub></dt><dd>≈ " + LT.num(mt.uf, 1) + " V</dd></div>" +
        "</dl>" +
        '<p class="ctl__help">' + (mt.nm ? (mt.nm > 780 ? "Infrarot-LEDs sieht das Auge nicht – sie stecken in Fernbedienungen und Lichtschranken." : "Je kürzer die Wellenlänge, desto energiereicher das Licht und desto größer die Durchlassspannung.") : "Weißes Licht entsteht durch Mischen von Rot, Grün und Blau oder durch einen blauen Chip mit Leuchtstoffschicht (Phosphor).") + "</p>";
    }
    draw();
    var lw = 0;
    if ("ResizeObserver" in window) new ResizeObserver(function () { var w = bar.clientWidth; if (Math.abs(w - lw) > 4) { lw = w; draw(); } }).observe(bar);
  });
})();
