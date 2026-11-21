import React, { useCallback, useEffect, useState } from 'react';
import ShelfPage from './pages/ShelfPage.jsx';
import FeaturePage from './pages/FeaturePage.jsx';
import DocsPage from './pages/DocsPage.jsx';
import StoriesPage from './pages/StoriesPage.jsx';
import TopMenu, { applyFontSize } from './top-menu/TopMenu.jsx';
import ShelfLink from "./components/ShelfLink.jsx";
import VerifyMark from "./components/VerifyMark.jsx";
import Banner from './components/Banner.jsx';
import Presenter from './components/Presenter.jsx';
import { PAGES } from './data/pages.js';
import { getJson, postJson } from './api.js';

const NAV = PAGES;
const THEME_KEY = 'privshelf.theme';
const THEMES = [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']];

function initialTheme() {
  try { const t = localStorage.getItem(THEME_KEY); if (t === 'light' || t === 'dark') return t; } catch { /* storage blocked */ }
  return 'auto';
}

// Routes are hash routes: #/shelf, #/features, #/stories.
function currentRoute() {
  const path = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return { id: NAV.some((n) => n.id === path) ? path : 'shelf' };
}

export default function App() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [route, setRoute] = useState(currentRoute());
  const [theme, setTheme] = useState(initialTheme);
  const [fontStep, setFontStep] = useState(() => { try { return localStorage.getItem('privshelf.font') || 'L'; } catch { return 'L'; } });
  useEffect(() => { applyFontSize(fontStep); try { localStorage.setItem('privshelf.font', fontStep); } catch { /* blocked */ } }, [fontStep]);
  const pickTheme = (next) => {
    try { if (next === 'auto') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, next); } catch { /* not remembered */ }
    setTheme(next);
  };
  // The picker only sets data-theme; the shared stylesheet does the rest ("auto" follows the system setting).
  useEffect(() => { if (theme === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = theme; }, [theme]);
  const [talk, setTalk] = useState([]);
  const [presenting, setPresenting] = useState(false);
  const [step, setStep] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    getJson('/api/state')
      .then((s) => {
        setInfo(s);
        setStep(Math.min(s.run?.presenterStep || 0, 99));
        if (!window.location.hash && s.run?.page && NAV.some((n) => n.id === s.run.page)) window.location.hash = `#/${s.run.page}`;
      })
      .catch((e) => setError(e.message));
    getJson('/api/talk-track')
      .then((d) => setTalk(d.steps))
      .catch(() => setTalk([]));
  }, []);

  useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (info) postJson('/api/run', { page: route.id });
  }, [route.id, info]);

  const chooseMode = useCallback(async (mode) => {
    const res = await postJson('/api/mode', { mode });
    setNote(res.ok ? '' : res.data.error || 'The mode was not changed.');
  }, []);

  const goStep = useCallback(
    (i) => {
      const next = Math.max(0, Math.min(i, talk.length - 1));
      setStep(next);
      postJson('/api/run', { presenterStep: next });
    },
    [talk.length]
  );

  const reset = async () => {
    const res = await postJson('/api/reset');
    if (res.ok) {
      setStep(0);
      setPresenting(false);
      setNote('Reset: run state for this workspace is cleared. Saved settings are kept.');
    } else {
      setNote('Reset failed.');
    }
  };

  if (error) {
    return (
      <main className="page">
        <p className="note" role="alert">
          The server did not answer: {error}. Is the app running? Try npm start.
        </p>
      </main>
    );
  }
  if (!info) return <main className="page"><p className="note">Loading.</p></main>;

  const { branding } = info.customer;
  return (
    <div className="shell">
      <header className="shell-bar">
        <div className="shell-brand">
          <h1>{branding.productName}</h1>
          <p>{branding.tagline}</p>
        </div>
        <div className="shell-right">
          <TopMenu
            mode={info?.mode ? { value: info.mode, onChange: chooseMode, realAvailable: !!info.liveAvailable, realHint: info.liveReason } : undefined}
            theme={{ value: theme, onChange: pickTheme }}
            fontSize={{ value: fontStep, onChange: setFontStep }}
            present={{ active: presenting, onToggle: () => setPresenting(!presenting), label: 'Present' }}
            version={info.version || null}
            extra={null}
          >
            <ShelfLink />
            <VerifyMark id="privilege-shelf" />
          </TopMenu>
        </div>
        <nav className="shell-nav" aria-label="Pages">
          {NAV.map((n) => (
            <a key={n.id} href={`#/${n.id}`} aria-current={route.id === n.id ? 'page' : undefined}>
              {n.title}
            </a>
          ))}
        </nav>
      </header>
      <Banner mode={info.mode} />
      <p className="note" aria-live="polite">
        {note || (info.liveAvailable ? '' : info.liveReason)}
      </p>
      <main className="page">
        {route.id === 'shelf' ? <ShelfPage /> : null}
        {route.id === 'features' ? <FeaturePage key="features" /> : null}
        {route.id === 'docs' ? <DocsPage /> : null}
        {route.id === 'stories' ? <StoriesPage /> : null}
      </main>
      <footer className="footer">
        <span>
          Workspace <code>{info.workspace}</code>
        </span>
        {branding.footer ? <span>{branding.footer}</span> : null}
        <button type="button" className="primary" onClick={reset}>
          Reset this workspace
        </button>
      </footer>
      {presenting ? <Presenter steps={talk} index={step} mode={info.mode} onIndex={goStep} onExit={() => setPresenting(false)} /> : null}
    </div>
  );
}
