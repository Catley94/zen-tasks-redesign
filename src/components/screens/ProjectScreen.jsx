import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../shared/AppContext.jsx';
import { TOKENS, btnReset, PROJECT_SECTIONS } from '../../data/seeds.js';
import { Screen } from '../shared/screen.jsx';
import { TaskRow, SectionLabel, GoalChip } from '../shared/primitives.jsx';
import { Plus, Check, ChevD, ChevR, Edit, Close, Folder, Trash } from '../shared/icons.jsx';

const PROJECT_STATUSES = [['active', 'Active', TOKENS.green], ['quiet', 'Quiet', TOKENS.teal], ['parked', 'Parked', TOKENS.subSoft]];

function ProjectStatusControl({ app, pid }) {
  const [open, setOpen] = useState(false);
  const cur = app.statusOf(pid);
  const meta = PROJECT_STATUSES.find(s => s[0] === cur) || ['new', 'New', TOKENS.warn];
  const choose = (key) => {
    setOpen(false);
    if (key === cur) return;
    app.setProjectStatus(pid, key);
    const label = (PROJECT_STATUSES.find(s => s[0] === key) || [, key])[1];
    const name = (app.projectById && app.projectById(pid))?.name;
    app.notify({ title: 'Project ' + label.toLowerCase(), summary: `"${name}" is now ${label.toLowerCase()}.`, body: '' });
  };
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ ...btnReset, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px 5px 9px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, fontSize: 12, cursor: 'pointer' }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: meta[2] }} />{meta[1]}<ChevD size={12} style={{ color: TOKENS.sub }} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 41, width: 150, background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, boxShadow: '0 16px 40px rgba(20,30,20,0.2)', overflow: 'hidden', padding: 4 }}>
            {PROJECT_STATUSES.map(([key, label, color]) => (
              <button key={key} onClick={() => choose(key)} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 6, fontSize: 13, cursor: 'pointer', background: cur === key ? TOKENS.greenTint : 'transparent' }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />{label}
                {cur === key && <Check size={12} stroke={2.5} style={{ marginLeft: 'auto', color: TOKENS.green }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectEditorModal({ proj, app, onClose }) {
  const [name, setName] = useState(proj.name);
  const [note, setNote] = useState(proj.note || '');
  const [color, setColor] = useState(proj.color);
  const PROJ_COLORS = ['#5a8a3a', '#2a8a8a', '#8a6a3a', '#3a8a6e', '#a06a3a', '#6e8a3a', '#7a4f8a', '#9a4a4a'];
  const canSave = name.trim().length > 0;
  const save = () => { if (!canSave) return; app.updateProject(proj.id, { name: name.trim(), note: note.trim(), color }); onClose(); };
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.32)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 90, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(440px, 100%)', maxHeight: '100%', overflow: 'auto', background: TOKENS.surface, borderRadius: TOKENS.radiusLg, border: `1px solid ${TOKENS.line}`, boxShadow: '0 40px 90px rgba(20,30,20,0.22)', fontFamily: TOKENS.fontSans, color: TOKENS.ink }}>
        <div style={{ padding: '14px 14px 14px 18px', borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Folder size={14} /></span>
          <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>Edit project</div>
          <button onClick={onClose} aria-label="Close" style={{ ...btnReset, color: TOKENS.sub, width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}><Close size={13} /></button>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <SectionLabel>Name</SectionLabel>
            <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') save(); }} placeholder="e.g. Landing page + waitlist"
              style={{ width: '100%', marginTop: 8, padding: '10px 12px', borderRadius: TOKENS.radius, border: `1px solid ${TOKENS.line}`, background: TOKENS.bg, fontSize: 14, fontFamily: 'inherit', color: TOKENS.ink, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <SectionLabel>Note</SectionLabel>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="What this project is about, in a line or two."
              style={{ width: '100%', marginTop: 8, padding: '10px 12px', borderRadius: TOKENS.radius, border: `1px solid ${TOKENS.line}`, background: TOKENS.bg, fontSize: 13.5, fontFamily: 'inherit', color: TOKENS.ink, outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5 }} />
          </div>
          <div>
            <SectionLabel>Colour</SectionLabel>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 10 }}>
              {PROJ_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} aria-label={'Colour ' + c}
                  style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, background: c, cursor: 'pointer', boxShadow: color === c ? `0 0 0 2px ${TOKENS.surface}, 0 0 0 4px ${c}` : 'none' }} />
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

export default function ProjectScreen() {
  const { projectId } = useParams();
  const { app, onNav, frame } = useApp();

  const proj = app.projectById ? app.projectById(projectId) : app.projects.find(p => p.id === projectId);
  if (!proj) {
    return (
      <Screen app={app} active="project" onNav={onNav} frame={frame} title="Project not found" crumbs={['Projects']}>
        <div style={{ padding: 40, color: TOKENS.sub }}>Project not found.</div>
      </Screen>
    );
  }

  const tasks = app.tasks.filter(t => t.projectId === proj.id);
  const done = tasks.filter(t => t.done).length;
  const projGoals = app.goalsForProject ? app.goalsForProject(proj.id) : [];
  const sections = PROJECT_SECTIONS?.[proj.id] || [{ id: proj.id + 's1', name: 'Tasks' }];
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [adding, setAdding] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const toggleCollapse = (sid) => setCollapsed(s => { const n = new Set(s); n.has(sid) ? n.delete(sid) : n.add(sid); return n; });
  const tasksFor = (sid) => tasks.filter(t => (app.sectionOf ? app.sectionOf(t.id) : null) === sid || (!app.sectionOf && sections[0].id === sid));

  const body = (
    <div style={{ padding: '22px 30px 40px', display: 'grid', gridTemplateColumns: frame === 'mobile' ? '1fr' : '1fr 280px', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sections.map(sec => {
          const secTasks = tasksFor(sec.id);
          const isCollapsed = collapsed.has(sec.id);
          const secDone = secTasks.filter(t => t.done).length;
          return (
            <div key={sec.id} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: isCollapsed ? 'none' : `1px solid ${TOKENS.lineSoft}` }}>
                <button onClick={() => toggleCollapse(sec.id)} style={{ ...btnReset, width: 18, height: 18, display: 'grid', placeItems: 'center', color: TOKENS.sub, transform: isCollapsed ? 'rotate(-90deg)' : 'none', transition: 'transform .15s' }}>
                  <ChevR size={11} style={{ transform: 'rotate(90deg)' }} />
                </button>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{sec.name}</div>
                <div style={{ fontSize: 11, color: TOKENS.sub, fontVariantNumeric: 'tabular-nums' }}>{secDone}/{secTasks.length}</div>
                <div style={{ flex: 1 }} />
                <button onClick={() => { setAdding(sec.id); setDraft(''); }} style={{ ...btnReset, padding: '4px 9px', borderRadius: 999, color: TOKENS.green, fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Plus size={10} />Add task
                </button>
              </div>
              {!isCollapsed && (
                <>
                  {secTasks.map(t => <TaskRow key={t.id} task={t} app={app} />)}
                  {adding === sec.id && (
                    <form onSubmit={e => { e.preventDefault(); setAdding(null); }} style={{ padding: '10px 16px', borderTop: `1px solid ${TOKENS.lineSoft}`, display: 'flex', gap: 10, alignItems: 'center', background: TOKENS.greenTint }}>
                      <div style={{ width: 18, height: 18, borderRadius: 999, border: `1.5px dashed ${TOKENS.green}` }} />
                      <input autoFocus value={draft} onChange={e => setDraft(e.target.value)} onBlur={() => !draft && setAdding(null)} placeholder="New task…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontFamily: 'inherit', color: TOKENS.ink }} />
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
          <Plus size={12} />Add section
        </button>
      </div>
      {frame !== 'mobile' && (
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: TOKENS.greenTint, border: `1px solid ${TOKENS.greenSoft}`, borderRadius: TOKENS.radius, padding: '14px 16px' }}>
            <SectionLabel color={TOKENS.green}>Progress</SectionLabel>
            <div style={{ fontSize: 26, fontWeight: 500, marginTop: 4, color: TOKENS.green }}>{Math.round(proj.progress * 100)}%</div>
            <div style={{ fontSize: 12, color: TOKENS.sub }}>{done}/{tasks.length} tasks · last {proj.lastActive}</div>
          </div>
          <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: 14 }}>
            <SectionLabel>Note</SectionLabel>
            <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.55 }}>{proj.note}</div>
          </div>
        </aside>
      )}
    </div>
  );

  return (
    <Screen app={app} active={'project:' + proj.id} onNav={onNav} frame={frame}
      title={proj.name}
      subtitle={`${done}/${tasks.length} tasks · last active ${proj.lastActive}`}
      crumbs={projGoals.length ? [projGoals[0].name, proj.name] : ['Projects', proj.name]}
      headerRight={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setEditOpen(true)} title="Edit project" style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', color: TOKENS.sub, border: `1px solid ${TOKENS.line}`, background: TOKENS.bg }}><Edit size={13} /></button>
          {projGoals.length === 0 && <span title="Not linked to a goal" style={{ fontSize: 10.5, color: TOKENS.subSoft, background: TOKENS.bgSoft, border: `1px solid ${TOKENS.line}`, padding: '3px 9px', borderRadius: 999 }}>No goal</span>}
          <ProjectStatusControl app={app} pid={proj.id} />
        </div>
      }>
      {body}
      {editOpen && <ProjectEditorModal proj={proj} app={app} onClose={() => setEditOpen(false)} />}
    </Screen>
  );
}
