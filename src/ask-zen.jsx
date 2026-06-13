// Summoned Ask Zen overlay — consistent across all prototypes.
import { useState, useEffect, useRef } from 'react';
import { btnReset } from './tokens';
import { useZenAI } from './state';
import { Sparkles, Leaf, User } from './icons';

export function AskZen({ open, onClose, tone }) {
  const { messages, send, busy } = useZenAI();
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { if (open) setTimeout(()=>inputRef.current?.focus(), 30); }, [open]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    setText('');
    send(t);
  };
  const suggestions = [
    "What should I start with today?",
    "Any projects I'm quietly avoiding?",
    "Remind me why this phase matters.",
  ];

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0,
      background: 'rgba(20,24,20,0.22)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'start center', paddingTop: 90, zIndex: 50 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 'min(520px, 92%)', maxHeight: 'calc(100% - 120px)',
        background: tone.surface, borderRadius: 16, border: `1px solid ${tone.line}`,
        boxShadow: '0 40px 80px rgba(20,30,20,0.2)', overflow: 'hidden',
        fontFamily: tone.fontSans, color: tone.ink, display: 'flex', flexDirection: 'column' }}>
        <form onSubmit={submit} style={{ display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 18px', borderBottom: `1px solid ${tone.line}` }}>
          <Sparkles size={16} style={{ color: tone.accent }}/>
          <input ref={inputRef} value={text} onChange={e=>setText(e.target.value)}
            placeholder="Ask Zen anything…" disabled={busy}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'inherit', fontSize: 15, color: tone.ink }}/>
          <span style={{ fontSize: 10, color: tone.sub, fontFamily: 'monospace',
            padding: '3px 7px', borderRadius: 5, background: tone.bg, border: `1px solid ${tone.line}` }}>esc</span>
        </form>
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px 8px',
          display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                background: m.role === 'assistant' ? tone.accentSoft : tone.bg,
                color: m.role === 'assistant' ? tone.accent : tone.sub,
                display: 'grid', placeItems: 'center' }}>
                {m.role === 'assistant' ? <Leaf size={11}/> : <User size={11}/>}
              </div>
              <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.55,
                color: m.role === 'assistant' ? tone.ink : tone.sub,
                fontStyle: m.role === 'user' ? 'italic' : 'normal' }}>{m.text}</div>
            </div>
          ))}
          {busy && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, color: tone.sub }}>
              <div style={{ width: 22, height: 22, borderRadius: 999, background: tone.accentSoft,
                color: tone.accent, display: 'grid', placeItems: 'center' }}><Leaf size={11}/></div>
              <ThinkingDots/>
            </div>
          )}
        </div>
        <div style={{ padding: '10px 14px 14px', borderTop: `1px solid ${tone.line}`,
          display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} disabled={busy}
              style={{ ...btnReset, padding: '6px 10px', borderRadius: 999,
              background: tone.bg, border: `1px solid ${tone.line}`, color: tone.sub, fontSize: 11.5 }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ThinkingDots() {
  const [n, setN] = useState(1);
  useEffect(() => { const id = setInterval(()=>setN(x=>x%3+1), 420); return () => clearInterval(id); }, []);
  return <span style={{ fontFamily: 'monospace', letterSpacing: 2 }}>{'·'.repeat(n)}</span>;
}

export function ZenButton({ tone, onClick, floating, variant = 'solid' }) {
  const base = floating
    ? { position: 'absolute', bottom: 22, right: 22, height: 44, padding: '0 16px 0 14px',
        boxShadow: '0 6px 24px rgba(30,40,30,0.18)' }
    : { height: 32, padding: '0 12px 0 10px' };
  const solid = { background: tone.ink, color: tone.bg };
  const ghost = { background: tone.surface, color: tone.ink, border: `1px solid ${tone.line}` };
  return (
    <button onClick={onClick} style={{ ...btnReset, ...base, borderRadius: 999,
      ...(variant === 'ghost' ? ghost : solid),
      display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 500,
      fontFamily: tone.fontSans }}>
      <Sparkles size={13} style={variant === 'ghost' ? { color: tone.accent } : {}}/> Ask Zen
      <span style={{ fontSize: 10, opacity: 0.55,
        background: variant === 'ghost' ? tone.bg : 'rgba(255,255,255,0.12)',
        padding: '2px 5px', borderRadius: 4, fontFamily: 'monospace' }}>⌘K</span>
    </button>
  );
}
