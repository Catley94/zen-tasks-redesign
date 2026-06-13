// Settings — AI companion, appearance, account, labs and developer controls,
// plus the small building blocks they share (groups, rows, toggle, explainer).

import React, { useState } from 'react';
import { TOKENS, btnReset } from '../lib/tokens';
import { Arr, Trash, Sparkles } from '../components/icons';
import { SectionLabel, DensityToggle } from '../components/primitives';
import { Screen } from '../components/screen';

function SettingsScreen({ app, variant, frame, onNav, onAsk }) {
  const body = variant === 'a' ? (
    <div style={{ padding: '22px 30px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680 }}>
      <SettingsGroup title="AI companion" tour="set-ai">
        <SettingRow label="Default mode" hint="Switch anytime. The normal screens stay fully usable either way.">
          <div style={{ display: 'inline-flex', background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: 999, padding: 2 }}>
            {['assistant','manager'].map(m => (
              <button key={m} onClick={()=>app.setAiMode(m)} style={{ ...btnReset, padding: '5px 14px', borderRadius: 999,
                background: app.aiMode===m ? (m==='manager' ? TOKENS.teal : TOKENS.green) : 'transparent',
                color: app.aiMode===m ? '#fff' : TOKENS.sub, fontSize: 12, textTransform: 'capitalize', fontWeight: 500 }}>{m}</button>
            ))}
          </div>
        </SettingRow>
        <AiModeExplainer mode={app.aiMode}/>
        <SettingRow label="Proactive nudges" hint="Zen can send a quiet message when a project goes quiet, or to pass on your own enthusiasm.">
          <Toggle on={true}/>
        </SettingRow>
        <SettingRow label="Voice input" hint="Hold space to dictate.">
          <Toggle on={false}/>
        </SettingRow>
      </SettingsGroup>
      <SettingsGroup title="Appearance" tour="set-appearance">
        <SettingRow label="Density"><DensityToggle value={app.density} onChange={app.setDensity}/></SettingRow>
        <SettingRow label="Dyslexia-friendly font" hint="Switches the whole app to OpenDyslexic, designed to reduce letter-swapping.">
          <Toggle on={app.dyslexiaFont} onChange={app.setDyslexiaFont}/>
        </SettingRow>
        <SettingRow label="Accent pairing" hint="Forest green remains primary. Turquoise is used for AI and highlights.">
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, background: TOKENS.green, border: `2px solid ${TOKENS.bg}`, boxShadow: `0 0 0 1.5px ${TOKENS.green}` }}/>
            <span style={{ width: 24, height: 24, borderRadius: 999, background: TOKENS.teal, border: `2px solid ${TOKENS.bg}`, boxShadow: `0 0 0 1.5px ${TOKENS.teal}` }}/>
          </div>
        </SettingRow>
      </SettingsGroup>
      <SettingsGroup title="Account">
        <SettingRow label="Email"><span style={{ fontSize: 13, color: TOKENS.sub }}>sam@hey.com</span></SettingRow>
        <SettingRow label="Plan"><span style={{ fontSize: 13, color: TOKENS.sub }}>Free · 1 goal</span></SettingRow>
      </SettingsGroup>
      <SettingsGroup title="Labs">
        <SettingRow stack={frame==='mobile'} label="Switch app version" hint="Go back to the classic app. Placeholder for now — wires into the old React app later.">
          <button onClick={()=>{}} style={{ ...btnReset, padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            color: TOKENS.sub, border: `1px solid ${TOKENS.line}`, background: TOKENS.surface, display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
            Switch to classic app <Arr size={13}/>
          </button>
        </SettingRow>
      </SettingsGroup>
      <SettingsGroup title="Developer">
        <SettingRow label="Clear database" hint="Development only — wipes local data and reloads the app with fresh seed content.">
          <DevClearButton app={app}/>
        </SettingRow>
      </SettingsGroup>
    </div>
  ) : (
    // B — sectioned nav on left
    <div style={{ padding: '22px 30px 40px', display: 'grid', gridTemplateColumns: frame==='mobile'?'1fr':'200px 1fr', gap: 24 }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {['Profile','AI companion','Appearance','Notifications','Goal settings','Danger zone'].map((n,i)=>(
          <button key={n} style={{ ...btnReset, padding: '8px 10px', textAlign: 'left', borderRadius: 6, fontSize: 13,
            background: i===1?TOKENS.greenSoft:'transparent', color: i===1?TOKENS.green:TOKENS.ink, fontWeight: i===1?500:400 }}>{n}</button>
        ))}
      </nav>
      <div>
        <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 500, letterSpacing: -0.3 }}>AI companion</h2>
        <div style={{ fontSize: 13, color: TOKENS.sub, marginBottom: 20 }}>How and when Zen shows up.</div>
        <SettingRow label="Default mode" hint="Assistant: summoned only. Manager: Zen edits tasks with you.">
          <div style={{ display: 'inline-flex', background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: 999, padding: 2 }}>
            {['assistant','manager'].map(m => (
              <button key={m} onClick={()=>app.setAiMode(m)} style={{ ...btnReset, padding: '5px 14px', borderRadius: 999,
                background: app.aiMode===m ? (m==='manager' ? TOKENS.teal : TOKENS.green) : 'transparent',
                color: app.aiMode===m ? '#fff' : TOKENS.sub, fontSize: 12, textTransform: 'capitalize', fontWeight: 500 }}>{m}</button>
            ))}
          </div>
        </SettingRow>
        <AiModeExplainer mode={app.aiMode}/>
        <SettingRow label="Corner companion" hint="The small leaf in the corner of every screen."><Toggle on={true}/></SettingRow>
        <SettingRow label="Proactive nudges" hint="Quiet messages about quiet projects or recovered enthusiasm."><Toggle on={true}/></SettingRow>
        <SettingRow label="Check-in frequency" hint="How often Zen may start a conversation.">
          <select style={{ fontSize: 12, padding: '5px 8px', borderRadius: 6, border: `1px solid ${TOKENS.line}`, background: TOKENS.surface }}>
            <option>Rarely</option><option>Weekly</option><option>A few times a week</option>
          </select>
        </SettingRow>
      </div>
    </div>
  );
  return (
    <Screen frame={frame} app={app} active="settings" onNav={onNav} onAsk={onAsk}
      title="Settings" crumbs={['Settings']}>{body}</Screen>
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
    <div style={{ padding: '13px 16px', borderTop: `1px solid ${TOKENS.lineSoft}`, display: 'flex',
      flexDirection: stack ? 'column' : 'row', gap: stack ? 10 : 14, alignItems: stack ? 'stretch' : 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: TOKENS.sub, marginTop: 3, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}
// Dev-only destructive action with inline confirm.
function DevClearButton({ app }) {
  const [confirm, setConfirm] = useState(false);
  if (!confirm) {
    return (
      <button onClick={()=>setConfirm(true)} style={{ ...btnReset, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
        color: TOKENS.rose, border: `1px solid ${TOKENS.rose}44`, background: 'transparent', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Trash size={12}/>Clear database
      </button>
    );
  }
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 11.5, color: TOKENS.sub }}>Sure?</span>
      <button onClick={()=>app.clearDatabase()} style={{ ...btnReset, padding: '6px 12px', borderRadius: 999, background: TOKENS.rose, color: '#fff', fontSize: 11.5, fontWeight: 500 }}>Wipe & reload</button>
      <button onClick={()=>setConfirm(false)} style={{ ...btnReset, padding: '6px 10px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11.5 }}>Cancel</button>
    </span>
  );
}

function Toggle({ on, onChange }) {
  const [vRaw, setV] = useState(on);
  const controlled = onChange != null;
  const v = controlled ? on : vRaw;
  const toggle = () => { if (controlled) onChange(!v); else setV(!v); };
  return (
    <button onClick={toggle} style={{ ...btnReset, width: 34, height: 20, borderRadius: 999, background: v?TOKENS.green:TOKENS.line, position: 'relative', transition: 'background .2s' }}>
      <span style={{ position: 'absolute', top: 2, left: v?16:2, width: 16, height: 16, borderRadius: 999, background: '#fff', transition: 'left .2s' }}/>
    </button>
  );
}

// Inline explainer that updates with the chosen AI mode.
function AiModeExplainer({ mode }) {
  const isMgr = mode === 'manager';
  const accent = isMgr ? TOKENS.teal : TOKENS.green;
  const soft = isMgr ? TOKENS.tealTint : TOKENS.greenTint;
  const bullets = isMgr
    ? ['Lives front-and-centre — you type or speak what you want.',
       'Can add, edit, complete, move and delete tasks for you, then shows what it changed.',
       'Bigger life moves (parking a goal, changing your primary goal) it still checks first.']
    : ['Stays out of the way — summoned with ⌘K or the corner leaf.',
       'Advises only: suggests what to start with, explains quiet projects, replays your notes.',
       'Never changes your tasks on its own — anything it proposes, you tap to apply.'];
  return (
    <div style={{ padding: '14px 16px', borderTop: `1px solid ${TOKENS.lineSoft}`, background: soft+'66' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 22, height: 22, borderRadius: 999, background: accent, color: '#fff', display: 'grid', placeItems: 'center' }}><Sparkles size={11}/></span>
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{isMgr ? 'Manager' : 'Assistant'}</div>
        <div style={{ fontSize: 11.5, color: TOKENS.sub }}>· {isMgr ? 'Zen drives, with you' : 'You drive, Zen advises'}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {bullets.map((b,i)=>(
          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: TOKENS.inkSoft, lineHeight: 1.5 }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: accent, marginTop: 6, flexShrink: 0 }}/>
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

export { SettingsScreen };
