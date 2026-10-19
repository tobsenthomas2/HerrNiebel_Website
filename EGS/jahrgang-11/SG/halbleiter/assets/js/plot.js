/* =========================================================================
   LUMIATECH – kleiner SVG-Diagrammbaukasten für Kennlinien
   Nutzung:
     var c = LT.chart(element, {
       height: function (w) { return w * 0.6; },
       x: { domain: [0, 4.5], ticks: [0, 1, 2, 3, 4], minor: 0.25, label: "U in V" },
       y: { domain: [0, 30], ticks: [0, 10, 20, 30], minor: 2.5, label: "I in mA" },
       draw: function (c) { c.path(points, { class: "series", stroke: "#d3262b" }); },
       hover: function (c, x, y, px, py) { ... }   // optional
     });
     c.render();   // neu zeichnen, z. B. nach Änderung eines Reglers
   Achsen mit unterschiedlichen Maßstäben (z. B. Sperr-/Durchlassbereich):
     x: { map: function (v) { return 0..1 }, invert: function (t) { return v }, ticks: [...] }
   ========================================================================= */
(function () {
  "use strict";
  var LT = (window.LT = window.LT || {});
  var NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function linear(domain) {
    var a = domain[0], b = domain[1];
    return {
      map: function (v) { return (v - a) / (b - a); },
      invert: function (t) { return a + t * (b - a); }
    };
  }

  LT.svg = el;
  /** Formelzeichen mit Index: "U_F" oder "I_F,max" -> SVG-tspan */
  LT.sub = function (str) {
    return String(str).replace(/<sub>(.*?)<\/sub>/g, '<tspan baseline-shift="sub" font-size="75%">$1</tspan>');
  };

  LT.chart = function (container, opts) {
    var wrap = document.createElement("div");
    wrap.className = "chart";
    container.appendChild(wrap);
    var tip = document.createElement("div");
    tip.className = "chart-tip";
    tip.setAttribute("aria-hidden", "true");
    wrap.appendChild(tip);
    var svg = el("svg", { role: "img", "aria-label": opts.ariaLabel || "Diagramm" });
    wrap.insertBefore(svg, tip);

    var m = Object.assign({ t: 18, r: 22, b: 48, l: 56 }, opts.margin || {});
    var xs, ys;
    function scales() {
      xs = opts.x.map ? opts.x : linear(opts.x.domain);
      ys = opts.y.map ? opts.y : linear(opts.y.domain);
    }
    scales();

    var c = {
      svg: svg, wrap: wrap, tip: tip, opts: opts, el: el, width: 0, height: 0, m: m, state: {},
      sx: function (v) { return m.l + xs.map(v) * (c.width - m.l - m.r); },
      sy: function (v) { return c.height - m.b - ys.map(v) * (c.height - m.t - m.b); },
      ix: function (px) { return xs.invert((px - m.l) / (c.width - m.l - m.r)); },
      iy: function (py) { return ys.invert((c.height - m.b - py) / (c.height - m.t - m.b)); },
      inside: function (px, py) { return px >= m.l && px <= c.width - m.r && py >= m.t && py <= c.height - m.b; },
      /** Linienzug aus Datenpunkten [[x,y],…] */
      path: function (pts, attrs, parent) {
        var d = "", pen = false;
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          if (p === null || !isFinite(p[0]) || !isFinite(p[1])) { pen = false; continue; }
          d += (pen ? "L" : "M") + c.sx(p[0]).toFixed(2) + "," + c.sy(p[1]).toFixed(2);
          pen = true;
        }
        return el("path", Object.assign({ d: d }, attrs || {}), parent || c.gData);
      },
      /** Funktion y = f(x) abtasten */
      sample: function (f, x0, x1, n) {
        var pts = [];
        for (var i = 0; i <= n; i++) { var x = x0 + (x1 - x0) * i / n; pts.push([x, f(x)]); }
        return pts;
      },
      text: function (x, y, str, attrs, parent) {
        var t = el("text", Object.assign({ x: x, y: y }, attrs || {}), parent || c.gOver);
        if (String(str).indexOf("<") >= 0) t.innerHTML = LT.sub(str); else t.textContent = str;
        return t;
      },
      showTip: function (html, px, py) {
        tip.innerHTML = html;
        var w = tip.offsetWidth || 120;
        var left = LT.clamp(px, w / 2 + 4, c.width - w / 2 - 4);
        tip.style.left = left + "px";
        tip.style.top = py + "px";
        tip.classList.add("is-visible");
      },
      hideTip: function () { tip.classList.remove("is-visible"); },
      render: render
    };

    function drawAxes() {
      var g = c.gGrid, x0 = m.l, x1 = c.width - m.r, y0 = c.height - m.b, y1 = m.t;
      // Nebenraster
      function minorLines(axis, scale, isX) {
        if (!axis.minor) return;
        var list = axis.minorTicks || (function () {
          var arr = [], d = axis.domain, s = axis.minor;
          for (var v = Math.ceil(d[0] / s) * s; v <= d[1] + 1e-9; v += s) arr.push(+v.toFixed(6));
          return arr;
        })();
        list.forEach(function (v) {
          var p = isX ? c.sx(v) : c.sy(v);
          el("line", isX ? { x1: p, x2: p, y1: y0, y2: y1, class: "grid-line grid-line--minor" } : { x1: x0, x2: x1, y1: p, y2: p, class: "grid-line grid-line--minor" }, g);
        });
      }
      minorLines(opts.x, xs, true);
      minorLines(opts.y, ys, false);
      // Achsen durch den Nullpunkt (falls angegeben), sonst am Rand
      var ax = opts.x.axisAt !== undefined ? c.sy(opts.x.axisAt) : y0;
      var ay = opts.y.axisAt !== undefined ? c.sx(opts.y.axisAt) : x0;
      (opts.x.ticks || []).forEach(function (v) {
        var p = c.sx(v);
        el("line", { x1: p, x2: p, y1: y0, y2: y1, class: "grid-line" }, g);
        var t = el("g", { class: "tick" }, g);
        c.text(p, ax + 18, opts.x.fmt ? opts.x.fmt(v) : LT.num(v, opts.x.digits || 0), { "text-anchor": "middle" }, t);
      });
      (opts.y.ticks || []).forEach(function (v) {
        var p = c.sy(v);
        el("line", { x1: x0, x2: x1, y1: p, y2: p, class: "grid-line" }, g);
        var t = el("g", { class: "tick" }, g);
        c.text(ay - 8, p + 4, opts.y.fmt ? opts.y.fmt(v) : LT.num(v, opts.y.digits || 0), { "text-anchor": "end" }, t);
      });
      el("line", { x1: x0, x2: x1, y1: ax, y2: ax, class: "axis" }, g);
      el("line", { x1: ay, x2: ay, y1: y0, y2: y1, class: "axis" }, g);
      if (opts.x.label) c.text(x1, y0 + 38, opts.x.label, { "text-anchor": "end", class: "axis-label" }, g);
      if (opts.y.label) {
        if (opts.y.labelTop) c.text(ay + 8, y1 + 12, opts.y.label, { "text-anchor": "start", class: "axis-label" }, g);
        else c.text(0, 0, opts.y.label, { class: "axis-label", transform: "translate(" + 14 + "," + (y1 + 4) + ") rotate(-90)", "text-anchor": "end" }, g);
      }
      if (opts.extraLabels) opts.extraLabels(c, g);
    }

    function render() {
      scales();
      var w = Math.max(280, Math.round(wrap.clientWidth || container.clientWidth || 600));
      var h = typeof opts.height === "function" ? opts.height(w) : (opts.height || Math.round(w * 0.6));
      c.width = w; c.height = Math.round(h);
      svg.setAttribute("viewBox", "0 0 " + w + " " + c.height);
      svg.setAttribute("width", w);
      svg.setAttribute("height", c.height);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var defs = el("defs", null, svg);
      var clipId = "clip-" + Math.random().toString(36).slice(2, 8);
      el("rect", { x: m.l, y: m.t - 2, width: w - m.l - m.r, height: c.height - m.t - m.b + 2 }, el("clipPath", { id: clipId }, defs));
      c.defs = defs;
      c.gGrid = el("g", null, svg);
      c.gData = el("g", { "clip-path": "url(#" + clipId + ")" }, svg);
      c.gOver = el("g", null, svg);
      drawAxes();
      if (opts.draw) opts.draw(c);
      if (opts.hover) {
        var hit = el("rect", { x: m.l, y: m.t, width: w - m.l - m.r, height: c.height - m.t - m.b, fill: "transparent", style: "cursor:crosshair" }, svg);
        c.gHover = el("g", { "pointer-events": "none" }, svg);
        function move(e) {
          var r = svg.getBoundingClientRect();
          var px = (e.clientX - r.left) * (w / r.width), py = (e.clientY - r.top) * (c.height / r.height);
          while (c.gHover.firstChild) c.gHover.removeChild(c.gHover.firstChild);
          opts.hover(c, c.ix(px), c.iy(py), px, py);
        }
        hit.addEventListener("pointermove", move);
        hit.addEventListener("pointerdown", move);
        hit.addEventListener("pointerleave", function () {
          while (c.gHover.firstChild) c.gHover.removeChild(c.gHover.firstChild);
          c.hideTip();
          if (opts.leave) opts.leave(c);
        });
      }
    }

    if ("ResizeObserver" in window) {
      var lastW = 0;
      new ResizeObserver(function () {
        var w = Math.round(wrap.clientWidth);
        if (w && Math.abs(w - lastW) > 2) { lastW = w; render(); }
      }).observe(wrap);
    } else {
      window.addEventListener("resize", render);
    }
    render();
    return c;
  };

  /** kleines Legenden-Symbol (Linie mit Strichmuster) */
  LT.legendLine = function (color, dash) {
    return '<svg viewBox="0 0 26 14" aria-hidden="true"><line x1="1" y1="7" x2="25" y2="7" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/></svg>";
  };
})();
