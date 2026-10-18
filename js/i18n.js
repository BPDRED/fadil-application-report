'use strict';

// Translations, including replacements for generated text, are loaded by data.js.
const L10n = (() => {
  let dictionary = {}, language = 'en';
  try { language = localStorage.getItem('application-report-language') === 'ar' ? 'ar' : 'en'; } catch {}
  const originals = new WeakMap(), attributes = new WeakMap(), missing = new Set();
  const patterns = [
    [/^(\d+) employers?$/i, '{n} employers'],
    [/^(\d+) applications? blocked$/, '{n} applications blocked'],
    [/^(\d+) applications? cannot be completed yet$/, '{n} applications cannot be completed yet'],
    [/^(\d+) applications? (?:is|are) waiting for an answer\.$/, '{n} applications are waiting for an answer.'],
    [/^in (\d+) days$/, 'in {n} days'],
    [/^(\d+) days? ago$/, '{n} days ago'],
    [/^(\d+) saved actions?$/, '{n} saved actions'],
    [/^(\d+) verified incoming events?$/, '{n} verified incoming events'],
    [/^(\d+) attached PDFs$/, '{n} attached PDFs'],
    [/^(\d+) pages?$/, '{n} pages'],
    [/^([\d.]+) (MB|KB)$/, '{n} {unit}']
  ];
  function t(key, values = {}) {
    if (language === 'ar' && !Object.hasOwn(dictionary, key)) missing.add(key);
    const plural = values.n === undefined ? '' : new Intl.PluralRules('ar').select(Number(values.n));
    const value = language === 'ar' ? (dictionary[key + '|' + plural] ?? dictionary[key] ?? key) : key;
    return value.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
  }
  function translate(value) {
    if (language !== 'ar') return value;
    const trimmed = value.trim();
    if (!trimmed || !/[a-zA-Z]/.test(trimmed) || /^(?:https?:\/\/|[^@\s]+@)/.test(trimmed)) return value;
    if (Object.hasOwn(dictionary, trimmed)) return value.replace(trimmed, dictionary[trimmed]);
    const date = trimmed.match(/^\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?: \d{4})?(?:, \d{2}:\d{2})?$/);
    if (date) return value.replace(trimmed, trimmed.replace(date[1], t(date[1])));
    for (const [pattern, key] of patterns) {
      const match = trimmed.match(pattern);
      if (match) return value.replace(trimmed, t(key, { n: match[1], unit: match[2] ? t(match[2]) : '' }));
    }
    missing.add(trimmed);
    return value;
  }
  const ignored = element => element?.closest('script,style,noscript,[data-no-translate],#language');
  function apply() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.title = [translate(report.candidateName || ''), t('Application progress')].filter(Boolean).join(' | ');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.nodeValue.trim() || ignored(node.parentElement)) continue;
      const previous = originals.get(node);
      const source = previous?.last === node.nodeValue ? previous.source : node.nodeValue;
      const localized = translate(source);
      originals.set(node, { source, last: localized });
      if (node.nodeValue !== localized) node.nodeValue = localized;
    }
    document.querySelectorAll('[aria-label],[placeholder],[title],[alt]').forEach(element => {
      if (ignored(element) || element.id === 'language' || element.hasAttribute('data-data-label')) return;
      const saved = attributes.get(element) || {};
      for (const name of ['aria-label', 'placeholder', 'title', 'alt']) {
        if (!element.hasAttribute(name)) continue;
        const value = element.getAttribute(name), previous = saved[name];
        const source = previous?.last === value ? previous.source : value;
        const localized = translate(source);
        saved[name] = { source, last: localized };
        element.setAttribute(name, localized);
      }
      attributes.set(element, saved);
    });
    const button = document.getElementById('language');
    button.textContent = language === 'ar' ? t('English') : dictionary.Arabic;
    button.lang = 'ar';
    button.setAttribute('aria-label', language === 'ar' ? t('Switch to English') : 'Switch to Arabic');
    button.setAttribute('aria-pressed', String(language === 'ar'));
    document.querySelectorAll('[data-caption]').forEach(element => {
      element.setAttribute('aria-label', t('Enlarge {caption}', { caption: translate(element.dataset.caption) }));
    });
    renderMonitoringDates();
  }
  function toggle() {
    language = language === 'ar' ? 'en' : 'ar';
    try { localStorage.setItem('application-report-language', language); } catch {}
  }
  return { init(value) { dictionary = value; }, apply, toggle, t, translate, missing,
    get lang() { return language; }, get dict() { return dictionary; } };
})();

window.L10n = L10n;
