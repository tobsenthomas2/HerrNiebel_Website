/* =========================================================================
   sim-power.js – Wie viel Leistung braucht Warmwasser?
   Durchlauf (Leistung aus Durchfluss) vs. Speicher (Aufheizzeit, Mischwasser)
   Platzhalter: <div data-sim="power"></div>   benötigt physics.js
   ========================================================================= */
(function () {
  "use strict";
  function T(o) { return window.SITE ? SITE.t(o) : o.de; }
  function F(x, d) { return window.SITE ? SITE.fmt(x, d) : x.toFixed(d || 0); }

  function init(host) {
    var s = { mode: "flow", lpm: 9, tk: 10, tw: 38, vol: 30, ts: 60, kw: 2 };
    var DEV = [2, 6, 18, 21];
    var UNIT = { lpm: "L/min", tk: "°C", tw: "°C", vol: "L", ts: "°C" };

    function range(key, label, min, max, step) {
      return '<label class="range"><span>' + T(label) + '</span><output data-o="' + key + '"></output>' +
        '<input type="range" data-k="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + s[key] + '"></label>';
    }

    function controls() {
      if (s.mode === "flow") {
        return range("lpm", { en: "Flow rate", de: "Durchfluss" }, 2, 14, 0.5) +
          range("tk", { en: "Cold water", de: "Kaltwasser" }, 5, 20, 1) +
          range("tw", { en: "Hot water at the tap", de: "Warmwasser an der Zapfstelle" }, 30, 60, 1);
      }
      return range("vol", { en: "Tank volume", de: "Speicherinhalt" }, 5, 150, 5) +
        range("ts", { en: "Storage temperature", de: "Speichertemperatur" }, 40, 85, 1) +
        range("tk", { en: "Cold water", de: "Kaltwasser" }, 5, 20, 1) +
        "<fieldset><legend>" + T({ en: "Heating power", de: "Heizleistung" }) + '</legend><div class="seg">' + [2, 3, 6].map(function (k) {
          return '<button type="button" data-kw="' + k + '" aria-pressed="' + (s.kw === k) + '">' + k + " kW</button>";
        }).join("") + "</div></fieldset>";
    }

    function flowResult() {
      var dT = Math.max(0, s.tw - s.tk);
      var P = PHYS.powerForFlow(s.lpm, dT);
      var max = Math.max(24, P * 1.1), W = 460;
      var rows = [{ kw: P, req: true }].concat(DEV.map(function (k) { return { kw: k }; }));
      var bars = rows.map(function (r, i) {
        var y = 10 + i * 40, w = Math.max(2, r.kw / max * (W - 190));
        var col = r.req ? "#e0522a" : (r.kw >= P ? "#2c7d47" : "#9aa4ae");
        var label = r.req ? T({ en: "required", de: "benötigt" }) : T({ en: "heater ", de: "Gerät " }) + r.kw + " kW";
        var val = r.req ? F(P, 1) + " kW" : F(PHYS.flowForPower(r.kw, dT), 1) + " L/min";
        return '<text x="0" y="' + (y + 17) + '" font-size="12" font-weight="700" fill="#1c222a">' + label + "</text>" +
          '<rect x="104" y="' + y + '" width="' + w.toFixed(1) + '" height="24" rx="5" fill="' + col + '"/>' +
          '<text x="' + (110 + w).toFixed(1) + '" y="' + (y + 17) + '" font-size="12" fill="#47515d">' + val + "</text>";
      }).join("");
      return '<svg viewBox="0 0 460 206" role="img" aria-label="' + T({ en: "Required power compared with heater ratings", de: "Benötigte Leistung im Vergleich zu Heizleistungen" }) + '" font-family="Inter, sans-serif">' + bars + "</svg>" +
        '<div class="readout"><div><span>Δϑ</span><b>' + F(dT) + " K</b></div><div><span>" + T({ en: "Power in flow mode", de: "Leistung im Durchlauf" }) + "</span><b>" + F(P, 1) + " kW</b></div></div>" +
        '<p class="note">' + T({ en: "Green/grey bars: flow rate a heater of this rating can deliver at the chosen Δϑ (green = enough). P = V̇ · c · Δϑ with c = 4.19 kJ/(kg·K).", de: "Grüne/graue Balken: Durchfluss, den ein Gerät dieser Leistung beim gewählten Δϑ schafft (grün = reicht). P = V̇ · c · Δϑ mit c = 4,19 kJ/(kg·K)." }) + "</p>";
    }

    function storeResult() {
      var dT = Math.max(0, s.ts - s.tk);
      var Q = PHYS.energyKWh(s.vol, dT), t = PHYS.heatMinutes(s.vol, dT, s.kw);
      var mix = PHYS.mixedLitres(s.vol, s.ts, 38, s.tk);
      var fill = Math.min(1, s.vol / 150);
      return '<svg viewBox="0 0 460 170" font-family="Inter, sans-serif" role="img" aria-label="' + T({ en: "Storage tank", de: "Speicher" }) + '">' +
        '<rect x="20" y="10" width="110" height="150" rx="16" fill="#f4f6f8" stroke="#17698a" stroke-width="3"/>' +
        '<rect x="23" y="' + (157 - 144 * fill).toFixed(1) + '" width="104" height="' + (144 * fill).toFixed(1) + '" rx="12" fill="#e0522a" opacity=".25"/>' +
        '<text x="75" y="92" text-anchor="middle" font-size="16" font-weight="800" fill="#1c222a">' + F(s.vol) + " L</text>" +
        '<text x="160" y="36" font-size="13" fill="#47515d">' + T({ en: "Energy content Q", de: "Energieinhalt Q" }) + '</text><text x="160" y="58" font-size="20" font-weight="800" fill="#1c222a">' + F(Q, 2) + " kWh</text>" +
        '<text x="160" y="92" font-size="13" fill="#47515d">' + T({ en: "Heat-up time at", de: "Aufheizzeit bei" }) + " " + s.kw + ' kW</text><text x="160" y="114" font-size="20" font-weight="800" fill="#1c222a">' + (t < 120 ? F(t) + " min" : F(t / 60, 1) + " h") + "</text>" +
        '<text x="160" y="146" font-size="13" fill="#47515d">' + T({ en: "Mixed water at 38 °C:", de: "Mischwasser mit 38 °C:" }) + ' <tspan font-weight="800" fill="#1c222a">' + F(mix, 1) + " L</tspan></text></svg>" +
        '<p class="note">' + T({ en: "Q = m · c · Δϑ, t = Q / P. Mixed water: tank water blended with cold water to 38 °C. Standby losses ignored.", de: "Q = m · c · Δϑ, t = Q / P. Mischwasser: Speicherwasser mit Kaltwasser auf 38 °C gemischt. Bereitschaftsverluste nicht berücksichtigt." }) + "</p>";
    }

    function update() {
      host.querySelectorAll("output[data-o]").forEach(function (o) {
        var k = o.dataset.o; o.textContent = F(s[k], k === "lpm" ? 1 : 0) + " " + UNIT[k];
      });
      host.querySelector(".sim-res").innerHTML = s.mode === "flow" ? flowResult() : storeResult();
    }

    function render() {
      host.innerHTML = '<div class="sim"><div class="sim__head"><h3>' + T({ en: "Power calculator: instantaneous or storage?", de: "Leistungsrechner: Durchlauf oder Speicher?" }) + "</h3>" +
        '<div class="seg" role="group"><button type="button" data-mode="flow" aria-pressed="' + (s.mode === "flow") + '">' + T({ en: "Instantaneous", de: "Durchlauf" }) + '</button><button type="button" data-mode="store" aria-pressed="' + (s.mode === "store") + '">' + T({ en: "Storage", de: "Speicher" }) + "</button></div></div>" +
        '<div class="sim__grid"><div>' + controls() + '</div><div class="sim-res"></div></div></div>';
      host.querySelectorAll("input[type=range]").forEach(function (r) {
        r.addEventListener("input", function () {
          s[r.dataset.k] = parseFloat(r.value);
          if (s.tw <= s.tk) s.tw = s.tk + 1;
          update();
        });
      });
      host.querySelectorAll("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { s.mode = b.dataset.mode; render(); }); });
      host.querySelectorAll("[data-kw]").forEach(function (b) {
        b.addEventListener("click", function () {
          s.kw = parseFloat(b.dataset.kw);
          host.querySelectorAll("[data-kw]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          update();
        });
      });
      update();
    }
    render();
    document.addEventListener("langchange", render);
  }
  document.querySelectorAll('[data-sim="power"]').forEach(init);
})();
