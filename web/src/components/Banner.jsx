import React from 'react';

// Simulation banner (rule 2): on every page and inside presenter mode. It says what is simulated and which mode is on.
export default function Banner({ mode, id }) {
  return (
    <p className="banner" id={id} role="status" data-state={mode === 'live' ? 'live' : 'mock'}>
      {mode === 'live'
        ? 'LIVE mode.'
        : 'MOCK mode. Index only: the pages below link to other local labs and summarize documentation and owner tests. No tenant is connected, nothing leaves this machine, and no link is opened for you. Anything marked "Not verified" is UNVERIFIED; check it before you present it.'}
    </p>
  );
}
