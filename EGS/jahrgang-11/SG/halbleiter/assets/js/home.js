/* Startseite: Bauteil im Hero umschalten – Diode (Woche 1) bzw. LED (ab LED-Woche) */
(function () {
  "use strict";
  var LT = window.LT;

  /* Diode BAY 44/45/46: Typen unterscheiden sich nur in der Sperrspannung */
  var dhost = document.getElementById("hero-diode");
  if (dhost) {
    var UR = { "BAY 44": "50 V", "BAY 45": "150 V", "BAY 46": "300 V" };
    dhost.innerHTML = LT.artDiode({ dims: true });
    LT.$$("[data-diode]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-diode");
        LT.$("#hero-dtype").textContent = t;
        LT.$("#hero-dur").textContent = UR[t];
        LT.$$("[data-diode]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      });
    });
  }

  var host = document.getElementById("hero-led");
  if (!host) return;
  var D = LT.phys.devices;
  var INFO = {
    red: { type: "L-7113SURDK", col: "Rot, λ<sub>D</sub> 630 nm", dev: D.red },
    green: { type: "L-7113SGD", col: "Grün, λ<sub>D</sub> 568 nm", dev: D.green },
    blue: { type: "L-7113MBTL", col: "Blau, λ<sub>D</sub> 466 nm", dev: D.blue }
  };

  function show(color) {
    host.innerHTML = LT.artLED({ color: color, dims: true, lit: true, label: "5-mm-LED " + LT.LED_COLORS[color].name + " – Maßzeichnung" });
    var i = INFO[color];
    LT.$("#hero-type").textContent = i.type;
    LT.$("#hero-col").innerHTML = i.col;
    LT.$("#hero-uf").textContent = LT.num(i.dev.U20, 2) + " V";
    LT.$("#hero-if").textContent = LT.num(i.dev.IFmax * 1000, 0) + " mA";
    LT.$$("[data-led]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-led") === color)); });
  }
  LT.$$("[data-led]").forEach(function (b) {
    b.addEventListener("click", function () { show(b.getAttribute("data-led")); });
  });
  show("red");
})();
