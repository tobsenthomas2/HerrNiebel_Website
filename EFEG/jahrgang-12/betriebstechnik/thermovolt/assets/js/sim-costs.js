/* =========================================================================
   sim-costs.js – Betriebskosten-Vergleich für die Warmwasserversorgung eines Bades
   TV-DH18 (hydraulisch) · TV-DE21 (elektronisch) · TV-S120 (Speicher)
   Platzhalter: <div data-sim="costs"></div>   benötigt physics.js
   ========================================================================= */
(function () {
  "use strict";
  function T(o) { return window.SITE ? SITE.t(o) : o.de; }
  function F(x, d) { return window.SITE ? SITE.fmt(x, d) : x.toFixed(d || 0); }

  var A = { flow: 9, tk: 10, tm: 38, extra: 0.15, hydFactor: 1.25, standby: 1.3 };
  var DEV = [
    { k: "DH18", name: "TV-DH18", price: 249, factor: A.hydFactor, standby: 0, col: "#9aa4ae", en: "hydraulic", de: "hydraulisch" },
    { k: "DE21", name: "TV-DE21", price: 429, factor: 1, standby: 0, col: "#e0522a", en: "electronic", de: "elektronisch" },
    { k: "S120", name: "TV-S120", price: 788, factor: 1, standby: A.standby, col: "#17698a", en: "storage 120 L", de: "Speicher 120 L" }
  ];

  function init(host) {
    var s = { persons: 1, showers: 1, minutes: 6, ct: 35, years: 15 };
    var UNIT = { persons: "", showers: "", minutes: " min", ct: " ct/kWh", years: T({ en: " years", de: " Jahre" }) };

    function range(key, label, min, max, step) {
      return '<label class="range"><span>' + T(label) + '</span><output data-o="' + key + '"></output>' +
        '<input type="range" data-k="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + s[key] + '"></label>';
    }

    function calc() {
      var qShower = PHYS.energyKWh(A.flow * s.minutes, A.tm - A.tk);
      var useful = s.persons * 365 * (s.showers * qShower + A.extra);
      return DEV.map(function (d) {
        var kwh = useful * d.factor + d.standby * 365;
        var eur = kwh * s.ct / 100;
        return { d: d, kwh: kwh, eur: eur, total: d.price + eur * s.years };
      });
    }

    function result() {
      var r = calc(), max = Math.max.apply(null, r.map(function (x) { return x.total; })) * 1.12;
      var bars = r.map(function (x, i) {
        var y = 12 + i * 52, wp = x.d.price / max * 300, we = x.eur * s.years / max * 300;
        return '<text x="0" y="' + (y + 13) + '" font-size="12" font-weight="800" fill="#1c222a">' + x.d.name + '</text><text x="0" y="' + (y + 28) + '" font-size="11" fill="#47515d">' + T(x.d) + "</text>" +
          '<rect x="104" y="' + y + '" width="' + wp.toFixed(1) + '" height="28" rx="4" fill="#1c222a"/>' +
          '<rect x="' + (104 + wp).toFixed(1) + '" y="' + y + '" width="' + we.toFixed(1) + '" height="28" rx="4" fill="' + x.d.col + '"/>' +
          '<text x="' + (110 + wp + we).toFixed(1) + '" y="' + (y + 19) + '" font-size="12" font-weight="700" fill="#1c222a">' + F(x.total) + " €</text>";
      }).join("");
      var hyd = r[0], ele = r[1];
      var saving = hyd.eur - ele.eur, payback = saving > 0 ? (ele.d.price - hyd.d.price) / saving : Infinity;
      var rows = r.map(function (x) {
        return "<tr><td><b>" + x.d.name + "</b></td><td class=num>" + F(x.d.price) + " €</td><td class=num>" + F(x.kwh) + " kWh</td><td class=num>" + F(x.eur) + " €</td><td class=num>" + F(x.total) + " €</td></tr>";
      }).join("");
      return '<svg viewBox="0 0 460 166" font-family="Inter, sans-serif" role="img" aria-label="' + T({ en: "Total cost of ownership", de: "Gesamtkosten über die Nutzungsdauer" }) + '">' + bars + "</svg>" +
        '<p class="note"><span style="display:inline-block;width:10px;height:10px;background:#1c222a;border-radius:2px"></span> ' + T({ en: "purchase (list price)", de: "Anschaffung (Listenpreis)" }) +
        ' &nbsp; <span style="display:inline-block;width:10px;height:10px;background:#9aa4ae;border-radius:2px"></span> <span style="display:inline-block;width:10px;height:10px;background:#e0522a;border-radius:2px"></span> <span style="display:inline-block;width:10px;height:10px;background:#17698a;border-radius:2px"></span> ' + T({ en: "electricity over", de: "Strom über" }) + " " + s.years + T({ en: " years", de: " Jahre" }) + "</p>" +
        '<div class="table-wrap" style="margin-top:.6rem"><table class="tech" style="min-width:460px"><thead><tr><th>' + T({ en: "Device", de: "Gerät" }) + '</th><th class=num>' + T({ en: "Purchase", de: "Anschaffung" }) + "</th><th class=num>" + T({ en: "Energy/year", de: "Energie/Jahr" }) + "</th><th class=num>" + T({ en: "Cost/year", de: "Kosten/Jahr" }) + "</th><th class=num>" + T({ en: "Total", de: "Gesamt" }) + "</th></tr></thead><tbody>" + rows + "</tbody></table></div>" +
        '<div class="readout"><div><span>' + T({ en: "Saving DE21 vs. DH18", de: "Ersparnis DE21 ggü. DH18" }) + "</span><b>" + F(saving) + " €/" + T({ en: "yr", de: "Jahr" }) + "</b></div><div><span>" + T({ en: "Extra price pays back after", de: "Mehrpreis eingespielt nach" }) + "</span><b>" + (isFinite(payback) ? F(payback, 1) + T({ en: " yrs", de: " Jahren" }) : "—") + "</b></div></div>";
    }

    function update() {
      host.querySelectorAll("output[data-o]").forEach(function (o) { o.textContent = F(s[o.dataset.o], o.dataset.o === "showers" ? 1 : 0) + UNIT[o.dataset.o]; });
      host.querySelector(".sim-res").innerHTML = result();
    }

    function render() {
      UNIT.years = T({ en: " years", de: " Jahre" });
      host.innerHTML = '<div class="sim"><div class="sim__head"><h3>' + T({ en: "Running cost comparison: bathroom", de: "Betriebskosten-Vergleich: Badezimmer" }) + "</h3></div>" +
        '<div class="sim__grid"><div>' +
          range("persons", { en: "Persons in the household", de: "Personen im Haushalt" }, 1, 4, 1) +
          range("showers", { en: "Showers per person and day", de: "Duschen pro Person und Tag" }, 0.5, 2, 0.5) +
          range("minutes", { en: "Duration per shower", de: "Dauer pro Dusche" }, 3, 12, 1) +
          range("ct", { en: "Electricity price", de: "Strompreis" }, 25, 50, 1) +
          range("years", { en: "Period of use", de: "Nutzungsdauer" }, 5, 20, 1) +
          '<p class="note">' + T({
            en: "Assumptions: shower 9 L/min, 10 → 38 °C, plus 0.15 kWh per person and day for the washbasin. Electronic control saves up to 30 % electricity in everyday use compared with hydraulic control – the calculator uses a conservative 20 % (hydraulic +25 %). Storage standby loss 1.3 kWh/24 h. Water and installation costs not included.",
            de: "Annahmen: Dusche 9 L/min, 10 → 38 °C, dazu 0,15 kWh pro Person und Tag für den Waschtisch. Elektronische Regelung spart im Alltag bis zu 30 % Strom gegenüber hydraulischer Steuerung – der Rechner nimmt vorsichtig 20 % an (hydraulisch +25 %). Bereitschaftsverlust Speicher 1,3 kWh/24 h. Wasser- und Montagekosten nicht enthalten."
          }) + "</p>" +
        '</div><div class="sim-res"></div></div></div>';
      host.querySelectorAll("input[type=range]").forEach(function (r) {
        r.addEventListener("input", function () { s[r.dataset.k] = parseFloat(r.value); update(); });
      });
      update();
    }
    render();
    document.addEventListener("langchange", render);
  }
  document.querySelectorAll('[data-sim="costs"]').forEach(init);
})();
