/* =========================================================================
   Maschenverfahren – Draufsicht und Ansicht eines Flachdachgebäudes
   Maschenweite und typischer Ableitungsabstand nach DIN EN 62305-3.
   Fangleitungen: alle Dachkanten plus Zwischenleitungen, sodass keine Masche
   größer als die zulässige Maschenweite wird.
   Ableitungen: Anzahl = Umfang / typischer Abstand (aufgerundet, mindestens 2),
   gleichmäßig um den Umfang verteilt, beginnend an einer Ecke.
   ========================================================================= */
(function () {
  "use strict";
  var BS = window.BS, S = BS.svg;
  var host = document.getElementById("sim-maschen");
  if (!host) return;

  var st = { cls: "III", a: 30, b: 20, H: 9, manual: false, nx: 2, ny: 2 };
  var stage = BS.$(".sim__stage", host), panel = BS.$(".sim__panel", host);

  BS.segmented(panel, "Blitzschutzklasse", BS.ORDER.map(function (k) { return { value: k, label: k + "<br><small>" + BS.CLASSES[k].mesh + " × " + BS.CLASSES[k].mesh + " m</small>" }; }), st.cls, function (v) { st.cls = v; update(); }, "seg--classes");
  var aSl = BS.slider(panel, { label: "Gebäudelänge a", min: 5, max: 100, step: 1, value: st.a, format: function (v) { return v + " m"; }, onInput: function (v) { st.a = v; update(); } });
  var bSl = BS.slider(panel, { label: "Gebäudebreite b", min: 5, max: 60, step: 1, value: st.b, format: function (v) { return v + " m"; }, onInput: function (v) { st.b = v; update(); } });
  BS.slider(panel, { label: "Gebäudehöhe H", min: 3, max: 40, step: 0.5, value: st.H, format: function (v) { return BS.num(v, 1) + " m"; }, onInput: function (v) { st.H = v; update(); } });
  var manBox = document.createElement("div"); manBox.className = "ctl"; panel.appendChild(manBox);
  BS.toggle(manBox, "Maschen selbst planen", st.manual, function (v) { st.manual = v; nxSl.el.style.display = nySl.el.style.display = v ? "" : "none"; update(); });
  var nxSl = BS.slider(manBox, { label: "Maschen entlang a", min: 1, max: 20, step: 1, value: st.nx, format: function (v) { return v; }, onInput: function (v) { st.nx = v; update(); } });
  var nySl = BS.slider(manBox, { label: "Maschen entlang b", min: 1, max: 12, step: 1, value: st.ny, format: function (v) { return v; }, onInput: function (v) { st.ny = v; update(); } });
  nxSl.el.style.display = nySl.el.style.display = "none";
  var readout = document.createElement("dl"); readout.className = "readout"; panel.appendChild(readout);
  var status = document.createElement("div"); panel.appendChild(status);

  var svg = S("svg", { role: "img" });
  stage.insertBefore(svg, BS.$(".legend", stage));

  function calc() {
    var c = BS.CLASSES[st.cls], r = { c: c };
    r.nxMin = Math.ceil(st.a / c.mesh - 1e-9); r.nyMin = Math.ceil(st.b / c.mesh - 1e-9);
    r.nx = st.manual ? st.nx : r.nxMin; r.ny = st.manual ? st.ny : r.nyMin;
    r.mx = st.a / r.nx; r.my = st.b / r.ny;
    r.ok = r.mx <= c.mesh + 1e-9 && r.my <= c.mesh + 1e-9;
    r.LF = (r.nx + 1) * st.b + (r.ny + 1) * st.a;
    r.U = 2 * (st.a + st.b);
    r.nA = Math.max(2, Math.ceil(r.U / c.down - 1e-9));
    r.dA = r.U / r.nA;
    r.LA = r.nA * st.H;
    // Lage der Ableitungen auf dem Umfang (Start: Ecke links vorne, gegen den Uhrzeigersinn)
    r.down = [];
    for (var i = 0; i < r.nA; i++) {
      var u = i * r.dA, p;
      if (u <= st.a) p = [u, 0];
      else if (u <= st.a + st.b) p = [st.a, u - st.a];
      else if (u <= 2 * st.a + st.b) p = [st.a - (u - st.a - st.b), st.b];
      else p = [0, st.b - (u - 2 * st.a - st.b)];
      r.down.push(p);
    }
    return r;
  }

  function draw(r) {
    var W = Math.max(300, stage.clientWidth || 700);
    var stacked = window.matchMedia("(max-width: 980px)").matches;
    var legendH = (BS.$(".legend", stage) || { offsetHeight: 0 }).offsetHeight;
    var Hpx = stacked ? BS.clamp(Math.round(W * 1.05), 360, 760) : BS.clamp(Math.max(Math.round(W * 0.7), panel.offsetHeight - legendH - 2), 420, 980);
    svg.setAttribute("viewBox", "0 0 " + W + " " + Hpx); svg.setAttribute("width", W); svg.setAttribute("height", Hpx);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    S("rect", { x: 0, y: 0, width: W, height: Hpx, fill: "#f7fafd" }, svg);

    // Platz: oben Draufsicht, unten Ansicht (Längsseite a)
    var pad = 56, gap = 54, padL = 28, padR = 96;
    var worldH = st.b + st.H, availH = Hpx - 2 * pad - gap;
    var s = Math.min((W - padL - padR) / st.a, availH / worldH);
    var x0 = padL + ((W - padL - padR) - st.a * s) / 2, yTop = pad, ySide = yTop + st.b * s + gap;
    function TX(x) { return x0 + x * s; }
    function TY(y) { return yTop + (st.b - y) * s; } // y = 0 vorne (unten in der Draufsicht)

    BS.text(svg, 14, 24, "Draufsicht Dach", { "font-size": 13, "font-weight": 750, fill: "#142032" });
    // Dachfläche
    S("rect", { x: TX(0), y: TY(st.b), width: st.a * s, height: st.b * s, fill: "#d5dde7", stroke: "#2b3a4f", "stroke-width": 1.5 }, svg);
    // eine Masche hervorheben
    S("rect", { x: TX(0), y: TY(r.my), width: r.mx * s, height: r.my * s, fill: r.ok ? "rgba(21,138,69,.18)" : "rgba(200,55,45,.2)" }, svg);
    if (r.mx * s > 70 && r.my * s > 30) BS.text(svg, TX(r.mx / 2), TY(r.my / 2) + 4, BS.num(r.mx, 1) + " × " + BS.num(r.my, 1) + " m", { "font-size": 12, "font-weight": 700, fill: r.ok ? "#0c5a2c" : "#8d241c", "text-anchor": "middle" });
    // Fangleitungen
    var w = Math.max(2, Math.min(4, s * 0.12));
    for (var i = 0; i <= r.nx; i++) S("line", { x1: TX(i * r.mx), x2: TX(i * r.mx), y1: TY(0), y2: TY(st.b), stroke: "#e08a00", "stroke-width": w }, svg);
    for (var j = 0; j <= r.ny; j++) S("line", { x1: TX(0), x2: TX(st.a), y1: TY(j * r.my), y2: TY(j * r.my), stroke: "#e08a00", "stroke-width": w }, svg);
    // Ableitungen in der Draufsicht
    r.down.forEach(function (p, k) {
      S("circle", { cx: TX(p[0]), cy: TY(p[1]), r: 6.5, fill: "#c8372d", stroke: "#fff", "stroke-width": 2 }, svg);
    });
    // Bemaßung
    function dimH(x1, x2, y, label) {
      S("line", { x1: x1, x2: x2, y1: y, y2: y, stroke: "#46546a", "stroke-width": 1 }, svg);
      S("line", { x1: x1, x2: x1, y1: y - 5, y2: y + 5, stroke: "#46546a" }, svg); S("line", { x1: x2, x2: x2, y1: y - 5, y2: y + 5, stroke: "#46546a" }, svg);
      BS.text(svg, (x1 + x2) / 2, y - 6, label, { "font-size": 12.5, "font-weight": 700, fill: "#142032", "text-anchor": "middle", "paint-order": "stroke", stroke: "#f7fafd", "stroke-width": 4 });
    }
    function dimV(x, y1, y2, label) {
      S("line", { x1: x, x2: x, y1: y1, y2: y2, stroke: "#46546a", "stroke-width": 1 }, svg);
      S("line", { x1: x - 5, x2: x + 5, y1: y1, y2: y1, stroke: "#46546a" }, svg); S("line", { x1: x - 5, x2: x + 5, y1: y2, y2: y2, stroke: "#46546a" }, svg);
      BS.text(svg, x + 8, (y1 + y2) / 2 + 4, label, { "font-size": 12.5, "font-weight": 700, fill: "#142032", "paint-order": "stroke", stroke: "#f7fafd", "stroke-width": 4 });
    }
    dimH(TX(0), TX(st.a), TY(st.b) - 14, "a = " + st.a + " m");
    dimV(TX(st.a) + 14, TY(st.b), TY(0), "b = " + st.b + " m");

    // Ansicht (Längsseite)
    var gy = ySide + st.H * s;
    BS.text(svg, 14, ySide - 18, "Ansicht Längsseite", { "font-size": 13, "font-weight": 750, fill: "#142032" });
    S("rect", { x: 0, y: gy, width: W, height: Hpx - gy, fill: "#e6dccb" }, svg);
    S("rect", { x: TX(0), y: ySide, width: st.a * s, height: st.H * s, fill: "#aab6c4", stroke: "#2b3a4f", "stroke-width": 1.5 }, svg);
    S("line", { x1: TX(0), x2: TX(st.a), y1: ySide, y2: ySide, stroke: "#e08a00", "stroke-width": w + 1 }, svg);
    r.down.forEach(function (p) {
      if (p[1] > 1e-6) return; // nur Ableitungen der vorderen Seite sichtbar
      S("line", { x1: TX(p[0]), x2: TX(p[0]), y1: ySide, y2: gy + 10, stroke: "#c8372d", "stroke-width": 3 }, svg);
    });
    S("line", { x1: TX(0) - 20, x2: TX(st.a) + 20, y1: gy + 10, y2: gy + 10, stroke: "#6b4f2a", "stroke-width": 2.5, "stroke-dasharray": "8 4" }, svg);
    BS.text(svg, TX(st.a) + 24, gy + 14, "Erdung", { "font-size": 11.5, fill: "#6b4f2a", "font-weight": 650 });
    dimV(TX(st.a) + 14, ySide, gy, "H = " + BS.num(st.H, 1) + " m");
    svg.setAttribute("aria-label", "Maschennetz " + r.nx + " mal " + r.ny + " Maschen auf einem Dach von " + st.a + " mal " + st.b + " Metern mit " + r.nA + " Ableitungen");
  }

  function update() {
    var r = calc(), c = r.c;
    draw(r);
    readout.innerHTML =
      "<div><dt>Max. Maschenweite</dt><dd>" + c.mesh + " × " + c.mesh + " m</dd></div>" +
      "<div><dt>Maschen</dt><dd>" + r.nx + " × " + r.ny + "</dd></div>" +
      '<div class="wide"><dt>Tatsächliche Maschengröße</dt><dd>' + BS.num(r.mx, 2) + " m × " + BS.num(r.my, 2) + " m</dd></div>" +
      '<div class="wide"><dt>Fangleitungen (nx + 1) · b + (ny + 1) · a</dt><dd>' + BS.num(r.LF, 0) + " m</dd></div>" +
      "<div><dt>Umfang U</dt><dd>" + BS.num(r.U, 0) + " m</dd></div>" +
      "<div><dt>Typ. Ableitungsabstand</dt><dd>" + c.down + " m</dd></div>" +
      "<div><dt>Ableitungen n = U / Abstand</dt><dd>" + r.nA + " Stück</dd></div>" +
      "<div><dt>Abstand tatsächlich</dt><dd>" + BS.num(r.dA, 2) + " m</dd></div>" +
      '<div class="wide"><dt>Leitungslänge Ableitungen n · H</dt><dd>' + BS.num(r.LA, 1) + " m</dd></div>";
    if (!r.ok) BS.status(status, "bad", "Maschen zu groß", "Mindestens eine Seite der Masche ist größer als " + c.mesh + " m. Für Klasse " + c.id + " sind mindestens " + r.nxMin + " × " + r.nyMin + " Maschen nötig.");
    else if (st.manual && (r.nx > r.nxMin || r.ny > r.nyMin)) BS.status(status, "warn", "Zulässig, aber mehr Leitung als nötig", "Mit " + r.nxMin + " × " + r.nyMin + " Maschen wäre die Klasse " + c.id + " bereits erfüllt.");
    else BS.status(status, "ok", "Maschennetz zulässig", "Keine Masche ist größer als " + c.mesh + " × " + c.mesh + " m.");
  }

  BS.onResize(stage, function () { update(); });
  update();
})();
