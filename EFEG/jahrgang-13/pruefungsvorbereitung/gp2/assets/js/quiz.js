/* Test-Seite: Aufgaben anzeigen, auswerten, erklären.
   Aufruf: test.html?t=<Test-ID>   optional &ids=B-01,B-03 (nur diese Aufgaben, z. B. „Falsche wiederholen“) */
(function () {
  "use strict";
  var AP2 = window.AP2, el = AP2.el, fmt = AP2.fmt, esc = AP2.esc;
  var params = new URLSearchParams(location.search);
  var test = AP2.testById(params.get("t") || "");
  var root = document.getElementById("quiz");
  var items = [];          // { q, perm, nr }
  var answers = [];        // gewählter Index in q.o (Originalreihenfolge) oder null
  var evaluated = false;

  AP2.frame(test ? test.title : "Test");

  if (!test) {
    root.innerHTML = '<div class="hero"><h1>Test nicht gefunden</h1><p class="lead">Bitte wählen Sie einen Test auf der ' +
      '<a href="index.html">Übersicht</a>.</p></div>';
    return;
  }

  /* ---------- Aufgaben zusammenstellen ---------- */
  var list;
  var only = params.get("ids");
  if (only) {
    list = only.split(",").map(AP2.qById).filter(Boolean);
  } else if (test.random) {
    list = AP2.shuffle(AP2.Q).slice(0, Math.min(test.random, AP2.Q.length));
  } else {
    list = test.ids.map(AP2.qById).filter(Boolean);
  }
  /* Antwortreihenfolge bleibt wie im Übungsblatt – die Erklärungen nennen die Antwortnummern. */
  list.forEach(function (q, i) {
    items.push({ q: q, perm: q.o.map(function (_, k) { return k; }), nr: i + 1 });
    answers.push(null);
  });

  document.title = test.title + " – Prüfungsvorbereitung GP 2";

  /* ---------- Kopf ---------- */
  var hero = el("div", { class: "hero" });
  hero.innerHTML =
    '<div class="eyebrow">Prüfungsvorbereitung · Gesellenprüfung Teil 2</div>' +
    "<h1>" + esc(test.icon || "") + " " + esc(test.title) + (only ? " – Wiederholung" : "") + "</h1>" +
    '<p class="test-meta">' + items.length + " Aufgaben · je 1 Punkt · ohne Zeitlimit · genau eine Antwort ist richtig. " +
    "Hilfsmittel wie in der Prüfung (Tabellenbuch, Taschenrechner).</p>";
  root.appendChild(hero);
  var noteBox = el("div", { class: "no-print" }, AP2.errorNote());
  root.appendChild(noteBox);
  var resultBox = el("section", { class: "result", id: "ergebnis", hidden: "", "aria-live": "polite", tabindex: "-1" });
  root.appendChild(resultBox);

  /* ---------- Aufgaben ---------- */
  items.forEach(function (it, i) {
    var q = it.q;
    var sec = el("section", { class: "q", id: "q-" + it.nr, "aria-labelledby": "q-" + it.nr + "-t" });
    var html =
      '<div class="q-head"><span class="q-nr" id="q-' + it.nr + '-t">Aufgabe ' + it.nr + '</span>' +
      '<span class="q-id">Nr. ' + esc(q.id) + (q.src ? " · " + esc(q.src) : "") + "</span></div>" +
      '<div class="q-text">' + fmt(q.q) + "</div>" + extras(q);
    html += "<fieldset><legend>Antworten zu Aufgabe " + it.nr + "</legend>";
    it.perm.forEach(function (k, pos) {
      var id = "q" + it.nr + "o" + pos;
      html += '<label class="opt" data-k="' + k + '"><input type="radio" name="q' + it.nr + '" id="' + id + '" value="' + k + '">' +
        '<span class="opt-box"><span class="opt-nr" aria-hidden="true">' + (pos + 1) + '</span>' +
        '<span class="opt-txt">' + optHtml(q.o[k]) + '</span><span class="tag"></span></span></label>';
    });
    html += "</fieldset>";
    sec.innerHTML = html;
    sec.addEventListener("change", function (e) {
      if (evaluated || !e.target.matches("input[type=radio]")) return;
      answers[i] = Number(e.target.value);
      progress();
    });
    root.appendChild(sec);
  });

  /* ---------- Abbildungen, Tabellen, Leistungsschild, Texte ---------- */
  function table(t) {
    return '<div class="tbl-wrap"><table class="data"><thead><tr>' +
      t.head.map(function (h) { return "<th>" + fmt(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      t.rows.map(function (r) {
        return "<tr>" + r.map(function (c) { return "<td>" + fmt(c) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
  }

  function extras(q) {
    var h = "";
    (q.figs || []).forEach(function (f) {
      h += '<figure class="fig"><a href="' + esc(f.src) + '" target="_blank" rel="noopener" title="Abbildung in voller Größe öffnen">' +
        '<img src="' + esc(f.src) + '" alt="' + esc(f.alt || "") + '" loading="lazy"></a>' +
        (f.cap ? "<figcaption>" + fmt(f.cap) + "</figcaption>" : "") +
        '<figcaption class="zoom-hint">Abbildung antippen, um sie zu vergrößern.</figcaption></figure>';
    });
    if (q.plate) {
      h += '<div class="plate" role="table" aria-label="Leistungsschild">' + q.plate.map(function (r) {
        return '<div class="plate-row" role="row">' + r.map(function (c) {
          return '<span role="cell">' + fmt(c) + "</span>";
        }).join("") + "</div>";
      }).join("") + "</div>";
    }
    (q.tables || []).forEach(function (t) { h += table(t); });
    (q.notes || []).forEach(function (n) { h += '<div class="q-note">' + fmt(n) + "</div>"; });
    return h;
  }

  function optHtml(o) {
    if (o && typeof o === "object" && o.img) {
      return '<img class="opt-img" src="' + esc(o.img) + '" alt="' + esc(o.alt || "") + '" loading="lazy">';
    }
    return fmt(o);
  }

  /* ---------- Leiste unten ---------- */
  var bar = el("div", { class: "bar" });
  bar.innerHTML =
    '<div class="wrap"><div class="progress"><span class="count" id="count" aria-live="polite"></span>' +
    '<div class="track" aria-hidden="true"><div class="fill" id="fill"></div></div></div>' +
    '<button type="button" class="btn" id="btn-eval">Auswerten</button>' +
    '<div class="confirm" id="confirm" hidden></div></div>';
  document.querySelector("main").appendChild(bar);
  var btnEval = document.getElementById("btn-eval");
  var confirmBox = document.getElementById("confirm");

  function answeredCount() {
    return answers.filter(function (a) { return a !== null; }).length;
  }

  function progress() {
    var n = answeredCount();
    document.getElementById("count").textContent = n + " von " + items.length + " Aufgaben beantwortet";
    document.getElementById("fill").style.width = (items.length ? (100 * n / items.length) : 0) + "%";
    if (n === items.length) confirmBox.hidden = true;
  }
  progress();

  btnEval.addEventListener("click", function () {
    if (evaluated) return;
    var open = items.length - answeredCount();
    if (open > 0 && confirmBox.hidden) {
      confirmBox.innerHTML = "<span>" + open + (open === 1 ? " Aufgabe ist" : " Aufgaben sind") +
        " noch offen. Offene Aufgaben zählen 0 Punkte.</span>" +
        '<button type="button" class="btn ghost" id="btn-go">Trotzdem auswerten</button>' +
        '<button type="button" class="btn ghost" id="btn-first">Zur ersten offenen Aufgabe</button>';
      confirmBox.hidden = false;
      document.getElementById("btn-go").addEventListener("click", evaluate);
      document.getElementById("btn-first").addEventListener("click", function () {
        var i = answers.indexOf(null);
        var t = document.getElementById("q-" + items[i].nr);
        t.scrollIntoView({ behavior: "smooth", block: "start" });
        var inp = t.querySelector("input"); if (inp) inp.focus({ preventScroll: true });
      });
      return;
    }
    evaluate();
  });

  /* ---------- Auswertung ---------- */
  function explain(q) {
    var parts = [["So kommt man drauf", q.weg], ["Warum?", q.warum], ["Erklärung", q.erkl],
                 ["Die anderen Antworten", q.falsch], ["Merke", q.merke]];
    var dl = parts.filter(function (p) { return p[1]; }).map(function (p) {
      return "<dt>" + p[0] + "</dt><dd>" + fmt(p[1]) + "</dd>";
    }).join("");
    return dl ? "<dl>" + dl + "</dl>" : "";
  }

  function reportLink(q, nr) {
    var subj = "Fehler melden: GP 2 EFEG – " + test.title + ", Nr. " + q.id;
    var body = "Aufgabe " + nr + " (Nr. " + q.id + ")\n\n" + q.q + "\n\nWas stimmt nicht?\n";
    return '<a class="report" href="mailto:' + AP2.MAIL + "?subject=" + encodeURIComponent(subj) +
      "&body=" + encodeURIComponent(body) + '">Fehler melden</a>';
  }

  function evaluate() {
    evaluated = true;
    confirmBox.hidden = true;
    var points = 0, chips = [], wrongIds = [];
    items.forEach(function (it, i) {
      var q = it.q, sec = document.getElementById("q-" + it.nr), chosen = answers[i];
      var ok = chosen === q.a;
      if (ok) points++; else wrongIds.push(q.id);
      sec.classList.add("done");
      sec.querySelectorAll("input").forEach(function (inp) { inp.disabled = true; });
      var corrPos = it.perm.indexOf(q.a) + 1;
      sec.querySelectorAll(".opt").forEach(function (lab) {
        var k = Number(lab.getAttribute("data-k")), tag = lab.querySelector(".tag");
        if (k === q.a) { lab.classList.add("is-correct"); tag.textContent = chosen === k ? "✓ Ihre Antwort" : "✓ richtig"; }
        else if (k === chosen) { lab.classList.add("is-wrong"); tag.textContent = "✗ Ihre Antwort"; }
      });
      var verdict = chosen === null ? "Nicht beantwortet." : (ok ? "Richtig!" : "Leider falsch.");
      var ex = explain(q);
      var fb = el("div", { class: "fb " + (ok ? "ok" : "bad") });
      fb.innerHTML =
        '<p class="verdict">' + verdict + "</p>" +
        "<p><strong>Lösung: " + corrPos + "</strong> – " + fmt(q.loes || (typeof q.o[q.a] === "string" ? q.o[q.a] : "")) + "</p>" +
        (ex ? (ok ? "<details><summary>Erklärung anzeigen</summary>" + ex + "</details>" : ex) : "") +
        reportLink(q, it.nr);
      sec.appendChild(fb);
      chips.push('<li><a href="#q-' + it.nr + '" class="' + (chosen === null ? "skip" : ok ? "ok" : "bad") +
        '" aria-label="Aufgabe ' + it.nr + ": " + (chosen === null ? "nicht beantwortet" : ok ? "richtig" : "falsch") + '">' +
        it.nr + "</a></li>");
    });

    var pct = items.length ? Math.round(100 * points / items.length) : 0;
    var g = AP2.grade(pct);
    var again = "test.html?t=" + encodeURIComponent(test.id);
    resultBox.innerHTML =
      "<h2 style=\"margin-top:0\">Ihr Ergebnis</h2>" +
      '<div class="score"><div><div class="big">' + points + " / " + items.length + '</div><div class="sub">Punkte</div></div>' +
      '<div><div class="big">' + pct + ' %</div><div class="sub">der Punkte</div></div>' +
      '<div><div class="grade">Note ' + g[0] + " (" + g[1] + ')</div><div class="sub">nach dem Punkteschlüssel der Gesellenprüfung</div></div></div>' +
      '<ul class="chips" aria-label="Aufgaben im Überblick">' + chips.join("") + "</ul>" +
      '<p class="sub">Grün = richtig, rot = falsch, grau = nicht beantwortet. Unter jeder Aufgabe steht die Erklärung.</p>' +
      '<div class="btn-row">' +
      (wrongIds.length ? '<a class="btn" href="' + again + "&ids=" + encodeURIComponent(wrongIds.join(",")) +
        '">Falsche Aufgaben wiederholen</a>' : "") +
      '<a class="btn ghost" href="' + again + '">' + (test.random ? "Neuen Test ziehen" : "Test neu starten") + "</a>" +
      '<button type="button" class="btn ghost" id="btn-print">Ergebnis drucken</button>' +
      '<a class="btn ghost" href="index.html">Zur Übersicht</a></div>';
    resultBox.hidden = false;
    document.getElementById("btn-print").addEventListener("click", function () { window.print(); });

    btnEval.disabled = true;
    btnEval.textContent = "Ausgewertet";
    document.getElementById("count").textContent = "Ergebnis: " + points + " von " + items.length + " Punkten (" + pct + " %)";
    resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
    resultBox.focus({ preventScroll: true });
  }
})();
