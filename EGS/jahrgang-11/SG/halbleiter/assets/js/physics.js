/* =========================================================================
   LUMIATECH – Bauteilmodelle für alle Simulationen
   Durchlasskennlinie:  U(I) = U20 + nVt · ln(I / 20 mA) + Rs · (I − 20 mA)
   (Diodengleichung mit Bahnwiderstand, angepasst an die Datenblattwerte bei 20 mA)
   ========================================================================= */
(function () {
  "use strict";
  var LT = (window.LT = window.LT || {});
  var I20 = 0.02;

  var DEVICES = {
    si: {
      id: "si", name: "Si-Diode BAY 44", short: "Si-Diode", color: "#4b5563", dash: "",
      U20: 0.70, nVt: 0.05, Rs: 2.4,
      IFmax: 0.25, URmax: 50, UBR: 70, Ptot: 0.25
    },
    red: {
      id: "red", name: "LED rot L-7113SURDK", short: "LED rot", color: "#d3262b", dash: "",
      U20: 1.95, nVt: 0.05, Rs: 7,
      IFmax: 0.030, URmax: 5, Ptot: 0.075, lambdaD: 630, lambdaPeak: 645, material: "AlGaInP", glow: "#ff3b2f"
    },
    green: {
      id: "green", name: "LED grün L-7113SGD", short: "LED grün", color: "#14873d", dash: "7 5",
      U20: 2.20, nVt: 0.05, Rs: 12,
      IFmax: 0.025, URmax: 5, Ptot: 0.0625, lambdaD: 568, lambdaPeak: 565, material: "GaP", glow: "#38e06a"
    },
    blue: {
      id: "blue", name: "LED blau L-7113MBTL", short: "LED blau", color: "#1f5bd8", dash: "9 4 2 4",
      U20: 3.80, nVt: 0.06, Rs: 13,
      IFmax: 0.030, URmax: 5, Ptot: 0.105, lambdaD: 466, lambdaPeak: 430, material: "GaN auf SiC", glow: "#3d7bff"
    }
  };

  /** Spannung bei Strom I (A) – Durchlassrichtung */
  function U_of_I(dev, I) {
    if (I <= 0) return -Infinity;
    return dev.U20 + dev.nVt * Math.log(I / I20) + dev.Rs * (I - I20);
  }

  /** Strom bei Spannung U (V) – Durchlassrichtung, per Bisektion */
  function I_of_U(dev, U) {
    if (U <= 0) return 0;
    var lo = 1e-15, hi = 5;
    if (U_of_I(dev, hi) < U) return hi;
    for (var k = 0; k < 90; k++) {
      var mid = Math.sqrt(lo * hi); // logarithmische Bisektion
      if (U_of_I(dev, mid) > U) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  }

  /** Sperrstrom (A, negativ) bei negativer Spannung – Si-Diode mit Durchbruch */
  function I_reverse(dev, U) {
    var ur = -U; // Betrag
    if (ur <= 0) return 0;
    var leak = 0.02e-6 * (0.4 + ur / dev.URmax); // ca. 20 nA bei U_R,max
    var bd = dev.UBR ? 1e-6 * Math.exp((ur - dev.UBR) / 1.4) : 0;
    return -(leak + bd);
  }

  /** vollständige Kennlinie I(U) */
  function current(dev, U) { return U >= 0 ? I_of_U(dev, U) : I_reverse(dev, U); }

  /**
   * Arbeitspunkt einer Reihenschaltung aus Quelle Ub, Widerstand R und Bauteil.
   * Löst Ub = U_D(I) + R·I. Rückgabe {I, U, UR}
   */
  function operatingPoint(dev, Ub, R) {
    if (Ub <= 0) return { I: 0, U: 0, UR: 0 };
    var lo = 1e-15, hi = Ub / R;
    if (U_of_I(dev, hi) + R * hi < Ub) return { I: hi, U: 0, UR: Ub };
    for (var k = 0; k < 100; k++) {
      var mid = (lo + hi) / 2;
      if (U_of_I(dev, mid) + R * mid > Ub) hi = mid; else lo = mid;
    }
    var I = (lo + hi) / 2;
    return { I: I, U: Ub - R * I, UR: R * I };
  }

  /** Normreihe E12 */
  var E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  function e12Range(minOhm, maxOhm) {
    var out = [];
    for (var dec = 1; dec <= 1e6; dec *= 10) {
      E12.forEach(function (m) {
        var v = Math.round(m * dec * 100) / 100;
        if (v >= minOhm - 1e-9 && v <= maxOhm + 1e-9) out.push(v);
      });
    }
    return out;
  }

  /** Wellenlänge (nm) -> RGB-Farbe für Darstellung (sichtbar 380–780 nm) */
  function wavelengthToRGB(nm) {
    var r = 0, g = 0, b = 0;
    if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
    else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
    else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
    else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
    else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
    else if (nm <= 780) { r = 1; }
    var f = 1;
    if (nm > 700) f = 0.3 + 0.7 * (780 - nm) / 80;
    else if (nm < 420) f = 0.3 + 0.7 * (nm - 380) / 40;
    if (nm < 380 || nm > 780) return "rgb(70,40,40)";
    function c(x) { return Math.round(255 * Math.pow(x * f, 0.8)); }
    return "rgb(" + c(r) + "," + c(g) + "," + c(b) + ")";
  }

  LT.phys = {
    I20: I20,
    devices: DEVICES,
    U_of_I: U_of_I,
    I_of_U: I_of_U,
    current: current,
    operatingPoint: operatingPoint,
    E12: E12,
    e12Range: e12Range,
    wavelengthToRGB: wavelengthToRGB
  };
})();
