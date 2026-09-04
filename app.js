/* ============================================================
   Lernlandschaft – app.js
   -----------------------------------------------------------
   Beliebig tiefer Baum aus config.json:
     - Eintrag MIT  "children" → Ebene (Beruf, Jahrgang, Fach …)
     - Eintrag OHNE "children" → Thema (Link auf …/index.html)

   Routing über den URL-Hash:
     #/                       → Bildungsgänge
     #/eat                    → Jahrgänge von EAT
     #/eat/jg11               → Fächer
     #/eat/jg11/steuerung     → Themen

   Themen-URL wird aus den Ordnern gebildet:
     <folder>/<folder>/…/<folder>/index.html
   (fehlt "folder", wird die "id" verwendet;
    ein explizites "url" im Thema gewinnt immer)
   ============================================================ */

const CONFIG_URL    = "config.json";
const DEFAULT_COLOR = "#2563eb";
const DEFAULT_LABEL = ["Eintrag", "Einträge"];

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
    if (!Array.isArray(config.children)) {
      throw new Error('"children" fehlt auf oberster Ebene oder ist kein Array');
    }
  } catch (err) {
    showError(err);
    return;
  }

  document.title = config.title || "Lernlandschaft";
  $("#site-title").textContent  = config.title || "Lernlandschaft";
  $("#footer-text").textContent = config.footer || "";

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
//  Baum-Hilfsfunktionen
// =============================================================
const isContainer = (node) => Array.isArray(node.children);

/** Hash-Adresse für einen Pfad aus Knoten, z. B. "#/eat/jg11" */
const hashFor = (path) => "#/" + path.map((n) => n.id).join("/");

/** Farbe: eigene Farbe des Knotens, sonst vom nächsten Vorfahren erben */
function colorFor(path) {
  for (let i = path.length - 1; i >= 0; i--) {
    if (path[i].color) return path[i].color;
  }
  return DEFAULT_COLOR;
}

/** Datei-Pfad aus "folder" (oder ersatzweise "id") aller Knoten im Pfad */
function buildUrl(path) {
  return path.map((n) => encodeURIComponent(n.folder || n.id)).join("/") + "/index.html";
}

/** Bezeichnung der Unterelemente eines Knotens: childLabel > levelNames[depth] > Standard */
function labelFor(parent, depth) {
  if (parent && Array.isArray(parent.childLabel) && parent.childLabel.length === 2) {
    return parent.childLabel;
  }
  const names = config.levelNames || [];
  return Array.isArray(names[depth]) && names[depth].length === 2 ? names[depth] : DEFAULT_LABEL;
}

function countLabel(n, parent, depth) {
  const [singular, plural] = labelFor(parent, depth);
  return `${n} ${n === 1 ? singular : plural}`;
}

/** Alle Themen (Blätter) rekursiv einsammeln – für die Suche */
function collectTopics(nodes, path, out = []) {
  for (const node of nodes) {
    if (isContainer(node)) collectTopics(node.children, [...path, node], out);
    else out.push({ node, path });
  }
  return out;
}

// =============================================================
//  Routing
// =============================================================
function getRoute() {
  const parts = decodeURIComponent(location.hash)
    .replace(/^#\/?/, "")
    .split("/")
    .filter(Boolean);

  const path = [];
  let nodes = config.children;
  for (const id of parts) {
    const node = nodes.find((n) => n.id === id && isContainer(n));
    if (!node) break;
    path.push(node);
    nodes = node.children;
  }
  return { path, valid: path.length === parts.length };
}

function goBack() {
  const { path } = getRoute();
  location.hash = hashFor(path.slice(0, -1));
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

  const { path, valid } = getRoute();

  // Ungültige Route (Tippfehler, gelöschte ID) → auf die tiefste gültige Ebene
  if (!valid) { location.hash = hashFor(path); return; }

  const current  = path.length ? path[path.length - 1] : null;
  const children = current ? current.children : config.children;
  const depth    = path.length;

  renderBreadcrumbs(path);
  backBtn.hidden = depth === 0;
  setHeading(
    current ? current.title : config.title,
    current ? current.description : config.subtitle
  );

  const items = children.map((node) => nodeToCard(node, path));
  const [, plural] = labelFor(current, depth);
  renderCards(items, `Hier gibt es noch keine ${plural} – schau bald wieder vorbei.`);
}

// =============================================================
//  Suche über alle Themen
// =============================================================
function renderSearch(query) {
  backBtn.hidden = true;
  renderBreadcrumbs([], "Suche");
  setHeading(`Suche: „${searchInput.value.trim()}“`, "Ergebnisse aus allen Bildungsgängen");

  const results = collectTopics(config.children, [])
    .filter(({ node, path }) => {
      const haystack = [
        node.title, node.description, ...(node.tags || []), ...path.map((p) => p.title),
      ].join(" ").toLowerCase();
      return haystack.includes(query);
    })
    .map(({ node, path }) => ({
      ...nodeToCard(node, path),
      meta: path.map((p) => p.title).join(" › "),
    }));

  renderCards(results, "Nichts gefunden. Versuche einen anderen Suchbegriff.");
}

// =============================================================
//  Knoten → Kachel-Daten
// =============================================================
function nodeToCard(node, path) {
  const fullPath = [...path, node];
  const color    = colorFor(fullPath);

  if (isContainer(node)) {
    // ---- Ebene (Beruf, Jahrgang, Fach …) ----
    return {
      title: node.title,
      description: node.description,
      icon: node.icon || "📁",
      color,
      href: hashFor(fullPath),
      meta: countLabel(node.children.length, node, path.length + 1),
    };
  }

  // ---- Thema (Blatt) ----
  const url = node.url || buildUrl(fullPath);
  return {
    title: node.title,
    description: node.description,
    icon: node.icon || "📄",
    color,
    href: url,
    external: /^https?:\/\//i.test(url),
    tags: node.tags,
    badge: node.badge,
  };
}

// =============================================================
//  Darstellung
// =============================================================
function setHeading(title, subtitle) {
  pageTitle.textContent = title || "";
  pageSub.textContent   = subtitle || "";
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
function renderBreadcrumbs(path, extraLabel) {
  crumbs.innerHTML = "";

  const trail = [{ label: "Start", href: "#/" }];
  path.forEach((node, i) => trail.push({ label: node.title, href: hashFor(path.slice(0, i + 1)) }));
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
      <p><small>Technische Meldung: ${String(err.message || err).replace(/</g, "&lt;")}</small></p>
    </div>`;
}
