const actData = () => { const q = QA.trim().toLocaleLowerCase(), D = L10n.dict;
  return apps.flatMap(a => [...a.events.map(e => ({ e, a, inc:false })), ...(a.receivedEvents || []).map(e => ({ e, a, inc:true }))])
    .filter(x => (AF === 'all' || (AF === 'in') === x.inc) && (!q || [x.a.company, x.a.country, x.a.id, x.e.title, D[x.e.title], D[x.a.country]].join(' ').toLocaleLowerCase().includes(q)))
    .sort((x, y) => (y.e.timestamp || '').localeCompare(x.e.timestamp || '')); };
function actRows(all) {
  let day = '', out = '';
  all.forEach(({ e, a }) => { const [d, t = ''] = e.date.split(', '), k = kindOf(e);
    if (d !== day) { day = d; out += `<p class="day nt">${esc(d)}</p>`; }
    out += `<button class="row" data-goto="${esc(a.id)}/timeline"><span class="time">${esc(t)}</span><span class="body"><b class="nt" data-no-translate>${esc(simpleName(a))}</b>
      <span class="sub"><span class="kd k-${k}">${KIND[k]}</span> · <span class="nt">${esc(e.title)}</span></span></span>${ic('go','go')}</button>`; });
  return out || '<p class="empty">Nothing recorded yet.</p>';
}
function activity() {
  const all = actData(), t = (k, l) => `<button class="${AF === k ? 'on' : ''}" data-af="${k}" aria-pressed="${AF === k}"><span>${l}</span></button>`;
  return `${sHead('a', 'Activity', 'Find employer, country or event…', QA)}
  <div class="fbar fill act-tabs"><div class="fgrp g1">${t('all','All')}${t('out','Sent')}${t('in','Received')}</div></div><div id="aList">${actRows(all)}</div>`;
}

