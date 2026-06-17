import React, { useState } from 'react';
import { useApp } from '../shared/AppContext.jsx';
import { TOKENS, btnReset } from '../../data/seeds.js';
import { Screen } from '../shared/screen.jsx';
import { TaskRow, SectionLabel, AddToFocusModal } from '../shared/primitives.jsx';
import { Plus, Sparkles, Moon } from '../shared/icons.jsx';

function EmptyState({ icon, title, body }) {
  return (
    <div style={{ padding: '26px 20px', textAlign: 'center', color: TOKENS.sub }}>
      <div style={{ width: 40, height: 40, borderRadius: 999, background: TOKENS.bg, display: 'inline-grid', placeItems: 'center', color: TOKENS.sub, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, color: TOKENS.ink, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 260, margin: '0 auto' }}>{body}</div>
    </div>
  );
}

export default function TodayScreen() {
  const { app, onNav, frame } = useApp();
  const focusTasks = app.tasks.filter(t => app.focusIds.has(t.id));
  const done = focusTasks.filter(t => t.done).length;
  const ring = Math.round((done / Math.max(focusTasks.length, 1)) * 100);
  const [picker, setPicker] = useState(false);
  const [highlightIds, setHighlightIds] = useState(null);
  const calm = app.density === 'calm';

  const relevantIds = focusTasks.filter(t => (t.tags || []).includes('writing')).map(t => t.id);
  const showMe = () => {
    setHighlightIds(new Set(relevantIds));
    setTimeout(() => setHighlightIds(null), 1700);
  };

  const addBtn = (
    <button onClick={() => setPicker(true)} style={{ ...btnReset, padding: '7px 13px', borderRadius: 999, background: TOKENS.green, color: '#fff', fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Plus size={12} />Add to Focus
    </button>
  );

  return (
    <Screen app={app} active="today" onNav={onNav} frame={frame}
      title="Focus"
      subtitle={calm ? null : `${focusTasks.length - done} on your focus list`}
      crumbs={['Focus']} headerRight={addBtn}>
      <div style={{ padding: '24px 30px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
        {!calm && (
          <button onClick={showMe} title="Show me which tasks"
            style={{ ...btnReset, width: '100%', textAlign: 'left', background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, border: `4px solid ${TOKENS.greenSoft}`, position: 'relative', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: -4, borderRadius: 999, background: `conic-gradient(${TOKENS.green} ${ring}%, transparent ${ring}%)`, mask: 'radial-gradient(circle, transparent 55%, #000 56%)', WebkitMask: 'radial-gradient(circle, transparent 55%, #000 56%)' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: TOKENS.green }}>{done}/{focusTasks.length}</div>
            </div>
            <div style={{ flex: 1 }}>
              <SectionLabel color={TOKENS.teal}>Morning</SectionLabel>
              <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 4 }}>
                You pinned {focusTasks.length} things. Focus on what matters most.
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, fontWeight: 500, color: TOKENS.teal }}>
                <Sparkles size={12} />Show me
              </span>
            </div>
          </button>
        )}
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden' }}>
          {!calm && (
            <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <SectionLabel>On your focus list</SectionLabel>
              <div style={{ flex: 1 }} />
              <button onClick={() => setPicker(true)} style={{ ...btnReset, fontSize: 11.5, color: TOKENS.teal, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Plus size={11} />Add to Focus
              </button>
            </div>
          )}
          {focusTasks.map(t => (
            <TaskRow key={(highlightIds?.has(t.id) ? 'hl-' : '') + t.id} task={t} app={app} showProject showGoal mobile={frame === 'mobile'} highlighted={highlightIds?.has(t.id)} />
          ))}
          {focusTasks.length === 0 && <EmptyState icon={<Moon size={20} />} title="No focus set" body="Pin 3–5 tasks when you're ready." />}
        </div>
        {!calm && (
          <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '14px 16px' }}>
            <SectionLabel>Rest of today, if there's time</SectionLabel>
            <div style={{ marginTop: 6 }}>
              {app.tasks.filter(t => !app.focusIds.has(t.id) && !t.done && t.due === 'Today').map(t => (
                <TaskRow key={t.id} task={t} app={app} showProject showGoal compact mobile={frame === 'mobile'} />
              ))}
            </div>
          </div>
        )}
      </div>
      <AddToFocusModal open={picker} onClose={() => setPicker(false)} app={app} />
    </Screen>
  );
}
