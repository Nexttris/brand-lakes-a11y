/*!
 * Brand Lakes Accessibility Preferences Widget
 * v1.0.0 — https://www.brandlakes.com
 *
 * A lightweight display-preferences panel: text size, contrast, link
 * highlighting, readable font, text spacing, image hiding, animation pause,
 * and a large cursor. It is a personalization layer only. It does not inject
 * ARIA, auto-fix markup, or claim compliance with any standard.
 *
 * Install (Webflow → Site settings → Custom code → Footer):
 *   <script src="https://cdn.jsdelivr.net/gh/Nexttris/brand-lakes-a11y@1/dist/bl-a11y.min.js"
 *           data-color="#1f6feb" data-position="right" defer></script>
 *
 * Options (data attributes on the script tag):
 *   data-color      accent color (hex). Default #1f6feb
 *   data-position   "right" | "left". Default "right"
 *   data-offset     distance from the screen edge in px. Default 20
 *   data-features   comma list to limit features, e.g. "textSize,contrast,links"
 *   data-branding   "false" to hide the "Brand Lakes" footer line
 *   data-statement  URL of the site's accessibility statement page (adds a link)
 */
(function () {
  'use strict';
  if (window.__blA11y) return;
  window.__blA11y = true;

  var STORE = 'bl-a11y:v1';
  var ROOT_ID = 'bl-a11y';
  var STYLE_ID = 'bl-a11y-page-css';

  // ---------- config ----------
  var tag = document.currentScript || document.querySelector('script[src*="bl-a11y"]');
  function attr(name, fallback) {
    var v = tag && tag.getAttribute('data-' + name);
    return v === null || v === undefined || v === '' ? fallback : v;
  }
  var cfg = {
    color: attr('color', '#1f6feb'),
    position: attr('position', 'right') === 'left' ? 'left' : 'right',
    offset: parseInt(attr('offset', '20'), 10) || 20,
    features: attr('features', '').split(',').map(function (s) { return s.trim(); }).filter(Boolean),
    branding: attr('branding', 'true') !== 'false',
    statement: attr('statement', '')
  };

  // ---------- state ----------
  var DEFAULTS = { textSize: 0, contrast: false, links: false, font: false, spacing: false, images: false, motion: false, cursor: false };
  var TEXT_STEPS = [1, 1.125, 1.25, 1.5];
  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return copy(DEFAULTS);
      var s = JSON.parse(raw);
      var out = copy(DEFAULTS);
      for (var k in out) if (k in s) out[k] = s[k];
      if (typeof out.textSize !== 'number' || out.textSize < 0 || out.textSize >= TEXT_STEPS.length) out.textSize = 0;
      return out;
    } catch (e) { return copy(DEFAULTS); }
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  function copy(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }
  function isDefault() { for (var k in DEFAULTS) if (state[k] !== DEFAULTS[k]) return false; return true; }

  // ---------- feature definitions ----------
  var FEATURES = [
    { id: 'textSize', label: 'Text size', type: 'step', icon: 'M4 7V4h16v3M9 20h6M12 4v16' },
    { id: 'contrast', label: 'High contrast', type: 'toggle', icon: 'M12 3a9 9 0 1 0 0 18V3z|M12 3a9 9 0 1 1 0 18' },
    { id: 'links', label: 'Highlight links', type: 'toggle', icon: 'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1|M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1' },
    { id: 'font', label: 'Readable font', type: 'toggle', icon: 'M4 20L11 4h2l7 16|M7 14h10' },
    { id: 'spacing', label: 'Text spacing', type: 'toggle', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'images', label: 'Hide images', type: 'toggle', icon: 'M3 5h18v14H3z|M3 15l5-5 4 4 3-3 6 6|M3 3l18 18' },
    { id: 'motion', label: 'Pause animations', type: 'toggle', icon: 'M8 5v14M16 5v14' },
    { id: 'cursor', label: 'Big cursor', type: 'toggle', icon: 'M5 3l14 8-6 2-2 6z' }
  ];
  if (cfg.features.length) FEATURES = FEATURES.filter(function (f) { return cfg.features.indexOf(f.id) !== -1; });

  // ---------- page-level CSS (lives in the document, not the shadow root) ----------
  var NOT_WIDGET = ':not(#' + ROOT_ID + '):not(#' + ROOT_ID + ' *)';
  var CURSOR = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'><path d='M5 3l14 8-6 2-2 6z' fill='white' stroke='black' stroke-width='1.5' stroke-linejoin='round'/></svg>\") 4 2, auto";
  var pageCss = [
    // High contrast: black background, white text, yellow links, white borders. Media untouched.
    'html.bla-contrast, html.bla-contrast body, html.bla-contrast body *' + NOT_WIDGET + ':not(img):not(picture):not(video):not(svg):not(svg *):not(iframe):not(canvas):not(input[type=checkbox]):not(input[type=radio]):not(a):not(a *){background-color:#000!important;background-image:none!important;color:#fff!important;border-color:#fff!important;text-shadow:none!important;box-shadow:none!important}',
    'html.bla-contrast body a' + NOT_WIDGET + ', html.bla-contrast body a' + NOT_WIDGET + ' *{background-color:#000!important;background-image:none!important;color:#ffff00!important;border-color:#fff!important}',
    'html.bla-contrast body button' + NOT_WIDGET + ', html.bla-contrast body [role=button]' + NOT_WIDGET + ', html.bla-contrast body input' + NOT_WIDGET + ', html.bla-contrast body select' + NOT_WIDGET + ', html.bla-contrast body textarea' + NOT_WIDGET + '{outline:2px solid #fff!important;outline-offset:2px}',
    'html.bla-contrast body ::placeholder{color:#ccc!important}',
    'html.bla-contrast body img' + NOT_WIDGET + ', html.bla-contrast body video' + NOT_WIDGET + '{opacity:1!important}',
    // Highlight links
    'html.bla-links body a' + NOT_WIDGET + '{text-decoration:underline!important;text-decoration-thickness:2px!important;text-underline-offset:3px!important;font-weight:700!important;outline:2px solid currentColor!important;outline-offset:2px!important}',
    // Readable font
    'html.bla-font body, html.bla-font body *' + NOT_WIDGET + ':not(i):not(.fa):not([class*="icon"]):not(svg):not(svg *){font-family:Arial,Helvetica,"Segoe UI",system-ui,sans-serif!important;font-style:normal!important;letter-spacing:0!important}',
    // Text spacing (WCAG 1.4.12 values)
    'html.bla-spacing body *' + NOT_WIDGET + ':not(svg):not(svg *){line-height:1.8!important;letter-spacing:.08em!important;word-spacing:.16em!important}',
    'html.bla-spacing body p' + NOT_WIDGET + ', html.bla-spacing body li' + NOT_WIDGET + '{margin-bottom:1.5em!important}',
    // Hide images
    'html.bla-images body img' + NOT_WIDGET + ', html.bla-images body picture' + NOT_WIDGET + ', html.bla-images body video' + NOT_WIDGET + ', html.bla-images body iframe' + NOT_WIDGET + '{visibility:hidden!important}',
    'html.bla-images body *' + NOT_WIDGET + '{background-image:none!important}',
    // Pause animations
    'html.bla-motion body *' + NOT_WIDGET + ', html.bla-motion body *' + NOT_WIDGET + '::before, html.bla-motion body *' + NOT_WIDGET + '::after{animation-play-state:paused!important;transition:none!important;scroll-behavior:auto!important}',
    // Big cursor
    'html.bla-cursor, html.bla-cursor body, html.bla-cursor body *{cursor:' + CURSOR + '!important}'
  ].join('\n');

  // ---------- widget CSS (shadow root) ----------
  var widgetCss = [
    ':host{all:initial}',
    '*{box-sizing:border-box;margin:0;padding:0}',
    '.wrap{position:fixed;z-index:2147483000;bottom:' + cfg.offset + 'px;' + cfg.position + ':' + cfg.offset + 'px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.3;color:#111;-webkit-font-smoothing:antialiased}',
    '.btn{width:52px;height:52px;border-radius:50%;border:0;background:' + cfg.color + ';color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.25);transition:transform .15s ease}',
    '.btn:hover{transform:scale(1.06)}',
    '.btn:focus-visible,.item:focus-visible,.link:focus-visible,.reset:focus-visible,.close:focus-visible,.step button:focus-visible{outline:3px solid #111;outline-offset:3px}',
    '.btn svg{width:30px;height:30px}',
    '.panel{display:none;position:absolute;bottom:64px;' + cfg.position + ':0;width:320px;max-width:calc(100vw - ' + (cfg.offset * 2) + 'px);max-height:calc(100vh - ' + (cfg.offset * 2 + 64) + 'px);overflow:auto;overscroll-behavior:contain;background:#fff;color:#111;border-radius:16px;box-shadow:0 14px 48px rgba(0,0,0,.28);border:1px solid rgba(0,0,0,.08)}',
    '.panel.open{display:block}',
    '.head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;border-bottom:1px solid #eee;position:sticky;top:0;background:#fff;z-index:1}',
    'h2{font-size:16px;font-weight:700;color:#111}',
    '.close{width:34px;height:34px;border-radius:50%;border:0;background:#f1f1f1;color:#111;cursor:pointer;display:flex;align-items:center;justify-content:center}',
    '.close:hover{background:#e3e3e3}.close svg{width:16px;height:16px}',
    '.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px}',
    '.item{display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:10px;min-height:84px;padding:12px;border-radius:12px;border:2px solid #e6e6e6;background:#fafafa;color:#111;text-align:left;cursor:pointer;font:inherit;font-size:14px;font-weight:600}',
    '.item:hover{border-color:#c9c9c9;background:#f3f3f3}',
    '.item[aria-pressed=true]{border-color:' + cfg.color + ';background:' + cfg.color + ';color:#fff}',
    '.item svg{width:22px;height:22px}',
    '.item .lab{display:flex;align-items:center;gap:6px;width:100%;justify-content:space-between}',
    '.dot{width:10px;height:10px;border-radius:50%;background:#d0d0d0;flex:none}',
    '.item[aria-pressed=true] .dot{background:#fff}',
    '.step{grid-column:1 / -1;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:12px;border:2px solid #e6e6e6;background:#fafafa;font-size:14px;font-weight:600}',
    '.step svg{width:22px;height:22px;vertical-align:-6px;margin-right:4px}',
    '.step .ctl{display:flex;align-items:center;gap:6px}',
    '.step button{width:36px;height:36px;border-radius:10px;border:2px solid #e6e6e6;background:#fff;color:#111;font:inherit;font-weight:700;font-size:15px;cursor:pointer}',
    '.step button:hover:not(:disabled){border-color:' + cfg.color + ';color:' + cfg.color + '}',
    '.step button:disabled{opacity:.4;cursor:default}',
    '.step .val{min-width:46px;text-align:center;font-variant-numeric:tabular-nums}',
    '.foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px 14px;border-top:1px solid #eee;font-size:12px;color:#555}',
    '.reset{border:0;background:transparent;color:' + cfg.color + ';font:inherit;font-size:13px;font-weight:700;cursor:pointer;padding:6px 8px;border-radius:8px}',
    '.reset:hover{background:#f1f1f1}',
    '.link{color:#555;text-decoration:underline}',
    '.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    '@media (max-width:480px){.panel{position:fixed;left:12px;right:12px;bottom:84px;width:auto;max-width:none}}',
    '@media (prefers-reduced-motion:reduce){.btn{transition:none}}'
  ].join('\n');

  // ---------- helpers ----------
  function el(name, attrs, children) {
    var n = document.createElement(name);
    for (var k in attrs || {}) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function icon(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      paths.split('|').map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</svg>';
  }
  var ACCESS_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4.5" r="2.2"/><path d="M4 8.2c2.6.9 5.3 1.3 8 1.3s5.4-.4 8-1.3l.6 1.9c-1.9.7-3.8 1.1-5.8 1.3v2.2l2.5 7.1-1.9.7-2.3-6.4h-1.2l-2.3 6.4-1.9-.7 2.5-7.1v-2.2c-2-.2-3.9-.6-5.8-1.3z"/></svg>';

  // ---------- text size (scales from each element's original size) ----------
  var SCALED = [];
  var TEXT_TAGS = /^(P|H1|H2|H3|H4|H5|H6|LI|A|SPAN|BUTTON|LABEL|INPUT|TEXTAREA|SELECT|TD|TH|BLOCKQUOTE|FIGCAPTION|DT|DD|SMALL|STRONG|EM|B|I|DIV|SUMMARY|LEGEND|CAPTION)$/;
  function hasText(node) {
    for (var c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3 && /\S/.test(c.nodeValue)) return true;
    }
    return /^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName);
  }
  function collect() {
    var all = document.body.querySelectorAll('*');
    var root = document.getElementById(ROOT_ID);
    for (var i = 0; i < all.length; i++) {
      var n = all[i];
      if (n === root || (root && root.contains(n))) continue;
      if (!TEXT_TAGS.test(n.tagName) || !hasText(n)) continue;
      if (n.__blfs === undefined) n.__blfs = parseFloat(getComputedStyle(n).fontSize) || 16;
      SCALED.push(n);
    }
  }
  function applyTextSize() {
    var scale = TEXT_STEPS[state.textSize];
    if (scale === 1 && !SCALED.length) return;
    if (!SCALED.length) collect();
    SCALED.forEach(function (n) {
      if (scale === 1) n.style.removeProperty('font-size');
      else n.style.setProperty('font-size', (n.__blfs * scale) + 'px', 'important');
    });
    if (scale === 1) SCALED = [];
  }

  // ---------- apply all ----------
  function apply() {
    var h = document.documentElement;
    ['contrast', 'links', 'font', 'spacing', 'images', 'motion', 'cursor'].forEach(function (k) {
      h.classList.toggle('bla-' + k, !!state[k]);
    });
    if (state.motion) {
      var vids = document.querySelectorAll('video[autoplay]');
      for (var i = 0; i < vids.length; i++) { try { vids[i].pause(); } catch (e) {} }
    }
    applyTextSize();
    if (ui.built) render();
    save();
  }

  // ---------- UI ----------
  var ui = { built: false };
  function build() {
    if (!document.head.querySelector('#' + STYLE_ID)) {
      document.head.appendChild(el('style', { id: STYLE_ID, text: pageCss }));
    }
    var host = el('div', { id: ROOT_ID, 'data-lenis-prevent': '' });
    var shadow = host.attachShadow({ mode: 'open' });
    shadow.appendChild(el('style', { text: widgetCss }));

    var wrap = el('div', { 'class': 'wrap' });
    var panelId = 'bla-panel';
    var btn = el('button', { 'class': 'btn', type: 'button', 'aria-label': 'Accessibility options', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': panelId, html: ACCESS_ICON });

    var panel = el('div', { 'class': 'panel', id: panelId, role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'bla-title', 'data-lenis-prevent': '' });
    var close = el('button', { 'class': 'close', type: 'button', 'aria-label': 'Close accessibility options', html: icon('M6 6l12 12|M18 6L6 18') });
    panel.appendChild(el('div', { 'class': 'head' }, [el('h2', { id: 'bla-title', text: 'Accessibility options' }), close]));

    var grid = el('div', { 'class': 'grid' });
    var live = el('div', { 'class': 'sr', 'aria-live': 'polite' });
    ui.controls = {};
    FEATURES.forEach(function (f) {
      if (f.type === 'step') {
        var dec = el('button', { type: 'button', 'aria-label': 'Decrease text size', text: '−' });
        var inc = el('button', { type: 'button', 'aria-label': 'Increase text size', text: '+' });
        var val = el('span', { 'class': 'val', 'aria-hidden': 'true', text: '100%' });
        var row = el('div', { 'class': 'step' }, [
          el('span', { html: icon(f.icon) + ' ' + f.label }),
          el('div', { 'class': 'ctl' }, [dec, val, inc])
        ]);
        dec.addEventListener('click', function () { if (state.textSize > 0) { state.textSize--; announce(); apply(); } });
        inc.addEventListener('click', function () { if (state.textSize < TEXT_STEPS.length - 1) { state.textSize++; announce(); apply(); } });
        function announce() { live.textContent = 'Text size ' + Math.round(TEXT_STEPS[state.textSize] * 100) + ' percent'; }
        ui.controls[f.id] = { dec: dec, inc: inc, val: val };
        grid.appendChild(row);
      } else {
        var item = el('button', { 'class': 'item', type: 'button', 'aria-pressed': 'false', html: icon(f.icon) + '<span class="lab"><span>' + f.label + '</span><span class="dot" aria-hidden="true"></span></span>' });
        item.addEventListener('click', (function (id, label) {
          return function () { state[id] = !state[id]; live.textContent = label + (state[id] ? ' on' : ' off'); apply(); };
        })(f.id, f.label));
        ui.controls[f.id] = item;
        grid.appendChild(item);
      }
    });
    panel.appendChild(grid);

    var reset = el('button', { 'class': 'reset', type: 'button', text: 'Reset all' });
    ui.resetBtn = reset;
    reset.addEventListener('click', function () { state = copy(DEFAULTS); live.textContent = 'All settings reset'; apply(); });
    var footRight = el('span');
    if (cfg.statement) footRight.appendChild(el('a', { 'class': 'link', href: cfg.statement, text: 'Accessibility statement' }));
    else if (cfg.branding) footRight.appendChild(el('a', { 'class': 'link', href: 'https://www.brandlakes.com', target: '_blank', rel: 'noopener', text: 'Brand Lakes' }));
    panel.appendChild(el('div', { 'class': 'foot' }, [reset, footRight]));
    panel.appendChild(live);

    wrap.appendChild(panel);
    wrap.appendChild(btn);
    shadow.appendChild(wrap);
    document.body.appendChild(host);

    // open / close
    function open() {
      panel.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      close.focus();
      document.addEventListener('keydown', onKey);
      document.addEventListener('pointerdown', onOutside, true);
    }
    function shut(refocus) {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onOutside, true);
      if (refocus !== false) btn.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); shut(); return; }
      if (e.key === 'Tab') {
        var f = panel.querySelectorAll('button:not(:disabled),a[href]');
        var first = f[0], last = f[f.length - 1], active = shadow.activeElement;
        if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      }
    }
    function onOutside(e) { if (!host.contains(e.target) && e.composedPath().indexOf(host) === -1) shut(false); }
    btn.addEventListener('click', function () { panel.classList.contains('open') ? shut() : open(); });
    close.addEventListener('click', function () { shut(); });

    ui.built = true;
    render();
  }

  function render() {
    FEATURES.forEach(function (f) {
      var c = ui.controls[f.id];
      if (!c) return;
      if (f.type === 'step') {
        c.val.textContent = Math.round(TEXT_STEPS[state.textSize] * 100) + '%';
        c.dec.disabled = state.textSize === 0;
        c.inc.disabled = state.textSize === TEXT_STEPS.length - 1;
      } else {
        c.setAttribute('aria-pressed', state[f.id] ? 'true' : 'false');
      }
    });
    if (ui.resetBtn) ui.resetBtn.disabled = isDefault();
  }

  // ---------- boot ----------
  function boot() {
    if (!document.body) return setTimeout(boot, 30);
    // Apply saved page-level settings right away, then build the UI.
    if (!document.head.querySelector('#' + STYLE_ID)) document.head.appendChild(el('style', { id: STYLE_ID, text: pageCss }));
    apply();
    build();
    // Re-apply text size once fonts/layout settle (web fonts can change computed sizes).
    if (state.textSize > 0) setTimeout(function () { SCALED = []; applyTextSize(); }, 800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
