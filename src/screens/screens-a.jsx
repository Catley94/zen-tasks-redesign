// Screens batch 1 — Today, Goal, Project detail, Task detail.
// Each screen gets two variations (variant 'a'/'b'). Frame 'desktop' or 'mobile'.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TOKENS, btnReset, PRIORITY_LABEL, PRIORITY_COLOR } from '../lib/tokens';
import { GOALS, GOAL, PROJECTS, CATEGORIES, PROJECT_SECTIONS } from '../lib/data';
import { Close, Plus, ChevD, ChevR, Check, Target, Folder, Leaf, Edit, MoreV, Arr, Trash, Sparkles, Moon } from '../components/icons';
import { Screen } from '../components/screen';
import { TaskRow, SectionLabel, QuietBadge, GoalChip, AddToFocusModal } from '../components/primitives';

// ====== FOCUS (internal id 'today') ======
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

// Edit a goal's name, description and colour.
function GoalEditorModal({ goal, app, onClose }) {
  const [name, setName] = useState(goal.name);
  const [over, setOver] = useState(goal.overarching || '');
  const [why, setWhy] = useState(goal.enthusiasm || '');
  const [color, setColor] = useState(goal.color);
  const GOAL_COLORS = ['#3f6e3a', '#2a8a8a', '#8a6a3a', '#7a4f8a', '#a06a3a', '#2f7a8a', '#9a4a4a'];
  const canSave = name.trim().length > 0;
  const save = () => { if (!canSave) return; app.updateGoal(goal.id, { name: name.trim(), overarching: over.trim(), enthusiasm: why.trim(), color }); onClose(); };
  const field = (label, value, set, multi, ph) => (
    <div>
      <SectionLabel>{label}</SectionLabel>
      {multi ? (
        <textarea value={value} onChange={e=>set(e.target.value)} rows={2} placeholder={ph}
          style={{ width: '100%', marginTop: 8, padding: '10px 12px', borderRadius: TOKENS.radius, border: `1px solid ${TOKENS.line}`, background: TOKENS.bg, fontSize: 13.5, fontFamily: 'inherit', color: TOKENS.ink, outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5 }}/>
      ) : (
        <input value={value} onChange={e=>set(e.target.value)} onKeyDown={e=>{ if (e.key==='Enter') save(); }} placeholder={ph}
          style={{ width: '100%', marginTop: 8, padding: '10px 12px', borderRadius: TOKENS.radius, border: `1px solid ${TOKENS.line}`, background: TOKENS.bg, fontSize: 14, fontFamily: 'inherit', color: TOKENS.ink, outline: 'none', boxSizing: 'border-box' }}/>
      )}
    </div>
  );
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.32)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 90, padding: 20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 'min(460px, 100%)', maxHeight: '100%', overflow: 'auto', background: TOKENS.surface, borderRadius: TOKENS.radiusLg, border: `1px solid ${TOKENS.line}`, boxShadow: '0 40px 90px rgba(20,30,20,0.22)', fontFamily: TOKENS.fontSans, color: TOKENS.ink }}>
        <div style={{ padding: '14px 14px 14px 18px', borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Target size={14}/></span>
          <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>Edit goal</div>
          <button onClick={onClose} aria-label="Close" style={{ ...btnReset, color: TOKENS.sub, width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}><Close size={13}/></button>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {field('Name', name, setName, false, 'e.g. Move somewhere quieter')}
          {field('What does done look like?', over, setOver, true, 'The overarching outcome — one sentence.')}
          {field('Why it matters — your note to self', why, setWhy, true, 'Written for the future you who forgets.')}
          <div>
            <SectionLabel>Colour</SectionLabel>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 10 }}>
              {GOAL_COLORS.map(c => (
                <button key={c} onClick={()=>setColor(c)} aria-label={'Colour '+c}
                  style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, background: c, cursor: 'pointer', boxShadow: color === c ? `0 0 0 2px ${TOKENS.surface}, 0 0 0 4px ${c}` : 'none' }}/>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 18px', borderTop: `1px solid ${TOKENS.line}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ ...btnReset, padding: '8px 16px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 12.5 }}>Cancel</button>
          <button onClick={save} disabled={!canSave} style={{ ...btnReset, padding: '8px 18px', borderRadius: 999, background: canSave ? TOKENS.green : TOKENS.greenSoft, color: canSave ? '#fff' : TOKENS.sub, fontSize: 12.5, fontWeight: 500, cursor: canSave ? 'pointer' : 'default' }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

// ====== GOAL ======
function GoalScreen({ app, variant, frame, onNav, onAsk, goalId = 'g1', initialPhase }) {
  const noGoals = app.goals.length === 0;
  const goal = app.goalById(goalId) || app.goals[0] || GOALS[0];
  const isPrimary = app.primaryGoalId === goal.id;
  const validPhase = (pid) => goal.phases.some(p => p.id === pid) ? pid : null;
  const [phase, setPhase] = useState(validPhase(initialPhase) || goal.phases[0]?.id);
  useEffect(() => { setPhase(validPhase(initialPhase) || goal.phases[0]?.id); }, [goal.id, initialPhase]);
  const ph = goal.phases.find(p=>p.id===phase) || goal.phases[0];
  const goalProjects = app.projectsForGoal(goal.id);
  const phaseIds = goal.phases.map(p=>p.id);
  const projects = goalProjects.filter(p => app.phaseForProjectInGoal(p.id, goal.id) === ph.id);
  const unphased = goalProjects.filter(p => !phaseIds.includes(app.phaseForProjectInGoal(p.id, goal.id)));
  const [linkOpen, setLinkOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  if (noGoals) {
    return (
      <Screen frame={frame} app={app} active="goal" onNav={onNav} onAsk={onAsk} title="Goals" subtitle={`${app.activeProfile.name} · no goals yet`} crumbs={['Goals']}>
        <div style={{ padding: '60px 30px', display: 'grid', placeItems: 'center' }}>
          <div style={{ maxWidth: 380, textAlign: 'center' }}>
            <div style={{ width: 46, height: 46, borderRadius: 999, background: TOKENS.greenTint, color: TOKENS.green, display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}><Target size={22}/></div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>No goals in {app.activeProfile.name} yet</div>
            <div style={{ fontSize: 13, color: TOKENS.sub, lineHeight: 1.6 }}>Goals are the big things this space is moving toward. This profile is a clean slate — add projects, categories and tasks from the sidebar, and bigger goals can gather them later.</div>
          </div>
        </div>
      </Screen>
    );
  }
  const calm = app.density === 'calm';

  const headerRight = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <button onClick={()=>setEditOpen(true)} title="Edit goal" style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', color: TOKENS.sub, border: `1px solid ${TOKENS.line}`, background: TOKENS.bg }}><Edit size={13}/></button>
    <button onClick={()=>!isPrimary && app.setPrimaryGoalId(goal.id)}
      disabled={isPrimary}
      style={{ ...btnReset, padding: '6px 12px', borderRadius: 999, fontSize: 11.5,
        background: isPrimary ? TOKENS.greenSoft : 'transparent', color: isPrimary ? TOKENS.green : TOKENS.sub,
        border: `1px solid ${isPrimary ? TOKENS.greenSoft : TOKENS.line}`,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        cursor: isPrimary ? 'default' : 'pointer' }}>
      <span style={{ color: TOKENS.green, fontWeight: 700 }}>★</span>
      {isPrimary ? 'Primary goal' : 'Make primary'}
    </button>
    </div>
  );

  if (variant === 'a') {
    return (
      <Screen frame={frame} app={app} active={'goal:'+goal.id} onNav={onNav} onAsk={onAsk}
        title={goal.name} subtitle={goal.overarching} crumbs={['Goals', isPrimary ? 'Primary' : 'Other']}
        headerRight={headerRight}>
        <div style={{ padding: '22px 30px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ background: TOKENS.surfaceAlt, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '14px 18px' }}>
            <SectionLabel color={TOKENS.teal}>Why this matters — your note, {goal.enthusiasmWhen}</SectionLabel>
            <div style={{ fontSize: 14, lineHeight: 1.55, fontStyle: 'italic', marginTop: 6 }}>"{goal.enthusiasm}"</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SectionLabel>Phases</SectionLabel>
            <div style={{ flex: 1, height: 1, background: TOKENS.lineSoft }}/>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {goal.phases.map(p => {
              const count = goalProjects.filter(x => app.phaseForProjectInGoal(x.id, goal.id) === p.id).length;
              return (
                <button key={p.id} onClick={()=>setPhase(p.id)} style={{ ...btnReset, padding: '6px 12px', borderRadius: 999,
                  background: phase===p.id ? goal.color : TOKENS.surface, color: phase===p.id ? '#fff' : TOKENS.sub,
                  border: `1px solid ${phase===p.id ? goal.color : TOKENS.line}`, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {phase===p.id && '● '}Phase {p.order} · {p.name}
                  <span style={{ fontSize: 10.5, opacity: 0.8, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SectionLabel>Projects in {ph.name}</SectionLabel>
            <div style={{ flex: 1, height: 1, background: TOKENS.lineSoft }}/>
            <button onClick={()=>setLinkOpen(true)} style={{ ...btnReset, padding: '5px 10px', fontSize: 11.5, color: TOKENS.teal, border: `1px solid ${TOKENS.tealSoft}`, borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Plus size={11}/> Link projects
            </button>
          </div>
          {projects.length === 0 ? (
            <div style={{ padding: '14px 18px', background: TOKENS.surface, border: `1px dashed ${TOKENS.line}`, borderRadius: TOKENS.radius, color: TOKENS.sub, fontSize: 13 }}>
              No projects in this phase yet.
            </div>
          ) : projects.map(proj => <ProjectRow key={proj.id} proj={proj} app={app} onNav={onNav} goal={goal} mobile={frame === 'mobile'}/>)}

          {unphased.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <SectionLabel color={TOKENS.warn}>Linked here, not yet in a phase</SectionLabel>
                <div style={{ flex: 1, height: 1, background: TOKENS.lineSoft }}/>
                <span style={{ fontSize: 11, color: TOKENS.sub }}>{unphased.length}</span>
              </div>
              {unphased.map(proj => <ProjectRow key={proj.id} proj={proj} app={app} onNav={onNav} goal={goal} needsPhase mobile={frame === 'mobile'}/>)}
            </>
          )}
          {ph.status === 'parked' && (
            <div style={{ padding: '14px 18px', background: TOKENS.surface, border: `1px dashed ${TOKENS.line}`, borderRadius: TOKENS.radius, color: TOKENS.sub, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Moon size={14}/> Parked for later. You'll get to it when Phase 1 ships.
            </div>
          )}

          {!calm && (
            <div style={{ marginTop: 8, background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '16px 18px' }}>
              <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 999, background: TOKENS.tealSoft, color: TOKENS.teal, display: 'grid', placeItems: 'center' }}><Sparkles size={11}/></div>
                <SectionLabel color={TOKENS.teal}>Reflection from Zen</SectionLabel>
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 10, color: TOKENS.inkSoft }}>
                {isPrimary
                  ? "You've been steady on this one — nice to see. The next honest thing is getting real users in front of Zen Tasks; the rest is polish."
                  : "This one's been quiet for a while. Even one small move — an hour on the deposit, a weekend booked — would bring it back to life."}
              </div>
            </div>
          )}
        </div>
        <LinkProjectsModal open={linkOpen} onClose={()=>setLinkOpen(false)} goal={goal} app={app}/>
        {editOpen && <GoalEditorModal goal={goal} app={app} onClose={()=>setEditOpen(false)}/>}
      </Screen>
    );
  }

  // B — Timeline / Kanban-style phases as vertical milestones
  return (
    <Screen frame={frame} app={app} active={'goal:'+goal.id} onNav={onNav} onAsk={onAsk}
      title={goal.name} subtitle={goal.overarching} crumbs={['Goals', isPrimary ? 'Primary' : 'Other']}
      headerRight={headerRight}>
      <div style={{ padding: '22px 30px 40px', display: 'grid', gridTemplateColumns: frame==='mobile'?'1fr':'200px 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 11, top: 14, bottom: 14, width: 2, background: TOKENS.line }}/>
          {goal.phases.map(p => {
            const active = phase === p.id;
            const isP1 = p.order === 1;
            return (
              <button key={p.id} onClick={()=>setPhase(p.id)} style={{ ...btnReset, display: 'flex', gap: 12, padding: '10px 8px', textAlign: 'left', alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: 999, background: active ? goal.color : (isP1 ? TOKENS.greenSoft : TOKENS.surface), color: active ? '#fff' : (isP1 ? TOKENS.green : TOKENS.sub), border: `2px solid ${active ? goal.color : TOKENS.line}`, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, zIndex: 1 }}>{p.order}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: active?500:400, color: active ? TOKENS.ink : (isP1?TOKENS.inkSoft:TOKENS.sub) }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: TOKENS.sub, marginTop: 2 }}>{goalProjects.filter(x=>app.phaseForProjectInGoal(x.id, goal.id)===p.id).length} projects</div>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: TOKENS.surfaceAlt, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '12px 16px' }}>
            <SectionLabel color={TOKENS.teal}>Why this matters</SectionLabel>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, fontStyle: 'italic', marginTop: 4 }}>"{goal.enthusiasm}"</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{ph.name}</h2>
            <span style={{ fontSize: 12, color: ph.status === 'active' ? TOKENS.green : TOKENS.sub }}>{ph.status}</span>
            <div style={{ flex:1 }}/>
            <button onClick={()=>setLinkOpen(true)} style={{ ...btnReset, padding: '5px 10px', fontSize: 11.5, color: TOKENS.teal, border: `1px solid ${TOKENS.tealSoft}`, borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Plus size={11}/> Link projects
            </button>
          </div>
          <div style={{ fontSize: 13, color: TOKENS.sub, lineHeight: 1.55 }}>{ph.description}</div>
          <div style={{ display: 'grid', gridTemplateColumns: frame==='mobile'?'1fr':'1fr 1fr', gap: 12 }}>
            {projects.length === 0 ? (
              <div style={{ gridColumn: '1/-1', padding: '14px 18px', background: TOKENS.surface, border: `1px dashed ${TOKENS.line}`, borderRadius: TOKENS.radius, color: TOKENS.sub, fontSize: 13 }}>
                No projects in this phase yet.
              </div>
            ) : projects.map(proj => <ProjectCard key={proj.id} proj={proj} app={app} onNav={onNav}/>)}
          </div>
        </div>
      </div>
      <LinkProjectsModal open={linkOpen} onClose={()=>setLinkOpen(false)} goal={goal} app={app}/>
        {editOpen && <GoalEditorModal goal={goal} app={app} onClose={()=>setEditOpen(false)}/>}
    </Screen>
  );
}

// Link projects modal — multiselect across all projects to toggle membership in this goal.
function LinkProjectsModal({ open, onClose, goal, app }) {
  const [draft, setDraft] = useState(() => new Set());
  useEffect(() => {
    if (open) {
      const ids = new Set();
      (app.projects || PROJECTS).forEach(p => { if (goal.id in (app.projectGoals[p.id]||{})) ids.add(p.id); });
      setDraft(ids);
    }
  }, [open, goal.id]);
  if (!open) return null;
  const toggle = (pid) => setDraft(s => { const n = new Set(s); n.has(pid) ? n.delete(pid) : n.add(pid); return n; });
  const save = () => {
    (app.projects || PROJECTS).forEach(p => {
      const cur = new Set(Object.keys(app.projectGoals[p.id]||{}));
      if (draft.has(p.id)) cur.add(goal.id); else cur.delete(goal.id);
      app.setProjectGoalIds(p.id, Array.from(cur));
    });
    onClose();
  };
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.32)',
      backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 90 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 'min(520px, 92%)', maxHeight: 'min(620px, 88%)',
        background: TOKENS.surface, borderRadius: TOKENS.radiusLg, border: `1px solid ${TOKENS.line}`,
        boxShadow: '0 40px 90px rgba(20,30,20,0.22)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        fontFamily: TOKENS.fontSans, color: TOKENS.ink }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${TOKENS.line}`, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: goal.color }}/>
          <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>Link projects to {goal.name}</div>
          <button onClick={save} style={{ ...btnReset, padding: '7px 14px', borderRadius: 999, background: TOKENS.green, color: '#fff', fontSize: 12, fontWeight: 500 }}>Save</button>
          <button onClick={onClose} style={{ ...btnReset, color: TOKENS.sub, width: 28, height: 28, display:'grid', placeItems:'center', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, marginLeft: 6 }}><Close size={13}/></button>
        </div>
        <div style={{ padding: '10px 18px', fontSize: 11.5, color: TOKENS.sub, borderBottom: `1px solid ${TOKENS.lineSoft}` }}>
          Tick a project to link it. You'll set which phase it sits in from the goal page.
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {(app.projects || PROJECTS).map(p => {
            const checked = draft.has(p.id);
            const otherGoals = Object.keys(app.projectGoals[p.id]||{}).filter(gid => gid !== goal.id).map(gid => GOALS.find(g=>g.id===gid)).filter(Boolean);
            return (
              <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderTop: `1px solid ${TOKENS.lineSoft}`, cursor: 'pointer',
                background: checked ? TOKENS.greenTint : 'transparent' }}>
                <button type="button" onClick={()=>toggle(p.id)} style={{ ...btnReset, width: 18, height: 18, borderRadius: 4,
                  border: `1.5px solid ${checked ? TOKENS.green : TOKENS.line}`,
                  background: checked ? TOKENS.green : 'transparent', color: '#fff', display: 'grid', placeItems: 'center' }}>
                  {checked && <Check size={11} stroke={2.5}/>}
                </button>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: p.color }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5 }}>{p.name}</div>
                  {otherGoals.length > 0 && (
                    <div style={{ fontSize: 10.5, color: TOKENS.sub, marginTop: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      also in: {otherGoals.map(g => <GoalChip key={g.id} goal={g} compact/>)}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 10.5, color: TOKENS.sub }}>{Math.round(p.progress*100)}%</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProjectRow({ proj, app, onNav, goal, needsPhase = false, mobile = false }) {
  const tasks = app.tasks.filter(t => t.projectId === proj.id);
  const done = tasks.filter(t=>t.done).length;
  const curPhase = goal ? app.phaseForProjectInGoal(proj.id, goal.id) : null;
  const phaseSelect = goal ? (
    <div style={{ position: 'relative', flexShrink: 0, minWidth: 0 }}>
      <select value={curPhase || ''} onChange={e=>app.setProjectPhase(proj.id, goal.id, e.target.value || null)}
        style={{ appearance: 'none', WebkitAppearance: 'none', fontFamily: 'inherit', fontSize: 11.5,
          padding: '5px 26px 5px 10px', borderRadius: 999, cursor: 'pointer', maxWidth: mobile ? 180 : 'none', textOverflow: 'ellipsis',
          color: curPhase ? TOKENS.ink : TOKENS.warn,
          background: curPhase ? TOKENS.bg : TOKENS.warnSoft,
          border: `1px solid ${curPhase ? TOKENS.line : TOKENS.warnSoft}`, outline: 'none' }}>
        <option value="">Set phase…</option>
        {goal.phases.map(p => <option key={p.id} value={p.id}>Phase {p.order} · {p.name}</option>)}
      </select>
      <ChevD size={11} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: TOKENS.sub, pointerEvents: 'none' }}/>
    </div>
  ) : null;
  const progress = (
    <div style={{ width: mobile ? 56 : 80, height: 4, background: TOKENS.bg, borderRadius: 999, overflow:'hidden', flexShrink: 0 }}>
      <div style={{ width: `${proj.progress*100}%`, height: '100%', background: proj.color }}/>
    </div>
  );
  const meta = (
    <span style={{ display: 'flex', fontSize: 11.5, color: TOKENS.sub, marginTop: 3, alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span>{done}/{tasks.length} done</span>
      <span>· last active {proj.lastActive}</span>
      {(app?.statusOf ? app.statusOf(proj.id) : proj.status)==='quiet' && <QuietBadge/>}
    </span>
  );
  // Mobile: stack — name row on top, controls row beneath (one column squeezes badly at 360px).
  if (mobile) {
    return (
      <div style={{ background: TOKENS.surface, border: `1px solid ${needsPhase ? TOKENS.warnSoft : TOKENS.line}`, borderRadius: TOKENS.radius, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={()=>onNav('project:'+proj.id)} style={{ ...btnReset, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', cursor: 'pointer', width: '100%' }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: proj.color, flexShrink: 0 }}/>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>{proj.name}</span>
            {meta}
          </span>
          <ChevR size={14} style={{ color: TOKENS.sub, flexShrink: 0 }}/>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
          {phaseSelect}
          {progress}
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${needsPhase ? TOKENS.warnSoft : TOKENS.line}`, borderRadius: TOKENS.radius, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 10, height: 10, borderRadius: 999, background: proj.color, flexShrink: 0 }}/>
      <button onClick={()=>onNav('project:'+proj.id)} style={{ ...btnReset, flex: 1, textAlign: 'left', cursor: 'pointer', minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{proj.name}</div>
        {meta}
      </button>
      {phaseSelect}
      {progress}
      <button onClick={()=>onNav('project:'+proj.id)} style={{ ...btnReset, color: TOKENS.sub, flexShrink: 0 }}><ChevR size={14}/></button>
    </div>
  );
}

function ProjectCard({ proj, app, onNav }) {
  const tasks = app.tasks.filter(t => t.projectId === proj.id);
  const done = tasks.filter(t=>t.done).length;
  return (
    <button onClick={()=>onNav('project:'+proj.id)} style={{ ...btnReset, background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: 16, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 120 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: proj.color }}/>
        <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{proj.name}</div>
        {(app?.statusOf ? app.statusOf(proj.id) : proj.status)==='quiet' && <QuietBadge/>}
      </div>
      <div style={{ fontSize: 12, color: TOKENS.sub, lineHeight: 1.5 }}>{proj.note || '—'}</div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 4, background: TOKENS.bg, borderRadius: 999, overflow:'hidden' }}>
          <div style={{ width: `${proj.progress*100}%`, height: '100%', background: proj.color }}/>
        </div>
        <span style={{ fontSize: 11, color: TOKENS.sub }}>{done}/{tasks.length}</span>
      </div>
    </button>
  );
}

// Edit a project's name, note and colour.
function ProjectEditorModal({ proj, app, onClose }) {
  const [name, setName] = useState(proj.name);
  const [note, setNote] = useState(proj.note || '');
  const [color, setColor] = useState(proj.color);
  const PROJ_COLORS = ['#5a8a3a', '#2a8a8a', '#8a6a3a', '#3a8a6e', '#a06a3a', '#6e8a3a', '#7a4f8a', '#9a4a4a'];
  const canSave = name.trim().length > 0;
  const save = () => { if (!canSave) return; app.updateProject(proj.id, { name: name.trim(), note: note.trim(), color }); onClose(); };
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.32)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 90, padding: 20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 'min(440px, 100%)', maxHeight: '100%', overflow: 'auto', background: TOKENS.surface, borderRadius: TOKENS.radiusLg, border: `1px solid ${TOKENS.line}`, boxShadow: '0 40px 90px rgba(20,30,20,0.22)', fontFamily: TOKENS.fontSans, color: TOKENS.ink }}>
        <div style={{ padding: '14px 14px 14px 18px', borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Folder size={14}/></span>
          <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>Edit project</div>
          <button onClick={onClose} aria-label="Close" style={{ ...btnReset, color: TOKENS.sub, width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}><Close size={13}/></button>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <SectionLabel>Name</SectionLabel>
            <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{ if (e.key==='Enter') save(); }} placeholder="e.g. Landing page + waitlist"
              style={{ width: '100%', marginTop: 8, padding: '10px 12px', borderRadius: TOKENS.radius, border: `1px solid ${TOKENS.line}`, background: TOKENS.bg, fontSize: 14, fontFamily: 'inherit', color: TOKENS.ink, outline: 'none', boxSizing: 'border-box' }}/>
          </div>
          <div>
            <SectionLabel>Note</SectionLabel>
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="What this project is about, in a line or two."
              style={{ width: '100%', marginTop: 8, padding: '10px 12px', borderRadius: TOKENS.radius, border: `1px solid ${TOKENS.line}`, background: TOKENS.bg, fontSize: 13.5, fontFamily: 'inherit', color: TOKENS.ink, outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5 }}/>
          </div>
          <div>
            <SectionLabel>Colour</SectionLabel>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 10 }}>
              {PROJ_COLORS.map(c => (
                <button key={c} onClick={()=>setColor(c)} aria-label={'Colour '+c}
                  style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, background: c, cursor: 'pointer', boxShadow: color === c ? `0 0 0 2px ${TOKENS.surface}, 0 0 0 4px ${c}` : 'none' }}/>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 18px', borderTop: `1px solid ${TOKENS.line}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ ...btnReset, padding: '8px 16px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 12.5 }}>Cancel</button>
          <button onClick={save} disabled={!canSave} style={{ ...btnReset, padding: '8px 18px', borderRadius: 999, background: canSave ? TOKENS.green : TOKENS.greenSoft, color: canSave ? '#fff' : TOKENS.sub, fontSize: 12.5, fontWeight: 500, cursor: canSave ? 'pointer' : 'default' }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

// Goal crumb for multi-goal projects: click opens a dropdown of every attached goal.
// Selecting one switches the crumb context (view only); the arrow opens the goal itself.
function GoalCrumbPicker({ goals, current, primaryId, onSelect, onNav }) {
  const [open, setOpen] = useState(false);
  const extra = goals.length - 1;
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button onClick={()=> extra > 0 ? setOpen(o=>!o) : onNav('goal:'+current.id)}
        style={{ ...btnReset, font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', color: open ? TOKENS.green : TOKENS.sub, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}
        onMouseEnter={e=>{ e.currentTarget.style.color = TOKENS.green; }}
        onMouseLeave={e=>{ if (!open) e.currentTarget.style.color = TOKENS.sub; }}>
        {current.name}{extra > 0 ? ` (+${extra} more)` : ''}
        {extra > 0 && <ChevD size={10} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/>}
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 70 }}/>
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 71, width: 250, textTransform: 'none', letterSpacing: 0, fontWeight: 400,
            background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, boxShadow: '0 18px 44px rgba(20,30,20,0.2)', padding: 4 }}>
            <div style={{ padding: '6px 10px 4px', fontSize: 9.5, color: TOKENS.sub, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 500 }}>Attached goals</div>
            {goals.map(g => {
              const cur = g.id === current.id;
              return (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', borderRadius: 7, background: cur ? TOKENS.greenTint : 'transparent' }}>
                  <button onClick={()=>{ onSelect(g.id); setOpen(false); }}
                    style={{ ...btnReset, flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px 8px 10px', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: TOKENS.ink }}>
                    <span style={{ width: 9, height: 9, borderRadius: 999, background: g.color, flexShrink: 0 }}/>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
                    {g.id === primaryId && <span title="Primary goal" style={{ fontSize: 10, color: TOKENS.green, fontWeight: 700 }}>★</span>}
                    {cur && <Check size={12} stroke={2.5} style={{ color: TOKENS.green, flexShrink: 0 }}/>}
                  </button>
                  <button onClick={()=>{ setOpen(false); onNav('goal:'+g.id); }} title={'Open ' + g.name}
                    style={{ ...btnReset, width: 26, height: 26, borderRadius: 999, display: 'grid', placeItems: 'center', color: TOKENS.sub, flexShrink: 0, marginRight: 4, cursor: 'pointer' }}>
                    <Arr size={12}/>
                  </button>
                </div>
              );
            })}
            <div style={{ padding: '5px 10px 4px', fontSize: 10.5, color: TOKENS.subSoft, lineHeight: 1.45 }}>Viewing context only — resets to your primary or most recent goal.</div>
          </div>
        </>
      )}
    </div>
  );
}

// ====== PROJECT DETAIL (collapsible sections + inline add) ======
const PROJECT_STATUSES = [['active', 'Active', TOKENS.green], ['quiet', 'Quiet', TOKENS.teal], ['parked', 'Parked', TOKENS.subSoft]];
// Header control to mark a project Active / Quiet / Parked.
function ProjectStatusControl({ app, pid }) {
  const [open, setOpen] = useState(false);
  const cur = app.statusOf(pid);
  const meta = PROJECT_STATUSES.find(s => s[0] === cur) || ['new', 'New', TOKENS.warn];
  const choose = (key) => {
    setOpen(false);
    if (key === cur) return;
    app.setProjectStatus(pid, key);
    const label = (PROJECT_STATUSES.find(s => s[0] === key) || [, key])[1];
    const name = ((app.projectById && app.projectById(pid)) || PROJECTS.find(p => p.id === pid) || {}).name;
    app.notify({ title: 'Project ' + label.toLowerCase(), summary: `"${name}" is now ${label.toLowerCase()}.`,
      body: key === 'parked' ? `"${name}" is parked — it'll rest quietly and won't nudge you.` : key === 'quiet' ? `"${name}" is marked quiet — still around, just not pressing.` : `"${name}" is active again — back among the things you're moving.` });
  };
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ ...btnReset, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px 5px 9px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, fontSize: 12, cursor: 'pointer' }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: meta[2] }}/>{meta[1]}<ChevD size={12} style={{ color: TOKENS.sub }}/>
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }}/>
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 41, width: 150,
            background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, boxShadow: '0 16px 40px rgba(20,30,20,0.2)', overflow: 'hidden', padding: 4 }}>
            {PROJECT_STATUSES.map(([key, label, color]) => (
              <button key={key} onClick={()=>choose(key)} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 6, fontSize: 13, cursor: 'pointer', background: cur === key ? TOKENS.greenTint : 'transparent' }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: color }}/>{label}
                {cur === key && <Check size={12} stroke={2.5} style={{ marginLeft: 'auto', color: TOKENS.green }}/>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectScreen({ app, variant, frame, onNav, onAsk, projectId = 'p1' }) {
  const proj = (app.projectById ? app.projectById(projectId) : PROJECTS.find(p => p.id === projectId));
  const tasks = app.tasks.filter(t => t.projectId === proj.id);
  const done = tasks.filter(t=>t.done).length;
  const projGoals = app.goalsForProject ? app.goalsForProject(proj.id) : [];
  // Crumb goal for a many-to-many project: the PRIMARY goal wins if this project is
  // attached to it; otherwise the most recently active of its goals. Derived, so it
  // re-resolves automatically when the primary changes. A manual pick from the crumb
  // dropdown overrides it for this visit only (reset when you open another project).
  const [crumbGoalPick, setCrumbGoalPick] = useState(null);
  useEffect(() => { setCrumbGoalPick(null); }, [projectId]);
  const defaultCrumbGoal = projGoals.find(g => g.id === app.primaryGoalId)
    || [...projGoals].sort((a, b) => ((app.navRecency||{})[b.id] || 0) - ((app.navRecency||{})[a.id] || 0))[0];
  const crumbGoal = projGoals.find(g => g.id === crumbGoalPick) || defaultCrumbGoal;
  const crumbPhaseId = crumbGoal ? app.phaseForProjectInGoal(proj.id, crumbGoal.id) : null;
  const crumbPhase = crumbGoal ? crumbGoal.phases.find(p => p.id === crumbPhaseId) : null;
  const otherGoalCount = projGoals.length - 1;
  const sections = PROJECT_SECTIONS[proj.id] || [{ id: proj.id+'s1', name: 'Tasks' }];
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [adding, setAdding] = useState(null); // section id currently adding to
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const toggleCollapse = (sid) => setCollapsed(s => { const n=new Set(s); n.has(sid)?n.delete(sid):n.add(sid); return n; });
  const tasksFor = (sid) => tasks.filter(t => (app.sectionOf(t.id) || sections[0].id) === sid);

  const body = (
    <div style={{ padding: '22px 30px 40px', display: 'grid', gridTemplateColumns: frame==='mobile' ? '1fr' : (variant==='b' ? '1fr 280px' : '1fr 280px'), gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sections.map(sec => {
          const secTasks = tasksFor(sec.id);
          const isCollapsed = collapsed.has(sec.id);
          const secDone = secTasks.filter(t=>t.done).length;
          return (
            <div key={sec.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: isCollapsed ? 'none' : `1px solid ${TOKENS.lineSoft}` }}>
                <button onClick={()=>toggleCollapse(sec.id)} style={{ ...btnReset, width: 18, height: 18, display: 'grid', placeItems: 'center', color: TOKENS.sub, transform: isCollapsed ? 'rotate(-90deg)' : 'none', transition: 'transform .15s' }}>
                  <ChevR size={11} style={{ transform: 'rotate(90deg)' }}/>
                </button>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{sec.name}</div>
                <div style={{ fontSize: 11, color: TOKENS.sub, fontVariantNumeric: 'tabular-nums' }}>{secDone}/{secTasks.length}</div>
                <div style={{ flex: 1 }}/>
                <button onClick={()=>{ setAdding(sec.id); setDraft(''); }} style={{ ...btnReset, padding: '4px 9px', borderRadius: 999, color: TOKENS.green, fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Plus size={10}/>Add task
                </button>
              </div>
              {!isCollapsed && (
                <>
                  {secTasks.map(t => <TaskRow key={t.id} task={t} app={app}/>)}
                  {adding === sec.id && (
                    <form onSubmit={(e)=>{e.preventDefault(); setAdding(null);}} style={{ padding: '10px 16px', borderTop: `1px solid ${TOKENS.lineSoft}`, display: 'flex', gap: 10, alignItems: 'center', background: TOKENS.greenTint }}>
                      <div style={{ width: 18, height: 18, borderRadius: 999, border: `1.5px dashed ${TOKENS.green}` }}/>
                      <input autoFocus value={draft} onChange={e=>setDraft(e.target.value)} onBlur={()=>!draft && setAdding(null)} placeholder="New task…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontFamily: 'inherit', color: TOKENS.ink }}/>
                      <span style={{ fontSize: 10.5, color: TOKENS.sub }}>press enter</span>
                    </form>
                  )}
                  {secTasks.length === 0 && adding !== sec.id && (
                    <div style={{ padding: '14px 16px', fontSize: 12.5, color: TOKENS.sub, textAlign: 'center' }}>Nothing here yet.</div>
                  )}
                </>
              )}
            </div>
          );
        })}
        <button style={{ ...btnReset, padding: '10px 14px', border: `1px dashed ${TOKENS.line}`, borderRadius: TOKENS.radius, color: TOKENS.sub, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
          <Plus size={12}/>Add section
        </button>
      </div>
      {frame !== 'mobile' && (
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: TOKENS.greenTint, border: `1px solid ${TOKENS.greenSoft}`, borderRadius: TOKENS.radius, padding: '14px 16px' }}>
            <SectionLabel color={TOKENS.green}>Progress</SectionLabel>
            <div style={{ fontSize: 26, fontWeight: 500, marginTop: 4, color: TOKENS.green }}>{Math.round(proj.progress*100)}%</div>
            <div style={{ fontSize: 12, color: TOKENS.sub }}>{done}/{tasks.length} tasks · last {proj.lastActive}</div>
          </div>
          <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: 14 }}>
            <SectionLabel>Note</SectionLabel>
            <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.55 }}>{proj.note}</div>
          </div>
          {variant === 'b' && (
            <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: 14 }}>
              <SectionLabel>Timeline</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {[{t:'Today', what:'Pinned logo sketches to focus'},{t:'Yesterday', what:'Drafted 2 headline options'},{t:'2 days ago', what:'Started Stripe keys'}].map((e,i)=>(
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 999, background: TOKENS.teal, marginTop: 6 }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5 }}>{e.what}</div>
                      <div style={{ fontSize: 10.5, color: TOKENS.sub }}>{e.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );

  return (
    <Screen frame={frame} app={app} active={'project:'+proj.id} onNav={onNav} onAsk={onAsk}
      title={proj.name} subtitle={`${done}/${tasks.length} tasks · last active ${proj.lastActive}`}
      crumbs={projGoals.length ? [
        { label: crumbGoal.name + (otherGoalCount > 0 ? ` (+${otherGoalCount} more)` : ''),
          node: <GoalCrumbPicker goals={projGoals} current={crumbGoal} primaryId={app.primaryGoalId} onSelect={setCrumbGoalPick} onNav={onNav}/> },
        ...(crumbPhase ? [{ label: 'Phase '+crumbPhase.order, onClick: () => onNav('goal:'+crumbGoal.id+':'+crumbPhase.id) }] : []),
        proj.name
      ] : ['Projects', proj.name]}
      headerRight={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><button onClick={()=>setEditOpen(true)} title="Edit project" style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', color: TOKENS.sub, border: `1px solid ${TOKENS.line}`, background: TOKENS.bg }}><Edit size={13}/></button>{projGoals.length === 0 && <span title="Not linked to a goal" style={{ fontSize: 10.5, color: TOKENS.subSoft, background: TOKENS.bgSoft, border: `1px solid ${TOKENS.line}`, padding: '3px 9px', borderRadius: 999 }}>No goal</span>}<ProjectStatusControl app={app} pid={proj.id}/></div>}>{body}{editOpen && <ProjectEditorModal proj={proj} app={app} onClose={()=>setEditOpen(false)}/>}</Screen>
  );
}

function TaskGroup({ title, tasks, app }) {
  if (tasks.length === 0) return null;
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px' }}><SectionLabel>{title} · {tasks.length}</SectionLabel></div>
      {tasks.map(t => <TaskRow key={t.id} task={t} app={app}/>)}
    </div>
  );
}

export { TodayScreen, GoalScreen, ProjectScreen, ProjectRow, ProjectCard, EmptyState };
