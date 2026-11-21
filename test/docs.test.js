import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAGES } from '../web/src/data/pages.js';

const docs = JSON.parse(readFileSync(new URL('../web/src/data/docs.json', import.meta.url), 'utf8'));

test('every docs section has rows with the three fields filled', () => {
  for (const s of docs) {
    assert.ok(s.title, 'section missing title');
    assert.ok(s.rows.length > 0, `section ${s.title} has no rows`);
    for (const r of s.rows) {
      assert.ok(r.doc && r.doc !== 'Document', `section ${s.title} has a header row`);
      assert.ok(r.covers, `${r.doc} missing covers`);
    }
  }
});

test('the docs page is registered in the nav and the data has the canonical sections', () => {
  const ids = new Set(PAGES.map((p) => p.id));
  assert.ok(ids.has('docs'), 'docs page missing from PAGES');
  const titles = docs.map((s) => s.title);
  for (const expected of ['Start here', 'Gateway — setup & clients', 'Demos & environments']) {
    assert.ok(titles.includes(expected), `missing section ${expected}`);
  }
});

test('docs data carries no author machine paths', () => {
  assert.equal(readFileSync(new URL('../web/src/data/docs.json', import.meta.url), 'utf8').includes('/Users/'), false);
});
