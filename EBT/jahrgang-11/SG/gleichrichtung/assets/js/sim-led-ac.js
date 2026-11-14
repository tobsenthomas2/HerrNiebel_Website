/* =========================================================================
   Simulation „LED an Wechselspannung“  ·  <div data-sim="led-ac">
   Gartentrafo (50 Hz) + Vorwiderstand 33 Ω + weiße LED; Schutz: keiner / Diode in Reihe / Diode antiparallel.
   Zeigt Quellenspannung (CH2), Spannung an der LED (CH1) und die zulässige Sperrspannung U_R = 5 V.
   Näherung: Im Sperrfall übernimmt die Schutzdiode in Reihe die gesamte Sperrspannung.
   ========================================================================= */
(function () {
  "use strict";
  function init(host) {
    var S = SIM.shell(host, "led");
    var st = { ueff: 12, prot: "none" };
    var R = 33, ULED = 2.75, RLED = 0.6, UD = 0.7, UR = 5;

    function model() {
      var uhat = st.ueff * Math.SQRT2, f = 50;
      function e(t) { return uhat * Math.sin(2 * Math.PI * f * t); }
      function i(t) {
        var v = e(t);
        if (v > 0) return Math.max(0, (v - ULED - (st.prot === "series" ? UD : 0)) / (R + RLED));
        return 0;
      }
      function iProt(t) { var v = e(t); return st.prot === "anti" && v < -UD ? (-v - UD) / R : 0; }
      function uLed(t) {
        var v = e(t), ii = i(t);
        if (v >= 0) return ii > 0 ? ULED + RLED * ii : SIM.clamp(v - (st.prot === "series" ? 0.4 : 0), 0, ULED);
        if (st.prot === "series") return 0;
        if (st.prot === "anti") return Math.max(v, -(UD + 0.02 * (-v)));
        return v;
      }
      return { uhat: uhat, e: e, i: i, iProt: iProt, uLed: uLed, light: function (t) { return Math.min(1, i(t) / 0.42); } };
    }

    var controls = document.createElement("div");
    controls.className = "controls";
    S.body.appendChild(controls);
    var ueffS = SIM.slider({ en: "Transformer voltage:", de: "Trafospannung:" }, 3, 15, 1, st.ueff, function (v) { return v + " V~"; }, function (v) { st.ueff = v; update(); });
    controls.appendChild(ueffS.el);
    controls.appendChild(SIM.seg({ en: "Protection", de: "Schutz" }, [
      { id: "none", en: "none", de: "keiner" },
      { id: "series", en: "diode in series", de: "Diode in Reihe" },
      { id: "anti", en: "diode antiparallel", de: "Diode antiparallel" }
    ], st.prot, function (id) { st.prot = id; drawCircuit(); update(); }).el);

    var row = document.createElement("div");
    row.className = "sim__row";
    S.body.appendChild(row);
    var left = document.createElement("div"), right = document.createElement("div");
    row.appendChild(left); row.appendChild(right);
    var sc = SIM.scope(left);
    var circuitHost = document.createElement("div");
    right.appendChild(circuitHost);
    var C;

    function drawCircuit() {
      circuitHost.innerHTML = "";
      C = SIM.circuit(circuitHost, 360, 200, { en: "Circuit: LED on a garden transformer", de: "Schaltplan: LED am Gartentrafo" });
      C.source(55, 100, 22, "~", "src");
      C.wire([[55, 78], [55, 40], [95, 40]], "top");
      C.resistor(95, 40, 155, 40, "top");
      C.text(125, 26, "-R1", { anchor: "middle" });
      if (st.prot === "series") {
        C.wire([[155, 40], [185, 40]], "top");
        C.diode(185, 40, 240, 40, "dser");
        C.text(212, 26, "-R2", { anchor: "middle" });
        C.wire([[240, 40], [300, 40], [300, 76]], "mid");
      } else {
        C.wire([[155, 40], [300, 40], [300, 76]], "mid");
      }
      C.diode(300, 76, 300, 128, "led", true);
      C.text(291, 106, "-P1", { anchor: "end" });
      if (st.prot === "anti") {
        C.wire([[300, 58], [240, 58], [240, 76]], "pa");
        C.diode(240, 128, 240, 76, "dpar");
        C.wire([[240, 128], [240, 150], [300, 150]], "pb");
        C.dot(300, 58); C.dot(300, 150);
        C.text(222, 106, "-R2", { anchor: "end" });
      }
      C.wire([[300, 128], [300, 172], [55, 172], [55, 122]], "bot");
      C.text(24, 104, "-G1", { anchor: "end" });
    }

    var lamp = document.createElement("div");
    lamp.className = "lamp-view";
    lamp.innerHTML = '<div class="lamp"><span class="lamp__bulb"><span class="lamp__glow"></span></span><span class="lt"></span></div>';
    var glow = lamp.querySelector(".lamp__glow");
    function lampText() { lamp.querySelector(".lt").innerHTML = SITE.t({ en: "LED in<br>slow motion", de: "LED in<br>Zeitlupe" }); }
    lampText(); SIM.onLang(lampText);

    var M = model();
    var player = SIM.player(S.body, host, function () { return 0.04; }, function (t) {
      sc.cursor(t);
      var v = M.e(t), on = M.i(t) > 0, prot = M.iProt(t) > 0;
      var segs = [];
      if (on) segs = ["src", "top", "dser", "mid", "led", "bot"];
      else if (prot) segs = ["src", "top", "mid", "pa", "dpar", "pb", "bot"];
      C.highlight(segs);
      var led = C.svg.querySelector('[data-seg="led"]');
      led.classList.toggle("lit", on);
      led.classList.toggle("blocked", v < 0 && !on);
      glow.style.opacity = M.light(t).toFixed(2);
    });
    player.el.appendChild(lamp);

    var status = SIM.status();
    S.body.appendChild(status.el);
    var readouts = document.createElement("div");
    readouts.className = "readouts";
    if (SITE.values) S.body.appendChild(readouts);
    S.foot.hidden = false;
    function foot() {
      S.foot.innerHTML = "<p>" + SITE.t({
        en: "Simplified model: white LED (threshold ≈ 2.75 V), series resistor 33 Ω, U<sub>F</sub> ≈ 0.7 V for the protection diode. Red line: maximum reverse voltage of the LED from the datasheet.",
        de: "Vereinfachtes Modell: weiße LED (Schwelle ≈ 2,75 V), Vorwiderstand 33 Ω, U<sub>F</sub> ≈ 0,7 V für die Schutzdiode. Rote Linie: maximale Sperrspannung der LED laut Datenblatt."
      }) + "</p>";
    }
    foot(); SIM.onLang(foot);

    function update() {
      M = model();
      var ymax = Math.max(10, Math.ceil(M.uhat / 5) * 5);
      sc.draw({
        t0: 0, t1: 0.04, xStep: 0.005, yMin: -ymax, yMax: ymax, yStep: 5, ratio: 0.55, minH: 230, maxH: 320,
        traces: [{ fn: M.e, color: "#4fd1c5", width: 1.8, dash: "5 4", opacity: 0.9 }, { fn: M.uLed, color: "#ffd43b", width: 2.6 }],
        hlines: [{ v: -UR, color: "#ff6b5b", label: { en: "−5 V: max. reverse voltage (LED)", de: "−5 V: max. Sperrspannung (LED)" }, below: true }],
        legend: [{ color: "#4fd1c5", text: { en: "CH2 transformer", de: "CH2 Trafo" } }, { color: "#ffd43b", text: { en: "CH1 LED", de: "CH1 LED" } }],
        light: M.light,
        aria: { en: "Scope: transformer voltage and LED voltage", de: "Oszi: Trafospannung und LED-Spannung" }
      });
      var rev = 0;
      for (var k = 0; k < 400; k++) rev = Math.max(rev, -M.uLed(k / 400 * 0.02));
      if (rev > UR) status.set("bad", SITE.t({ en: "In the negative half-wave the LED gets more reverse voltage than the datasheet allows (U<sub>R</sub> = 5 V). It will die sooner or later.", de: "In der negativen Halbwelle bekommt die LED mehr Sperrspannung, als das Datenblatt erlaubt (U<sub>R</sub> = 5 V). Sie stirbt früher oder später." }));
      else if (rev > 4) status.set("warn", SITE.t({ en: "Just below the limit U<sub>R</sub> = 5 V – no safety margin left.", de: "Knapp unter der Grenze U<sub>R</sub> = 5 V – keine Reserve mehr." }));
      else status.set("ok", SITE.t({ en: "The reverse voltage at the LED stays well below U<sub>R</sub> = 5 V – the LED survives.", de: "Die Sperrspannung an der LED bleibt deutlich unter U<sub>R</sub> = 5 V – die LED überlebt." }) +
        (st.prot === "anti" ? " " + SITE.t({ en: "In the negative half-wave the current flows through the protection diode and the resistor instead.", de: "In der negativen Halbwelle fließt der Strom stattdessen über Schutzdiode und Widerstand." }) : ""));
      if (SITE.values) readouts.innerHTML =
        '<span class="readout">û = <b>' + SITE.num(M.uhat, 1) + " V</b></span>" +
        '<span class="readout">' + SITE.t({ en: "max. reverse voltage at LED", de: "max. Sperrspannung an der LED" }) + " = <b>" + SITE.num(rev, 1) + " V</b></span>";
      player.refresh();
    }
    drawCircuit();
    update();
    SIM.onLang(update);
  }
  function boot() { document.querySelectorAll('[data-sim="led-ac"]').forEach(init); }
  if (document.readyState === "loading") document.addEventListener("siteready", boot); else boot();
})();
