/* =========================================================================
   Signal-Simulator (Logic Analyzer): Adresse, R/W, ACK/NACK und Datenbyte
   einstellen, Signalverlauf SCL/SDA wird sofort gezeichnet.
   Einbindung: <div data-sim="logic-analyzer"></div>
   ========================================================================= */
(function () {
  "use strict";
  var host = document.querySelector('[data-sim="logic-analyzer"]');
  if (!host || !window.SITE) return;
  var T = SITE.t, both = SITE.both, icon = SITE.icon;

  function sel(id, opts) {
    return '<select class="inp" id="' + id + '">' + opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + "</option>"; }).join("") + "</select>";
  }
  function hexField(id, label, val) {
    return '<div class="field"><label for="' + id + '">' + label + '</label><div class="field__wrap"><span class="field__prefix">0x</span>' +
      '<input class="inp inp--hex" id="' + id + '" value="' + val + '" maxlength="2" autocomplete="off" spellcheck="false"></div></div>';
  }
  host.innerHTML =
    '<div class="panel">' +
      "<h2 style=\"font-size:1.1rem\">" + both({ en: "Message parameters", de: "Nachrichten-Parameter" }) + "</h2>" +
      '<div class="form-grid">' +
        hexField("la-addr", both({ en: "Address (7-bit hex)", de: "Adresse (7-Bit hex)" }), "50") +
        '<div class="field"><label for="la-rw">' + both({ en: "Operation (R/W)", de: "Operation (R/W)" }) + "</label>" + sel("la-rw", [["0", "Write (0)"], ["1", "Read (1)"]]) + "</div>" +
        '<div class="field"><label for="la-aack">' + both({ en: "Address frame ACK", de: "Adress-Frame ACK" }) + "</label>" + sel("la-aack", [["0", "ACK (Low)"], ["1", "NACK (High)"]]) + "</div>" +
        hexField("la-data", both({ en: "Data (8-bit hex)", de: "Daten (8-Bit hex)" }), "A5") +
        '<div class="field"><label for="la-dack">' + both({ en: "Data frame ACK", de: "Daten-Frame ACK" }) + "</label>" + sel("la-dack", [["0", "ACK (Low)"], ["1", "NACK (High)"]]) + "</div>" +
      "</div>" +
    "</div>" +
    '<div class="panel analyzer">' +
      '<div class="analyzer__head"><h2>' + icon("screen") + both({ en: "Logic analyzer view", de: "Logic-Analyzer-Ansicht" }) + "</h2>" +
        '<button type="button" class="btn btn--ghost btn--small" id="la-png">' + icon("download") + both({ en: "Save as PNG", de: "Als PNG speichern" }) + "</button></div>" +
      '<div class="analyzer__scroll"><canvas role="img" aria-label="SCL / SDA"></canvas></div>' +
      '<p class="analyzer__hint" aria-live="polite">' + icon("info") + "<span></span></p>" +
    "</div>" +
    '<div class="legend"><span><i style="background:#06b6d4;box-shadow:0 0 8px rgba(6,182,212,.6)"></i>SCL (Clock)</span><span><i style="background:#10b981;box-shadow:0 0 8px rgba(16,185,129,.6)"></i>SDA (Data)</span></div>';

  var $ = function (id) { return host.querySelector("#" + id); };
  var canvas = host.querySelector("canvas"), ctx = canvas.getContext("2d"), scroller = host.querySelector(".analyzer__scroll");
  var hint = host.querySelector(".analyzer__hint span");

  /* ---------- Signalfolge erzeugen (Ticks) ---------- */
  function Wave() { this.ticks = []; this.regions = []; }
  Wave.prototype.push = function (scl, sda, label) { this.ticks.push({ scl: scl, sda: sda, label: label || "" }); };
  Wave.prototype.region = function (name, color, a) { this.regions.push({ name: name, color: color, a: a, b: this.ticks.length }); };
  Wave.prototype.idle = function (n) { for (var i = 0; i < n; i++) this.push(1, 1); };
  Wave.prototype.start = function () { this.push(1, 1); this.push(1, 0, "S"); this.push(0, 0); this.push(0, 0); };   // SDA fällt bei SCL HIGH
  Wave.prototype.bit = function (v, label) { this.push(0, v); this.push(1, v, label); this.push(1, v); this.push(0, v); };   // SDA wechselt nur bei SCL LOW
  Wave.prototype.stop = function () { this.push(0, 0); this.push(1, 0); this.push(1, 1, "P"); this.push(1, 1); };          // SDA steigt bei SCL HIGH

  function readHex(el, mask) { var v = parseInt(el.value || "0", 16); return isNaN(v) ? 0 : v & mask; }
  function h2(n) { return "0x" + n.toString(16).toUpperCase().padStart(2, "0"); }

  function build() {
    var addr = readHex($("la-addr"), 0x7f), data = readHex($("la-data"), 0xff);
    var rw = +$("la-rw").value, aNack = +$("la-aack").value, dNack = +$("la-dack").value;
    // Nach einem NACK auf die Adresse bricht der Master mit STOP ab – kein Datenbyte
    $("la-data").disabled = $("la-dack").disabled = !!aNack;

    var w = new Wave(), a;
    w.idle(2);
    a = w.ticks.length; w.start(); w.region("START", "rgba(234,179,8,.15)", a);
    a = w.ticks.length; for (var i = 6; i >= 0; i--) w.bit((addr >> i) & 1, "A" + i); w.region("ADDR (" + h2(addr) + ")", "rgba(59,130,246,.15)", a);
    a = w.ticks.length; w.bit(rw, rw ? "R" : "W̅"); w.region("READ\nW̅R̅I̅T̅E̅", "rgba(168,85,247,.15)", a);
    a = w.ticks.length; w.bit(aNack, aNack ? "N" : "A"); w.region(aNack ? "NACK" : "ACK", aNack ? "rgba(239,68,68,.2)" : "rgba(34,197,94,.2)", a);
    if (!aNack) {
      a = w.ticks.length; for (var j = 7; j >= 0; j--) w.bit((data >> j) & 1, "D" + j); w.region("DATA (" + h2(data) + ")", "rgba(249,115,22,.15)", a);
      a = w.ticks.length; w.bit(dNack, dNack ? "N" : "A"); w.region(dNack ? "NACK" : "ACK", dNack ? "rgba(239,68,68,.2)" : "rgba(34,197,94,.2)", a);
    }
    a = w.ticks.length; w.stop(); w.region("STOP", "rgba(234,179,8,.15)", a);
    w.idle(4);
    draw(w);
    explain(rw, aNack, dNack);
  }

  function explain(rw, aNack, dNack) {
    var t;
    if (aNack) t = { en: "No slave answers at this address (NACK). The master aborts with STOP – no data byte follows.", de: "Unter dieser Adresse antwortet kein Slave (NACK). Der Master bricht mit STOP ab – es folgt kein Datenbyte." };
    else if (!rw && !dNack) t = { en: "Write: the master sends address and data byte. The slave confirms every byte with ACK (SDA LOW).", de: "Schreiben: Der Master sendet Adresse und Datenbyte. Der Slave bestätigt jedes Byte mit ACK (SDA LOW)." };
    else if (!rw) t = { en: "NACK after the data byte: the slave did not accept the byte. The master ends the transfer with STOP.", de: "NACK nach dem Datenbyte: Der Slave hat das Byte nicht angenommen. Der Master beendet die Übertragung mit STOP." };
    else if (dNack) t = { en: "Read: the slave sends the data byte. With NACK the master signals “that was the last byte” and then sends STOP.", de: "Lesen: Der Slave sendet das Datenbyte. Mit NACK signalisiert der Master „das war das letzte Byte“ und sendet danach STOP." };
    else t = { en: "Read: the slave sends the data byte, the master confirms with ACK and would receive another byte. After the last byte the master answers with NACK.", de: "Lesen: Der Slave sendet das Datenbyte, der Master bestätigt mit ACK und würde ein weiteres Byte empfangen. Nach dem letzten Byte antwortet der Master mit NACK." };
    hint.textContent = T(t);
  }

  var last = null;
  function draw(w) {
    last = w;
    var dpr = window.devicePixelRatio || 1;
    var cssW = Math.max(scroller.clientWidth, 800), cssH = 280;
    canvas.style.width = cssW + "px"; canvas.style.height = cssH + "px";
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var mx = 60, n = w.ticks.length, tw = (cssW - mx * 2) / n;
    var SCL_H = 60, SCL_L = 110, SDA_H = 170, SDA_L = 220;

    // Bereiche
    w.regions.forEach(function (r) {
      var xa = mx + r.a * tw, xb = mx + r.b * tw;
      ctx.fillStyle = r.color; ctx.fillRect(xa, 0, xb - xa, cssH);
      ctx.fillStyle = "#94a3b8"; ctx.font = "bold 11px Inter, sans-serif"; ctx.textAlign = "center";
      var lines = r.name.split("\n");
      lines.forEach(function (l, k) { ctx.fillText(l, xa + (xb - xa) / 2, lines.length > 1 ? 16 + k * 12 : 25); });
    });
    // Rasterlinien an den steigenden SCL-Flanken
    ctx.beginPath(); ctx.setLineDash([2, 4]); ctx.strokeStyle = "#334155"; ctx.lineWidth = 1;
    for (var i = 1; i < n; i++) if (w.ticks[i].scl === 1 && w.ticks[i - 1].scl === 0) { var gx = mx + i * tw; ctx.moveTo(gx, 40); ctx.lineTo(gx, cssH - 20); }
    ctx.stroke(); ctx.setLineDash([]);
    // Signale
    function track(key, hi, lo, color) {
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = "round";
      for (var k = 0; k < n; k++) {
        var y = w.ticks[k][key] ? hi : lo, xa = mx + k * tw;
        if (k === 0) ctx.moveTo(xa, y);
        else if ((w.ticks[k - 1][key] ? hi : lo) !== y) ctx.lineTo(xa, y);
        ctx.lineTo(xa + tw, y);
      }
      ctx.stroke();
    }
    track("scl", SCL_H, SCL_L, "#06b6d4");
    track("sda", SDA_H, SDA_L, "#10b981");
    // Bit-Beschriftungen unter SDA
    ctx.font = "12px 'Fira Code', monospace"; ctx.fillStyle = "#f8fafc"; ctx.textAlign = "center";
    w.ticks.forEach(function (t, k) { if (t.label && k % 4 === 1) ctx.fillText(t.label, mx + k * tw + tw, SDA_L + 25); });
    ctx.textAlign = "right"; ctx.font = "bold 14px Inter, sans-serif";
    ctx.fillStyle = "#06b6d4"; ctx.fillText("SCL", mx - 15, SCL_L - 20);
    ctx.fillStyle = "#10b981"; ctx.fillText("SDA", mx - 15, SDA_L - 20);
  }

  ["la-addr", "la-rw", "la-aack", "la-data", "la-dack"].forEach(function (id) {
    $(id).addEventListener("input", build);
    $(id).addEventListener("change", build);
  });
  $("la-png").addEventListener("click", function () {
    var a = document.createElement("a");
    a.download = "i2c_waveform.png"; a.href = canvas.toDataURL("image/png"); a.click();
  });
  document.addEventListener("langchange", build);
  if ("ResizeObserver" in window) new ResizeObserver(function () { if (last) draw(last); }).observe(scroller);
  else window.addEventListener("resize", build);
  build();
})();
