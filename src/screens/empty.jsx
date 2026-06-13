// Empty state — the Focus screen before anything has been pinned.

import React from 'react';
import { TOKENS, btnReset } from '../lib/tokens';
import { Leaf, Plus } from '../components/icons';
import { Screen } from '../components/screen';

function EmptyScreen({ app, variant, frame, onNav, onAsk }) {
  const body = variant === 'a' ? (
    <div style={{ padding: '60px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ width: 72, height: 72, borderRadius: 999, background: TOKENS.greenTint, display: 'grid', placeItems: 'center', color: TOKENS.green }}><Leaf size={28}/></div>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: -0.3 }}>Nothing here yet.</h2>
      <div style={{ fontSize: 14, color: TOKENS.sub, lineHeight: 1.6 }}>This is where your focus for today will live. Pin 3–5 tasks from any project — whatever feels right for the day you're having.</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button style={{ ...btnReset, padding: '10px 16px', borderRadius: 999, background: TOKENS.green, color: TOKENS.bg, fontSize: 13, fontWeight: 500 }}>Browse projects</button>
        <button style={{ ...btnReset, padding: '10px 16px', borderRadius: 999, border: `1px solid ${TOKENS.line}`, color: TOKENS.ink, fontSize: 13 }}>Ask Zen to pick</button>
      </div>
    </div>
  ) : (
    <div style={{ padding: '60px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: 10 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: 999, background: TOKENS.tealSoft }}/>)}
      </div>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: -0.3 }}>A quiet page.</h2>
      <div style={{ fontSize: 14, color: TOKENS.sub, lineHeight: 1.6, maxWidth: 440 }}>
        You haven't created any projects in this phase. Start small — one project, two tasks. You can grow from there.
      </div>
      <button style={{ ...btnReset, padding: '10px 18px', borderRadius: 999, background: TOKENS.teal, color: '#fff', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Plus size={12}/>Start a project
      </button>
    </div>
  );
  return (
    <Screen frame={frame} app={app} active="today" onNav={onNav} onAsk={onAsk}
      title="Focus" subtitle="Empty, for now" crumbs={['Focus']}>{body}</Screen>
  );
}

export { EmptyScreen };
