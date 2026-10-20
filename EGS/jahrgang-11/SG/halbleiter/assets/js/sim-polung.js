/* =========================================================================
   LUMIATECH – Polung einer Diode im Stromkreis (Quelle, Diode, Lampe)
   Platzhalter: <div data-sim="polung" data-title="…" data-hint="…"></div>
   ========================================================================= */
(function () {
  "use strict";
  var LT = window.LT;

  LT.$$('[data-sim="polung"]').forEach(function (host) {
    var ui = LT.lab(host, { icon: "circuit" });
    var st = { batUp: true, dioRight: true };

    var b1 = document.createElement("button");
    b1.className = "btn btn--ghost btn--small"; b1.type = "button"; b1.textContent = "Quelle umpolen";
    var b2 = document.createElement("button");
    b2.className = "btn btn--ghost btn--small"; b2.type = "button"; b2.textContent = "Diode umdrehen";
    var row = document.createElement("div"); row.className = "btn-row"; row.appendChild(b1); row.appendChild(b2);
    ui.controls.appendChild(row);
    var status = document.createElement("div");
    ui.controls.appendChild(status);
    var txt = document.createElement("div");
    txt.className = "pn-explain";
    ui.controls.appendChild(txt);
    b1.addEventListener("click", function () { st.batUp = !st.batUp; draw(); });
    b2.addEventListener("click", function () { st.dioRight = !st.dioRight; draw(); });

    var box = document.createElement("div");
    box.className = "polung-stage";
    ui.stage.appendChild(box);

    function draw() {
      var on = st.batUp === st.dioRight;
      var cw = st.batUp; // technische Stromrichtung im Uhrzeigersinn, wenn Plus oben
      var S = LT.sym;
      var s = '<svg viewBox="0 0 460 280" role="img" aria-label="Stromkreis aus Spannungsquelle -G1, Diode -R1 und Meldeleuchte -P1. ' + (on ? "Die Diode ist in Durchlassrichtung geschaltet, die Leuchte leuchtet." : "Die Diode ist in Sperrrichtung geschaltet, die Leuchte bleibt aus.") + '">' + S.defs;
      s += S.wire("M100 121 V50 H380 V122 M380 158 V240 H100 V169");
      if (on) s += '<path class="flow ' + (cw ? "flow--cw" : "flow--ccw") + '" d="M100 145 V50 H380 V240 H100 Z" fill="none" stroke="#e0a100" stroke-width="3.5" stroke-dasharray="2 16" stroke-linecap="round"/>';
      s += S.source({ cx: 100, cy: 145, r: 24, plusFirst: st.batUp });
      s += S.bmk({ x: 100, y: 145, gap: 36, name: "-G1" });
      s += S.diode({ cx: 240, cy: 50, s: 36, dir: st.dioRight ? "right" : "left", lead: 0, hl: on ? "#fff3c4" : null });
      s += S.bmk({ x: 240, y: 50, side: "top", gap: 30, name: "-R1" });
      s += '<text x="' + (st.dioRight ? 212 : 268) + '" y="88" text-anchor="middle" font-size="13" font-weight="750" fill="#17202b">A</text>';
      s += '<text x="' + (st.dioRight ? 268 : 212) + '" y="88" text-anchor="middle" font-size="13" font-weight="750" fill="#17202b">K</text>';
      s += S.lamp({ cx: 380, cy: 140, r: 18, lit: on });
      s += S.bmk({ x: 380, y: 140, gap: 30, name: "-P1" });
      if (on) s += '<text x="240" y="268" text-anchor="middle" font-size="13" font-weight="650" fill="#8a6400">technische Stromrichtung ' + (cw ? "im Uhrzeigersinn" : "gegen den Uhrzeigersinn") + "</text>";
      s += "</svg>";
      box.innerHTML = s;
      if (on) LT.status(status, "ok", "Durchlassrichtung – die Leuchte -P1 leuchtet", "Plus liegt an der Anode, Minus an der Kathode.");
      else LT.status(status, "info", "Sperrrichtung – die Leuchte -P1 bleibt aus", "Minus liegt an der Anode, Plus an der Kathode.");
      txt.innerHTML = "<strong>So erkennen Sie die Polung</strong><p>Folgen Sie vom Pluspol aus der Leitung bis zur Diode. Treffen Sie zuerst auf die Anode (Dreieck), ist die Diode in Durchlassrichtung geschaltet. Treffen Sie zuerst auf den Querstrich, also die Kathode, sperrt sie.</p>";
    }
    draw();
  });
})();
