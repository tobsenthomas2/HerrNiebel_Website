/* =========================================================================
   sim-brood.js – Was kostet ein Aufzuchtdurchgang? Zwei Lösungen im Vergleich
   Platzhalter: <div data-sim="brood"></div>
   ========================================================================= */
(function () {
  "use strict";
  function T(o) { return window.SITE ? SITE.t(o) : o.de; }
  function F(x, d) { return window.SITE ? SITE.fmt(x, d) : x.toFixed(d || 0); }

  var DEV = {
    r250: { name: "SW-R250", w: 250, eur: 34 },
    d150: { name: "SW-D150", w: 150, eur: 42 },
    p60: { name: "SW-P60", w: 60, eur: 69 }
  };

  function init(host) {
    var s = { a: "r250", na: 10, b: "p60", nb: 10, days: 35, ct: 30 };

    function calc(dev, n) {
      var d = DEV[dev], kw = n * d.w / 1000, kwh = kw * 24 * s.days;
      return { kw: kw, kwh: kwh, cost: kwh * s.ct / 100, buy: n * d.eur };
    }
    function col(title, r, cls) {
      return '<div class="card card--flat ' + cls + '"><h4 style="margin:0 0 .4rem">' + title + "</h4>" +
        '<div class="readout"><div><span>' + T({ en: "Total power", de: "Leistung gesamt" }) + "</span><b>" + F(r.kw, 2) + " kW</b></div>" +
        "<div><span>" + T({ en: "Energy per cycle", de: "Energie je Durchgang" }) + "</span><b>" + F(r.kwh) + " kWh</b></div>" +
        "<div><span>" + T({ en: "Electricity per cycle", de: "Strom je Durchgang" }) + "</span><b>" + F(r.cost) + " €</b></div>" +
        "<div><span>" + T({ en: "Purchase (devices)", de: "Anschaffung (Geräte)" }) + "</span><b>" + F(r.buy) + " €</b></div></div></div>";
    }
    function result() {
      var A = calc(s.a, s.na), B = calc(s.b, s.nb), note;
      var dBuy = B.buy - A.buy, dCost = A.cost - B.cost;
      if (dBuy > 0 && dCost > 0) note = T({ en: "Solution B costs more to buy but saves electricity: the extra price is paid back after about ", de: "Lösung B ist in der Anschaffung teurer, spart aber Strom: Der Mehrpreis ist nach etwa " }) + "<b>" + F(dBuy / dCost, 1) + "</b>" + T({ en: " rearing cycles.", de: " Durchgängen bezahlt." });
      else if (dBuy < 0 && dCost < 0) note = T({ en: "Solution A costs more to buy but saves electricity: the extra price is paid back after about ", de: "Lösung A ist in der Anschaffung teurer, spart aber Strom: Der Mehrpreis ist nach etwa " }) + "<b>" + F(dBuy / dCost, 1) + "</b>" + T({ en: " rearing cycles.", de: " Durchgängen bezahlt." });
      else if (dBuy <= 0 && dCost >= 0) note = T({ en: "Solution B is cheaper to buy and no more expensive to run.", de: "Lösung B ist günstiger in der Anschaffung und im Betrieb nicht teurer." });
      else note = T({ en: "Solution A is cheaper to buy and no more expensive to run.", de: "Lösung A ist günstiger in der Anschaffung und im Betrieb nicht teurer." });
      return '<div class="grid-2">' + col(T({ en: "Solution A", de: "Lösung A" }) + " · " + s.na + " × " + DEV[s.a].name, A, "card--hot") + col(T({ en: "Solution B", de: "Lösung B" }) + " · " + s.nb + " × " + DEV[s.b].name, B, "card--cold") + "</div>" +
        '<p class="note">' + note + "</p>";
    }
    function pick(key) {
      return '<div class="seg">' + Object.keys(DEV).map(function (k) {
        return '<button type="button" data-k="' + key + '" data-v="' + k + '" aria-pressed="' + (s[key] === k) + '">' + DEV[k].name + "</button>";
      }).join("") + "</div>";
    }
    function range(key, label, min, max, unit) {
      return '<label class="range"><span>' + T(label) + '</span><output data-o="' + key + '">' + s[key] + unit + '</output><input type="range" data-r="' + key + '" data-u="' + unit + '" min="' + min + '" max="' + max + '" step="1" value="' + s[key] + '"></label>';
    }
    function render() {
      host.innerHTML = '<div class="sim"><div class="sim__head"><h3>' + T({ en: "Cost comparison per rearing cycle", de: "Kostenvergleich je Aufzuchtdurchgang" }) + "</h3></div>" +
        '<div class="sim__grid"><div>' +
        "<fieldset><legend>" + T({ en: "Solution A", de: "Lösung A" }) + "</legend>" + pick("a") + range("na", { en: "Number of devices", de: "Anzahl Geräte" }, 1, 40, "") + "</fieldset>" +
        "<fieldset><legend>" + T({ en: "Solution B", de: "Lösung B" }) + "</legend>" + pick("b") + range("nb", { en: "Number of devices", de: "Anzahl Geräte" }, 1, 40, "") + "</fieldset>" +
        range("days", { en: "Days with heating per cycle", de: "Tage mit Wärme je Durchgang" }, 7, 49, T({ en: " days", de: " Tage" })) +
        range("ct", { en: "Electricity price", de: "Strompreis" }, 20, 45, " ct/kWh") +
        '<p class="note">' + T({ en: "Assumption: continuous operation at full power, 24 hours a day. With a reduced setting or thermostat the consumption is lower. Barn air heater, installation and working time not included. Net prices.", de: "Annahme: Dauerbetrieb mit voller Leistung, 24 Stunden am Tag. Mit Sparschaltung oder Thermostat ist der Verbrauch geringer. Stall-Heizgerät, Installation und Arbeitszeit nicht enthalten. Nettopreise." }) + "</p>" +
        '</div><div class="sim-res">' + result() + "</div></div></div>";
      host.querySelectorAll("button[data-k]").forEach(function (b) { b.addEventListener("click", function () { s[b.dataset.k] = b.dataset.v; render(); }); });
      host.querySelectorAll("input[data-r]").forEach(function (r) {
        r.addEventListener("input", function () {
          s[r.dataset.r] = parseInt(r.value, 10);
          host.querySelector('[data-o="' + r.dataset.r + '"]').textContent = r.value + r.dataset.u;
          host.querySelector(".sim-res").innerHTML = result();
        });
      });
    }
    render();
    document.addEventListener("langchange", render);
  }
  document.querySelectorAll('[data-sim="brood"]').forEach(init);
})();
