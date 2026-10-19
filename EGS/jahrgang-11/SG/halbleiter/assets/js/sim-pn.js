/* =========================================================================
   LUMIATECH – Simulation PN-Übergang
   Platzhalter: <div data-sim="pn" data-mode="diode|led" data-title="…" data-hint="…"></div>
   Zeigt ortsfeste Ionen, bewegliche Löcher/Elektronen, die Sperrschicht (RLZ)
   und – bei der LED – Photonen bei jeder Rekombination.
   ========================================================================= */
(function () {
  "use strict";
  var LT = window.LT;
  var C = {
    hole: "#d3262b", electron: "#1f5bd8", ink: "#17202b", ink3: "#6b7684", line: "#d4dae1",
    pBg: "#fdf1f0", nBg: "#eef3fd", rlz: "#f3f4f6", metal: "#4b5563", current: "#e0a100"
  };

  LT.$$('[data-sim="pn"]').forEach(init);

  function init(host) {
    var isLED = host.getAttribute("data-mode") === "led";
    var ui = LT.lab(host, { icon: "lab" });
    var D = LT.phys.devices;
    var st = { mode: "none", k: 0, color: "red", dev: isLED ? D.red : D.si };

    /* ---------- Bedienelemente ---------- */
    LT.segmented(ui.controls, "Spannungsquelle", [
      { value: "none", label: "Keine" },
      { value: "fwd", label: "Durchlass" },
      { value: "rev", label: "Sperr" }
    ], "none", function (v) { st.mode = v; slider.input.disabled = v === "none"; if (v !== "none" && st.k === 0) slider.set(v === "fwd" ? 40 : 40); st.k = slider.get(); refresh(); });

    if (isLED) {
      LT.segmented(ui.controls, "Halbleiterwerkstoff", [
        { value: "red", html: '<span class="dot" style="background:#d3262b"></span>AlGaInP' },
        { value: "green", html: '<span class="dot" style="background:#14873d"></span>GaP' },
        { value: "blue", html: '<span class="dot" style="background:#1f5bd8"></span>GaN' }
      ], "red", function (v) { st.color = v; st.dev = D[v]; slider.refresh(); refresh(); });
    }

    var slider = LT.slider(ui.controls, {
      label: "Spannung U", min: 0, max: 100, step: 1, value: 0,
      format: function () { return st.mode === "none" ? "0 V" : LT.num(voltage(), st.mode === "rev" ? 1 : 2) + " V"; },
      onInput: function (v) { st.k = v; refresh(); }
    });
    slider.input.disabled = true;

    var explain = document.createElement("div");
    explain.className = "pn-explain";
    ui.controls.appendChild(explain);

    /* ---------- Bühne ---------- */
    var canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.style.width = "100%";
    ui.stage.appendChild(canvas);
    var status = document.createElement("div");
    status.style.marginTop = "12px";
    ui.stage.appendChild(status);
    var legend = document.createElement("div");
    legend.className = "legend";
    legend.innerHTML =
      '<span><svg viewBox="0 0 26 26" style="width:20px;height:20px"><circle cx="13" cy="13" r="10" fill="#fff" stroke="' + C.electron + '" stroke-width="2"/><path d="M8 13h10" stroke="' + C.electron + '" stroke-width="2.4"/></svg>negatives Ion (ortsfest)</span>' +
      '<span><svg viewBox="0 0 26 26" style="width:20px;height:20px"><circle cx="13" cy="13" r="10" fill="#fff" stroke="' + C.hole + '" stroke-width="2"/><path d="M8 13h10M13 8v10" stroke="' + C.hole + '" stroke-width="2.4"/></svg>positives Ion (ortsfest)</span>' +
      '<span><svg viewBox="0 0 26 26" style="width:20px;height:20px"><circle cx="13" cy="13" r="7" fill="' + C.hole + '"/><path d="M9.5 13h7M13 9.5v7" stroke="#fff" stroke-width="2"/></svg>Loch (beweglich)</span>' +
      '<span><svg viewBox="0 0 26 26" style="width:20px;height:20px"><circle cx="13" cy="13" r="7" fill="' + C.electron + '"/><path d="M9.5 13h7" stroke="#fff" stroke-width="2"/></svg>Elektron (beweglich)</span>' +
      (isLED ? '<span><svg viewBox="0 0 26 26" style="width:20px;height:20px"><circle cx="13" cy="13" r="5" fill="#ffc400"/><circle cx="13" cy="13" r="10" fill="none" stroke="#ffc400" stroke-opacity=".5" stroke-width="2"/></svg>Photon (Licht)</span>' : "");
    ui.stage.appendChild(legend);

    function voltage() {
      var t = st.k / 100;
      if (st.mode === "fwd") return t * (st.dev.U20 + (isLED ? 0.25 : 0.12));
      if (st.mode === "rev") return t * (isLED ? 8 : 10);
      return 0;
    }
    function current() { return st.mode === "fwd" ? LT.phys.I_of_U(st.dev, voltage()) : 0; }

    /* ---------- Geometrie & Teilchen ---------- */
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, G = {}, ions = [], carriers = [], flashes = [], photons = [], wirePhase = 0;
    var rlzW = 0, rlzTarget = 0;
    var COLS = 6, ROWS = 4;

    function layout() {
      W = Math.max(300, ui.stage.clientWidth - 40 > 0 ? ui.stage.clientWidth - 40 : 600);
      H = Math.round(Math.max(300, Math.min(420, W * 0.56)));
      canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.height = H + "px";
      var x0 = Math.round(W * 0.07), x1 = Math.round(W * 0.93);
      G = { x0: x0, x1: x1, xj: (x0 + x1) / 2, y0: Math.round(H * 0.34), y1: Math.round(H * 0.84), top: Math.round(H * 0.11) };
      G.half = (x1 - x0) / 2;
      G.r = LT.clamp(W / 70, 6, 10);
      G.w0 = G.half * 0.36;
      buildIons();
      if (!carriers.length) buildCarriers();
      else carriers.forEach(function (p) { p.x = LT.clamp(p.x, G.x0, G.x1); p.y = LT.clamp(p.y, G.y0 + G.r, G.y1 - G.r); });
    }
    function buildIons() {
      ions = [];
      var h = G.y1 - G.y0;
      for (var side = 0; side < 2; side++) {
        for (var c = 0; c < COLS; c++) for (var r = 0; r < ROWS; r++) {
          var fx = (c + 0.5) / COLS, fy = (r + 0.5) / ROWS;
          var x = side === 0 ? G.x0 + fx * G.half : G.xj + fx * G.half;
          ions.push({ x: x + ((r % 2) ? 6 : -6), y: G.y0 + fy * h, sign: side === 0 ? -1 : 1 });
        }
      }
    }
    function buildCarriers() {
      carriers = [];
      for (var i = 0; i < COLS * ROWS; i++) {
        carriers.push(newCarrier("h", G.x0 + Math.random() * (G.half - G.w0 / 2)));
        carriers.push(newCarrier("e", G.x1 - Math.random() * (G.half - G.w0 / 2)));
      }
    }
    function newCarrier(type, x) {
      return { type: type, x: x, y: G.y0 + G.r + Math.random() * (G.y1 - G.y0 - 2 * G.r), vx: 0, vy: 0, go: null };
    }

    /* ---------- Simulationsschritt ---------- */
    var acc = 0;
    function step(dt) {
      var U = voltage(), I = current();
      var t = st.mode === "fwd" ? LT.clamp(U / st.dev.U20, 0, 1.2) : 0;
      if (st.mode === "fwd") rlzTarget = G.w0 * Math.sqrt(Math.max(0.03, 1 - Math.min(t, 1)));
      else if (st.mode === "rev") rlzTarget = Math.min(G.half * 1.25, G.w0 * Math.sqrt(1 + U / 0.8));
      else rlzTarget = G.w0;
      rlzW += (rlzTarget - rlzW) * Math.min(1, dt * 3);

      var bP = G.xj - rlzW / 2 - G.r, bN = G.xj + rlzW / 2 + G.r;
      var jit = LT.reducedMotion ? 0 : 60;
      var drift = st.mode === "fwd" ? 18 + 50 * t : st.mode === "rev" ? -(20 + 6 * Math.min(U, 8)) : 0;

      carriers.forEach(function (p) {
        if (p.go) {
          var dx = p.go.x - p.x, dy = p.go.y - p.y, d = Math.hypot(dx, dy), v = 160 * dt;
          if (d <= v) { p.x = p.go.x; p.y = p.go.y; p.arrived = true; }
          else { p.x += dx / d * v; p.y += dy / d * v; }
          return;
        }
        p.vx += (Math.random() - 0.5) * jit * dt * 10; p.vy += (Math.random() - 0.5) * jit * dt * 10;
        p.vx *= 0.9; p.vy *= 0.9;
        var dir = p.type === "h" ? 1 : -1;
        p.x += (p.vx + dir * drift) * dt; p.y += p.vy * dt;
        var minX = p.type === "h" ? G.x0 + G.r + 4 : bN, maxX = p.type === "h" ? bP : G.x1 - G.r - 4;
        if (p.x < minX) p.x += (minX - p.x) * Math.min(1, dt * 6) + 0.2;
        if (p.x > maxX) p.x -= (p.x - maxX) * Math.min(1, dt * 6) + 0.2;
        p.y = LT.clamp(p.y, G.y0 + G.r + 2, G.y1 - G.r - 2);
      });

      // Rekombination im Durchlassbetrieb
      var rate = st.mode === "fwd" ? Math.min(14, 7 * I / LT.phys.I20) : 0;
      if (rate > 0.05) {
        acc += rate * dt;
        var busy = carriers.filter(function (p) { return p.go; }).length / 2;
        while (acc >= 1 && busy < 6) {
          acc -= 1; busy++;
          var h = null, e = null;
          carriers.forEach(function (p) {
            if (p.go) return;
            if (p.type === "h" && (!h || p.x > h.x)) h = p;
            if (p.type === "e" && (!e || p.x < e.x)) e = p;
          });
          if (!h || !e) break;
          var ym = (h.y + e.y) / 2;
          h.go = { x: G.xj - 3, y: ym }; e.go = { x: G.xj + 3, y: ym };
          h.pair = e; e.pair = h;
        }
        if (acc > 3) acc = 3;
      } else acc = 0;

      // angekommene Paare rekombinieren
      for (var i = carriers.length - 1; i >= 0; i--) {
        var p = carriers[i];
        if (p.type === "h" && p.arrived && p.pair && p.pair.arrived) {
          var e2 = p.pair;
          flashes.push({ x: G.xj, y: p.y, t: 0 });
          if (isLED) {
            var ang = Math.random() * Math.PI * 2;
            photons.push({ x: G.xj, y: p.y, vx: Math.cos(ang) * 150, vy: Math.sin(ang) * 150 - 40, t: 0 });
          }
          carriers.splice(carriers.indexOf(e2), 1);
          carriers.splice(carriers.indexOf(p), 1);
          carriers.push(newCarrier("h", G.x0 + G.r + 6));
          carriers.push(newCarrier("e", G.x1 - G.r - 6));
        }
      }
      flashes.forEach(function (f) { f.t += dt; });
      flashes = flashes.filter(function (f) { return f.t < 0.5; });
      photons.forEach(function (f) { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; });
      photons = photons.filter(function (f) { return f.t < 1.6; });
      wirePhase += dt * Math.min(90, 20 + 70 * I / LT.phys.I20);
    }

    /* ---------- Zeichnen ---------- */
    function draw() {
      var ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var U = voltage(), I = current(), rel = LT.clamp(I / LT.phys.I20, 0, 1.4);
      var font = getComputedStyle(document.body).fontFamily;

      // Kristall
      ctx.fillStyle = C.pBg; ctx.fillRect(G.x0, G.y0, G.half, G.y1 - G.y0);
      ctx.fillStyle = C.nBg; ctx.fillRect(G.xj, G.y0, G.half, G.y1 - G.y0);
      // RLZ
      var rl = G.xj - rlzW / 2;
      ctx.fillStyle = "rgba(255,196,0,.16)"; ctx.fillRect(rl, G.y0, rlzW, G.y1 - G.y0);
      ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2;
      [rl, rl + rlzW].forEach(function (x) { ctx.beginPath(); ctx.moveTo(x, G.y0); ctx.lineTo(x, G.y1); ctx.stroke(); });
      ctx.restore();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(G.x0, G.y0, G.x1 - G.x0, G.y1 - G.y0);
      // Kontakte
      ctx.fillStyle = C.metal; ctx.fillRect(G.x0 - 7, G.y0 - 4, 7, G.y1 - G.y0 + 8); ctx.fillRect(G.x1, G.y0 - 4, 7, G.y1 - G.y0 + 8);

      // Ionen
      ions.forEach(function (o) {
        var col = o.sign < 0 ? C.electron : C.hole, r = G.r * 1.25;
        ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fill();
        ctx.lineWidth = 1.6; ctx.strokeStyle = col; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(o.x - r * 0.5, o.y); ctx.lineTo(o.x + r * 0.5, o.y);
        if (o.sign > 0) { ctx.moveTo(o.x, o.y - r * 0.5); ctx.lineTo(o.x, o.y + r * 0.5); }
        ctx.lineWidth = 1.8; ctx.stroke();
      });
      // bewegliche Ladungsträger
      carriers.forEach(function (p) {
        var col = p.type === "h" ? C.hole : C.electron, r = G.r * 0.78;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.6; ctx.beginPath();
        ctx.moveTo(p.x - r * 0.55, p.y); ctx.lineTo(p.x + r * 0.55, p.y);
        if (p.type === "h") { ctx.moveTo(p.x, p.y - r * 0.55); ctx.lineTo(p.x, p.y + r * 0.55); }
        ctx.stroke();
      });
      // Rekombinations-Blitze
      flashes.forEach(function (f) {
        var a = 1 - f.t / 0.5;
        ctx.beginPath(); ctx.arc(f.x, f.y, G.r * (1 + f.t * 4), 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(224,161,0," + a + ")"; ctx.lineWidth = 2; ctx.stroke();
      });
      // Photonen (LED)
      var pc = isLED ? LT.phys.wavelengthToRGB(st.dev.lambdaD) : "#ffc400";
      photons.forEach(function (f) {
        var a = Math.max(0, 1 - f.t / 1.6);
        ctx.globalAlpha = a;
        var g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, G.r * 2.2);
        g.addColorStop(0, pc); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, G.r * 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(f.x, f.y, G.r * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Beschriftung Kristall
      ctx.fillStyle = C.ink; ctx.font = "700 " + Math.round(LT.clamp(W / 50, 12, 15)) + "px " + font; ctx.textAlign = "center";
      ctx.fillText("P-Leiter", G.x0 + G.half / 2, G.y1 + 22);
      ctx.fillText("N-Leiter", G.xj + G.half / 2, G.y1 + 22);
      ctx.font = "600 " + Math.round(LT.clamp(W / 58, 11, 13)) + "px " + font; ctx.fillStyle = "#8a6400";
      ctx.fillText("Sperrschicht (RLZ)", G.xj, G.y1 + 42);
      ctx.fillStyle = C.ink3; ctx.textAlign = "left"; ctx.fillText("Anode (A)", G.x0 - 7, G.y1 + 42);
      ctx.textAlign = "right"; ctx.fillText("Kathode (K)", G.x1 + 7, G.y1 + 42);

      // Stromkreis
      var lx = G.x0 - 3.5, rx = G.x1 + 3.5, ty = G.top, bx = G.xj;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, G.y0 - 4); ctx.lineTo(lx, ty); ctx.lineTo(bx - 16, ty);
      ctx.moveTo(bx + 16, ty); ctx.lineTo(rx, ty); ctx.lineTo(rx, G.y0 - 4);
      ctx.stroke();
      // Quelle
      var plus = st.mode === "rev" ? "right" : "left";
      ctx.lineWidth = 3;
      var longX = plus === "left" ? bx - 9 : bx + 9, shortX = plus === "left" ? bx + 9 : bx - 9;
      ctx.beginPath(); ctx.moveTo(longX, ty - 20); ctx.lineTo(longX, ty + 20); ctx.stroke();
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(shortX, ty - 10); ctx.lineTo(shortX, ty + 10); ctx.stroke();
      ctx.font = "800 18px " + font; ctx.textAlign = "center";
      if (st.mode !== "none") {
        ctx.fillStyle = C.hole; ctx.fillText("+", longX + (plus === "left" ? -14 : 14), ty - 10);
        ctx.fillStyle = C.electron; ctx.fillText("–", shortX + (plus === "left" ? 14 : -14), ty - 8);
      }
      ctx.font = "650 13px " + font; ctx.fillStyle = C.ink;
      ctx.fillText(st.mode === "none" ? "U = 0 V" : "U = " + LT.num(U, st.mode === "rev" ? 1 : 2) + " V", bx, ty + 38);
      // Lampe bzw. Vorwiderstand
      var lampX = G.x0 + G.half * 0.45;
      if (!isLED) {
        if (rel > 0.02) {
          var gl = ctx.createRadialGradient(lampX, ty, 2, lampX, ty, 40);
          gl.addColorStop(0, "rgba(255,196,0," + (0.9 * Math.min(1, rel)) + ")"); gl.addColorStop(1, "rgba(255,196,0,0)");
          ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(lampX, ty, 40, 0, Math.PI * 2); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(lampX, ty, 14, 0, Math.PI * 2); ctx.fillStyle = rel > 0.02 ? "#fff6cf" : "#fff"; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lampX - 10, ty - 10); ctx.lineTo(lampX + 10, ty + 10); ctx.moveTo(lampX + 10, ty - 10); ctx.lineTo(lampX - 10, ty + 10); ctx.stroke();
      } else {
        ctx.fillStyle = "#fff"; ctx.fillRect(lampX - 22, ty - 8, 44, 16); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.strokeRect(lampX - 22, ty - 8, 44, 16);
        ctx.font = "600 12px " + font; ctx.fillStyle = C.ink; ctx.fillText("R", lampX, ty - 14);
        // Leuchten des Kristalls
        if (rel > 0.02) {
          var lg = ctx.createRadialGradient(G.xj, (G.y0 + G.y1) / 2, 4, G.xj, (G.y0 + G.y1) / 2, G.half);
          lg.addColorStop(0, pc.replace("rgb", "rgba").replace(")", "," + (0.35 * Math.min(1, rel)) + ")")); lg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = lg; ctx.fillRect(G.x0, G.y0 - 40, G.x1 - G.x0, G.y1 - G.y0 + 80);
        }
      }
      // technische Stromrichtung im Leiter
      if (I > 2e-4 && st.mode === "fwd") {
        var pts = [[bx - 16, ty], [lx, ty], [lx, G.y0 - 4], null, [rx, G.y0 - 4], [rx, ty], [bx + 16, ty]];
        drawDots(ctx, pts, wirePhase);
      }
    }
    function drawDots(ctx, pts, phase) {
      ctx.fillStyle = C.current;
      var segs = [], total = 0;
      for (var i = 0; i < pts.length - 1; i++) {
        if (!pts[i] || !pts[i + 1]) continue;
        var L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
        segs.push({ a: pts[i], b: pts[i + 1], L: L, s: total }); total += L;
      }
      for (var d = phase % 26; d < total; d += 26) {
        var sg = segs.filter(function (s) { return d >= s.s && d <= s.s + s.L; })[0];
        if (!sg) continue;
        var f = (d - sg.s) / sg.L;
        var x = sg.a[0] + (sg.b[0] - sg.a[0]) * f, y = sg.a[1] + (sg.b[1] - sg.a[1]) * f;
        ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
      }
    }

    /* ---------- Texte ---------- */
    function refresh() {
      slider.refresh();
      var U = voltage(), I = current(), steps, title, kind;
      var thr = st.dev.U20 * (isLED ? 0.9 : 0.8);
      if (st.mode === "none") {
        title = "Ohne äußere Spannung";
        steps = ["Am Übergang wandern Elektronen aus dem N-Leiter in den P-Leiter und besetzen dort Löcher.",
                 "Zurück bleiben nur ortsfeste Ionen: Die Sperrschicht (Raumladungszone) enthält keine freien Ladungsträger."];
        LT.status(status, "info", "Keine Spannung angelegt", "Die Sperrschicht trennt P- und N-Leiter.");
      } else if (st.mode === "fwd") {
        title = "Durchlassrichtung: Plus an P (Anode), Minus an N (Kathode)";
        if (U < thr) {
          steps = ["Die Quelle drückt Löcher und Elektronen in Richtung Sperrschicht.",
                   "Die Sperrschicht wird schmaler. Unterhalb der Schleusenspannung fließt aber noch kaum Strom."];
          LT.status(status, "warn", "Spannung unterhalb der Schleusenspannung", isLED ? "Die LED bleibt dunkel." : "Die Lampe bleibt aus.");
        } else {
          steps = ["Die Ladungsträger werden in Richtung Sperrschicht gedrückt.",
                   "Die Sperrschicht wird sehr schmal, Elektronen und Löcher rekombinieren an der Grenzfläche. Der PN-Übergang leitet." +
                   (isLED ? " Bei jeder Rekombination wird Energie als Licht frei." : "")];
          LT.status(status, "ok", isLED ? "Die LED leuchtet" : "Der PN-Übergang leitet – die Lampe leuchtet", "Strom fließt in Durchlassrichtung.");
        }
      } else {
        title = "Sperrrichtung: Minus an P (Anode), Plus an N (Kathode)";
        steps = ["Die Quelle zieht Löcher und Elektronen von der Sperrschicht weg zu den Anschlüssen.",
                 "Die Sperrschicht wird breiter. Der PN-Übergang sperrt, es fließt praktisch kein Strom."];
        if (isLED && U > 5) LT.status(status, "bad", "Maximale Sperrspannung überschritten", "LEDs vertragen in Sperrrichtung meist nur etwa 5 V. Darüber kann die LED zerstört werden.");
        else LT.status(status, "info", "Der PN-Übergang sperrt", isLED ? "Die LED bleibt dunkel." : "Die Lampe bleibt aus.");
      }
      explain.innerHTML = "<strong>" + title + "</strong><ol>" + steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>";
      canvas.setAttribute("aria-label", "PN-Übergang: " + title + ". " + steps.join(" "));
    }

    /* ---------- Schleife ---------- */
    var running = false, last = 0;
    function loop(ts) {
      if (!running) return;
      var dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
      step(dt); draw();
      requestAnimationFrame(loop);
    }
    LT.whenVisible(host, function (vis) {
      if (vis && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
      else if (!vis) running = false;
    });
    var lastW = 0;
    if ("ResizeObserver" in window) new ResizeObserver(function () {
      var w = ui.stage.clientWidth; if (Math.abs(w - lastW) > 4) { lastW = w; layout(); rlzW = rlzTarget || G.w0; draw(); }
    }).observe(ui.stage);
    layout(); rlzW = G.w0; refresh(); draw();
  }
})();
