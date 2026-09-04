/* ============================================================
   Lernlandschaft – app.js
   -----------------------------------------------------------
   1. Lädt config.json
   2. Liest die aktuelle Ebene aus dem URL-Hash:
        #/              → Jahrgänge
        #/jg10          → Fächer des Jahrgangs
        #/jg10/digital  → Themen des Fachs
   3. Rendert Breadcrumbs + Kacheln
   4. Globale Suche über alle Themen
   ============================================================ */

const CONFIG_URL   = "config.json";
const DEFAULT_COLOR = "#2563eb";

let config = null;

// --- DOM-Referenzen ------------------------------------------
const $ = (sel) => document.querySelector(sel);
const grid        = $("#grid");
const crumbs      = $("#breadcrumbs");
const pageTitle   = $("#page-title");
const pageSub     = $("#page-subtitle");
const backBtn     = $("#back-btn");
const searchInput = $("#search");
const emptyMsg    = $("#empty");

document.addEventListener("DOMContentLoaded", init);

// =============================================================
//  Initialisierung
// =============================================================
async function init() {
  try {
    // Zeitstempel verhindert, dass Browser eine alte config.json cachen
    const res = await fetch(`${CONFIG_URL}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    config = await res.json();
  } catch (err) {
    showError(err);
    return;
  }

  document.title = config.title || "Lernlandschaft";
  $("#site-title").textContent   = config.title || "Lernlandschaft";
  $("#footer-text").textContent  = config.footer || "";

  window.addEventListener("hashchange", () => {
    searchInput.value = "";      // Suche beim Navigieren zurücksetzen
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  searchInput.addEventListener("input", render);
  backBtn.addEventListener("click", goBack);

  // Klick auf Breadcrumb/Brand, während eine Suche aktiv ist:
  // Hash ändert sich evtl. nicht → manuell neu rendern
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link && searchInput.value) {
      searchInput.value = "";
      requestAnimationFrame(render);
    }
  });

  render();
}

// =============================================================
//  Routing
// =============================================================
function getRoute() {
  const parts = decodeURIComponent(location.hash)
    .replace(/^#\/?/, "")
    .split("/")
    .filter(Boolean);

  const level   = config.levels.find((l) => l.id === parts[0]) || null;
  const subject = level ? (level.subjects || []).find((s) => s.id === parts[1]) || null : null;
  return { level, subject, raw: parts };
}

function goBack() {
  const { level, subject } = getRoute();
  location.hash = subject ? `#/${level.id}` : "#/";
}

// =============================================================
//  Haupt-Render-Funktion
// =============================================================
function render() {
  const query = searchInput.value.trim().toLowerCase();
  if (query.length >= 2) {
    renderSearch(query);
    return;
  }

  const { level, subject, raw } = getRoute();

  // Ungültige Route (z. B. Tippfehler oder gelöschte ID) → zur Startseite
  if (raw.length > 0 && !level) { location.hash = "#/"; return; }
  if (raw.length > 1 && !subject) { location.hash = `#/${level.id}`; return; }

  renderBreadcrumbs(level, subject);
  backBtn.hidden = !level;

  let items = [];

  if (!level) {
    // ---- Ebene 1: Jahrgänge ----
    setHeading(config.title, config.subtitle);
    items = config.levels.map((l) => ({
      title: l.title,
      description: l.description,
      icon: l.icon || "📚",
      color: l.color,
      href: `#/${l.id}`,
      meta: countLabel((l.subjects || []).length, "Fach", "Fächer"),
    }));
  } else if (!subject) {
    // ---- Ebene 2: Fächer ----
    setHeading(level.title, level.description);
    items = (level.subjects || []).map((s) => ({
      title: s.title,
      description: s.description,
      icon: s.icon || "📘",
      color: s.color || level.color,
      href: `#/${level.id}/${s.id}`,
      meta: countLabel((s.topics || []).length, "Thema", "Themen"),
    }));
  } else {
    // ---- Ebene 3: Themen ----
    setHeading(subject.title, subject.description);
    items = (subject.topics || []).map((t) => topicToCard(t, subject.color || level.color));
  }

  renderCards(items, "Hier gibt es noch keine Inhalte – schau bald wieder vorbei.");
}

// =============================================================
//  Suche über alle Themen
// =============================================================
function renderSearch(query) {
  backBtn.hidden = true;
  renderBreadcrumbs(null, null, "Suche");
  setHeading(`Suche: „${searchInput.value.trim()}“`, "Ergebnisse aus allen Jahrgängen und Fächern");

  const results = [];
  for (const level of config.levels) {
    for (const subject of level.subjects || []) {
      for (const topic of subject.topics || []) {
        const haystack = [
          topic.title, topic.description, subject.title, level.title, ...(topic.tags || []),
        ].join(" ").toLowerCase();

        if (haystack.includes(query)) {
          results.push({
            ...topicToCard(topic, subject.color || level.color),
            meta: `${level.title} › ${subject.title}`,
          });
        }
      }
    }
  }

  renderCards(results, "Nichts gefunden. Versuche einen anderen Suchbegriff.");
}

// =============================================================
//  Hilfsfunktionen
// =============================================================
function topicToCard(topic, color) {
  const external = /^https?:\/\//i.test(topic.url || "");
  return {
    title: topic.title,
    description: topic.description,
    icon: topic.icon || "📄",
    color,
    href: topic.url || "#",
    external,
    tags: topic.tags,
    badge: topic.badge,
  };
}

function setHeading(title, subtitle) {
  pageTitle.textContent = title || "";
  pageSub.textContent   = subtitle || "";
}

function countLabel(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`;
}

function softColor(hex) {
  // 6-stelliger Hex-Code → gleiche Farbe mit ~13 % Deckkraft
  return /^#[0-9a-f]{6}$/i.test(hex) ? `${hex}22` : "rgba(37, 99, 235, 0.13)";
}

/** Erzeugt ein Element mit Klasse und optionalem Text (XSS-sicher via textContent) */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---- Breadcrumbs --------------------------------------------
function renderBreadcrumbs(level, subject, extraLabel) {
  crumbs.innerHTML = "";

  const trail = [{ label: "Start", href: "#/" }];
  if (level)   trail.push({ label: level.title,   href: `#/${level.id}` });
  if (subject) trail.push({ label: subject.title, href: `#/${level.id}/${subject.id}` });
  if (extraLabel) trail.push({ label: extraLabel });

  trail.forEach((item, i) => {
    const isLast = i === trail.length - 1;
    if (isLast) {
      const span = el("span", null, item.label);
      span.setAttribute("aria-current", "page");
      crumbs.append(span);
    } else {
      const a = el("a", null, item.label);
      a.href = item.href;
      crumbs.append(a, el("span", "sep", "›"));
    }
  });
}

// ---- Kacheln --------------------------------------------------
function renderCards(items, emptyText) {
  grid.innerHTML = "";
  emptyMsg.hidden = items.length > 0;
  emptyMsg.textContent = emptyText;
  items.forEach((item, i) => grid.append(createCard(item, i)));
}

function createCard(item, index) {
  const color = item.color || DEFAULT_COLOR;

  const a = el("a", "card");
  a.href = item.href;
  a.style.setProperty("--i", index);             // Staffelung der Animation
  a.style.setProperty("--card-accent", color);
  a.style.setProperty("--card-accent-soft", softColor(color));

  if (item.external) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }

  // Kopf: Icon + optionales Badge
  const top = el("div", "card-top");
  top.append(el("div", "card-icon", item.icon));
  if (item.badge) top.append(el("span", "badge", item.badge));
  a.append(top);

  // Titel + Beschreibung
  a.append(el("h2", "card-title", item.title));
  if (item.description) a.append(el("p", "card-desc", item.description));

  // Fuß: Tags / Meta / Pfeil
  const foot = el("div", "card-foot");
  if (item.tags && item.tags.length) {
    const tags = el("div", "tags");
    item.tags.forEach((t) => tags.append(el("span", "tag", t)));
    foot.append(tags);
  }
  if (item.meta) foot.append(el("span", "meta", item.meta));
  foot.append(el("span", "arrow", item.external ? "↗" : "→"));
  a.append(foot);

  return a;
}

// ---- Fehleranzeige --------------------------------------------
function showError(err) {
  console.error(err);
  setHeading("Konfiguration konnte nicht geladen werden", "");
  grid.innerHTML = `
    <div class="error-box">
      <h2>config.json nicht gefunden oder fehlerhaft</h2>
      <p><strong>Mögliche Ursachen:</strong></p>
      <ul>
        <li>Die Datei <code>config.json</code> liegt nicht im selben Ordner wie <code>index.html</code>.</li>
        <li>Syntaxfehler in der JSON-Datei (fehlendes Komma, Anführungszeichen o. ä.) –
            prüfe sie z. B. auf <code>jsonlint.com</code>.</li>
        <li>Du hast die Seite lokal per Doppelklick geöffnet (<code>file://</code>). Browser blockieren
            dann das Laden. Nutze GitHub Pages oder einen lokalen Server (z. B. VS Code „Live Server“).</li>
      </ul>
      <p><small>Technische Meldung: ${String(err.message || err)}</small></p>
    </div>`;
}
