/* =========================================================================
   WATT AUF ACHSE – Baukasten für alle Simulationen
   - SIM.shell():   Rahmen einer Simulation aus dem Platzhalter
                    <div data-sim="…" data-title-en="…" data-title-de="…" data-hint-en="…" data-hint-de="…">
   - SIM.scope():   „Werkstatt-Oszi“ – SVG in Containerbreite, zeichnet bei Größenänderung neu
   - SIM.circuit(): Schaltzeichen nach DIN EN 60617, Kennzeichen nach DIN EN 81346-2
   - SIM.uf():      Durchlassspannung der Bauteile (Diodenmodell, Werte wie in der Bauteil-Ecke)
   Alle Texte laufen über SITE.t({ en, de }) und werden bei „langchange“ neu gezeichnet.
   ========================================================================= */
(function () {
  "use strict";
  var SIM = (window.SIM = window.SIM || {});
  var NS = "http://www.w3.org/2000/svg";
  var T = function (o) { return window.SITE ? SITE.t(o) : o.en; };

  SIM.reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  SIM.el = function (tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (attrs[k] != null) e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  };
  SIM.onLang = function (fn) { document.addEventListener("langchange", fn); };
  SIM.clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };

  /* ---------- Rahmen ---------- */
  SIM.shell = function (host, icon) {
    var d = host.dataset;
    var both = window.SITE ? SITE.both : function (o) { return o.en; };
    host.classList.add("sim");
    host.innerHTML =
      '<div class="sim__head">' + (window.SITE ? SITE.icon(icon || "scope") : "") +
      "<div><h3>" + both({ en: d.titleEn || "", de: d.titleDe || d.titleEn || "" }) + "</h3>" +
      (d.hintEn ? "<p>" + both({ en: d.hintEn, de: d.hintDe || d.hintEn }) + "</p>" : "") + "</div></div>" +
      '<div class="sim__body"></div>' +
      '<div class="sim__foot" hidden></div>';
    return { body: host.querySelector(".sim__body"), foot: host.querySelector(".sim__foot") };
  };

  // Segment-Schalter: [{ id, en, de, disabled }] → <div class="seg">
  SIM.seg = function (label, items, current, onPick) {
    var wrap = document.createElement("div");
    wrap.className = "control control--seg";
    var lab = document.createElement("span");
    lab.className = "control__label";
    wrap.appendChild(lab);
    var seg = document.createElement("div");
    seg.className = "seg";
    seg.setAttribute("role", "group");
    wrap.appendChild(seg);
    var buttons = items.map(function (it) {
      var b = document.createElement("button");
      b.type = "button";
      b.dataset.id = it.id;
      if (it.disabled) b.disabled = true;
      b.addEventListener("click", function () { set(it.id); onPick(it.id); });
      seg.appendChild(b);
      return b;
    });
    function set(id) { buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.id === id)); }); }
    function text() {
      lab.textContent = T(label);
      seg.setAttribute("aria-label", T(label));
      buttons.forEach(function (b, i) { b.textContent = T(items[i]); });
    }
    set(current); text(); SIM.onLang(text);
    return { el: wrap, set: set };
  };

  // Schieberegler mit Beschriftung
  SIM.slider = function (label, min, max, step, value, fmt, onInput) {
    var wrap = document.createElement("div");
    wrap.className = "control";
    var id = "s" + Math.random().toString(36).slice(2, 8);
    wrap.innerHTML = '<label for="' + id + '"><span class="lab"></span> <output></output></label>' +
      '<input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '">';
    var input = wrap.querySelector("input"), out = wrap.querySelector("output"), lab = wrap.querySelector(".lab");
    function text() { lab.textContent = T(label); out.textContent = fmt ? fmt(+input.value) : input.value; }
    input.addEventListener("input", function () { text(); onInput(+input.value); });
    text(); SIM.onLang(text);
    return { el: wrap, input: input, value: function () { return +input.value; }, refresh: text };
  };

  SIM.status = function () {
    var el = document.createElement("div");
    el.className = "status";
    el.setAttribute("role", "status");
    return {
      el: el,
      set: function (kind, text) {
        el.className = "status" + (kind ? " status--" + kind : "");
        var icon = { ok: "check", warn: "warn", bad: "bad" }[kind] || "info";
        el.innerHTML = (window.SITE ? SITE.icon(icon) : "") + "<span>" + text + "</span>";
      }
    };
  };

  /* ---------- Werkstatt-Oszi ---------- */
  // spec: { t0, t1 [s], yMin, yMax, yStep [V], xStep [s], traces:[{fn, color, width, dash}],
  //         hlines:[{v, color, dash, label}], light: fn(t)→0..1, legend:[{color, text}] }
  SIM.scope = function (container) {
    var screen = document.createElement("div");
    screen.className = "screen";
    container.appendChild(screen);
    var svg = SIM.el("svg", { role: "img" }, screen);
    var spec = null, W = 0, H = 0, geo = null, cursorLine = null;

    function render() {
      if (!spec) return;
      W = Math.max(200, Math.round(screen.clientWidth - 20));
      var narrow = W < 460;
      H = Math.round(SIM.clamp(W * (spec.ratio || 0.48), spec.minH || 200, spec.maxH || 300));
      var lightH = spec.light ? 16 : 0;
      var m = { l: narrow ? 34 : 42, r: 10, t: narrow ? 32 : 22, b: 24 + lightH + (lightH ? 8 : 0) };
      var pw = W - m.l - m.r, ph = H - m.t - m.b;
      geo = { m: m, pw: pw, ph: ph };
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      svg.setAttribute("width", W);
      svg.setAttribute("height", H);
      svg.setAttribute("aria-label", T(spec.aria || { en: "Oscilloscope", de: "Oszilloskop" }));
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var X = function (t) { return m.l + (t - spec.t0) / (spec.t1 - spec.t0) * pw; };
      var Y = function (v) { return m.t + (spec.yMax - v) / (spec.yMax - spec.yMin) * ph; };
      geo.X = X; geo.Y = Y;
      var g = SIM.el("g", { "font-family": "Fira Code, monospace", "font-size": narrow ? 10 : 11, fill: "#8fb3a6" }, svg);
      // Raster
      for (var v = Math.ceil(spec.yMin / spec.yStep) * spec.yStep; v <= spec.yMax + 1e-9; v += spec.yStep) {
        SIM.el("line", { x1: m.l, x2: m.l + pw, y1: Y(v), y2: Y(v), stroke: Math.abs(v) < 1e-9 ? "#4b7a6b" : "#24453a", "stroke-width": Math.abs(v) < 1e-9 ? 1.4 : 1 }, svg);
        var tx = SIM.el("text", { x: m.l - 6, y: Y(v) + 4, "text-anchor": "end" }, g);
        tx.textContent = (window.SITE ? SITE.num(v, Math.abs(spec.yStep) < 1 ? 1 : 0) : v);
      }
      var step = spec.xStep, every = narrow && (spec.t1 - spec.t0) / step > 6 ? 2 : 1, k = 0;
      for (var t = spec.t0; t <= spec.t1 + 1e-9; t += step, k++) {
        SIM.el("line", { x1: X(t), x2: X(t), y1: m.t, y2: m.t + ph, stroke: "#24453a" }, svg);
        if (k % every === 0) {
          var tt = SIM.el("text", { x: X(t), y: m.t + ph + 15, "text-anchor": "middle" }, g);
          tt.textContent = spec.xFmt ? spec.xFmt(t) : Math.round(t * 1000);
        }
      }
      var ylab = SIM.el("text", { x: 4, y: 14 }, g); ylab.textContent = spec.yUnit || "U / V";
      var xlab = SIM.el("text", { x: W - 4, y: narrow ? 27 : 14, "text-anchor": "end" }, g); xlab.textContent = spec.xUnit || "t / ms";
      // Hilfslinien
      (spec.hlines || []).forEach(function (h) {
        SIM.el("line", { x1: m.l, x2: m.l + pw, y1: Y(h.v), y2: Y(h.v), stroke: h.color, "stroke-width": 1.6, "stroke-dasharray": h.dash || "6 5" }, svg);
        if (h.label) {
          var lt = SIM.el("text", { x: m.l + pw - 4, y: Y(h.v) + (h.below ? 14 : -5), "text-anchor": "end", fill: h.color, stroke: "#0f1d18", "stroke-width": 4, "paint-order": "stroke", "font-family": "Fira Code, monospace", "font-size": narrow ? 10 : 11 }, svg);
          lt.textContent = T(h.label);
        }
      });
      // Kurven
      (spec.traces || []).forEach(function (tr) {
        var n = Math.max(200, Math.round(pw * 1.5)), d = "";
        for (var i = 0; i <= n; i++) {
          var tt2 = spec.t0 + (spec.t1 - spec.t0) * i / n;
          var y = SIM.clamp(Y(tr.fn(tt2)), m.t - 2, m.t + ph + 2);
          d += (i ? "L" : "M") + X(tt2).toFixed(1) + " " + y.toFixed(1);
        }
        SIM.el("path", { d: d, fill: "none", stroke: tr.color, "stroke-width": tr.width || 2.2, "stroke-dasharray": tr.dash || null, "stroke-linejoin": "round", opacity: tr.opacity || 1 }, svg);
      });
      // Lichtband: wann leuchtet die Lampe?
      if (spec.light) {
        var ly = m.t + ph + 22, cols = Math.round(pw / 2);
        SIM.el("rect", { x: m.l, y: ly, width: pw, height: lightH, fill: "#1a2a24", rx: 3 }, svg);
        for (var c = 0; c < cols; c++) {
          var tc = spec.t0 + (spec.t1 - spec.t0) * (c + 0.5) / cols, a = spec.light(tc);
          if (a > 0.01) SIM.el("rect", { x: m.l + c * pw / cols, y: ly, width: pw / cols + 0.6, height: lightH, fill: "#ffc633", opacity: SIM.clamp(a, 0, 1).toFixed(2) }, svg);
        }
        var lt2 = SIM.el("text", { x: m.l - 6, y: ly + 12, "text-anchor": "end", fill: "#ffc633", "font-family": "Fira Code, monospace", "font-size": 10 }, svg);
        lt2.textContent = "💡";
      }
      // Legende
      var lx = m.l + 6;
      (spec.legend || []).forEach(function (l) {
        var txt = T(l.text);
        SIM.el("rect", { x: lx, y: 6, width: 14, height: 4, fill: l.color, rx: 1 }, svg);
        var lt3 = SIM.el("text", { x: lx + 18, y: 12, fill: l.color, "font-family": "Fira Code, monospace", "font-size": narrow ? 10 : 11 }, svg);
        lt3.textContent = txt;
        lx += 30 + txt.length * (narrow ? 6 : 6.7);
      });
      cursorLine = SIM.el("line", { y1: m.t, y2: m.t + ph + lightH + 8, stroke: "#ffffff", "stroke-width": 1.4, opacity: 0, "stroke-dasharray": "3 3" }, svg);
    }

    var ro = window.ResizeObserver ? new ResizeObserver(function () {
      var w = Math.round(screen.clientWidth - 20);
      if (Math.abs(w - W) > 1) render();
    }) : null;
    if (ro) ro.observe(screen); else window.addEventListener("resize", render);
    SIM.onLang(render);

    return {
      el: screen,
      draw: function (s) { spec = s; render(); },
      cursor: function (t) {
        if (!cursorLine || !geo || !spec) return;
        if (t == null) { cursorLine.setAttribute("opacity", 0); return; }
        var x = geo.X(t);
        cursorLine.setAttribute("x1", x); cursorLine.setAttribute("x2", x); cursorLine.setAttribute("opacity", 0.8);
      }
    };
  };

  /* ---------- Schaltzeichen ---------- */
  // Zeichnet in eine feste viewBox. Elemente mit data-seg lassen sich hervorheben.
  SIM.circuit = function (container, w, h, label) {
    var box = document.createElement("div");
    box.className = "circuit";
    container.appendChild(box);
    var svg = SIM.el("svg", { viewBox: "0 0 " + w + " " + h, role: "img" }, box);
    var title = SIM.el("title", null, svg);
    function setTitle() { title.textContent = T(label); }
    setTitle(); SIM.onLang(setTitle);
    var S = "#1d2520";
    var api = {
      svg: svg, el: box,
      g: function (seg) { return SIM.el("g", { "data-seg": seg || null, class: "cseg" }, svg); },
      wire: function (pts, seg) {
        var g = api.g(seg);
        SIM.el("polyline", { points: pts.map(function (p) { return p.join(","); }).join(" "), fill: "none", stroke: S, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round", class: "w" }, g);
        return g;
      },
      dot: function (x, y) { SIM.el("circle", { cx: x, cy: y, r: 3.2, fill: S }, svg); },
      text: function (x, y, txt, opts) {
        var t = SIM.el("text", { x: x, y: y, "font-family": "Fira Code, monospace", "font-size": (opts && opts.size) || 13, fill: (opts && opts.color) || S, "text-anchor": (opts && opts.anchor) || "start", "font-weight": (opts && opts.bold) ? 700 : 400 }, svg);
        t.textContent = txt;
        return t;
      },
      // Diode von Anode (ax,ay) nach Kathode (cx,cy); led = true zeichnet die Lichtpfeile
      diode: function (ax, ay, cx, cy, seg, led) {
        var g = api.g(seg);
        var dx = cx - ax, dy = cy - ay, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
        var mx = (ax + cx) / 2, my = (ay + cy) / 2, s = 11;
        var bx = mx - ux * s / 2, by = my - uy * s / 2, tx = mx + ux * s / 2, ty = my + uy * s / 2;
        SIM.el("line", { x1: ax, y1: ay, x2: bx, y2: by, stroke: S, "stroke-width": 2, class: "w" }, g);
        SIM.el("line", { x1: tx, y1: ty, x2: cx, y2: cy, stroke: S, "stroke-width": 2, class: "w" }, g);
        SIM.el("polygon", { points: [bx + nx * s * 0.8, by + ny * s * 0.8, bx - nx * s * 0.8, by - ny * s * 0.8, tx, ty].join(","), fill: "#fbf8f1", stroke: S, "stroke-width": 2, "stroke-linejoin": "round", class: "w body" }, g);
        SIM.el("line", { x1: tx + nx * s * 0.8, y1: ty + ny * s * 0.8, x2: tx - nx * s * 0.8, y2: ty - ny * s * 0.8, stroke: S, "stroke-width": 2.4, class: "w" }, g);
        if (led) {
          if (nx < -0.5 || ny < -0.5) { nx = -nx; ny = -ny; }   // Lichtpfeile nach rechts bzw. unten – weg vom Kennzeichen
          [-0.25, 0.35].forEach(function (o) {
            var px = mx + ux * s * o + nx * s * 1.1, py = my + uy * s * o + ny * s * 1.1;
            var qx = px + (nx * 0.8 + ux * 0.5) * 12, qy = py + (ny * 0.8 + uy * 0.5) * 12;
            SIM.el("line", { x1: px, y1: py, x2: qx, y2: qy, stroke: S, "stroke-width": 1.6, class: "w" }, g);
            var ax2 = qx - (nx * 0.8 + ux * 0.5) * 5, ay2 = qy - (ny * 0.8 + uy * 0.5) * 5;
            SIM.el("polygon", { points: [qx, qy, ax2 + ux * 2.6, ay2 + uy * 2.6, ax2 - ux * 2.6, ay2 - uy * 2.6].join(","), fill: S, class: "arrow" }, g);
          });
        }
        return g;
      },
      // Widerstand (Rechteck) zwischen zwei Punkten
      resistor: function (ax, ay, cx, cy, seg) {
        var g = api.g(seg);
        var dx = cx - ax, dy = cy - ay, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
        var mx = (ax + cx) / 2, my = (ay + cy) / 2, len = 30, wid = 11;
        SIM.el("line", { x1: ax, y1: ay, x2: mx - ux * len / 2, y2: my - uy * len / 2, stroke: S, "stroke-width": 2, class: "w" }, g);
        SIM.el("line", { x1: mx + ux * len / 2, y1: my + uy * len / 2, x2: cx, y2: cy, stroke: S, "stroke-width": 2, class: "w" }, g);
        var horiz = Math.abs(ux) > Math.abs(uy);
        SIM.el("rect", { x: horiz ? mx - len / 2 : mx - wid / 2, y: horiz ? my - wid / 2 : my - len / 2, width: horiz ? len : wid, height: horiz ? wid : len, fill: "#fbf8f1", stroke: S, "stroke-width": 2, class: "w body" }, g);
        return g;
      },
      // Spannungsquelle: immer Kreis (~ für Wechselspannung, 3~ für Drehstrom)
      source: function (x, y, r, kind, seg) {
        var g = api.g(seg);
        SIM.el("circle", { cx: x, cy: y, r: r, fill: "#fbf8f1", stroke: S, "stroke-width": 2, class: "w body" }, g);
        if (kind === "3~") {
          var t = SIM.el("text", { x: x, y: y + 5, "text-anchor": "middle", "font-family": "Fira Code, monospace", "font-size": 14, fill: S, "font-weight": 700 }, g);
          t.textContent = "3~";
        } else if (kind === "battery") {
          SIM.el("line", { x1: x - 9, y1: y - 3, x2: x + 9, y2: y - 3, stroke: S, "stroke-width": 2 }, g);
          SIM.el("line", { x1: x - 5, y1: y + 4, x2: x + 5, y2: y + 4, stroke: S, "stroke-width": 4 }, g);
        } else {
          var w = r * 0.55;
          SIM.el("path", { d: "M" + (x - w) + " " + y + " q " + (w / 2) + " " + (-w * 1.1) + " " + w + " 0 t " + w + " 0", fill: "none", stroke: S, "stroke-width": 2 }, g);
        }
        return g;
      },
      // Pfade hervorheben: Liste von seg-Namen
      highlight: function (list) {
        Array.prototype.forEach.call(svg.querySelectorAll("[data-seg]"), function (g) {
          g.classList.toggle("on", list.indexOf(g.getAttribute("data-seg")) > -1);
        });
      }
    };
    return api;
  };

  /* ---------- Zeitlupe: Abspielen/Pause + Zeitregler ----------
     getWin(): Länge des Zeitfensters [s]; onTick(t): bei jedem Bild mit dem aktuellen Zeitpunkt */
  SIM.player = function (parent, host, getWin, onTick, seconds, fmt) {
    var st = { playing: !SIM.reduced, t: 0 };
    var wrap = document.createElement("div");
    wrap.className = "sim__play";
    parent.appendChild(wrap);
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "icon-btn";
    wrap.appendChild(btn);
    var slider = SIM.slider(fmt ? fmt.label : { en: "Point in time (slow motion):", de: "Zeitpunkt (Zeitlupe):" }, 0, 1000, 1, 0, function (v) {
      return fmt ? fmt.value(v / 1000 * getWin()) : Math.round(v / 1000 * getWin() * 1000) + " ms";
    }, function (v) { st.playing = false; txt(); st.t = v / 1000 * getWin(); });
    wrap.appendChild(slider.el);
    function txt() {
      btn.setAttribute("aria-pressed", String(st.playing));
      btn.textContent = st.playing ? "❚❚ Pause" : T({ en: "▶ Play", de: "▶ Abspielen" });
    }
    btn.addEventListener("click", function () { st.playing = !st.playing; txt(); });
    txt(); SIM.onLang(txt);
    var visible = true, last = performance.now();
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(host);
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (visible) {
        var w = getWin();
        if (st.playing) {
          st.t = (st.t + dt * w / (seconds || 5)) % w;
          slider.input.value = Math.round(st.t / w * 1000); slider.refresh();
        }
        onTick(st.t, dt);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return { el: wrap, refresh: slider.refresh };
  };

  /* ---------- Bauteilmodelle (Shockley-Gleichung mit Bahnwiderstand) ----------
     Parameter so gewählt, dass die Werte zu den Datenblättern der Bauteil-Ecke passen:
     1N4007 ≈ 0,86 V · 1N5817 ≈ 0,37 V · 1N5819 ≈ 0,45 V · Power-LED ≈ 3,0 V – jeweils bei 0,5 A bzw. 350 mA */
  var VT = 0.02585;
  SIM.PARTS = {
    "1N4007": { Is: 7.03e-9, n: 1.8, Rs: 0.034, urrm: 1000 },
    "1N5817": { Is: 3.17e-5, n: 1.373, Rs: 0.051, urrm: 20 },
    "1N5819": { Is: 5.0e-6, n: 1.4, Rs: 0.06, urrm: 40 },
    "LED": { Is: 2.5e-16, n: 3.09, Rs: 0.6, ur: 5 }
  };
  SIM.uf = function (type, I) {
    var p = SIM.PARTS[type];
    if (!p || I <= 0) return 0;
    return p.n * VT * Math.log(I / p.Is + 1) + p.Rs * I;
  };
})();
