/* =========================================================================
   sim-heater.js – Anschluss-Check für Fachbetriebe
   Gerät + Entnahmestellen + Armatur + Netzanschluss → Prüfmeldungen
   Platzhalter: <div data-sim="heater"></div>   benötigt physics.js
   Zahlenwerte für den Strom nur bei SITE_CONFIG.showValues = true
   ========================================================================= */
(function () {
  "use strict";
  function T(o) { return window.SITE ? SITE.t(o) : o.de; }
  function F(x, d) { return window.SITE ? SITE.fmt(x, d) : x.toFixed(d || 0); }
  var SHOW = !!(window.SITE_CONFIG && window.SITE_CONFIG.showValues);

  var DEV = {
    K5:   { name: "TV-K5",   open: true,  phases: 1, p230: 2.0, p400: null, vol: 5,   price: 139, kind: "boil", en: "Boiling water unit 5 L", de: "Kochendwassergerät 5 L" },
    U5:   { name: "TV-U5",   open: true,  phases: 1, p230: 2.0, p400: null, vol: 5,   price: 89,  kind: "small", en: "Under-sink heater 5 L, open", de: "Untertisch-Kleinspeicher 5 L, offen" },
    S120: { name: "TV-S120", open: false, phases: 0, p230: 2.0, p400: 6.0,  vol: 120, price: 749, kind: "store", en: "Wall storage 120 L, pressure-resistant", de: "Wandspeicher 120 L, druckfest" },
    DH18: { name: "TV-DH18", open: false, phases: 3, p230: null, p400: 18,  vol: 0,   price: 249, kind: "hyd", en: "Instantaneous heater 18 kW, hydraulic", de: "Durchlauferhitzer 18 kW, hydraulisch" },
    DE21: { name: "TV-DE21", open: false, phases: 3, p230: null, p400: 21,  vol: 0,   price: 429, kind: "ele", en: "Instantaneous heater 21 kW, electronic", de: "Durchlauferhitzer 21 kW, elektronisch" }
  };
  var TAPS = [
    { k: "sink", en: "Kitchen sink", de: "Spüle" },
    { k: "basin", en: "Washbasin", de: "Waschtisch" },
    { k: "shower", en: "Shower", de: "Dusche" },
    { k: "tub", en: "Bathtub", de: "Badewanne" }
  ];

  function init(host) {
    var s = { dev: "S120", taps: { basin: true }, tap: "high", grid: "socket", comfort: "off" };

    function seg(key, opts) {
      return '<div class="seg" role="group">' + opts.map(function (o) {
        return '<button type="button" data-k="' + key + '" data-v="' + o.v + '" aria-pressed="' + (s[key] === o.v) + '">' + o.label + "</button>";
      }).join("") + "</div>";
    }

    function check() {
      var d = DEV[s.dev], L = [];
      var taps = TAPS.filter(function (t) { return s.taps[t.k]; });
      var n = taps.length, bath = s.taps.shower || s.taps.tub;
      var on400 = s.grid === "fixed400";
      var P = on400 ? (d.p400 || d.p230) : (d.p230 || d.p400);
      var phases = d.phases === 0 ? (on400 ? 3 : 1) : d.phases;
      var I = phases === 3 ? PHYS.current3(P, 400) : PHYS.current1(P, 230);

      // 1 Hydraulik
      if (d.open && s.tap === "high") L.push(["err", { en: "Hydraulics: an open (unpressurised) unit must not be combined with a pressure tap. The tank would be exposed to mains pressure.", de: "Hydraulik: Ein offenes (druckloses) Gerät darf nicht mit einer Druckarmatur betrieben werden. Der Behälter stünde unter Leitungsdruck." }]);
      if (d.open && s.tap === "low") L.push(["ok", { en: "Hydraulics: low-pressure tap with 3 connections – correct for open units.", de: "Hydraulik: Niederdruckarmatur mit 3 Anschlüssen – richtig für offene Geräte." }]);
      if (!d.open && s.tap === "low") L.push(["warn", { en: "Hydraulics: pressure-resistant units are designed for standard pressure taps and several tapping points.", de: "Hydraulik: Druckfeste Geräte sind für normale Druckarmaturen und mehrere Entnahmestellen gebaut." }]);
      if (!d.open && s.tap === "high") L.push(["ok", { en: "Hydraulics: pressure-resistant unit with pressure taps.", de: "Hydraulik: druckfestes Gerät mit Druckarmaturen." }]);
      if (d.kind === "store") L.push(["warn", { en: "Accessory required: safety group (relief valve 6 bar, non-return valve) in the cold-water inlet.", de: "Zubehör erforderlich: Sicherheitsgruppe (Sicherheitsventil 6 bar, Rückflussverhinderer) im Kaltwasser-Zulauf." }]);

      // 2 Entnahmestellen
      if (n === 0) L.push(["warn", { en: "Select at least one tapping point.", de: "Wählen Sie mindestens eine Entnahmestelle." }]);
      if (d.open && n > 1) L.push(["err", { en: "Tapping points: open units supply exactly one tapping point.", de: "Entnahmestellen: Offene Geräte versorgen genau eine Entnahmestelle." }]);
      if (d.open && bath) L.push(["err", { en: "Hot water volume: 5 L stored water is not designed for showering or filling a bathtub.", de: "Warmwassermenge: 5 L Speicherinhalt sind nicht für Duschen oder Wannenfüllungen ausgelegt." }]);
      if (d.kind === "boil" && n >= 1 && !(n === 1 && s.taps.sink)) L.push(["err", { en: "Boiling water units are mounted above a sink and deliver near-boiling water only.", de: "Kochendwassergeräte sitzen über einer Spüle und liefern nur heißes bis kochendes Wasser." }]);
      if (d.kind === "small" && n === 1 && !bath) L.push(["ok", { en: "Tapping point: one tap with low demand – suitable.", de: "Entnahmestelle: eine Zapfstelle mit geringem Bedarf – passend." }]);
      if (d.kind === "store" && n >= 1) {
        var h = PHYS.heatMinutes(d.vol, 50, P);
        L.push([s.taps.tub ? "warn" : "ok", {
          en: "Storage: " + d.vol + " L at 60 °C, afterwards heat-up time approx. " + (h < 120 ? F(h) + " min" : F(h / 60, 1) + " h") + " at " + F(P, 0) + " kW.",
          de: "Speicher: " + d.vol + " L bei 60 °C, danach Aufheizzeit ca. " + (h < 120 ? F(h) + " min" : F(h / 60, 1) + " h") + " bei " + F(P, 0) + " kW."
        }]);
      }
      if (d.vol === 0 && n >= 1) L.push(["ok", {
        en: "Instantaneous: unlimited hot water, approx. " + F(PHYS.flowForPower(P, 28), 1) + " L/min at Δϑ = 28 K.",
        de: "Durchlauf: Warmwasser ohne Vorrat-Grenze, ca. " + F(PHYS.flowForPower(P, 28), 1) + " L/min bei Δϑ = 28 K."
      }]);
      if (s.comfort === "on" && n >= 1) {
        if (d.kind === "hyd") L.push(["warn", { en: "Comfort: with hydraulic control the outlet temperature changes when a second tap is opened.", de: "Komfort: Bei hydraulischer Steuerung ändert sich die Auslauftemperatur, wenn eine zweite Zapfstelle öffnet." }]);
        if (d.kind === "ele") L.push(["ok", { en: "Comfort: the electronic control keeps the set temperature to the degree.", de: "Komfort: Die elektronische Regelung hält die eingestellte Temperatur gradgenau." }]);
      }

      // 3 Netzanschluss
      if (d.phases === 3 && !on400) {
        L.push(["err", { en: "Electrical: the current far exceeds the fuse rating of a 230 V / 16 A socket circuit. Instantaneous heaters require a fixed three-phase connection 3~/PE AC 400 V.", de: "Elektrik: Der Strom übersteigt die Absicherung eines Steckdosenstromkreises 230 V / 16 A um ein Vielfaches. Durchlauferhitzer benötigen einen Festanschluss 3~/PE AC 400 V." }]);
        L.push(["err", { en: "Single-phase loads are limited to 4.6 kVA (unbalanced load, VDE-AR-N 4100).", de: "Einphasige Verbraucher sind auf 4,6 kVA begrenzt (Schieflast, VDE-AR-N 4100)." }]);
      } else if (phases === 3) {
        L.push([I <= 32 ? "ok" : "err", { en: "Electrical: current per line conductor within the 3 × 32 A protection.", de: "Elektrik: Strom je Außenleiter innerhalb der Absicherung 3 × 32 A." }]);
      } else if (d.phases === 1 && on400) {
        L.push(["warn", { en: "Electrical: plug-in unit for 1~ 230 V – provide a Schuko socket (circuit from the distribution board).", de: "Elektrik: Steckerfertiges Gerät für 1~ 230 V – Schuko-Steckdose vorsehen (Stromkreis aus der Unterverteilung)." }]);
      } else {
        L.push([I <= 16 ? "ok" : "err", { en: "Electrical: current within the 16 A protection of the socket circuit.", de: "Elektrik: Strom innerhalb der Absicherung 16 A des Steckdosenstromkreises." }]);
      }
      if (P > 12) L.push(["warn", { en: "Grid operator: register the heater; units above 12 kW need the grid operator's approval before connection (TAB).", de: "Netzbetreiber: Gerät anmelden; Geräte über 12 kW brauchen vor dem Anschluss die Zustimmung des Netzbetreibers (TAB)." }]);

      return { L: L, P: P, I: I, phases: phases, d: d };
    }

    function render() {
      var r = check(), d = r.d;
      var devBtns = Object.keys(DEV).map(function (k) { return { v: k, label: DEV[k].name + '<br><small style="font-weight:400">' + T(DEV[k]) + "</small>" }; });
      var tapBoxes = TAPS.map(function (t) {
        return '<label style="display:inline-flex;gap:.4rem;align-items:center;margin:0 1rem .4rem 0;font-size:.9rem"><input type="checkbox" data-tap="' + t.k + '"' + (s.taps[t.k] ? " checked" : "") + "> " + T(t) + "</label>";
      }).join("");
      var curr = SHOW ? F(r.I, 1) + " A" : (r.phases === 3 ? "I = P / (√3 · U)" : "I = P / U");
      var acc = d.kind === "store" ? 39 : 0;
      host.innerHTML = '<div class="sim"><div class="sim__head"><h3>' + T({ en: "Connection check", de: "Anschluss-Check" }) + "</h3><span class=\"tag tag--cold\">" + T({ en: "for professionals", de: "für Fachbetriebe" }) + "</span></div>" +
        '<div class="sim__grid"><div>' +
          "<fieldset><legend>1 · " + T({ en: "Device", de: "Gerät" }) + "</legend>" + seg("dev", devBtns) + "</fieldset>" +
          "<fieldset><legend>2 · " + T({ en: "Tapping points supplied by this device", de: "Entnahmestellen, die dieses Gerät versorgt" }) + "</legend>" + tapBoxes + "</fieldset>" +
          "<fieldset><legend>3 · " + T({ en: "Tap", de: "Armatur" }) + "</legend>" + seg("tap", [{ v: "low", label: T({ en: "Low-pressure tap (3 connections)", de: "Niederdruckarmatur (3 Anschlüsse)" }) }, { v: "high", label: T({ en: "Pressure tap (2 connections)", de: "Druckarmatur (2 Anschlüsse)" }) }]) + "</fieldset>" +
          "<fieldset><legend>4 · " + T({ en: "Supply on site", de: "Anschluss vor Ort" }) + "</legend>" + seg("grid", [{ v: "socket", label: T({ en: "Schuko socket 1~ 230 V, 16 A", de: "Schuko-Steckdose 1~ 230 V, 16 A" }) }, { v: "fixed400", label: T({ en: "Fixed connection 3~ 400 V, 3 × 32 A", de: "Festanschluss 3~ 400 V, 3 × 32 A" }) }]) + "</fieldset>" +
          "<fieldset><legend>5 · " + T({ en: "Comfort requirement", de: "Komfortanspruch" }) + "</legend>" + seg("comfort", [{ v: "off", label: T({ en: "standard", de: "normal" }) }, { v: "on", label: T({ en: "constant temperature with simultaneous use", de: "konstante Temperatur bei gleichzeitiger Nutzung" }) }]) + "</fieldset>" +
        "</div><div>" +
          '<div class="readout"><div><span>' + T({ en: "Device", de: "Gerät" }) + "</span><b>" + d.name + "</b></div><div><span>" + T({ en: "Rated power", de: "Nennleistung" }) + "</span><b>" + F(r.P, 1) + " kW</b></div>" +
          "<div><span>" + T({ en: "Current", de: "Strom" }) + "</span><b" + (SHOW ? "" : ' style="font-size:.95rem"') + ">" + curr + "</b></div><div><span>" + T({ en: "List price", de: "Listenpreis" }) + "</span><b>" + F(d.price + acc) + " €</b></div></div>" +
          (acc ? '<p class="note">' + T({ en: "incl. safety group SG-10 (39 €)", de: "inkl. Sicherheitsgruppe SG-10 (39 €)" }) + "</p>" : "") +
          '<ul class="status">' + r.L.map(function (x) { return '<li class="' + x[0] + '">' + T(x[1]) + "</li>"; }).join("") + "</ul>" +
          '<p class="note">' + T({ en: "Planning aid – does not replace the installation instructions, VDE 0100 and the technical connection conditions (TAB) of your grid operator.", de: "Planungshilfe – ersetzt nicht Montageanleitung, DIN VDE 0100 und die Technischen Anschlussbedingungen (TAB) Ihres Netzbetreibers." }) + "</p>" +
        "</div></div></div>";

      host.querySelectorAll("button[data-k]").forEach(function (b) {
        b.addEventListener("click", function () {
          s[b.dataset.k] = b.dataset.v; render();
          var f = host.querySelector('button[data-k="' + b.dataset.k + '"][data-v="' + b.dataset.v + '"]'); if (f) f.focus();
        });
      });
      host.querySelectorAll("input[data-tap]").forEach(function (c) {
        c.addEventListener("change", function () {
          s.taps[c.dataset.tap] = c.checked; render();
          var f = host.querySelector('input[data-tap="' + c.dataset.tap + '"]'); if (f) f.focus();
        });
      });
    }
    render();
    document.addEventListener("langchange", render);
  }
  document.querySelectorAll('[data-sim="heater"]').forEach(init);
})();
