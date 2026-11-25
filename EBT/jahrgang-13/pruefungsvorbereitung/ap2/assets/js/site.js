/* Prüfungsvorbereitung AP Teil 2 – gemeinsame Bausteine: Kopf, Fuß, Textauszeichnung, Helfer.
   Ohne Cookies, ohne Speicher im Browser, ohne Fremdserver. */
(function () {
  "use strict";
  var AP2 = (window.AP2 = window.AP2 || {});

  AP2.ROOT = "../../../../";                       // vom Themenordner zur Startseite herrniebel.de
  AP2.DASH = AP2.ROOT + "index.html#/ebt/jg13/pruefungsvorbereitung";
  AP2.MAIL = "kontakt@herrniebel.de";

  /* HTML maskieren */
  AP2.esc = function (s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };

  /* Einfache Auszeichnung wie in den Arbeitsblättern:
     **fett**, X_{C} tiefgestellt, 10^{-6} hochgestellt, Zeilenumbruch mit \n */
  AP2.fmt = function (s) {
    var h = AP2.esc(s == null ? "" : s);
    h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    h = h.replace(/_\{([^}]*)\}/g, "<sub>$1</sub>");
    h = h.replace(/\^\{([^}]*)\}/g, "<sup>$1</sup>");
    h = h.replace(/\n/g, "<br>");
    return h;
  };

  AP2.el = function (tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k]; else e.setAttribute(k, attrs[k]);
    });
    if (html != null) e.innerHTML = html;
    return e;
  };

  /* Fisher-Yates */
  AP2.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  AP2.qById = function (id) {
    for (var i = 0; i < AP2.Q.length; i++) if (AP2.Q[i].id === id) return AP2.Q[i];
    return null;
  };

  AP2.testById = function (id) {
    for (var i = 0; i < AP2.TESTS.length; i++) if (AP2.TESTS[i].id === id) return AP2.TESTS[i];
    return null;
  };

  /* Notenschlüssel der IHK (Prozent der Punkte) */
  AP2.grade = function (pct) {
    if (pct >= 92) return [1, "sehr gut"];
    if (pct >= 81) return [2, "gut"];
    if (pct >= 67) return [3, "befriedigend"];
    if (pct >= 50) return [4, "ausreichend"];
    if (pct >= 30) return [5, "mangelhaft"];
    return [6, "ungenügend"];
  };

  function header(crumbHtml) {
    var h = AP2.el("header", { class: "site-header" });
    h.innerHTML =
      '<div class="wrap">' +
      '<a class="brand" href="index.html"><span class="dot" aria-hidden="true"></span>Prüfungsvorbereitung AP 2</a>' +
      '<nav class="crumbs" aria-label="Brotkrumen">' + crumbHtml + "</nav></div>";
    return h;
  }

  function footer() {
    var f = AP2.el("footer", { class: "site-footer" });
    f.innerHTML =
      '<div class="wrap"><span>KI-unterstützt erstellt · nur für Unterrichtszwecke · ' +
      '<a href="mailto:' + AP2.MAIL + '">' + AP2.MAIL + "</a></span>" +
      '<span><a href="' + AP2.ROOT + 'impressum.html">Impressum</a> · <a href="' + AP2.ROOT +
      'datenschutz.html">Datenschutz</a></span></div>';
    return f;
  }

  /* Kopf und Fuß einsetzen; extraCrumb = letzte Brotkrume (optional) */
  AP2.frame = function (extraCrumb) {
    var crumbs =
      '<a href="' + AP2.ROOT + 'index.html">herrniebel.de</a> › <a href="' + AP2.DASH + '">EBT 13 · Prüfungsvorbereitung</a>' +
      (extraCrumb ? ' › <a href="index.html">AP Teil 2</a> › ' + AP2.esc(extraCrumb) : " › AP Teil 2");
    document.body.insertBefore(header(crumbs), document.body.firstChild);
    document.body.appendChild(footer());
  };

  /* Hinweis „Fehler möglich“ – auf Übersicht und Testseite gleich */
  AP2.errorNote = function () {
    return (
      '<div class="note warn" role="note"><span class="ico" aria-hidden="true">⚠️</span><div>' +
      "<p><strong>Hinweis:</strong> Die Aufgaben wurden mit Unterstützung von KI erstellt und geprüft. " +
      "Trotzdem können Fehler passieren.</p>" +
      "<p>Ist eine Frage nicht lösbar oder erscheint eine Lösung falsch, melden Sie das bitte Ihrer Lehrkraft " +
      'oder per E-Mail an <a href="mailto:' + AP2.MAIL + '">' + AP2.MAIL + "</a> – am besten mit der " +
      "<strong>Aufgaben-Nr.</strong> (z. B. „Nr. B-03“). Unter jeder ausgewerteten Aufgabe gibt es dafür den Link " +
      "„Fehler melden“.</p></div></div>"
    );
  };
})();
