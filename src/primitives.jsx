// Shared primitives used by every screen: AppChrome (sidebar + top bar + persistent Zen corner),
// AskZenOverlay, TaskRow, ProjectPill, PriorityDot, DensityToggle, StaleBadge, etc.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TOKENS, btnReset, PRIORITY_LABEL, PRIORITY_COLOR } from './tokens';
import { PROJECTS, GOALS, CATEGORIES, PROJECT_STALE_DAYS, lastActiveDays, MAX_SIDEBAR_PROJECTS, ZEN_NUDGES, NOTIFICATIONS } from './data';
import { Leaf, Sparkles, Bell, Search, ChevD, ChevR, Plus, Close, Pin, Moon, MoreV, Check, Target, Folder, Tag, Dot, Settings, Help, User, Home, Grid, ListTodo, Arr, Trash, CalToday, CalMonth, Flame, Heart, Bag, Wallet, Calendar } from './icons';
import { useZenAI } from './state';

// ——— CatIcon — maps a category icon key to the right icon component ———
const CATEGORY_ICON_MAP = { tag: Tag, home: Home, heart: Heart, bag: Bag, wallet: Wallet, leaf: Leaf, flame: Flame, calendar: Calendar };

function CatIcon({ icon, size = 13 }) {
  const I = CATEGORY_ICON_MAP[icon] || Tag;
  return <I size={size}/>;
}

// ——— small bits ———
function PriorityDot({ p, size = 8 }) {
  return <span title={PRIORITY_LABEL[p]} style={{ width: size, height: size, borderRadius: 999, background: PRIORITY_COLOR[p], display: 'inline-block', flexShrink: 0 }}/>;
}

function QuietBadge({ children = 'gently quiet' }) {
  return <span style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 999, background: TOKENS.tealTint, color: TOKENS.tealDeep }}>{children}</span>;
}
const StaleBadge = QuietBadge;

function FocusPill({ on, onClick, size = 'sm' }) {
  const s = size === 'sm';
  return (
    <button onClick={onClick} style={{ ...btnReset, padding: s ? '3px 8px' : '5px 12px', borderRadius: 999,
      fontSize: s ? 10.5 : 12, fontWeight: 500,
      background: on ? TOKENS.tealSoft : 'transparent', color: on ? TOKENS.tealDeep : TOKENS.sub,
      border: `1px solid ${on ? TOKENS.tealSoft : TOKENS.line}`, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {on && <Pin size={s?9:11}/>}{on ? 'Focus' : 'Add to focus'}
    </button>
  );
}

// Small chip that names a goal — coloured swatch + name, optional 'primary' star.
function GoalChip({ goal, primary = false, compact = false, onClick }) {
  if (!goal) return null;
  return (
    <span onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: compact ? '1px 6px 1px 4px' : '2px 8px 2px 6px',
      borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`,
      fontSize: compact ? 10 : 10.5, color: TOKENS.inkSoft, cursor: onClick ? 'pointer' : 'default', maxWidth: 160 }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: goal.color, flexShrink: 0 }}/>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.name}</span>
      {primary && <span title="Primary" style={{ color: TOKENS.green, fontSize: 9, fontWeight: 700 }}>★</span>}
    </span>
  );
}

function SectionLabel({ children, color = TOKENS.sub }) {
  return <div style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: 1.4, fontWeight: 500 }}>{children}</div>;
}

function DensityToggle({ value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 999, padding: 3 }}>
      {['calm','full'].map(v => (
        <button key={v} onClick={()=>onChange(v)} style={{ ...btnReset, padding: '4px 12px', borderRadius: 999,
          background: value === v ? TOKENS.green : 'transparent', color: value === v ? TOKENS.bg : TOKENS.sub,
          fontSize: 11, fontWeight: 500, textTransform: 'capitalize' }}>{v}</button>
      ))}
    </div>
  );
}

// ——— per-row "…" menu — move a task to a category / project / standalone, or delete it ———
// Popover renders position:fixed so it never gets clipped by card overflow.
function TaskRowMenu({ task, app, hover = false }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('root'); // 'root' | 'move' | 'confirm'
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const W = 224;
  const toggle = (e) => {
    e.stopPropagation();
    if (open) { setOpen(false); return; }
    const r = btnRef.current.getBoundingClientRect();
    const up = r.bottom > window.innerHeight - 300;
    setPos({
      left: Math.max(8, Math.min(r.right - W, window.innerWidth - W - 8)),
      top: up ? undefined : r.bottom + 4,
      bottom: up ? window.innerHeight - r.top + 4 : undefined,
    });
    setView('root'); setOpen(true);
  };
  const place = (p) => { app.placeTask(task.id, p); setOpen(false); };
  const pickStyle = (active) => ({ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px',
    borderRadius: 6, textAlign: 'left', cursor: 'pointer', fontSize: 12.5, background: active ? TOKENS.greenTint : 'transparent', color: TOKENS.ink });
  const groupLabel = (t) => <div style={{ padding: '8px 10px 3px', fontSize: 9.5, color: TOKENS.sub, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 500 }}>{t}</div>;
  const standalone = !task.projectId && !task.categoryId;
  return (
    <div style={{ position: 'relative', flexShrink: 0 }} onClick={e=>e.stopPropagation()}>
      <button ref={btnRef} onClick={toggle} aria-label="Task options" className={hover ? 'zen-row-more' : undefined} data-open={open ? '1' : '0'}
        style={{ ...btnReset, width: 26, height: 26, borderRadius: 999, display: 'grid', placeItems: 'center',
          color: open ? TOKENS.ink : TOKENS.sub, background: open ? TOKENS.bg : 'transparent' }}>
        <MoreV size={14}/>
      </button>
      {open && pos && (
        <>
          <div onClick={(e)=>{ e.stopPropagation(); setOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 80 }}/>
          <div style={{ position: 'fixed', left: pos.left, top: pos.top, bottom: pos.bottom, zIndex: 81, width: W,
            background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius,
            boxShadow: '0 18px 44px rgba(20,30,20,0.2)', overflow: 'hidden', fontFamily: TOKENS.fontSans, color: TOKENS.ink }}>
            {view === 'root' && (
              <>
                <button onClick={()=>setView('move')} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 13, color: TOKENS.ink, cursor: 'pointer', textAlign: 'left' }}>
                  <Folder size={13} style={{ color: TOKENS.sub }}/><span style={{ flex: 1 }}>Move to…</span><ChevR size={12} style={{ color: TOKENS.sub }}/>
                </button>
                <button onClick={()=>setView('confirm')} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 13, color: TOKENS.rose, cursor: 'pointer', textAlign: 'left', borderTop: `1px solid ${TOKENS.lineSoft}` }}>
                  <Trash size={13}/>Delete task
                </button>
              </>
            )}
            {view === 'move' && (
              <div style={{ maxHeight: 264, overflow: 'auto', padding: 4 }}>
                <button onClick={()=>place({})} style={pickStyle(standalone)}>
                  <span style={{ width: 18, height: 18, borderRadius: 6, background: TOKENS.subSoft, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Dot size={10}/></span>
                  <span style={{ flex: 1 }}>Standalone</span>
                  {standalone && <Check size={12} stroke={2.5} style={{ color: TOKENS.green }}/>}
                </button>
                {app.categories.length > 0 && groupLabel('Categories')}
                {app.categories.map(c => (
                  <button key={c.id} onClick={()=>place({ categoryId: c.id })} style={pickStyle(task.categoryId === c.id)}>
                    <span style={{ width: 18, height: 18, borderRadius: 6, background: c.color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><CatIcon icon={c.icon} size={10}/></span>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    {task.categoryId === c.id && <Check size={12} stroke={2.5} style={{ color: TOKENS.green }}/>}
                  </button>
                ))}
                {app.projects.length > 0 && groupLabel('Projects')}
                {app.projects.map(p => (
                  <button key={p.id} onClick={()=>place({ projectId: p.id })} style={pickStyle(task.projectId === p.id)}>
                    <span style={{ width: 9, height: 9, borderRadius: 999, background: p.color, flexShrink: 0, margin: '0 4.5px' }}/>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    {task.projectId === p.id && <Check size={12} stroke={2.5} style={{ color: TOKENS.green }}/>}
                  </button>
                ))}
              </div>
            )}
            {view === 'confirm' && (
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 12.5, color: TOKENS.ink, lineHeight: 1.5, marginBottom: 4 }}>Delete this task?</div>
                <div style={{ fontSize: 11, color: TOKENS.sub, lineHeight: 1.5, marginBottom: 10 }}>"{task.title.length > 48 ? task.title.slice(0, 48) + '…' : task.title}" goes away for good — subtasks and notes too.</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={()=>{ setOpen(false); app.deleteTask(task.id); }} style={{ ...btnReset, flex: 1, padding: '6px 10px', borderRadius: 999, background: TOKENS.rose, color: '#fff', fontSize: 11.5, fontWeight: 500 }}>Delete</button>
                  <button onClick={()=>setView('root')} style={{ ...btnReset, flex: 1, padding: '6px 10px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11.5 }}>Keep</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ——— Task row (reusable across screens) ———
function TaskRow({ task, app, showProject = false, showGoal = false, compact = false, highlighted = false, mobile = false }) {
  const inFocus = app.focusIds.has(task.id);
  const project = (app?.projectById ? app.projectById(task.projectId) : PROJECTS.find(p => p.id === task.projectId));
  const calm = app?.density === 'calm';
  const taskGoals = (showGoal && app?.goalsForTask) ? app.goalsForTask(task.id) : [];
  const hasMeta = (showProject && project) || taskGoals.length > 0;

  const open = (e) => { app.openTask && app.openTask(task.id); };
  const checkbox = (
    <button onClick={(e)=>{ e.stopPropagation(); app.toggleTask(task.id); }} style={{ ...btnReset, width: 18, height: 18, borderRadius: 999,
      border: `1.5px solid ${task.done ? TOKENS.green : TOKENS.line}`, flexShrink: 0,
      background: task.done ? TOKENS.green : 'transparent', color: TOKENS.bg,
      display: 'grid', placeItems: 'center' }}>{task.done && <Check size={11} stroke={2.5}/>}</button>
  );

  if (mobile) {
    // Two-row layout: title row, then a wrapping meta row — nothing competes for width.
    return (
      <div className={highlighted ? 'zen-focus-highlight' : undefined} onClick={open}
        style={{ display: 'flex', gap: 11, padding: '11px 16px', borderTop: `1px solid ${TOKENS.lineSoft}`, opacity: task.done ? 0.5 : 1, cursor: 'pointer' }}>
        <div style={{ paddingTop: 1 }}>{checkbox}</div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: 1.35, textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</div>
            <FocusPill on={inFocus} onClick={(e)=>{ e.stopPropagation(); app.toggleFocus(task.id); }}/>
            <TaskRowMenu task={task} app={app}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 11, color: TOKENS.sub }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><PriorityDot p={task.priority}/>{PRIORITY_LABEL[task.priority]}</span>
            {task.due && task.due !== '—' && <span style={{ color: task.due === 'Overdue' ? TOKENS.warn : TOKENS.sub }}>· {task.due}</span>}
            {task.subtasks.length > 0 && <span style={{ fontFamily: TOKENS.fontMono }}>· {task.subtasks.filter(s=>s.done).length}/{task.subtasks.length}</span>}
            {showProject && project && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>· <span style={{ width: 6, height: 6, borderRadius: 999, background: project.color }}/>{project.name}</span>
            )}
            {taskGoals.map(g => <GoalChip key={g.id} goal={g} primary={app?.primaryGoalId === g.id} compact/>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={(highlighted ? 'zen-focus-highlight ' : '') + 'zen-task-row'} onClick={open}
      onMouseEnter={e=>{ e.currentTarget.style.background = TOKENS.surfaceAlt; }}
      onMouseLeave={e=>{ e.currentTarget.style.background = 'transparent'; }}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: compact ? '8px 14px' : '11px 16px',
      borderTop: `1px solid ${TOKENS.lineSoft}`, opacity: task.done ? 0.5 : 1, position: 'relative', cursor: 'pointer', transition: 'background .12s' }}>
      {checkbox}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, textDecoration: task.done ? 'line-through' : 'none', lineHeight: 1.35 }}>{task.title}</div>
        {hasMeta && (
          <div style={{ fontSize: 11, color: TOKENS.sub, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {showProject && project && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: project.color }}/>{project.name}
              </span>
            )}
            {taskGoals.map(g => <GoalChip key={g.id} goal={g} primary={app?.primaryGoalId === g.id} compact/>)}
          </div>
        )}
      </div>
      {!calm && task.subtasks.length > 0 && (
        <span style={{ fontSize: 10.5, color: TOKENS.sub, fontFamily: TOKENS.fontMono }}>{task.subtasks.filter(s=>s.done).length}/{task.subtasks.length}</span>
      )}
      <FocusPill on={inFocus} onClick={(e)=>{ e.stopPropagation(); app.toggleFocus(task.id); }}/>
      {!calm && <PriorityDot p={task.priority}/>}
      {!calm && <div style={{ fontSize: 11, color: task.due === 'Overdue' ? TOKENS.warn : TOKENS.sub, minWidth: 66, textAlign: 'right' }}>{task.due}</div>}
      <TaskRowMenu task={task} app={app} hover/>
    </div>
  );
}

// ——— Add to Focus modal — flat list with Goal / Project / Phase chips + filter ———
function FilterGroupLabel({ children }) {
  return <div style={{ padding: '8px 14px 4px', fontSize: 10, color: TOKENS.sub, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 500, borderTop: `1px solid ${TOKENS.lineSofter}` }}>{children}</div>;
}
function FilterOption({ active, onClick, icon, label, sub, count }) {
  return (
    <button onClick={onClick} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 14px', textAlign: 'left', background: active ? TOKENS.tealTint : 'transparent', cursor: 'pointer' }}>
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: TOKENS.ink, fontWeight: active ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
        {sub && <div style={{ fontSize: 10.5, color: TOKENS.sub, marginTop: 1 }}>{sub}</div>}
      </div>
      <span style={{ fontSize: 11, color: active ? TOKENS.tealDeep : TOKENS.sub, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      {active && <Check size={12} stroke={2.5} style={{ color: TOKENS.teal }}/>}
    </button>
  );
}

function AddToFocusModal({ open, onClose, app }) {
  const [selected, setSelected] = useState(() => new Set());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'none' | 'g:'+id | 'p:'+id
  const [filterOpen, setFilterOpen] = useState(false);
  useEffect(() => { if (open) { setSelected(new Set()); setQuery(''); setFilter('all'); setFilterOpen(false); } }, [open]);
  if (!open) return null;

  const toggle = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const confirm = () => { selected.forEach(id => { if (!app.focusIds.has(id)) app.toggleFocus(id); }); onClose(); };

  const goals = app.goals || [];
  const eligibleAll = app.tasks.filter(t => !t.done && !app.focusIds.has(t.id));

  const matchesFilter = (t) => {
    if (filter === 'all') return true;
    if (filter === 'none') return !t.projectId;
    const project = PROJECTS.find(p => p.id === t.projectId);
    if (!project) return false;
    if (filter.startsWith('g:')) {
      const gid = filter.slice(2);
      return app.goalIdsOf ? app.goalIdsOf(project.id).includes(gid) : (project.goalIds || []).includes(gid);
    }
    if (filter.startsWith('p:')) return project.id === filter.slice(2);
    return true;
  };

  const filterLabel = () => {
    if (filter === 'all') return 'All tasks';
    if (filter === 'none') return 'Standalone tasks';
    if (filter.startsWith('g:')) return (goals.find(g => g.id === filter.slice(2))||{}).name;
    if (filter.startsWith('p:')) return (PROJECTS.find(p => p.id === filter.slice(2))||{}).name;
    return 'All tasks';
  };
  const filterColor = () => {
    if (filter.startsWith('g:')) return (goals.find(g => g.id === filter.slice(2))||{}).color;
    if (filter.startsWith('p:')) return (PROJECTS.find(p => p.id === filter.slice(2))||{}).color;
    return null;
  };
  const pick = (v) => { setFilter(v); setFilterOpen(false); };

  const list = eligibleAll
    .filter(t => query === '' || t.title.toLowerCase().includes(query.toLowerCase()))
    .filter(matchesFilter);

  // Sort: overdue first, then by priority (p1>p2>p3), then alpha
  const prioOrder = { p1: 0, p2: 1, p3: 2 };
  list.sort((a, b) => {
    const ao = a.due === 'Overdue' ? 0 : 1;
    const bo = b.due === 'Overdue' ? 0 : 1;
    if (ao !== bo) return ao - bo;
    const ap = prioOrder[a.priority] ?? 3;
    const bp = prioOrder[b.priority] ?? 3;
    if (ap !== bp) return ap - bp;
    return a.title.localeCompare(b.title);
  });

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.32)',
      backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 90 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 'min(600px, 92%)', maxHeight: 'min(680px, 88%)',
        background: TOKENS.surface, borderRadius: TOKENS.radiusLg, border: `1px solid ${TOKENS.line}`,
        boxShadow: '0 40px 90px rgba(20,30,20,0.22)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        fontFamily: TOKENS.fontSans, color: TOKENS.ink }}>
        <div style={{ padding: '14px 14px 14px 18px', borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pin size={14} style={{ color: TOKENS.teal }}/>
          <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>Add to Focus</div>
          <div style={{ fontSize: 11.5, color: TOKENS.sub, fontVariantNumeric: 'tabular-nums' }}>{selected.size} selected</div>
          <button onClick={confirm} disabled={selected.size===0}
            style={{ ...btnReset, padding: '7px 14px', borderRadius: 999,
              background: selected.size===0 ? TOKENS.greenSoft : TOKENS.green,
              color: selected.size===0 ? TOKENS.sub : '#fff',
              fontSize: 12, fontWeight: 500, opacity: selected.size===0 ? 0.6 : 1,
              cursor: selected.size===0 ? 'default' : 'pointer' }}>Save</button>
          <button onClick={onClose} aria-label="Close" style={{ ...btnReset, color: TOKENS.sub, width: 28, height: 28, display:'grid', placeItems:'center', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}><Close size={13}/></button>
        </div>
        <div style={{ padding: '12px 18px 10px', borderBottom: `1px solid ${TOKENS.lineSoft}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: 999, padding: '6px 12px' }}>
            <Search size={12} style={{ color: TOKENS.sub }}/>
            <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your tasks…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit', color: TOKENS.ink }}/>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <button onClick={()=>setFilterOpen(o=>!o)}
                style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                  background: filter==='all' ? TOKENS.bg : TOKENS.tealTint,
                  border: `1px solid ${filter==='all' ? TOKENS.line : TOKENS.tealSoft}`,
                  borderRadius: 999, padding: '9px 12px 9px 14px', fontSize: 13, color: TOKENS.ink,
                  cursor: 'pointer' }}>
                <span style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, display: 'grid', placeItems: 'center',
                  background: filterColor() || (filter==='none' ? TOKENS.subSoft : TOKENS.green),
                  color: '#fff' }}>
                  {filter==='all' ? <ListTodo size={10}/> : filter==='none' ? <Dot size={9}/> : filter.startsWith('g:') ? <Target size={10}/> : <Folder size={10}/>}
                </span>
                <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: filter==='all' ? 400 : 500 }}>{filterLabel()}</span>
                <ChevD size={14} style={{ color: TOKENS.sub, flexShrink: 0, transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/>
              </button>
              {filterOpen && (
                <>
                  <div onClick={()=>setFilterOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1 }}/>
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 2,
                    background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius,
                    boxShadow: '0 20px 50px rgba(20,30,20,0.2)', overflow: 'hidden', maxHeight: 320, overflowY: 'auto' }}>
                    <FilterOption active={filter==='all'} onClick={()=>pick('all')}
                      icon={<span style={{ width: 18, height: 18, borderRadius: 5, background: TOKENS.green, color: '#fff', display: 'grid', placeItems: 'center' }}><ListTodo size={11}/></span>}
                      label="All tasks" count={eligibleAll.length}/>
                    <FilterOption active={filter==='none'} onClick={()=>pick('none')}
                      icon={<span style={{ width: 18, height: 18, borderRadius: 5, background: TOKENS.subSoft, color: '#fff', display: 'grid', placeItems: 'center' }}><Dot size={10}/></span>}
                      label="Standalone" sub="not in a project or goal"
                      count={eligibleAll.filter(t=>!t.projectId).length}/>
                    {goals.length > 0 && <FilterGroupLabel>Goals</FilterGroupLabel>}
                    {goals.map(g => (
                      <FilterOption key={g.id} active={filter==='g:'+g.id} onClick={()=>pick('g:'+g.id)}
                        icon={<span style={{ width: 18, height: 18, borderRadius: 5, background: g.color, color: '#fff', display: 'grid', placeItems: 'center' }}><Target size={11}/></span>}
                        label={g.name}
                        count={eligibleAll.filter(t=>{const pr=PROJECTS.find(p=>p.id===t.projectId); return pr && (pr.goalIds||[]).includes(g.id);}).length}/>
                    ))}
                    <FilterGroupLabel>Projects</FilterGroupLabel>
                    {PROJECTS.map(p => (
                      <FilterOption key={p.id} active={filter==='p:'+p.id} onClick={()=>pick('p:'+p.id)}
                        icon={<span style={{ width: 18, height: 18, borderRadius: 5, background: p.color, color: '#fff', display: 'grid', placeItems: 'center' }}><Folder size={11}/></span>}
                        label={p.name}
                        count={eligibleAll.filter(t=>t.projectId===p.id).length}/>
                    ))}
                  </div>
                </>
              )}
            </div>
            <span style={{ fontSize: 11.5, color: TOKENS.sub, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{list.length} {list.length===1?'task':'tasks'}</span>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '6px 0' }}>
          {list.length === 0 && (
            <div style={{ padding: '28px 18px', textAlign: 'center', color: TOKENS.sub, fontSize: 13 }}>
              {query ? 'Nothing matches that.' : 'Nothing here — try another filter.'}
            </div>
          )}
          {list.map(t => {
            const checked = selected.has(t.id);
            const project = PROJECTS.find(p => p.id === t.projectId);
            const tGoals = app.goalsForTask ? app.goalsForTask(t.id) : [];
            return (
              <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', cursor: 'pointer',
                background: checked ? TOKENS.tealTint : 'transparent', borderTop: `1px solid ${TOKENS.lineSoft}` }}>
                <button type="button" onClick={()=>toggle(t.id)} style={{ ...btnReset, width: 18, height: 18, borderRadius: 4,
                  border: `1.5px solid ${checked ? TOKENS.teal : TOKENS.line}`,
                  background: checked ? TOKENS.teal : 'transparent', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {checked && <Check size={11} stroke={2.5}/>}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, lineHeight: 1.35 }}>{t.title}</div>
                  <div style={{ fontSize: 10.5, color: TOKENS.sub, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {project && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: project.color }}/>{project.name}
                      </span>
                    )}
                    {tGoals.map(g => <GoalChip key={g.id} goal={g} primary={app.primaryGoalId === g.id} compact/>)}
                  </div>
                </div>
                <PriorityDot p={t.priority}/>
                <span style={{ fontSize: 10.5, color: t.due === 'Overdue' ? TOKENS.warn : TOKENS.sub, minWidth: 52, textAlign: 'right' }}>{t.due}</span>
              </label>
            );
          })}
        </div>
        <div style={{ padding: '10px 18px', borderTop: `1px solid ${TOKENS.line}`, fontSize: 11, color: TOKENS.sub, textAlign: 'center' }}>
          These keep their home — they just also live on Focus today.
        </div>
      </div>
    </div>
  );
}

// ——— Ask Zen overlay (summoned) ———
function AskZenOverlay({ open, onClose, app }) {
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
  const submit = (e) => { e.preventDefault(); const t = text.trim(); if (!t || busy) return; setText(''); send(t); };
  const suggestions = ["What should I start with today?", "Any projects I'm avoiding?", "Remind me why this matters."];
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.22)',
      backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'start center', paddingTop: 90, zIndex: 80 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 'min(520px, 92%)', maxHeight: 'calc(100% - 120px)',
        background: TOKENS.surface, borderRadius: TOKENS.radiusLg, border: `1px solid ${TOKENS.line}`,
        boxShadow: '0 40px 80px rgba(20,30,20,0.2)', overflow: 'hidden',
        fontFamily: TOKENS.fontSans, color: TOKENS.ink, display: 'flex', flexDirection: 'column' }}>
        <form onSubmit={submit} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: `1px solid ${TOKENS.line}` }}>
          <Sparkles size={16} style={{ color: TOKENS.teal }}/>
          <input ref={inputRef} value={text} onChange={e=>setText(e.target.value)} placeholder="Ask Zen anything…" disabled={busy}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 15, color: TOKENS.ink }}/>
          <span style={{ fontSize: 10, color: TOKENS.sub, fontFamily: TOKENS.fontMono, padding: '3px 7px', borderRadius: 5, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}>esc</span>
        </form>
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => <ChatBubble key={i} m={m}/>)}
          {busy && <ChatBubble m={{role:'assistant', text: <ThinkingDots/>}}/>}
        </div>
        <div style={{ padding: '10px 14px 14px', borderTop: `1px solid ${TOKENS.line}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} disabled={busy}
              style={{ ...btnReset, padding: '6px 10px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11.5 }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ m }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0,
        background: m.role === 'assistant' ? TOKENS.tealSoft : TOKENS.bg,
        color: m.role === 'assistant' ? TOKENS.teal : TOKENS.sub, display: 'grid', placeItems: 'center' }}>
        {m.role === 'assistant' ? <Sparkles size={11}/> : <User size={11}/>}
      </div>
      <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.55, color: m.role === 'assistant' ? TOKENS.ink : TOKENS.sub,
        fontStyle: m.role === 'user' ? 'italic' : 'normal' }}>{m.text}</div>
    </div>
  );
}

function ThinkingDots() {
  const [n, setN] = useState(1);
  useEffect(() => { const id = setInterval(()=>setN(x=>x%3+1), 420); return () => clearInterval(id); }, []);
  return <span style={{ fontFamily: TOKENS.fontMono, letterSpacing: 2 }}>{'·'.repeat(n)}</span>;
}

// ——— Persistent Zen corner companion ———
function ZenCorner({ app, onExpand }) {
  // collapsed leaf in corner; click to open a tiny card with one nudge + ask-zen button
  const [open, setOpen] = useState(false);
  if (app?.density === 'calm') return null;
  // Prefer a quiet-goal nudge if the user's non-primary goal is aging.
  const quietGoal = (app?.goals || GOALS).find(g => g.id !== app?.primaryGoalId && /\d+\s+days/.test(g.lastTouched || '') && parseInt(g.lastTouched, 10) >= 14);
  const quietGoalNudge = ZEN_NUDGES.find(n => n.kind === 'quiet-goal');
  const nudge = (quietGoal && quietGoalNudge) ? quietGoalNudge : ZEN_NUDGES.find(n => n.kind !== 'quiet-goal') || ZEN_NUDGES[0];
  if (!open) {
    return (
      <button onClick={()=>setOpen(true)} style={{ ...btnReset, position: 'absolute', bottom: 18, right: 18, zIndex: 60,
        width: 44, height: 44, borderRadius: 999, background: TOKENS.teal, color: '#fff',
        display: 'grid', placeItems: 'center', boxShadow: '0 8px 24px rgba(42,138,138,0.3)' }}>
        <Sparkles size={16}/>
        <span style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 999, background: TOKENS.warn, border: '2px solid '+TOKENS.bg }}/>
      </button>
    );
  }
  return (
    <div style={{ position: 'absolute', bottom: 18, right: 18, zIndex: 60, width: 280,
      background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radiusLg,
      boxShadow: '0 20px 60px rgba(20,30,20,0.18)', overflow: 'hidden', fontFamily: TOKENS.fontSans }}>
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${TOKENS.lineSoft}` }}>
        <div style={{ width: 22, height: 22, borderRadius: 999, background: TOKENS.tealSoft, color: TOKENS.teal, display: 'grid', placeItems: 'center' }}><Sparkles size={11}/></div>
        <div style={{ flex: 1, fontSize: 12, fontWeight: 500, color: TOKENS.ink }}>Zen · {nudge.when}</div>
        <button onClick={()=>setOpen(false)} style={{ ...btnReset, color: TOKENS.sub }}><Close size={13}/></button>
      </div>
      <div style={{ padding: '12px 14px', fontSize: 13, lineHeight: 1.5, color: TOKENS.ink }}>{nudge.text}</div>
      <div style={{ padding: '8px 14px 12px', display: 'flex', gap: 6 }}>
        <button onClick={onExpand} style={{ ...btnReset, flex: 1, padding: '7px 10px', borderRadius: 999,
          background: TOKENS.teal, color: '#fff', fontSize: 11.5, fontWeight: 500 }}>Open chat</button>
        <button onClick={()=>setOpen(false)} style={{ ...btnReset, padding: '7px 10px', borderRadius: 999,
          background: TOKENS.bg, color: TOKENS.sub, fontSize: 11.5 }}>Not now</button>
      </div>
    </div>
  );
}

// ——— Command palette / quick-find (⌘P) — jump to any screen, goal, project, category, or task ———
function CommandPalette({ open, onClose, app, onNav }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { if (open) { setQ(''); setActive(0); const t = setTimeout(()=>inputRef.current && inputRef.current.focus(), 30); return ()=>clearTimeout(t); } }, [open]);
  if (!open) return null;
  const goals = app.goals || GOALS;
  const navAll = [
    { key: 'today', label: 'Focus', sub: 'Pinned for today', icon: Home },
    { key: 'agenda', label: 'Today', sub: 'Scheduled for today', icon: CalToday },
    { key: 'calendar', label: 'Calendar', sub: 'Schedule · month view', icon: CalMonth },
    { key: 'categories', label: 'Categories', sub: 'Everyday buckets', icon: Grid },
    { key: 'zen', label: 'Ask Zen', sub: 'AI companion', icon: Sparkles },
    { key: 'review', label: 'Weekly review', sub: 'Reflect on the week', icon: Flame },
    { key: 'settings', label: 'Settings', sub: 'Preferences · AI mode', icon: Settings },
    ...goals.map(g => ({ key: 'goal:'+g.id, label: g.name, sub: 'Goal', color: g.color })),
    ...(app.projects || PROJECTS).map(p => ({ key: 'project:'+p.id, label: p.name, sub: 'Project', color: p.color })),
    ...app.categories.map(c => ({ key: 'categories:'+c.id, label: c.name, sub: 'Category', color: c.color })),
  ].map(i => ({ ...i, kind: 'nav', run: () => onNav(i.key) }));
  const ql = q.trim().toLowerCase();
  const has = (s) => s && s.toLowerCase().includes(ql);
  const navResults = ql ? navAll.filter(i => has(i.label) || has(i.sub)) : navAll;
  const taskResults = ql ? app.tasks.filter(t => has(t.title)).slice(0, 8).map(t => {
    const p = (app.projectById ? app.projectById(t.projectId) : PROJECTS.find(p => p.id === t.projectId)); const c = t.categoryId ? app.categoryById(t.categoryId) : null;
    return { key: 'task:'+t.id, kind: 'task', label: t.title, sub: p ? p.name : (c ? c.name : 'Standalone task'), color: p ? p.color : (c ? c.color : null), done: t.done, run: () => app.openTask(t.id) };
  }) : [];
  const all = [...navResults, ...taskResults];
  const aIdx = all.length ? Math.min(active, all.length - 1) : 0;
  const run = (it) => { onClose(); it.run(); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, all.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (all[aIdx]) run(all[aIdx]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };
  const lead = (item) => {
    if (item.icon) { const Icon = item.icon; return <span style={{ width: 26, height: 26, borderRadius: 7, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon size={14}/></span>; }
    return <span style={{ width: 26, height: 26, borderRadius: 7, display: 'grid', placeItems: 'center', flexShrink: 0, background: (item.color || TOKENS.green) + '22' }}><span style={{ width: 9, height: 9, borderRadius: 999, background: item.color || TOKENS.green }}/></span>;
  };
  const row = (item, i) => {
    const on = i === aIdx;
    return (
      <button key={item.key} onMouseMove={()=>setActive(i)} onClick={()=>run(item)}
        style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 14px', textAlign: 'left', cursor: 'pointer', background: on ? TOKENS.greenTint : 'transparent' }}>
        {lead(item)}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, color: TOKENS.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</div>
          <div style={{ fontSize: 11, color: TOKENS.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</div>
        </div>
        <span style={{ fontSize: 9.5, color: on ? TOKENS.green : TOKENS.subSoft, textTransform: 'uppercase', letterSpacing: 1, fontFamily: TOKENS.fontMono }}>{item.kind === 'task' ? 'Open' : 'Go'}</span>
      </button>
    );
  };
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.28)', backdropFilter: 'blur(5px)', display: 'grid', placeItems: 'start center', paddingTop: 80, zIndex: 96 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 'min(560px, 92%)', maxHeight: 'calc(100% - 130px)', background: TOKENS.surface, borderRadius: TOKENS.radiusLg, border: `1px solid ${TOKENS.line}`, boxShadow: '0 40px 90px rgba(20,30,20,0.24)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: TOKENS.fontSans }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 16px', borderBottom: `1px solid ${TOKENS.line}` }}>
          <Search size={16} style={{ color: TOKENS.sub }}/>
          <input ref={inputRef} value={q} onChange={e=>{ setQ(e.target.value); setActive(0); }} onKeyDown={onKey}
            placeholder="Search screens, goals, projects, tasks…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 15, color: TOKENS.ink }}/>
          <span style={{ fontSize: 10, color: TOKENS.sub, fontFamily: TOKENS.fontMono, padding: '3px 7px', borderRadius: 5, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}>esc</span>
        </div>
        <div style={{ overflow: 'auto', padding: '6px 0' }}>
          {navResults.length > 0 && <div style={{ padding: '8px 16px 4px' }}><SectionLabel>Jump to</SectionLabel></div>}
          {navResults.map((it, i) => row(it, i))}
          {taskResults.length > 0 && <div style={{ padding: '10px 16px 4px', borderTop: `1px solid ${TOKENS.lineSofter}` }}><SectionLabel>Tasks</SectionLabel></div>}
          {taskResults.map((it, i) => row(it, navResults.length + i))}
          {all.length === 0 && <div style={{ padding: '28px 16px', textAlign: 'center', color: TOKENS.sub, fontSize: 13 }}>No matches for "{q}".</div>}
        </div>
        <div style={{ padding: '9px 16px', borderTop: `1px solid ${TOKENS.line}`, display: 'flex', gap: 14, fontSize: 11, color: TOKENS.sub }}>
          <span><b style={{ fontFamily: TOKENS.fontMono }}>↑↓</b> move</span>
          <span><b style={{ fontFamily: TOKENS.fontMono }}>↵</b> open</span>
          <span><b style={{ fontFamily: TOKENS.fontMono }}>esc</b> close</span>
          <span style={{ flex: 1 }}/>
          <span>{all.length} result{all.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
}

// ——— Profiles: switcher + manager modal ———
const PROFILE_COLORS = ['#5a8a3a', '#2a6f8a', '#8a6a3a', '#7a4f8a', '#a06a3a', '#2a8a8a', '#9a4a4a', '#3a8a6e'];

function ProfileManager({ app, onClose }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PROFILE_COLORS[2]);
  const [confirmDel, setConfirmDel] = useState(null);
  const createIt = () => { const n = newName.trim(); if (!n) { setAdding(false); return; } const id = app.addProfile({ name: n, color: newColor }); app.switchProfile(id); setNewName(''); setAdding(false); onClose(); };
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.34)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 95, padding: 20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 'min(460px, 100%)', maxHeight: '100%', background: TOKENS.surface, borderRadius: TOKENS.radiusLg, border: `1px solid ${TOKENS.line}`, boxShadow: '0 40px 90px rgba(20,30,20,0.24)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: TOKENS.fontSans, color: TOKENS.ink }}>
        <div style={{ padding: '15px 16px 15px 18px', borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>Spaces</div>
          <button onClick={onClose} aria-label="Close" style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub }}><Close size={13}/></button>
        </div>
        <div style={{ padding: '8px 10px', overflow: 'auto' }}>
          {app.profiles.map(p => {
            const active = p.id === app.activeProfileId;
            const count = app.tasks.length; // only meaningful for active; show dot otherwise
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: TOKENS.radius, background: active ? TOKENS.greenTint : 'transparent' }}>
                <button onClick={()=>{ const next = PROFILE_COLORS[(PROFILE_COLORS.indexOf(p.color)+1) % PROFILE_COLORS.length]; app.updateProfile(p.id, { color: next }); }} title="Change colour"
                  style={{ ...btnReset, width: 22, height: 22, borderRadius: 7, background: p.color, flexShrink: 0, cursor: 'pointer', boxShadow: `0 0 0 2px ${TOKENS.surface}, 0 0 0 3px ${p.color}55` }}/>
                <input value={p.name} onChange={e=>app.updateProfile(p.id, { name: e.target.value })}
                  style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontFamily: 'inherit', color: TOKENS.ink, fontWeight: active ? 500 : 400 }}/>
                {active && <span style={{ fontSize: 10, color: TOKENS.green, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>Current</span>}
                {!active && <button onClick={()=>app.switchProfile(p.id)} style={{ ...btnReset, padding: '4px 10px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11 }}>Switch</button>}
                {confirmDel === p.id ? (
                  <span style={{ display: 'inline-flex', gap: 4 }}>
                    <button onClick={()=>{ app.deleteProfile(p.id); setConfirmDel(null); }} style={{ ...btnReset, padding: '4px 9px', borderRadius: 999, background: TOKENS.rose, color: '#fff', fontSize: 11 }}>Delete</button>
                    <button onClick={()=>setConfirmDel(null)} style={{ ...btnReset, padding: '4px 8px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11 }}>Keep</button>
                  </span>
                ) : (
                  <button onClick={()=>setConfirmDel(p.id)} disabled={app.profiles.length <= 1} title={app.profiles.length <= 1 ? 'Keep at least one space' : 'Delete space'}
                    style={{ ...btnReset, width: 26, height: 26, borderRadius: 999, display: 'grid', placeItems: 'center', color: app.profiles.length <= 1 ? TOKENS.subSoft : TOKENS.sub, opacity: app.profiles.length <= 1 ? 0.4 : 1, cursor: app.profiles.length <= 1 ? 'default' : 'pointer' }}><Trash size={13}/></button>
                )}
              </div>
            );
          })}
          {adding ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px' }}>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {PROFILE_COLORS.slice(0, 4).map(c => <button key={c} onClick={()=>setNewColor(c)} style={{ ...btnReset, width: 18, height: 18, borderRadius: 5, background: c, cursor: 'pointer', boxShadow: newColor === c ? `0 0 0 2px ${TOKENS.surface}, 0 0 0 3px ${c}` : 'none' }}/>)}
              </div>
              <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>{ if (e.key==='Enter') createIt(); if (e.key==='Escape') setAdding(false); }} placeholder="Space name… e.g. Work"
                style={{ flex: 1, minWidth: 0, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, background: TOKENS.bg, padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', color: TOKENS.ink, outline: 'none' }}/>
              <button onClick={createIt} style={{ ...btnReset, padding: '6px 12px', borderRadius: 999, background: TOKENS.green, color: '#fff', fontSize: 11.5, fontWeight: 500 }}>Create</button>
            </div>
          ) : (
            <button onClick={()=>setAdding(true)} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px', borderRadius: TOKENS.radius, color: TOKENS.sub, fontSize: 13, cursor: 'pointer' }}>
              <span style={{ width: 22, height: 22, borderRadius: 7, border: `1.5px dashed ${TOKENS.line}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Plus size={12}/></span>New space
            </button>
          )}
        </div>
        <div style={{ padding: '12px 18px', borderTop: `1px solid ${TOKENS.line}`, fontSize: 11.5, color: TOKENS.sub, lineHeight: 1.5 }}>
          Each space keeps its own tasks, projects, categories and goals — nothing crosses over.
        </div>
      </div>
    </div>
  );
}

function ProfileSwitcher({ app, compact }) {
  const [open, setOpen] = useState(false);
  const ap = app.activeProfile;
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '5px 7px', borderRadius: 9, cursor: 'pointer', background: open ? TOKENS.bg : 'transparent' }}
        onMouseEnter={e=>{ if (!open) e.currentTarget.style.background = TOKENS.bg; }} onMouseLeave={e=>{ if (!open) e.currentTarget.style.background = 'transparent'; }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: ap.color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 13, fontWeight: 600 }}>{ap.name[0].toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <div style={{ fontSize: 9, color: TOKENS.sub, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>Space</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: -0.2, color: TOKENS.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ap.name}</div>
        </div>
        <ChevD size={14} style={{ color: TOKENS.sub, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/>
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }}/>
          <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, zIndex: 61, background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, boxShadow: '0 18px 44px rgba(20,30,20,0.2)', overflow: 'hidden', padding: 4 }}>
            {app.profiles.map(p => {
              const active = p.id === app.activeProfileId;
              return (
                <button key={p.id} onClick={()=>{ app.switchProfile(p.id); setOpen(false); }} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 7, cursor: 'pointer', background: active ? TOKENS.greenTint : 'transparent', textAlign: 'left' }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: p.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{p.name[0].toUpperCase()}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: TOKENS.ink }}>{p.name}</span>
                  {active && <Check size={13} stroke={2.5} style={{ color: TOKENS.green, flexShrink: 0 }}/>}
                </button>
              );
            })}
            <div style={{ height: 1, background: TOKENS.lineSoft, margin: '4px 0' }}/>
            <button onClick={()=>{ setOpen(false); app.openManageSpaces(); }} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 7, cursor: 'pointer', color: TOKENS.sub, fontSize: 12.5 }}>
              <span style={{ width: 20, display: 'grid', placeItems: 'center' }}><Settings size={13}/></span>Manage spaces
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Shared project-nav model used by both the desktop sidebar and the mobile sheet:
// pinned projects held at top (stable order), the rest sorted by real last-active recency,
// with dormant (>30d) + beyond-cap rows flagged hidden so callers can collapse them.
function buildProjectNav(app) {
  const base = (app?.projects || PROJECTS).filter(p => (app?.statusOf ? app.statusOf(p.id) : p.status) !== 'parked');
  const pinnedOf = (id) => app?.isProjectPinned ? app.isProjectPinned(id) : false;
  const rec = app?.navRecency || {};
  const score = (p) => {
    if (rec[p.id]) return rec[p.id];
    const d = lastActiveDays(p.lastActive);
    return d == null ? Date.now() : Date.now() - d * 86400000;
  };
  const sortByRec = (list) => list.map((p, i) => [p, score(p), i]).sort((a, b) => (b[1] - a[1]) || (a[2] - b[2])).map(([p]) => p);
  const mapProj = (p) => {
    const d = lastActiveDays(p.lastActive);
    return { id: 'project:'+p.id, pid: p.id, name: p.name, color: p.color,
      status: (app?.statusOf ? app.statusOf(p.id) : p.status),
      noGoal: (app?.goalIdsOf ? app.goalIdsOf(p.id).length === 0 : (p.goalIds||[]).length === 0),
      dormant: d != null && d > PROJECT_STALE_DAYS, pinned: pinnedOf(p.id) };
  };
  const pinned = base.filter(p => pinnedOf(p.id)).map(mapProj); // stable order — pinning is for memory
  const loose = sortByRec(base.filter(p => !pinnedOf(p.id))).map(mapProj);
  const fresh = loose.filter(c => !c.dormant);
  const dormant = loose.filter(c => c.dormant);
  const hiddenIds = new Set([...fresh.slice(MAX_SIDEBAR_PROJECTS), ...dormant].map(c => c.id));
  return { children: [...pinned, ...fresh, ...dormant], hiddenIds };
}

// ——— Sidebar (desktop) ———
function Sidebar({ active, onNav, app, onSearch }) {
  // The whole Screen (and this Sidebar) remounts on every navigation, so the nav's
  // scroll position is restored from a module-level cache on mount and kept in sync on scroll.
  const navScrollRef = useRef(null);
  const restoreNavScroll = (el) => {
    navScrollRef.current = el;
    if (el) el.scrollTop = Sidebar._navScroll || 0;
  };
  const [newProjOpen, setNewProjOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [navExpanded, setNavExpanded] = useState({}); // per-section "show more" state
  const NAV_CAP = 5;
  // Most-recently-used first; untouched items keep their seeded order.
  const byRecency = (list, idOf) => {
    const rec = app?.navRecency || {};
    return list.map((x, i) => [x, rec[idOf(x)] || 0, i])
      .sort((a, b) => (b[1] - a[1]) || (a[2] - b[2]))
      .map(([x]) => x);
  };
  const goalChildren = byRecency(app?.goals || GOALS, g => g.id).map(g => ({
    id: 'goal:'+g.id, name: g.name, color: g.color,
    primary: app?.primaryGoalId === g.id,
    stale: g.lastTouched && /day|week|month/.test(g.lastTouched) && parseInt(g.lastTouched, 10) >= 14,
  }));
  // Projects: pinned at top + recency order + dormant/overflow collapse (shared with mobile).
  const { children: projChildren, hiddenIds: projHiddenIds } = buildProjectNav(app);
  const catChildren = (app?.categories || CATEGORIES).map(c => ({ id: 'categories:'+c.id, name: c.name, color: c.color }));
  const items = [
    { id: 'today', name: 'Focus', icon: Home },
    { id: 'agenda', name: 'Today', icon: CalToday },
    { id: 'calendar', name: 'Calendar', icon: CalMonth },
    { id: 'goal', name: 'Goals', icon: Target, children: goalChildren, alwaysOpen: true, capped: true },
    { id: 'project', name: 'Projects', icon: Folder, alwaysOpen: true, hiddenIds: projHiddenIds, children: projChildren },
    { id: 'categories', name: 'Categories', icon: Grid, children: catChildren },
    { id: 'zen', name: 'Ask Zen', icon: Sparkles, teal: true },
    { id: 'review', name: 'Weekly review', icon: Flame },
  ];
  return (
    <aside style={{ width: 240, background: TOKENS.surface, borderRight: `1px solid ${TOKENS.line}`,
      padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, overflow: 'hidden' }}>
      <div data-tour="spaces" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 2px 12px', flexShrink: 0 }}>
        <ProfileSwitcher app={app}/>
        <button data-tour="search" onClick={onSearch} style={{ ...btnReset, color: TOKENS.sub, width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', flexShrink: 0 }} title="Search (⌘P)"><Search size={14}/></button>
      </div>
      <button data-tour="newtask" onClick={()=>app.openQuickAdd()} style={{ ...btnReset, flexShrink: 0, marginBottom: 10, width: '100%',
        display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: TOKENS.radius, background: TOKENS.green, color: '#fff',
        fontSize: 13, fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 2px rgba(20,30,20,0.12)' }}
        onMouseEnter={e=>{ e.currentTarget.style.opacity = 0.92; }} onMouseLeave={e=>{ e.currentTarget.style.opacity = 1; }}>
        <span style={{ width: 18, height: 18, borderRadius: 999, background: 'rgba(255,255,255,0.22)', display: 'grid', placeItems: 'center' }}><Plus size={12}/></span>
        New task
        <span style={{ marginLeft: 'auto', fontSize: 10.5, opacity: 0.8, fontFamily: TOKENS.fontMono }}>N</span>
      </button>
      <div ref={restoreNavScroll} onScroll={(e)=>{ Sidebar._navScroll = e.currentTarget.scrollTop; }} data-tour="nav" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, margin: '0 -4px', padding: '0 4px' }}>
      {items.map(it => {
        const Icon = it.icon;
        const isActive = active === it.id || active?.startsWith(it.id+':');
        const showChildren = it.children && (isActive || it.alwaysOpen);
        const expanded = !!navExpanded[it.id];
        let visibleChildren = it.children;
        let overflow = 0;
        if (showChildren && it.hiddenIds && it.children) {
          // Projects: hide dormant + beyond-cap rows behind "show more" (active stays visible).
          overflow = it.hiddenIds.size;
          if (overflow > 0 && !expanded) {
            visibleChildren = it.children.filter(c => !it.hiddenIds.has(c.id) || c.id === active);
          }
        } else if (it.capped && it.children) {
          // Goals: cap long lists at NAV_CAP; the active child is always kept visible.
          overflow = Math.max(0, it.children.length - NAV_CAP);
          if (showChildren && overflow > 0 && !expanded) {
            visibleChildren = it.children.slice(0, NAV_CAP);
            const activeChild = it.children.find(c => c.id === active);
            if (activeChild && !visibleChildren.includes(activeChild)) visibleChildren = [...visibleChildren.slice(0, NAV_CAP - 1), activeChild];
          }
        }
        return (
          <React.Fragment key={it.id}>
            <button onClick={()=>onNav(it.id)} style={{ ...btnReset, display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8, textAlign: 'left',
              background: isActive ? (it.teal ? TOKENS.tealSoft : TOKENS.greenSoft) : 'transparent',
              color: isActive ? (it.teal ? TOKENS.tealDeep : TOKENS.green) : TOKENS.ink,
              fontSize: 13, fontWeight: isActive ? 500 : 400 }}>
              <Icon size={14}/>{it.name}
            </button>
            {showChildren && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '2px 0 6px 16px' }}>
                {visibleChildren.map(c => it.id === 'project' ? (
                  <div key={c.id} className="zen-proj-row" style={{ display: 'flex', alignItems: 'center', borderRadius: 6,
                    background: active === c.id ? TOKENS.greenTint : 'transparent' }}>
                    <button onClick={()=>onNav(c.id)} style={{ ...btnReset, flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 4px 6px 10px', borderRadius: 6, textAlign: 'left',
                      color: active === c.id ? TOKENS.green : TOKENS.sub, fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: c.color, flexShrink: 0 }}/>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                      {c.dormant && <Moon size={11} style={{ color: TOKENS.subSoft }}/>}
                      {c.noGoal && <span title="Not linked to a goal" style={{ fontSize: 9, color: TOKENS.subSoft, background: TOKENS.bgSoft, border: `1px solid ${TOKENS.line}`, padding: '1px 6px', borderRadius: 999, flexShrink: 0 }}>No goal</span>}
                      {c.status === 'quiet' && <span style={{ width: 5, height: 5, borderRadius: 999, background: TOKENS.teal, flexShrink: 0 }}/>}
                    </button>
                    <button onClick={(e)=>{ e.stopPropagation(); app.togglePinProject && app.togglePinProject(c.pid); }}
                      title={c.pinned ? 'Pinned — click to unpin' : 'Pin to keep in place'}
                      className={c.pinned ? undefined : 'zen-row-more'}
                      style={{ ...btnReset, width: 24, height: 24, marginRight: 4, borderRadius: 999, display: 'grid', placeItems: 'center',
                        flexShrink: 0, cursor: 'pointer', color: c.pinned ? TOKENS.teal : TOKENS.subSoft,
                        background: c.pinned ? TOKENS.tealSoft : 'transparent', transform: c.pinned ? 'none' : 'rotate(40deg)' }}>
                      <Pin size={12}/>
                    </button>
                  </div>
                ) : (
                  <button key={c.id} onClick={()=>onNav(c.id)} style={{ ...btnReset, display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 10px', borderRadius: 6, textAlign: 'left',
                    background: active === c.id ? TOKENS.greenTint : 'transparent',
                    color: active === c.id ? TOKENS.green : TOKENS.sub, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: c.color, flexShrink: 0 }}/>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    {c.noGoal && <span title="Not linked to a goal" style={{ fontSize: 9, color: TOKENS.subSoft, background: TOKENS.bgSoft, border: `1px solid ${TOKENS.line}`, padding: '1px 6px', borderRadius: 999, flexShrink: 0 }}>No goal</span>}
                    {c.primary && <span title="Primary goal" style={{ fontSize: 9, color: TOKENS.green, fontWeight: 600, letterSpacing: 0.6 }}>★</span>}
                    {c.status === 'quiet' && <span style={{ width: 5, height: 5, borderRadius: 999, background: TOKENS.teal }}/>}
                  </button>
                ))}
                {overflow > 0 && (
                  <button onClick={()=>setNavExpanded(m => ({ ...m, [it.id]: !expanded }))}
                    style={{ ...btnReset, display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 6, color: TOKENS.subSoft, fontSize: 11.5, cursor: 'pointer' }}>
                    <ChevD size={11} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/>
                    {expanded ? 'Show less' : `Show ${overflow} more`}
                  </button>
                )}
                {it.id === 'goal' && (newGoalOpen ? (
                  <form onSubmit={(e)=>{ e.preventDefault(); const n = newGoalName.trim(); if (n && app.addGoal) { const id = app.addGoal({ name: n }); onNav('goal:'+id); } setNewGoalName(''); setNewGoalOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, border: `1.5px dashed ${TOKENS.green}`, flexShrink: 0 }}/>
                    <input autoFocus value={newGoalName} onChange={e=>setNewGoalName(e.target.value)} onBlur={()=>{ if (!newGoalName.trim()) setNewGoalOpen(false); }} placeholder="Goal name…"
                      style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 12, fontFamily: 'inherit', color: TOKENS.ink }}/>
                  </form>
                ) : (
                  <button onClick={()=>setNewGoalOpen(true)} style={{ ...btnReset, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, color: TOKENS.sub, fontSize: 12, cursor: 'pointer' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, border: `1.5px dashed ${TOKENS.subSoft}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}/>
                    <Plus size={11}/>New goal
                  </button>
                ))}
                {it.id === 'project' && (newProjOpen ? (
                  <form onSubmit={(e)=>{ e.preventDefault(); const n = newProjName.trim(); if (n && app.addProject) { const id = app.addProject({ name: n }); onNav('project:'+id); } setNewProjName(''); setNewProjOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, border: `1.5px dashed ${TOKENS.green}`, flexShrink: 0 }}/>
                    <input autoFocus value={newProjName} onChange={e=>setNewProjName(e.target.value)} onBlur={()=>{ if (!newProjName.trim()) setNewProjOpen(false); }} placeholder="Project name…"
                      style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 12, fontFamily: 'inherit', color: TOKENS.ink }}/>
                  </form>
                ) : (
                  <button onClick={()=>setNewProjOpen(true)} style={{ ...btnReset, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, color: TOKENS.sub, fontSize: 12, cursor: 'pointer' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, border: `1.5px dashed ${TOKENS.subSoft}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}/>
                    <Plus size={11}/>New project
                  </button>
                ))}
              </div>
            )}
          </React.Fragment>
        );
      })}
      </div>
      <div style={{ flexShrink: 0, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div data-tour="aimode" style={{ padding: '10px 12px', background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 10.5, color: TOKENS.sub, flex: 1 }}>AI mode</div>
          <button onClick={()=>app.setAiMode(app.aiMode === 'assistant' ? 'manager' : 'assistant')}
            style={{ ...btnReset, display: 'flex', background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: 999, padding: 2 }}>
            {['assistant','manager'].map(m => (
              <span key={m} style={{ padding: '3px 9px', borderRadius: 999, fontSize: 10.5, fontWeight: 500, textTransform: 'capitalize',
                background: app.aiMode === m ? (m==='manager'?TOKENS.teal:TOKENS.green) : 'transparent',
                color: app.aiMode === m ? '#fff' : TOKENS.sub }}>{m}</span>
            ))}
          </button>
        </div>
        <button onClick={()=>onNav('settings')} style={{ ...btnReset, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
          color: TOKENS.sub, fontSize: 12.5 }}><Settings size={13}/>Settings</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', fontSize: 12, color: TOKENS.sub }}>
          <div style={{ width: 22, height: 22, borderRadius: 999, background: TOKENS.tealSoft, display: 'grid', placeItems: 'center', color: TOKENS.teal }}><User size={11}/></div>
          <span style={{ flex: 1 }}>sam@hey.com</span>
        </div>
      </div>
    </aside>
  );
}

// ——— Transient toast shown when AI mode changes ———
function NotificationToast({ app }) {
  const note = app && app.modeToast;
  const noteId = note && note.id;
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { setExpanded(false); }, [noteId]);
  const stop = () => app && app.pauseModeToast && app.pauseModeToast();
  if (!note) return null;
  const meta = NOTIF_ICON[note.kind] || NOTIF_ICON.ai;
  const Icon = meta.Icon;
  return (
    <div onPointerDown={stop} onMouseEnter={stop}
      style={{ position: 'absolute', top: 16, right: 16, zIndex: 75, width: 330,
        background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radiusLg,
        boxShadow: '0 24px 60px rgba(20,30,20,0.24)', overflow: 'hidden', fontFamily: TOKENS.fontSans,
        animation: 'zenToastIn 0.32s cubic-bezier(0.2,0.8,0.2,1)' }}>
      <div style={{ padding: '13px 14px', display: 'flex', gap: 11 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: meta.bg, color: meta.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon size={15}/></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, flex: 1, lineHeight: 1.3 }}>{note.title}</div>
            <button onClick={()=>app.dismissModeToast()} style={{ ...btnReset, color: TOKENS.sub }}><Close size={13}/></button>
          </div>
          <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginTop: 4, lineHeight: 1.5 }}>{note.summary}</div>
          {expanded && (
            <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginTop: 8, lineHeight: 1.6, whiteSpace: 'pre-wrap', borderTop: `1px solid ${TOKENS.lineSoft}`, paddingTop: 8 }}>{note.body}</div>
          )}
          <button onClick={()=>{ stop(); setExpanded(e=>!e); }} style={{ ...btnReset, fontSize: 11, color: TOKENS.teal, marginTop: 7, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            {expanded ? <>Show less <ChevD size={10} style={{ transform: 'rotate(180deg)' }}/></> : <>What changes? <ChevD size={10}/></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ——— Notifications bell + panel ———
const NOTIF_ICON = {
  ai: { Icon: Sparkles, color: TOKENS.teal, bg: TOKENS.tealSoft },
  quiet: { Icon: Moon, color: TOKENS.tealDeep, bg: TOKENS.tealTint },
  reminder: { Icon: Bell, color: TOKENS.green, bg: TOKENS.greenSoft },
  encouragement: { Icon: Leaf, color: TOKENS.green, bg: TOKENS.greenTint },
  'pin-dormant': { Icon: Pin, color: TOKENS.tealDeep, bg: TOKENS.tealSoft },
};

function NotificationsBell({ app, align = 'right', narrow = false }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const items = (app && app.notifications) || NOTIFICATIONS;
  const unread = items.filter(n => !n.read).length;

  const openItem = (id) => {
    setExpanded(e => e === id ? null : id);
    app && app.markNotifRead && app.markNotifRead(id);
  };
  const markAll = () => app && app.markAllNotifsRead && app.markAllNotifsRead();

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={()=>setOpen(o=>!o)} aria-label="Notifications" style={{ ...btnReset, width: 32, height: 32, borderRadius: 999,
        background: open ? TOKENS.greenSoft : TOKENS.bg, border: `1px solid ${open ? TOKENS.greenSoft : TOKENS.line}`,
        color: open ? TOKENS.green : TOKENS.sub, display: 'grid', placeItems: 'center', position: 'relative' }}>
        <Bell size={14}/>
        {unread > 0 && <span style={{ position: 'absolute', top: 4, right: 5, width: 8, height: 8, borderRadius: 999, background: TOKENS.teal, border: `2px solid ${TOKENS.surface}` }}/>}
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 70 }}/>
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', zIndex: 71,
            ...(narrow ? { right: -38, width: 300 } : { [align]: 0, width: 340 }),
            background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radiusLg,
            boxShadow: '0 24px 60px rgba(20,30,20,0.22)', overflow: 'hidden', fontFamily: TOKENS.fontSans, color: TOKENS.ink }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${TOKENS.lineSoft}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={13} style={{ color: TOKENS.green }}/>
              <div style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>Notifications</div>
              {unread > 0 && <button onClick={markAll} style={{ ...btnReset, fontSize: 11, color: TOKENS.teal }}>Mark all read</button>}
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {items.map(n => {
                const meta = NOTIF_ICON[n.kind] || NOTIF_ICON.reminder;
                const Icon = meta.Icon;
                const isOpen = expanded === n.id;
                return (
                  <div key={n.id} style={{ borderTop: `1px solid ${TOKENS.lineSoft}`, background: !n.read ? TOKENS.greenTint+'66' : 'transparent' }}>
                    <button onClick={()=>openItem(n.id)} style={{ ...btnReset, width: '100%', display: 'flex', gap: 11, padding: '12px 16px', textAlign: 'left', cursor: 'pointer' }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: meta.bg, color: meta.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon size={14}/></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: !n.read ? 600 : 500, flex: 1, lineHeight: 1.3 }}>{n.title}</div>
                          <span style={{ fontSize: 10, color: TOKENS.sub, whiteSpace: 'nowrap' }}>{n.when}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: TOKENS.sub, marginTop: 2, lineHeight: 1.4,
                          display: isOpen ? 'none' : '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.summary}</div>
                        {isOpen && (
                          <div style={{ fontSize: 12.5, color: TOKENS.inkSoft, marginTop: 8, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{n.body}</div>
                        )}
                        <div style={{ fontSize: 10.5, color: TOKENS.teal, marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          {isOpen ? <>Show less <ChevD size={10} style={{ transform: 'rotate(180deg)' }}/></> : <>Read more <ChevD size={10}/></>}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ——— TopBar (shared header inside a screen) ———
function TopBar({ crumbs, title, subtitle, right, app, onAsk }) {
  return (
    <header style={{ padding: '18px 30px 14px', borderBottom: `1px solid ${TOKENS.line}`,
      display: 'flex', alignItems: 'flex-end', gap: 16, flexShrink: 0 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {crumbs && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: TOKENS.sub, textTransform: 'uppercase', letterSpacing: 1.3, fontWeight: 500, marginBottom: 4 }}>
            {crumbs.map((c, i) => {
              const obj = c && typeof c === 'object';
              const label = obj ? c.label : c;
              const clickable = obj && c.onClick;
              return (
                <React.Fragment key={i}>
                  {i>0 && <ChevR size={10}/>}
                  {obj && c.node ? c.node : clickable ? (
                    <button onClick={c.onClick} style={{ ...btnReset, font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', color: TOKENS.sub, cursor: 'pointer', padding: 0, borderRadius: 3 }}
                      onMouseEnter={e=>{ e.currentTarget.style.color = TOKENS.green; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '2px'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.color = TOKENS.sub; e.currentTarget.style.textDecoration = 'none'; }}>{label}</button>
                  ) : <span>{label}</span>}
                </React.Fragment>
              );
            })}
          </div>
        )}
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: -0.3 }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: TOKENS.sub, marginTop: 3 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {right}
        <DensityToggle value={app.density} onChange={app.setDensity}/>
        <NotificationsBell app={app}/>
        <button data-tour="help" onClick={()=>app.startTour && app.startTour()} style={{ ...btnReset, width: 32, height: 32, borderRadius: 999,
          background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub,
          display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 600 }} title="Take the tour">?</button>
        <button data-tour="zen" onClick={onAsk} style={{ ...btnReset, width: 32, height: 32, borderRadius: 999,
          background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.teal,
          display: 'grid', placeItems: 'center' }} title="Ask Zen (⌘K)"><Sparkles size={14}/></button>

      </div>
    </header>
  );
}

export { PriorityDot, StaleBadge, QuietBadge, FocusPill, GoalChip, SectionLabel, DensityToggle, TaskRow, AskZenOverlay, AddToFocusModal, ChatBubble, ThinkingDots, ZenCorner, NotificationsBell, NotificationToast, CommandPalette, Sidebar, TopBar, buildProjectNav, ProfileManager };
