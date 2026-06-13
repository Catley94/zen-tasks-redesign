// Screens batch 2 — remaining: Ask Zen page, Onboarding, Weekly Review, Settings, Empty, Nudge.
// Each takes (app, variant, frame, onNav, onAsk).

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TOKENS, btnReset, PRIORITY_LABEL } from '../lib/tokens';
import { GOALS, PROJECTS, UPCOMING, ZEN_NUDGES } from '../lib/data';
import { Close, Plus, ChevD, ChevR, Check, Leaf, Edit, MoreV, Arr, Trash, Sparkles, Mic, Send, Flame } from '../components/icons';
import { SectionLabel, ChatBubble, ThinkingDots, GoalChip, DensityToggle } from '../components/primitives';
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

// ====== ONBOARDING ======
function OnboardingScreen({ app, variant, frame, onNav, onAsk }) {
  const [step, setStep] = useState(0);
  const steps = variant === 'a'
    ? [{t:"What are you trying to build?", sub:"One honest sentence.", ph:"Build something I'm proud of", help:"This becomes your North Star — visible everywhere, changeable anytime."},
       {t:"Why does it matter to you?", sub:"A note from you, to you.", ph:"This feels different — it's for me, not a client.", help:"Zen will remind you of this when things get hard."},
       {t:"What are the rough phases?", sub:"3 is plenty.", ph:"Ship Zen Tasks MVP\nRecord the EP\nWrite the kids book", help:"You can rearrange these later. Only one is active at a time."}]
    : [{t:"Let's begin.", sub:"This takes about 3 minutes.", ph:"", help:""},
       {t:"A goal worth pursuing", sub:"Something you'd be proud to finish this year.", ph:"Build something I'm proud of", help:""},
       {t:"Break it into phases", sub:"One sequenced step at a time.", ph:"Ship Zen Tasks MVP\nRecord the EP\nWrite the kids book", help:""},
       {t:"Ready.", sub:"Zen will check in quietly. You can always ask for more.", ph:"", help:""}];
  const s = steps[step];

  const body = (
    <div style={{ padding: '30px 30px 40px', maxWidth: 600, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 26 }}>
        {steps.map((_,i)=><div key={i} style={{ flex:1, height: 3, borderRadius: 999, background: i<=step ? TOKENS.green : TOKENS.lineSoft }}/>)}
      </div>
      {variant === 'a' && <div style={{ fontSize: 11, color: TOKENS.teal, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>Step {step+1} of {steps.length}</div>}
      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 500, letterSpacing: -0.4 }}>{s.t}</h2>
      {s.sub && <div style={{ fontSize: 14, color: TOKENS.sub, marginTop: 6 }}>{s.sub}</div>}
      {s.ph && (
        <textarea defaultValue={s.ph} style={{ width: '100%', marginTop: 20, minHeight: 120, background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: 14, fontFamily: TOKENS.fontSans, fontSize: 14, lineHeight: 1.5, color: TOKENS.ink, resize: 'vertical', outline: 'none' }}/>
      )}
      {s.help && <div style={{ fontSize: 12.5, color: TOKENS.sub, marginTop: 10, padding: '10px 14px', background: TOKENS.tealTint, borderRadius: TOKENS.radiusSm, display: 'flex', gap: 8, alignItems: 'flex-start' }}><Sparkles size={12} style={{ color: TOKENS.teal, marginTop: 2 }}/>{s.help}</div>}
      <div style={{ display: 'flex', gap: 10, marginTop: 28, alignItems: 'center' }}>
        {step > 0 && <button onClick={()=>setStep(step-1)} style={{ ...btnReset, padding: '10px 16px', fontSize: 13, color: TOKENS.sub }}>Back</button>}
        <div style={{ flex:1 }}/>
        <button onClick={()=>setStep(Math.min(steps.length-1, step+1))} style={{ ...btnReset, padding: '10px 18px', borderRadius: 999, background: TOKENS.green, color: TOKENS.bg, fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {step === steps.length-1 ? 'Begin' : 'Next'}<Arr size={13}/>
        </button>
      </div>
    </div>
  );

  // no sidebar during onboarding
  return (
    <div style={{ width: frame==='mobile'?360:1200, height: 760, background: TOKENS.bg, color: TOKENS.ink, fontFamily: TOKENS.fontSans, fontSize: 14, position: 'relative', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: TOKENS.green, color: TOKENS.bg, display: 'grid', placeItems: 'center' }}><Leaf size={14}/></div>
        <div style={{ fontWeight: 600 }}>Zen</div>
        <div style={{ flex: 1 }}/>
        <button style={{ ...btnReset, fontSize: 12, color: TOKENS.sub }}>Skip</button>
      </header>
      {body}
    </div>
  );
}

// Count-up number for the celebration hero (respects reduced-motion).
function CountUp({ value, dur = 700 }) {
  const [n, setN] = useState(value);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return; }
    let raf; const start = performance.now();
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
// One-shot leaf bloom behind the celebration hero.
if (!document.getElementById('zen-celebrate-styles')) {
  const s = document.createElement('style');
  s.id = 'zen-celebrate-styles';
  s.textContent = `
    .zen-mote { position: absolute; bottom: 12px; opacity: 0; animation: zenMote 2.6s ease-out forwards; }
    @keyframes zenMote { 0% { transform: translateY(12px) rotate(0deg); opacity: 0; } 18% { opacity: 0.5; } 100% { transform: translateY(-72px) rotate(22deg); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .zen-mote { display: none; } }
  `;
  document.head.appendChild(s);
}

// ====== WEEKLY REVIEW ======
function ReviewScreen({ app, variant, frame, onNav, onAsk }) {
  const quiet = app.projects.filter(p => app.statusOf(p.id) === 'quiet');
  const completedThisWeek = app.tasks.filter(t=>t.done).slice(0, 5);
  const [mattered, setMattered] = useState("");
  // ——— celebration data: what actually advanced this week ———
  const doneTasks = app.tasks.filter(t => t.done);
  const advanced = (() => {
    const m = {};
    doneTasks.forEach(t => { if (t.projectId) m[t.projectId] = (m[t.projectId] || 0) + 1; });
    return Object.keys(m).map(pid => {
      const p = (app.projectById ? app.projectById(pid) : PROJECTS.find(x => x.id === pid));
      const all = app.tasks.filter(t => t.projectId === pid);
      const done = all.filter(t => t.done).length;
      return { p, recent: m[pid], total: all.length, done, progress: all.length ? done / all.length : 0 };
    }).filter(a => a.p).sort((a, b) => b.recent - a.recent || b.progress - a.progress);
  })();
  const goalsTouched = [...new Set(advanced.flatMap(a => a.p.goalIds || []))].map(id => GOALS.find(g => g.id === id)).filter(Boolean);
  const biggest = advanced[0];
  const otherDone = doneTasks.filter(t => !t.projectId);

  const body = variant === 'a' ? (
    <div style={{ padding: '22px 30px 40px', display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 780 }}>
      {/* Celebration hero */}
      <div style={{ position: 'relative', overflow: 'hidden', background: TOKENS.greenTint, border: `1px solid ${TOKENS.greenSoft}`, borderRadius: TOKENS.radiusLg, padding: '22px 24px' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[0,1,2,3,4,5].map(i => (
            <span key={i} className="zen-mote" style={{ left: `${8 + i * 15}%`, animationDelay: `${i * 0.18}s`, color: TOKENS.green }}><Leaf size={12 + (i % 3) * 4}/></span>
          ))}
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 11 }}>
            <div style={{ fontSize: 46, fontWeight: 600, color: TOKENS.greenDeep, letterSpacing: -1, lineHeight: 1 }}><CountUp value={doneTasks.length}/></div>
            <div style={{ fontSize: 15, color: TOKENS.green, maxWidth: 132, lineHeight: 1.3 }}>{doneTasks.length === 1 ? 'thing grown this week' : 'things grown this week'}</div>
          </div>
          <div style={{ flex: 1 }}/>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <ReviewStat n={advanced.length} label={advanced.length === 1 ? 'project advanced' : 'projects advanced'}/>
            <ReviewStat n={goalsTouched.length} label={goalsTouched.length === 1 ? 'goal moved' : 'goals moved'}/>
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

      {/* Progress made — toward your projects */}
      {advanced.length > 0 && (
        <div>
          <SectionLabel color={TOKENS.green}>Progress made · toward your projects</SectionLabel>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {advanced.map((a, idx) => (
              <div key={a.p.id} style={{ background: TOKENS.surface, border: `1px solid ${idx === 0 && advanced.length > 1 ? TOKENS.greenSoft : TOKENS.line}`, borderRadius: TOKENS.radius, padding: '13px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: a.p.color, flexShrink: 0 }}/>
                  <div style={{ fontSize: 14, fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.p.name}</div>
                  {idx === 0 && advanced.length > 1 && (
                    <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 999, background: TOKENS.greenSoft, color: TOKENS.greenDeep, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Flame size={10}/>Biggest leap</span>
                  )}
                  <span style={{ fontSize: 12.5, color: TOKENS.green, fontWeight: 600 }}>+{a.recent}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <div style={{ flex: 1, height: 7, background: TOKENS.bg, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${a.progress * 100}%`, height: '100%', background: a.p.color, borderRadius: 999 }}/>
                  </div>
                  <span style={{ fontSize: 11.5, color: TOKENS.sub, fontVariantNumeric: 'tabular-nums', minWidth: 92, textAlign: 'right' }}>{a.done}/{a.total} · {Math.round(a.progress * 100)}%</span>
                </div>
                {(a.p.goalIds || []).length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(a.p.goalIds || []).map(gid => { const g = GOALS.find(x => x.id === gid); return g ? <GoalChip key={gid} goal={g} primary={app.primaryGoalId === gid} compact/> : null; })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Also completed (standalone / everyday) */}
      {otherDone.length > 0 && (
        <div>
          <SectionLabel>Also completed</SectionLabel>
          <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden', marginTop: 8 }}>
            {otherDone.map(t => {
              const c = t.categoryId ? app.categoryById(t.categoryId) : null;
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: `1px solid ${TOKENS.lineSoft}` }}>
                  <div style={{ width: 16, height: 16, borderRadius: 999, background: TOKENS.green, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Check size={10} stroke={2.5}/></div>
                  <div style={{ flex: 1, fontSize: 13.5 }}>{t.title}</div>
                  {c && <span style={{ fontSize: 11, color: TOKENS.sub, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: c.color }}/>{c.name}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quiet */}
      {quiet.length > 0 && (
        <div>
          <SectionLabel color={TOKENS.tealDeep}>Quiet · could use your attention</SectionLabel>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quiet.map(p => (
              <div key={p.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: p.color }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: TOKENS.sub }}>Last touch {p.lastActive}</div>
                </div>
                <button onClick={()=>{ app.setProjectStatus(p.id, 'active'); app.notify({ title: 'Reopened gently', summary: `"${p.name}" is back among your active projects.`, body: `"${p.name}" is active again — no pressure, just back in view. Open it whenever you're ready.` }); }}
                  style={{ ...btnReset, fontSize: 11.5, padding: '5px 10px', borderRadius: 999, background: TOKENS.tealSoft, color: TOKENS.tealDeep, cursor: 'pointer' }}>Reopen gently</button>
                <button onClick={()=>{ app.setProjectStatus(p.id, 'parked'); app.notify({ title: 'Parked for later', summary: `"${p.name}" is resting — I won't nudge you about it.`, body: `"${p.name}" is parked. It'll wait quietly; reopen it from the project list whenever you like.` }); }}
                  style={{ ...btnReset, fontSize: 11.5, padding: '5px 10px', borderRadius: 999, color: TOKENS.sub, cursor: 'pointer' }}>Park</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming — only meaningful in a space with goals */}
      {app.goals.length > 0 && (
      <div>
        <SectionLabel>Upcoming · next few days</SectionLabel>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {UPCOMING.map(u => {
            const g = GOALS.find(x => x.id === u.goalId);
            return (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius }}>
                <div style={{ width: 4, height: 28, borderRadius: 2, background: g?.color || TOKENS.teal }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{u.text}</div>
                  <div style={{ fontSize: 11, color: TOKENS.sub, marginTop: 2 }}>{g?.name}</div>
                </div>
                <span style={{ fontSize: 11.5, color: TOKENS.sub, fontWeight: 500 }}>{u.when}</span>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* What mattered */}
      <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '16px 18px' }}>
        <SectionLabel color={TOKENS.teal}>One last prompt</SectionLabel>
        <div style={{ fontSize: 16, fontWeight: 500, marginTop: 6, letterSpacing: -0.2 }}>What mattered this week?</div>
        <textarea value={mattered} onChange={e=>setMattered(e.target.value)} placeholder="A sentence is enough. Zen won't read it unless you ask."
          style={{ width: '100%', marginTop: 10, minHeight: 64, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radiusSm, padding: 12, fontFamily: TOKENS.fontSans, fontSize: 13.5, lineHeight: 1.6, color: TOKENS.ink, resize: 'vertical', outline: 'none' }}/>
      </div>
    </div>
  ) : (
    // B — single reflective column: Zen's letter, celebrate, what-mattered
    <div style={{ padding: '22px 30px 40px', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: TOKENS.surfaceAlt, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '22px 24px' }}>
        <SectionLabel color={TOKENS.teal}>A letter from Zen</SectionLabel>
        <div style={{ fontFamily: '"EB Garamond", serif', fontSize: 17, lineHeight: 1.7, color: TOKENS.ink, marginTop: 10, fontStyle: 'italic' }}>
          Sam — you finished {completedThisWeek.length} small things this week, which is more than it feels like. Stripe went in quietly on Monday. The landing copy is still finding itself; that's okay, it usually takes a few passes. Quiet Hours hasn't been opened in two weeks. You don't owe it anything this weekend, but I'll remember it for you.
        </div>
      </div>
      <div>
        <SectionLabel color={TOKENS.green}>Celebrate</SectionLabel>
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden', marginTop: 8 }}>
          {completedThisWeek.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: `1px solid ${TOKENS.lineSoft}` }}>
              <div style={{ width: 14, height: 14, borderRadius: 999, background: TOKENS.green, color: '#fff', display: 'grid', placeItems: 'center' }}><Check size={9} stroke={2.5}/></div>
              <div style={{ flex: 1, fontSize: 13 }}>{t.title}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '18px 20px' }}>
        <div style={{ fontFamily: '"EB Garamond", serif', fontSize: 20, fontWeight: 500, letterSpacing: -0.3 }}>What mattered this week?</div>
        <textarea value={mattered} onChange={e=>setMattered(e.target.value)} placeholder="Write as much or as little as you like…"
          style={{ width: '100%', marginTop: 10, minHeight: 100, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radiusSm, padding: 14, fontFamily: '"EB Garamond", serif', fontSize: 15, lineHeight: 1.7, color: TOKENS.ink, resize: 'vertical', outline: 'none' }}/>
      </div>
    </div>
  );
  return (
    <Screen frame={frame} app={app} active="review" onNav={onNav} onAsk={onAsk}
      title="Weekly review" subtitle="Friday afternoon · a small ritual" crumbs={['Weekly review']}>{body}</Screen>
  );
}

// ====== SETTINGS ======
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

// ====== EMPTY STATE ======
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

// ====== NUDGE / proactive chat notification ======
function NudgeScreen({ app, variant, frame, onNav, onAsk }) {
  // Full-screen Zen chat appearing as a message from the AI about a stale project
  const proj = PROJECTS.find(p => p.id === 'p4');
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

// ====== AGENDA SCREEN (stub — actual implementation lives in calendar.jsx) ======
export function AgendaScreen({ app, variant, frame, onNav, onAsk }) {
  return (
    <Screen frame={frame} app={app} active="agenda" onNav={onNav} onAsk={onAsk}
      title="Today" crumbs={['Today']}>
      <div style={{ padding: 30, color: TOKENS.sub }}>Loading agenda…</div>
    </Screen>
  );
}

export { ZenScreen, OnboardingScreen, ReviewScreen, SettingsScreen, EmptyScreen, NudgeScreen };
