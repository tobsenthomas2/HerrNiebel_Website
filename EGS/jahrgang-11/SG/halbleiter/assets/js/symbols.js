/* =========================================================================
   LUMIATECH – Schaltzeichen nach DIN EN 60617 und Betriebsmittelkennzeichnung
   nach DIN EN 81346-2. Alle Schaltpläne der Website nutzen diese Funktionen.

   Kennbuchstaben auf dieser Website:
     -G  Spannungsquelle          -R  Widerstand und Diode
     -P  Leuchtdiode, Meldeleuchte -M  Motor
     -F  Sicherung                -K  Schaltkontakt (Relais)
   Regel: Kennzeichnung links neben senkrecht gezeichneten Bauteilen,
          oberhalb von waagerecht gezeichneten Bauteilen.

   Platzhalter für fertige Schaltpläne:
     <div data-art="sch-grund-led"></div>        LED mit Vorwiderstand und Zählpfeilen
     <div data-art="sch-beispiel" data-variant="fwd|rev"></div>
     <div data-art="sch-verpol"></div>          Verpolschutz (Kurzform)
   ========================================================================= */
(function () {
  "use strict";
  var LT = (window.LT = window.LT || {});
  var INK = "#17202b", RED = "#c42b2b";
  var SW = 2.5; // Linienstärke Leitungen und Schaltzeichen

  function f(n) { return Math.round(n * 100) / 100; }

  /** Lage eines Bauteils: Matrix für Ausrichtung (Grundform zeigt nach rechts) */
  function matrix(dir, cx, cy) {
    if (dir === "left") return "matrix(-1,0,0,1," + cx + "," + cy + ")";
    if (dir === "down") return "matrix(0,1,-1,0," + cx + "," + cy + ")";
    if (dir === "up") return "matrix(0,-1,-1,0," + cx + "," + cy + ")";
    return "matrix(1,0,0,1," + cx + "," + cy + ")";
  }

  var sym = {};

  /** Leitung (SVG-Pfad) */
  sym.wire = function (d, o) {
    o = o || {};
    return '<path d="' + d + '" fill="none" stroke="' + (o.color || INK) + '" stroke-width="' + (o.w || SW) + '" stroke-linejoin="miter"/>';
  };

  /** Verbindungspunkt */
  sym.dot = function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="4" fill="' + INK + '"/>'; };

  /**
   * Diode / Leuchtdiode (DIN EN 60617-5): Dreieck in Durchlassrichtung,
   * Leitung läuft durch, Querstrich an der Spitze = Kathode.
   * o: cx, cy, dir (right|left|down|up = Richtung der Spitze), s (Größe), led, lead (halbe Leitungslänge), hl (Hinterlegung)
   */
  sym.diode = function (o) {
    var s = o.s || 36, h = s / 2, L = o.lead === undefined ? s * 0.9 : o.lead, col = o.color || INK;
    var out = "";
    if (o.hl) out += '<rect x="' + f(o.cx - s * 0.85) + '" y="' + f(o.cy - s * 0.85) + '" width="' + f(s * 1.7) + '" height="' + f(s * 1.7) + '" rx="' + f(s * 0.25) + '" fill="' + o.hl + '"/>';
    out += '<g transform="' + matrix(o.dir || "right", o.cx, o.cy) + '" stroke="' + col + '" stroke-width="' + SW + '" fill="none">';
    if (L > 0) out += '<line x1="' + f(-L) + '" y1="0" x2="' + f(L) + '" y2="0"/>';
    out += '<path d="M' + f(-h) + " " + f(-h) + " L" + f(h) + " 0 L" + f(-h) + " " + f(h) + ' Z" stroke-linejoin="miter"/>';
    out += '<line x1="' + f(h) + '" y1="' + f(-h) + '" x2="' + f(h) + '" y2="' + f(h) + '"/>';
    if (o.led) {
      // zwei Pfeile für das ausgesendete Licht, oberhalb der Dreiecksflanke
      var dx = -0.652, dy = -0.758, len = s * 0.72, head = s * 0.24;
      var sx0 = -h + s * 0.58, sy0 = -h + h * 0.58 - s * 0.07;
      [[0, 0], [s * 0.22, -s * 0.16]].forEach(function (off) {
        var x0 = sx0 + off[0], y0 = sy0 + off[1];
        var x1 = x0 + dx * len, y1 = y0 + dy * len;
        var bx = x1 - dx * head, by = y1 - dy * head, px = -dy * head * 0.38, py = dx * head * 0.38;
        out += '<line x1="' + f(x0) + '" y1="' + f(y0) + '" x2="' + f(bx) + '" y2="' + f(by) + '" stroke-width="' + (SW * 0.8) + '"/>';
        out += '<path d="M' + f(x1) + " " + f(y1) + " L" + f(bx + px) + " " + f(by + py) + " L" + f(bx - px) + " " + f(by - py) + ' Z" fill="' + col + '" stroke="none"/>';
      });
    }
    return out + "</g>";
  };

  /** Widerstand (Rechteck) */
  sym.resistor = function (o) {
    var len = o.len || 54, wid = o.wid || 20, v = o.vertical !== false;
    var w = v ? wid : len, h = v ? len : wid;
    return '<rect x="' + f(o.cx - w / 2) + '" y="' + f(o.cy - h / 2) + '" width="' + w + '" height="' + h + '" fill="' + (o.fill || "#fff") + '" stroke="' + INK + '" stroke-width="' + SW + '"/>';
  };

  /** Spannungsquelle: Kreis, Strich in Leitungsrichtung, Polarität außen */
  sym.source = function (o) {
    var r = o.r || 22, v = o.vertical !== false, plusFirst = o.plusFirst !== false; // plusFirst: + oben bzw. links
    var s = '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + r + '" fill="#fff" stroke="' + INK + '" stroke-width="' + SW + '"/>';
    s += v ? '<line x1="' + o.cx + '" y1="' + (o.cy - r) + '" x2="' + o.cx + '" y2="' + (o.cy + r) + '" stroke="' + INK + '" stroke-width="' + SW + '"/>'
           : '<line x1="' + (o.cx - r) + '" y1="' + o.cy + '" x2="' + (o.cx + r) + '" y2="' + o.cy + '" stroke="' + INK + '" stroke-width="' + SW + '"/>';
    if (o.signs !== false) {
      var pc = "#d3262b", mc = "#1f5bd8";
      if (v) {
        var py = plusFirst ? o.cy - r * 0.62 : o.cy + r * 0.95, my = plusFirst ? o.cy + r * 0.95 : o.cy - r * 0.62;
        s += '<text x="' + (o.cx + r + 8) + '" y="' + f(py) + '" font-size="17" font-weight="800" fill="' + pc + '">+</text>';
        s += '<text x="' + (o.cx + r + 9) + '" y="' + f(my) + '" font-size="19" font-weight="800" fill="' + mc + '">–</text>';
      } else {
        var px = plusFirst ? o.cx - r * 0.75 : o.cx + r * 0.75, mx = plusFirst ? o.cx + r * 0.75 : o.cx - r * 0.75;
        s += '<text x="' + f(px) + '" y="' + (o.cy + r + 18) + '" text-anchor="middle" font-size="17" font-weight="800" fill="' + pc + '">+</text>';
        s += '<text x="' + f(mx) + '" y="' + (o.cy + r + 18) + '" text-anchor="middle" font-size="19" font-weight="800" fill="' + mc + '">–</text>';
      }
    }
    return s;
  };

  /** Meldeleuchte (Kreis mit Kreuz) */
  sym.lamp = function (o) {
    var r = o.r || 18, k = r * 0.707;
    var s = "";
    if (o.lit) s += '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + (r * 2.6) + '" fill="url(#lt-glow)"/>';
    s += '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + r + '" fill="' + (o.lit ? "#fff6cf" : "#fff") + '" stroke="' + INK + '" stroke-width="' + SW + '"/>';
    s += '<path d="M' + f(o.cx - k) + " " + f(o.cy - k) + " L" + f(o.cx + k) + " " + f(o.cy + k) + " M" + f(o.cx + k) + " " + f(o.cy - k) + " L" + f(o.cx - k) + " " + f(o.cy + k) + '" stroke="' + INK + '" stroke-width="' + SW + '"/>';
    return s;
  };

  /** Gleichstrommotor: Kreis mit M und Gleichstromzeichen */
  sym.motor = function (o) {
    var r = o.r || 30;
    var s = '<circle cx="' + o.cx + '" cy="' + o.cy + '" r="' + r + '" fill="#fff" stroke="' + INK + '" stroke-width="' + SW + '"/>';
    s += '<text x="' + o.cx + '" y="' + f(o.cy + r * 0.22) + '" text-anchor="middle" font-size="' + f(r * 0.85) + '" font-weight="800" fill="' + INK + '">M</text>';
    var y = o.cy + r * 0.48, w = r * 0.5;
    s += '<line x1="' + f(o.cx - w) + '" y1="' + f(y) + '" x2="' + f(o.cx + w) + '" y2="' + f(y) + '" stroke="' + INK + '" stroke-width="2"/>';
    s += '<line x1="' + f(o.cx - w) + '" y1="' + f(y + 5) + '" x2="' + f(o.cx + w) + '" y2="' + f(y + 5) + '" stroke="' + INK + '" stroke-width="2" stroke-dasharray="' + f(w * 0.5) + " " + f(w * 0.25) + '"/>';
    return s;
  };

  /** Sicherung: Rechteck, Leitung durchgezogen */
  sym.fuse = function (o) {
    var len = o.len || 46, wid = o.wid || 18, v = !!o.vertical;
    var w = v ? wid : len, h = v ? len : wid;
    var s = '<rect x="' + f(o.cx - w / 2) + '" y="' + f(o.cy - h / 2) + '" width="' + w + '" height="' + h + '" fill="#fff" stroke="' + INK + '" stroke-width="' + SW + '"/>';
    if (o.blown) s += v ? "" : '<path d="M' + f(o.cx - len / 2 + 4) + " " + f(o.cy - 4) + " l8 8 l8 -8 l8 8 l8 -8 l8 8" + '" fill="none" stroke="' + RED + '" stroke-width="2.2"/>';
    else s += v ? '<line x1="' + o.cx + '" y1="' + f(o.cy - h / 2) + '" x2="' + o.cx + '" y2="' + f(o.cy + h / 2) + '" stroke="' + INK + '" stroke-width="1.6"/>'
               : '<line x1="' + f(o.cx - w / 2) + '" y1="' + o.cy + '" x2="' + f(o.cx + w / 2) + '" y2="' + o.cy + '" stroke="' + INK + '" stroke-width="1.6"/>';
    return s;
  };

  /**
   * Betriebsmittelkennzeichnung mit optionalem Wert.
   * o: x, y (Bezugspunkt = Bauteilmitte), side ("left" | "top"), gap (Abstand), name ("-R1"), value ("1 kΩ"), extra (dritte Zeile)
   */
  sym.bmk = function (o) {
    var lines = [{ t: o.name, w: 750, c: INK, fs: 14 }];
    if (o.value) lines.push({ t: o.value, w: 500, c: "#4a5563", fs: 12.5 });
    if (o.extra) lines.push({ t: o.extra, w: 650, c: o.extraColor || "#8a6400", fs: 12 });
    var s = "", lh = 15.5;
    if ((o.side || "left") === "left") {
      var x = o.x - (o.gap || 22), y0 = o.y - ((lines.length - 1) * lh) / 2 + 5;
      lines.forEach(function (l, i) { s += '<text x="' + f(x) + '" y="' + f(y0 + i * lh) + '" text-anchor="end" font-size="' + l.fs + '" font-weight="' + l.w + '" fill="' + l.c + '">' + l.t + "</text>"; });
    } else {
      var yb = o.y - (o.gap || 22) - (lines.length - 1) * lh;
      lines.forEach(function (l, i) { s += '<text x="' + f(o.x) + '" y="' + f(yb + i * lh) + '" text-anchor="middle" font-size="' + l.fs + '" font-weight="' + l.w + '" fill="' + l.c + '">' + l.t + "</text>"; });
    }
    return s;
  };

  /** Zählpfeil (Spannung rot, Strom auf der Leitung) */
  sym.arrow = function (o) {
    var x1 = o.x1, y1 = o.y1, x2 = o.x2, y2 = o.y2, col = o.color || RED;
    var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, hd = 11;
    var bx = x2 - ux * hd, by = y2 - uy * hd;
    var s = '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(bx) + '" y2="' + f(by) + '" stroke="' + col + '" stroke-width="2.5"/>';
    s += '<path d="M' + f(x2) + " " + f(y2) + " L" + f(bx - uy * 5.5) + " " + f(by + ux * 5.5) + " L" + f(bx + uy * 5.5) + " " + f(by - ux * 5.5) + ' Z" fill="' + col + '"/>';
    if (o.label) s += '<text x="' + f(o.lx) + '" y="' + f(o.ly) + '" text-anchor="' + (o.anchor || "start") + '" font-size="16" font-weight="700" fill="' + col + '">' + o.label + "</text>";
    return s;
  };

  /** Index für Formelzeichen in SVG-Text */
  sym.idx = function (main, sub) { return main + '<tspan baseline-shift="sub" font-size="72%">' + sub + "</tspan>"; };

  /** gemeinsame Definitionen (Leuchten) */
  sym.defs = '<defs><radialGradient id="lt-glow"><stop offset="0" stop-color="#ffc400" stop-opacity=".85"/><stop offset="1" stop-color="#ffc400" stop-opacity="0"/></radialGradient></defs>';

  LT.sym = sym;

  /* ---------- fertige Schaltzeichen-Abbildungen ---------- */
  LT.artSymbol = function (o) {
    o = o || {};
    var led = o.type === "led";
    var s = '<svg class="art-sym" viewBox="0 0 240 130" role="img" aria-label="Schaltzeichen ' + (led ? "Leuchtdiode" : "Diode") + ' mit Anode und Kathode">';
    s += sym.wire("M20 74 H220");
    s += sym.diode({ cx: 120, cy: 74, s: 44, dir: "right", led: led, lead: 0 });
    s += sym.bmk({ x: 120, y: 74, side: "top", gap: led ? 58 : 34, name: led ? "-P1" : "-R1" });
    s += '<text x="20" y="62" font-size="15" font-weight="700" fill="' + INK + '">A</text>';
    s += '<text x="220" y="62" text-anchor="end" font-size="15" font-weight="700" fill="' + INK + '">K</text>';
    s += '<text x="20" y="112" font-size="12.5" fill="#4a5563">Anode</text><text x="220" y="112" text-anchor="end" font-size="12.5" fill="#4a5563">Kathode</text>';
    return s + "</svg>";
  };

  /** Grundschaltung LED mit Vorwiderstand und Zählpfeilen */
  function schGrundLED() {
    var s = '<svg viewBox="0 0 440 330" role="img" aria-label="Grundschaltung: Spannungsquelle -G1, Vorwiderstand -R1 und Leuchtdiode -P1 in Reihe, mit Zählpfeilen für U b, U RV, U F und I F">';
    s += sym.wire("M120 141 V50 H320 V275 H120 V189");
    s += sym.source({ cx: 120, cy: 165 });
    s += sym.bmk({ x: 120, y: 165, gap: 34, name: "-G1", value: "U<tspan baseline-shift='sub' font-size='72%'>b</tspan>" });
    s += sym.resistor({ cx: 320, cy: 112 });
    s += sym.bmk({ x: 320, y: 112, name: "-R1", value: "R<tspan baseline-shift='sub' font-size='72%'>V</tspan>" });
    s += sym.diode({ cx: 320, cy: 205, s: 34, dir: "down", led: true, lead: 0 });
    s += sym.bmk({ x: 320, y: 205, gap: 28, name: "-P1" });
    s += sym.arrow({ x1: 172, y1: 128, x2: 172, y2: 204, label: sym.idx("U", "b"), lx: 184, ly: 172 });
    s += sym.arrow({ x1: 372, y1: 86, x2: 372, y2: 140, label: sym.idx("U", "RV"), lx: 384, ly: 118 });
    s += sym.arrow({ x1: 384, y1: 186, x2: 384, y2: 226, label: sym.idx("U", "F"), lx: 396, ly: 211 });
    s += sym.arrow({ x1: 320, y1: 238, x2: 320, y2: 262 });
    s += '<text x="300" y="258" text-anchor="end" font-size="16" font-weight="700" fill="' + RED + '">' + sym.idx("I", "F") + "</text>";
    return s + "</svg>";
  }

  /** Rechenbeispiel Reihenschaltung: Quelle, Widerstand, Diode (Durchlass- oder Sperrrichtung) */
  function schBeispiel(fwd) {
    var s = '<svg viewBox="0 0 420 300" role="img" aria-label="Beispiel: Quelle -G1 5 V, Widerstand -R1 1 Kiloohm und Diode -R2 in ' + (fwd ? "Durchlassrichtung" : "Sperrrichtung") + '">';
    s += sym.wire("M110 126 V50 H300 V250 H110 V174");
    s += sym.source({ cx: 110, cy: 150 });
    s += sym.bmk({ x: 110, y: 150, gap: 34, name: "-G1", value: "5 V" });
    s += sym.resistor({ cx: 300, cy: 110 });
    s += sym.bmk({ x: 300, y: 110, name: "-R1", value: "1 kΩ" });
    s += sym.diode({ cx: 300, cy: 196, s: 34, dir: fwd ? "down" : "up", lead: 0 });
    s += sym.bmk({ x: 300, y: 196, gap: 28, name: "-R2", value: "Si-Diode" });
    if (fwd) {
      s += sym.arrow({ x1: 340, y1: 92, x2: 340, y2: 128, color: "#e0a100" });
      s += '<text x="352" y="116" font-size="15" font-weight="700" fill="#8a6400">I</text>';
    } else {
      s += '<text x="342" y="116" font-size="14" font-weight="700" fill="#6b7684">I = 0</text>';
    }
    return s + "</svg>";
  }

  /** Verpolschutz (Kurzform für die Startseite) */
  function schVerpol() {
    var s = '<svg viewBox="0 0 440 280" role="img" aria-label="Verpolschutz: Spannungsquelle -G1, Diode -R1 in Reihe und Gleichstrommotor -M1">';
    s += sym.wire("M90 116 V60 H360 V108 M360 172 V230 H90 V164");
    s += sym.source({ cx: 90, cy: 140, r: 24 });
    s += sym.bmk({ x: 90, y: 140, gap: 36, name: "-G1" });
    s += sym.diode({ cx: 225, cy: 60, s: 38, dir: "right", lead: 0 });
    s += sym.bmk({ x: 225, y: 60, side: "top", gap: 30, name: "-R1" });
    s += sym.motor({ cx: 360, cy: 140, r: 32 });
    s += sym.bmk({ x: 360, y: 140, gap: 44, name: "-M1" });
    s += '<path d="M404 122 a26 26 0 0 1 0 36" fill="none" stroke="#14873d" stroke-width="3"/><path d="M404 160 l-8 -2 l6 -8z" fill="#14873d"/>';
    return s + "</svg>";
  }

  function mount() {
    LT.$$("[data-art]").forEach(function (n) {
      var t = n.getAttribute("data-art");
      if (t === "sym-diode") n.innerHTML = LT.artSymbol({ type: "diode" });
      else if (t === "sym-led") n.innerHTML = LT.artSymbol({ type: "led" });
      else if (t === "sch-grund-led") n.innerHTML = schGrundLED();
      else if (t === "sch-beispiel") n.innerHTML = schBeispiel(n.getAttribute("data-variant") !== "rev");
      else if (t === "sch-verpol") n.innerHTML = schVerpol();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
