import React, { useMemo, useState } from 'react';
import apps from '../data/standaloneApps.json';

const KIND_ORDER = ['Demo', 'Tester', 'Tool'];

function groupKind(a) {
  return a.kind || 'Other';
}

export default function ShelfPage() {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = apps.filter((a) =>
      !q || `${a.name} ${a.description} ${(a.tags || []).join(' ')}`.toLowerCase().includes(q)
    );
    const byKind = new Map();
    for (const a of list) {
      const k = groupKind(a);
      if (!byKind.has(k)) byKind.set(k, []);
      byKind.get(k).push(a);
    }
    return KIND_ORDER.filter((k) => byKind.has(k)).map((k) => [k, byKind.get(k)]);
  }, [query]);
  const total = groups.reduce((n, [, list]) => n + list.length, 0);
  return (
    <section aria-label="Standalone labs">
      <h2>Standalone labs</h2>
      <p className="page-purpose">
        {apps.length} Privilege-family standalone labs. Each runs locally in Docker; the links below open
        them through the shared lab proxy. Content is a snapshot of the shelf registry, not a live call.
      </p>
      <div className="shelf__toolbar">
        <label htmlFor="shelf-search">Search</label>
        <input
          id="shelf-search"
          type="search"
          value={query}
          placeholder="name, description or tag"
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="small">{total} shown</span>
      </div>
      {groups.map(([kind, list]) => (
        <div key={kind} className="shelf__group">
          <h3>
            {kind} <span className="small">({list.length})</span>
          </h3>
          <div className="card-grid" role="list">
            {list.map((a) => (
              <div key={a.id} role="listitem" className="card card--neutral shelf-card">
                <h4>
                  {a.proxy ? (
                    <a href={a.proxy} target="_blank" rel="noopener noreferrer">
                      {a.name} <span aria-hidden="true">&#8599;</span>
                    </a>
                  ) : (
                    a.name
                  )}
                </h4>
                <p className="note">{a.description}</p>
                <p className="small shelf-card__meta">
                  {a.catalogId ? <span className="chip">{a.catalogId}</span> : null}
                  <span className="chip">{a.id}</span>
                  {a.repo ? (
                    <a href={a.repo} target="_blank" rel="noopener noreferrer" className="shelf-card__repo">
                      repo <span aria-hidden="true">&#8599;</span>
                    </a>
                  ) : null}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
      {total === 0 && (
        <p className="note" role="status">
          Nothing matches &ldquo;{query}&rdquo;. Clear the search to see all {apps.length} labs.
        </p>
      )}
    </section>
  );
}
