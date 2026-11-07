/* =========================================================================
   Live-Oszilloskop: sendet ein Zeichen an das Display (Adresse 0x27, Write)
   und zeichnet SDA/SCL Schritt für Schritt. Einbindung: <div data-sim="oscilloscope"></div>
   ========================================================================= */
(function () {
  "use strict";
  var host = document.querySelector('[data-sim="oscilloscope"]');
  if (!host || !window.SITE) return;
  var T = SITE.t, both = SITE.both;

  var W = 800, H = 150;                       // logisches Koordinatensystem
  var SDA_H = 30, SDA_L = 60, SCL_H = 100, SCL_L = 130, BIT = 25, X0 = 20;
  var C_SDA = "#3b82f6", C_SCL = "#06b6d4", C_ACK = "#10b981";
  var ADDR = 0x27;

  var CHIPS = [
    { id: "start", label: "START", c: "#eab308", dark: true },
    { id: "addr", label: "ADDR (0x27)", c: "#2563eb" },
    { id: "rw", label: 'READ / <span class="overline">WRITE</span> (0)', c: "#9333ea" },
    { id: "ack1", label: "ACK", c: "#16a34a" },
    { id: "data", label: "DATA", c: "#2563eb" },
    { id: "ack2", label: "ACK", c: "#16a34a" },
    { id: "stop", label: "STOP", c: "#dc2626" }
  ];

  host.innerHTML =
    '<div class="sim-controls" style="display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin-bottom:20px">' +
      '<div class="field" style="width:7.5rem"><label for="osc-char">' + both({ en: "Character", de: "Zeichen" }) + "</label>" +
        '<input class="inp mono" id="osc-char" maxlength="1" value="A" autocomplete="off" style="text-align:center"></div>' +
      '<button type="button" class="btn btn--ghost" id="osc-send"></button>' +
    "</div>" +
    '<div class="osc">' +
      '<div class="osc__top"><b>Visionary ' + both({ en: "Oscilloscope", de: "Oszilloskop" }) + " v2.0</b>" +
        '<div class="osc__ch"><span style="color:' + C_SDA + '">CH1: SDA (2V/div)</span><span style="color:' + C_SCL + '">CH2: SCL (2V/div)</span></div></div>' +
      '<div class="osc__screen"><canvas role="img" aria-label="SDA / SCL"></canvas><div class="osc__idle" aria-live="polite"></div></div>' +
      '<div class="osc__dec"><h4>' + both({ en: "Protocol decoder:", de: "Protokoll-Dekoder:" }) + '</h4><div class="chips">' +
        CHIPS.map(function (c) { return '<span class="chip" style="--c:' + c.c + '">' + c.label + "</span>"; }).join("") +
      "</div></div>" +
    "</div>";

  var canvas = host.querySelector("canvas"), ctx = canvas.getContext("2d");
  var screen = host.querySelector(".osc__screen"), idle = host.querySelector(".osc__idle");
  var chipEls = host.querySelectorAll(".chip"), input = host.querySelector("#osc-char"), sendBtn = host.querySelector("#osc-send");
  var segs = [], run = 0, state = "idle";

  function ch() { var v = input.value || "A"; return v.charAt(0); }
  function hex(n, d) { return "0x" + n.toString(16).toUpperCase().padStart(d || 2, "0"); }
  function updateTexts() {
    var c = ch();
    sendBtn.textContent = T({ en: "Send", de: "Sende" }) + " '" + c + "' (" + hex(c.charCodeAt(0) & 0xff) + ")";
    if (state === "idle") idle.textContent = T({ en: "Waiting for trigger …", de: "Warten auf Trigger …" });
    if (state === "done") idle.textContent = T({ en: "Transmission successful! Ready.", de: "Übertragung erfolgreich! Bereit." });
  }

  /* Zeichnen: alle Linien werden gespeichert, damit bei Größenänderung neu gezeichnet werden kann */
  function size() {
    var r = screen.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    paint();
  }
  function paint() {
    var kx = canvas.width / W, ky = canvas.height / H, dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2 * dpr; ctx.lineCap = "round"; ctx.lineJoin = "round";
    segs.forEach(function (s) {
      ctx.strokeStyle = s[0];
      ctx.beginPath(); ctx.moveTo(s[1] * kx, s[2] * ky);
      for (var i = 3; i < s.length; i += 2) ctx.lineTo(s[i] * kx, s[i + 1] * ky);
      ctx.stroke();
    });
  }
  function line(c, x1, y1, x2, y2) { segs.push([c, x1, y1, x2, y2]); }
  function idleLines() { segs = [[C_SDA, 0, SDA_H, W, SDA_H], [C_SCL, 0, SCL_H, W, SCL_H]]; paint(); }
  function highlight(i, label) {
    chipEls.forEach(function (el, k) {
      el.classList.toggle("is-on", k === i);
      el.classList.toggle("dark", k === i && !!CHIPS[k].dark);
      if (k === i && label) el.innerHTML = label;
    });
  }
  function resetChips() {
    chipEls.forEach(function (el, k) { el.classList.remove("is-on", "dark"); el.innerHTML = CHIPS[k].label; });
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function clock(x) {   // ein SCL-Takt: steigende Flanke bei 20 %, fallende bei 80 %
    line(C_SCL, x, SCL_L, x + BIT * .2, SCL_L);
    line(C_SCL, x + BIT * .2, SCL_L, x + BIT * .2, SCL_H);
    line(C_SCL, x + BIT * .2, SCL_H, x + BIT * .8, SCL_H);
    line(C_SCL, x + BIT * .8, SCL_H, x + BIT * .8, SCL_L);
    line(C_SCL, x + BIT * .8, SCL_L, x + BIT, SCL_L);
  }

  async function send() {
    var id = ++run, c = ch(), val = c.charCodeAt(0) & 0xff;
    function gone() { return id !== run; }
    state = "busy"; idle.style.display = "none";
    segs = []; resetChips();
    var x = X0, sda = SDA_L;
    line(C_SDA, 0, SDA_H, x, SDA_H); line(C_SCL, 0, SCL_H, x, SCL_H);

    // START: SDA fällt, während SCL HIGH ist
    highlight(0);
    line(C_SDA, x, SDA_H, x, SDA_L); line(C_SCL, x, SCL_H, x + BIT / 2, SCL_H);
    line(C_SDA, x, SDA_L, x + BIT / 2, SDA_L);
    x += BIT / 2; line(C_SCL, x, SCL_H, x, SCL_L);
    paint(); await sleep(400); if (gone()) return;

    // ADRESSE 0x27 (MSB zuerst)
    highlight(1);
    for (var i = 6; i >= 0; i--) {
      var y = (ADDR >> i) & 1 ? SDA_H : SDA_L;
      line(C_SDA, x, sda, x + BIT * .2, y); line(C_SDA, x + BIT * .2, y, x + BIT, y); sda = y;
      clock(x); x += BIT; paint(); await sleep(100); if (gone()) return;
    }
    // R/W = 0 (Write)
    highlight(2);
    line(C_SDA, x, sda, x + BIT * .2, SDA_L); line(C_SDA, x + BIT * .2, SDA_L, x + BIT, SDA_L); sda = SDA_L;
    clock(x); x += BIT; paint(); await sleep(300); if (gone()) return;

    // ACK vom Slave (grün)
    async function ack(chip) {
      highlight(chip);
      line(C_SDA, x, sda, x + BIT * .05, sda);
      segs.push([C_ACK, x + BIT * .05, sda, x + BIT * .15, SDA_L, x + BIT, SDA_L]);
      sda = SDA_L; clock(x); x += BIT; paint(); await sleep(400);
    }
    await ack(3); if (gone()) return;

    // DATEN (8 Bit, MSB zuerst)
    highlight(4, "DATA ('" + c.replace(/[<&>"]/g, "") + "' = " + hex(val) + ")");
    for (var b = 7; b >= 0; b--) {
      var yd = (val >> b) & 1 ? SDA_H : SDA_L;
      line(C_SDA, x, sda, x + BIT * .2, yd); line(C_SDA, x + BIT * .2, yd, x + BIT, yd); sda = yd;
      clock(x); x += BIT; paint(); await sleep(100); if (gone()) return;
    }
    await ack(5); if (gone()) return;

    // STOP: SDA steigt, während SCL HIGH ist
    highlight(6);
    line(C_SDA, x, sda, x + BIT * .1, SDA_L); line(C_SDA, x + BIT * .1, SDA_L, x + BIT * .5, SDA_L);
    line(C_SCL, x, SCL_L, x + BIT * .5, SCL_L); line(C_SCL, x + BIT * .5, SCL_L, x + BIT * .5, SCL_H); line(C_SCL, x + BIT * .5, SCL_H, W, SCL_H);
    paint(); await sleep(200); if (gone()) return;
    line(C_SDA, x + BIT * .5, SDA_L, x + BIT, SDA_L); line(C_SDA, x + BIT, SDA_L, x + BIT, SDA_H); line(C_SDA, x + BIT, SDA_H, W, SDA_H);
    paint(); await sleep(1000); if (gone()) return;

    resetChips(); state = "done"; idle.style.display = ""; updateTexts();
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("input", updateTexts);
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });
  document.addEventListener("langchange", updateTexts);
  if ("ResizeObserver" in window) new ResizeObserver(size).observe(screen); else window.addEventListener("resize", size);
  updateTexts(); idleLines(); size();
})();
