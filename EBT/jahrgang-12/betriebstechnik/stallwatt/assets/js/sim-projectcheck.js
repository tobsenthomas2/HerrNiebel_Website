/* =========================================================================
   sim-projectcheck.js – Kundendienst oder Projekt? (Merkmale nach DIN 69901-5)
   Platzhalter: <div data-sim="projectcheck"></div>
   ========================================================================= */
(function () {
  "use strict";
  function T(o) { return window.SITE ? SITE.t(o) : o.de; }

  var CRIT = [
    { k: "uniq", en: "Unique conditions as a whole", de: "Einmaligkeit der Bedingungen in ihrer Gesamtheit", hint: { en: "This combination of site, devices, people and requirements does not occur like this again.", de: "Diese Kombination aus Objekt, Geräten, Beteiligten und Anforderungen gibt es so kein zweites Mal." } },
    { k: "goal", en: "Defined target", de: "Zielvorgabe", hint: { en: "A clearly defined result has to be achieved and accepted.", de: "Es gibt ein klar festgelegtes Ergebnis, das erreicht und abgenommen wird." } },
    { k: "limit", en: "Limits of time, money, staff", de: "Begrenzungen (Zeit, Geld, Personal)", hint: { en: "Fixed deadline, fixed budget, limited capacity.", de: "Fester Termin, festes Budget, begrenzte Kapazität." } },
    { k: "scope", en: "Delimitation from other undertakings", de: "Abgrenzung gegenüber anderen Vorhaben", hint: { en: "It is clear what belongs to the order – and what other trades do.", de: "Es ist klar, was zum Auftrag gehört – und was andere Gewerke übernehmen." } },
    { k: "org", en: "Project-specific organisation", de: "Projektspezifische Organisation", hint: { en: "A team with roles, a project lead, coordination with the farm, other trades, the manufacturer.", de: "Ein Team mit Rollen und Projektleitung, Abstimmung mit Betrieb, anderen Gewerken, Hersteller." } }
  ];
  var JOBS = [
    { id: 1, ans: "service", en: "Replace a faulty barn luminaire 1:1", de: "Defekte Stallleuchte 1:1 tauschen",
      why: { en: "Routine job: known standard procedure, no special interfaces, done within an hour. A service order is enough.", de: "Routineauftrag: bekannter Standardablauf, keine besonderen Schnittstellen, in einer Stunde erledigt. Ein Kundendienstauftrag genügt." } },
    { id: 2, ans: "project", en: "Riding stable: new wash bay and tack room with radiant heaters and frost protection – devices, supply lines, coordination with the stable builder and the plumber, fixed budget, ready before the first frost", de: "Reiterhof: neuer Waschplatz und Sattelkammer mit Heizstrahlern und Frostschutz – Geräte, Zuleitungen, Abstimmung mit Stallbauer und Wasserinstallateur, festes Budget, fertig vor dem ersten Frost",
      why: { en: "Project: unique conditions, defined target, fixed budget and date, interfaces to other trades, a team has to coordinate.", de: "Projekt: einmalige Bedingungen, klare Zielvorgabe, festes Budget und fester Termin, Schnittstellen zu anderen Gewerken, ein Team muss sich abstimmen." } },
    { id: 3, ans: "service", en: "Annual inspection of portable appliances in a farm dairy", de: "Jährliche Prüfung der ortsveränderlichen Geräte in einer Hofmolkerei",
      why: { en: "Recurring routine with a fixed procedure – not unique. Service order with inspection report.", de: "Wiederkehrende Routine mit festem Ablauf – nicht einmalig. Kundendienstauftrag mit Prüfprotokoll." } }
  ];

  function init(host) {
    var s = { picks: {}, crit: {} };
    function render() {
      var n = CRIT.filter(function (c) { return s.crit[c.k]; }).length;
      var rec = (s.crit.uniq && n >= 3)
        ? '<li class="ok">' + T({ en: "Recommendation: open a project – with project lead and project charter (milestone M1).", de: "Empfehlung: Projekt anlegen – mit Projektleitung und Projektsteckbrief (Meilenstein M1)." }) + "</li>"
        : (n === 0 ? '<li class="warn">' + T({ en: "Tick the characteristics that apply to your order.", de: "Haken Sie die Merkmale an, die auf Ihren Auftrag zutreffen." }) + "</li>"
          : '<li class="warn">' + T({ en: "A service order may be sufficient. Is the job really unique as a whole?", de: "Ein Kundendienstauftrag kann genügen. Ist der Auftrag in seiner Gesamtheit wirklich einmalig?" }) + "</li>");
      host.innerHTML = '<div class="sim"><div class="sim__head"><h3>' + T({ en: "Service order or project?", de: "Kundendienst oder Projekt?" }) + "</h3></div>" +
        '<div class="sim__grid"><div><h4>' + T({ en: "Practice: three orders", de: "Übung: drei Aufträge" }) + "</h4>" +
        JOBS.map(function (j) {
          var p = s.picks[j.id], fb = "";
          if (p) fb = '<ul class="status"><li class="' + (p === j.ans ? "ok" : "err") + '">' + T(j.why) + "</li></ul>";
          return '<div class="card card--flat" style="margin-bottom:.7rem;padding:1rem"><p style="margin-bottom:.6rem"><b>' + j.id + ".</b> " + T(j) + '</p><div class="seg">' +
            '<button type="button" data-job="' + j.id + '" data-a="service" aria-pressed="' + (p === "service") + '">' + T({ en: "Service order", de: "Kundendienst" }) + "</button>" +
            '<button type="button" data-job="' + j.id + '" data-a="project" aria-pressed="' + (p === "project") + '">' + T({ en: "Project", de: "Projekt" }) + "</button></div>" + fb + "</div>";
        }).join("") +
        "</div><div><h4>" + T({ en: "Quick check for your order", de: "Schnell-Check für Ihren Auftrag" }) + "</h4>" +
        CRIT.map(function (c) {
          return '<label class="card card--flat" style="display:flex;gap:.7rem;align-items:flex-start;padding:.8rem 1rem;margin-bottom:.5rem;cursor:pointer"><input type="checkbox" data-c="' + c.k + '"' + (s.crit[c.k] ? " checked" : "") + ' style="margin-top:.3rem">' +
            "<span><b>" + T(c) + '</b><br><small class="muted">' + T(c.hint) + "</small></span></label>";
        }).join("") +
        '<ul class="status">' + rec + "</ul></div></div></div>";
      host.querySelectorAll("[data-job]").forEach(function (b) {
        b.addEventListener("click", function () { s.picks[b.dataset.job] = b.dataset.a; render(); var f = host.querySelector('[data-job="' + b.dataset.job + '"][data-a="' + b.dataset.a + '"]'); if (f) f.focus(); });
      });
      host.querySelectorAll("[data-c]").forEach(function (c) {
        c.addEventListener("change", function () { s.crit[c.dataset.c] = c.checked; render(); var f = host.querySelector('[data-c="' + c.dataset.c + '"]'); if (f) f.focus(); });
      });
    }
    render();
    document.addEventListener("langchange", render);
  }
  document.querySelectorAll('[data-sim="projectcheck"]').forEach(init);
})();
