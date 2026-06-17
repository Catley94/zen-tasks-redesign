import React, { useState } from 'react';
import { useApp } from '../shared/AppContext.jsx';
import { TOKENS, btnReset } from '../../data/seeds.js';
import { Screen } from '../shared/screen.jsx';
import { SectionLabel, DensityToggle } from '../shared/primitives.jsx';
import { Sparkles, Arr, Trash } from '../shared/icons.jsx';

function Toggle({ on, onChange }) {
  const [vRaw, setV] = useState(on);
  const controlled = onChange != null;
  const v = controlled ? on : vRaw;
  const toggle = () => { if (controlled) onChange(!v); else setV(!v); };
  return (
    <button onClick={toggle} style={{ ...btnReset, width: 34, height: 20, borderRadius: 999, background: v ? TOKENS.green : TOKENS.line, position: 'relative', transition: 'background .2s' }}>
      <span style={{ position: 'absolute', top: 2, left: v ? 16 : 2, width: 16, height: 16, borderRadius: 999, background: '#fff', transition: 'left .2s' }} />
    </button>
  );
}

function AiModeExplainer({ mode }) {
  const isMgr = mode === 'manager';
  const accent = isMgr ? TOKENS.teal : TOKENS.green;
  const soft = isMgr ? TOKENS.tealTint : TOKENS.greenTint;
  const bullets = isMgr
    ? ['Lives front-and-centre — you type or speak what you want.', 'Can add, edit, complete, move and delete tasks for you, then shows what it changed.', 'Bigger life moves (parking a goal, changing your primary goal) it still checks first.']
    : ['Stays out of the way — summoned with ⌘K or the corner leaf.', 'Advises only: suggests what to start with, explains quiet projects, replays your notes.', 'Never changes your tasks on its own — anything it proposes, you tap to apply.'];
  return (
    <div style={{ padding: '14px 16px', borderTop: `1px solid ${TOKENS.lineSoft}`, background: soft + '66' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 22, height: 22, borderRadius: 999, background: accent, color: '#fff', display: 'grid', placeItems: 'center' }}><Sparkles size={11} /></span>
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{isMgr ? 'Manager' : 'Assistant'}</div>
        <div style={{ fontSize: 11.5, color: TOKENS.sub }}>· {isMgr ? 'Zen drives, with you' : 'You drive, Zen advises'}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {bullets.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: TOKENS.inkSoft, lineHeight: 1.5 }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: accent, marginTop: 6, flexShrink: 0 }} />
            <span>{b}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: TOKENS.sub, marginTop: 9, fontStyle: 'italic' }}>
        Either way, the normal screens stay fully usable — Manager just adds a conversational layer on top.
      </div>
    </div>
  );
}

function SeedButton({ app }) {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (busy) return;
    if (!window.confirm('Copy the demo goals, projects, and tasks into your database?')) return;
    setBusy(true);
    try { await app.seedDatabaseNow(); } catch (e) { alert(e.message || 'Failed to seed.'); setBusy(false); }
  };
  return (
    <button onClick={run} disabled={busy} style={{ ...btnReset, padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, color: TOKENS.green, border: `1px solid ${TOKENS.green}`, background: TOKENS.surface, cursor: 'pointer' }}>
      {busy ? 'Copying…' : 'Copy demo data'}
    </button>
  );
}

function SettingsGroup({ title, children, tour }) {
  return (
    <div data-tour={tour} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${TOKENS.lineSoft}` }}><SectionLabel>{title}</SectionLabel></div>
      {children}
    </div>
  );
}

function SettingRow({ label, hint, children, stack }) {
  return (
    <div style={{ padding: '13px 16px', borderTop: `1px solid ${TOKENS.lineSoft}`, display: 'flex', flexDirection: stack ? 'column' : 'row', gap: stack ? 10 : 14, alignItems: stack ? 'stretch' : 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: TOKENS.sub, marginTop: 3, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function DevClearButton({ app }) {
  const [confirm, setConfirm] = useState(false);
  if (!confirm) {
    return (
      <button onClick={() => setConfirm(true)} style={{ ...btnReset, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, color: TOKENS.rose, border: `1px solid ${TOKENS.rose}44`, background: 'transparent', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Trash size={12} />Clear database
      </button>
    );
  }
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 11.5, color: TOKENS.sub }}>Sure?</span>
      <button onClick={() => app.clearDatabase()} style={{ ...btnReset, padding: '6px 12px', borderRadius: 999, background: TOKENS.rose, color: '#fff', fontSize: 11.5, fontWeight: 500 }}>Wipe & reload</button>
      <button onClick={() => setConfirm(false)} style={{ ...btnReset, padding: '6px 10px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11.5 }}>Cancel</button>
    </span>
  );
}

export default function SettingsScreen() {
  const { app, onNav, frame } = useApp();

  return (
    <Screen app={app} active="settings" onNav={onNav} frame={frame}
      title="Settings" crumbs={['Settings']}>
      <div style={{ padding: '22px 30px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680 }}>
        <SettingsGroup title="AI companion" tour="set-ai">
          <SettingRow label="Default mode" hint="Switch anytime. The normal screens stay fully usable either way.">
            <div style={{ display: 'inline-flex', background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: 999, padding: 2 }}>
              {['assistant', 'manager'].map(m => (
                <button key={m} onClick={() => app.setAiMode(m)} style={{ ...btnReset, padding: '5px 14px', borderRadius: 999, background: app.aiMode === m ? (m === 'manager' ? TOKENS.teal : TOKENS.green) : 'transparent', color: app.aiMode === m ? '#fff' : TOKENS.sub, fontSize: 12, textTransform: 'capitalize', fontWeight: 500 }}>{m}</button>
              ))}
            </div>
          </SettingRow>
          <AiModeExplainer mode={app.aiMode} />
          <SettingRow label="Proactive nudges" hint="Zen can send a quiet message when a project goes quiet, or to pass on your own enthusiasm.">
            <Toggle on={true} />
          </SettingRow>
          <SettingRow label="Voice input" hint="Hold space to dictate.">
            <Toggle on={false} />
          </SettingRow>
        </SettingsGroup>
        <SettingsGroup title="Appearance" tour="set-appearance">
          <SettingRow label="Density"><DensityToggle value={app.density} onChange={app.setDensity} /></SettingRow>
          <SettingRow label="Dyslexia-friendly font" hint="Switches the whole app to OpenDyslexic, designed to reduce letter-swapping.">
            <Toggle on={app.dyslexiaFont} onChange={app.setDyslexiaFont} />
          </SettingRow>
          <SettingRow label="Accent pairing" hint="Forest green remains primary. Turquoise is used for AI and highlights.">
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, background: TOKENS.green, border: `2px solid ${TOKENS.bg}`, boxShadow: `0 0 0 1.5px ${TOKENS.green}` }} />
              <span style={{ width: 24, height: 24, borderRadius: 999, background: TOKENS.teal, border: `2px solid ${TOKENS.bg}`, boxShadow: `0 0 0 1.5px ${TOKENS.teal}` }} />
            </div>
          </SettingRow>
        </SettingsGroup>
        <SettingsGroup title="Account">
          <SettingRow label="Email"><span style={{ fontSize: 13, color: TOKENS.sub }}>—</span></SettingRow>
          <SettingRow label="Plan"><span style={{ fontSize: 13, color: TOKENS.sub }}>Free · 1 goal</span></SettingRow>
        </SettingsGroup>
        <SettingsGroup title="Data">
          <SettingRow stack={frame === 'mobile'} label="Data source" hint="Demo data is local-only and resets on reload. Database stores your data in Supabase (sign-in required). Switching reloads the app.">
            <div style={{ display: 'inline-flex', background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: 999, padding: 3 }}>
              {[['seed', 'Demo data'], ['supabase', 'Database']].map(([val, label]) => (
                <button key={val} onClick={() => { if (app.dataSource !== val) app.switchDataSource(val); }}
                  style={{ ...btnReset, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    background: app.dataSource === val ? TOKENS.green : 'transparent', color: app.dataSource === val ? '#fff' : TOKENS.sub }}>
                  {label}
                </button>
              ))}
            </div>
          </SettingRow>
          {app.dbMode && app.session && (
            <>
              <SettingRow label="Signed in as"><span style={{ fontSize: 13, color: TOKENS.sub }}>{app.user?.email || '—'}</span></SettingRow>
              <SettingRow stack={frame === 'mobile'} label="Seed demo data" hint="Copies the sample goals, projects and tasks into your database so there's something to work with.">
                <SeedButton app={app} />
              </SettingRow>
              <SettingRow stack={frame === 'mobile'} label="Sign out">
                <button onClick={() => app.signOut()} style={{ ...btnReset, padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, color: TOKENS.sub, border: `1px solid ${TOKENS.line}`, background: TOKENS.surface, cursor: 'pointer' }}>Sign out</button>
              </SettingRow>
            </>
          )}
        </SettingsGroup>
        <SettingsGroup title="Labs">
          <SettingRow stack={frame === 'mobile'} label="Switch app version" hint="Go back to the classic app.">
            <button onClick={() => { }} style={{ ...btnReset, padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, color: TOKENS.sub, border: `1px solid ${TOKENS.line}`, background: TOKENS.surface, display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
              Switch to classic app <Arr size={13} />
            </button>
          </SettingRow>
        </SettingsGroup>
        <SettingsGroup title="Developer">
          <SettingRow label="Clear database" hint="Development only — wipes local data and reloads the app with fresh seed content.">
            <DevClearButton app={app} />
          </SettingRow>
        </SettingsGroup>
      </div>
    </Screen>
  );
}
