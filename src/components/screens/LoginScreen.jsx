import React, { useState } from 'react';
import { useApp } from '../shared/AppContext.jsx';
import { TOKENS, btnReset } from '../../data/seeds.js';
import { Sparkles } from '../shared/icons.jsx';

// Passwordless email sign-in (Supabase OTP). Shown only when the app is in DB
// mode and there is no session yet.
export default function LoginScreen() {
  const { app } = useApp();
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const configured = app.supabaseConfigured;

  const sendCode = async (e) => {
    e.preventDefault();
    const addr = email.trim();
    if (!addr || busy) return;
    setBusy(true); setError(null);
    try {
      await app.sendLoginCode(addr);
      setStep('code');
    } catch (err) {
      setError(err.message || 'Could not send the code.');
    } finally { setBusy(false); }
  };

  const verify = async (e) => {
    e.preventDefault();
    const token = code.trim();
    if (!token || busy) return;
    setBusy(true); setError(null);
    try {
      await app.verifyLoginCode(email.trim(), token);
      // On success the session updates and the gate swaps to the app.
    } catch (err) {
      setError(err.message || 'That code did not work.');
    } finally { setBusy(false); }
  };

  const field = {
    width: '100%', padding: '12px 14px', borderRadius: TOKENS.radius, fontSize: 15,
    border: `1px solid ${TOKENS.line}`, background: TOKENS.surface, color: TOKENS.ink,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };
  const primaryBtn = {
    ...btnReset, width: '100%', padding: '12px 14px', borderRadius: 999, fontSize: 14,
    fontWeight: 600, background: TOKENS.green, color: '#fff', cursor: 'pointer',
    opacity: busy ? 0.7 : 1,
  };

  return (
    <div style={{ width: '100%', height: '100dvh', background: TOKENS.bg, color: TOKENS.ink,
      fontFamily: TOKENS.fontSans, display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ width: 'min(380px, 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: TOKENS.green, color: '#fff', display: 'grid', placeItems: 'center' }}><Sparkles size={18} /></span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Zen Tasks</div>
            <div style={{ fontSize: 12.5, color: TOKENS.sub }}>Sign in to your database</div>
          </div>
        </div>

        {!configured ? (
          <div style={{ padding: 16, borderRadius: TOKENS.radius, border: `1px solid ${TOKENS.line}`, background: TOKENS.surface, fontSize: 13.5, lineHeight: 1.55, color: TOKENS.sub }}>
            Supabase isn’t configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then reload — or switch back to demo data below.
          </div>
        ) : step === 'email' ? (
          <form onSubmit={sendCode} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13.5, color: TOKENS.sub, lineHeight: 1.55 }}>
              Enter your email and we’ll send you a one-time code — no password needed.
            </p>
            <input type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={field} />
            <button type="submit" disabled={busy} style={primaryBtn}>{busy ? 'Sending…' : 'Email me a code'}</button>
          </form>
        ) : (
          <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13.5, color: TOKENS.sub, lineHeight: 1.55 }}>
              We sent a code to <strong style={{ color: TOKENS.ink }}>{email}</strong>. Enter it below.
            </p>
            <input inputMode="numeric" autoFocus value={code} onChange={e => setCode(e.target.value)}
              placeholder="123456" style={{ ...field, letterSpacing: 4, textAlign: 'center', fontSize: 18 }} />
            <button type="submit" disabled={busy} style={primaryBtn}>{busy ? 'Verifying…' : 'Verify & sign in'}</button>
            <button type="button" onClick={() => { setStep('email'); setCode(''); setError(null); }}
              style={{ ...btnReset, fontSize: 12.5, color: TOKENS.sub, cursor: 'pointer' }}>Use a different email</button>
          </form>
        )}

        {error && <div style={{ marginTop: 12, fontSize: 12.5, color: '#a23', lineHeight: 1.5 }}>{error}</div>}

        <button onClick={() => app.switchDataSource('seed')}
          style={{ ...btnReset, marginTop: 22, fontSize: 12, color: TOKENS.sub, cursor: 'pointer', display: 'block' }}>
          ← Use demo data instead (no sign-in)
        </button>
      </div>
    </div>
  );
}
