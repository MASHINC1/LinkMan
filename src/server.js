const http = require('http');
const { URL } = require('url');

const host = '127.0.0.1';
const port = process.env.PORT || 3000;

function escapeHtml(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function inferNameFromUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    const hostName = u.hostname.replace(/^www\./i, '');
    const part = hostName.split('.')[0] || hostName;
    return part
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase())
      .trim();
  } catch {
    return 'Neuer Link';
  }
}

function json(res, code, payload) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function htmlPage() {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LinkMan</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #1e1e1e;
      --bg-layer: #181818;
      --surface: #252526;
      --surface-2: #2d2d30;
      --surface-3: #353537;
      --text: #d4d4d4;
      --muted: #a8a8a8;
      --accent: orangered;
      --accent-2: #ff6d4a;
      --danger: #ff8470;
      --border: #3c3c3c;
      --shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
      --focus-ring: 0 0 0 2px rgba(255, 69, 0, 0.3);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      height: 100vh;
      font-family: "Space Grotesk", "Segoe UI", sans-serif;
      font-size: 15px;
      color: var(--text);
      overflow: auto;
      background: linear-gradient(180deg, var(--bg) 0%, var(--bg-layer) 100%);
    }

    .wrap {
      width: 100%;
      max-width: none;
      margin: 0;
      padding: 8px 12px 10px;
      transform-origin: top left;
      position: relative;
      z-index: 1;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      margin-bottom: 8px;
    }

    .brand {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: linear-gradient(135deg, #252526 0%, #202021 100%);
      box-shadow: var(--shadow);
    }

    .brand-logo {
      width: 28px;
      height: 28px;
      flex: 0 0 auto;
      filter: drop-shadow(0 0 8px rgba(255, 69, 0, 0.25));
    }

    .brand-title {
      margin: 0;
      font-family: "Orbitron", "Space Grotesk", sans-serif;
      font-size: clamp(1.25rem, 2.5vw, 1.85rem);
      line-height: 1;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    .brand-link {
      color: #ffab98;
      text-shadow: 0 0 8px rgba(255, 109, 74, 0.28);
    }

    .brand-man {
      color: var(--accent);
      text-shadow: 0 0 10px rgba(255, 69, 0, 0.35);
    }

    .card {
      background: linear-gradient(165deg, #252526 0%, #202022 100%);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: var(--shadow);
      padding: 14px;
      animation: reveal 220ms ease-out;
    }

    .board {
      display: grid;
      grid-template-columns: repeat(4, minmax(220px, 1fr));
      gap: 10px;
      align-items: start;
    }

    label {
      display: block;
      margin-bottom: 6px;
      color: var(--muted);
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    input, textarea, select, button {
      font: inherit;
      color: var(--text);
      font-size: 0.92rem;
    }

    input, textarea, select {
      width: 100%;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: linear-gradient(180deg, #2a2a2c 0%, #232325 100%);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }

    textarea {
      min-height: 110px;
      resize: vertical;
    }

    input:focus, textarea:focus, select:focus {
      border-color: var(--accent);
      box-shadow: var(--focus-ring);
      background: linear-gradient(180deg, #2e2e31 0%, #252527 100%);
    }

    .row { margin-bottom: 10px; }

    .btn-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    button {
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 7px 12px;
      cursor: pointer;
      font-weight: 700;
      letter-spacing: 0.01em;
      transition: transform 0.12s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    button:hover {
      transform: translateY(-1px);
    }

    button:active { transform: translateY(1px); }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.62;
      filter: saturate(0.7);
    }

    .btn-main {
      background: linear-gradient(90deg, var(--accent-2) 0%, var(--accent) 100%);
      color: #fff4f1;
      box-shadow: 0 0 16px rgba(255, 69, 0, 0.26);
    }

    .btn-secondary {
      background: linear-gradient(90deg, #3a2e2a 0%, #302522 100%);
      color: #ffc4b6;
      border-color: #5c4038;
    }

    .btn-danger {
      background: #3a2523;
      color: #ffb8aa;
      border-color: #6b4843;
    }

    .category-add {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      margin-top: 6px;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .chip {
      border-radius: 999px;
      background: linear-gradient(180deg, #302724 0%, #2a211f 100%);
      border: 1px solid #5a3b33;
      color: #ffb8a5;
      padding: 4px 9px;
      font-size: 0.78rem;
      letter-spacing: 0.02em;
    }

    .group-card {
      background: linear-gradient(180deg, #272729 0%, #232325 100%);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: var(--shadow);
      padding: 8px;
      min-height: 170px;
      animation: reveal 240ms ease-out;
      cursor: grab;
    }

    .group-card.dragging {
      opacity: 0.45;
      cursor: grabbing;
      border-color: var(--accent);
      box-shadow: 0 0 18px rgba(255, 69, 0, 0.24);
    }

    .group-title {
      margin: 2px 0 8px;
      font-size: 0.95rem;
      font-family: "Orbitron", "Space Grotesk", sans-serif;
      letter-spacing: 0.08em;
      color: #ffb29f;
      text-transform: uppercase;
      cursor: text;
    }

    .links {
      display: grid;
      gap: 4px;
    }

    .link-item {
      background: linear-gradient(180deg, #2e2e31 0%, #252527 100%);
      border: 1px solid #474749;
      border-radius: 4px;
      min-height: 28px;
      padding: 2px 4px;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s, opacity 0.15s;
      cursor: grab;
    }

    .link-item:hover {
      border-color: #656568;
      box-shadow: 0 8px 14px rgba(0, 0, 0, 0.3);
      transform: translateY(-1px);
    }

    .link-item.dragging {
      opacity: 0.45;
      border-color: var(--accent);
      box-shadow: 0 0 14px rgba(255, 69, 0, 0.22);
      cursor: grabbing;
    }

    .link-item.drop-before {
      border-top-color: var(--accent);
      box-shadow: inset 0 2px 0 var(--accent), 0 0 12px rgba(255, 69, 0, 0.18);
    }

    .group-card.drag-over {
      border-color: var(--accent-2);
      box-shadow: 0 0 16px rgba(255, 69, 0, 0.16);
    }

    .group-card.group-drop-before {
      box-shadow: inset 0 3px 0 var(--accent), 0 0 16px rgba(255, 69, 0, 0.16);
    }

    .group-card.group-drop-after {
      box-shadow: inset 0 -3px 0 var(--accent), 0 0 16px rgba(255, 69, 0, 0.16);
    }

    .links.drag-over {
      border-radius: 10px;
      box-shadow: inset 0 0 0 1px rgba(255, 109, 74, 0.34);
      background: rgba(255, 69, 0, 0.07);
    }

    .group-empty {
      border: 1px dashed #6a4f48;
      border-radius: 9px;
      color: #c9a49a;
      text-align: center;
      font-size: 0.78rem;
      padding: 10px 6px;
      background: rgba(43, 33, 30, 0.45);
    }

    .favicon {
      width: 14px;
      height: 14px;
      border-radius: 5px;
      background: #fff;
      border: 1px solid #dadada;
    }

    .link-main {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }

    .link-name {
      margin: 0;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .link-action {
      color: #ffcabd;
      text-decoration: none;
      font-size: 13px;
    }

    .link-action:hover {
      color: #ffdcd3;
      text-decoration: underline;
      text-decoration-thickness: 1px;
    }

    .muted { color: var(--muted); }

    .empty {
      text-align: center;
      color: var(--muted);
      padding: 20px 10px;
      border: 1px dashed #58585a;
      border-radius: 12px;
      background: linear-gradient(180deg, #29292b 0%, #242426 100%);
      font-size: 0.95rem;
    }

    .panel-hidden {
      display: none;
    }

    @media (max-width: 1280px) {
      .board { grid-template-columns: repeat(3, minmax(210px, 1fr)); }
    }

    @media (max-width: 940px) {
      body {
        overflow: auto;
      }

      .wrap {
        transform: none !important;
        width: 100% !important;
        padding: 10px;
      }

      .header {
        flex-wrap: wrap;
      }

      .brand {
        margin-left: 0;
        width: 100%;
        justify-content: center;
      }

      .board {
        grid-template-columns: repeat(2, minmax(200px, 1fr));
      }
    }

    @media (max-width: 700px) {
      .board { grid-template-columns: 1fr; }

      .category-add {
        grid-template-columns: 1fr;
      }

      .btn-row {
        flex-direction: column;
      }

      .btn-row button {
        width: 100%;
      }
    }

    @keyframes reveal {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="wrap" id="wrap">
    <header class="header">
      <button id="toggleFormBtn" class="btn-main" type="button">Hinzufügen</button>
      <div class="brand">
        <svg class="brand-logo" viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="lmGlowA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#6fc6ff"/>
              <stop offset="100%" stop-color="#34ddb6"/>
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="52" height="52" rx="14" fill="#0e1929" stroke="url(#lmGlowA)" stroke-width="3"/>
          <path d="M20 34l10-10h7l-10 10 10 10h-7z" fill="#6fc6ff"/>
          <path d="M44 30l-10 10h-7l10-10-10-10h7z" fill="#34ddb6"/>
        </svg>
        <h1 class="brand-title"><span class="brand-link">Link</span><span class="brand-man">Man</span></h1>
      </div>
    </header>

    <main>
      <section class="card panel-hidden" id="addPanel" style="margin-bottom: 16px;">
        <div class="row">
          <label for="urlInput">URL einfügen</label>
          <input id="urlInput" type="url" placeholder="https://beispiel.de/artikel" autocomplete="off" />
        </div>

        <div class="row">
          <label for="nameInput">Bezeichnender Name (Vorschlag möglich)</label>
          <input id="nameInput" type="text" placeholder="Wird automatisch vorgeschlagen" autocomplete="off" />
        </div>

        <div class="row">
          <label for="categorySelect">Kategorie</label>
          <select id="categorySelect"></select>
          <div class="category-add">
            <input id="newCategoryInput" type="text" placeholder="Neue Kategorie" />
            <button id="addCategoryBtn" class="btn-secondary" type="button">Anlegen</button>
          </div>
          <div id="categoryChips" class="chips"></div>
        </div>

        <div class="row">
          <label for="imageInput">Vorschaubild URL (automatisch, optional anpassen)</label>
          <input id="imageInput" type="url" placeholder="https://.../image.jpg" autocomplete="off" />
        </div>

        <div class="btn-row">
          <button id="suggestBtn" class="btn-secondary" type="button">Name + Bild vorschlagen</button>
          <button id="addLinkBtn" class="btn-main" type="button">Link hinzufügen</button>
        </div>

        <div class="row" style="margin-top: 16px;">
          <label for="importInput">Bulk-Import (JSON-Text mit groups/sections/links)</label>
          <textarea id="importInput" placeholder='JSON einfügen und auf "Importieren" klicken'></textarea>
          <div class="btn-row">
            <button id="importBtn" class="btn-secondary" type="button">Importieren</button>
          </div>
        </div>

        <p class="muted" id="statusText" style="margin: 10px 0 0;"></p>
      </section>

      <section>
        <div id="linksList" class="board"></div>
      </section>
    </main>
  </div>

  <script>
    const STORAGE_KEY = 'linkman_data_v1';

    const state = {
      categories: ['Allgemein'],
      links: [],
      groupOrder: [],
      addPanelOpen: false
    };

    const dom = {
      wrap: document.getElementById('wrap'),
      toggleFormBtn: document.getElementById('toggleFormBtn'),
      addPanel: document.getElementById('addPanel'),
      urlInput: document.getElementById('urlInput'),
      nameInput: document.getElementById('nameInput'),
      imageInput: document.getElementById('imageInput'),
      categorySelect: document.getElementById('categorySelect'),
      newCategoryInput: document.getElementById('newCategoryInput'),
      addCategoryBtn: document.getElementById('addCategoryBtn'),
      suggestBtn: document.getElementById('suggestBtn'),
      addLinkBtn: document.getElementById('addLinkBtn'),
      importInput: document.getElementById('importInput'),
      importBtn: document.getElementById('importBtn'),
      linksList: document.getElementById('linksList'),
      categoryChips: document.getElementById('categoryChips'),
      statusText: document.getElementById('statusText')
    };

    const dragState = {
      linkId: null,
      groupName: null
    };

    function save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        categories: state.categories,
        links: state.links,
        groupOrder: state.groupOrder
      }));
    }

    function load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.categories) && parsed.categories.length) {
          state.categories = [...new Set(parsed.categories.map(String))];
        }
        if (Array.isArray(parsed.groupOrder)) {
          state.groupOrder = [...new Set(parsed.groupOrder.map((g) => String(g).trim()).filter(Boolean))];
        }
        if (Array.isArray(parsed.links)) {
          state.links = parsed.links.filter((item) => item && item.url).map((item) => ({
            id: String(item.id || crypto.randomUUID()),
            url: String(item.url),
            name: String(item.name || item.url),
            category: state.categories.includes(item.category) ? item.category : state.categories[0],
            image: String(item.image || ''),
            icon: String(item.icon || '')
          }));
        }
        syncGroupOrder();
      } catch {
        // Ignore corrupt local data and start fresh.
      }
    }

    function setStatus(text, isError = false) {
      dom.statusText.textContent = text;
      dom.statusText.style.color = isError ? '#ff9b83' : 'var(--muted)';
    }

    function normalizeUrl(input) {
      const trimmed = input.trim();
      if (!trimmed) return null;
      try {
        return new URL(trimmed).toString();
      } catch {
        try {
          return new URL('https://' + trimmed).toString();
        } catch {
          return null;
        }
      }
    }

    function domainIcon(url) {
      return 'https://www.google.com/s2/favicons?sz=128&domain_url=' + encodeURIComponent(url);
    }

    async function suggestForCurrentUrl() {
      const normalized = normalizeUrl(dom.urlInput.value);
      if (!normalized) {
        setStatus('Bitte eine gueltige URL eingeben.', true);
        return;
      }

      setStatus('Vorschlag wird geladen...');
      dom.suggestBtn.disabled = true;

      try {
        const res = await fetch('/api/preview?url=' + encodeURIComponent(normalized));
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Preview fehlgeschlagen');

        if (!dom.nameInput.value.trim()) dom.nameInput.value = data.name || '';
        if (!dom.imageInput.value.trim() && data.image) dom.imageInput.value = data.image;

        setStatus('Vorschlag geladen. Du kannst Werte noch anpassen.');
      } catch (err) {
        setStatus('Konnte keine Vorschau laden. Name wird lokal vorgeschlagen.', true);
        if (!dom.nameInput.value.trim()) {
          const host = new URL(normalized).hostname.replace(/^www\./, '');
          dom.nameInput.value = host.split('.')[0].replace(/[-_]/g, ' ');
        }
      } finally {
        dom.suggestBtn.disabled = false;
      }
    }

    function renderCategoryOptions() {
      dom.categorySelect.innerHTML = state.categories
        .map((c) => '<option value="' + c.replaceAll('"', '&quot;') + '">' + c + '</option>')
        .join('');

      dom.categoryChips.innerHTML = state.categories.map((c) => '<span class="chip">' + c + '</span>').join('');
    }

    function splitCategory(category) {
      const raw = String(category || '').trim();
      if (!raw) return { group: 'Sonstiges', section: 'Allgemein' };
      const parts = raw.split('/').map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) return { group: parts[0], section: parts.slice(1).join(' / ') };
      return { group: parts[0] || 'Sonstiges', section: 'Allgemein' };
    }

    function buildCategory(group, section) {
      const g = String(group || '').trim() || 'Sonstiges';
      const s = String(section || '').trim() || 'Allgemein';
      if (s.toLowerCase() === 'allgemein') return g;
      return g + ' / ' + s;
    }

    function fitViewport() {
      dom.wrap.style.transform = 'none';
      dom.wrap.style.width = '100%';
    }

    function getGroupNamesFromState() {
      const names = [];
      const seen = new Set();
      for (const category of state.categories) {
        const group = splitCategory(category).group;
        if (!seen.has(group)) {
          seen.add(group);
          names.push(group);
        }
      }
      for (const link of state.links) {
        const group = splitCategory(link.category).group;
        if (!seen.has(group)) {
          seen.add(group);
          names.push(group);
        }
      }
      return names;
    }

    function syncGroupOrder() {
      const currentGroups = getGroupNamesFromState();
      const currentSet = new Set(currentGroups);
      const nextOrder = state.groupOrder.filter((name) => currentSet.has(name));
      for (const group of currentGroups) {
        if (!nextOrder.includes(group)) nextOrder.push(group);
      }
      state.groupOrder = nextOrder;
      return state.groupOrder;
    }

    function renderLinks() {
      const grouped = {};
      const categoryGroups = syncGroupOrder();

      for (const groupName of categoryGroups) {
        grouped[groupName] = [];
      }

      for (const link of state.links) {
        const split = splitCategory(link.category);
        if (!grouped[split.group]) grouped[split.group] = [];
        grouped[split.group].push(link);
      }

      const groupNames = [...categoryGroups];
      if (!groupNames.length) {
        dom.linksList.innerHTML = '<div class="empty">Noch keine Links vorhanden.</div>';
        fitViewport();
        return;
      }

      dom.linksList.innerHTML = groupNames.map((groupName) => {
        const groupNameEscaped = escapeHtmlClient(groupName);
        const linkItems = grouped[groupName].map((l) => {
          const icon = escapeHtmlClient(l.icon || domainIcon(l.url));
          const name = escapeHtmlClient(l.name);
          const url = escapeHtmlClient(l.url);
          const id = escapeHtmlClient(l.id);

          return '<article class="link-item" draggable="true" data-link-id="' + id + '" data-group-name="' + groupNameEscaped + '">' +
            '<div class="link-main">' +
              '<img class="favicon" src="' + icon + '" alt="Icon" loading="lazy" />' +
              '<a class="link-action" href="' + url + '" target="_blank" rel="noreferrer noopener">' + name + '</a>' +
            '</div>' +
          '</article>';
        }).join('');

        const content = linkItems || '<div class="group-empty">Links hier ablegen</div>';

        return '<section class="group-card" draggable="true" data-group-name="' + groupNameEscaped + '">' +
          '<h2 class="group-title" data-group-name="' + groupNameEscaped + '" title="Doppelklick zum Umbenennen">' + groupNameEscaped + '</h2>' +
          '<div class="links" data-group-name="' + groupNameEscaped + '">' + content + '</div>' +
        '</section>';
      }).join('');

      fitViewport();
    }

    function escapeHtmlClient(input) {
      return String(input)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    function addCategory() {
      const name = dom.newCategoryInput.value.trim();
      if (!name) return;
      if (state.categories.includes(name)) {
        setStatus('Kategorie existiert bereits.', true);
        return;
      }
      state.categories.push(name);
      dom.newCategoryInput.value = '';
      syncGroupOrder();
      renderCategoryOptions();
      save();
      setStatus('Kategorie hinzugefügt.');
    }

    function addLink() {
      const url = normalizeUrl(dom.urlInput.value);
      const name = dom.nameInput.value.trim();
      const image = dom.imageInput.value.trim();
      const category = dom.categorySelect.value;

      if (!url) {
        setStatus('Bitte eine gültige URL eingeben.', true);
        return;
      }

      const link = {
        id: crypto.randomUUID(),
        url,
        name: name || new URL(url).hostname,
        category: category || state.categories[0],
        image,
        icon: domainIcon(url)
      };

      state.links.unshift(link);
      syncGroupOrder();
      save();
      renderLinks();
      setStatus('Link gespeichert.');

      dom.urlInput.value = '';
      dom.nameInput.value = '';
      dom.imageInput.value = '';
    }

    function importLinksFromText(rawText) {
      const source = String(rawText || '').trim();
      if (!source) {
        setStatus('Bitte Import-Text einfügen.', true);
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(source);
      } catch {
        const fromBrace = source.match(/\{[\s\S]*\}/);
        if (!fromBrace) {
          setStatus('Import-Text ist kein gültiges JSON.', true);
          return;
        }
        try {
          parsed = JSON.parse(fromBrace[0]);
        } catch {
          setStatus('Import-Text ist kein gültiges JSON.', true);
          return;
        }
      }

      const groups = Array.isArray(parsed.groups) ? parsed.groups : [];
      if (!groups.length) {
        setStatus('Keine groups im Import gefunden.', true);
        return;
      }

      let created = 0;
      let skipped = 0;
      const existing = new Set(state.links.map((l) => (l.url + '|' + l.name).toLowerCase()));

      for (const group of groups) {
        const groupKey = (group && group.key ? String(group.key) : 'import').trim();
        const sections = Array.isArray(group && group.sections) ? group.sections : [];

        for (const section of sections) {
          const sectionTitle = (section && section.title ? String(section.title) : 'Allgemein').trim();
          const category = (groupKey + ' / ' + sectionTitle).slice(0, 80);
          if (!state.categories.includes(category)) {
            state.categories.push(category);
          }

          const links = Array.isArray(section && section.links) ? section.links : [];
          for (const item of links) {
            const rawUrl = item && item.url ? String(item.url) : '';
            const normalized = normalizeUrl(rawUrl);
            if (!normalized) {
              skipped++;
              continue;
            }

            const name = String((item && item.title) || inferNameFromUrl(normalized)).trim() || inferNameFromUrl(normalized);
            const key = (normalized + '|' + name).toLowerCase();
            if (existing.has(key)) {
              skipped++;
              continue;
            }

            state.links.push({
              id: crypto.randomUUID(),
              url: normalized,
              name,
              category,
              image: '',
              icon: domainIcon(normalized)
            });
            existing.add(key);
            created++;
          }
        }
      }

      syncGroupOrder();
      save();
      renderCategoryOptions();
      renderLinks();
      setStatus('Import abgeschlossen: ' + created + ' neu, ' + skipped + ' übersprungen.');
    }

    function clearDropStyles() {
      dom.linksList.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
      dom.linksList.querySelectorAll('.drop-before').forEach((el) => el.classList.remove('drop-before'));
      dom.linksList.querySelectorAll('.group-drop-before').forEach((el) => el.classList.remove('group-drop-before'));
      dom.linksList.querySelectorAll('.group-drop-after').forEach((el) => el.classList.remove('group-drop-after'));
    }

    function clearDragStyles() {
      clearDropStyles();
      dom.linksList.querySelectorAll('.dragging').forEach((el) => el.classList.remove('dragging'));
    }

    function findInsertIndexForGroup(groupName) {
      for (let i = state.links.length - 1; i >= 0; i--) {
        const split = splitCategory(state.links[i].category);
        if (split.group === groupName) {
          return i + 1;
        }
      }
      return state.links.length;
    }

    function moveLink(draggedId, targetGroupName, beforeId = '') {
      const sourceIndex = state.links.findIndex((l) => l.id === draggedId);
      if (sourceIndex === -1) return;

      const [dragged] = state.links.splice(sourceIndex, 1);
      const oldSplit = splitCategory(dragged.category);
      const targetGroup = String(targetGroupName || '').trim() || oldSplit.group;
      const nextCategory = buildCategory(targetGroup, oldSplit.section);

      dragged.category = nextCategory;
      if (!state.categories.includes(nextCategory)) {
        state.categories.push(nextCategory);
      }

      let insertIndex = findInsertIndexForGroup(targetGroup);
      if (beforeId) {
        const beforeIndex = state.links.findIndex((l) => l.id === beforeId);
        if (beforeIndex !== -1) insertIndex = beforeIndex;
      }

      state.links.splice(insertIndex, 0, dragged);
      syncGroupOrder();
      save();
      renderCategoryOptions();
      renderLinks();
      setStatus('Link verschoben.');
    }

    function shouldInsertAfter(event, element) {
      const rect = element.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / Math.max(rect.width, 1);
      const relY = (event.clientY - rect.top) / Math.max(rect.height, 1);
      const xDelta = Math.abs(relX - 0.5);
      const yDelta = Math.abs(relY - 0.5);
      if (xDelta > yDelta) return relX > 0.5;
      return relY > 0.5;
    }

    function moveGroup(draggedGroupName, targetGroupName, insertAfter = false) {
      const dragged = String(draggedGroupName || '').trim();
      const target = String(targetGroupName || '').trim();
      if (!dragged || !target || dragged === target) return;

      const order = [...syncGroupOrder()];
      const fromIndex = order.indexOf(dragged);
      const targetIndex = order.indexOf(target);
      if (fromIndex === -1 || targetIndex === -1) return;

      order.splice(fromIndex, 1);
      const adjustedTargetIndex = order.indexOf(target);
      const insertIndex = insertAfter ? adjustedTargetIndex + 1 : adjustedTargetIndex;
      order.splice(insertIndex, 0, dragged);

      state.groupOrder = order;
      save();
      renderLinks();
      setStatus('Kategorie-Container verschoben.');
    }

    function setAddPanelOpen(open) {
      state.addPanelOpen = Boolean(open);
      dom.addPanel.classList.toggle('panel-hidden', !state.addPanelOpen);
      dom.toggleFormBtn.textContent = state.addPanelOpen ? 'Schließen' : 'Hinzufügen';
      fitViewport();
    }

    function renameGroup(oldGroupName, newGroupName) {
      const oldName = String(oldGroupName || '').trim();
      const nextName = String(newGroupName || '').trim();
      if (!oldName || !nextName || oldName === nextName) {
        renderLinks();
        return;
      }

      state.links = state.links.map((l) => {
        const split = splitCategory(l.category);
        if (split.group !== oldName) return l;
        return {
          ...l,
          category: buildCategory(nextName, split.section)
        };
      });

      state.categories = state.categories.map((c) => {
        const split = splitCategory(c);
        if (split.group !== oldName) return c;
        return buildCategory(nextName, split.section);
      });
      state.categories = [...new Set(state.categories)];
      state.groupOrder = state.groupOrder.map((g) => (g === oldName ? nextName : g));
      state.groupOrder = [...new Set(state.groupOrder)];
      syncGroupOrder();

      save();
      renderCategoryOptions();
      renderLinks();
      setStatus('Gruppe umbenannt: ' + oldName + ' -> ' + nextName);
    }

    dom.addCategoryBtn.addEventListener('click', addCategory);
    dom.suggestBtn.addEventListener('click', suggestForCurrentUrl);
    dom.addLinkBtn.addEventListener('click', addLink);
    dom.toggleFormBtn.addEventListener('click', () => setAddPanelOpen(!state.addPanelOpen));
    dom.importBtn.addEventListener('click', () => importLinksFromText(dom.importInput.value));
    dom.importInput.addEventListener('paste', () => {
      setTimeout(() => importLinksFromText(dom.importInput.value), 50);
    });

    dom.linksList.addEventListener('dragstart', (e) => {
      const linkItem = e.target.closest('.link-item');
      if (linkItem) {
        dragState.linkId = linkItem.getAttribute('data-link-id');
        dragState.groupName = null;
        linkItem.classList.add('dragging');

        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', dragState.linkId || '');
        }
        return;
      }

      const groupCard = e.target.closest('.group-card');
      if (!groupCard) return;

      dragState.groupName = groupCard.getAttribute('data-group-name');
      dragState.linkId = null;
      groupCard.classList.add('dragging');

      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragState.groupName || '');
      }
    });

    dom.linksList.addEventListener('dragover', (e) => {
      if (dragState.linkId) {
        const linkItem = e.target.closest('.link-item');
        const links = e.target.closest('.links');
        const groupCard = e.target.closest('.group-card');
        if (!linkItem && !links && !groupCard) return;

        e.preventDefault();
        clearDropStyles();

        if (linkItem && linkItem.getAttribute('data-link-id') !== dragState.linkId) {
          linkItem.classList.add('drop-before');
          return;
        }

        if (links) {
          links.classList.add('drag-over');
          return;
        }

        groupCard.classList.add('drag-over');
        return;
      }

      if (dragState.groupName) {
        const groupCard = e.target.closest('.group-card');
        if (!groupCard) return;

        const targetGroup = groupCard.getAttribute('data-group-name') || '';
        e.preventDefault();
        clearDropStyles();

        if (!targetGroup || targetGroup === dragState.groupName) return;

        groupCard.classList.add('drag-over');
        if (shouldInsertAfter(e, groupCard)) {
          groupCard.classList.add('group-drop-after');
        } else {
          groupCard.classList.add('group-drop-before');
        }
      }
    });

    dom.linksList.addEventListener('drop', (e) => {
      if (dragState.linkId) {
        const linkItem = e.target.closest('.link-item');
        const links = e.target.closest('.links');
        const groupCard = e.target.closest('.group-card');

        let targetGroup = '';
        let beforeId = '';

        if (linkItem) {
          beforeId = linkItem.getAttribute('data-link-id') || '';
          targetGroup = linkItem.getAttribute('data-group-name') || '';
        } else if (links) {
          targetGroup = links.getAttribute('data-group-name') || '';
        } else if (groupCard) {
          targetGroup = groupCard.getAttribute('data-group-name') || '';
        }

        if (!targetGroup) return;

        e.preventDefault();
        clearDropStyles();

        if (beforeId === dragState.linkId) {
          dragState.linkId = null;
          clearDragStyles();
          return;
        }

        moveLink(dragState.linkId, targetGroup, beforeId);
        dragState.linkId = null;
        clearDragStyles();
        return;
      }

      if (dragState.groupName) {
        const targetCard = e.target.closest('.group-card');
        if (!targetCard) return;

        const targetGroup = targetCard.getAttribute('data-group-name') || '';
        if (!targetGroup || targetGroup === dragState.groupName) return;

        e.preventDefault();
        clearDropStyles();
        moveGroup(dragState.groupName, targetGroup, shouldInsertAfter(e, targetCard));
        dragState.groupName = null;
        clearDragStyles();
      }
    });

    dom.linksList.addEventListener('dragend', () => {
      dragState.linkId = null;
      dragState.groupName = null;
      clearDragStyles();
    });

    dom.linksList.addEventListener('dblclick', (e) => {
      const title = e.target.closest('.group-title');
      if (!title) return;

      const oldName = title.getAttribute('data-group-name') || title.textContent || '';
      const input = document.createElement('input');
      input.type = 'text';
      input.value = oldName;
      input.style.width = '100%';
      input.style.marginBottom = '10px';

      title.replaceWith(input);
      input.focus();
      input.select();

      const commit = () => renameGroup(oldName, input.value);
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') commit();
        if (ev.key === 'Escape') renderLinks();
      });
      input.addEventListener('blur', commit, { once: true });
    });

    dom.urlInput.addEventListener('paste', () => {
      setTimeout(() => {
        if (dom.urlInput.value.trim()) suggestForCurrentUrl();
      }, 50);
    });

    load();
    renderCategoryOptions();
    renderLinks();
    setAddPanelOpen(false);
    window.addEventListener('resize', fitViewport);
  </script>
</body>
</html>`;
}

async function fetchPreview(url) {
  const fallback = {
    name: inferNameFromUrl(url),
    image: '',
    icon: `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(url)}`
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'LinkMan/1.0 (+preview-bot)'
      }
    });
    clearTimeout(timeout);

    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return fallback;

    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);

    const rawTitle = (ogTitleMatch && ogTitleMatch[1]) || (titleMatch && titleMatch[1]) || fallback.name;
    const name = rawTitle.trim().slice(0, 110) || fallback.name;
    const image = (ogImageMatch && ogImageMatch[1] && ogImageMatch[1].trim()) || '';

    let normalizedImage = image;
    if (image) {
      try {
        normalizedImage = new URL(image, url).toString();
      } catch {
        normalizedImage = '';
      }
    }

    return {
      name,
      image: normalizedImage,
      icon: fallback.icon
    };
  } catch {
    return fallback;
  }
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host || `${host}:${port}`}`);

  if (req.method === 'OPTIONS' && requestUrl.pathname === '/api/preview') {
    json(res, 204, {});
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/preview') {
    const raw = requestUrl.searchParams.get('url') || '';

    let target;
    try {
      target = new URL(raw);
      if (!['http:', 'https:'].includes(target.protocol)) throw new Error('unsupported');
    } catch {
      json(res, 400, { error: 'Ungültige URL' });
      return;
    }

    const preview = await fetchPreview(target.toString());
    json(res, 200, preview);
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/') {
    const html = htmlPage();
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end(html);
    return;
  }

  res.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('Not Found');
});

server.listen(port, host, () => {
  console.log(`LinkMan running at http://${host}:${port}`);
});
