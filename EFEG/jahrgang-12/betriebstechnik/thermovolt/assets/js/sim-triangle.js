/* =========================================================================
   sim-triangle.js – Magisches Dreieck: Leistung/Qualität – Kosten – Zeit
   Modellannahme (vereinfacht): erreichbare Leistung ≈ (Budget + Zeit) / 2 + 15
   Platzhalter: <div data-sim="triangle"></div>
   ========================================================================= */
(function () {
  "use strict";
  function T(o) { return window.SITE ? SITE.t(o) : o.de; }

  function init(host) {
    var start = { q: 60, c: 60, t: 60 };
    var s = { q: 60, c: 60, t: 60, lock: { q: false, c: false, t: false }, msg: null };
    var AX = {
      q: { en: "Scope / quality", de: "Leistung / Qualität", lo: { en: "basic", de: "einfach" }, hi: { en: "demanding", de: "anspruchsvoll" } },
      c: { en: "Budget", de: "Kosten (Budget)", lo: { en: "tight", de: "knapp" }, hi: { en: "generous", de: "großzügig" } },
      t: { en: "Time", de: "Zeit (Termin)", lo: { en: "tight", de: "knapp" }, hi: { en: "generous", de: "großzügig" } }
    };
    var SCEN = [
      { id: "c", set: { c: 25 }, lock: ["q", "t"], en: "Customer cuts the budget", de: "Kunde kürzt das Budget" },
      { id: "t", set: { t: 20 }, lock: ["q", "c"], en: "Deadline is brought forward", de: "Termin wird vorgezogen" },
      { id: "q", set: { q: 92 }, lock: ["c", "t"], en: "Customer wants more comfort", de: "Kunde wünscht mehr Komfort" }
    ];

    function feasible() { return s.q <= (s.c + s.t) / 2 + 15; }

    function svg() {
      var cx = 230, cy = 150, R = 118;
      var V = { q: [cx, cy - R], c: [cx - R * 0.866, cy + R * 0.5], t: [cx + R * 0.866, cy + R * 0.5] };
      function pt(k, v) { var f = 0.18 + 0.82 * v / 100; return [cx + (V[k][0] - cx) * f, cy + (V[k][1] - cy) * f]; }
      var ok = feasible(), col = ok ? "#2c7d47" : "#b8322a";
      var inner = ["q", "c", "t"].map(function (k) { var p = pt(k, s[k]); return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
      var g = '<polygon points="' + V.q.join(",") + " " + V.c.join(",") + " " + V.t.join(",") + '" fill="#fbf9f5" stroke="#d2cabc" stroke-width="2"/>';
      ["q", "c", "t"].forEach(function (k) { g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + V[k][0] + '" y2="' + V[k][1] + '" stroke="#e4ded3" stroke-width="1.5"/>'; });
      g += '<polygon points="' + inner + '" fill="' + col + '" fill-opacity=".18" stroke="' + col + '" stroke-width="3" stroke-linejoin="round"/>';
      ["q", "c", "t"].forEach(function (k) {
        var p = pt(k, s[k]);
        g += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="6" fill="' + col + '"/>';
      });
      g += '<text x="' + V.q[0] + '" y="' + (V.q[1] - 12) + '" text-anchor="middle" font-size="13" font-weight="800" fill="#1c222a">' + T(AX.q) + (s.lock.q ? " 🔒" : "") + "</text>";
      g += '<text x="' + (V.c[0] + 6) + '" y="' + (V.c[1] + 24) + '" text-anchor="middle" font-size="13" font-weight="800" fill="#1c222a">' + T(AX.c) + (s.lock.c ? " 🔒" : "") + "</text>";
      g += '<text x="' + (V.t[0] - 6) + '" y="' + (V.t[1] + 24) + '" text-anchor="middle" font-size="13" font-weight="800" fill="#1c222a">' + T(AX.t) + (s.lock.t ? " 🔒" : "") + "</text>";
      return '<svg viewBox="0 0 460 300" font-family="Inter, sans-serif" role="img" aria-label="' + T({ en: "Magic triangle", de: "Magisches Dreieck" }) + '">' + g + "</svg>";
    }

    function controls() {
      return ["q", "c", "t"].map(function (k) {
        return '<div class="range" style="margin-bottom:.9rem"><span>' + T(AX[k]) + ' <small class="muted">(' + T(AX[k].lo) + " ↔ " + T(AX[k].hi) + ')</small></span>' +
          '<button type="button" class="btn btn--ghost btn--small" data-lock="' + k + '" aria-pressed="' + s.lock[k] + '">' + (s.lock[k] ? "🔒 " + T({ en: "fixed", de: "fest" }) : "🔓 " + T({ en: "free", de: "frei" })) + "</button>" +
          '<input type="range" min="0" max="100" step="1" value="' + s[k] + '" data-k="' + k + '"' + (s.lock[k] ? " disabled" : "") + ' aria-label="' + T(AX[k]) + '"></div>';
      }).join("");
    }

    function status() {
      var ok = feasible();
      var txt = ok
        ? { en: "The three targets are compatible – the project can be planned like this.", de: "Die drei Zielgrößen passen zusammen – so lässt sich das Projekt planen." }
        : { en: "Conflict of objectives: this scope cannot be achieved with this budget and this time. At least one corner has to give – which one does the customer release?", de: "Zielkonflikt: Diese Leistung ist mit diesem Budget und dieser Zeit nicht erreichbar. Mindestens eine Ecke muss nachgeben – welche gibt der Kunde frei?" };
      return '<ul class="status"><li class="' + (ok ? "ok" : "err") + '">' + T(txt) + "</li></ul>" + (s.msg ? '<p class="note"><b>' + T({ en: "Scenario:", de: "Szenario:" }) + "</b> " + T(s.msg) + "</p>" : "");
    }

    function render() {
      host.innerHTML = '<div class="sim"><div class="sim__head"><h3>' + T({ en: "Magic triangle simulator", de: "Simulator Magisches Dreieck" }) + "</h3>" +
        '<button type="button" class="btn btn--ghost btn--small" data-reset>' + T({ en: "Reset", de: "Zurücksetzen" }) + "</button></div>" +
        '<p class="muted" style="margin-top:-.3rem">' + T({ en: "Example project: hot water for the kitchenette and changing rooms of a sports club house.", de: "Beispielprojekt: Warmwasser für Teeküche und Umkleiden eines Vereinsheims." }) + "</p>" +
        '<div class="sim__grid"><div>' + controls() +
          '<fieldset><legend>' + T({ en: "What happens if …?", de: "Was passiert, wenn …?" }) + '</legend><div class="seg">' +
          SCEN.map(function (x) { return '<button type="button" data-scen="' + x.id + '">' + T(x) + "</button>"; }).join("") + "</div></fieldset>" +
        '</div><div class="tri-res">' + svg() + status() + "</div></div></div>";

      host.querySelectorAll("input[data-k]").forEach(function (r) {
        r.addEventListener("input", function () { s[r.dataset.k] = parseFloat(r.value); s.msg = null; host.querySelector(".tri-res").innerHTML = svg() + status(); });
      });
      host.querySelectorAll("[data-lock]").forEach(function (b) {
        b.addEventListener("click", function () { var k = b.dataset.lock; s.lock[k] = !s.lock[k]; render(); var f = host.querySelector('[data-lock="' + k + '"]'); if (f) f.focus(); });
      });
      host.querySelectorAll("[data-scen]").forEach(function (b) {
        b.addEventListener("click", function () {
          var sc = SCEN.filter(function (x) { return x.id === b.dataset.scen; })[0];
          s.q = start.q; s.c = start.c; s.t = start.t; s.lock = { q: false, c: false, t: false };
          Object.keys(sc.set).forEach(function (k) { s[k] = sc.set[k]; });
          sc.lock.forEach(function (k) { s.lock[k] = true; });
          s.msg = { en: sc.en + " – the other two corners are fixed for now. Release one corner and find a solution.", de: sc.de + " – die beiden anderen Ecken sind vorerst fest. Geben Sie eine Ecke frei und suchen Sie eine Lösung." };
          render();
        });
      });
      host.querySelector("[data-reset]").addEventListener("click", function () { s.q = start.q; s.c = start.c; s.t = start.t; s.lock = { q: false, c: false, t: false }; s.msg = null; render(); });
    }
    render();
    document.addEventListener("langchange", render);
  }
  document.querySelectorAll('[data-sim="triangle"]').forEach(init);
})();
