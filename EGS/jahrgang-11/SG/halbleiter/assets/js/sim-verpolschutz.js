/* =========================================================================
   LUMIATECH – Verpolschutz für einen Gleichstrommotor (Förderband)
   Platzhalter: <div data-sim="verpolschutz" data-title="…" data-hint="…"></div>
   Varianten: keine Diode, Diode in Reihe, Diode parallel zum Motor (mit Sicherung).
   ========================================================================= */
(function () {
  "use strict";
  var LT = window.LT;
  var T = LT.t;
  var UB = 12, RM = 60, UD = 0.7; // Netzteil 12 V, Motor als Widerstand 60 Ω, Si-Diode 0,7 V

  LT.$$('[data-sim="verpolschutz"]').forEach(function (host) {
    var ui = LT.lab(host, { icon: "circuit" });
    var st = { pol: 1, pos: "none", flip: false };

    LT.segmented(ui.controls, T("Connection to the power supply", "Anschluss am Netzteil"), [
      { value: "1", label: T("Correct", "Richtig") }, { value: "-1", label: T("Reversed", "Verpolt") }
    ], "1", function (v) { st.pol = +v; draw(); });
    LT.segmented(ui.controls, T("Protection diode", "Schutzdiode"), [
      { value: "none", label: T("None", "Keine") }, { value: "series", label: T("In series", "In Reihe") }, { value: "parallel", label: "Parallel" }
    ], "none", function (v) { st.pos = v; flipBtn.disabled = v === "none"; draw(); });
    var flipBtn = document.createElement("button");
    flipBtn.type = "button"; flipBtn.className = "btn btn--ghost btn--small"; flipBtn.textContent = T("Turn diode around", "Diode umdrehen"); flipBtn.disabled = true;
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
    legend.innerHTML = T("-G1 power supply 12 V DC, -F1 fuse, -R1 protection diode, -M1 DC motor on the conveyor belt. Yellow dots: conventional current direction. On narrow screens the circuit diagram can be scrolled sideways.", "-G1 Netzteil 12 V DC, -F1 Sicherung, -R1 Schutzdiode, -M1 Gleichstrommotor am Förderband. Gelbe Punkte: technische Stromrichtung. Auf schmalen Bildschirmen lässt sich der Schaltplan seitlich verschieben.");
    ui.stage.appendChild(legend);

    /** Schaltungszustand berechnen */
    function solve() {
      var s = st.pol, r = { dir: 0, I: 0, short: false, dState: null, UM: 0 };
      if (st.pos === "none") { r.dir = s; r.I = UB / RM; r.UM = UB; return r; }
      if (st.pos === "series") {
        var conducts = st.flip ? s < 0 : s > 0; // Anode zur Quelle = leitet bei richtiger Polung
        r.dState = conducts ? T("conducts", "leitet") : T("blocks", "sperrt");
        if (conducts) { r.dir = s; r.I = (UB - UD) / RM; r.UM = UB - UD; }
        return r;
      }
      // parallel: normal = Kathode an der Plus-Leitung (sperrt im Normalbetrieb)
      var fwd = st.flip ? s > 0 : s < 0;
      r.dState = fwd ? T("conducts", "leitet") : T("blocks", "sperrt");
      if (fwd) { r.short = true; r.dir = 0; r.I = 0; return r; }
      r.dir = s; r.I = UB / RM; r.UM = UB;
      return r;
    }

    var res = solve(), phase = 0, belt = 0;

    function draw() {
      res = solve();
      var S = LT.sym, s = st.pol, HL = "#fff3c4";
      var h = '<svg viewBox="0 0 750 300" role="img" aria-label="' + T('Reverse polarity protection circuit with voltage source -G1, fuse -F1, protection diode -R1 and DC motor -M1', 'Verpolschutz-Schaltung mit Spannungsquelle -G1, Sicherung -F1, Schutzdiode -R1 und Gleichstrommotor -M1') + '">' + S.defs;
      h += '<defs><clipPath id="vp-belt"><rect x="610" y="96" width="140" height="40"/></clipPath></defs>';
      // Leitungen
      h += S.wire("M110 124 V60 H530 V120 M530 180 V240 H110 V176");
      if (st.pos === "parallel") h += S.wire("M390 60 V240") + S.dot(390, 60) + S.dot(390, 240);
      // Strompfad (technische Stromrichtung)
      if (res.short) h += '<path class="flow ' + (s > 0 ? "flow--cw" : "flow--ccw") + '" d="M110 150 V60 H390 V240 H110 Z" fill="none" stroke="#c42b2b" stroke-width="4" stroke-dasharray="2 16" stroke-linecap="round"/>';
      else if (res.dir !== 0) h += '<path class="flow ' + (s > 0 ? "flow--cw" : "flow--ccw") + '" d="M110 150 V60 H530 V240 H110 Z" fill="none" stroke="#e0a100" stroke-width="3.5" stroke-dasharray="2 16" stroke-linecap="round"/>';
      // Quelle
      h += S.source({ cx: 110, cy: 150, r: 26, plusFirst: s > 0 });
      h += S.bmk({ x: 110, y: 150, gap: 38, name: "-G1", value: "12 V DC", extra: s < 0 ? T("swapped", "vertauscht") : null, extraColor: "#c42b2b" });
      // Sicherung
      h += S.fuse({ cx: 190, cy: 60, blown: res.short });
      h += S.bmk({ x: 190, y: 60, side: "top", gap: 20, name: "-F1", extra: res.short ? T("blown", "ausgelöst") : null, extraColor: "#c42b2b" });
      // Diode in Reihe
      if (st.pos === "series") {
        var on1 = res.dState === T("conducts", "leitet");
        h += S.diode({ cx: 300, cy: 60, s: 36, dir: st.flip ? "left" : "right", lead: 0, hl: on1 ? HL : null });
        h += S.bmk({ x: 300, y: 60, side: "top", gap: 32, name: "-R1" });
        h += '<text x="300" y="104" text-anchor="middle" font-size="12.5" font-weight="700" fill="' + (on1 ? "#0d5b2a" : "#6b7684") + '">' + res.dState + "</text>";
      }
      // Diode parallel zum Motor
      if (st.pos === "parallel") {
        var on2 = res.dState === T("conducts", "leitet");
        h += S.diode({ cx: 390, cy: 150, s: 36, dir: st.flip ? "down" : "up", lead: 0, hl: on2 ? HL : null });
        h += S.bmk({ x: 390, y: 150, gap: 38, name: "-R1", extra: res.dState, extraColor: on2 ? "#0d5b2a" : "#6b7684" });
      }
      // Motor
      h += S.motor({ cx: 530, cy: 150, r: 30 });
      h += S.bmk({ x: 530, y: 150, gap: 42, name: "-M1" });
      // Welle und Förderband
      h += '<line x1="560" y1="150" x2="624" y2="150" stroke="#6b7684" stroke-width="4"/>';
      h += '<rect x="610" y="136" width="130" height="28" rx="14" fill="#2b3440"/><circle cx="624" cy="150" r="10" fill="#6b7684"/><circle cx="726" cy="150" r="10" fill="#6b7684"/>';
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
        var x = 610 + ((i * 46 + belt) % 184 + 184) % 184 - 22;
        html += '<rect x="' + x.toFixed(1) + '" y="104" width="30" height="30" rx="3" fill="#c8a165" stroke="#8a6a3a" stroke-width="1.5"/>';
      }
      boxesEl.innerHTML = html;
      var a = "";
      if (res.dir > 0) a = '<path d="M646 186 h60" stroke="#14873d" stroke-width="3"/><path d="M714 186 l-10 -6 v12z" fill="#14873d"/><text x="676" y="210" text-anchor="middle" font-size="12" font-weight="700" fill="#14873d">' + T('forwards', 'vorwärts') + '</text>';
      else if (res.dir < 0) a = '<path d="M656 186 h60" stroke="#c42b2b" stroke-width="3"/><path d="M648 186 l10 -6 v12z" fill="#c42b2b"/><text x="684" y="210" text-anchor="middle" font-size="12" font-weight="700" fill="#c42b2b">' + T('backwards!', 'rückwärts!') + '</text>';
      else a = '<text x="676" y="196" text-anchor="middle" font-size="12" font-weight="700" fill="#6b7684">' + T('at rest', 'steht') + '</text>';
      arrowEl.innerHTML = a;
    }

    function text() {
      var s = st.pol, d = res.dState;
      if (st.pos === "none") {
        if (s > 0) LT.status(status, "ok", T("Motor runs forwards", "Motor läuft vorwärts"), T("Without protection diode – as long as nobody swaps the connections.", "Ohne Schutzdiode – solange niemand die Anschlüsse vertauscht."));
        else LT.status(status, "bad", T("Motor turns the wrong way", "Motor dreht falsch herum"), T("The conveyor belt runs backwards. Without protection the system can be damaged.", "Das Förderband läuft rückwärts. Ohne Schutz kann die Anlage beschädigt werden."));
      } else if (st.pos === "series") {
        if (s > 0 && d === T("conducts", "leitet")) LT.status(status, "ok", T("Motor runs forwards", "Motor läuft vorwärts"), T("The diode -R1 conducts. The forward voltage drops across it (simplified 0.7 V).", "Die Diode -R1 leitet. An ihr fällt die Durchlassspannung ab (vereinfacht 0,7 V)."));
        else if (s < 0 && d === T("blocks", "sperrt")) LT.status(status, "ok", T("Protected: motor at rest", "Geschützt: Motor steht"), T("The diode -R1 blocks and takes up the voltage. Nothing is damaged.", "Die Diode -R1 sperrt und nimmt die Spannung auf. Nichts wird beschädigt."));
        else if (s > 0) LT.status(status, "warn", T("Diode installed the wrong way round", "Diode falsch herum eingebaut"), T("It already blocks in normal operation – the motor never runs.", "Sie sperrt schon im Normalbetrieb – der Motor läuft nie."));
        else LT.status(status, "bad", T("Motor turns the wrong way", "Motor dreht falsch herum"), T("The wrongly installed diode conducts precisely when the polarity is reversed.", "Die falsch eingebaute Diode leitet gerade bei Verpolung."));
      } else {
        if (res.short && s < 0) LT.status(status, "warn", T("Protected, but fuse blown", "Geschützt, aber Sicherung ausgelöst"), T("The diode -R1 conducts and short-circuits the source. The motor stays at rest, the fuse -F1 must be replaced.", "Die Diode -R1 leitet und schließt die Quelle kurz. Der Motor bleibt stehen, die Sicherung -F1 muss ersetzt werden."));
        else if (res.short) LT.status(status, "bad", T("Short circuit in normal operation", "Kurzschluss im Normalbetrieb"), T("The diode -R1 is installed the wrong way round – the fuse -F1 blows immediately.", "Die Diode -R1 ist falsch herum eingebaut – die Sicherung -F1 löst sofort aus."));
        else if (s > 0) LT.status(status, "ok", T("Motor runs forwards", "Motor läuft vorwärts"), T("The diode blocks in normal operation and causes no voltage loss.", "Die Diode sperrt im Normalbetrieb und verursacht keinen Spannungsverlust."));
        else LT.status(status, "bad", T("Motor turns the wrong way", "Motor dreht falsch herum"), T("The diode also blocks with reversed polarity – it is installed the wrong way round.", "Die Diode sperrt auch bei Verpolung – sie ist falsch herum eingebaut."));
      }
      if (LT.config.messwerteAnzeigen) {
        values.innerHTML = "<div>" + T("<dt>Motor current</dt>", "<dt>Motorstrom</dt>") + "<dd>" + LT.fmtI(res.I) + "</dd></div><div>" + T("<dt>Motor voltage</dt>", "<dt>Motorspannung</dt>") + "<dd>" + LT.num(res.UM * (res.dir < 0 ? -1 : 1), 1) + " V</dd></div>";
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
