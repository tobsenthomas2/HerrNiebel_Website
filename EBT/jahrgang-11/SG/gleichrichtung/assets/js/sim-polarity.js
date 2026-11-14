/* =========================================================================
   Mini-Simulation „Welche Richtung?“  ·  <div data-sim="polarity">
   Batterie + passender Vorwiderstand + weiße LED. Batterie umdrehen →
   LED sperrt; über 5 V Sperrspannung wird es für die LED gefährlich.
   ========================================================================= */
(function () {
  "use strict";
  function init(host) {
    var S = SIM.shell(host, "led");
    var st = { u: 4.5, flipped: false };
    var controls = document.createElement("div");
    controls.className = "controls";
    S.body.appendChild(controls);
    controls.appendChild(SIM.seg({ en: "Battery", de: "Batterie" }, [
      { id: "1.5", en: "1.5 V", de: "1,5 V" }, { id: "3", en: "3 V", de: "3 V" },
      { id: "4.5", en: "4.5 V", de: "4,5 V" }, { id: "9", en: "9 V", de: "9 V" }
    ], "4.5", function (id) { st.u = +id; update(); }).el);
    var flip = document.createElement("button");
    flip.type = "button"; flip.className = "btn btn--ghost btn--small";
    flip.addEventListener("click", function () { st.flipped = !st.flipped; flip.setAttribute("aria-pressed", String(st.flipped)); update(); });
    controls.appendChild(flip);

    var row = document.createElement("div");
    row.style.cssText = "display:grid;gap:14px";
    S.body.appendChild(row);
    var left = document.createElement("div"), right = document.createElement("div");
    row.appendChild(left); row.appendChild(right);
    var C = SIM.circuit(left, 300, 170, { en: "Circuit: battery, resistor, LED", de: "Schaltplan: Batterie, Widerstand, LED" });
    C.source(50, 85, 22, "battery", "src");
    C.wire([[50, 63], [50, 30], [95, 30]], "w1");
    C.resistor(95, 30, 155, 30, "w1");
    C.wire([[155, 30], [240, 30], [240, 60]], "w1");
    C.diode(240, 60, 240, 112, "led", true);
    C.wire([[240, 112], [240, 142], [50, 142], [50, 107]], "w2");
    C.text(125, 17, "-R1", { anchor: "middle" });
    C.text(20, 89, "-G1", { anchor: "end" });
    C.text(222, 90, "-P1", { anchor: "end" });
    var pTop = C.text(64, 60, "+", { size: 16, bold: true }), pBot = C.text(64, 122, "−", { size: 16, bold: true });

    var gauge = document.createElement("div");
    right.appendChild(gauge);
    gauge.innerHTML = '<div class="control__label gl" style="font:600 .8rem/1.3 var(--f-mono);color:var(--ink-2);margin-bottom:8px"></div>' +
      '<svg viewBox="0 0 300 70" role="img"><rect x="10" y="20" width="280" height="22" rx="6" fill="#ebe3d4" stroke="#1d2520" stroke-width="2"/>' +
      '<rect class="gfill" x="12" y="22" width="0" height="18" rx="4" fill="#2b7a4b"/>' +
      '<line x1="150" y1="12" x2="150" y2="50" stroke="#c0362c" stroke-width="3" stroke-dasharray="4 3"/>' +
      '<text x="150" y="64" text-anchor="middle" font-family="Fira Code, monospace" font-size="12" fill="#c0362c">max. 5 V</text>' +
      '<text x="10" y="64" font-family="Fira Code, monospace" font-size="12" fill="#47524c">0 V</text>' +
      '<text x="290" y="64" text-anchor="end" font-family="Fira Code, monospace" font-size="12" fill="#47524c">10 V</text></svg>';
    var status = SIM.status();
    S.body.appendChild(status.el);

    function update() {
      flip.textContent = SITE.t({ en: "⇅ Flip the battery", de: "⇅ Batterie umdrehen" });
      gauge.querySelector(".gl").textContent = SITE.t({ en: "Reverse voltage at the LED", de: "Sperrspannung an der LED" });
      pTop.textContent = st.flipped ? "−" : "+"; pBot.textContent = st.flipped ? "+" : "−";
      var forward = !st.flipped, on = forward && st.u > 2.7;
      C.highlight(on ? ["src", "w1", "led", "w2"] : []);
      var led = C.svg.querySelector('[data-seg="led"]');
      led.classList.toggle("lit", on);
      led.classList.toggle("blocked", !forward);
      var rev = forward ? 0 : st.u;
      var fill = gauge.querySelector(".gfill");
      fill.setAttribute("width", (276 * Math.min(1, rev / 10)).toFixed(1));
      fill.setAttribute("fill", rev > 5 ? "#c0362c" : "#2b7a4b");
      if (on) status.set("ok", SITE.t({ en: "Forward direction: the LED lights (the resistor limits the current).", de: "Durchlassrichtung: Die LED leuchtet (der Widerstand begrenzt den Strom)." }));
      else if (forward) status.set("warn", SITE.t({ en: "Forward direction – but too little voltage. A white LED needs about 2.7–3 V before any current flows.", de: "Durchlassrichtung – aber zu wenig Spannung. Eine weiße LED braucht etwa 2,7–3 V, bevor überhaupt Strom fließt." }));
      else if (rev > 5) status.set("bad", SITE.t({ en: "Reverse direction: the LED blocks – and gets the full battery voltage in reverse. That’s more than the 5 V the datasheet allows!", de: "Sperrrichtung: Die LED sperrt – und bekommt die volle Batteriespannung in Sperrrichtung ab. Das ist mehr als die 5 V, die das Datenblatt erlaubt!" }));
      else status.set("", SITE.t({ en: "Reverse direction: the LED blocks – no current, no light. The whole battery voltage is across the LED.", de: "Sperrrichtung: Die LED sperrt – kein Strom, kein Licht. Die ganze Batteriespannung liegt an der LED." }));
    }
    update(); SIM.onLang(update);
  }
  function boot() { document.querySelectorAll('[data-sim="polarity"]').forEach(init); }
  if (document.readyState === "loading") document.addEventListener("siteready", boot); else boot();
})();
