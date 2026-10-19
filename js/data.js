'use strict';

// This is the only file that reads JSON. Detail requests are cached and merged by stable ID.
const report = {}, apps = [];
const Data = (() => {
  const cache = new Map();
  let dictionary = {};
  async function json(path) {
    const response = await fetch(path, {cache:'no-cache'});
    if (!response.ok) throw new Error(`${response.status}: ${path}`);
    return response.json();
  }
  const ready = Promise.all(['db/report.json', 'db/applications.json', 'db/check-dates.json', 'db/i18n/ar.json'].map(json))
    .then(([metadata, index, checks, arabic]) => {
      if (!Array.isArray(index) || new Set(index.map(a => a.id)).size !== index.length ||
          index.some(a => !/^[A-Z0-9-]+$/.test(a.id) || !Number.isSafeInteger(a.number) || a.number < 1)) throw new Error('Invalid application index');
      if (Object.values(metadata.counts).some(n => !Number.isSafeInteger(n) || n < 0)) throw new Error('Invalid report counts');
      if (metadata.pendingActions && (!Array.isArray(metadata.pendingActions) || metadata.pendingActions.some(a => !index.some(app => app.id === a.applicationId) || !['agent','user','employer'].includes(a.owner) || typeof a.description !== 'string'))) throw new Error('Invalid pending actions');
      Object.assign(report, metadata, { checkDates: checks });
      apps.push(...index.sort((a, b) => a.number - b.number));
      dictionary = arabic;
    });
  async function detail(id) {
    const app = apps.find(a => a.id === id);
    if (!app) throw new Error('Unknown application ID');
    if (!cache.has(id)) {
      cache.set(id, json(`db/applications/${encodeURIComponent(id)}.json`).then(full => {
        if (full.id !== app.id || full.number !== app.number) throw new Error('Application ID mismatch');
        Object.assign(app, full);
        return app;
      }).catch(error => { cache.delete(id); throw error; }));
    }
    return cache.get(id);
  }
  return { ready, detail, get dictionary() { return dictionary; } };
})();
