function head(a) {
  return `<div class="d-head"><h2 class="hero-t" data-no-translate>${esc(simpleName(a))}</h2>
  <p class="meta">${esc(a.position)}</p><p class="stat-line">${stTxt(a)}</p></div>`; }

function summary(a) {
  const portal = a.status === 'portal', note = docNote(a);
  return `${head(a)}<div class="next s-${esc(a.applicationStatus)} ${reviewClass(a)}">${reviewBadge(a)}<p class="sec-title" style="margin:0 0 4px">Next step</p><p>${esc(a.next)}</p><p>${esc(a.response)}</p></div>
  <p class="sec-title">${a.status === 'held' ? 'Inquiry recipient' : portal ? 'Application website' : 'Email recipient'}</p>
  <dl class="kv"><dt>To</dt><dd class="nt">${portal ? `<a class="link" style="padding:0" href="${esc(safeUrl(a.recipient))}" target="_blank" rel="noopener" data-no-translate>${esc(new URL(a.recipient).hostname)} ↗</a>` : `<span data-no-translate>${esc(a.recipient)}</span>`}</dd>
  <dt>Channel</dt><dd><span>${esc(a.channelNote)}</span>${a.sentDate ? ' · <span>' + esc(a.sentDate) + '</span>' : ''}</dd></dl>
  <p class="sec-title">What was sent</p><p style="font-size:.92rem">${esc(a.summary)}</p>
  <div style="margin-top:8px">${a.documents.map(docRow).join('') || '<p class="empty">No documents were sent.</p>'}</div>${note ? `<p class="note">${esc(note)}</p>` : ''}
  ${a.preparedDocuments.length && a.preparedLabel ? `<div class="acc"><details><summary>${esc(a.preparedLabel)}</summary><div>${a.preparedDocuments.map(docRow).join('')}</div></details></div>` : ''}
  <p class="flags"><span>${esc(L10n.t('{language} documents', {language:L10n.t(a.language)}))}</span>${(a.flags || []).map(t => ` · <span>${esc(t)}</span>`).join('')}</p>`;
}

function timeline(a) {
  const ev = [...a.events.map(e => ({ e, inc:false })), ...(a.receivedEvents || []).map(e => ({ e, inc:true }))].sort((x, y) => (x.e.timestamp || '').localeCompare(y.e.timestamp || ''));
  const kinds = [...new Set(ev.map(x => kindOf(x.e)))];
  return `${head(a)}<p class="sec-title">What happened</p><p class="meta" style="margin-bottom:12px"><span>${a.events.length} saved ${a.events.length === 1 ? 'action' : 'actions'}</span> · <span>one employer record</span>${(a.receivedEvents || []).length ? ` · <span>${a.receivedEvents.length} verified incoming ${a.receivedEvents.length === 1 ? 'event' : 'events'}</span>` : ''}</p>
  <div class="kl">${kinds.map(k => `<span class="kk k-${k}"><i></i><span>${KIND[k]}</span></span>`).join('')}</div>
  <div class="tl">${ev.map(x => evHTML(x.e, x.inc)).join('')}</div>`;
}

/* --- EVIDENCE: the screenshot (confirmation or blocker) when one exists, otherwise the saved mail-sending proof. The explanation sentence comes from screenshots[].note, else a generic one by type. --- */
function evidence(a) {
  let body;
  if (a.screenshots.length) { const s = a.screenshots[0];
    const why = s.note || (s.type === 'blocker' ? 'This image shows a validation failure. It is not a submission receipt.' : isScreening(a) ? 'This receipt records screening answers only. No application documents were delivered.' : 'Submission receipt. It does not confirm hiring, document reading or permit support.');
    body = `<p class="sec-title">${s.type === 'blocker' ? 'Saved blocker screenshot' : 'Saved confirmation screenshot'}</p>
      <button class="shot" data-shot="${esc(a.id)}:0" data-caption="${esc(s.caption)}" data-data-label aria-label="${esc(L10n.t('Enlarge {caption}', {caption:s.caption}))}"><img src="${esc(safeUrl(shotSrc(s)))}" alt="${esc(s.caption)}" loading="lazy" decoding="async"></button>
      <p style="font-weight:600;margin-top:10px">${esc(s.caption)}</p><p class="quote">“<span>${esc(s.receipt)}</span>”</p><p class="note">${esc(why)}</p>
      ${a.receiptReference ? `<p class="sub"><span>APPLICATION CONFIRMATION NUMBER</span></p><p class="ids" data-no-translate>${esc(a.receiptReference)}</p>` : ''}
      ${a.screenshots.slice(1).map((s, i) => `<button class="row" data-shot="${esc(a.id)}:${i+1}"><span class="body"><b>${esc(s.caption)}</b><span class="sub">View additional saved image</span></span>${ic('ext','go')}</button>`).join('')}`;
  } else { const e = [...a.events].reverse().find(e => ['application','supplement','inquiry'].includes(e.kind));
    body = !e ? '<p class="empty">No confirmed submission evidence is recorded.</p>' : `<p class="sec-title">Saved Gmail sending evidence</p><p class="st-ok" style="font-weight:600">✓ <span>Gmail SENT verified</span> <span class="meta">· <span>${esc(e.date)}</span></span></p>
      <dl class="kv"><dt>From</dt><dd data-no-translate>${esc(e.sender)}</dd><dt>To</dt><dd data-no-translate>${esc(e.recipient)}</dd><dt>Subject</dt><dd>${esc(e.subject)}</dd><dt>Files</dt><dd>${e.filenames.length} attached PDFs</dd></dl>
      <p class="sub"><span>GMAIL MESSAGE ID</span></p><p class="ids" data-no-translate>${esc(e.messageId)}</p><a class="link" href="${esc(safeUrl(e.evidence))}" target="_blank" rel="noopener">Open original saved sending record ↗</a>
      <p class="note">The saved record confirms the recipient, subject, message and attachment names. It proves sending, not delivery, reading, recruitment interest or work-permit support.</p><p class="note">No saved Gmail interface screenshot is available for this employer.</p>`; }
  return `${head(a)}${body}<div class="src"><a href="${esc(safeUrl(a.source))}" target="_blank" rel="noopener">Employer research and history ↗</a><a href="${esc(safeUrl(a.manifest))}" target="_blank" rel="noopener">Document manifest ↗</a></div>`;
}

