import React, { useState } from 'react';
import { useApp } from '../shared/AppContext.jsx';
import { useZenAI } from '../../state/useAppState.jsx';
import { TOKENS, btnReset } from '../../data/seeds.js';
import { Screen } from '../shared/screen.jsx';
import { SectionLabel } from '../shared/primitives.jsx';
import { Sparkles, Mic, Send } from '../shared/icons.jsx';

function ThinkingDots() {
  return <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
    {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: TOKENS.teal, opacity: 0.6, animation: `zenDot .9s ${i * 0.18}s ease-in-out infinite alternate` }} />)}
  </span>;
}

function ChatBubble({ m }) {
  const isUser = m.role === 'user';
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row' }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: 999, background: TOKENS.teal, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Sparkles size={12} />
        </div>
      )}
      <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isUser ? TOKENS.green : TOKENS.surface, color: isUser ? '#fff' : TOKENS.ink, fontSize: 13.5, lineHeight: 1.55, border: isUser ? 'none' : `1px solid ${TOKENS.line}` }}>
        {m.text}
      </div>
    </div>
  );
}

export default function ZenScreen() {
  const { app, onNav, frame } = useApp();
  const { messages, send, busy } = useZenAI(
    app.aiMode === 'manager'
      ? 'The user is in Manager mode: act on their requests with the available tools.'
      : 'The user is in Assistant mode: be a calm thinking partner.',
    { app, mode: app.aiMode }
  );
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    setText('');
    send(t);
  };

  const chatArea = (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 30px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 760, margin: '0 auto', width: '100%' }}>
      {messages.map((m, i) => <ChatBubble key={i} m={m} />)}
      {busy && <ChatBubble m={{ role: 'assistant', text: <ThinkingDots /> }} />}
    </div>
  );

  const composer = (
    <form onSubmit={submit} style={{ padding: '12px 30px 20px', borderTop: `1px solid ${TOKENS.line}`, background: TOKENS.surface }}>
      <div style={{ maxWidth: 760, margin: '0 auto', background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radiusLg, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Sparkles size={14} style={{ color: TOKENS.teal }} />
        <input value={text} onChange={e => setText(e.target.value)}
          placeholder={app.aiMode === 'manager' ? "Tell Zen what to add, change, or complete…" : "Ask Zen anything…"}
          disabled={busy}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14 }} />
        <button type="button" style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', color: TOKENS.sub }}><Mic size={13} /></button>
        <button type="submit" style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, background: TOKENS.teal, color: '#fff', display: 'grid', placeItems: 'center' }}><Send size={13} /></button>
      </div>
      <div style={{ maxWidth: 760, margin: '8px auto 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(app.aiMode === 'manager'
          ? ["Add task: call Ava about cover art", "Mark logo sketches done", "What's the quickest win today?"]
          : ["What should I do today?", "Why am I avoiding something?", "Summarise this week"]
        ).map(s => (
          <button key={s} onClick={() => send(s)} type="button" disabled={busy}
            style={{ ...btnReset, padding: '5px 10px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11 }}>{s}</button>
        ))}
      </div>
    </form>
  );

  return (
    <Screen app={app} active="zen" onNav={onNav} frame={frame}
      title="Zen" subtitle="Morning. Let's make today a calm one."
      crumbs={['Zen']}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {chatArea}
        {composer}
      </div>
    </Screen>
  );
}
