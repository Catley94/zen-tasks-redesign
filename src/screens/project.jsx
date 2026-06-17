// Project detail — collapsible task sections with inline add, a progress/notes
// aside, the goal breadcrumb picker (for multi-goal projects), the Active/Quiet/
// Parked status control, and the "edit project" modal.

import React, { useState, useEffect } from 'react';
import { TOKENS, btnReset } from '../lib/tokens';
import { ChevD, Check, Arr, Folder, Close, ChevR, Plus, Edit } from '../components/icons';
import { Screen } from '../components/screen';
import { TaskRow, SectionLabel } from '../components/primitives';
import { PROJECT_STATUS_KEYS } from '../domain/constants';
import { projectStatusNote } from '../domain/messages';

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
// Status keys + labels come from the model; the colour for each is presentation.
const STATUS_COLOR = { active: TOKENS.green, quiet: TOKENS.teal, parked: TOKENS.subSoft };
const PROJECT_STATUSES = PROJECT_STATUS_KEYS.map(({ key, label }) => [key, label, STATUS_COLOR[key]]);
// Header control to mark a project Active / Quiet / Parked.
function ProjectStatusControl({ app, pid }) {
  const [open, setOpen] = useState(false);
  const cur = app.statusOf(pid);
  const meta = PROJECT_STATUSES.find(s => s[0] === cur) || ['new', 'New', TOKENS.warn];
  const choose = (key) => {
    setOpen(false);
    if (key === cur) return;
    app.setProjectStatus(pid, key);
    const name = (app.projectById(pid) || {}).name;
    app.notify(projectStatusNote(name, key));
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
  const proj = app.projectById(projectId);
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
  const definedSections = app.sectionsForProject(proj.id);
  const sections = definedSections.length ? definedSections : [{ id: proj.id + 's1', name: 'Tasks' }];
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

export { ProjectScreen };
