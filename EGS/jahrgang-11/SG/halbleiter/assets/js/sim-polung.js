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
      var s = '<svg viewBox="0 0 440 270" role="img" aria-label="Stromkreis aus Spannungsquelle, Diode und Lampe. ' + (on ? "Die Diode ist in Durchlassrichtung geschaltet, die Lampe leuchtet." : "Die Diode ist in Sperrrichtung geschaltet, die Lampe bleibt aus.") + '">';
      s += '<defs><radialGradient id="pl-glow"><stop offset="0" stop-color="#ffc400" stop-opacity=".9"/><stop offset="1" stop-color="#ffc400" stop-opacity="0"/></radialGradient></defs>';
      // Leitungen
      s += '<path d="M70 110 V50 H190 M250 50 H370 V112 M370 168 V220 H70 V160" fill="none" stroke="#17202b" stroke-width="3"/>';
      if (on) {
        s += '<path class="flow ' + (cw ? "flow--cw" : "flow--ccw") + '" d="M70 110 V50 H370 V220 H70 Z" fill="none" stroke="#e0a100" stroke-width="3.5" stroke-dasharray="2 16" stroke-linecap="round"/>';
      }
      // Quelle (links, senkrecht)
      var longY = st.batUp ? 118 : 152, shortY = st.batUp ? 152 : 118;
      s += '<line x1="70" y1="110" x2="70" y2="' + (Math.min(longY, shortY)) + '" stroke="#17202b" stroke-width="3"/>';
      s += '<line x1="70" y1="160" x2="70" y2="' + (Math.max(longY, shortY)) + '" stroke="#17202b" stroke-width="3"/>';
      s += '<line x1="44" y1="' + longY + '" x2="96" y2="' + longY + '" stroke="#17202b" stroke-width="3"/>';
      s += '<line x1="58" y1="' + shortY + '" x2="82" y2="' + shortY + '" stroke="#17202b" stroke-width="7"/>';
      s += '<text x="108" y="' + (longY + 6) + '" font-size="20" font-weight="800" fill="#d3262b">+</text>';
      s += '<text x="108" y="' + (shortY + 7) + '" font-size="22" font-weight="800" fill="#1f5bd8">–</text>';
      s += '<text x="20" y="140" font-size="13" font-weight="650" fill="#6b7684">G1</text>';
      // Diode (oben)
      if (st.dioRight) {
        s += '<path d="M196 30 v40 l36 -20z" fill="' + (on ? "#ffc400" : "#fff") + '" stroke="#17202b" stroke-width="2.5" stroke-linejoin="round"/><line x1="234" y1="28" x2="234" y2="72" stroke="#17202b" stroke-width="3.5"/>';
        s += '<line x1="190" y1="50" x2="196" y2="50" stroke="#17202b" stroke-width="3"/><line x1="234" y1="50" x2="250" y2="50" stroke="#17202b" stroke-width="3"/>';
        s += '<text x="186" y="92" text-anchor="middle" font-size="14" font-weight="750" fill="#17202b">A</text><text x="240" y="92" text-anchor="middle" font-size="14" font-weight="750" fill="#17202b">K</text>';
      } else {
        s += '<path d="M244 30 v40 l-36 -20z" fill="' + (on ? "#ffc400" : "#fff") + '" stroke="#17202b" stroke-width="2.5" stroke-linejoin="round"/><line x1="206" y1="28" x2="206" y2="72" stroke="#17202b" stroke-width="3.5"/>';
        s += '<line x1="190" y1="50" x2="206" y2="50" stroke="#17202b" stroke-width="3"/><line x1="244" y1="50" x2="250" y2="50" stroke="#17202b" stroke-width="3"/>';
        s += '<text x="200" y="92" text-anchor="middle" font-size="14" font-weight="750" fill="#17202b">K</text><text x="254" y="92" text-anchor="middle" font-size="14" font-weight="750" fill="#17202b">A</text>';
      }
      s += '<text x="220" y="18" text-anchor="middle" font-size="13" font-weight="650" fill="#6b7684">V1</text>';
      // Lampe (rechts)
      if (on) s += '<circle cx="370" cy="140" r="54" fill="url(#pl-glow)"/>';
      s += '<circle cx="370" cy="140" r="28" fill="' + (on ? "#fff6cf" : "#fff") + '" stroke="#17202b" stroke-width="3"/>';
      s += '<path d="M350 120 L390 160 M390 120 L350 160" stroke="#17202b" stroke-width="3"/>';
      s += '<text x="410" y="145" font-size="13" font-weight="650" fill="#6b7684">E1</text>';
      if (on) s += '<text x="220" y="250" text-anchor="middle" font-size="13" font-weight="650" fill="#8a6400">technische Stromrichtung ' + (cw ? "im Uhrzeigersinn" : "gegen den Uhrzeigersinn") + "</text>";
      s += "</svg>";
      box.innerHTML = s;
      if (on) LT.status(status, "ok", "Durchlassrichtung – die Lampe leuchtet", "Plus liegt an der Anode, Minus an der Kathode.");
      else LT.status(status, "info", "Sperrrichtung – die Lampe bleibt aus", "Minus liegt an der Anode, Plus an der Kathode.");
      txt.innerHTML = "<strong>So erkennen Sie die Polung</strong><p>Folgen Sie vom Pluspol aus der Leitung bis zur Diode. Treffen Sie zuerst auf die Anode (Dreieck), ist die Diode in Durchlassrichtung geschaltet. Treffen Sie zuerst auf den Querstrich, also die Kathode, sperrt sie.</p>";
    }
    draw();
  });
})();
