/* =========================================================================
   LUMIATECH – Kennlinien-Explorer Si-Diode BAY 44 (Durchlass- und Sperrbereich)
   Platzhalter: <div data-sim="kennlinie" data-title="…" data-hint="…"></div>
   Unterschiedliche Maßstäbe: Durchlass in V / mA, Sperr in V / µA.
   ========================================================================= */
(function () {
  "use strict";
  var LT = window.LT;
  var DEV = LT.phys.devices.si;
  var Y0 = 0.4; // Lage der U-Achse (Anteil der Höhe von unten)
  var IMAX = 300, IRMAX = 10, URMAX_AX = 80, UFMAX_AX = 1.6;

  var TERMS = {
    durchlass: { t: "Durchlassrichtung", d: "Plus an der Anode, Minus an der Kathode. Ab der Schleusenspannung steigt der Strom sehr steil an – die Diode leitet." },
    schleuse: { t: "Schleusenspannung (Durchlassspannung)", d: "Mindestspannung in Durchlassrichtung, ab der ein nennenswerter Strom fließt. Bei Silizium etwa 0,6 bis 0,7 V." },
    ifmax: { t: "Maximaler Durchlassstrom", d: "Größter Strom in Durchlassrichtung, der dauerhaft fließen darf, ohne dass die Diode beschädigt wird. BAY 44: I<sub>F</sub> = 250 mA." },
    sperr: { t: "Sperrrichtung", d: "Minus an der Anode, Plus an der Kathode. Es fließt nur ein winziger Sperrstrom im Nano- bis Mikroampere-Bereich – die Diode sperrt." },
    urmax: { t: "Maximale Sperrspannung", d: "Größte Spannung, die in Sperrrichtung angelegt werden darf. BAY 44: U<sub>R</sub> = 50 V. Höhere Werte sind nicht zulässig." },
    durchbruch: { t: "Durchbruchspannung", d: "Ab dieser Spannung leitet die Diode in Sperrrichtung schlagartig. Ohne Strombegrenzung wird sie durch Überhitzung zerstört." }
  };

  LT.$$('[data-sim="kennlinie"]').forEach(init);

  function yv(I) { return I >= 0 ? I * 1e3 : I * 1e6; }

  function init(host) {
    var ui = LT.lab(host, { icon: "chart", top: true });
    var st = { k: 750, show: false, active: null };

    function uOfK(k) { return k <= 500 ? -URMAX_AX * (1 - k / 500) : (k - 500) / 500 * 1.4; }

    var slider = LT.slider(ui.controls, {
      label: "Spannung an der Diode", min: 0, max: 1000, step: 1, value: st.k,
      format: function (k) { var u = uOfK(k); return (u < 0 ? "–" : "") + LT.num(Math.abs(u), u < 0 ? 1 : 2) + " V"; },
      onInput: function (k) { st.k = k; chart.render(); update(); },
      help: "Links vom Nullpunkt: Sperrrichtung, rechts: Durchlassrichtung."
    });
    var sw = document.createElement("label");
    sw.className = "switch";
    sw.innerHTML = '<input type="checkbox"> Alle Fachbegriffe einblenden';
    ui.controls.appendChild(sw);
    LT.$("input", sw).addEventListener("change", function (e) { st.show = e.target.checked; chart.render(); });

    var readout = document.createElement("dl");
    readout.className = "readout";
    ui.controls.appendChild(readout);
    var status = document.createElement("div");
    ui.controls.appendChild(status);
    var term = document.createElement("div");
    term.className = "hotspot-info kl-term";
    term.setAttribute("aria-live", "polite");
    term.innerHTML = "<strong>Fachbegriffe an der Kennlinie</strong><p>Tippen Sie auf eine nummerierte Markierung im Diagramm.</p>";

    var xs = {
      map: function (u) { return u < 0 ? 0.5 * (1 + u / URMAX_AX) : 0.5 + 0.5 * u / UFMAX_AX; },
      invert: function (t) { return t < 0.5 ? URMAX_AX * (t / 0.5 - 1) : (t - 0.5) / 0.5 * UFMAX_AX; },
      ticks: [-80, -60, -40, -20, 0.4, 0.8, 1.2, 1.6],
      fmt: function (v) { return v < 0 ? LT.num(-v, 0) : LT.num(v, 1); },
      axisAt: 0
    };
    var ys = {
      map: function (v) { return v >= 0 ? Y0 + (1 - Y0) * v / IMAX : Y0 * (1 + v / IRMAX); },
      invert: function (t) { return t >= Y0 ? (t - Y0) / (1 - Y0) * IMAX : (t / Y0 - 1) * IRMAX; },
      ticks: [-10, -8, -6, -4, -2, 100, 200, 300],
      fmt: function (v) { return LT.num(Math.abs(v), 0); },
      axisAt: 0
    };

    var chart = LT.chart(ui.stage, {
      ariaLabel: "Kennlinie der Silizium-Diode BAY 44 mit Durchlass- und Sperrbereich",
      height: function (w) { return LT.clamp(w * 0.62, 360, 520); },
      margin: { t: 26, r: 18, b: 12, l: 44 },
      x: xs, y: ys,
      extraLabels: function (c, g) {
        var ax = c.sy(0), ay = c.sx(0);
        c.text(c.width - c.m.r, ax - 8, "U<sub>F</sub> in V", { "text-anchor": "end", class: "axis-label" }, g);
        c.text(c.m.l, ax - 8, "U<sub>R</sub> in V", { "text-anchor": "start", class: "axis-label" }, g);
        c.text(ay + 8, c.m.t - 8, "I<sub>F</sub> in mA", { class: "axis-label" }, g);
        c.text(ay + 10, c.height - c.m.b - 6, "I<sub>R</sub> in µA", { class: "axis-label" }, g);
      },
      draw: function (c) {
        // Grenzwerte
        c.el("line", { x1: c.sx(0), x2: c.sx(UFMAX_AX), y1: c.sy(DEV.IFmax * 1e3), y2: c.sy(DEV.IFmax * 1e3), class: "limit" }, c.gData);
        c.el("line", { x1: c.sx(-DEV.URmax), x2: c.sx(-DEV.URmax), y1: c.sy(0), y2: c.sy(-IRMAX), class: "limit" }, c.gData);
        // Kennlinie
        var fwd = c.sample(function (u) { return yv(LT.phys.current(DEV, u)); }, 0, UFMAX_AX, 260);
        var revOk = c.sample(function (u) { return yv(LT.phys.current(DEV, u)); }, -DEV.URmax, 0, 80);
        var revBad = c.sample(function (u) { return yv(LT.phys.current(DEV, u)); }, -URMAX_AX, -DEV.URmax, 220);
        c.path(fwd, { class: "series", stroke: DEV.color, "stroke-width": 2.75 });
        c.path(revOk, { class: "series", stroke: DEV.color, "stroke-width": 2.75 });
        c.path(revBad, { class: "series", stroke: DEV.color, "stroke-width": 2.75, "stroke-dasharray": "6 5" });

        // aktueller Punkt
        var u = uOfK(st.k), I = LT.phys.current(DEV, u), v = yv(I);
        var px = c.sx(u), py = c.sy(LT.clamp(v, -IRMAX * 1.05, IMAX * 1.05));
        c.el("line", { x1: px, x2: px, y1: c.sy(0), y2: py, class: "guide" }, c.gOver);
        c.el("line", { x1: c.sx(0), x2: px, y1: py, y2: py, class: "guide" }, c.gOver);
        c.el("circle", { cx: px, cy: py, r: 7, fill: "#ffc400", stroke: "#17202b", "stroke-width": 2 }, c.gOver);

        // Begriffe / Markierungen
        var spots = [
          { id: "durchlass", n: 1, x: c.sx(0.3), y: c.sy(165), lx: c.sx(0.3) + 18, ly: c.sy(165) + 4, a: "start" },
          { id: "schleuse", n: 2, x: c.sx(0.62), y: c.sy(0), lx: c.sx(0.62) + 2, ly: c.sy(0) + 40, a: "middle" },
          { id: "ifmax", n: 3, x: c.sx(0.3), y: c.sy(250), lx: c.sx(0.3) + 18, ly: c.sy(250) - 10, a: "start" },
          { id: "sperr", n: 4, x: c.sx(-25), y: c.sy(-4), lx: c.sx(-25), ly: c.sy(-4) + 30, a: "middle" },
          { id: "urmax", n: 5, x: c.sx(-DEV.URmax), y: c.sy(60), lx: c.sx(-DEV.URmax) + 18, ly: c.sy(60) + 4, a: "start", lead: [c.sx(-DEV.URmax), c.sy(60), c.sx(-DEV.URmax), c.sy(0)] },
          { id: "durchbruch", n: 6, x: c.sx(-DEV.UBR), y: c.sy(150), lx: c.sx(-DEV.UBR) + 18, ly: c.sy(150) + 4, a: "start", lead: [c.sx(-DEV.UBR), c.sy(150), c.sx(-DEV.UBR), c.sy(-1)] }
        ];
        spots.forEach(function (s) {
          if (s.lead) c.el("line", { x1: s.lead[0], y1: s.lead[1], x2: s.lead[2], y2: s.lead[3], stroke: "#6b7684", "stroke-dasharray": "2 3" }, c.gOver);
          var g = c.el("g", { class: "kl-spot", tabindex: 0, role: "button", "aria-label": TERMS[s.id].t, style: "cursor:pointer" }, c.gOver);
          c.el("circle", { cx: s.x, cy: s.y, r: 12, fill: st.active === s.id ? "#17202b" : "#ffc400", stroke: "#17202b", "stroke-width": 2 }, g);
          c.text(s.x, s.y + 4.5, String(s.n), { "text-anchor": "middle", "font-size": 12.5, "font-weight": 800, fill: st.active === s.id ? "#ffc400" : "#17202b" }, g);
          if (st.show || st.active === s.id) c.text(s.lx, s.ly, TERMS[s.id].t.replace(/ \(.*\)/, ""), { "text-anchor": s.a, class: "series-label", "font-size": 12 }, c.gOver);
          function pick() { st.active = s.id; term.innerHTML = "<strong>" + s.n + " · " + TERMS[s.id].t + "</strong><p>" + TERMS[s.id].d + "</p>"; chart.render(); }
          g.addEventListener("click", pick);
          g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
        });
        c.text(c.sx(UFMAX_AX) - 4, c.sy(DEV.IFmax * 1e3) - 6, "I<sub>F,max</sub>", { "text-anchor": "end", class: "limit-label" }, c.gOver);
        c.text(c.sx(-DEV.URmax) - 6, c.sy(-IRMAX) - 4, "U<sub>R,max</sub>", { "text-anchor": "end", class: "limit-label" }, c.gOver);
      }
    });

    ui.stage.appendChild(term);
    var cap = document.createElement("p");
    cap.className = "table-note";
    cap.textContent = "Achtung: Durchlass- und Sperrbereich haben unterschiedliche Maßstäbe (V und mA bzw. V und µA).";
    ui.stage.insertBefore(cap, term);

    function update() {
      var u = uOfK(st.k), I = LT.phys.current(DEV, u);
      readout.innerHTML =
        "<div><dt>Spannung</dt><dd>" + (u < 0 ? "U<sub>R</sub> = " + LT.num(-u, 1) : "U<sub>F</sub> = " + LT.num(u, 2)) + " V</dd></div>" +
        "<div><dt>Strom</dt><dd>" + (u < 0 ? "I<sub>R</sub> = " + LT.fmtI(-I) : "I<sub>F</sub> = " + LT.fmtI(I)) + "</dd></div>";
      if (u >= 0) {
        if (u < 0.55) LT.status(status, "info", "Unterhalb der Schleusenspannung", "Es fließt kaum Strom.");
        else if (I <= DEV.IFmax) LT.status(status, "ok", "Durchlassbereich", "Die Diode leitet. Kleine Spannungsänderung, große Stromänderung.");
        else LT.status(status, "bad", "Überlast", "Der maximale Durchlassstrom von 250 mA ist überschritten.");
      } else {
        if (-u <= DEV.URmax) LT.status(status, "ok", "Sperrbereich", "Die Diode sperrt, nur ein winziger Sperrstrom fließt.");
        else if (-u < DEV.UBR - 3) LT.status(status, "warn", "Über der maximalen Sperrspannung", "Nicht zulässig – die Diode ist dafür nicht spezifiziert.");
        else LT.status(status, "bad", "Durchbruch", "Die Diode leitet in Sperrrichtung. Ohne Strombegrenzung wird sie zerstört.");
      }
    }
    update();
  }
})();
