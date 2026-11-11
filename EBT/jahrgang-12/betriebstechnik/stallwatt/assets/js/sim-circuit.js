/* =========================================================================
   sim-circuit.js – Prüfstand: Was hält ein Stromkreis aus?
   Geräte an einen Stromkreis hängen, Kabeltrommel wählen → Auslastung und Meldungen.
   config.js showValues = false: nur Balken und Meldungen (Schüler rechnen selbst)
   Platzhalter: <div data-sim="circuit"></div>
   ========================================================================= */
(function () {
  "use strict";
  function T(o) { return window.SITE ? SITE.t(o) : o.de; }
  function F(x, d) { return window.SITE ? SITE.fmt(x, d) : x.toFixed(d || 0); }
  var SHOW = !!(window.SITE_CONFIG && window.SITE_CONFIG.showValues);

  var DEV = [
    { k: "lamp", w: 250, max: 16, en: "Infrared lamp / radiant heater 250 W", de: "Infrarotlampe / Wärmestrahler 250 W" },
    { k: "dark", w: 150, max: 24, en: "Dark radiator 150 W", de: "Dunkelstrahler 150 W" },
    { k: "plate", w: 60, max: 24, en: "Brooder plate 60 W", de: "Wärmeplatte 60 W" },
    { k: "fan", w: 2000, max: 3, en: "Fan heater 2,000 W", de: "Heizlüfter 2.000 W" }
  ];
  var REEL = { none: null, wound: 1000, unwound: 3500 };

  function init(host) {
    var s = { lamp: 0, dark: 0, plate: 0, fan: 0, br: 16, reel: "none" };

    function total() { return DEV.reduce(function (p, d) { return p + s[d.k] * d.w; }, 0); }

    function result() {
      var P = total(), I = P / 230, ratio = I / s.br, li = [];
      var col = ratio > 1 ? "#b8322a" : (ratio > 0.8 ? "#a86b00" : "#2c7d47");
      var w = Math.min(1.6, ratio) / 1.6 * 320;
      var svg = '<svg viewBox="0 0 320 78" role="img" aria-label="' + T({ en: "Load on the circuit", de: "Auslastung des Stromkreises" }) + '" font-family="Inter, sans-serif">' +
        '<text x="0" y="13" font-size="13" font-weight="700" fill="#1c222a">' + T({ en: "Load on the circuit", de: "Auslastung des Stromkreises" }) + (SHOW ? ": " + F(ratio * 100) + " %" : "") + "</text>" +
        '<rect x="0" y="24" width="320" height="26" rx="6" fill="#eceae3"/>' +
        '<rect x="0" y="24" width="' + w.toFixed(1) + '" height="26" rx="6" fill="' + col + '"/>' +
        '<line x1="200" y1="18" x2="200" y2="56" stroke="#1c222a" stroke-width="2"/>' +
        '<text x="200" y="72" font-size="12" text-anchor="middle" fill="#47515d">' + T({ en: "limit: breaker B", de: "Grenze: LS B" }) + s.br + "</text></svg>";
      if (P === 0) li.push('<li class="warn">' + T({ en: "Add the devices that are connected to this circuit.", de: "Fügen Sie die Geräte hinzu, die an diesem Stromkreis hängen." }) + "</li>");
      else if (ratio > 1) li.push('<li class="err">' + T({ en: "Circuit overloaded: the current is higher than the breaker allows. It will trip after some time (thermal release) – the cable heats up until then.", de: "Stromkreis überlastet: Der Strom ist höher, als der Schutzschalter zulässt. Er löst nach einiger Zeit aus (thermischer Auslöser) – bis dahin erwärmt sich die Leitung." }) + "</li>");
      else if (ratio > 0.8) li.push('<li class="warn">' + T({ en: "Permissible, but hardly any reserve for continuous operation.", de: "Zulässig, aber kaum Reserve für den Dauerbetrieb." }) + "</li>");
      else li.push('<li class="ok">' + T({ en: "The circuit can carry this load.", de: "Der Stromkreis kann diese Last führen." }) + "</li>");
      if (s.reel !== "none" && P > 0) {
        var lim = REEL[s.reel];
        if (P > lim) li.push('<li class="err">' + (s.reel === "wound"
          ? T({ en: "Cable reel overloaded: wound up it may only carry 1,000 W. The heat cannot escape – the insulation softens.", de: "Kabeltrommel überlastet: Aufgewickelt darf sie nur 1.000 W führen. Die Wärme kann nicht weg – die Isolierung wird weich." })
          : T({ en: "Cable reel overloaded: even fully unwound it may only carry 3,500 W.", de: "Kabeltrommel überlastet: Auch vollständig abgewickelt darf sie nur 3.500 W führen." })) + "</li>");
        else li.push('<li class="ok">' + T({ en: "The cable reel can carry this load. For a permanent installation in the barn, use fixed sockets instead.", de: "Die Kabeltrommel kann diese Last führen. Für eine Dauerinstallation im Stall trotzdem feste Steckdosen verwenden." }) + "</li>");
      }
      var read = SHOW
        ? '<div class="readout"><div><span>P</span><b>' + F(P) + " W</b></div><div><span>I = P / U</span><b>" + F(I, 1) + " A</b></div></div>"
        : '<div class="readout"><div><span>P</span><b>? W</b></div><div><span>I = P / U</span><b>? A</b></div></div><p class="note">' + T({ en: "Calculate power and current yourself – the test bench only shows whether the circuit can take it.", de: "Leistung und Strom berechnen Sie selbst – der Prüfstand zeigt nur, ob der Stromkreis das aushält." }) + "</p>";
      return svg + '<ul class="status">' + li.join("") + "</ul>" + read;
    }

    function render() {
      host.innerHTML = '<div class="sim"><div class="sim__head"><h3>' + T({ en: "Test bench: one circuit, 230 V", de: "Prüfstand: ein Stromkreis, 230 V" }) + '</h3><button type="button" class="btn btn--ghost btn--small" data-reset>' + T({ en: "Reset", de: "Zurücksetzen" }) + "</button></div>" +
        '<div class="sim__grid"><div>' +
        DEV.map(function (d) {
          return '<label class="range"><span>' + T(d) + '</span><output data-o="' + d.k + '">' + s[d.k] + '</output><input type="range" data-k="' + d.k + '" min="0" max="' + d.max + '" step="1" value="' + s[d.k] + '"></label>';
        }).join("") +
        "<fieldset><legend>" + T({ en: "Circuit breaker", de: "Leitungsschutzschalter" }) + '</legend><div class="seg">' + [10, 16].map(function (b) {
          return '<button type="button" data-br="' + b + '" aria-pressed="' + (s.br === b) + '">B' + b + "</button>";
        }).join("") + "</div></fieldset>" +
        "<fieldset><legend>" + T({ en: "Connected via cable reel?", de: "Über Kabeltrommel angeschlossen?" }) + '</legend><div class="seg">' + [["none", { en: "no", de: "nein" }], ["wound", { en: "yes, wound", de: "ja, aufgewickelt" }], ["unwound", { en: "yes, unwound", de: "ja, abgewickelt" }]].map(function (o) {
          return '<button type="button" data-reel="' + o[0] + '" aria-pressed="' + (s.reel === o[0]) + '">' + T(o[1]) + "</button>";
        }).join("") + "</div></fieldset>" +
        '</div><div class="sim-res">' + result() + "</div></div></div>";
      host.querySelectorAll("input[type=range]").forEach(function (r) {
        r.addEventListener("input", function () {
          s[r.dataset.k] = parseInt(r.value, 10);
          host.querySelector('[data-o="' + r.dataset.k + '"]').textContent = r.value;
          host.querySelector(".sim-res").innerHTML = result();
        });
      });
      host.querySelectorAll("[data-br]").forEach(function (b) { b.addEventListener("click", function () { s.br = parseInt(b.dataset.br, 10); render(); }); });
      host.querySelectorAll("[data-reel]").forEach(function (b) { b.addEventListener("click", function () { s.reel = b.dataset.reel; render(); }); });
      host.querySelector("[data-reset]").addEventListener("click", function () { s = { lamp: 0, dark: 0, plate: 0, fan: 0, br: 16, reel: "none" }; render(); });
    }
    render();
    document.addEventListener("langchange", render);
  }
  document.querySelectorAll('[data-sim="circuit"]').forEach(init);
})();
