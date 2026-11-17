/* =========================================================================
   LUMIATECH – Retrofit-Konfigurator Signalsäule (rot, grün, blau)
   Platzhalter: <div data-sim="signalsaeule" data-title="…" data-hint="…"></div>
   Jede Leuchte: LED der Serie L-7113 + Vorwiderstand (E12) an U_b.
   ========================================================================= */
(function () {
  "use strict";
  var LT = window.LT, P = LT.phys, D = P.devices;
  var T = LT.t;
  var RS = P.e12Range(100, 2200);
  var P_RATED = 0.25; // Belastbarkeit Standard-Widerstand
  var MODS = [
    { k: "red", label: T("Fault", "Störung"), dev: D.red },
    { k: "green", label: T("System running", "Anlage läuft"), dev: D.green },
    { k: "blue", label: T("Intervention required", "Eingriff nötig"), dev: D.blue }
  ];

  LT.$$('[data-sim="signalsaeule"]').forEach(function (host) {
    var ui = LT.lab(host, { icon: "bulb", top: true });
    var show = !!LT.config.messwerteAnzeigen;
    var st = { Ub: 12, mods: MODS.map(function () { return { R: null, on: true, defect: false, t: 0 }; }) };

    LT.segmented(ui.controls, T("Tower supply", "Versorgung der Säule"), [
      { value: "12", label: "12 V DC" }, { value: "24", label: "24 V DC" }
    ], "12", function (v) { st.Ub = +v; update(); });
    var reset = document.createElement("button");
    reset.type = "button"; reset.className = "btn btn--ghost btn--small"; reset.textContent = T("Replace defective LEDs", "Defekte LEDs tauschen");
    reset.addEventListener("click", function () { st.mods.forEach(function (m) { m.defect = false; m.t = 0; }); update(); });
    ui.controls.appendChild(reset);
    var help = document.createElement("div");
    help.className = "pn-explain";
    help.innerHTML = T("<strong>How to proceed</strong><ol><li>Choose a series resistor from the E12 series for each light.</li><li>Switch on the light and check the current and the load on the resistor.</li><li>Only when all bars are in the green range is the tower safe to operate.</li></ol>", "<strong>So gehen Sie vor</strong><ol><li>Vorwiderstand je Leuchte aus der E12-Reihe wählen.</li><li>Leuchte einschalten und Strom sowie Widerstandsbelastung prüfen.</li><li>Erst wenn alle Balken im grünen Bereich sind, ist die Säule betriebssicher.</li></ol>");
    ui.controls.appendChild(help);

    var grid = document.createElement("div");
    grid.className = "ss-grid";
    ui.stage.appendChild(grid);
    var tower = document.createElement("div");
    tower.className = "ss-tower";
    grid.appendChild(tower);
    var list = document.createElement("div");
    list.className = "ss-mods";
    grid.appendChild(list);

    var cards = MODS.map(function (m, i) {
      var card = document.createElement("div");
      card.className = "ss-card";
      var opts = '<option value="">' + T('not fitted', 'nicht bestückt') + '</option><option value="0">' + T('no resistor (jumper)', 'ohne Widerstand (Brücke)') + '</option>' +
        RS.map(function (r) { return '<option value="' + r + '">' + LT.fmtR(r) + "</option>"; }).join("");
      card.innerHTML =
        '<div class="ss-card__head"><span class="swatch" style="background:' + m.dev.color + '"></span><strong>-P' + (i + 1) + " " + m.dev.short + "</strong><span class=\"muted\">" + m.label + "</span>" +
        '<label class="switch switch--sm"><input type="checkbox" checked> ' + T("On", "Ein") + '</label></div>' +
        '<label class="ss-sel"><span>' + T('Series resistor -R', 'Vorwiderstand -R') + '' + (i + 1) + '</span><select aria-label="' + T('Series resistor -R', 'Vorwiderstand -R') + '' + (i + 1) + '">' + opts + "</select></label>" +
        '<div class="ss-bar"><span>' + T('LED current', 'LED-Strom') + '</span><div class="bar"><i></i><b title="I_F,max"></b></div><em></em></div>' +
        '<div class="ss-bar"><span>' + T('Load on R', 'Belastung R') + '</span><div class="bar"><i></i><b title="' + T("0.25 W", "0,25 W") + '"></b></div><em></em></div>' +
        '<div class="ss-msg"><div></div></div>';
      list.appendChild(card);
      LT.$("select", card).addEventListener("change", function (e) { st.mods[i].R = e.target.value === "" ? null : +e.target.value; st.mods[i].t = 0; update(); });
      LT.$("input", card).addEventListener("change", function (e) { st.mods[i].on = e.target.checked; st.mods[i].t = 0; update(); });
      return card;
    });

    function calc(i) {
      var m = st.mods[i], dev = MODS[i].dev, r = { I: 0, U: 0, PR: 0, state: "off" };
      if (m.defect) { r.state = "defect"; return r; }
      if (!m.on) { r.state = "off"; return r; }
      if (m.R === null) { r.state = "open"; return r; }
      if (m.R === 0) { r.I = 1; r.state = "short"; return r; }
      var op = P.operatingPoint(dev, st.Ub, m.R);
      r.I = op.I; r.U = op.U; r.PR = op.UR * op.I;
      r.state = op.I > dev.IFmax ? "over" : op.I < 0.006 ? "dim" : "ok";
      return r;
    }

    function update() {
      var levels = {};
      MODS.forEach(function (m, i) {
        var r = calc(i), card = cards[i], dev = m.dev;
        if (r.state === "short") { st.mods[i].defect = true; r.state = "defect"; r.justBurnt = true; }
        levels[m.k] = r.state === "defect" ? 0 : LT.clamp(r.I / 0.02, 0, 1);
        var bars = LT.$$(".ss-bar", card);
        // ' + T('LED current', 'LED-Strom') + ': Skala bis 1,5 · I_F,max, Marke bei I_F,max
        var f1 = LT.clamp(r.I / (dev.IFmax * 1.5), 0, 1), f2 = LT.clamp(r.PR / (P_RATED * 1.5), 0, 1);
        LT.$("i", bars[0]).style.width = (f1 * 100) + "%";
        LT.$("i", bars[0]).className = r.I > dev.IFmax ? "is-bad" : r.I > 0 ? "is-ok" : "";
        LT.$("b", bars[0]).style.left = (100 / 1.5) + "%";
        LT.$("i", bars[1]).style.width = (f2 * 100) + "%";
        LT.$("i", bars[1]).className = r.PR > P_RATED ? "is-bad" : r.PR > 0 ? "is-ok" : "";
        LT.$("b", bars[1]).style.left = (100 / 1.5) + "%";
        LT.$("em", bars[0]).innerHTML = show && r.I > 0 && r.state !== "defect" ? LT.num(r.I * 1e3, 1) + " mA" : r.I > dev.IFmax ? T("too high", "zu hoch") : r.I > 0 ? T("permissible", "zulässig") : "–";
        LT.$("em", bars[1]).innerHTML = show && r.PR > 0 ? LT.num(r.PR, 2) + " W" : r.PR > P_RATED ? T("too high", "zu hoch") : r.PR > 0 ? T("permissible", "zulässig") : "–";
        var msg = LT.$(".ss-msg > div", card), t;
        if (r.state === "defect") t = ["bad", r.justBurnt ? T("LED destroyed immediately – without a series resistor the current is not limited.", "LED sofort zerstört – ohne Vorwiderstand ist der Strom nicht begrenzt.") : T("LED defective. Remedy the cause and replace the LED.", "LED defekt. Ursache beheben und LED tauschen.")];
        else if (r.state === "off") t = ["info", T("Switched off.", "Ausgeschaltet.")];
        else if (r.state === "open") t = ["info", T("No series resistor fitted – circuit open.", "Kein Vorwiderstand bestückt – Stromkreis offen.")];
        else if (r.state === "over") t = ["bad", T("Overload: the current is above I<sub>F,max</sub>. The LED ages quickly and fails.", "Überlast: Der Strom liegt über I<sub>F,max</sub>. Die LED altert schnell und fällt aus.")];
        else if (r.state === "dim") t = ["warn", T("Permissible, but clearly too dim for a signal tower.", "Zulässig, aber deutlich zu dunkel für eine Signalsäule.")];
        else if (r.PR > P_RATED) t = ["warn", T("LED fine, but the resistor is loaded with more than 0.25 W. Choose a larger size.", "LED in Ordnung, aber der Widerstand wird mit mehr als 0,25 W belastet. Größere Bauform wählen.")];
        else t = ["ok", T("Safe to operate.", "Betriebssicher.")];
        LT.status(msg, t[0], t[1], "");
        card.classList.toggle("is-defect", r.state === "defect");
      });
      tower.innerHTML = LT.artTower({ states: levels });
    }

    // Überlast führt nach kurzer Zeit zum Ausfall
    setInterval(function () {
      var changed = false;
      MODS.forEach(function (m, i) {
        var r = calc(i);
        if (r.state === "over") { st.mods[i].t += 0.5; if (st.mods[i].t >= 3) { st.mods[i].defect = true; changed = true; } }
      });
      if (changed) update();
    }, 500);
    update();
  });
})();
