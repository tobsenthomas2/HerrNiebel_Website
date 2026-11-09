/* =========================================================================
   sim-smart.js – SMART-Baukasten (Beispiel: Teeküche Vereinsheim)
   Platzhalter: <div data-sim="smart"></div>
   ========================================================================= */
(function () {
  "use strict";
  function T(o) { return window.SITE ? SITE.t(o) : o.de; }

  var PARTS = [
    { k: "S", name: { en: "Specific", de: "Spezifisch" }, q: { en: "What exactly, where exactly?", de: "Was genau, wo genau?" },
      opt: [{ en: "the club house", de: "das Vereinsheim" }, { en: "the kitchenette of the FC Thalbrunn club house", de: "die Teeküche im Vereinsheim des FC Thalbrunn" }] },
    { k: "M", name: { en: "Measurable", de: "Messbar" }, q: { en: "Which device, which values can be checked?", de: "Welches Gerät, welche Werte lassen sich prüfen?" },
      opt: [{ en: "somehow with hot water", de: "irgendwie mit heißem Wasser" }, { en: "with a TV-K5 boiling water unit (5 L, 2 kW, 230 V) above the sink for tea and coffee", de: "mit einem Kochendwassergerät TV-K5 (5 L, 2 kW, 230 V) über der Spüle für Tee und Kaffee" }] },
    { k: "A", name: { en: "Accepted", de: "Akzeptiert" }, q: { en: "Does the customer want exactly this – and has approved it?", de: "Will der Auftraggeber genau das – und hat er es freigegeben?" },
      opt: [{ en: "", de: "" }, { en: ", as ordered and approved by the club board", de: ", so wie es der Vereinsvorstand bestellt und freigegeben hat" }] },
    { k: "R", name: { en: "Realistic", de: "Realistisch" }, q: { en: "Feasible with the existing connection and budget?", de: "Mit vorhandenem Anschluss und Budget machbar?" },
      opt: [{ en: "", de: "" }, { en: " – connected to the existing Schuko socket, material max. €200 –", de: " – angeschlossen an die vorhandene Schuko-Steckdose, Material max. 200 € –" }] },
    { k: "T", name: { en: "Time-bound", de: "Terminiert" }, q: { en: "By when exactly?", de: "Bis wann genau?" },
      opt: [{ en: "Soon", de: "Bald" }, { en: "By Friday, 15 March, 12:00", de: "Bis Freitag, 15. März, 12:00 Uhr" }] }
  ];

  function init(host) {
    var s = { S: 0, M: 0, A: 0, R: 0, T: 0 };
    function P(k) { return PARTS.filter(function (p) { return p.k === k; })[0]; }
    function sentence() {
      var t = T(P("T").opt[s.T]), sp = T(P("S").opt[s.S]), m = T(P("M").opt[s.M]), r = T(P("R").opt[s.R]), a = T(P("A").opt[s.A]);
      if (window.SITE && SITE.lang() === "en") return t + ", " + sp + " will be equipped " + m + r + a + ".";
      return t + " wird " + sp + " " + m + r + " ausgestattet" + a + ".";
    }
    function render() {
      var score = PARTS.reduce(function (n, p) { return n + s[p.k]; }, 0);
      host.innerHTML = '<div class="sim"><div class="sim__head"><h3>' + T({ en: "SMART goal builder", de: "SMART-Baukasten" }) + '</h3><span class="tag tag--hot">' + score + " / 5</span></div>" +
        '<p class="muted" style="margin-top:-.3rem">' + T({ en: "Example: the football club wants boiling water for tea and coffee in its kitchenette. Turn the vague wish into a goal everyone can check.", de: "Beispiel: Der Fußballverein möchte in seiner Teeküche heißes Wasser für Tee und Kaffee. Machen Sie aus dem vagen Wunsch ein Ziel, das jeder überprüfen kann." }) + "</p>" +
        '<div class="sim__grid"><div>' +
        PARTS.map(function (p) {
          return "<fieldset><legend><b>" + p.k + "</b> – " + T(p.name) + ": " + T(p.q) + '</legend><div class="seg">' +
            [0, 1].map(function (i) {
              var lab = T(p.opt[i]).replace(/^[\s,–-]+|[\s,–-]+$/g, "");
              return '<button type="button" data-p="' + p.k + '" data-i="' + i + '" aria-pressed="' + (s[p.k] === i) + '">' + (lab || T({ en: "(not stated)", de: "(keine Angabe)" })) + "</button>";
            }).join("") + "</div></fieldset>";
        }).join("") +
        "</div><div>" +
          '<blockquote class="quote">„' + sentence() + '“</blockquote>' +
          '<ul class="status">' + PARTS.map(function (p) {
            return '<li class="' + (s[p.k] ? "ok" : "err") + '"><b>' + p.k + "</b>&nbsp;" + T(p.name) + (s[p.k] ? "" : " – " + T(p.q)) + "</li>";
          }).join("") + "</ul>" +
          (score === 5 ? '<p class="note">' + T({ en: "Every party can now check at acceptance whether the goal has been met.", de: "Bei der Abnahme kann jetzt jeder prüfen, ob das Ziel erreicht ist." }) + "</p>" : "") +
        "</div></div></div>";
      host.querySelectorAll("[data-p]").forEach(function (b) {
        b.addEventListener("click", function () { s[b.dataset.p] = parseInt(b.dataset.i, 10); render(); var f = host.querySelector('[data-p="' + b.dataset.p + '"][data-i="' + b.dataset.i + '"]'); if (f) f.focus(); });
      });
    }
    render();
    document.addEventListener("langchange", render);
  }
  document.querySelectorAll('[data-sim="smart"]').forEach(init);
})();
