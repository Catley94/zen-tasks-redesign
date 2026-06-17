import React, { useState, useEffect } from 'react';
import { useApp } from '../shared/AppContext.jsx';
import { TOKENS, btnReset } from '../../data/seeds.js';
import { Screen } from '../shared/screen.jsx';
import { SectionLabel, GoalChip } from '../shared/primitives.jsx';
import { Check, Leaf, Flame } from '../shared/icons.jsx';

function CountUp({ value, dur = 700 }) {
  const [n, setN] = useState(value);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return; }
    let raf;
    const start = performance.now();
    const tick = (t) => { const k = Math.min(1, (t - start) / dur); setN(Math.round(value * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(tick); };
    setN(0); raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [value, dur]);
  return <>{n}</>;
}

function ReviewStat({ n, label }) {
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.greenSoft}`, borderRadius: TOKENS.radius, padding: '8px 14px', textAlign: 'center', minWidth: 92 }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: TOKENS.greenDeep, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 11, color: TOKENS.sub, marginTop: 3 }}>{label}</div>
    </div>
  );
}

export default function ReviewScreen() {
  const { app, onNav, frame } = useApp();
  const [mattered, setMattered] = useState('');

  const quiet = app.projects.filter(p => app.statusOf(p.id) === 'quiet');
  const doneTasks = app.tasks.filter(t => t.done);
  const advanced = (() => {
    const m = {};
    doneTasks.forEach(t => { if (t.projectId) m[t.projectId] = (m[t.projectId] || 0) + 1; });
    return Object.keys(m).map(pid => {
      const p = app.projectById ? app.projectById(pid) : app.projects.find(x => x.id === pid);
      const all = app.tasks.filter(t => t.projectId === pid);
      const done = all.filter(t => t.done).length;
      return { p, recent: m[pid], total: all.length, done, progress: all.length ? done / all.length : 0 };
    }).filter(a => a.p).sort((a, b) => b.recent - a.recent || b.progress - a.progress);
  })();

  const goalsTouched = [...new Set(advanced.flatMap(a => a.p.goalIds || []))].map(id => app.goals.find(g => g.id === id)).filter(Boolean);
  const biggest = advanced[0];
  const otherDone = doneTasks.filter(t => !t.projectId);

  return (
    <Screen app={app} active="review" onNav={onNav} frame={frame}
      title="Weekly review" subtitle="Friday afternoon · a small ritual"
      crumbs={['Weekly review']}>
      <div style={{ padding: '22px 30px 40px', display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 780 }}>
        {/* Celebration hero */}
        <div style={{ position: 'relative', overflow: 'hidden', background: TOKENS.greenTint, border: `1px solid ${TOKENS.greenSoft}`, borderRadius: TOKENS.radiusLg, padding: '22px 24px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 11 }}>
              <div style={{ fontSize: 46, fontWeight: 600, color: TOKENS.greenDeep, letterSpacing: -1, lineHeight: 1 }}><CountUp value={doneTasks.length} /></div>
              <div style={{ fontSize: 15, color: TOKENS.green, maxWidth: 132, lineHeight: 1.3 }}>{doneTasks.length === 1 ? 'thing grown this week' : 'things grown this week'}</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <ReviewStat n={advanced.length} label={advanced.length === 1 ? 'project advanced' : 'projects advanced'} />
              <ReviewStat n={goalsTouched.length} label={goalsTouched.length === 1 ? 'goal moved' : 'goals moved'} />
            </div>
          </div>
          {biggest ? (
            <div style={{ position: 'relative', marginTop: 14, fontSize: 13.5, color: TOKENS.inkSoft, lineHeight: 1.55 }}>
              Your biggest leap was <b style={{ color: TOKENS.greenDeep }}>{biggest.p.name}</b> — {biggest.recent} {biggest.recent === 1 ? 'task' : 'tasks'} done, now {Math.round(biggest.progress * 100)}% there.
            </div>
          ) : (
            <div style={{ position: 'relative', marginTop: 14, fontSize: 13.5, color: TOKENS.sub, lineHeight: 1.55 }}>A quiet week is still a week. Complete a task and your progress will bloom here.</div>
          )}
        </div>

        {/* Progress made */}
        {advanced.length > 0 && (
          <div>
            <SectionLabel color={TOKENS.green}>Progress made · toward your projects</SectionLabel>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {advanced.map((a, idx) => (
                <div key={a.p.id} style={{ background: TOKENS.surface, border: `1px solid ${idx === 0 && advanced.length > 1 ? TOKENS.greenSoft : TOKENS.line}`, borderRadius: TOKENS.radius, padding: '13px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: a.p.color, flexShrink: 0 }} />
                    <div style={{ fontSize: 14, fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.p.name}</div>
                    {idx === 0 && advanced.length > 1 && (
                      <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 999, background: TOKENS.greenSoft, color: TOKENS.greenDeep, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Flame size={10} />Biggest leap</span>
                    )}
                    <span style={{ fontSize: 12.5, color: TOKENS.green, fontWeight: 600 }}>+{a.recent}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                    <div style={{ flex: 1, height: 7, background: TOKENS.bg, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${a.progress * 100}%`, height: '100%', background: a.p.color, borderRadius: 999 }} />
                    </div>
                    <span style={{ fontSize: 11.5, color: TOKENS.sub, fontVariantNumeric: 'tabular-nums', minWidth: 92, textAlign: 'right' }}>{a.done}/{a.total} · {Math.round(a.progress * 100)}%</span>
                  </div>
                  {(a.p.goalIds || []).length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(a.p.goalIds || []).map(gid => { const g = app.goals.find(x => x.id === gid); return g ? <GoalChip key={gid} goal={g} primary={app.primaryGoalId === gid} compact /> : null; })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Also completed */}
        {otherDone.length > 0 && (
          <div>
            <SectionLabel>Also completed</SectionLabel>
            <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden', marginTop: 8 }}>
              {otherDone.map(t => {
                const c = t.categoryId ? app.categoryById(t.categoryId) : null;
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: `1px solid ${TOKENS.lineSoft}` }}>
                    <div style={{ width: 16, height: 16, borderRadius: 999, background: TOKENS.green, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Check size={10} stroke={2.5} /></div>
                    <div style={{ flex: 1, fontSize: 13.5 }}>{t.title}</div>
                    {c && <span style={{ fontSize: 11, color: TOKENS.sub, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: c.color }} />{c.name}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quiet projects */}
        {quiet.length > 0 && (
          <div>
            <SectionLabel color={TOKENS.tealDeep}>Quiet · could use your attention</SectionLabel>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quiet.map(p => (
                <div key={p.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: p.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: TOKENS.sub }}>Last touch {p.lastActive}</div>
                  </div>
                  <button onClick={() => { app.setProjectStatus(p.id, 'active'); app.notify({ title: 'Reopened gently', summary: `"${p.name}" is back among your active projects.`, body: '' }); }}
                    style={{ ...btnReset, fontSize: 11.5, padding: '5px 10px', borderRadius: 999, background: TOKENS.tealSoft, color: TOKENS.tealDeep, cursor: 'pointer' }}>Reopen gently</button>
                  <button onClick={() => { app.setProjectStatus(p.id, 'parked'); app.notify({ title: 'Parked for later', summary: `"${p.name}" is resting.`, body: '' }); }}
                    style={{ ...btnReset, fontSize: 11.5, padding: '5px 10px', borderRadius: 999, color: TOKENS.sub, cursor: 'pointer' }}>Park</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What mattered */}
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '16px 18px' }}>
          <SectionLabel color={TOKENS.teal}>One last prompt</SectionLabel>
          <div style={{ fontSize: 16, fontWeight: 500, marginTop: 6, letterSpacing: -0.2 }}>What mattered this week?</div>
          <textarea value={mattered} onChange={e => setMattered(e.target.value)} placeholder="A sentence is enough. Zen won't read it unless you ask."
            style={{ width: '100%', marginTop: 10, minHeight: 64, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radiusSm, padding: 12, fontFamily: TOKENS.fontSans, fontSize: 13.5, lineHeight: 1.6, color: TOKENS.ink, resize: 'vertical', outline: 'none' }} />
        </div>
      </div>
    </Screen>
  );
}
