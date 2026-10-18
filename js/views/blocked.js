function blockedPage() {
  const nb = blocked.length, other = [...replies, ...openItems], c = k => `${k} ${k === 1 ? 'employer' : 'employers'}`;
  let n = 0, out = '';
  if (nb) out += agSec('blocked', ++n, 'blocked', 'Blocked', c(nb), blocked.map(a => item(a, a.next)).join(''));
  if (other.length) out += agSec('blocked', ++n, 'awaiting_response', 'Other issues to handle', c(other.length), other.map(a => item(a, a.next)).join(''));
  return `<h2 class="hero-t">Blocked & issues</h2><p class="meta">${nb ? `${nb} ${nb === 1 ? 'application cannot' : 'applications cannot'} be completed yet` : 'Nothing is blocked'}</p>
  ${out ? `<div class="agl">${out}</div>` : '<p class="empty" style="margin-top:14px">No blocked application recorded.</p>'}
  <p style="margin-top:22px"><button class="link" data-goto="notes">See all next steps</button></p>`;
}

