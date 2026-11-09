/* =========================================================================
   sim-tank.js – Offenes oder druckfestes System? Armatur & Behälterdruck
   Platzhalter: <div data-sim="tank"></div>
   ========================================================================= */
(function () {
  "use strict";
  function T(o) { return window.SITE ? SITE.t(o) : o.de; }

  function init(host) {
    var s = { system: "open", tap: "low", valve: "closed", heat: "on" };

    function seg(key, opts) {
      return '<div class="seg" role="group">' + opts.map(function (o) {
        return '<button type="button" data-k="' + key + '" data-v="' + o.v + '" aria-pressed="' + (s[key] === o.v) + '">' + T(o) + "</button>";
      }).join("") + "</div>";
    }

    function valveSym(x, y, closed, color) {
      // Ventil als „Schleife“ (zwei Dreiecke), gefüllt = geschlossen
      var f = closed ? color : "#fff";
      return '<g><polygon points="' + (x - 14) + "," + (y - 10) + " " + (x - 14) + "," + (y + 10) + " " + x + "," + y + '" fill="' + f + '" stroke="' + color + '" stroke-width="2.4"/>' +
        '<polygon points="' + (x + 14) + "," + (y - 10) + " " + (x + 14) + "," + (y + 10) + " " + x + "," + y + '" fill="' + f + '" stroke="' + color + '" stroke-width="2.4"/>' +
        '<line x1="' + x + '" y1="' + (y - 10) + '" x2="' + x + '" y2="' + (y - 22) + '" stroke="#1c222a" stroke-width="2.4"/>' +
        '<line x1="' + (x - 9) + '" y1="' + (y - 22) + '" x2="' + (x + 9) + '" y2="' + (y - 22) + '" stroke="#1c222a" stroke-width="2.4"/></g>';
    }

    function pressure() {
      var closedValve = s.valve === "closed";
      if (s.tap === "low") return { p: 0, txt: "0 bar" };
      if (s.system === "closed" && s.heat === "on" && closedValve) return { p: 6, txt: "4 → 6 bar" };
      if (s.system === "open" && s.heat === "on" && closedValve) return { p: 5, txt: "> 4 bar" };
      return closedValve ? { p: 4, txt: "≈ 4 bar" } : { p: 3, txt: "≈ 3 bar" };
    }

    function svg() {
      var pr = pressure();
      var bad = s.system === "open" && s.tap === "high";
      var flowing = s.valve === "open";
      var tankStroke = bad ? "#b8322a" : (s.system === "open" ? "#7a8591" : "#17698a");
      var tankFill = s.system === "open" ? "#f4f6f8" : "#e8f1f5";
      var blue = "#17698a", red = "#e0522a";
      var g = "";
      // Kaltwasser-Zulauf
      g += '<text x="18" y="252" font-size="12" font-weight="700" fill="' + blue + '">' + T({ en: "Cold water mains", de: "Kaltwasser" }) + "</text>";
      g += '<text x="18" y="268" font-size="11" fill="#47515d">' + T({ en: "angle valve · 4 bar", de: "Eckventil · 4 bar" }) + "</text>";
      g += '<path d="M20 230 H 210 V 214" fill="none" stroke="' + blue + '" stroke-width="6" stroke-linecap="round"/>';
      // Position A (Zulauf)
      if (s.tap === "low") g += valveSym(120, 230, s.valve === "closed", blue);
      g += '<text x="120" y="290" text-anchor="middle" font-size="11" font-weight="700" fill="#47515d">' + T({ en: "Position A: inlet", de: "Stelle A: Zulauf" }) + "</text>";
      // Behälter
      var bulge = bad ? 6 : 0;
      g += '<rect x="' + (200 - bulge) + '" y="' + (110 - bulge) + '" width="' + (140 + 2 * bulge) + '" height="' + (104 + 2 * bulge) + '" rx="' + (16 + bulge) + '" fill="' + tankFill + '" stroke="' + tankStroke + '" stroke-width="3"/>';
      g += '<rect x="214" y="156" width="112" height="50" rx="8" fill="' + (s.heat === "on" ? "#fbe6dc" : "#ffffff") + '" opacity=".9"/>';
      // Heizwiderstand -R1 (Rechteck nach DIN EN 60617)
      g += '<line x1="236" y1="186" x2="252" y2="186" stroke="#1c222a" stroke-width="2"/><rect x="252" y="179" width="36" height="14" fill="#fff" stroke="#1c222a" stroke-width="2"/><line x1="288" y1="186" x2="304" y2="186" stroke="#1c222a" stroke-width="2"/>';
      g += '<text x="270" y="174" text-anchor="middle" font-size="11" font-weight="700" fill="#1c222a">-R1</text>';
      g += '<text x="270" y="130" text-anchor="middle" font-size="12" font-weight="800" fill="#1c222a">' +
        T(s.system === "open" ? { en: "open tank", de: "offener Behälter" } : { en: "pressure tank", de: "Druckbehälter" }) + "</text>";
      g += '<text x="270" y="145" text-anchor="middle" font-size="10.5" fill="#47515d">' +
        T(s.system === "open" ? { en: "plastic", de: "Kunststoff" } : { en: "enamelled steel", de: "Stahl emailliert" }) + "</text>";
      // Manometer
      var ang = -150 + Math.min(pr.p, 6) / 6 * 120;
      var rad = ang * Math.PI / 180;
      g += '<circle cx="372" cy="128" r="24" fill="#fff" stroke="#1c222a" stroke-width="2"/>';
      g += '<line x1="372" y1="128" x2="' + (372 + 17 * Math.cos(rad)).toFixed(1) + '" y2="' + (128 + 17 * Math.sin(rad)).toFixed(1) + '" stroke="' + (pr.p >= 4 && s.system === "open" ? "#b8322a" : "#1c222a") + '" stroke-width="2.6" stroke-linecap="round"/>';
      g += '<text x="372" y="168" text-anchor="middle" font-size="12" font-weight="800" fill="#1c222a">' + pr.txt + "</text>";
      g += '<line x1="340" y1="128" x2="348" y2="128" stroke="#1c222a" stroke-width="2"/>';
      // Warmwasser-Ablauf
      g += '<path d="M270 110 V 70 H 440 V 92" fill="none" stroke="' + red + '" stroke-width="6" stroke-linecap="round"/>';
      if (s.tap === "high") g += valveSym(400, 70, s.valve === "closed", red);
      g += '<text x="400" y="38" text-anchor="middle" font-size="11" font-weight="700" fill="#47515d">' + T({ en: "Position B: outlet", de: "Stelle B: Auslauf" }) + "</text>";
      // Auslauf / Tropfen
      var dripOutlet = (s.tap === "low" && (flowing || s.heat === "on")) || (s.tap === "high" && flowing);
      g += '<text x="452" y="112" font-size="11" font-weight="700" fill="' + red + '">' + T({ en: "spout", de: "Auslauf" }) + "</text>";
      if (dripOutlet) {
        if (flowing) g += '<path d="M440 96 C 436 120, 444 140, 440 170" stroke="' + red + '" stroke-width="5" fill="none" opacity=".75"/>';
        else g += '<circle cx="440" cy="106" r="4" fill="#17698a"/><circle cx="440" cy="122" r="3.4" fill="#17698a" opacity=".7"/>';
      }
      // Sicherheitsgruppe beim Druckspeicher
      if (s.system === "closed" && s.tap === "high") {
        g += '<rect x="150" y="238" width="44" height="18" rx="4" fill="#fff" stroke="#2c7d47" stroke-width="2"/><text x="172" y="251" text-anchor="middle" font-size="10" font-weight="700" fill="#2c7d47">SG</text>';
        if (s.heat === "on" && s.valve === "closed") g += '<circle cx="172" cy="266" r="3.4" fill="#17698a"/>';
      }
      // Leck bei falscher Kombination
      if (bad) g += '<circle cx="212" cy="222" r="4" fill="#17698a"/><circle cx="206" cy="236" r="3" fill="#17698a" opacity=".7"/><text x="236" y="234" font-size="11" font-weight="800" fill="#b8322a">' + T({ en: "leaking!", de: "undicht!" }) + "</text>";
      return '<svg viewBox="0 0 500 300" role="img" aria-label="' + T({ en: "Schematic of tank, valve position and pressure", de: "Schema Behälter, Ventilstelle und Druck" }) + '" font-family="Inter, sans-serif">' + g + "</svg>";
    }

    function status() {
      var L = [];
      if (s.system === "open" && s.tap === "low") {
        L.push(["ok", { en: "Tank stays unpressurised (0 bar): the valve sits in the cold-water inlet, the outlet is always open.", de: "Behälter bleibt drucklos (0 bar): Das Ventil sitzt im Kaltwasser-Zulauf, der Auslauf ist immer offen." }]);
        if (s.heat === "on" && s.valve === "closed") L.push(["ok", { en: "Expansion water drips from the spout while heating – this is normal.", de: "Beim Aufheizen tropft Ausdehnungswasser am Auslauf – das ist normal." }]);
        L.push(["warn", { en: "Open systems supply exactly one tapping point.", de: "Offene Geräte versorgen genau eine Entnahmestelle." }]);
      } else if (s.system === "open" && s.tap === "high") {
        L.push(["err", { en: "The unpressurised tank is exposed to mains pressure. It is not designed for this: deformation, leaks, risk of bursting.", de: "Der drucklose Behälter steht unter Leitungsdruck. Dafür ist er nicht gebaut: Verformung, Undichtigkeit, Bruchgefahr." }]);
        if (s.heat === "on" && s.valve === "closed") L.push(["err", { en: "While heating, the pressure rises further – there is no relief.", de: "Beim Aufheizen steigt der Druck weiter – es gibt keine Entlastung." }]);
      } else if (s.system === "closed" && s.tap === "high") {
        L.push(["ok", { en: "Pressure-resistant tank, designed for mains pressure. Several tapping points possible.", de: "Druckfester Behälter, für Leitungsdruck ausgelegt. Mehrere Entnahmestellen möglich." }]);
        L.push(["warn", { en: "A safety group (relief valve 6 bar, non-return valve) is mandatory in the cold-water inlet.", de: "Eine Sicherheitsgruppe (Sicherheitsventil 6 bar, Rückflussverhinderer) im Kaltwasser-Zulauf ist vorgeschrieben." }]);
        if (s.heat === "on" && s.valve === "closed") L.push(["ok", { en: "Expansion water leaves through the relief valve – normal.", de: "Ausdehnungswasser tritt am Sicherheitsventil aus – normal." }]);
      } else {
        L.push(["warn", { en: "Works hydraulically, but makes no sense: with a low-pressure tap only one tapping point – a pressure tank is built for pressure taps and several outlets.", de: "Hydraulisch möglich, aber unsinnig: Mit Niederdruckarmatur nur eine Zapfstelle – der Druckspeicher ist für Druckarmaturen und mehrere Zapfstellen gebaut." }]);
      }
      return '<ul class="status">' + L.map(function (x) { return '<li class="' + x[0] + '">' + T(x[1]) + "</li>"; }).join("") + "</ul>";
    }

    function render() {
      host.innerHTML =
        '<div class="sim"><div class="sim__head"><h3>' + T({ en: "Test bench: tank, tap and pressure", de: "Prüfstand: Behälter, Armatur und Druck" }) + "</h3></div>" +
        '<div class="sim__grid"><div>' +
          "<fieldset><legend>" + T({ en: "Device", de: "Gerät" }) + "</legend>" + seg("system", [{ v: "open", en: "Open (unpressurised) storage", de: "Offener (druckloser) Speicher" }, { v: "closed", en: "Closed (pressure-resistant) storage", de: "Geschlossener (druckfester) Speicher" }]) + "</fieldset>" +
          "<fieldset><legend>" + T({ en: "Tap", de: "Armatur" }) + "</legend>" + seg("tap", [{ v: "low", en: "Low-pressure tap (3 connections)", de: "Niederdruckarmatur (3 Anschlüsse)" }, { v: "high", en: "Pressure tap (2 connections)", de: "Druckarmatur (2 Anschlüsse)" }]) + "</fieldset>" +
          "<fieldset><legend>" + T({ en: "Operation", de: "Betrieb" }) + "</legend>" + seg("valve", [{ v: "closed", en: "Tap closed", de: "Armatur zu" }, { v: "open", en: "Tap open", de: "Armatur auf" }]) +
            '<div style="height:.4rem"></div>' + seg("heat", [{ v: "on", en: "Heating on", de: "Heizung ein" }, { v: "off", en: "Heating off", de: "Heizung aus" }]) + "</fieldset>" +
        "</div><div>" + svg() + status() +
          '<p class="note">' + T({ en: "Simplified schematic. A = valve in the cold-water inlet, B = valve in the hot-water outlet.", de: "Vereinfachtes Schema. A = Ventil im Kaltwasser-Zulauf, B = Ventil im Warmwasser-Auslauf." }) + "</p>" +
        "</div></div></div>";
      host.querySelectorAll("button[data-k]").forEach(function (b) {
        b.addEventListener("click", function () { s[b.dataset.k] = b.dataset.v; render(); var f = host.querySelector('button[data-k="' + b.dataset.k + '"][data-v="' + b.dataset.v + '"]'); if (f) f.focus(); });
      });
    }
    render();
    document.addEventListener("langchange", render);
  }

  document.querySelectorAll('[data-sim="tank"]').forEach(init);
})();
