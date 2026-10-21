function overview() {
  const n = apps.length, nb = blocked.length;
  const top = nb ? `<button class="alert" data-goto="blocked">${ic('alert')}<span class="body"><strong>${nb} ${nb === 1 ? 'application' : 'applications'} blocked</strong><span class="sub">Tap to see what is stuck and why</span></span>${ic('go','go')}</button>`
    : `<div class="alert ok">${ic('check')}<span class="body"><strong>No blocked application</strong><span class="sub">Nothing is stuck right now</span></span></div>`;
  const latest = apps.filter(a => (a.receivedEvents || []).length).map(a => ({ a, e:[...a.receivedEvents].sort((x, y) => (y.timestamp || '').localeCompare(x.timestamp || ''))[0] }))
    .sort((x, y) => (y.e.timestamp || '').localeCompare(x.e.timestamp || ''));
  const overdue = apps.filter(reviewOverdue);
  const overdueRows = overdue.map(a => `<button class="row review-overdue" data-goto="${esc(a.id)}/summary"><span class="body"><b data-no-translate>${esc(simpleName(a))}</b><span class="sub">Internal review due</span>${reviewBadge(a)}</span>${ic('go','go')}</button>`).join('');
  return `${pendingActionsHTML()}${top}<h2 class="hero-t">Application progress</h2>
  <div class="cols"><div>
    <div class="big">${confirmed}<span> / ${n}</span></div>
    <p class="cap">Saved email transmissions or portal submissions without a final delivery failure. Sending alone does not prove delivery.</p>
    <div class="seg">${GROUPS.filter(g => cnt(a => a.applicationStatus === g[0])).map(g => `<div class="s-${g[0]}" style="flex:${cnt(a => a.applicationStatus === g[0])} 1 0" title="${g[1]}"></div>`).join('')}</div>
    <div class="chips">${GROUPS.map(g => `<button class="chip s-${g[0]}" data-status="${g[0]}"><b>${cnt(a => a.applicationStatus === g[0])}</b><i class="dot"></i><span>${g[1]}</span></button>`).join('')}</div>
    <div class="kf"><div><b>${emailCount}</b><span>Email packages</span></div><div><b>${portalCount}</b><span>Portal records</span></div><div><b>${outgoing}</b><span>Outgoing emails</span></div></div>
    <p class="meta">${esc(L10n.t('{documents} with documents + {screening} screening-only', {documents:apps.filter(a => a.status === 'portal' && !isScreening(a)).length, screening:apps.filter(a => a.status === 'portal' && isScreening(a)).length}))}</p>
    <p class="meta">${esc(L10n.t('{application} packages + {inquiry} inquiries + {supplement} dossier supplements', report.counts))}</p>
    <p class="sec-title">By country</p>
    <div class="chips">${countryList().map(([c, k]) => `<button class="chip" data-country="${esc(c)}">${flag(c)}<span>${esc(c)}</span> <b>${k}</b></button>`).join('')}</div>
  </div><div>
    <p class="sec-title">Latest verified updates</p>
    ${latest.length || overdue.length ? `<div class="blk flat">${overdueRows}${latest.filter(x => !reviewOverdue(x.a)).map(updRow).join('')}</div>` : '<p class="empty">No verified replies yet.</p>'}
  </div></div><div class="src">${report.sourceLinks.map(link => `<a href="${esc(safeUrl(link.url))}" target="_blank" rel="noopener">${esc(link.label)}</a>`).join('')}<span><span>Sender</span>: <span data-no-translate>${esc(report.sender)}</span></span></div>`;
}

