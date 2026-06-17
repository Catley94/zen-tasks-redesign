import React from 'react';
import { useApp } from '../shared/AppContext.jsx';
import { TOKENS, btnReset } from '../../data/seeds.js';

export default function OnboardingScreen() {
  const { onNav } = useApp();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: TOKENS.bg, fontFamily: TOKENS.fontSans, padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: 500, color: TOKENS.ink, marginBottom: 8 }}>Welcome to Zen Tasks</h1>
      <p style={{ color: TOKENS.sub, marginBottom: 24 }}>Your calm space for intentional work.</p>
      <button onClick={() => onNav('today')} style={{ ...btnReset, padding: '12px 28px', borderRadius: 999, background: TOKENS.green, color: '#fff', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>Get started</button>
    </div>
  );
}
