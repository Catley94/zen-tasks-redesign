// Goal detail — phases as the spine, with the projects linked into each phase.
// Includes the project rows/cards it renders, the "edit goal" and "link projects"
// modals, and a no-goals empty state.

import React, { useState, useEffect } from 'react';
import { TOKENS, btnReset } from '../lib/tokens';
import { GOALS, PROJECTS } from '../lib/data';
import { Target, Edit, Plus, Sparkles, Moon, Close, Check, ChevD, ChevR } from '../components/icons';
import { Screen } from '../components/screen';
import { SectionLabel, GoalChip, QuietBadge } from '../components/primitives';

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

export { GoalScreen, ProjectRow, ProjectCard };
