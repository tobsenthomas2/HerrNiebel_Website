/* Startseite: LED im Hero umschalten */
(function () {
  "use strict";
  var LT = window.LT;
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
