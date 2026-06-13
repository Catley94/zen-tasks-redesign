// Focus (internal id 'today') — the ambient morning screen: your pinned focus
// list, a Zen morning note, and an "add to focus" picker.

import React, { useState } from 'react';
import { TOKENS, btnReset } from '../lib/tokens';
import { GOAL } from '../lib/data';
import { Plus, Sparkles, Moon } from '../components/icons';
import { Screen } from '../components/screen';
import { TaskRow, SectionLabel, AddToFocusModal } from '../components/primitives';

function TodayScreen({ app, variant, frame, onNav, onAsk }) {
  const focusTasks = app.tasks.filter(t => app.focusIds.has(t.id));
  const done = focusTasks.filter(t=>t.done).length;
  const ph = GOAL.phases[0];
  const ring = Math.round((done / Math.max(focusTasks.length,1)) * 100);
  const [picker, setPicker] = useState(false);
  const [highlightIds, setHighlightIds] = useState(null);
  const calm = app.density === 'calm';

  // The tasks the morning note refers to — writing tasks on the focus list.
  const relevantIds = focusTasks.filter(t => (t.tags||[]).includes('writing')).map(t => t.id);
  const showMe = () => {
    setHighlightIds(new Set(relevantIds));
    setTimeout(() => setHighlightIds(null), 1700);
  };

  const addBtn = (
    <button onClick={()=>setPicker(true)} style={{ ...btnReset, padding: '7px 13px', borderRadius: 999, background: TOKENS.green, color: '#fff', fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Plus size={12}/>Add to Focus
    </button>
  );

  if (variant === 'a') {
    // Variation A — ambient morning, one-column focus list
    return (
      <Screen frame={frame} app={app} active="today" onNav={onNav} onAsk={onAsk}
        title="Focus" subtitle={calm ? null : `${focusTasks.length - done} on your focus list · ${ph.name}`}
        crumbs={['Phase 1', 'Focus']} headerRight={addBtn}>
        <div style={{ padding: '24px 30px 40px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
          {!calm && (
            <button onClick={showMe} title="Show me which tasks"
              style={{ ...btnReset, width: '100%', textAlign: 'left', background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, border: `4px solid ${TOKENS.greenSoft}`, position: 'relative', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <div style={{ position:'absolute', inset: -4, borderRadius: 999, background: `conic-gradient(${TOKENS.green} ${ring}%, transparent ${ring}%)`, mask: 'radial-gradient(circle, transparent 55%, #000 56%)', WebkitMask: 'radial-gradient(circle, transparent 55%, #000 56%)' }}/>
                <div style={{ fontSize: 14, fontWeight: 600, color: TOKENS.green }}>{done}/{focusTasks.length}</div>
              </div>
              <div style={{ flex: 1 }}>
                <SectionLabel color={TOKENS.teal}>Morning, Sam</SectionLabel>
                <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 4 }}>
                  You pinned {focusTasks.length} things last night. The two writing tasks are a good pair — same headspace.
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, fontWeight: 500, color: TOKENS.teal }}>
                  <Sparkles size={12}/>Show me
                </span>
              </div>
            </button>
          )}
          <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden' }}>
            {!calm && (
              <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <SectionLabel>On your focus list</SectionLabel>
                <div style={{ flex: 1 }}/>
                <button onClick={()=>setPicker(true)} style={{ ...btnReset, fontSize: 11.5, color: TOKENS.teal, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Plus size={11}/>Add to Focus
                </button>
              </div>
            )}
            {focusTasks.map(t => <TaskRow key={(highlightIds?.has(t.id)?'hl-':'')+t.id} task={t} app={app} showProject showGoal mobile={frame==='mobile'} highlighted={highlightIds?.has(t.id)}/>)}
            {focusTasks.length === 0 && <EmptyState icon={<Moon size={20}/>} title="No focus set" body="Pin 3–5 tasks when you're ready."/>}
          </div>
        </div>
        <AddToFocusModal open={picker} onClose={()=>setPicker(false)} app={app}/>
      </Screen>
    );
  }
  // Variation B — split columns: Focus + Proactive Zen thread
  return (
    <Screen frame={frame} app={app} active="today" onNav={onNav} onAsk={onAsk}
      title="Focus" subtitle={calm ? null : `${new Date().toDateString().slice(0,10)} · Phase 1`}
      crumbs={['Focus']} headerRight={addBtn}>
      <div style={{ padding: '22px 30px 40px', display: 'grid', gridTemplateColumns: (frame==='mobile' || calm) ? '1fr' : '1.3fr 1fr', gap: 18, maxWidth: calm ? 760 : 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${TOKENS.lineSoft}`, display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>On your focus list</div>
              {!calm && <div style={{ fontSize: 11, color: TOKENS.sub }}>{done} of {focusTasks.length} done</div>}
              <div style={{ flex: 1 }}/>
              <button onClick={()=>setPicker(true)} style={{ ...btnReset, fontSize: 11.5, color: TOKENS.teal, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Plus size={11}/>Add</button>
              {!calm && (
                <div style={{ height: 4, width: 80, background: TOKENS.bg, borderRadius: 999, overflow: 'hidden', marginLeft: 6 }}>
                  <div style={{ width: `${ring}%`, height: '100%', background: TOKENS.green }}/>
                </div>
              )}
            </div>
            {focusTasks.map(t => <TaskRow key={t.id} task={t} app={app} showProject showGoal mobile={frame==='mobile'}/>)}
          </div>
          {!calm && (
            <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '14px 16px' }}>
              <SectionLabel>Rest of today, if there's time</SectionLabel>
              <div style={{ marginTop: 6 }}>
                {app.tasks.filter(t => !app.focusIds.has(t.id) && !t.done && t.due === 'Today').map(t => <TaskRow key={t.id} task={t} app={app} showProject showGoal compact mobile={frame==='mobile'}/>)}
              </div>
            </div>
          )}
        </div>
        {!calm && (
          <aside style={{ background: TOKENS.greenTint, border: `1px solid ${TOKENS.greenSoft}`, borderRadius: TOKENS.radius, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 999, background: TOKENS.teal, color: '#fff', display: 'grid', placeItems: 'center' }}><Sparkles size={11}/></div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>Zen · this morning</div>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: TOKENS.ink }}>
              Two writing tasks pinned — try them back to back after coffee. Save the logo sketches for when you're tired of words.
            </div>
            <div style={{ height: 1, background: TOKENS.greenSoft }}/>
            <SectionLabel color={TOKENS.green}>Gently noticing</SectionLabel>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: TOKENS.inkSoft }}>
              Quiet Hours has been paused for 14 days.
              <button style={{ ...btnReset, color: TOKENS.teal, marginLeft: 6, textDecoration: 'underline' }}>Have a look</button>
            </div>
            <button onClick={onAsk} style={{ ...btnReset, marginTop: 'auto', padding: '9px 12px', borderRadius: 999, background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, fontSize: 12, color: TOKENS.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={12} style={{ color: TOKENS.teal }}/> Ask Zen something…
              <span style={{ flex:1 }}/>
              <span style={{ fontSize: 10, color: TOKENS.sub, fontFamily: TOKENS.fontMono }}>⌘K</span>
            </button>
          </aside>
        )}
      </div>
      <AddToFocusModal open={picker} onClose={()=>setPicker(false)} app={app}/>
    </Screen>
  );
}

function EmptyState({ icon, title, body }) {
  return (
    <div style={{ padding: '26px 20px', textAlign: 'center', color: TOKENS.sub }}>
      <div style={{ width: 40, height: 40, borderRadius: 999, background: TOKENS.bg, display: 'inline-grid', placeItems: 'center', color: TOKENS.sub, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, color: TOKENS.ink, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 260, margin: '0 auto' }}>{body}</div>
    </div>
  );
}

export { TodayScreen, EmptyState };
