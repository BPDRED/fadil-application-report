function steps() {
  const waiting = apps.filter(a => ['awaiting_response','submitted_portal'].includes(a.applicationStatus)).length;
  const dates = DATES.map(dateRow).filter(Boolean).sort((x, y) => x.days - y.days);
  const grp = (n, key, title, sub, body) => agSec('notes', n, key, title, sub, body);
  let n = 0, out = '';
  if (blocked.length) out += grp(++n, 'blocked', 'Unblock these applications', 'Do not retry the forms or answer falsely. Ask the employer for a truthful, supported route.', blocked.map(a => item(a, a.next)).join(''));
  if (replies.length) out += grp(++n, 'response_received', 'Handle the employer reply', 'A reply arrived. Check the channel it points to before sending anything.', replies.map(a => item(a, a.next)).join(''));
  if (openItems.length) out += grp(++n, 'submitted_portal', 'Open items', 'Submitted, but something is still pending or limited.', openItems.map(a => item(a, a.next)).join(''));
  if (dates.length) out += grp(++n, 'awaiting_response', 'Dates to check', 'Dates written in the records. They are check dates, not reasons to send a follow-up.', dates.map(d => d.html).join(''));
  const rule = (icon, key, head, text) => `<div class="rl s-${key}"><span class="rl-i" aria-hidden="true">${ic(icon)}</span><div class="rl-t"><b>${head}</b><span>${text}</span></div></div>`;
  out += grp(++n, 'awaiting_response', 'Everything else: wait', `${waiting} ${waiting === 1 ? 'application is' : 'applications are'} waiting for an answer.`,
    rule('ban', 'blocked', "Don't chase", 'Do not resend packages, repeat portal forms or send automatic follow-ups.') +
    rule('file', 'submitted_portal', 'Stay ready', 'Keep the complete package ready for any request for the letter, portfolio or certificates.') +
    rule('mail', 'response_received', 'If they reply', 'When an employer replies, confirm the real role and site, the language level, pay and hours, and the lawful work-permit route before accepting anything.'));
  return `${pendingActionsHTML()}<h2 class="hero-t">Next steps</h2><div class="agl">${out}</div>
  <div class="foot-note"><p class="sec-title" style="margin-top:0">How to read it</p>
  <p class="note"><strong>This is a saved snapshot, not a live inbox.</strong> Gmail SENT confirms transmission, not delivery or reading. Portal receipts confirm submission, not selection. Outgoing emails include inquiries and supplements and are not the application count. Historical delivery failures remain in each record even when a later portal application succeeds. Screening-only records are identified separately.</p></div>`;
}

