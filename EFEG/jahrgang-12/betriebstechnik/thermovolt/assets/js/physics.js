/* =========================================================================
   THERMOVOLT – gemeinsame Rechenmodelle (Warmwasser & Netzanschluss)
   Vereinfachungen: c = 4,19 kJ/(kg·K), 1 L Wasser ≈ 1 kg, ohmsche Last (cos φ = 1)
   ========================================================================= */
(function () {
  "use strict";
  var C = 4.19; // kJ/(kg·K)

  window.PHYS = {
    C: C,
    // Leistung im Durchlauf: P [kW] = V̇ [L/min] / 60 · c · Δϑ
    powerForFlow: function (lpm, dT) { return lpm / 60 * C * dT; },
    // Durchfluss bei gegebener Leistung: V̇ [L/min]
    flowForPower: function (kW, dT) { return dT > 0 ? kW / (C * dT) * 60 : 0; },
    // Energie zum Erwärmen: Q [kWh] = m · c · Δϑ / 3600
    energyKWh: function (litres, dT) { return litres * C * dT / 3600; },
    // Aufheizzeit [min] = Q / P
    heatMinutes: function (litres, dT, kW) { return kW > 0 ? litres * C * dT / kW / 60 : Infinity; },
    // Mischwassermenge [L] aus Speicherinhalt (Speichertemp. ts, Mischtemp. tm, Kaltwasser tk)
    mixedLitres: function (litres, ts, tm, tk) { return tm > tk ? litres * (ts - tk) / (tm - tk) : 0; },
    // Strom einphasig I = P / U
    current1: function (kW, U) { return kW * 1000 / (U || 230); },
    // Strom dreiphasig I = P / (√3 · U)
    current3: function (kW, U) { return kW * 1000 / (Math.sqrt(3) * (U || 400)); }
  };
})();
