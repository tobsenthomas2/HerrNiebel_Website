/* =========================================================================
   sim-spec.js – Übung „Lastenheft oder Pflichtenheft?“ (Beispiel Hofkäserei)
   Platzhalter: <div data-sim="spec"></div>
   Werkzeug, keine Lösung zum Kundenfall: eigenes Übungsbeispiel.
   ========================================================================= */
(function () {
  "use strict";
  function T(o) { return window.SITE ? SITE.t(o) : o.de; }

  var CAT = {
    req: { en: "Requirements sheet", de: "Lastenheft" },
    spec: { en: "Specification sheet", de: "Pflichtenheft" },
    wish: { en: "Solution wish – check it", de: "Lösungswunsch – prüfen" }
  };
  var ITEMS = [
    { id: 1, a: "req", en: "In the morning the farm dairy needs 150 L of water at 60 °C to clean the vats.", de: "Die Hofkäserei braucht morgens 150 L Wasser mit 60 °C zum Reinigen der Kessel.",
      why: { en: "What is needed and what for – in the customer's words. Requirements sheet.", de: "Was gebraucht wird und wofür – in der Sprache des Kunden. Lastenheft." } },
    { id: 2, a: "spec", en: "One wall storage heater, 150 L, 6 kW, 3~ 400 V, own circuit 3 × 16 A.", de: "Ein Wandspeicher 150 L, 6 kW, 3~ 400 V, eigener Stromkreis 3 × 16 A.",
      why: { en: "Device and connection – how and with what. That is the contractor's answer: specification sheet.", de: "Gerät und Anschluss – wie und womit. Das ist die Antwort des Auftragnehmers: Pflichtenheft." } },
    { id: 3, a: "req", en: "Warm water must come at once at the hand-wash basin in the farm shop.", de: "Am Handwaschbecken im Hofladen soll sofort warmes Wasser kommen.",
      why: { en: "A use, no device yet: requirements sheet.", de: "Eine Nutzung, noch kein Gerät: Lastenheft." } },
    { id: 4, a: "wish", en: "Ideally an instantaneous heater like the one the neighbour has in his workshop.", de: "Am liebsten so einen Durchlauferhitzer, wie ihn der Nachbar in der Werkstatt hat.",
      why: { en: "The customer names a solution. Note it, but check in the specification sheet whether it meets the requirements – and explain your decision.", de: "Der Kunde nennt schon eine Lösung. Notieren – aber im Pflichtenheft prüfen, ob sie die Forderungen erfüllt, und die Entscheidung begründen." } },
    { id: 5, a: "spec", en: "Proof: 150 L from 12 °C to 60 °C → 8.4 kWh of heat; heat-up time with 6 kW ≈ 1.5 h (calculation attached).", de: "Nachweis: 150 L von 12 °C auf 60 °C → 8,4 kWh Wärme; Aufheizzeit mit 6 kW ≈ 1,5 h (Rechnung im Anhang).",
      why: { en: "A proof belongs to the implementation: specification sheet.", de: "Ein Nachweis gehört zur Umsetzung: Pflichtenheft." } },
    { id: 6, a: "req", en: "The farm releases at most € 2,500 for devices.", de: "Der Betrieb gibt höchstens 2.500 € für Geräte frei.",
      why: { en: "A boundary condition set by the customer: requirements sheet.", de: "Eine Rahmenbedingung des Auftraggebers: Lastenheft." } },
    { id: 7, a: "spec", en: "Acceptance: 150 L at ≥ 60 °C are available at 6:00 a.m., measured with a thermometer at the outlet.", de: "Abnahme: 150 L mit ≥ 60 °C stehen um 6:00 Uhr bereit, gemessen mit Thermometer am Auslauf.",
      why: { en: "Measurable acceptance criterion – defined by the contractor, agreed with the customer: specification sheet.", de: "Prüfbares Abnahmekriterium – vom Auftragnehmer formuliert, mit dem Kunden vereinbart: Pflichtenheft." } },
    { id: 8, a: "req", en: "Temporary staff are often school students – nobody may scald themselves at the hand-wash basin.", de: "Die Aushilfen sind oft Schüler – am Handwaschbecken darf sich niemand verbrühen.",
      why: { en: "A safety requirement in the customer's words. How it is solved (e.g. limiting the outlet temperature) goes into the specification sheet.", de: "Eine Sicherheitsforderung in Kundensprache. Wie sie gelöst wird (z. B. Auslauftemperatur begrenzen), steht dann im Pflichtenheft." } }
  ];

  function init(host) {
    var s = { picks: {} };
    function render() {
      var done = ITEMS.filter(function (i) { return s.picks[i.id]; }).length;
      var right = ITEMS.filter(function (i) { return s.picks[i.id] === i.a; }).length;
      host.innerHTML = '<div class="sim"><div class="sim__head"><h3>' + T({ en: "Practice: requirements or specification?", de: "Übung: Lastenheft oder Pflichtenheft?" }) + "</h3>" +
        '<button type="button" class="btn btn--ghost" data-reset>' + T({ en: "Reset", de: "Zurücksetzen" }) + "</button></div>" +
        '<p class="small muted">' + T({ en: "Example: farm dairy with farm shop. Assign each statement.", de: "Beispiel: Hofkäserei mit Hofladen. Ordnen Sie jede Aussage zu." }) + "</p>" +
        ITEMS.map(function (i) {
          var p = s.picks[i.id], fb = "";
          if (p) fb = '<ul class="status"><li class="' + (p === i.a ? "ok" : "err") + '">' + (p === i.a ? "" : T({ en: "Not quite. ", de: "Nicht ganz. " })) + T(i.why) + "</li></ul>";
          return '<div class="card card--flat" style="margin-bottom:.7rem;padding:1rem"><p style="margin-bottom:.6rem"><b>' + i.id + ".</b> " + T(i) + '</p><div class="seg">' +
            ["req", "spec", "wish"].map(function (k) {
              return '<button type="button" data-item="' + i.id + '" data-a="' + k + '" aria-pressed="' + (p === k) + '">' + T(CAT[k]) + "</button>";
            }).join("") + "</div>" + fb + "</div>";
        }).join("") +
        '<ul class="status"><li class="' + (done === ITEMS.length && right === ITEMS.length ? "ok" : "warn") + '">' +
        T({ en: right + " of " + ITEMS.length + " correct", de: right + " von " + ITEMS.length + " richtig" }) + "</li></ul></div>";
      host.querySelectorAll("[data-item]").forEach(function (b) {
        b.addEventListener("click", function () {
          s.picks[b.dataset.item] = b.dataset.a; render();
          var f = host.querySelector('[data-item="' + b.dataset.item + '"][data-a="' + b.dataset.a + '"]'); if (f) f.focus();
        });
      });
      host.querySelector("[data-reset]").addEventListener("click", function () { s.picks = {}; render(); });
    }
    render();
    document.addEventListener("langchange", render);
  }
  document.querySelectorAll('[data-sim="spec"]').forEach(init);
})();
