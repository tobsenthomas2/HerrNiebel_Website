/* =========================================================================
   LUMIATECH – Produktzeichnungen (SVG), an einer Stelle gepflegt.
   Platzhalter im HTML:  <div data-art="led" data-color="red" data-dims="true"></div>
   Verfügbar: led, diode, tower (Schaltzeichen und Schaltpläne: symbols.js)
   ========================================================================= */
(function () {
  "use strict";
  var LT = (window.LT = window.LT || {});
  var uid = 0;

  var LED_COLORS = {
    red:   { lens: "#e8463f", glow: "#ff3b2f", chip: "#fff1e8", name: "Rot" },
    green: { lens: "#2fb85a", glow: "#3ff07a", chip: "#f0fff3", name: "Grün" },
    blue:  { lens: "#3f7bff", glow: "#4d8bff", chip: "#eef4ff", name: "Blau" },
    clear: { lens: "#c9d3dd", glow: "#ffffff", chip: "#ffffff", name: "klar" }
  };
  LT.LED_COLORS = LED_COLORS;

  function dim(x1, y1, x2, y2, label, opts) {
    opts = opts || {};
    var vertical = x1 === x2;
    var s = '<g class="dim" stroke="#6b7684" fill="#6b7684" font-size="12.5" font-family="inherit">';
    s += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke-width="1"/>';
    if (vertical) {
      s += '<path d="M' + x1 + "," + y1 + "l-3.5,8h7z M" + x2 + "," + y2 + 'l-3.5,-8h7z" stroke="none"/>';
      s += '<text x="' + (x1 + 9) + '" y="' + ((y1 + y2) / 2 + 4) + '" stroke="none">' + label + "</text>";
    } else {
      s += '<path d="M' + x1 + "," + y1 + "l8,-3.5v7z M" + x2 + "," + y2 + 'l-8,-3.5v7z" stroke="none"/>';
      s += '<text x="' + ((x1 + x2) / 2) + '" y="' + (y1 + (opts.below ? 16 : -7)) + '" text-anchor="middle" stroke="none">' + label + "</text>";
    }
    return s + "</g>";
  }

  /** 5-mm-LED (T-1 3/4) – Seitenansicht mit innerem Aufbau */
  LT.artLED = function (o) {
    o = o || {};
    var c = LED_COLORS[o.color || "red"];
    var id = "led" + (++uid);
    var lit = o.lit !== false;
    var s = '<svg class="art-led" viewBox="0 0 300 470" role="img" aria-label="' + (o.label || "5-mm-LED, Seitenansicht mit innerem Aufbau") + '">';
    s += "<defs>" +
      '<radialGradient id="' + id + 'g" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="' + c.glow + '" stop-opacity=".85"/><stop offset=".35" stop-color="' + c.glow + '" stop-opacity=".35"/><stop offset="1" stop-color="' + c.glow + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'l" x1="0" x2="1"><stop offset="0" stop-color="' + c.lens + '" stop-opacity=".55"/><stop offset=".45" stop-color="' + c.lens + '" stop-opacity=".28"/><stop offset="1" stop-color="' + c.lens + '" stop-opacity=".6"/></linearGradient>' +
      '<linearGradient id="' + id + 'm" x1="0" x2="1"><stop offset="0" stop-color="#9aa5b1"/><stop offset=".5" stop-color="#e3e8ed"/><stop offset="1" stop-color="#8d98a5"/></linearGradient>' +
      "</defs>";
    // Leuchten
    s += '<circle class="led-glow" cx="140" cy="104" r="' + (lit ? 120 : 0) + '" fill="url(#' + id + 'g)" style="transition:r .4s"/>';
    // Anschlussbeine
    s += '<rect x="122.5" y="120" width="9" height="300" rx="1.5" fill="url(#' + id + 'm)"/>';  // Kathode (kürzer)
    s += '<rect x="168.5" y="112" width="9" height="338" rx="1.5" fill="url(#' + id + 'm)"/>';  // Anode (länger)
    // Kathode innen: großer Träger mit Reflektorwanne
    s += '<path d="M112 104 L120 124 L134 124 L134 132 L122.5 132 L122.5 196 L131.5 196 L131.5 132 L131.5 124 L160 124 L168 104 L156 104 L151 116 L129 116 L124 104 Z" fill="url(#' + id + 'm)" stroke="#5d6875" stroke-width="1"/>';
    // Anode innen: kleiner Pfosten
    s += '<path d="M166 112 h14 v10 h-2.5 v74 h-9 v-74 h-2.5z" fill="url(#' + id + 'm)" stroke="#5d6875" stroke-width="1"/>';
    // Chip
    s += '<rect class="led-chip" x="134" y="108" width="12" height="8" rx="1" fill="' + (lit ? c.chip : "#7d6a5a") + '" stroke="#3a3f46" stroke-width=".8"/>';
    // Bonddraht
    s += '<path d="M140 108 C 142 86, 168 86, 173 112" fill="none" stroke="#c9a227" stroke-width="1.6"/>';
    // Linse / Gehäuse
    s += '<path d="M105 85 A45 45 0 0 1 195 85 L195 177 L202 177 L202 195 L103 195 L103 177 L105 177 Z" fill="url(#' + id + 'l)" stroke="' + c.lens + '" stroke-opacity=".9" stroke-width="1.5"/>';
    s += '<path d="M118 70 A34 34 0 0 1 150 48" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="5" stroke-linecap="round"/>';
    s += '<path d="M116 92 L116 165" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>';
    // abgeflachte Seite (Kathode) angedeutet
    s += '<line x1="103" y1="177" x2="103" y2="195" stroke="#17202b" stroke-width="2.5"/>';
    if (o.dims) {
      s += dim(105, 22, 195, 22, "Ø 5,0");
      s += dim(238, 40, 238, 195, "8,6");
      s += '<line x1="196" y1="40" x2="246" y2="40" stroke="#6b7684" stroke-dasharray="3 3"/><line x1="203" y1="195" x2="246" y2="195" stroke="#6b7684" stroke-dasharray="3 3"/>';
      s += dim(127, 462, 173, 462, "2,54", { below: false });
      s += '<text x="127" y="440" text-anchor="middle" font-size="13" font-weight="700" fill="#17202b">K</text>';
      s += '<text x="195" y="446" font-size="13" font-weight="700" fill="#17202b">A</text>';
    }
    return s + "</svg>";
  };

  /** Glasdiode im Gehäuse DO-7 (BAY 44) – liegend */
  LT.artDiode = function (o) {
    o = o || {};
    var id = "dio" + (++uid);
    var s = '<svg class="art-diode" viewBox="0 0 520 190" role="img" aria-label="Silizium-Diode im Glasgehäuse DO-7 mit Kathodenring">';
    s += "<defs>" +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9f3f1"/><stop offset=".25" stop-color="#ffffff"/><stop offset=".6" stop-color="#cfe2de"/><stop offset="1" stop-color="#a9c6c0"/></linearGradient>' +
      '<linearGradient id="' + id + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7b0ba"/><stop offset=".45" stop-color="#eef1f4"/><stop offset="1" stop-color="#8b96a3"/></linearGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b08a4a"/><stop offset=".5" stop-color="#e4c78e"/><stop offset="1" stop-color="#94703a"/></linearGradient>' +
      "</defs>";
    // Anschlussdrähte
    s += '<rect x="20" y="91" width="190" height="8" rx="2" fill="url(#' + id + 'w)"/>';
    s += '<rect x="310" y="91" width="190" height="8" rx="2" fill="url(#' + id + 'w)"/>';
    // Glaskörper (7,3 mm × 2,6 mm, 1 mm ≈ 14 px)
    s += '<rect x="200" y="74" width="120" height="42" rx="12" fill="url(#' + id + 'g)" stroke="#7c9b95" stroke-width="1.2"/>';
    // innere Anschlussstücke und Kristall
    s += '<rect x="214" y="84" width="36" height="22" rx="3" fill="url(#' + id + 's)"/>';
    s += '<rect x="270" y="84" width="36" height="22" rx="3" fill="url(#' + id + 's)"/>';
    s += '<rect x="252" y="88" width="10" height="14" fill="#4b5563"/>';
    s += '<path d="M262 95 C 265 90, 268 90, 270 95" fill="none" stroke="#6b7684" stroke-width="1.5"/>';
    // Kathodenring
    s += '<rect x="204" y="74" width="12" height="42" fill="#17202b"/>';
    s += '<path d="M206 80 h110" stroke="#fff" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/>';
    if (o.dims !== false) {
      s += dim(200, 50, 320, 50, "7,3 max.");
      s += '<line x1="200" y1="56" x2="200" y2="72" stroke="#6b7684"/><line x1="320" y1="56" x2="320" y2="72" stroke="#6b7684"/>';
      s += dim(352, 74, 352, 116, "Ø 2,6 max.");
      s += '<line x1="322" y1="74" x2="360" y2="74" stroke="#6b7684" stroke-dasharray="3 3"/><line x1="322" y1="116" x2="360" y2="116" stroke="#6b7684" stroke-dasharray="3 3"/>';
      s += '<path d="M210 120 L190 150" stroke="#17202b" stroke-width="1.2"/><text x="186" y="166" text-anchor="end" font-size="14" font-weight="650" fill="#17202b">Kathodenring</text>';
      s += '<text x="22" y="80" font-size="14" font-weight="700" fill="#17202b">K</text><text x="498" y="80" text-anchor="end" font-size="14" font-weight="700" fill="#17202b">A</text>';
    }
    return s + "</svg>";
  };

  /** Signalsäule – Zustände {red:true, green:false, blue:false} oder Helligkeit 0..1 */
  LT.artTower = function (o) {
    o = o || {};
    var st = o.states || { red: 1, green: 1, blue: 1 };
    var id = "tw" + (++uid);
    var seg = [["red", "#d3262b", "#ff4a3d"], ["green", "#14873d", "#3ff07a"], ["blue", "#1f5bd8", "#5b95ff"]];
    var s = '<svg class="art-tower" viewBox="0 0 200 420" role="img" aria-label="Signalsäule mit roter, grüner und blauer Leuchte">';
    s += "<defs>";
    seg.forEach(function (g) {
      s += '<radialGradient id="' + id + g[0] + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="' + g[2] + '" stop-opacity=".9"/><stop offset="1" stop-color="' + g[2] + '" stop-opacity="0"/></radialGradient>';
    });
    s += '<linearGradient id="' + id + 'b" x1="0" x2="1"><stop offset="0" stop-color="#1f2833"/><stop offset=".5" stop-color="#4b5563"/><stop offset="1" stop-color="#1f2833"/></linearGradient>';
    s += "</defs>";
    seg.forEach(function (g, i) {
      var v = +st[g[0]] || 0, y = 46 + i * 84;
      if (v > 0) s += '<ellipse cx="100" cy="' + (y + 40) + '" rx="' + (70 + 30 * v) + '" ry="' + (50 + 20 * v) + '" fill="url(#' + id + g[0] + ')" opacity="' + (0.25 + 0.75 * v) + '"/>';
    });
    s += '<path d="M62 46 Q62 18 100 16 Q138 18 138 46 Z" fill="url(#' + id + 'b)"/>';
    seg.forEach(function (g, i) {
      var v = +st[g[0]] || 0, y = 46 + i * 84;
      s += '<rect x="62" y="' + y + '" width="76" height="80" fill="' + g[1] + '" opacity="' + (0.35 + 0.65 * v) + '"/>';
      if (v > 0) s += '<rect x="62" y="' + y + '" width="76" height="80" fill="' + g[2] + '" opacity="' + (0.85 * v) + '"/>';
      for (var k = 0; k < 5; k++) s += '<line x1="' + (70 + k * 15) + '" y1="' + (y + 4) + '" x2="' + (70 + k * 15) + '" y2="' + (y + 76) + '" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>';
      s += '<rect x="60" y="' + (y + 80) + '" width="80" height="4" fill="#2b3440"/>';
    });
    s += '<rect x="58" y="298" width="84" height="34" rx="3" fill="url(#' + id + 'b)"/>';
    s += '<rect x="92" y="332" width="16" height="70" fill="#4b5563"/><rect x="66" y="400" width="68" height="10" rx="2" fill="#2b3440"/>';
    return s + "</svg>";
  };

  function mount() {
    LT.$$("[data-art]").forEach(function (n) {
      var t = n.getAttribute("data-art");
      if (t === "led") n.innerHTML = LT.artLED({ color: n.getAttribute("data-color") || "red", dims: n.getAttribute("data-dims") === "true", lit: n.getAttribute("data-lit") !== "false" });
      else if (t === "diode") n.innerHTML = LT.artDiode({ dims: n.getAttribute("data-dims") !== "false" });
      else if (t === "tower") n.innerHTML = LT.artTower({ states: JSON.parse(n.getAttribute("data-states") || '{"red":1,"green":1,"blue":1}') });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
