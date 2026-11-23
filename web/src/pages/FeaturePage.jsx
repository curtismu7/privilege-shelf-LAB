import React, { useEffect, useRef, useState } from 'react';
import features from '../data/features.json';
import { PAGES } from '../data/pages.js';

// Drag the divider to resize the feature list; the width persists.
function useSplitResize(ref, key) {
  const onHandleDown = (e) => {
    e.preventDefault();
    const grid = ref.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const move = (ev) => {
      ev.preventDefault();
      const w = Math.min(Math.max(ev.clientX - rect.left, 180), rect.width * 0.45);
      grid.style.setProperty('--list-w', `${w}px`);
    };
    const up = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      try {
        const w = parseFloat(getComputedStyle(grid).getPropertyValue('--list-w'));
        if (w) localStorage.setItem(key, String(w));
      } catch { /* none */ }
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
  };
  return onHandleDown;
}

function Section({ title, children }) {
  return (
    <section className="feature__section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function FeatureDetail({ feature }) {
  return (
    <article className="feature" aria-labelledby={`f-${feature.id}`}>
      <h3 id={`f-${feature.id}`}>{feature.name}</h3>
      <Section title="Why we need it">
        <p>{feature.why}</p>
      </Section>
      <Section title="How it works">
        <p>{feature.how}</p>
      </Section>
      <Section title="Value to the end user">
        <p>{feature.userValue}</p>
      </Section>
      <Section title="Components used">
        <ul className="chips">
          {feature.components.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Section>
      <details className="feature__more">
        <summary>Sources and what is not verified</summary>
        <p className="small">
          <strong>Sources:</strong> {feature.sources.join('; ')}. The owner notes are working notes and are not part of this repo.
        </p>
        {feature.unverified.length > 0 && (
          <>
            <p className="small">
              <strong>Not verified:</strong>
            </p>
            <ul className="small">
              {feature.unverified.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </>
        )}
      </details>
    </article>
  );
}

export default function FeaturePage() {
  const [selected, setSelected] = useState(features[0]?.id);
  const splitRef = useRef(null);
  const onHandleDown = useSplitResize(splitRef, 'pf.listW');
  useEffect(() => {
    try {
      const w = parseFloat(localStorage.getItem('pf.listW'));
      if (w && splitRef.current) splitRef.current.style.setProperty('--list-w', `${w}px`);
    } catch { /* none */ }
  }, []);
  const current = features.find((f) => f.id === selected) || features[0];
  const page = PAGES.find((p) => p.id === 'features');
  return (
    <section aria-label={page.title}>
      <h2>{page.title}</h2>
      <p className="page-purpose">{page.purpose}</p>
      <p className="draft-note" role="note">
        Draft content compiled from Ping documentation and our own tests. Open &ldquo;Sources and what is not verified&rdquo; on a feature before presenting it.
      </p>
      <div className="split" ref={splitRef}>
        <nav className="feature-list" aria-label="Privilege features">
          {features.map((f) => (
            <button key={f.id} type="button" aria-pressed={current.id === f.id} onClick={() => setSelected(f.id)}>
              {f.name}
            </button>
          ))}
        </nav>
        <div className="col-handle" role="separator" aria-orientation="vertical" aria-label="Resize feature list" onPointerDown={onHandleDown} />
        <FeatureDetail key={current.id} feature={current} />
      </div>
    </section>
  );
}
