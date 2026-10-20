const syncFilters = () => document.querySelectorAll('#fbar button').forEach(b => { const on = 'fs' in b.dataset ? b.dataset.fs === FS : b.dataset.fc === FC; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
const centerBtn = (b, smooth) => { if (b) b.scrollIntoView({ inline:'center', block:'nearest', behavior: smooth && !REDUCE.matches ? 'smooth' : 'auto' }); };
const showActive = () => centerBtn([...document.querySelectorAll('#fbar .on')].filter(b => b.dataset.fs !== 'all' && b.dataset.fc !== 'all').pop(), false);
const refreshList = el => { syncFilters(); const l = $('#eList'); if (l) l.innerHTML = rowsHTML(); const t = $('.stitle'); if (t) t.textContent = countTitle(); centerBtn(el, true); window.L10n && L10n.apply(); };

const refreshAct = () => { $('#aList').innerHTML = actRows(actData()); window.L10n && L10n.apply(); };

/* ---- ROUTING: the URL hash is the router (works offline, back button works, every page is linkable).
     #overview  #employers  #activity  #notes (= "Next steps")  #blocked   → main tabs
     #<employer id>[/summary|/timeline|/evidence]                           → employer page (default tab: summary)
   route() returns { tab, app, sub, page }. TABS = main menu, SUBS = employer-page menu: [id, label, icon]. ---- */
const TABS = [['overview','Overview','grid','var(--info)'],['employers','Employers','list','var(--ok)'],['activity','Activity','clock','var(--k-inq)'],['notes','Next steps','steps','var(--warn)'],['archive','Archive','archive','var(--mute)']];
const SUBS = [['summary','Summary','file','var(--info)'],['timeline','Timeline','clock','var(--k-inq)'],['evidence','Evidence','image','var(--ok)']];   /* 4th value = icon colour in the menu (existing colour tokens only) */
function route() {
  let hash; try { hash = decodeURIComponent(location.hash.slice(1)); } catch { hash = 'overview'; }
  const [a = 'overview', b] = hash.split('/'), app = apps.find(x => x.id === a);
  if (app) return { tab:'employers', app, sub: SUBS.some(s => s[0] === b) ? b : 'summary' };
  if (a === 'blocked') return { tab:'overview', app:null, page:'blocked' };
  return { tab: TABS.some(t => t[0] === a) ? a : 'overview', app:null };
}
const go = h => location.hash.slice(1) === h ? render() : (location.hash = h);
/* UI state kept in memory (survives re-render, lost on reload):
   lastList = where the back button returns to · SLIDE = slide direction for prev/next employer
   Q/QA = search text (Employers/Activity) · FS/FC = status / country filter · AF = activity filter */
let lastList = 'overview', SLIDE = '';
let Q = '', QA = '', FS = 'all', FC = 'all', AF = 'all';          /* employer search, activity search, status filter, country filter, activity filter */
const SO = { e:false, a:false };                                  /* search field open? */

/* Sliding ink bar above/under the active tab: measures the active button, animates width + translateX. */
let inkInit = false;
function moveInk() {
  const b = $('#tabList .tab-btn.active'), k = $('#ink'); if (!b) { k.style.width = '0'; return; }
  if (!inkInit) k.style.transition = 'none';
  k.style.width = b.offsetWidth + 'px'; k.style.transform = `translateX(${b.offsetLeft}px)`;
  if (!inkInit) { void k.offsetWidth; k.style.transition = ''; inkInit = true; }
}

const closeMon = () => { $('#mon').classList.remove('open'); const b = $('#snapBtn'); if (b) b.setAttribute('aria-expanded', 'false'); };
function navHTML(r) {
  if (!r.app) return TABS.map(([id, l, i, c]) => `<button class="tab-btn ${id === r.tab ? 'active' : ''}" data-t="${id}" style="--tc:${c}">${ic(i)}<span>${l}</span></button>`).join('');
  const i = apps.indexOf(r.app), pv = apps[i - 1], nx = apps[i + 1], pn = (x, cls, dir, icon, l) => `<button class="tab-btn pn ${cls}" data-goto="${x ? x.id + '/' + r.sub : ''}" data-dir="${dir}" aria-label="${l}" ${x ? '' : 'disabled'}>${ic(icon)}</button>`;
  return pn(pv, 'pv', 'prev', 'back', 'Previous') + SUBS.map(([id, l, ic_, c]) => `<button class="tab-btn ${id === r.sub ? 'active' : ''}" data-t="${id}" style="--tc:${c}">${ic(ic_)}<span>${l}</span></button>`).join('') + pn(nx, 'nx', 'next', 'go', 'Next');
}
let renderVersion = 0, readyToRender = false;
async function render(keep) {
  if (!readyToRender) return;
  const version = ++renderVersion;
  const selected = route();
  if (selected.app) { try { await Data.detail(selected.app.id); } catch (error) { if (version === renderVersion) showLoadError(error); return; } }
  if (version !== renderVersion) return;
  const r = route(), v = $('#view'); lastList = r.app ? lastList : (location.hash.slice(1) || 'overview');  closeMon();
  $('.hd-text .eyebrow').classList.toggle('trunc', !!r.app);
  $('.hd-text .eyebrow').innerHTML = r.app ? `${flag(r.app.country)}<span>${esc(r.app.country)}</span> · <span class="mono" data-no-translate>${esc(r.app.id)}</span> · <span>${esc(r.app.type)}</span>`
    : r.page ? '<span>Overview</span>'
    : `<button class="snap" id="snapBtn" type="button" aria-expanded="false" aria-controls="mon"><i class="dot ${monBad() ? 'bad' : ''}"></i><span>Snapshot</span> <span>${esc(report.generatedLabel)}</span>${ic('chev')}</button>`;
  const T = $('#hdTitle'); T.toggleAttribute('data-no-translate', !r.page); T.classList.toggle('has-n', !!r.app);
  if (r.app) T.innerHTML = `<span class="hd-nm">${esc(simpleName(r.app))}</span><span class="hd-n">· ${r.app.number} / ${apps.length}</span>`; else T.textContent = r.page ? 'Blocked & issues' : L10n.translate(report.candidateName || '');
  $('#back').innerHTML = ic('back'); $('#back').classList.toggle('show', !!(r.app || r.page));
  $('#tabList').innerHTML = navHTML(r);
  v.innerHTML = r.app ? ({ summary, timeline, evidence })[r.sub](r.app) : r.page ? blockedPage() : ({ overview, employers, activity, notes:steps, archive })[r.tab]();
  v.dataset.route = r.app ? r.app.id + '/' + r.sub : (r.page || r.tab);
  v.classList.toggle('narrow', !!(r.app || r.page) || ['activity','notes','archive'].includes(r.tab));
  v.classList.remove('slide-next','slide-prev'); if (SLIDE) { v.classList.add('slide-' + SLIDE); SLIDE = ''; }
  requestAnimationFrame(moveInk); renderMonitoringDates(window.L10n ? L10n.lang : 'en');
  if (!keep) { window.scrollTo(0, 0); v.classList.add('fresh');
    [...v.querySelectorAll('.hero-t:not(.stitle),.row,.blk,.agl,.kf,.alert,.ev,.doc,.next,.big,.day')].slice(0, 14).forEach((e, i) => { e.style.setProperty('--i', Math.min(i, 14)); e.classList.add('rise'); });
    setTimeout(() => v.classList.remove('fresh'), 1000); }
  showActive(); window.L10n && L10n.apply();
}
/* openSearch / closeSearch: expand / collapse the search row; closing also clears the typed text and refreshes the list. */
function openSearch(k) { const row = $(`.srow[data-k="${k}"]`); if (!row) return; SO[k] = true; row.classList.add('open'); const i = row.querySelector('.sin'); i.focus({ preventScroll:true }); }
function closeSearch(k) { const row = $(`.srow[data-k="${k}"]`); SO[k] = false; if (!row) return; row.classList.remove('open'); row.querySelector('.sin').blur();
  if (k === 'e' && Q) { Q = ''; row.querySelector('.sin').value = ''; refreshList(); } if (k === 'a' && QA) { QA = ''; row.querySelector('.sin').value = ''; refreshAct(); } }
/* ONE click handler. Order matters: (1) close drop-downs/search on outside click, (2) menu + navigation, (3) filters, (4) dialog.
   data-goto="<hash>" navigates · data-fs / data-fc status / country filter · data-af activity filter ·
   data-status / data-country open Employers pre-filtered · data-shot opens a screenshot · data-sopen / data-sclose search. */
document.addEventListener('click', e => {
  const $c = s => e.target.closest(s), r = route(); let el;
  if (!$c('#mon') && !$c('#snapBtn')) closeMon();
  /* a click anywhere outside an open search field closes it (a tap on a result keeps the query so you can come back) */
  document.querySelectorAll('.srow.open').forEach(row => { if (row.contains(e.target)) return; const k = row.dataset.k;
    if ((k === 'e' ? Q : QA) && $c('[data-goto]')) return; closeSearch(k); });
  if ((el = $c('#view summary'))) { e.preventDefault(); return el.parentElement.classList.contains('ag') ? agToggle(el.parentElement) : accToggle(el.parentElement); }
  if ($c('#language')) { L10n.toggle(); return render(true); }
  if ($c('#info-btn')) return viewer.toggleInfo();
  if ($c('#close-dialog')) return viewer.close();
  if ($c('[data-retry]')) return location.reload();
  if ($c('#snapBtn')) { const m = $('#mon'), open = !m.classList.contains('open'); m.classList.toggle('open', open); $('#snapBtn').setAttribute('aria-expanded', String(open)); return; }
  if ((el = $c('.pn'))) { if (el.dataset.goto) { SLIDE = el.dataset.dir; go(el.dataset.goto); } return; }
  if ((el = $c('.tab-btn'))) return go(r.app ? `${r.app.id}/${el.dataset.t}` : el.dataset.t);
  if ($c('#back')) return go(r.page ? 'overview' : lastList);
  if ((el = $c('[data-goto]'))) { if (el.dataset.goto) go(el.dataset.goto); return; }
  if ((el = $c('[data-sopen]'))) return openSearch(el.dataset.sopen);
  if ((el = $c('[data-sclose]'))) return closeSearch(el.dataset.sclose);
  if ((el = $c('[data-status]'))) { FS = el.dataset.status; FC = 'all'; Q = ''; SO.e = false; return go('employers'); }
  if ((el = $c('[data-country]'))) { FC = el.dataset.country; FS = 'all'; Q = ''; SO.e = false; return go('employers'); }
  if ((el = $c('[data-fs]'))) { FS = FS === el.dataset.fs ? 'all' : el.dataset.fs; return refreshList(FS === 'all' ? null : el); }
  if ((el = $c('[data-fc]'))) { FC = FC === el.dataset.fc ? 'all' : el.dataset.fc; return refreshList(FC === 'all' ? null : el); }
  if ((el = $c('[data-af]'))) { AF = el.dataset.af; return render(true); }
  if ((el = $c('[data-shot]'))) { const [id, i] = el.dataset.shot.split(':'); return viewer.open(apps.find(x => x.id === id), +i); }
});
document.addEventListener('input', e => { const t = e.target; if (!t.classList || !t.classList.contains('sin')) return;
  if (t.dataset.k === 'e') { Q = t.value; $('#eList').innerHTML = rowsHTML(); $('.stitle').textContent = countTitle(); window.L10n && L10n.apply(); }
  else { QA = t.value; refreshAct(); } });
/* ONE <details> open at a time inside the page. Timeline messages and the prepared-documents list are closed here, instantly.
   Numbered sections (.ag) are NOT closed here: agToggle() animates them; this handler only records which one is open (AG),
   so the choice survives a re-render. */
document.addEventListener('toggle', e => { const d = e.target; if (!(d instanceof HTMLDetailsElement)) return;
  if (d.dataset.agk) { if (d.open) AG[d.dataset.agk] = d.dataset.ag; else if (AG[d.dataset.agk] === d.dataset.ag) AG[d.dataset.agk] = ''; return; }   /* numbered sections: animated by agRun(), never force-closed here */
  if (!d.open) return;
  document.querySelectorAll('#view details[open]').forEach(o => { if (o !== d) o.open = false; }); }, true);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeMon(); const k = e.target.dataset && e.target.dataset.k; if (e.target.classList && e.target.classList.contains('sin')) closeSearch(k); return; }
  if (e.target.matches('input,textarea,summary,select') || $('#image-dialog').open) return; const r = route(); if (!r.app) return;
  const rtl = document.documentElement.dir === 'rtl', i = apps.indexOf(r.app), n = e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? apps[i+1] : e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') ? apps[i-1] : null;
  if (n) { e.preventDefault(); go(n.id + '/' + r.sub); } });
/* Swipe left/right on a phone to move to the next / previous employer (ignored on the filter bar, code blocks and open messages). */
let tx = 0, ty = 0, tOk = false;
document.addEventListener('touchstart', e => { const t = e.touches[0]; tx = t.clientX; ty = t.clientY; tOk = !!route().app && !e.target.closest('.fbar,pre,.tl details[open],dialog'); }, { passive:true });
document.addEventListener('touchend', e => { if (!tOk) return; const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty, r = route();
  if (Math.abs(dx) < 70 || Math.abs(dy) > 45 || Math.abs(dx) < Math.abs(dy) * 2) return;
  const rtl = document.documentElement.dir === 'rtl', next = (dx < 0) !== rtl, i = apps.indexOf(r.app), n = apps[i + (next ? 1 : -1)];
  if (n) { SLIDE = next ? 'next' : 'prev'; go(n.id + '/' + r.sub); } }, { passive:true });
window.addEventListener('hashchange', () => render());
window.addEventListener('resize', moveInk);

let confirmed, blocked, emailCount, portalCount, outgoing, replies, openItems;
function derive() {
  confirmed = apps.filter(a => ['email','portal'].includes(a.status)).length;
  blocked = apps.filter(a => a.applicationStatus === 'blocked');
  emailCount = apps.filter(a => ['email','failed'].includes(a.status)).length;
  portalCount = apps.filter(a => a.status === 'portal').length;
  outgoing = Object.values(report.counts).reduce((n, x) => n + x, 0);
  replies = apps.filter(a => a.applicationStatus === 'response_received');
  openItems = apps.filter(a => a.applicationStatus !== 'blocked' && a.applicationStatus !== 'response_received' && (/uncompleted/i.test(a.next) || isScreening(a)));
  DATES = report.checkDates.map(c => [c.number, c.date, c.text]);
}
function fmtDate(value) {
  const date = new Date(value);
  if (!value || !Number.isFinite(date.getTime())) return L10n.t('Not available');
  return new Intl.DateTimeFormat(L10n.lang === 'ar' ? 'ar-MA' : 'en-GB', {timeZone:report.timezone, year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false}).format(date);
}
function renderMonitoringDates() {
  const m = report.monitoringStatus || {};
  $('.ml-mb').textContent = L10n.t('Last mailbox check');
  $('.ml-app').textContent = L10n.t('Application data updated');
  $('.mb-date').textContent = fmtDate(m.last_successful_scan_utc);
  $('.app-date').textContent = fmtDate(report.applicationDataUpdatedAt);
  const out = $('.mb-out');
  out.hidden = !monBad(); out.textContent = L10n.t('Latest check incomplete; showing last successful check');
  $('#mon').setAttribute('aria-label', L10n.t('Monitoring') + ' · ' + L10n.t(report.timezone));
}
const monBad = () => !!report.monitoringStatus?.latest_attempt_status && report.monitoringStatus.latest_attempt_status !== 'complete';
function showLoadError(error) {
  console.error(error);
  $('#view').innerHTML = '<p class="empty">Unable to load the report. Please try again.</p><button class="link" data-retry>Try again</button>';
  L10n.apply();
}
Data.ready.then(() => {
  L10n.init(Data.dictionary);
  for (const a of apps) {
    if (!/^[A-Z0-9-]+$/.test(a.id) || !gLabel[a.applicationStatus] || !FLAGS[a.country]) throw new Error('Unsupported application code');
    if ([...a.events, ...a.receivedEvents].some(e => !KIND[e.kind])) throw new Error('Unsupported event kind');
  }
  derive();
  readyToRender = true;
  render();
}).catch(showLoadError);

