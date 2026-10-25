/* core.js - tool registry, routing, search and shared UI helpers */

window.ToolNez = (() => {

  /* ---------------------------------------------------------- DOM helpers */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bytes = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
  const num = (n, d = 2) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const secs = s => { s = Math.max(0, s); const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`; };

  /* ---------------------------------------------------------- icons */
  const P = {
    image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17l4.6-4.4a2 2 0 012.8 0L20 20"/>',
    shrink: '<path d="M4 4h5M4 4v5M4 4l6 6M20 20h-5M20 20v-5M20 20l-6-6"/><rect x="9" y="9" width="6" height="6" rx="1.2"/>',
    resize: '<rect x="3" y="3" width="13" height="13" rx="2"/><path d="M20 10v9a1.5 1.5 0 01-1.5 1.5H10"/><path d="M13 13l6 6M19 15v4h-4"/>',
    crop: '<path d="M6 2v14.5A1.5 1.5 0 007.5 18H22"/><path d="M2 6h14.5A1.5 1.5 0 0118 7.5V22"/>',
    drop: '<path d="M12 3s6 6.2 6 10a6 6 0 01-12 0c0-3.8 6-10 6-10z"/><path d="M9.5 14.2a2.8 2.8 0 002.5 2.2"/>',
    palette: '<path d="M12 3a9 9 0 100 18c1.4 0 2-1 1.5-2-.6-1.2.2-2.3 1.5-2.3H17a4 4 0 004-4c0-5-4-9.7-9-9.7z"/><circle cx="7.8" cy="11" r="1"/><circle cx="10.5" cy="7.4" r="1"/><circle cx="15" cy="8.2" r="1"/>',
    star: '<path d="M12 3.6l2.5 5.2 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8z"/>',
    video: '<rect x="2.5" y="5.5" width="14" height="13" rx="2.5"/><path d="M16.5 10.5l5-3v9l-5-3z"/>',
    scissors: '<circle cx="6" cy="6" r="2.6"/><circle cx="6" cy="18" r="2.6"/><path d="M8.2 7.6L20 18M20 6L8.2 16.4"/>',
    gif: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M11 9.5H9a2 2 0 00-2 2v1a2 2 0 002 2h1.3v-2M13.5 9.5v5M16 14.5v-5h3M16 12h2.3"/>',
    music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    frames: '<rect x="3" y="6" width="12" height="12" rx="2"/><path d="M8 3h11a2 2 0 012 2v11"/>',
    pdf: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 14h1.2a1.2 1.2 0 000-2.4H9V17"/>',
    stack: '<path d="M12 3l9 4.5-9 4.5-9-4.5z"/><path d="M3 12l9 4.5 9-4.5"/><path d="M3 16.5L12 21l9-4.5"/>',
    text: '<path d="M4 6h16M4 12h11M4 18h7"/>',
    markdown: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M6 15.5v-7l3 3.4 3-3.4v7M16 8.5v5M16 13.5l-1.8-2M16 13.5l1.8-2"/>',
    key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M15.5 12v2.2"/>',
    hash: '<path d="M6 4.5L4.8 19.5M13 4.5L11.8 19.5M4 9h15.5M3.4 15h15.5"/>',
    code: '<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>',
    percent: '<path d="M19 5L5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
    scale: '<path d="M12 4v16M7 8h10"/><path d="M5 20h14"/><path d="M4 12l3-4 3 4a3 3 0 01-6 0zM14 12l3-4 3 4a3 3 0 01-6 0z"/>',
    bank: '<path d="M3 9.5L12 4l9 5.5"/><path d="M5 10v8M9.6 10v8M14.4 10v8M19 10v8M3 20.5h18"/>',
    trend: '<path d="M3 17l5.5-5.5 3.5 3.5L21 6"/><path d="M15 6h6v6"/>',
    cake: '<path d="M4 20h16M5 20v-6a2 2 0 012-2h10a2 2 0 012 2v6"/><path d="M12 12V8M9 8V6M15 8V6"/>',
    ruler: '<rect x="2" y="8" width="20" height="8" rx="2" transform="rotate(-8 12 12)"/><path d="M6.5 9.5v3M10 9v3M13.5 8.5v3M17 8v3"/>',
    plate: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/>',
    link: '<path d="M10 13.5a4 4 0 006 .5l2-2a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10.5a4 4 0 00-6-.5l-2 2a4 4 0 005.7 5.7l1-1"/>',
    braces: '<path d="M8 4c-2 0-2 3-2 4s0 2.5-2 4c2 1.5 2 3 2 4s0 4 2 4M16 4c2 0 2 3 2 4s0 2.5 2 4c-2 1.5-2 3-2 4s0 4-2 4"/>',
    divide: '<circle cx="12" cy="6.5" r="1.3"/><circle cx="12" cy="17.5" r="1.3"/><path d="M5 12h14"/>',
    download: '<path d="M12 3v12M7.5 10.5L12 15l4.5-4.5"/><path d="M4 18v2.5h16V18"/>',
    upload: '<path d="M12 16V4M7.5 8.5L12 4l4.5 4.5"/><path d="M4 17v3h16v-3"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 5.5A1.5 1.5 0 0014.5 4h-9A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/>',
    eraser: '<path d="M8.5 20H20"/><path d="M15.5 4.5l4 4a1.6 1.6 0 010 2.3l-7.2 7.2H8.6l-3.1-3.1a1.6 1.6 0 010-2.3l7.7-7.7a1.6 1.6 0 012.3 0z"/><path d="M10.2 7.8l6 6"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/>'
  };
  const icon = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || P.info}</svg>`;

  /* ---------------------------------------------------------- categories */
  const CATS = {
    image: { name: 'Image', blurb: 'Convert, compress and retouch photos without installing anything.' },
    video: { name: 'Video', blurb: 'Trim, compress and export clips straight from the browser.' },
    pdf: { name: 'PDF', blurb: 'Put documents together and take them apart again.' },
    text: { name: 'Text', blurb: 'Write, count and tidy up. The boring part, done fast.' },
    calc: { name: 'Calculators', blurb: 'Everyday numbers: money, health, units and dates.' },
    util: { name: 'Utilities', blurb: 'Passwords, hashes and the developer odds and ends you reach for daily.' }
  };
  const CAT_ORDER = ['image', 'video', 'pdf', 'text', 'calc', 'util'];

  /* ---------------------------------------------------------- registry */
  const TOOLS = [];
  const tool = def => { TOOLS.push(def); return def; };
  const find = id => TOOLS.find(t => t.id === id);

  /* ---------------------------------------------------------- local state */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('tn.' + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('tn.' + k, JSON.stringify(v)); } catch { } }
  };
  const favs = () => store.get('favs', []);
  const toggleFav = id => {
    const f = favs(), i = f.indexOf(id);
    i < 0 ? f.push(id) : f.splice(i, 1);
    store.set('favs', f);
    return i < 0;
  };
  const pushRecent = id => {
    const r = store.get('recent', []).filter(x => x !== id);
    r.unshift(id); store.set('recent', r.slice(0, 6));
  };

  /* ---------------------------------------------------------- notices */
  let toastT;
  function toast(msg, bad = false) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('bad', !!bad);
    t.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('on'), 2600);
  }
  function download(blob, name) {
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(u), 8000);
    toast('Saved: ' + name);
  }
  async function copy(text, what = 'Content') {
    try { await navigator.clipboard.writeText(text); toast(what + ' copied'); }
    catch { toast('Your browser blocked the clipboard', true); }
  }

  /* ---------------------------------------------------------- files */
  function dropzone(label = 'Drag your files here', hint = 'or click to pick them', accept = '*/*', multiple = true) {
    return `<div class="dropzone" data-dz tabindex="0" role="button">
      ${icon('upload')}<b>${label}</b><span>${hint}</span>
      <input type="file" accept="${accept}" ${multiple ? 'multiple' : ''} hidden>
    </div>`;
  }
  function onFiles(root, cb) {
    const dz = $('[data-dz]', root); if (!dz) return;
    const input = $('input[type=file]', dz);
    const fire = list => { const f = [...list]; if (f.length) cb(f); };
    dz.addEventListener('click', e => { if (e.target !== input) input.click(); });
    dz.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    input.addEventListener('change', () => { fire(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, () => dz.classList.remove('over')));
    dz.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); fire(e.dataTransfer.files); });
    // dropping anywhere on the panel works too
    const box = dz.closest('.box') || root;
    box.addEventListener('dragover', e => e.preventDefault());
    box.addEventListener('drop', e => { e.preventDefault(); fire(e.dataTransfer.files); });
  }
  const loadImage = file => new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('Not a readable image: ' + file.name));
    i.src = URL.createObjectURL(file);
  });
  const drawTo = (img, w, h) => {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(img, 0, 0, c.width, c.height);
    return c;
  };
  const toBlob = (canvas, type, q) => new Promise(r => canvas.toBlob(r, type, q));
  const stem = n => n.replace(/\.[^.]+$/, '');

  /* Shared results panel: preview plus single or bundled download */
  function results(container, items, zipName) {
    if (!items.length) { container.innerHTML = ''; return; }
    container.innerHTML = items.map((it, i) => `
      <div class="frow">
        ${it.thumb ? `<img src="${it.thumb}" alt="">` : ''}
        <div class="meta"><b>${esc(it.name)}</b><span>${esc(it.note || '')}</span></div>
        ${it.badge ? `<span class="pill ${it.badgeOk ? 'good' : ''}">${esc(it.badge)}</span>` : ''}
        <button class="btn sm" data-get="${i}">${icon('download')}Save</button>
      </div>`).join('') +
      (items.length > 1 ? `<div class="actions"><button class="btn sec" data-zip>${icon('stack')}Download all ${items.length} as a ZIP</button></div>` : '');
    $$('[data-get]', container).forEach(b => b.onclick = () => {
      const it = items[+b.dataset.get]; download(it.blob, it.name);
    });
    const z = $('[data-zip]', container);
    if (z) z.onclick = async () => {
      z.disabled = true; z.innerHTML = '<i class="spin"></i>Zipping…';
      download(await makeZip(items.map(i => ({ name: i.name, blob: i.blob }))), zipName || 'toolnez.zip');
      z.disabled = false; z.innerHTML = icon('stack') + `Download all ${items.length} as a ZIP`;
    };
  }

  /* Ads are permitted only on separate editorial reading pages. */
  function refreshAds() { window.ToolNezAds?.render(); }

  /* ---------------------------------------------------------- views */
  const card = t => `
    <article class="tcard rise">
      <button class="fav ${favs().includes(t.id) ? 'on' : ''}" data-fav="${t.id}" title="Save to favourites" aria-label="Favourite ${esc(t.name)}">${icon('star')}</button>
      <a class="cardlink" href="/tools/${t.id}" data-link>
        <span class="ic">${icon(t.icon)}</span><span><h3>${esc(t.name)}</h3><p>${esc(t.tagline)}</p></span>
      </a>
    </article>`;
  const guideCards = () => Object.entries(window.ToolNezGuides).map(([id,g]) => `<a class="tcard" href="/guides/${id}" data-link><span><h3>${esc(g.title)}</h3><p>${esc(g.description)}</p></span></a>`).join('');

  function homeView() {
    const rec = store.get('recent', []).map(find).filter(Boolean);
    const fv = favs().map(find).filter(Boolean);
    const shortcuts = (fv.length ? fv : rec).slice(0, 6);
    const sections = CAT_ORDER.map((k, i) => {
      const list = TOOLS.filter(t => t.cat === k);
      return `<section class="sect" id="${k}">
        <div class="sect-head">
          <div><h2>${CATS[k].name}</h2><p>${CATS[k].blurb}</p></div>
          <a href="/c/${k}" data-link>See all ${list.length} &rarr;</a>
        </div>
        <div class="cards">${list.map(card).join('')}</div>
      </section>`;
    }).join('');

    return `<div class="wrap">
      <section class="hero">
        <span class="kicker"><i></i>${TOOLS.length} tools &middot; free &middot; no sign-up</span>
        <h1>Every small job you keep looking up, in one place.</h1>
        <p class="lead">Converting an image, trimming a clip, building a PDF or working out a loan payment
        should take seconds, not a detour through three different sites. These tools are <b>free, unlimited
        and free of watermarks</b>, and run in your browser. Export support and processing speed depend on your device.</p>
        <div class="hero-actions">
          <a class="btn" href="/c/image" data-link>${icon('image')}Start with images</a>
          <a class="btn sec" href="/c/video" data-link>${icon('video')}Video tools</a>
        </div>
        ${shortcuts.length ? `<div class="recent"><span class="lbl">${fv.length ? 'Your favourites' : 'Pick up where you left off'}:</span>
          ${shortcuts.map(t => `<a class="chip" href="/tools/${t.id}" data-link>${icon(t.icon)}${t.name}</a>`).join('')}</div>` : ''}
      </section>
      ${sections}<section class="sect"><div class="sect-head"><div><h2>Practical guides</h2><p>Choose a workflow and check the result before sharing it.</p></div></div><div class="cards">${guideCards()}</div></section>
      <section class="sect">
        <div class="sect-head"><div><h2>How this is put together</h2></div></div>
        <div class="cards">
          <div class="tcard"><span class="ic">${icon('shield')}</span><span><h3>No account, ever</h3>
            <p>Nothing to sign up for, nothing to verify. Open a tool, use it, close the tab.</p></span></div>
          <div class="tcard"><span class="ic">${icon('stack')}</span><span><h3>Batches and ZIPs</h3>
            <p>Drop twenty photos, convert them in one go and grab them all in a single archive.</p></span></div>
          <div class="tcard"><span class="ic">${icon('info')}</span><span><h3>It remembers your settings</h3>
            <p>Some tool settings and favourites stay in this browser. Export important drafts before clearing site data.</p></span></div>
          <div class="tcard"><span class="ic">${icon('key')}</span><span><h3>Free to use</h3>
            <p>No paid tier or account is required. Read the tool instructions for browser and export limitations.</p></span></div>
        </div>
      </section>
    </div>`;
  }

  function catView(k) {
    const c = CATS[k]; if (!c) return homeView();
    const list = TOOLS.filter(t => t.cat === k);
    return `<div class="wrap">
      <div class="crumb"><a href="/" data-link>Home</a> / <span>${c.name}</span></div>
      <section class="hero" style="padding:28px 0 22px">
        <h1>${c.name}</h1><p class="lead">${c.blurb}</p>
      </section>
      <div class="box prose">${window.ToolNezEditorial.categories[k]}</div><div class="cards">${list.map(card).join('')}</div>
      <section class="sect">
        <div class="sect-head"><div><h2>Other sections</h2></div></div>
        <div class="cards">${CAT_ORDER.filter(x => x !== k).map(x => `
          <a class="tcard rise" href="/c/${x}" data-link><span class="ic">${icon(TOOLS.find(t => t.cat === x)?.icon || 'info')}</span>
          <span><h3>${CATS[x].name}</h3><p>${CATS[x].blurb}</p></span></a>`).join('')}</div>
      </section>
    </div>`;
  }

  function toolView(t) {
    const h = window.ToolNezEditorial.help[t.id];
    if (!h) throw new Error('Missing editorial help: ' + t.id);
    const related = TOOLS.filter(x => x.cat === t.cat && x.id !== t.id).slice(0, 3);
    return `<div class="wrap">
      <div class="crumb"><a href="/" data-link>Home</a> / <a href="/c/${t.cat}" data-link>${CATS[t.cat].name}</a> / <span>${esc(t.name)}</span></div>
      <div class="thead"><span class="ic">${icon(t.icon)}</span><div><h1>${esc(t.name)}</h1><p>${esc(t.tagline)}</p></div>
        <button class="ghost-btn fav-big ${favs().includes(t.id) ? 'on' : ''}" data-fav="${t.id}" aria-label="Favourite ${esc(t.name)}">${icon('star')}</button></div>
      <div class="box prose"><p>${esc(h.purpose)}</p><h2>How to use this tool</h2><ol>${h.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>
      <noscript><div class="box prose"><p>The instructions are available without JavaScript. Enable JavaScript to run the tool locally in your browser.</p></div></noscript>
      <div class="box" id="workbench">${t.ui()}</div>
      <div class="box prose"><h2>Worked example</h2><p>${esc(h.example)}</p><h2>Limitations and checks</h2><p>${esc(h.limitations)}</p>
        ${t.id==='bmi' ? '<p>Source: <a href="https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight" rel="noopener">WHO: obesity and overweight</a>.</p>' : ''}
        ${h.guide ? `<p>Read the <a href="/guides/${h.guide}" data-link>related workflow guide</a> for choosing settings and verifying exports.</p>` : ''}</div>
      ${t.info ? `<div class="box prose">${t.info}</div>` : ''}
      ${t.faq?.length ? `<div class="box"><h2>Common questions</h2>${t.faq.map(([q,a])=>`<details class="qa"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>` : ''}
      <section class="sect"><div class="sect-head"><div><h2>Related tools</h2></div></div><div class="cards">${related.map(card).join('')}</div></section>
    </div>`;
  }
  const PAGES = window.ToolNezPages;
  function pageView(k) {
    const p = PAGES[k];
    return `<div class="wrap reading"><div class="crumb"><a href="/" data-link>Home</a> / <span>${esc(p[0])}</span></div><h1>${esc(p[0])}</h1><article class="box prose">${p[1]}</article></div>`;
  }
  function guidesView(id) {
    const g = window.ToolNezGuides[id];
    if (!g) return `<div class="wrap"><section class="hero"><h1>Practical guides</h1><p class="lead">Settings, examples and export checks for common file and data tasks.</p></section><div class="cards">${guideCards()}</div></div>`;
    return `<div class="wrap reading"><div class="crumb"><a href="/" data-link>Home</a> / <a href="/guides" data-link>Guides</a></div><h1>${esc(g.title)}</h1><p class="dim">ToolNez editorial · Updated 25 October 2026</p><article class="box prose" data-editorial-guide="${id}">${g.body}</article><div id="guide-ad"></div><p><a href="/p/editorial-policy" data-link>Editorial policy</a> · <a href="/p/contact" data-link>Report a correction</a></p></div>`;
  }
  function renderPage(pathname) {
    const path = pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    const parts = path.split('/').filter(Boolean);
    let current = null, title, description, html, exists = true;
    if (path === '/') { html = homeView(); title = 'ToolNez · Free browser tools and practical guides'; description = '36 free tools for images, video, PDF, text and everyday calculations, with worked examples, honest limitations and practical guides.'; }
    else if (parts.length === 2 && parts[0] === 'c' && CATS[parts[1]]) { html = catView(parts[1]); title = CATS[parts[1]].name + ' tools · ToolNez'; description = CATS[parts[1]].blurb; }
    else if (parts.length === 2 && parts[0] === 'p' && PAGES[parts[1]]) { html = pageView(parts[1]); title = PAGES[parts[1]][0] + ' · ToolNez'; description = 'ToolNez: ' + PAGES[parts[1]][0] + ', service information and contact details.'; }
    else if (parts.length === 2 && parts[0] === 'tools' && find(parts[1])) { current = find(parts[1]); html = toolView(current); title = current.name + ' · ToolNez'; description = current.tagline + ' Instructions, worked example and limitations.'; }
    else if (parts[0] === 'guides' && (parts.length === 1 || parts.length === 2 && window.ToolNezGuides[parts[1]])) { html = guidesView(parts[1]); title = parts.length===2 ? window.ToolNezGuides[parts[1]].title + ' · ToolNez' : 'Practical guides · ToolNez'; description = parts.length===2 ? window.ToolNezGuides[parts[1]].description : 'Practical workflows for images, video, PDF and text.'; }
    else { exists = false; title = 'Page not found · ToolNez'; description = 'This ToolNez page does not exist.'; html = '<div class="wrap"><section class="hero"><h1>This page does not exist</h1><p class="lead">Try the <a href="/" data-link>front page</a> or search for a tool.</p></section></div>'; }
    return {html, title, description, current, exists, parts};
  }

  /* ---------------------------------------------------------- routing */
  function legacyPath(hash) {
    const raw = hash.slice(1);
    if (raw !== '/' && !/^\/(?:t|c|p)\/[a-z0-9-]+$/.test(raw)) return '/404';
    const next = raw.replace(/^\/t\//, '/tools/');
    return renderPage(next).exists ? next : '/404';
  }
  function route() {
    // Preserve shared links from the previous fragment-based version.
    if (/^#\//.test(location.hash)) {
      location.replace(legacyPath(location.hash)); return;
    }
    const view = renderPage(location.pathname);
    $('#main').innerHTML = view.html;
    document.title = view.title;
    document.querySelector('meta[name="description"]').content = view.description;
    reveal(); hookFavs(); markNav(view.parts);
    if (view.current) {
      pushRecent(view.current.id);
      try { view.current.init($('#workbench')); }
      catch(e) { console.error(e); toast('Something went wrong opening this tool', true); }
    }
    refreshAds();
  }
  function markNav(parts) {
    const key = parts[0] === 'c' ? parts[1] : parts[0] === 'tools' ? find(parts[1])?.cat : '';
    $$('#links a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '/c/' + key));
  }
  let obs;
  function reveal() {
    obs?.disconnect();
    obs = new IntersectionObserver(en => en.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('seen'); obs.unobserve(e.target); }
    }), { rootMargin: '0px 0px -40px 0px' });
    $$('.rise').forEach((el, i) => { el.style.transitionDelay = Math.min(i, 6) * 35 + 'ms'; obs.observe(el); });
  }
  function hookFavs() {
    $$('[data-fav]').forEach(b => b.onclick = e => {
      e.preventDefault(); e.stopPropagation();
      const on = toggleFav(b.dataset.fav);
      b.classList.toggle('on', on);
      toast(on ? 'Added to favourites' : 'Removed from favourites');
    });
  }

  /* ---------------------------------------------------------- search */
  function setupSearch() {
    const input = $('#q'), box = $('#qres');
    let items = [], sel = -1;
    const close = () => { box.classList.remove('on'); sel = -1; };
    const paint = list => {
      items = list;
      box.innerHTML = list.length
        ? list.map(t => `<a href="/tools/${t.id}" data-link><span class="ic">${icon(t.icon)}</span>
            <span><b>${t.name}</b><span>${CATS[t.cat].name} · ${t.tagline}</span></span></a>`).join('')
        : `<a class="dim" style="padding:12px">Nothing by that name. Try &ldquo;pdf&rdquo;, &ldquo;gif&rdquo; or &ldquo;loan&rdquo;.</a>`;
      box.classList.add('on');
    };
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      if (!q) return close();
      const score = t => {
        const n = t.name.toLowerCase();
        if (n.startsWith(q)) return 0;
        if (n.includes(q)) return 1;
        if ((t.keywords || '').includes(q)) return 2;
        if (t.tagline.toLowerCase().includes(q)) return 3;
        return 99;
      };
      paint(TOOLS.map(t => [t, score(t)]).filter(x => x[1] < 99).sort((a, b) => a[1] - b[1]).slice(0, 7).map(x => x[0]));
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { input.blur(); close(); return; }
      if (!box.classList.contains('on') || !items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        $$('a', box).forEach((a, i) => a.classList.toggle('sel', i === sel));
      } else if (e.key === 'Enter' && sel >= 0) {
        location.href = '/tools/' + items[sel].id; input.value = ''; input.blur(); close();
      }
    });
    document.addEventListener('click', e => { if (!e.target.closest('.finder')) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); input.focus(); input.select();
      }
    });
  }

  /* ---------------------------------------------------------- boot */
  function start() {
    const saved = store.get('theme', null);
    const theme = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(theme);
    $('#theme').onclick = () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      applyTheme(next); store.set('theme', next);
    };
    $('#burger').onclick = () => $('#links').classList.toggle('open');
    $('#yr').textContent = new Date().getFullYear();
    $('#ntools').textContent = TOOLS.length;
    document.addEventListener('click', e => {
      if (e.target.closest('a[data-link]')) $('#links').classList.remove('open');
    });
    addEventListener('scroll', () => {
      const d = document.documentElement;
      $('#progress').style.width = (d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight) * 100) + '%';
    }, { passive: true });
    // Normal anchors (including Skip to content) must not reset a loaded tool.
    setupSearch();
    route();
  }
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    $('#theme').innerHTML = t === 'light'
      ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/></svg>';
  }

  return {
    // registry
    tool, start, TOOLS, CATS, PAGES, renderPage, legacyPath,
    // dom
    $, $$, esc, icon, bytes, num, clamp, secs,
    // io
    toast, download, copy, dropzone, onFiles, loadImage, drawTo, toBlob, stem, results, store
  };
})();

