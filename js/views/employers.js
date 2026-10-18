function filtered() {
  const q = Q.trim().toLocaleLowerCase(), D = L10n.dict;
  return apps.filter(a => (FS === 'all' || a.applicationStatus === FS) && (FC === 'all' || a.country === FC) &&
    (!q || [a.company, a.country, a.id, a.position, D[a.country], D[a.position]].join(' ').toLocaleLowerCase().includes(q)));
}
const rowsHTML = () => filtered().map(eRow).join('') || '<p class="empty">No matching employer.</p>';
const countTitle = () => { const n = filtered().length; return `${n} ${n === 1 ? 'employer' : 'employers'}`; };
/* filter buttons: data-fs = status, data-fc = country. 'all' = no filter. Counts are totals per status/country (they do not change while filtering). */
const employers = () => `${sHead('e', countTitle(), 'Find employer or country…', Q)}
  <div class="fstick">${filterBar()}</div><div id="eList">${rowsHTML()}</div>`;

