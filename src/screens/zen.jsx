// Zen conversations — the full Ask Zen page (ZenScreen) and a proactive
// check-in that Zen starts about a stale project (NudgeScreen).

import React, { useState } from 'react';
import { TOKENS, btnReset } from '../lib/tokens';
import { Sparkles, Mic, Send } from '../components/icons';
import { SectionLabel, ChatBubble, ThinkingDots } from '../components/primitives';
import { useZenAI } from '../state';
import { Screen } from '../components/screen';

// ====== ASK ZEN (full page) ======
function ZenScreen({ app, variant, frame, onNav, onAsk }) {
  const { messages, send, busy } = useZenAI();
  const [text, setText] = useState('');
  const submit = (e) => { e.preventDefault(); const t = text.trim(); if (!t || busy) return; setText(''); send(t); };

  const chatArea = (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 30px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 760, margin: '0 auto', width: '100%' }}>
      {messages.map((m, i) => <ChatBubble key={i} m={m}/>)}
      {busy && <ChatBubble m={{role:'assistant', text: <ThinkingDots/>}}/>}
    </div>
  );

  const composer = (
    <form onSubmit={submit} style={{ padding: '12px 30px 20px', borderTop: `1px solid ${TOKENS.line}`, background: TOKENS.surface }}>
      <div style={{ maxWidth: 760, margin: '0 auto', background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radiusLg, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Sparkles size={14} style={{ color: TOKENS.teal }}/>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder={app.aiMode==='manager' ? "Tell Zen what to add, change, or complete…" : "Ask Zen anything…"}
          disabled={busy} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14 }}/>
        <button type="button" style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', color: TOKENS.sub }}><Mic size={13}/></button>
        <button type="submit" style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, background: TOKENS.teal, color: '#fff', display: 'grid', placeItems: 'center' }}><Send size={13}/></button>
      </div>
      <div style={{ maxWidth: 760, margin: '8px auto 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(app.aiMode==='manager'
          ? ["Add task: call Ava about cover art","Mark logo sketches done","What's the quickest win today?"]
          : ["What should I do today?","Why am I avoiding Quiet Hours?","Summarise this week"]
        ).map(s => (
          <button key={s} onClick={()=>send(s)} type="button" disabled={busy}
            style={{ ...btnReset, padding: '5px 10px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11 }}>{s}</button>
        ))}
      </div>
    </form>
  );

  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {variant === 'b' && (
        <div style={{ padding: '14px 30px', borderBottom: `1px solid ${TOKENS.lineSoft}`, display: 'flex', gap: 10, alignItems: 'center', background: TOKENS.surface }}>
          <SectionLabel color={TOKENS.teal}>Mode</SectionLabel>
          <div style={{ display: 'inline-flex', background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: 999, padding: 2 }}>
            {['assistant','manager'].map(m => (
              <button key={m} onClick={()=>app.setAiMode(m)} style={{ ...btnReset, padding: '4px 12px', borderRadius: 999,
                background: app.aiMode===m ? (m==='manager' ? TOKENS.teal : TOKENS.green) : 'transparent',
                color: app.aiMode===m ? '#fff' : TOKENS.sub, fontSize: 11, textTransform: 'capitalize', fontWeight: 500 }}>
                {m}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: TOKENS.sub, marginLeft: 8 }}>
            {app.aiMode==='manager' ? 'Zen edits tasks on your behalf.' : 'Zen advises; you stay in control.'}
          </div>
        </div>
      )}
      {chatArea}
      {composer}
    </div>
  );
  return (
    <Screen frame={frame} app={app} active="zen" onNav={onNav} onAsk={onAsk}
      title={variant==='a'?"Zen":"Ask Zen"} subtitle={variant==='a'?"Morning. Let's make today a calm one.":"Grounded in your goal, phase, and projects."}
      crumbs={['Zen']}>{body}</Screen>
  );
}

// ====== NUDGE / proactive chat notification ======
function NudgeScreen({ app, variant, frame, onNav, onAsk }) {
  // Full-screen Zen chat appearing as a message from the AI about a stale project
  const proj = app.projectById('p4');
  const [chat, setChat] = useState([
    { role: 'assistant', text: "I noticed Quiet Hours has been sitting for 14 days. You wrote something about it 3 weeks ago — want me to pull up that note?" },
  ]);
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {variant === 'a' && (
        <div style={{ background: TOKENS.tealTint, padding: '14px 30px', borderBottom: `1px solid ${TOKENS.tealSoft}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: TOKENS.teal, color: '#fff', display: 'grid', placeItems: 'center' }}><Sparkles size={13}/></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: TOKENS.teal, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase' }}>Zen · just now</div>
            <div style={{ fontSize: 13, color: TOKENS.ink, marginTop: 2 }}>A quiet check-in about one of your projects.</div>
          </div>
          <button style={{ ...btnReset, color: TOKENS.sub, fontSize: 12 }}>Not now</button>
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, margin: '0 auto', width: '100%' }}>
        {variant === 'b' && (
          <div style={{ alignSelf: 'center', padding: '4px 12px', borderRadius: 999, background: TOKENS.tealTint, color: TOKENS.teal, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Zen started this conversation</div>
        )}
        {chat.map((m,i)=><ChatBubble key={i} m={m}/>)}
        <div style={{ marginLeft: 32, background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: proj.color }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{proj.name}</div>
            <div style={{ fontSize: 11, color: TOKENS.sub }}>Last touch {proj.lastActive}</div>
          </div>
          <button style={{ ...btnReset, padding: '5px 10px', borderRadius: 999, background: TOKENS.tealSoft, color: TOKENS.tealDeep, fontSize: 11.5 }}>Open</button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 32 }}>
          {["Yes, show me the note","Later this week","I'm parking it for now"].map(s => (
            <button key={s} style={{ ...btnReset, padding: '7px 12px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.ink, fontSize: 12 }}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 30px 20px', borderTop: `1px solid ${TOKENS.line}`, background: TOKENS.surface }}>
        <div style={{ maxWidth: 640, margin: '0 auto', background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radiusLg, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={14} style={{ color: TOKENS.teal }}/>
          <input placeholder="Reply to Zen…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14 }}/>
          <button style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, background: TOKENS.teal, color: '#fff', display: 'grid', placeItems: 'center' }}><Send size={13}/></button>
        </div>
      </div>
    </div>
  );
  return (
    <Screen frame={frame} app={app} active="zen" onNav={onNav} onAsk={onAsk}
      title="A message from Zen" crumbs={['Zen']}>{body}</Screen>
  );
}

export { ZenScreen, NudgeScreen };
