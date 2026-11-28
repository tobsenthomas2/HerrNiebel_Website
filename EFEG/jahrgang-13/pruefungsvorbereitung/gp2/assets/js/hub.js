/* Übersicht: Testkarten aus AP2.TESTS erzeugen. */
(function () {
  "use strict";
  var AP2 = window.AP2, esc = AP2.esc;
  AP2.frame(null);
  document.getElementById("note").innerHTML = AP2.errorNote();

  var box = document.getElementById("tests");
  function card(t) {
    var n = t.random ? Math.min(t.random, AP2.Q.length) : t.ids.length;
    var desc = t.desc || ("Aufgaben " + t.ids[0] + " bis " + t.ids[t.ids.length - 1] + ".");
    return '<article class="card' + (t.random ? " mix" : "") + '">' +
      '<div class="icon" aria-hidden="true">' + esc(t.icon || "📝") + "</div>" +
      "<h3>" + esc(t.random ? t.title : t.short) + "</h3><p>" + esc(desc) + "</p>" +
      '<div class="meta">' + n + " Aufgaben · ca. " + Math.max(5, Math.round(n * 2)) + " Minuten</div>" +
      '<a class="btn" href="test.html?t=' + encodeURIComponent(t.id) + '" aria-label="' + esc(t.title) + ' starten">Test starten</a></article>';
  }
  var ok = AP2.TESTS.filter(function (t) {
    return t.random ? AP2.Q.length > 0 : t.ids.every(function (id) { return AP2.qById(id); });
  });
  var html = "";
  (AP2.TOPIC_ORDER || Object.keys(AP2.TOPICS)).forEach(function (k) {
    var ts = ok.filter(function (t) { return t.topic === k; });
    if (!ts.length) return;
    var nq = ts.reduce(function (s, t) { return s + t.ids.length; }, 0);
    html += '<section class="topic"><h3 class="topic-h"><span aria-hidden="true">' + esc(AP2.TOPICS[k].icon) + "</span> " +
      esc(AP2.TOPICS[k].title) + ' <span class="sub">· ' + nq + " Aufgaben</span></h3>" +
      '<div class="cards">' + ts.map(card).join("") + "</div></section>";
  });
  var mix = ok.filter(function (t) { return t.random; });
  if (mix.length) {
    html += '<section class="topic"><h3 class="topic-h"><span aria-hidden="true">🎲</span> Alle Themen</h3>' +
      '<div class="cards">' + mix.map(card).join("") + "</div></section>";
  }
  box.innerHTML = html || '<p class="empty">Noch keine Tests vorhanden.</p>';
  document.getElementById("pool").textContent = AP2.Q.length;
})();
