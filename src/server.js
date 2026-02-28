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

    .icon-btn {
      border: 1px solid #5c4038;
      border-radius: 10px;
      width: 38px;
      height: 38px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(90deg, #3a2e2a 0%, #302522 100%);
      color: #ffd6cc;
      cursor: pointer;
      transition: transform 0.12s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .icon-btn svg {
      width: 18px;
      height: 18px;
      pointer-events: none;
    }

    .icon-btn:hover {
      transform: translateY(-1px);
      border-color: #7c4c40;
      box-shadow: 0 0 14px rgba(255, 69, 0, 0.2);
    }

    .icon-btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    .icon-btn-main {
      background: linear-gradient(90deg, var(--accent-2) 0%, var(--accent) 100%);
      border-color: rgba(255, 150, 121, 0.6);
      color: #fff4f1;
      box-shadow: 0 0 16px rgba(255, 69, 0, 0.26);
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

    .status-text {
      margin: 6px 0 10px;
      min-height: 1.2em;
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
      grid-auto-flow: dense;
      grid-auto-rows: 8px;
      gap: 10px;
      align-items: start;
    }

    .board.group-drop-end {
      border-radius: 10px;
      box-shadow: inset 0 0 0 1px rgba(255, 109, 74, 0.34);
      background: rgba(255, 69, 0, 0.06);
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
      color: #c9978c;
      padding: 4px 9px;
      font-size: 0.78rem;
      letter-spacing: 0.02em;
    }

   .group-card {
      background: linear-gradient(180deg, #111111 0%, #161616 100%);
      border: 1px solid var(--border);
      border-radius: 8px;
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

    .group-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }

    .group-actions {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex: 0 0 auto;
    }

    .group-action-btn {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border-color: #4f413e;
      background: linear-gradient(180deg, #2f2a28 0%, #272321 100%);
      color: #d6b0a7;
      padding: 0;
    }

    .group-action-btn:hover {
      border-color: #786059;
      box-shadow: 0 0 12px rgba(255, 109, 74, 0.16);
    }

    .group-action-btn.group-delete-btn {
      color: #f2b1a0;
      border-color: #65413a;
      background: linear-gradient(180deg, #372624 0%, #2f2120 100%);
    }

    .group-title {
      margin: 0;
      font-size: 0.95rem;
      font-family: "Orbitron", "Space Grotesk", sans-serif;
      letter-spacing: 0.08em;
      color: #ba8e84;
      text-transform: uppercase;
      cursor: text;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .links {
      display: grid;
      gap: 4px;
    }

    .link-item {
    background: linear-gradient(180deg, #111111 0%, #111111 100%);
    border: 1px solid #333333;
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
      width: 16px;
      height: 16px;
      border-radius: 4px;
      background: #ff000000;
      border: 0px solid #dadada;
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
      color: #f2f3f5;
      text-decoration: none;
      font-size: 13px;
    }

    .link-action:hover {
      color: #ffffff;
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

    .modal {
      position: fixed;
      inset: 0;
      z-index: 1200;
    }

    .modal.hidden {
      display: none;
    }

    .modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.58);
      backdrop-filter: blur(1.5px);
    }

    .modal-dialog {
      position: relative;
      width: min(460px, calc(100vw - 24px));
      margin: 8vh auto 0;
      background: linear-gradient(165deg, #252526 0%, #202022 100%);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: var(--shadow);
      padding: 14px;
      animation: reveal 190ms ease-out;
    }

    .modal-title {
      margin: 0 0 6px;
      font-size: 1.05rem;
      font-family: "Orbitron", "Space Grotesk", sans-serif;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #e6bbb1;
    }

    .modal-hint {
      margin: 0 0 10px;
      font-size: 0.84rem;
    }

    .editor-preview {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 0.82rem;
    }

    .editor-preview img {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 1px solid #4a4a4d;
      background: #1d1d1f;
      object-fit: cover;
    }

    .editor-preview img.icon-empty {
      opacity: 0.45;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 2px;
    }

    .btn {
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 7px 12px;
      cursor: pointer;
      font-weight: 700;
      letter-spacing: 0.01em;
      transition: transform 0.12s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .context-menu {
      position: fixed;
      z-index: 1300;
      display: none;
      flex-direction: column;
      min-width: 170px;
      padding: 6px;
      border: 1px solid #4d4d50;
      border-radius: 10px;
      background: linear-gradient(180deg, #242426 0%, #1f1f21 100%);
      box-shadow: var(--shadow);
    }

    .context-menu.open {
      display: flex;
    }

    .context-menu-item {
      border: 1px solid transparent;
      border-radius: 7px;
      background: transparent;
      color: #dfdfe1;
      text-align: left;
      padding: 7px 9px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .context-menu-item:hover,
    .context-menu-item:focus-visible {
      background: rgba(255, 109, 74, 0.14);
      border-color: rgba(255, 109, 74, 0.34);
      transform: none;
      outline: none;
    }

    .context-menu-item.danger {
      color: #ffb8aa;
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

      .modal-dialog { margin-top: 4vh; }
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
      <button id="addGroupBtn" class="icon-btn icon-btn-main" type="button" aria-label="Neue Gruppe hinzufügen" title="Neue Gruppe">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </button>
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
      <p class="muted status-text" id="statusText"></p>

      <section>
        <div id="linksList" class="board"></div>
      </section>
    </main>
  </div>

  <div id="linkEditorModal" class="modal hidden" aria-hidden="true">
    <div class="modal-backdrop" data-close-modal="true"></div>
    <section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="editorTitle">
      <h2 id="editorTitle" class="modal-title">Link hinzufügen</h2>
      <p id="editorGroupHint" class="muted modal-hint"></p>

      <div class="row">
        <label for="editorUrlInput">URL</label>
        <input id="editorUrlInput" type="url" placeholder="https://beispiel.de/artikel" autocomplete="off" />
      </div>

      <div class="row">
        <label for="editorNameInput">Name</label>
        <input id="editorNameInput" type="text" placeholder="Wird automatisch vorgeschlagen" autocomplete="off" />
      </div>

      <div class="editor-preview">
        <span class="muted">Icon</span>
        <img id="editorIconPreview" class="icon-empty" alt="Icon-Vorschau" />
      </div>

      <div class="modal-actions">
        <button id="editorCancelBtn" class="btn btn-secondary" type="button">Abbrechen</button>
        <button id="editorSaveBtn" class="btn btn-main" type="button">Speichern</button>
      </div>
    </section>
  </div>

  <div id="linkContextMenu" class="context-menu" role="menu" aria-hidden="true">
    <button id="ctxEditLinkBtn" class="context-menu-item" type="button" role="menuitem">Bearbeiten</button>
    <button id="ctxDeleteLinkBtn" class="context-menu-item danger" type="button" role="menuitem">Löschen</button>
  </div>

  <script>
    const STORAGE_KEY = 'linkman_data_v1';
    const ICON_PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
    const ICON_TRASH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2M9 10v7M12 10v7M15 10v7M6.8 7l.8 12h8.8l.8-12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const state = {
      categories: [],
      links: [],
      groupOrder: []
    };

    const uiState = {
      editor: {
        open: false,
        mode: 'create',
        groupName: '',
        linkId: '',
        nameTouched: false,
        suggestReqId: 0,
        suggestTimer: 0
      },
      contextMenu: {
        open: false,
        linkId: ''
      }
    };

    const dom = {
      wrap: document.getElementById('wrap'),
      addGroupBtn: document.getElementById('addGroupBtn'),
      linksList: document.getElementById('linksList'),
      statusText: document.getElementById('statusText'),
      linkEditorModal: document.getElementById('linkEditorModal'),
      editorTitle: document.getElementById('editorTitle'),
      editorGroupHint: document.getElementById('editorGroupHint'),
      editorUrlInput: document.getElementById('editorUrlInput'),
      editorNameInput: document.getElementById('editorNameInput'),
      editorIconPreview: document.getElementById('editorIconPreview'),
      editorSaveBtn: document.getElementById('editorSaveBtn'),
      editorCancelBtn: document.getElementById('editorCancelBtn'),
      linkContextMenu: document.getElementById('linkContextMenu'),
      ctxEditLinkBtn: document.getElementById('ctxEditLinkBtn'),
      ctxDeleteLinkBtn: document.getElementById('ctxDeleteLinkBtn')
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

        if (Array.isArray(parsed.categories)) {
          state.categories = [...new Set(parsed.categories.map((item) => String(item).trim()).filter(Boolean))];
        }
        if (Array.isArray(parsed.groupOrder)) {
          state.groupOrder = [...new Set(parsed.groupOrder.map((item) => String(item).trim()).filter(Boolean))];
        }
        if (Array.isArray(parsed.links)) {
          state.links = parsed.links
            .filter((item) => item && item.url)
            .map((item) => {
              const normalized = normalizeUrl(String(item.url || ''));
              if (!normalized) return null;

              const category = String(item.category || '').trim() || 'Allgemein';
              if (!state.categories.includes(category)) state.categories.push(category);

              return {
                id: String(item.id || crypto.randomUUID()),
                url: normalized,
                name: String(item.name || inferNameFromUrl(normalized)),
                category,
                image: String(item.image || ''),
                icon: String(item.icon || domainIcon(normalized))
              };
            })
            .filter(Boolean);
        }

        syncGroupOrder();
      } catch {
        // Ignore corrupt local data and start fresh.
      }
    }

    function setStatus(text, isError = false) {
      dom.statusText.textContent = String(text || '');
      dom.statusText.style.color = isError ? '#ff9b83' : 'var(--muted)';
    }

    function normalizeUrl(input) {
      const trimmed = String(input || '').trim();
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

    async function fetchLinkSuggestion(url) {
      const response = await fetch('/api/preview?url=' + encodeURIComponent(url));
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Preview fehlgeschlagen');
      }
      return {
        name: String(data.name || ''),
        icon: String(data.icon || domainIcon(url))
      };
    }

    function escapeHtmlClient(input) {
      return String(input)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    function splitCategory(category) {
      const raw = String(category || '').trim();
      if (!raw) return { group: 'Sonstiges', section: 'Allgemein' };
      const parts = raw.split('/').map((part) => part.trim()).filter(Boolean);
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

    function applyBoardMasonryLayout() {
      const boardStyle = window.getComputedStyle(dom.linksList);
      const rowHeight = parseFloat(boardStyle.getPropertyValue('grid-auto-rows'));
      const rowGap = parseFloat(boardStyle.getPropertyValue('row-gap'));
      if (!rowHeight || Number.isNaN(rowHeight)) return;

      const cards = dom.linksList.querySelectorAll('.group-card');
      for (const card of cards) {
        card.style.gridRowEnd = 'auto';
      }
      for (const card of cards) {
        const cardHeight = card.getBoundingClientRect().height;
        const span = Math.max(1, Math.ceil((cardHeight + rowGap) / (rowHeight + rowGap)));
        card.style.gridRowEnd = 'span ' + span;
      }
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

    function findInsertIndexForGroup(groupName) {
      for (let i = state.links.length - 1; i >= 0; i--) {
        const split = splitCategory(state.links[i].category);
        if (split.group === groupName) {
          return i + 1;
        }
      }
      return state.links.length;
    }

    function getUniqueGroupName(baseName) {
      const base = String(baseName || 'Neue Gruppe').trim() || 'Neue Gruppe';
      const existing = new Set(syncGroupOrder().map((name) => name.toLowerCase()));
      if (!existing.has(base.toLowerCase())) return base;

      let counter = 2;
      let candidate = base + ' (' + counter + ')';
      while (existing.has(candidate.toLowerCase())) {
        counter++;
        candidate = base + ' (' + counter + ')';
      }
      return candidate;
    }

    function renderEditorIcon(url) {
      if (!url) {
        dom.editorIconPreview.removeAttribute('src');
        dom.editorIconPreview.classList.add('icon-empty');
        return;
      }
      dom.editorIconPreview.src = domainIcon(url);
      dom.editorIconPreview.classList.remove('icon-empty');
    }

    function clearEditorSuggestionTimer() {
      if (uiState.editor.suggestTimer) {
        clearTimeout(uiState.editor.suggestTimer);
        uiState.editor.suggestTimer = 0;
      }
    }

    function closeContextMenu() {
      uiState.contextMenu.open = false;
      uiState.contextMenu.linkId = '';
      dom.linkContextMenu.classList.remove('open');
      dom.linkContextMenu.setAttribute('aria-hidden', 'true');
    }

    function openLinkContextMenu(linkId, x, y) {
      if (!linkId) return;
      uiState.contextMenu.open = true;
      uiState.contextMenu.linkId = linkId;
      dom.linkContextMenu.classList.add('open');
      dom.linkContextMenu.setAttribute('aria-hidden', 'false');
      dom.linkContextMenu.style.left = x + 'px';
      dom.linkContextMenu.style.top = y + 'px';

      const rect = dom.linkContextMenu.getBoundingClientRect();
      const clampedLeft = Math.max(8, Math.min(x, window.innerWidth - rect.width - 8));
      const clampedTop = Math.max(8, Math.min(y, window.innerHeight - rect.height - 8));
      dom.linkContextMenu.style.left = clampedLeft + 'px';
      dom.linkContextMenu.style.top = clampedTop + 'px';
    }

    function openLinkEditorForCreate(groupName) {
      const group = String(groupName || '').trim();
      if (!group) return;

      closeContextMenu();
      clearEditorSuggestionTimer();
      uiState.editor.open = true;
      uiState.editor.mode = 'create';
      uiState.editor.groupName = group;
      uiState.editor.linkId = '';
      uiState.editor.nameTouched = false;
      uiState.editor.suggestReqId++;

      dom.editorTitle.textContent = 'Link hinzufügen';
      dom.editorGroupHint.textContent = 'Gruppe: ' + group;
      dom.editorUrlInput.value = '';
      dom.editorNameInput.value = '';
      renderEditorIcon('');
      dom.linkEditorModal.classList.remove('hidden');
      dom.linkEditorModal.setAttribute('aria-hidden', 'false');
      dom.editorUrlInput.focus();
    }

    function openLinkEditorForEdit(linkId) {
      const link = state.links.find((item) => item.id === linkId);
      if (!link) return;

      const group = splitCategory(link.category).group;
      closeContextMenu();
      clearEditorSuggestionTimer();
      uiState.editor.open = true;
      uiState.editor.mode = 'edit';
      uiState.editor.groupName = group;
      uiState.editor.linkId = link.id;
      uiState.editor.nameTouched = true;
      uiState.editor.suggestReqId++;

      dom.editorTitle.textContent = 'Link bearbeiten';
      dom.editorGroupHint.textContent = 'Gruppe: ' + group;
      dom.editorUrlInput.value = link.url;
      dom.editorNameInput.value = link.name;
      renderEditorIcon(link.url);
      dom.linkEditorModal.classList.remove('hidden');
      dom.linkEditorModal.setAttribute('aria-hidden', 'false');
      dom.editorUrlInput.focus();
      dom.editorUrlInput.select();
    }

    function closeLinkEditor() {
      if (!uiState.editor.open) return;
      clearEditorSuggestionTimer();
      uiState.editor.open = false;
      uiState.editor.suggestReqId++;
      dom.linkEditorModal.classList.add('hidden');
      dom.linkEditorModal.setAttribute('aria-hidden', 'true');
    }

    function scheduleEditorSuggestion() {
      const normalized = normalizeUrl(dom.editorUrlInput.value);
      clearEditorSuggestionTimer();

      if (!normalized) {
        renderEditorIcon('');
        return;
      }

      renderEditorIcon(normalized);
      const requestId = ++uiState.editor.suggestReqId;
      uiState.editor.suggestTimer = setTimeout(async () => {
        if (!uiState.editor.open) return;
        try {
          setStatus('Vorschlag wird geladen...');
          const suggestion = await fetchLinkSuggestion(normalized);
          if (requestId !== uiState.editor.suggestReqId || !uiState.editor.open) return;
          if (!uiState.editor.nameTouched || !dom.editorNameInput.value.trim()) {
            dom.editorNameInput.value = suggestion.name || inferNameFromUrl(normalized);
          }
          setStatus('Vorschlag geladen.');
        } catch {
          if (requestId !== uiState.editor.suggestReqId || !uiState.editor.open) return;
          if (!uiState.editor.nameTouched || !dom.editorNameInput.value.trim()) {
            dom.editorNameInput.value = inferNameFromUrl(normalized);
          }
          setStatus('Konnte keine Vorschau laden. Name wird lokal vorgeschlagen.', true);
        }
      }, 350);
    }

    function addGroup() {
      const groupName = getUniqueGroupName('Neue Gruppe');
      if (!state.categories.includes(groupName)) {
        state.categories.push(groupName);
      }
      syncGroupOrder();
      save();
      renderLinks();
      setStatus('Gruppe hinzugefügt: ' + groupName);
    }

    function deleteGroup(groupName) {
      const group = String(groupName || '').trim();
      if (!group) return;
      closeContextMenu();
      if (!confirm('Gruppe mit allen Links endgültig löschen?')) return;

      state.links = state.links.filter((link) => splitCategory(link.category).group !== group);
      state.categories = state.categories.filter((category) => splitCategory(category).group !== group);
      state.groupOrder = state.groupOrder.filter((name) => name !== group);

      syncGroupOrder();
      save();
      renderLinks();
      setStatus('Gruppe gelöscht: ' + group);
    }

    function saveLinkEditor() {
      const normalized = normalizeUrl(dom.editorUrlInput.value);
      if (!normalized) {
        setStatus('Bitte eine gültige URL eingeben.', true);
        dom.editorUrlInput.focus();
        return;
      }

      const name = dom.editorNameInput.value.trim() || inferNameFromUrl(normalized);
      const icon = domainIcon(normalized);

      if (uiState.editor.mode === 'edit') {
        const index = state.links.findIndex((item) => item.id === uiState.editor.linkId);
        if (index === -1) {
          setStatus('Der Link wurde nicht gefunden.', true);
          closeLinkEditor();
          return;
        }
        state.links[index] = {
          ...state.links[index],
          url: normalized,
          name,
          icon
        };
        setStatus('Link aktualisiert.');
      } else {
        const group = uiState.editor.groupName || 'Neue Gruppe';
        const category = buildCategory(group, 'Allgemein');
        if (!state.categories.includes(category)) state.categories.push(category);

        const newLink = {
          id: crypto.randomUUID(),
          url: normalized,
          name,
          category,
          image: '',
          icon
        };
        const insertIndex = findInsertIndexForGroup(group);
        state.links.splice(insertIndex, 0, newLink);
        setStatus('Link hinzugefügt.');
      }

      syncGroupOrder();
      save();
      renderLinks();
      closeLinkEditor();
    }

    function deleteLink(linkId) {
      const id = String(linkId || '');
      if (!id) return;
      closeContextMenu();
      const exists = state.links.some((link) => link.id === id);
      if (!exists) return;
      if (!confirm('Link endgültig löschen?')) return;

      state.links = state.links.filter((link) => link.id !== id);
      syncGroupOrder();
      save();
      renderLinks();
      setStatus('Link gelöscht.');
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

      if (!categoryGroups.length) {
        dom.linksList.innerHTML = '<div class="empty">Noch keine Gruppen vorhanden. Oben auf + klicken.</div>';
        fitViewport();
        return;
      }

      dom.linksList.innerHTML = categoryGroups.map((groupName) => {
        const groupNameEscaped = escapeHtmlClient(groupName);
        const linkItems = grouped[groupName].map((link) => {
          const icon = escapeHtmlClient(link.icon || domainIcon(link.url));
          const name = escapeHtmlClient(link.name);
          const url = escapeHtmlClient(link.url);
          const id = escapeHtmlClient(link.id);

          return '<article class="link-item" draggable="true" data-link-id="' + id + '" data-group-name="' + groupNameEscaped + '">' +
            '<div class="link-main">' +
              '<img class="favicon" src="' + icon + '" alt="Icon" loading="lazy" />' +
              '<a class="link-action" href="' + url + '" target="_blank" rel="noreferrer noopener">' + name + '</a>' +
            '</div>' +
          '</article>';
        }).join('');

        const content = linkItems || '<div class="group-empty">Links hier ablegen</div>';

        return '<section class="group-card" draggable="true" data-group-name="' + groupNameEscaped + '">' +
          '<header class="group-head">' +
            '<h2 class="group-title" data-group-name="' + groupNameEscaped + '" title="Doppelklick zum Umbenennen">' + groupNameEscaped + '</h2>' +
            '<div class="group-actions">' +
              '<button class="icon-btn group-action-btn group-add-link-btn" type="button" draggable="false" data-group-name="' + groupNameEscaped + '" title="Link hinzufügen" aria-label="Link hinzufügen">' + ICON_PLUS + '</button>' +
              '<button class="icon-btn group-action-btn group-delete-btn" type="button" draggable="false" data-group-name="' + groupNameEscaped + '" title="Gruppe löschen" aria-label="Gruppe löschen">' + ICON_TRASH + '</button>' +
            '</div>' +
          '</header>' +
          '<div class="links" data-group-name="' + groupNameEscaped + '">' + content + '</div>' +
        '</section>';
      }).join('');

      fitViewport();
      requestAnimationFrame(applyBoardMasonryLayout);
    }

    function clearDropStyles() {
      dom.linksList.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
      dom.linksList.querySelectorAll('.drop-before').forEach((el) => el.classList.remove('drop-before'));
      dom.linksList.querySelectorAll('.group-drop-before').forEach((el) => el.classList.remove('group-drop-before'));
      dom.linksList.querySelectorAll('.group-drop-after').forEach((el) => el.classList.remove('group-drop-after'));
      dom.linksList.classList.remove('group-drop-end');
    }

    function clearDragStyles() {
      clearDropStyles();
      dom.linksList.querySelectorAll('.dragging').forEach((el) => el.classList.remove('dragging'));
    }

    function moveLink(draggedId, targetGroupName, beforeId = '') {
      const sourceIndex = state.links.findIndex((item) => item.id === draggedId);
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
        const beforeIndex = state.links.findIndex((item) => item.id === beforeId);
        if (beforeIndex !== -1) insertIndex = beforeIndex;
      }

      state.links.splice(insertIndex, 0, dragged);
      syncGroupOrder();
      save();
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
      if (!dragged || !target || dragged === target) return false;

      const order = [...syncGroupOrder()];
      const fromIndex = order.indexOf(dragged);
      const targetIndex = order.indexOf(target);
      if (fromIndex === -1 || targetIndex === -1) return false;

      const beforeOrder = order.join('\u001f');

      order.splice(fromIndex, 1);
      const adjustedTargetIndex = order.indexOf(target);
      const insertIndex = insertAfter ? adjustedTargetIndex + 1 : adjustedTargetIndex;
      order.splice(insertIndex, 0, dragged);

      if (beforeOrder === order.join('\u001f')) return false;

      state.groupOrder = order;
      save();
      renderLinks();
      setStatus('Kategorie-Container verschoben.');
      return true;
    }

    function moveGroupToEnd(draggedGroupName) {
      const dragged = String(draggedGroupName || '').trim();
      if (!dragged) return false;

      const order = [...syncGroupOrder()];
      const fromIndex = order.indexOf(dragged);
      if (fromIndex === -1) return false;
      if (fromIndex === order.length - 1) return false;

      order.splice(fromIndex, 1);
      order.push(dragged);
      state.groupOrder = order;

      save();
      renderLinks();
      setStatus('Kategorie-Container verschoben.');
      return true;
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
      renderLinks();
      setStatus('Gruppe umbenannt: ' + oldName + ' -> ' + nextName);
    }

    dom.addGroupBtn.addEventListener('click', addGroup);
    dom.editorCancelBtn.addEventListener('click', closeLinkEditor);
    dom.editorSaveBtn.addEventListener('click', saveLinkEditor);

    dom.editorNameInput.addEventListener('input', () => {
      uiState.editor.nameTouched = true;
    });

    dom.editorUrlInput.addEventListener('input', () => {
      scheduleEditorSuggestion();
    });

    dom.editorUrlInput.addEventListener('paste', () => {
      setTimeout(scheduleEditorSuggestion, 40);
    });

    dom.linkEditorModal.addEventListener('click', (event) => {
      if (event.target && event.target.getAttribute('data-close-modal') === 'true') {
        closeLinkEditor();
      }
    });

    dom.linkEditorModal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeLinkEditor();
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        saveLinkEditor();
      }
    });

    dom.linksList.addEventListener('click', (event) => {
      const addButton = event.target.closest('.group-add-link-btn');
      if (addButton) {
        const groupName = addButton.getAttribute('data-group-name') || '';
        openLinkEditorForCreate(groupName);
        return;
      }

      const deleteButton = event.target.closest('.group-delete-btn');
      if (deleteButton) {
        const groupName = deleteButton.getAttribute('data-group-name') || '';
        deleteGroup(groupName);
      }
    });

    dom.linksList.addEventListener('contextmenu', (event) => {
      const linkItem = event.target.closest('.link-item');
      if (!linkItem) return;
      event.preventDefault();

      const linkId = linkItem.getAttribute('data-link-id') || '';
      openLinkContextMenu(linkId, event.clientX, event.clientY);
    });

    dom.ctxEditLinkBtn.addEventListener('click', () => {
      const linkId = uiState.contextMenu.linkId;
      if (!linkId) return;
      openLinkEditorForEdit(linkId);
    });

    dom.ctxDeleteLinkBtn.addEventListener('click', () => {
      const linkId = uiState.contextMenu.linkId;
      deleteLink(linkId);
    });

    document.addEventListener('click', (event) => {
      if (!uiState.contextMenu.open) return;
      if (!dom.linkContextMenu.contains(event.target)) {
        closeContextMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeContextMenu();
      }
    });

    window.addEventListener('scroll', closeContextMenu, true);

    dom.linksList.addEventListener('dragstart', (e) => {
      if (e.target.closest('.group-action-btn')) {
        e.preventDefault();
        return;
      }

      closeContextMenu();
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
        if (!dom.linksList.contains(e.target)) return;

        e.preventDefault();
        clearDropStyles();

        const targetCard = e.target.closest('.group-card');
        if (!targetCard) {
          dom.linksList.classList.add('group-drop-end');
          return;
        }

        const targetGroup = targetCard.getAttribute('data-group-name') || '';
        if (!targetGroup || targetGroup === dragState.groupName) {
          dom.linksList.classList.add('group-drop-end');
          return;
        }

        targetCard.classList.add('drag-over');
        if (shouldInsertAfter(e, targetCard)) {
          targetCard.classList.add('group-drop-after');
        } else {
          targetCard.classList.add('group-drop-before');
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
        if (!dom.linksList.contains(e.target)) return;

        e.preventDefault();
        clearDropStyles();

        const targetCard = e.target.closest('.group-card');
        if (!targetCard) {
          moveGroupToEnd(dragState.groupName);
          dragState.groupName = null;
          clearDragStyles();
          return;
        }

        const targetGroup = targetCard.getAttribute('data-group-name') || '';
        if (!targetGroup || targetGroup === dragState.groupName) {
          dragState.groupName = null;
          clearDragStyles();
          return;
        }

        const insertAfter = shouldInsertAfter(e, targetCard);
        const moved = moveGroup(dragState.groupName, targetGroup, insertAfter);
        if (!moved && insertAfter) {
          moveGroupToEnd(dragState.groupName);
        }
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
      if (e.target.closest('.group-actions')) return;

      const title = e.target.closest('.group-title');
      if (!title) return;

      const oldName = title.getAttribute('data-group-name') || title.textContent || '';
      const input = document.createElement('input');
      input.type = 'text';
      input.value = oldName;
      input.style.width = '100%';
      input.style.marginBottom = '8px';

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

    load();
    renderLinks();
    setStatus('Bereit.');
    window.addEventListener('resize', () => {
      closeContextMenu();
      fitViewport();
      requestAnimationFrame(applyBoardMasonryLayout);
    });
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
