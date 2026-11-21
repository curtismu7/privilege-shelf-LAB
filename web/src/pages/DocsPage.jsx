import React, { useMemo, useState } from 'react';
import docs from '../data/docs.json';
import { PAGES } from '../data/pages.js';

// DocsPage — the Privilege documentation index (81 docs, 11 sections), rendered from
// web/src/data/docs.json. The data is a snapshot of the AI-DEMO2 repo's
// privilege/DOCUMENTATION-INDEX.md (source of truth, public on GitHub). Docs themselves
// live in the AI-DEMO2 repo and the shared Drive; this page is the findable map, offline, no fetches.
const REPO_BASE = 'https://github.com/curtismu7/AI-DEMO2/blob/main/privilege/';

export default function DocsPage() {
  const [query, setQuery] = useState('');
  const page = PAGES.find((p) => p.id === 'docs');

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs
      .map((s) => ({
        ...s,
        rows: s.rows.filter((r) =>
          `${r.doc} ${r.pdf} ${r.covers}`.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.rows.length > 0);
  }, [query]);

  const total = sections.reduce((n, s) => n + s.rows.length, 0);

  return (
    <section aria-label={page.title}>
      <h2>{page.title}</h2>
      <p className="page-purpose">{page.purpose}</p>
      <p className="draft-note" role="note">
        Snapshot of the AI-DEMO2 repo&rsquo;s privilege documentation index. The documents live in
        the <a href={`${REPO_BASE}DOCUMENTATION-INDEX.md`} target="_blank" rel="noreferrer">AI-DEMO2 repo</a> and
        the shared SE Google Drive (PDF exports); this page is the offline map of what exists and what each covers.
      </p>
      <div className="docs-controls">
        <label htmlFor="docs-search">Filter</label>
        <input
          id="docs-search"
          type="search"
          placeholder="Filter by name or what it covers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="pill">{total} of 81 docs</span>
      </div>
      {sections.map((s) => (
        <div key={s.title} className="docs-section">
          <h3>{s.title}</h3>
          <ul className="docs-list">
            {s.rows.map((r) => (
              <li key={r.doc} className="docs-row">
                <span className="docs-doc">{r.doc}</span>
                <span className="docs-covers">{r.covers}</span>
                {r.pdf && r.pdf !== '—' && r.pdf !== 'Drive (SE)' && (
                  <span className="pill docs-pdf">{r.pdf}</span>
                )}
                {r.pdf === 'Drive (SE)' && <span className="pill docs-pdf">Drive</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {sections.length === 0 && (
        <p className="note">No document matches &ldquo;{query}&rdquo;.</p>
      )}
    </section>
  );
}
