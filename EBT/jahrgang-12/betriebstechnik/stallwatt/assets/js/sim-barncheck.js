/* =========================================================================
   sim-barncheck.js – Stall-Check: Ist die Wärmequelle für den Stall geeignet?
   Platzhalter: <div data-sim="barncheck"></div>
   ========================================================================= */
(function () {
  "use strict";
  function T(o) { return window.SITE ? SITE.t(o) : o.de; }

  var SRC = {
    lamp: { en: "Infrared lamp in a lampholder", de: "Infrarotlampe in einer Fassung", min: 60, radiant: true },
    r250: { en: "SW-R250", de: "SW-R250", min: 60, radiant: true, fixed: true },
    d150: { en: "SW-D150", de: "SW-D150", min: 50, radiant: true, fixed: true },
    p60: { en: "SW-P60", de: "SW-P60", min: 0, radiant: false, fixed: true }
  };

  function init(host) {
    var s = { src: "r250", guard: "yes", ip: "44", holder: "250", hang: "chain", dist: 80 };   /* Start: zulässige Anordnung – die vorgefundene Situation geben die SuS selbst ein */

    function seg(key, opts) {
      return '<div class="seg">' + opts.map(function (o) {
        return '<button type="button" data-k="' + key + '" data-v="' + o[0] + '" aria-pressed="' + (s[key] === o[0]) + '">' + T(o[1]) + "</button>";
      }).join("") + "</div>";
    }
    function field(label, inner) { return "<fieldset><legend>" + T(label) + "</legend>" + inner + "</fieldset>"; }

    function controls() {
      var d = SRC[s.src], h = field({ en: "Heat source", de: "Wärmequelle" }, seg("src", Object.keys(SRC).map(function (k) { return [k, SRC[k]]; })));
      if (s.src === "lamp") {
        h += field({ en: "Guard", de: "Schutzkorb" }, seg("guard", [["no", { en: "none", de: "keiner" }], ["yes", { en: "fitted", de: "vorhanden" }]]));
        h += field({ en: "Protection rating of the lampholder", de: "Schutzart der Fassung" }, seg("ip", [["20", { en: "IP20", de: "IP20" }], ["44", { en: "IP44", de: "IP44" }]]));
        h += field({ en: "Lampholder rated for", de: "Fassung zugelassen bis" }, seg("holder", [["60", { en: "60 W", de: "60 W" }], ["250", { en: "250 W", de: "250 W" }]]));
      }
      if (d.radiant) {
        h += field({ en: "Suspension", de: "Aufhängung" }, seg("hang", [["string", { en: "string", de: "Schnur" }], ["cable", { en: "by the cable", de: "an der Leitung" }], ["chain", { en: "chain + safety catch", de: "Kette + Fangsicherung" }]]));
        h += '<label class="range"><span>' + T({ en: "Distance to the litter", de: "Abstand zur Einstreu" }) + '</span><output data-o="dist">' + s.dist + ' cm</output><input type="range" data-r="dist" min="20" max="120" step="5" value="' + s.dist + '"></label>';
      }
      return h;
    }

    function picture(bad) {
      var d = SRC[s.src], floor = 150;
      if (!d.radiant) {
        return '<svg viewBox="0 0 460 180" role="img" aria-label="' + T({ en: "Brooder plate on the litter", de: "Wärmeplatte auf der Einstreu" }) + '">' +
          '<rect x="0" y="' + floor + '" width="460" height="30" fill="#d9c27a"/>' +
          '<rect x="150" y="104" width="160" height="14" rx="4" fill="#f1b53a" stroke="#b9831a" stroke-width="2"/>' +
          '<rect x="158" y="118" width="6" height="32" fill="#8c939d"/><rect x="296" y="118" width="6" height="32" fill="#8c939d"/>' +
          '<ellipse cx="200" cy="140" rx="12" ry="9" fill="#f6c945"/><ellipse cx="232" cy="141" rx="12" ry="9" fill="#f6c945"/><ellipse cx="262" cy="140" rx="12" ry="9" fill="#f6c945"/>' +
          '<text x="230" y="92" font-size="13" text-anchor="middle" fill="#2c7d47" font-weight="700">max. 55 °C</text></svg>';
      }
      var y = floor - s.dist * 1.05, col = bad ? "#b8322a" : "#2c7d47";
      var hang = s.hang === "chain" ? 'stroke="#555" stroke-width="3" stroke-dasharray="2 3"' : (s.hang === "cable" ? 'stroke="#111" stroke-width="4"' : 'stroke="#c9b27a" stroke-width="2" stroke-dasharray="6 3"');
      var guard = (d.fixed || s.guard === "yes") ? '<path d="M196 ' + y + 'c0 22 16 30 34 30s34-8 34-30" fill="none" stroke="#6b7280" stroke-width="2.5"/><path d="M214 ' + (y + 4) + 'v22M230 ' + (y + 6) + 'v24M246 ' + (y + 4) + 'v22" stroke="#6b7280" stroke-width="1.6"/>' : "";
      return '<svg viewBox="0 0 460 180" role="img" aria-label="' + T({ en: "Heat source above the litter", de: "Wärmequelle über der Einstreu" }) + '">' +
        '<rect x="0" y="0" width="460" height="8" fill="#3a2a1f"/>' +
        '<line x1="230" y1="8" x2="230" y2="' + (y - 34) + '" ' + hang + "/>" +
        '<rect x="220" y="' + (y - 34) + '" width="20" height="14" rx="3" fill="#2b2f36"/>' +
        '<path d="M214 ' + (y - 20) + 'h32l12 20h-56z" fill="#c9ced6" stroke="#8c939d" stroke-width="2"/>' +
        '<ellipse cx="230" cy="' + y + '" rx="28" ry="6" fill="' + (s.src === "d150" ? "#3a3f47" : "#ff5a2a") + '"/>' + guard +
        '<rect x="0" y="' + floor + '" width="460" height="30" fill="#d9c27a"/>' +
        '<line x1="300" y1="' + y + '" x2="300" y2="' + floor + '" stroke="' + col + '" stroke-width="2"/>' +
        '<path d="M295 ' + (y + 7) + "l5-7 5 7M295 " + (floor - 7) + 'l5 7 5-7" fill="none" stroke="' + col + '" stroke-width="2"/>' +
        '<text x="310" y="' + ((y + floor) / 2 + 5) + '" font-size="13" font-weight="700" fill="' + col + '">' + s.dist + " cm</text></svg>";
    }

    function result() {
      var d = SRC[s.src], li = [], bad = false;
      function add(ok, o) { li.push('<li class="' + (ok ? "ok" : "err") + '">' + T(o) + "</li>"); }
      if (!d.radiant) {
        add(true, { en: "Protection rating IP44 – suitable for the barn.", de: "Schutzart IP44 – für den Stall geeignet." });
        add(true, { en: "Surface max. 55 °C – no minimum distance to the litter required.", de: "Oberfläche max. 55 °C – kein Mindestabstand zur Einstreu nötig." });
        add(true, { en: "Stands on its own legs – nothing can fall into the litter.", de: "Steht auf eigenen Füßen – nichts kann in die Einstreu fallen." });
        return picture(false) + '<ul class="status">' + li.join("") + '</ul><p class="note">' + T({ en: "Brooder plates warm the animal, not the room: the room temperature must be at least 18 °C.", de: "Wärmeplatten wärmen das Tier, nicht den Raum: Die Raumtemperatur muss mindestens 18 °C betragen." }) + "</p>";
      }
      var ipOk = d.fixed || s.ip === "44", guardOk = d.fixed || s.guard === "yes", holderOk = d.fixed || s.holder === "250";
      var hangOk = s.hang === "chain", distOk = s.dist >= d.min;
      bad = !distOk;
      add(ipOk, ipOk ? { en: "Protection rating IP44 – suitable for the barn.", de: "Schutzart IP44 – für den Stall geeignet." } : { en: "IP20 is not permitted in the barn: dust and moisture get in (at least IP44).", de: "IP20 ist im Stall nicht zulässig: Staub und Feuchte dringen ein (mindestens IP44)." });
      add(guardOk, guardOk ? { en: "Guard fitted.", de: "Schutzkorb vorhanden." } : { en: "No guard: animals, litter or a falling lamp touch the hot bulb directly.", de: "Kein Schutzkorb: Tiere, Einstreu oder eine herabfallende Lampe berühren den heißen Kolben direkt." });
      if (s.src === "lamp") add(holderOk, holderOk ? { en: "Lampholder rated for the lamp power.", de: "Fassung für die Lampenleistung zugelassen." } : { en: "Lampholder rated for 60 W only: it overheats with a 250 W heat lamp.", de: "Fassung nur bis 60 W zugelassen: Sie überhitzt mit einer 250-W-Wärmelampe." });
      add(hangOk, hangOk ? { en: "Chain with second safety catch – the heater cannot fall.", de: "Kette mit zweiter Fangsicherung – der Strahler kann nicht herunterfallen." } : (s.hang === "string" ? { en: "String can scorch, tear or be pulled down by animals.", de: "Schnur kann verschmoren, reißen oder von Tieren heruntergerissen werden." } : { en: "Never hang a heater by its cable: the conductors and the strain relief are not made for it.", de: "Einen Strahler nie an der Leitung aufhängen: Adern und Zugentlastung sind dafür nicht gebaut." }));
      add(distOk, distOk ? { en: "Minimum distance to the litter observed.", de: "Mindestabstand zur Einstreu eingehalten." } : { en: "Too close to the litter: below the manufacturer's minimum distance – fire hazard.", de: "Zu nah an der Einstreu: Mindestabstand des Herstellers unterschritten – Brandgefahr." });
      return picture(bad) + '<ul class="status">' + li.join("") + "</ul>";
    }

    function render() {
      host.innerHTML = '<div class="sim"><div class="sim__head"><h3>' + T({ en: "Barn check: is this heat source permitted?", de: "Stall-Check: Ist diese Wärmequelle zulässig?" }) + "</h3></div>" +
        '<div class="sim__grid"><div>' + controls() + '</div><div class="sim-res">' + result() + "</div></div></div>";
      host.querySelectorAll("button[data-k]").forEach(function (b) {
        b.addEventListener("click", function () { s[b.dataset.k] = b.dataset.v; render(); });
      });
      host.querySelectorAll("input[data-r]").forEach(function (r) {
        r.addEventListener("input", function () {
          s.dist = parseInt(r.value, 10);
          host.querySelector('[data-o="dist"]').textContent = s.dist + " cm";
          host.querySelector(".sim-res").innerHTML = result();
        });
      });
    }
    render();
    document.addEventListener("langchange", render);
  }
  document.querySelectorAll('[data-sim="barncheck"]').forEach(init);
})();
