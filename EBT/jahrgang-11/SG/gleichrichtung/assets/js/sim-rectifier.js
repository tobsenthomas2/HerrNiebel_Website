/* =========================================================================
   Simulation „Gleichrichter-Strompfade“  ·  <div data-sim="rectifier">
   Woche 1: nur Trafo 12 V~ / 50 Hz und Einweggleichrichter (E1U)
   ab Woche 2: zusätzlich Brückengleichrichter (B2U) und Generator mit Drehzahlregler
   (bewusst ohne Schottky-Dioden und ohne Kondensator)
   Modell (Näherung): Diode U_F ≈ 0,7 V, LED-Schwelle 2,75 V + 0,6 Ω,
   Trafo mit Vorwiderstand 33 Ω; Generator: û ~ f (0,8 V/Hz), Innenwiderstand 6 Ω + Induktivität 0,16 H.
   ========================================================================= */
(function () {
  "use strict";
  function init(host) {
    var S = SIM.shell(host, "scope");
    var weekBridge = SITE.open(2);
    var st = { src: "trafo", rect: "e1u", speed: 30, playing: !SIM.reduced, tCur: 0 };
    var ULED = 2.75, RLED = 0.6, UD = 0.7;

    function model() {
      var f, uhat, Z;
      if (st.src === "trafo") { f = 50; uhat = 12 * Math.SQRT2; Z = 33; }
      else { f = 3 + (st.speed / 100) * 57; uhat = 0.8 * f; Z = Math.hypot(6, 2 * Math.PI * f * 0.16); }
      var n = st.rect === "b2u" ? 2 : 1, uth = ULED + n * UD;
      var win = st.src === "trafo" ? 0.04 : 0.2;
      function e(t) { return uhat * Math.sin(2 * Math.PI * f * t); }
      function drive(t) { var v = e(t); return st.rect === "b2u" ? Math.abs(v) : Math.max(0, v); }
      function i(t) { return Math.max(0, (drive(t) - uth) / (Z + RLED)); }
      function uLed(t) {
        var ii = i(t);
        if (ii > 0) return ULED + RLED * ii;
        return SIM.clamp(drive(t) - n * 0.55, 0, ULED);
      }
      var iRef = st.src === "trafo" ? 0.42 : 0.5;
      return { f: f, uhat: uhat, n: n, uth: uth, win: win, e: e, i: i, uLed: uLed, light: function (t) { return Math.min(1, i(t) / iRef); } };
    }

    /* ---------- Bedienelemente ---------- */
    var controls = document.createElement("div");
    controls.className = "controls";
    S.body.appendChild(controls);
    var speed;
    if (weekBridge) {
      controls.appendChild(SIM.seg({ en: "Source", de: "Quelle" }, [
        { id: "trafo", en: "Transformer 12 V~ · 50 Hz", de: "Trafo 12 V~ · 50 Hz" },
        { id: "gen", en: "Generator", de: "Generator" }
      ], st.src, function (id) { st.src = id; speed.el.hidden = id !== "gen"; drawCircuit(); update(); }).el);
      controls.appendChild(SIM.seg({ en: "Rectifier", de: "Gleichrichter" }, [
        { id: "e1u", en: "Half-wave (E1U)", de: "Einweg (E1U)" },
        { id: "b2u", en: "Bridge (B2U)", de: "Brücke (B2U)" }
      ], st.rect, function (id) { st.rect = id; drawCircuit(); update(); }).el);
      speed = SIM.slider({ en: "Speed:", de: "Drehzahl:" }, 0, 100, 1, st.speed, function (v) {
        return SITE.t(v < 20 ? { en: "very slow", de: "sehr langsam" } : v < 45 ? { en: "slow", de: "langsam" } : v < 75 ? { en: "medium", de: "mittel" } : { en: "fast", de: "schnell" });
      }, function (v) { st.speed = v; update(); });
      speed.el.hidden = true;
      controls.appendChild(speed.el);
    } else {
      controls.remove();
    }

    /* ---------- Schaltplan + Oszi ---------- */
    var row = document.createElement("div");
    row.className = "sim__row";
    S.body.appendChild(row);
    var left = document.createElement("div"), right = document.createElement("div");
    left.className = "screens";
    row.appendChild(left); row.appendChild(right);
    var scSrc = SIM.scope(left), scLed = SIM.scope(left);
    var circuitHost = document.createElement("div");
    right.appendChild(circuitHost);
    var C = null;

    function drawCircuit() {
      circuitHost.innerHTML = "";
      if (st.rect === "e1u") {
        C = SIM.circuit(circuitHost, 360, 210, { en: "Circuit: half-wave rectifier with LED", de: "Schaltplan: Einweggleichrichter mit LED" });
        C.source(60, 105, 22, "~", "src");
        C.wire([[60, 83], [60, 40], [125, 40]], "top");
        C.diode(125, 40, 185, 40, "d1");
        if (st.src === "trafo") {
          C.wire([[185, 40], [200, 40]], "mid");
          C.resistor(200, 40, 260, 40, "mid");
          C.wire([[260, 40], [300, 40], [300, 78]], "mid");
          C.text(230, 26, "-R2", { anchor: "middle" });
        } else {
          C.wire([[185, 40], [300, 40], [300, 78]], "mid");
        }
        C.diode(300, 78, 300, 132, "led", true);
        C.wire([[300, 132], [300, 172], [60, 172], [60, 127]], "bot");
        C.text(155, 26, "-R1", { anchor: "middle" });
        C.text(28, 109, "-G1", { anchor: "end" });
        C.text(282, 109, "-P1", { anchor: "end" });
      } else {
        C = SIM.circuit(circuitHost, 360, 230, { en: "Circuit: bridge rectifier with LED", de: "Schaltplan: Brückengleichrichter mit LED" });
        var T = [175, 58], B = [175, 162], L = [122, 110], R = [228, 110];
        C.source(55, 110, 22, "~", "src");
        C.wire([[55, 88], [55, 32], [175, 32], T], "top");
        C.wire([[55, 132], [55, 192], [175, 192], B], "bot");
        C.diode(T[0], T[1], R[0], R[1], "d1");
        C.diode(B[0], B[1], R[0], R[1], "d2");
        C.diode(L[0], L[1], T[0], T[1], "d3");
        C.diode(L[0], L[1], B[0], B[1], "d4");
        C.wire([R, [290, 110], [290, 62], [325, 62], [325, 82]], "plus");
        C.diode(325, 82, 325, 138, "led", true);
        C.wire([[325, 138], [325, 214], [95, 214], [95, 110], L], "minus");
        [T, B, L, R].forEach(function (p) { C.dot(p[0], p[1]); });
        C.text(214, 76, "-R1"); C.text(214, 156, "-R2"); C.text(102, 76, "-R3"); C.text(102, 156, "-R4");
        C.text(23, 114, "-G1", { anchor: "end" });
        C.text(307, 114, "-P1", { anchor: "end" });
      }
      var lx = st.rect === "e1u" ? 300 : 325, ly1 = st.rect === "e1u" ? 72 : 76, ly2 = st.rect === "e1u" ? 140 : 146;
      C.text(lx + 10, ly1 + 2, "CH1", { size: 12, color: "#a93c17", bold: true });
      C.text(lx + 22, ly2 + 6, "GND", { size: 12, color: "#a93c17", bold: true });
      SIM.el("path", { d: "M" + lx + " " + ly2 + "h9 v4 M" + (lx + 4) + " " + (ly2 + 4) + "h10 M" + (lx + 6) + " " + (ly2 + 7) + "h6 M" + (lx + 8) + " " + (ly2 + 10) + "h2", stroke: "#a93c17", "stroke-width": 1.6, fill: "none" }, C.svg);
    }

    /* ---------- Zeit: Zeitlupe, Pause, Regler ---------- */
    var play = document.createElement("div");
    play.className = "sim__play";
    S.body.appendChild(play);
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "icon-btn";
    play.appendChild(btn);
    var timeS = SIM.slider({ en: "Point in time (slow motion):", de: "Zeitpunkt (Zeitlupe):" }, 0, 1000, 1, 0, function (v) {
      var m = model(); return Math.round(v / 1000 * m.win * 1000) + " ms";
    }, function (v) { st.playing = false; btnText(); st.tCur = v / 1000; });
    play.appendChild(timeS.el);
    function btnText() {
      btn.setAttribute("aria-pressed", String(st.playing));
      btn.textContent = st.playing ? SITE.t({ en: "❚❚ Pause", de: "❚❚ Pause" }) : SITE.t({ en: "▶ Play", de: "▶ Abspielen" });
    }
    btn.addEventListener("click", function () { st.playing = !st.playing; btnText(); });
    btnText(); SIM.onLang(btnText);

    var lamps = document.createElement("div");
    lamps.className = "lamp-view";
    lamps.innerHTML =
      '<div class="lamp"><span class="lamp__bulb"><span class="lamp__glow" data-l="slow"></span></span><span class="lt-slow"></span></div>' +
      '<div class="lamp"><span class="lamp__bulb"><span class="lamp__glow" data-l="eye"></span></span><span class="lt-eye"></span></div>';
    play.appendChild(lamps);
    var glowSlow = lamps.querySelector('[data-l="slow"]'), glowEye = lamps.querySelector('[data-l="eye"]');
    function lampText() {
      lamps.querySelector(".lt-slow").innerHTML = SITE.t({ en: "Lamp in<br>slow motion", de: "Lampe in<br>Zeitlupe" });
      lamps.querySelector(".lt-eye").innerHTML = SITE.t({ en: "What your eye<br>sees (real time)", de: "Was dein Auge<br>sieht (Echtzeit)" });
    }
    lampText(); SIM.onLang(lampText);

    var status = SIM.status();
    S.body.appendChild(status.el);
    var readouts = document.createElement("div");
    readouts.className = "readouts";
    if (SITE.values) S.body.appendChild(readouts);

    S.foot.hidden = false;
    function foot() {
      S.foot.innerHTML = "<p>" + SITE.t({
        en: "Simplified model: U<sub>F</sub> ≈ 0.7 V per silicon diode, LED threshold ≈ 2.75 V. The yellow strip below the scope shows when the lamp gets current. Measuring point: CH1 at the LED, ground clip at the LED’s minus.",
        de: "Vereinfachtes Modell: U<sub>F</sub> ≈ 0,7 V je Siliziumdiode, LED-Schwelle ≈ 2,75 V. Der gelbe Streifen unter dem Oszi zeigt, wann die Lampe Strom bekommt. Messpunkt: CH1 an der LED, Masseklemme am Minus der LED."
      }) + "</p>";
    }
    foot(); SIM.onLang(foot);

    var M = model();
    function update() {
      M = model();
      var ymax = Math.max(5, Math.ceil(M.uhat / 5) * 5);
      var ystep = ymax <= 10 ? 2 : ymax <= 25 ? 5 : 10;
      scSrc.draw({
        t0: 0, t1: M.win, xStep: M.win / 8, yMin: -ymax, yMax: ymax, yStep: ystep, ratio: 0.3, minH: 150, maxH: 210,
        traces: [{ fn: M.e, color: "#4fd1c5", width: 2 }],
        legend: [{ color: "#4fd1c5", text: st.src === "trafo" ? { en: "CH2 source voltage", de: "CH2 Quellenspannung" } : { en: "CH2 generator (no load)", de: "CH2 Generator (unbelastet)" } }],
        aria: { en: "Scope: source voltage", de: "Oszi: Quellenspannung" }
      });
      scLed.draw({
        t0: 0, t1: M.win, xStep: M.win / 8, yMin: -1, yMax: 4, yStep: 1, ratio: 0.36, minH: 180, maxH: 250,
        traces: [{ fn: M.uLed, color: "#ffd43b", width: 2.4 }],
        legend: [{ color: "#ffd43b", text: { en: "CH1 voltage at the LED", de: "CH1 Spannung an der LED" } }],
        light: M.light,
        aria: { en: "Scope: voltage at the LED and light pulses", de: "Oszi: Spannung an der LED und Lichtpulse" }
      });
      timeS.refresh();
      var any = false;
      for (var k = 0; k < 400; k++) if (M.i(k / 400 / M.f) > 0) { any = true; break; }
      if (!any) status.set("bad", SITE.t({ en: "The source voltage never gets above the thresholds of LED and diode(s) – the lamp stays dark.", de: "Die Quellenspannung kommt nie über die Schwellen von LED und Diode(n) – die Lampe bleibt dunkel." }));
      else if (st.rect === "e1u") status.set("", SITE.t({ en: "Current only flows during the positive half-wave. In the negative half-wave the diode blocks.", de: "Strom fließt nur in der positiven Halbwelle. In der negativen Halbwelle sperrt die Diode." }));
      else status.set("", SITE.t({ en: "Both half-waves drive current through the LED – always in the same direction. Two diodes conduct at a time.", de: "Beide Halbwellen treiben Strom durch die LED – immer in dieselbe Richtung. Es leiten immer zwei Dioden gleichzeitig." }));
      if (SITE.values) values();
    }

    function values() {
      var periods = 20, N = 4000, sum = 0, gap = 0, maxGap = 0, dt = periods / M.f / N;
      for (var k = 0; k < N; k++) {
        var t = k * dt;
        sum += M.uLed(t);
        if (M.i(t) > 0) gap = 0; else { gap += dt; if (gap > maxGap) maxGap = gap; }
      }
      var pulses = maxGap >= periods / M.f * 0.99 ? 0 : M.f * (st.rect === "b2u" ? 2 : 1);
      readouts.innerHTML =
        '<span class="readout">f = <b>' + SITE.num(M.f, 1) + " Hz</b></span>" +
        '<span class="readout">û = <b>' + SITE.num(M.uhat, 1) + " V</b></span>" +
        '<span class="readout">U<sub>d</sub> (LED) = <b>' + SITE.num(sum / N, 2) + " V</b></span>" +
        '<span class="readout">' + SITE.t({ en: "light pulses", de: "Lichtpulse" }) + " = <b>" + SITE.num(pulses, 0) + " /s</b></span>" +
        '<span class="readout">' + SITE.t({ en: "longest dark gap", de: "längste Dunkelphase" }) + " = <b>" + (pulses ? SITE.num(maxGap * 1000, 0) + " ms" : "–") + "</b></span>";
    }

    /* ---------- Animation ---------- */
    var visible = true, last = performance.now(), tReal = 0;
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(host);
    function eye(t) {                                  // Mittelwert der letzten 40 ms ≈ Trägheit des Auges
      var s = 0, n = 32;
      for (var k = 0; k < n; k++) s += M.light(t - 0.04 * k / n);
      return s / n;
    }
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (visible) {
        tReal += dt;
        if (st.playing) {
          st.tCur = (st.tCur + dt * M.win / 5) % M.win;             // ein Fenster in 5 s
          timeS.input.value = Math.round(st.tCur / M.win * 1000); timeS.refresh();
        }
        scSrc.cursor(st.tCur); scLed.cursor(st.tCur);
        var on = M.i(st.tCur) > 0, pos = M.e(st.tCur) >= 0;
        if (C) {
          var segs = [];
          if (on) segs = st.rect === "e1u" ? ["src", "top", "d1", "mid", "led", "bot"]
            : pos ? ["src", "top", "d1", "plus", "led", "minus", "d4", "bot"] : ["src", "bot", "d2", "plus", "led", "minus", "d3", "top"];
          C.highlight(segs);
          var led = C.svg.querySelector('[data-seg="led"]'); if (led) led.classList.toggle("lit", on);
        }
        glowSlow.style.opacity = M.light(st.tCur).toFixed(2);
        glowEye.style.opacity = SIM.reduced ? (eyeAvg()).toFixed(2) : eye(tReal).toFixed(2);
      }
      requestAnimationFrame(frame);
    }
    function eyeAvg() { var s = 0; for (var k = 0; k < 200; k++) s += M.light(k / 200 / M.f); return s / 200; }

    drawCircuit();
    update();
    SIM.onLang(update);
    requestAnimationFrame(frame);
  }
  function boot() { document.querySelectorAll('[data-sim="rectifier"]').forEach(init); }
  if (document.readyState === "loading") document.addEventListener("siteready", boot); else boot();
})();
