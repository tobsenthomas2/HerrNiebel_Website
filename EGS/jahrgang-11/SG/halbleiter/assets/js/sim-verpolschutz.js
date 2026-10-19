/* =========================================================================
   LUMIATECH – Verpolschutz für einen Gleichstrommotor (Förderband)
   Platzhalter: <div data-sim="verpolschutz" data-title="…" data-hint="…"></div>
   Varianten: keine Diode, Diode in Reihe, Diode parallel zum Motor (mit Sicherung).
   ========================================================================= */
(function () {
  "use strict";
  var LT = window.LT;
  var UB = 12, RM = 60, UD = 0.7; // Netzteil 12 V, Motor als Widerstand 60 Ω, Si-Diode 0,7 V

  LT.$$('[data-sim="verpolschutz"]').forEach(function (host) {
    var ui = LT.lab(host, { icon: "circuit" });
    var st = { pol: 1, pos: "none", flip: false };

    LT.segmented(ui.controls, "Anschluss am Netzteil", [
      { value: "1", label: "Richtig" }, { value: "-1", label: "Verpolt" }
    ], "1", function (v) { st.pol = +v; draw(); });
    LT.segmented(ui.controls, "Schutzdiode", [
      { value: "none", label: "Keine" }, { value: "series", label: "In Reihe" }, { value: "parallel", label: "Parallel" }
    ], "none", function (v) { st.pos = v; flipBtn.disabled = v === "none"; draw(); });
    var flipBtn = document.createElement("button");
    flipBtn.type = "button"; flipBtn.className = "btn btn--ghost btn--small"; flipBtn.textContent = "Diode umdrehen"; flipBtn.disabled = true;
    flipBtn.addEventListener("click", function () { st.flip = !st.flip; draw(); });
    ui.controls.appendChild(flipBtn);
    var status = document.createElement("div");
    ui.controls.appendChild(status);
    var values = document.createElement("dl");
    values.className = "readout";
    if (LT.config.messwerteAnzeigen) ui.controls.appendChild(values);

    var stage = document.createElement("div");
    stage.className = "verpol-stage";
    ui.stage.appendChild(stage);
    var legend = document.createElement("p");
    legend.className = "table-note";
    legend.innerHTML = "Netzteil 12 V DC, Sicherung F1, Gleichstrommotor M1 am Förderband. Gelbe Punkte: technische Stromrichtung. Auf schmalen Bildschirmen lässt sich der Schaltplan seitlich verschieben.";
    ui.stage.appendChild(legend);

    /** Schaltungszustand berechnen */
    function solve() {
      var s = st.pol, r = { dir: 0, I: 0, short: false, dState: null, UM: 0 };
      if (st.pos === "none") { r.dir = s; r.I = UB / RM; r.UM = UB; return r; }
      if (st.pos === "series") {
        var conducts = st.flip ? s < 0 : s > 0; // Anode zur Quelle = leitet bei richtiger Polung
        r.dState = conducts ? "leitet" : "sperrt";
        if (conducts) { r.dir = s; r.I = (UB - UD) / RM; r.UM = UB - UD; }
        return r;
      }
      // parallel: normal = Kathode an der Plus-Leitung (sperrt im Normalbetrieb)
      var fwd = st.flip ? s > 0 : s < 0;
      r.dState = fwd ? "leitet" : "sperrt";
      if (fwd) { r.short = true; r.dir = 0; r.I = 0; return r; }
      r.dir = s; r.I = UB / RM; r.UM = UB;
      return r;
    }

    var res = solve(), phase = 0, belt = 0;

    function diodeSym(x, y, dir, active) {
      // dir: "right" | "left" | "up" | "down" (Spitze des Dreiecks)
      var f = active ? "#ffc400" : "#fff", d = "";
      if (dir === "right") d = '<path d="M' + (x - 16) + " " + (y - 15) + " v30 l30 -15z" + '" fill="' + f + '" stroke="#17202b" stroke-width="2.5" stroke-linejoin="round"/><line x1="' + (x + 15) + '" y1="' + (y - 16) + '" x2="' + (x + 15) + '" y2="' + (y + 16) + '" stroke="#17202b" stroke-width="3.5"/>';
      if (dir === "left") d = '<path d="M' + (x + 16) + " " + (y - 15) + " v30 l-30 -15z" + '" fill="' + f + '" stroke="#17202b" stroke-width="2.5" stroke-linejoin="round"/><line x1="' + (x - 15) + '" y1="' + (y - 16) + '" x2="' + (x - 15) + '" y2="' + (y + 16) + '" stroke="#17202b" stroke-width="3.5"/>';
      if (dir === "up") d = '<path d="M' + (x - 15) + " " + (y + 16) + " h30 l-15 -30z" + '" fill="' + f + '" stroke="#17202b" stroke-width="2.5" stroke-linejoin="round"/><line x1="' + (x - 16) + '" y1="' + (y - 15) + '" x2="' + (x + 16) + '" y2="' + (y - 15) + '" stroke="#17202b" stroke-width="3.5"/>';
      if (dir === "down") d = '<path d="M' + (x - 15) + " " + (y - 16) + " h30 l-15 30z" + '" fill="' + f + '" stroke="#17202b" stroke-width="2.5" stroke-linejoin="round"/><line x1="' + (x - 16) + '" y1="' + (y + 15) + '" x2="' + (x + 16) + '" y2="' + (y + 15) + '" stroke="#17202b" stroke-width="3.5"/>';
      return d;
    }

    function draw() {
      res = solve();
      var s = st.pol, top = s > 0 ? "+" : "–", bot = s > 0 ? "–" : "+";
      var h = '<svg viewBox="0 0 700 300" role="img" aria-label="Verpolschutz-Schaltung">';
      h += '<defs><clipPath id="vp-belt"><rect x="540" y="96" width="140" height="40"/></clipPath></defs>';
      // Netzteil
      h += '<rect x="24" y="84" width="104" height="132" rx="8" fill="#eef1f4" stroke="#17202b" stroke-width="2"/>';
      h += '<text x="76" y="140" text-anchor="middle" font-size="14" font-weight="750" fill="#17202b">Netzteil</text><text x="76" y="160" text-anchor="middle" font-size="13" fill="#4a5563">12 V DC</text>';
      h += '<circle cx="128" cy="110" r="6" fill="' + (s > 0 ? "#d3262b" : "#1f5bd8") + '"/><circle cx="128" cy="190" r="6" fill="' + (s > 0 ? "#1f5bd8" : "#d3262b") + '"/>';
      h += '<text x="108" y="114" text-anchor="middle" font-size="18" font-weight="800" fill="' + (s > 0 ? "#d3262b" : "#1f5bd8") + '">' + top + '</text>';
      h += '<text x="108" y="196" text-anchor="middle" font-size="18" font-weight="800" fill="' + (s > 0 ? "#1f5bd8" : "#d3262b") + '">' + bot + "</text>";
      if (s < 0) h += '<path d="M142 120 q16 30 0 60" fill="none" stroke="#c42b2b" stroke-width="2" stroke-dasharray="4 3"/><text x="150" y="154" font-size="12" font-weight="700" fill="#c42b2b">vertauscht</text>';
      // Leitungen
      var wire = 'stroke="#17202b" stroke-width="3" fill="none"';
      h += '<path d="M134 110 H170 M214 110 H' + (st.pos === "series" ? "268" : "470") + '" ' + wire + "/>";
      if (st.pos === "series") h += '<path d="M318 110 H470" ' + wire + "/>";
      h += '<path d="M470 110 V118 M470 182 V190 H134" ' + wire + "/>";
      // Sicherung
      h += '<rect x="170" y="100" width="44" height="20" rx="3" fill="#fff" stroke="#17202b" stroke-width="2"/>';
      if (res.short) h += '<path d="M176 104 l10 12 l8 -12 l8 12 l8 -12" fill="none" stroke="#c42b2b" stroke-width="2.4"/><text x="192" y="92" text-anchor="middle" font-size="12" font-weight="700" fill="#c42b2b">ausgelöst</text>';
      else h += '<line x1="170" y1="110" x2="214" y2="110" stroke="#17202b" stroke-width="1.5"/>';
      h += '<text x="192" y="140" text-anchor="middle" font-size="12" font-weight="650" fill="#6b7684">F1</text>';
      // Diode in Reihe
      if (st.pos === "series") {
        h += '<line x1="268" y1="110" x2="277" y2="110" stroke="#17202b" stroke-width="3"/><line x1="309" y1="110" x2="318" y2="110" stroke="#17202b" stroke-width="3"/>';
        h += diodeSym(293, 110, st.flip ? "left" : "right", res.dState === "leitet");
        h += '<text x="293" y="82" text-anchor="middle" font-size="12" font-weight="650" fill="#6b7684">V1 ' + (res.dState) + "</text>";
      }
      // Diode parallel
      if (st.pos === "parallel") {
        h += '<path d="M390 110 V130 M390 170 V190" ' + wire + '/><circle cx="390" cy="110" r="4" fill="#17202b"/><circle cx="390" cy="190" r="4" fill="#17202b"/>';
        h += diodeSym(390, 150, st.flip ? "down" : "up", res.dState === "leitet");
        h += '<text x="412" y="154" font-size="12" font-weight="650" fill="#6b7684">V1 ' + res.dState + "</text>";
      }
      // Strompfad
      if (res.short) {
        h += '<path class="flow ' + (s > 0 ? "flow--cw" : "flow--ccw") + '" d="M134 110 H390 V190 H134" fill="none" stroke="#c42b2b" stroke-width="4" stroke-dasharray="2 16" stroke-linecap="round"/>';
      } else if (res.dir !== 0) {
        h += '<path class="flow ' + (s > 0 ? "flow--cw" : "flow--ccw") + '" d="M134 110 H470 V190 H134" fill="none" stroke="#e0a100" stroke-width="3.5" stroke-dasharray="2 16" stroke-linecap="round"/>';
      }
      // Motor
      h += '<circle cx="470" cy="150" r="32" fill="#fff" stroke="#17202b" stroke-width="3"/><text x="470" y="160" text-anchor="middle" font-size="26" font-weight="800" fill="#17202b">M</text>';
      h += '<text x="470" y="210" text-anchor="middle" font-size="12" font-weight="650" fill="#6b7684">M1</text>';
      h += '<line x1="502" y1="150" x2="560" y2="150" stroke="#6b7684" stroke-width="4"/>';
      // Förderband
      h += '<g id="vp-rotor"></g>';
      h += '<rect x="540" y="136" width="140" height="28" rx="14" fill="#2b3440"/><circle cx="554" cy="150" r="10" fill="#6b7684"/><circle cx="666" cy="150" r="10" fill="#6b7684"/>';
      h += '<g clip-path="url(#vp-belt)"><g id="vp-boxes"></g></g>';
      h += '<g id="vp-arrow"></g>';
      h += "</svg>";
      stage.innerHTML = h;
      boxesEl = LT.$("#vp-boxes", stage); arrowEl = LT.$("#vp-arrow", stage);
      renderBelt();
      text();
    }
    var boxesEl, arrowEl;
    function renderBelt() {
      if (!boxesEl) return;
      var html = "";
      for (var i = 0; i < 4; i++) {
        var x = 540 + ((i * 46 + belt) % 184 + 184) % 184 - 22;
        html += '<rect x="' + x.toFixed(1) + '" y="104" width="30" height="30" rx="3" fill="#c8a165" stroke="#8a6a3a" stroke-width="1.5"/>';
      }
      boxesEl.innerHTML = html;
      var a = "";
      if (res.dir > 0) a = '<path d="M580 186 h60" stroke="#14873d" stroke-width="3"/><path d="M648 186 l-10 -6 v12z" fill="#14873d"/><text x="610" y="210" text-anchor="middle" font-size="12" font-weight="700" fill="#14873d">vorwärts</text>';
      else if (res.dir < 0) a = '<path d="M590 186 h60" stroke="#c42b2b" stroke-width="3"/><path d="M582 186 l10 -6 v12z" fill="#c42b2b"/><text x="618" y="210" text-anchor="middle" font-size="12" font-weight="700" fill="#c42b2b">rückwärts!</text>';
      else a = '<text x="610" y="196" text-anchor="middle" font-size="12" font-weight="700" fill="#6b7684">steht</text>';
      arrowEl.innerHTML = a;
    }

    function text() {
      var s = st.pol, d = res.dState;
      if (st.pos === "none") {
        if (s > 0) LT.status(status, "ok", "Motor läuft vorwärts", "Ohne Schutzdiode – solange niemand die Anschlüsse vertauscht.");
        else LT.status(status, "bad", "Motor dreht falsch herum", "Das Förderband läuft rückwärts. Ohne Schutz kann die Anlage beschädigt werden.");
      } else if (st.pos === "series") {
        if (s > 0 && d === "leitet") LT.status(status, "ok", "Motor läuft vorwärts", "Die Diode leitet. An ihr fallen etwa 0,7 V ab.");
        else if (s < 0 && d === "sperrt") LT.status(status, "ok", "Geschützt: Motor steht", "Die Diode sperrt und nimmt die Spannung auf. Nichts wird beschädigt.");
        else if (s > 0) LT.status(status, "warn", "Diode falsch herum eingebaut", "Sie sperrt schon im Normalbetrieb – der Motor läuft nie.");
        else LT.status(status, "bad", "Motor dreht falsch herum", "Die falsch eingebaute Diode leitet gerade bei Verpolung.");
      } else {
        if (res.short && s < 0) LT.status(status, "warn", "Geschützt, aber Sicherung ausgelöst", "Die Diode leitet und schließt die Quelle kurz. Der Motor bleibt stehen, die Sicherung muss ersetzt werden.");
        else if (res.short) LT.status(status, "bad", "Kurzschluss im Normalbetrieb", "Die Diode ist falsch herum eingebaut – die Sicherung löst sofort aus.");
        else if (s > 0) LT.status(status, "ok", "Motor läuft vorwärts", "Die Diode sperrt im Normalbetrieb und verursacht keinen Spannungsverlust.");
        else LT.status(status, "bad", "Motor dreht falsch herum", "Die Diode sperrt auch bei Verpolung – sie ist falsch herum eingebaut.");
      }
      if (LT.config.messwerteAnzeigen) {
        values.innerHTML = "<div><dt>Motorstrom</dt><dd>" + LT.fmtI(res.I) + "</dd></div><div><dt>Motorspannung</dt><dd>" + LT.num(res.UM * (res.dir < 0 ? -1 : 1), 1) + " V</dd></div>";
      }
    }

    var running = false, last = 0;
    function loop(ts) {
      if (!running) return;
      var dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
      if (res.dir !== 0 && !LT.reducedMotion) { belt += res.dir * dt * 40 * (res.UM / UB); renderBelt(); }
      requestAnimationFrame(loop);
    }
    LT.whenVisible(host, function (v) { if (v && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); } else if (!v) running = false; });
    draw();
  });
})();
