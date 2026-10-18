/* ---- small helpers ---- */
const $ = s => document.querySelector(s);                                   /* shorthand for querySelector */
/* esc(): ALWAYS wrap DB text in esc() before putting it in an HTML string (prevents broken markup / injection) */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* safeUrl(): absolute http(s) links are kept; relative file paths are URL-encoded segment by segment */
function safeUrl(value) {
  const s = String(value || '');
  if (/^https?:\/\//i.test(s)) { try { const u = new URL(s); return ['http:', 'https:'].includes(u.protocol) ? u.href : '#'; } catch { return '#'; } }
  if (!s || /^(?:[a-z][a-z0-9+.-]*:|[/\\])/i.test(s) || s.split('/').includes('..')) return '#';
  return s.split('/').map(encodeURIComponent).join('/');
}
const pad = n => String(n).padStart(2, '0');
/* display name + data flags: employer-specific behaviour is a DB field, never `if (a.number === 13)` */
const simpleName = a => a.displayName || a.company;      /* display name: optional DB field `displayName`, else `company` */
const shotSrc = s => L10n.lang === 'ar' ? (L10n.dict._evidence?.[s.src]?.path || s.src) : s.src;
const isScreening = a => !!a.screeningOnly;               /* DB boolean: screening answers only, no documents delivered */

/* ---- ICONS: inline SVG path data on a 24×24 grid, stroke only (colour = currentColor, width set in CSS).
   Add an icon = add a key here (copy a path from any 24px outline icon set), use it with ic('key', 'optional-class'). ---- */
const P = {   /* icons */
  grid:'<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  steps:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>', image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  back:'<path d="M15 18l-6-6 6-6"/>', go:'<path d="M9 18l6-6-6-6"/>', ext:'<path d="M7 17L17 7M8 7h9v9"/>', search:'<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
  x:'<path d="M18 6L6 18M6 6l12 12"/>', chev:'<path d="M6 9l6 6 6-6"/>', phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  alert:'<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>', ban:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>', mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', check:'<path d="M20 6L9 17l-5-5"/>', shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
};
const ic = (n, c='') => `<svg class="${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

/* ---- COUNTRY FLAGS: tiny inline SVGs on a 20×14 grid so they look identical on every device (emoji flags do not).
   The key MUST equal the `country` string in the DB. A country with no entry gets the grey "_" placeholder flag.
   Add a country = add one entry (stripes/rects) here + its Arabic name in the i18n dictionary. ---- */
const usStripes = Array.from({length:7}, (_, i) => `<rect y="${(i*2*14/13).toFixed(2)}" width="20" height="${(14/13).toFixed(2)}" fill="#B22234"/>`).join('');
const FLAGS = {
  France:'<rect width="20" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#0055A4"/><rect x="13.33" width="6.67" height="14" fill="#EF4135"/>',
  Italy:'<rect width="20" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#009246"/><rect x="13.33" width="6.67" height="14" fill="#CE2B37"/>',
  Germany:'<rect width="20" height="4.67" fill="#000"/><rect y="4.67" width="20" height="4.67" fill="#DD0000"/><rect y="9.33" width="20" height="4.67" fill="#FFCE00"/>',
  Austria:'<rect width="20" height="14" fill="#fff"/><rect width="20" height="4.67" fill="#ED2939"/><rect y="9.33" width="20" height="4.67" fill="#ED2939"/>',
  Canada:'<rect width="20" height="14" fill="#fff"/><rect width="5" height="14" fill="#D80621"/><rect x="15" width="5" height="14" fill="#D80621"/><path fill="#D80621" d="M10 2.4l1 2 1.4-.5-.4 2.6 1.9-.7-.4 1.9 1 .6-3.6 1.9.1 2.2h-1.9l.1-2.2-3.6-1.9 1-.6-.4-1.9 1.9.7-.4-2.6L9 4.4z"/>',
  'United States':`<rect width="20" height="14" fill="#fff"/>${usStripes}<rect width="9" height="7.54" fill="#3C3B6E"/>`,
  _:'<rect width="20" height="14" fill="#e5e7eb"/><circle cx="10" cy="7" r="4" fill="none" stroke="#9ca3af" stroke-width="1"/>'
};
const flag = c => `<svg class="flag" viewBox="0 0 20 14" aria-hidden="true">${FLAGS[c] || FLAGS._}</svg>`;

/* ---- ONE STATE SYSTEM: applicationStatus key → label. Order = display order everywhere (bar, chips, filters).
   Colours live in CSS (.s-<key>). A new status = one row here + one s-<key> rule in CSS.
   stText(a) = the status sentence shown next to a name; stTxt(a) = the same, wrapped with its colour. ---- */
const GROUPS = [['blocked','Blocked'],['response_received','Reply received'],['submitted_portal','Portal submitted'],['awaiting_response','Awaiting response']];
const gLabel = Object.fromEntries(GROUPS);
const stText = a => isScreening(a) ? 'Screening-only record'
  : a.applicationStatus === 'blocked' ? (a.status === 'failed' ? 'Delivery failed · action required' : 'Not submitted · waiting') : gLabel[a.applicationStatus];
const stTxt = a => `<span class="s-${esc(a.applicationStatus)}"><span class="stx">${stText(a)}</span></span>`;
/* ---- TIMELINE / ACTIVITY EVENT KINDS: DB `kind` → label shown in the pill. Colours: CSS k-<kind>. Unknown kinds fall back to 'response'. ---- */
const KIND = { application:'Full package', inquiry:'Inquiry / help', supplement:'Dossier supplement', portal:'Website form', delivery_notice:'Delivery notice', response:'Received response', acknowledgment:'Automatic receipt' };
const kindOf = e => KIND[e.kind] ? e.kind : 'response';
/* eRow(): one employer row, used by the Employers list.
   [ 01 | Company name (bold)                   | › ]
   [    | 🇮🇹 Italy · Not submitted · waiting     |   ]      number = mono grey · status text = state colour */
const eRow = a => `<button class="row" data-goto="${esc(a.id)}"><span class="num mono">${pad(a.number)}</span><span class="body"><b class="nt" data-no-translate>${esc(simpleName(a))}</b>
    <span class="sub">${flag(a.country)}<span>${esc(a.country)}</span> · ${stTxt(a)}</span></span>${ic('go','go')}</button>`;
const cnt = f => apps.filter(f).length;
const countryList = () => [...new Set(apps.map(a => a.country))].map(c => [c, cnt(a => a.country === c)]).sort((x, y) => y[1] - x[1]);
const shortDate = e => String(e.date || '').split(',')[0].replace(/\s\d{4}$/, '');
/* "today / yesterday / N days ago" from the saved event date, e.g. "10 Oct 2026, 11:30" */
function todayOrdinal() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: report.timezone, year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return Date.UTC(+values.year, +values.month - 1, +values.day) / 864e5;
}
const agoOf = e => { const [day, month, year] = String(e.date || '').split(',')[0].trim().split(' '), mi = MONTHS.indexOf(month);
  if (mi < 0) return '';
  const n = todayOrdinal() - Date.UTC(+year, mi, +day) / 864e5;
  return n <= 0 ? 'today' : n === 1 ? 'yesterday' : `${n} days ago`;
};
/* same row layout as "Dates to check" on the Next steps page */
const updRow = ({ a, e }) => { const [d, m = ''] = shortDate(e).split(' ');
  return `<button class="dt s-${esc(a.applicationStatus)}" data-goto="${esc(a.id)}/timeline"><span class="dt-d"><b data-no-translate>${esc(d)}</b><span>${esc(m)}</span></span><span class="body"><span class="it-h">${flag(a.country)}<b class="nt" data-no-translate>${esc(simpleName(a))}</b><span class="left">${agoOf(e)}</span></span><span class="it-t nt">${esc(e.title)}</span></span>${ic('go','go')}</button>`; };

/* --- SEARCH ROW (shared by Employers + Activity): title on the left, search icon on the right that opens into a
   full-width field. SO[k] = open? The row also stays open while it holds text. Closing logic: see the click handler. --- */
const sHead = (k, title, ph, q) => `<div class="srow ${SO[k] || q ? 'open' : ''}" data-k="${k}"><h2 class="hero-t stitle">${title}</h2>
  <div class="sw"><button class="sbtn" type="button" data-sopen="${k}" aria-label="Search">${ic('search')}</button>
  <input class="sin" data-k="${k}" type="search" enterkeyhint="search" value="${esc(q)}" placeholder="${ph}" aria-label="${ph}" autocomplete="off">
  <button class="sx" type="button" data-sclose="${k}" aria-label="Close search">${ic('x')}</button></div></div>`;

const fBtn = (attr, val, on, inner) => `<button class="${inner.cls || ''} ${on ? 'on' : ''}" data-${attr}="${esc(val)}" aria-pressed="${on}">${inner.html}</button>`;
const groupBtns = () => [['all', 'All', ''], ...GROUPS.map(([k, l]) => [k, l, `<i class="dot"></i>`])].map(([k, l, dot]) => {
  const n = k === 'all' ? apps.length : cnt(a => a.applicationStatus === k);
  return fBtn('fs', k, FS === k, { cls: k === 'all' ? '' : 's-' + k, html: `${dot}<span>${l}</span> <span class="n">${n}</span>` }); }).join('');
const countryBtns = () => [['all', null], ...countryList()].map(([c, k]) => c === 'all'
  ? fBtn('fc', 'all', FC === 'all', { html: '<span>All countries</span>' })
  : fBtn('fc', c, FC === c, { html: `${flag(c)}<span>${esc(c)}</span> <span class="n">${k}</span>` })).join('');
const filterBar = () => `<div class="fbar" id="fbar"><div class="fgrp g1" role="group" aria-label="Status">${groupBtns()}</div><div class="fgrp g2" role="group" aria-label="Country">${countryBtns()}</div></div>`;
/* keep the scroll position: only flip the .on state, never rebuild the bar */
/* --- ITEM ROW (Blocked page + Next steps sections). Not a card: a row inside a connected block.
   [ 🇮🇹 Acme Atelier   Not submitted · waiting                       › ]   name (state colour) + status text
   [ Ask the employer for a truthful, supported application route.      ]   the employer's `next` text
   [ (📞 +39 055 010 0100)  (↗ jobs.fabrikam.example)                    ]   optional pills: phone / site found in the text
   Tap the row → employer summary. --- */
const telOf = a => { const m = a.next.match(/\+\d[\d ]{6,}\d(?:-\d+)?/); return m ? m[0] : ''; };
const siteOf = a => { const m = (a.response || '').match(/\b(jobs\.[a-z0-9.-]+\.[a-z]{2,})\b/i); return m ? m[1] : ''; };
function item(a, text) {
  const tel = telOf(a), site = siteOf(a), x = (tel ? `<a class="pill" href="tel:${esc(tel.replace(/[^\d+]/g, ''))}">${ic('phone')}<span data-no-translate>${esc(tel)}</span></a>` : '') + (site ? `<a class="pill" href="https://${esc(site)}" target="_blank" rel="noopener">${ic('ext')}<span data-no-translate>${esc(site)}</span></a>` : '');
  return `<div class="it s-${esc(a.applicationStatus)}"><button class="it-main" data-goto="${esc(a.id)}"><span class="body"><span class="it-h">${flag(a.country)}<b class="nt" data-no-translate>${esc(simpleName(a))}</b><span class="meta">${stTxt(a)}</span></span><span class="it-t">${esc(text)}</span></span>${ic('go','go')}</button>${x ? `<div class="it-x">${x}</div>` : ''}</div>`;
}

/* --- COLLAPSIBLE SECTIONS (Next steps + Blocked page) -------------------------------------------
   agSec(page, number, state, title, subtitle, bodyHTML) → one numbered <details> section (CSS: .ag).
   AG[page] remembers which section is open. A click on the summary is intercepted (click handler → agToggle) so opening one
   closes the others with an animation: ONE is open at a time. Do not add your own open/close logic. --- */
const AG = { notes:'1', blocked:'1' };    /* which section is open on each page */
/* ACCORDION ANIMATION. A native <details> opens and closes instantly, so the click on a numbered section is intercepted
   (see the click handler) and the body (.ag-b) is animated with the Web Animations API: height 0 ↔ full + fade.
   Opening a section closes the open one at the same time, so the two motions blend into one smooth "switch".
   A click in the middle of an animation continues from the current height (no jump). `closing` flips the chevron at once. */
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
function agRun(d, open) {
  const b = d.querySelector('.ag-b');
  const cur = d._a ? b.getBoundingClientRect().height : (d.open ? b.getBoundingClientRect().height : 0);
  if (d._a) { d._a.cancel(); d._a = null; }
  d.classList.toggle('closing', !open);
  if (open) d.open = true;
  if (!b || REDUCE.matches) { d.open = open; d.classList.remove('closing'); return; }
  const full = b.getBoundingClientRect().height, to = open ? full : 0;
  b.style.overflow = 'hidden';
  const a = b.animate([{ height: cur + 'px', opacity: full ? Math.min(1, cur / full) : 0 }, { height: to + 'px', opacity: open ? 1 : 0 }],
    { duration: open ? 460 : 360, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'both' });
  d._a = a;
  a.onfinish = () => { if (d._a !== a) return; d._a = null; b.style.overflow = ''; d.classList.remove('closing'); if (!open) d.open = false; a.cancel(); };
}
function agToggle(d) {
  if (d.open && !d.classList.contains('closing')) return agRun(d, false);
  document.querySelectorAll(`#view .ag[data-agk="${d.dataset.agk}"]`).forEach(o => { if (o !== d && o.open && !o.classList.contains('closing')) agRun(o, false); });
  agRun(d, true);
}
const agSec = (page, n, key, title, sub, body) => `<details class="ag s-${key}" data-agk="${page}" data-ag="${n}" ${AG[page] === String(n) ? 'open' : ''}><summary><span class="ag-n" aria-hidden="true">${n}</span><span class="ag-t"><b>${title}</b><span>${sub}</span></span></summary><div class="ag-b">${body}</div></details>`;

let DATES = [];   /* DB: report.checkDates[] */
/* dateRow(): turns [employer number, 'YYYY-MM-DD', text] into a .dt row + days left (negative = passed). */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dateRow([num, iso, text]) {
  const a = apps.find(x => x.number === num); if (!a) return '';
  const [y, m, d] = iso.split('-').map(Number), days = Date.UTC(y, m - 1, d) / 864e5 - todayOrdinal();
  const left = days > 1 ? `in ${days} days` : days === 1 ? 'tomorrow' : days === 0 ? 'today' : 'date passed';
  return { days, html:`<button class="dt s-${esc(a.applicationStatus)}" data-goto="${esc(a.id)}/timeline"><span class="dt-d"><b data-no-translate>${d}</b><span>${MONTHS[m - 1]}</span></span><span class="body"><span class="it-h">${flag(a.country)}<b class="nt" data-no-translate>${esc(simpleName(a))}</b></span><span class="it-t">${esc(text)}</span><span class="left">${left}</span></span>${ic('go','go')}</button>` };
}
const docRow = d => `<a class="doc" href="${esc(safeUrl(d.path))}" target="_blank" rel="noopener"><span class="fi">PDF</span><span class="dn"><b>${esc(d.filename)}</b><small><span>${esc(d.pages)} ${d.pages === 1 ? 'page' : 'pages'}</span> · <span>${esc(d.size >= 1024 ? (d.size/1024).toFixed(1) + ' MB' : d.size + ' KB')}</span></small></span>${ic('ext')}</a>`;
const docNote = a => a.documentNote || '';     /* DB: optional one-line note per employer */

/* evHTML(): one timeline event.   ● 8 Oct 2026, 20:51  [Full package]          (dot + rail in the kind colour)
                                      Application documents sent                (title)
                                      To: hr@example.com · Files: CV.pdf · letter.pdf
                                      ▸ Read message and confirmation           (collapsible: subject, body, proof sentence, ids, links)
   inc = true for incoming items (shows "From:" and an "Open in Gmail" link; real build: link to your mail provider). */
function evHTML(e, inc) {
  const mail = e.kind !== 'portal', k = kindOf(e);
  return `<article class="ev k-${k} ${inc ? 'in' : ''}"><div class="ev-h"><time>${esc(e.date)}</time><span class="kind">${KIND[k]}</span></div>
  <p class="ev-t">${esc(e.title)}</p><p class="sub"><span>${inc ? 'From: ' : mail ? 'To: ' : 'Website: '}</span><span data-no-translate>${esc(inc ? e.sender : e.recipient)}</span></p>
  ${inc ? '' : (e.filenames.length ? `<p class="sub"><span>Files: </span>${e.filenames.map(f => `<span>${esc(f)}</span>`).join(' · ')}</p>` : '<p class="sub">No file attachment independently recorded for this action.</p>')}
  <details><summary>${e.body ? 'Read message and confirmation' : 'View confirmation details'}</summary>${e.subject ? `<p class="sub"><span>Subject: </span><span>${esc(e.subject)}</span></p>` : ''}${e.body ? `<pre class="event-body">${esc(e.body)}</pre>` : ''}
  <p class="note">${esc(e.confirmation)}</p>${e.messageId ? `<p class="ids"><span>Message: </span><span data-no-translate>${esc(e.messageId)}</span><br><span>Thread: </span><span data-no-translate>${esc(e.threadId || '')}</span></p>` : ''}${e.reference ? `<p class="ids"><span>Confirmation: </span><span data-no-translate>${esc(e.reference)}</span></p>` : ''}
  <a class="link" href="${esc(safeUrl(e.evidence))}" target="_blank" rel="noopener">Open saved evidence ↗</a>${inc && e.messageId ? ` <a class="link" style="margin-inline-start:16px" href="https://mail.google.com/mail/u/0/#all/${esc(e.messageId)}" target="_blank" rel="noopener">Open in Gmail ↗</a>` : ''}</details></article>`;
}
const viewer = (() => {
  const dlg = $('#image-dialog'), vw = $('#vw'), im = $('#dialog-image'), sheet = $('#vw-sheet'), infoBtn = $('#info-btn'), MAX = 6, ptr = new Map();
  let s = 1, x = 0, y = 0, pinch = null, multi = false, lastTap = 0;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const centre = (px, py) => { const r = vw.getBoundingClientRect(); return { x: px - r.left - r.width / 2, y: py - r.top - r.height / 2 }; };
  const mid = (a, b) => centre((a.x + b.x) / 2, (a.y + b.y) / 2);
  function paint(anim) {
    const W = vw.clientWidth, H = vw.clientHeight, nw = im.naturalWidth || W, nh = im.naturalHeight || H, f = Math.min(W / nw, H / nh);
    const mx = Math.max(0, (nw * f * s - W) / 2), my = Math.max(0, (nh * f * s - H) / 2);
    x = clamp(x, -mx, mx); y = clamp(y, -my, my);
    im.style.transition = anim && !REDUCE.matches ? 'transform .3s cubic-bezier(.2,.7,.2,1)' : 'none';
    im.style.transform = `translate(${x}px,${y}px) scale(${s})`; vw.classList.toggle('zoomed', s > 1.01);
  }
  /* zoom to scale ns keeping the point c (relative to the screen centre) fixed under the finger / cursor */
  function zoomTo(ns, c, anim) { ns = clamp(ns, 1, MAX); const r = ns / s; x = c.x - (c.x - x) * r; y = c.y - (c.y - y) * r; s = ns; if (s === 1) x = y = 0; paint(anim); }
  const setInfo = on => { sheet.classList.toggle('open', on); infoBtn.setAttribute('aria-expanded', String(on)); };
  const reset = () => { s = 1; x = y = 0; pinch = null; multi = false; lastTap = 0; ptr.clear(); setInfo(false); im.style.transition = 'none'; im.style.transform = ''; vw.classList.remove('zoomed'); };

  vw.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    vw.setPointerCapture(e.pointerId);
    ptr.set(e.pointerId, { x:e.clientX, y:e.clientY, sx:e.clientX, sy:e.clientY, t:performance.now(), moved:false });
    if (ptr.size >= 2) { multi = true; const [a, b] = [...ptr.values()]; pinch = { d:Math.hypot(a.x - b.x, a.y - b.y) || 1, s, x, y, m:mid(a, b) }; }
  });
  vw.addEventListener('pointermove', e => {
    const p = ptr.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 8) p.moved = true;
    p.x = e.clientX; p.y = e.clientY;
    if (ptr.size === 2 && pinch) {
      const [a, b] = [...ptr.values()], ns = clamp(pinch.s * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, 1, MAX), m = mid(a, b);
      s = ns; x = m.x - (pinch.m.x - pinch.x) * ns / pinch.s; y = m.y - (pinch.m.y - pinch.y) * ns / pinch.s; paint(false);
    } else if (ptr.size === 1 && s > 1) { x += dx; y += dy; paint(false); }
  });
  const end = e => {
    const p = ptr.get(e.pointerId); if (!p) return; ptr.delete(e.pointerId);
    if (pinch && ptr.size < 2) { pinch = null; ptr.forEach(q => { q.moved = true; }); if (s < 1.02) { s = 1; x = y = 0; paint(true); } }
    if (e.type === 'pointerup' && !p.moved && !multi && performance.now() - p.t < 350) {
      if (sheet.classList.contains('open')) { setInfo(false); lastTap = 0; }                                 /* tap on the image hides the information */
      else { const now = performance.now(); if (now - lastTap < 320) { zoomTo(s > 1.05 ? 1 : 2.5, centre(e.clientX, e.clientY), true); lastTap = 0; } else lastTap = now; }   /* double-tap */
    }
    if (!ptr.size) multi = false;
  };
  vw.addEventListener('pointerup', end); vw.addEventListener('pointercancel', end);
  vw.addEventListener('wheel', e => { e.preventDefault(); zoomTo(s * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002)), centre(e.clientX, e.clientY), false); }, { passive:false });
  im.addEventListener('load', () => paint(false));
  window.addEventListener('resize', () => { if (dlg.open) paint(false); });
  
  
  dlg.addEventListener('close', () => { reset(); document.body.style.overflow = ''; });
  return { toggleInfo() { setInfo(!sheet.classList.contains('open')); }, close() { dlg.close(); }, open(a, i) { const sh = a.screenshots[i]; reset();
    $('#dialog-title').textContent = simpleName(a) + ' · ' + L10n.translate(sh.caption); $('#dialog-caption').textContent = L10n.translate(sh.receipt); $('#dialog-original').href = safeUrl(sh.path);
    im.alt = L10n.translate(sh.caption); im.src = safeUrl(shotSrc(sh)); document.body.style.overflow = 'hidden'; dlg.showModal(); paint(false); } };
})();

function accToggle(d) {
  const open = !d.open;
  document.querySelectorAll('#view details[open]').forEach(other => { if (other !== d) other.open = false; });
  d.open = open;
}
