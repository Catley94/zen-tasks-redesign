// Global quick-add task modal — the fastest way to capture a task from anywhere.
// Title + a place picker (Uncategorised default · Projects · Categories) + an
// optional date and priority. Enter adds and keeps the modal open for rapid entry;
// Shift+Enter adds and opens the new task. Routed via app.quickAdd / openQuickAdd.

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { TOKENS, btnReset, PRIORITY_LABEL, PRIORITY_COLOR } from '../lib/tokens';
import { PROJECTS, PROJECT_SECTIONS, CATEGORIES } from '../lib/data';
import { Close, Check, Plus, Edit, Trash, ChevD, ChevL, ChevR, Clock, Calendar, CalToday, Bell, Dot } from '../components/icons';
import { MONTHS, WEEK_HEADERS, isToday, sameMonth, monthMatrix, keyOf, parseKey, todayKey, friendlyDue } from '../lib/dates';
import { PriorityDot } from '../components/primitives';
import { CatIcon } from '../screens/categories';

const QA_PRIORITIES = ['seedling', 'growing', 'rooted', 'falling'];

function QuickAddPlacePicker({ app, place, onChange }) {
  const [open, setOpen] = useState(false);
  const project = place.projectId ? app.projectById(place.projectId) : null;
  const category = place.categoryId ? app.categoryById(place.categoryId) : null;
  const rowStyle = (active) => ({ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px',
    textAlign: 'left', cursor: 'pointer', fontSize: 13, background: active ? TOKENS.greenTint : 'transparent', color: TOKENS.ink });
  const current = project ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ width: 9, height: 9, borderRadius: 999, background: project.color }}/>{project.name}</span>
  ) : category ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ width: 18, height: 18, borderRadius: 6, background: category.color, color: '#fff', display: 'grid', placeItems: 'center' }}><CatIcon icon={category.icon} size={10}/></span>{category.name}</span>
  ) : (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: TOKENS.sub }}><span style={{ width: 18, height: 18, borderRadius: 6, background: TOKENS.subSoft, color: '#fff', display: 'grid', placeItems: 'center' }}><Dot size={10}/></span>Uncategorised</span>
  );
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={()=>setOpen(o=>!o)} style={{ ...btnReset, display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: '100%',
        padding: '6px 11px 6px 9px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, fontSize: 13, cursor: 'pointer' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current}</span>
        <ChevD size={11} style={{ color: TOKENS.sub, flexShrink: 0 }}/>
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1 }}/>
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 2, width: 248, maxHeight: 300, overflow: 'auto',
            background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, boxShadow: '0 18px 44px rgba(20,30,20,0.2)', padding: 4 }}>
            <button type="button" onClick={()=>{ onChange({}); setOpen(false); }} style={rowStyle(!project && !category)}>
              <span style={{ width: 18, height: 18, borderRadius: 6, background: TOKENS.subSoft, color: '#fff', display: 'grid', placeItems: 'center' }}><Dot size={10}/></span>
              Uncategorised
              {!project && !category && <Check size={12} stroke={2.5} style={{ marginLeft: 'auto', color: TOKENS.green }}/>}
            </button>
            {app.categories.length > 0 && <div style={{ padding: '8px 12px 4px', fontSize: 9.5, color: TOKENS.sub, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 500 }}>Categories</div>}
            {app.categories.map(c => (
              <button type="button" key={c.id} onClick={()=>{ onChange({ categoryId: c.id }); setOpen(false); }} style={rowStyle(place.categoryId === c.id)}>
                <span style={{ width: 18, height: 18, borderRadius: 6, background: c.color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><CatIcon icon={c.icon} size={10}/></span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                {place.categoryId === c.id && <Check size={12} stroke={2.5} style={{ color: TOKENS.green }}/>}
              </button>
            ))}
            {app.projects.length > 0 && <div style={{ padding: '8px 12px 4px', fontSize: 9.5, color: TOKENS.sub, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 500 }}>Projects</div>}
            {app.projects.map(p => (
              <button type="button" key={p.id} onClick={()=>{ onChange({ projectId: p.id }); setOpen(false); }} style={rowStyle(place.projectId === p.id)}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: p.color, flexShrink: 0 }}/>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                {place.projectId === p.id && <Check size={12} stroke={2.5} style={{ color: TOKENS.green }}/>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Date pill + calendar popover for the quick-add (sets an ISO date, or clears it).
function QuickAddDateField({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(() => { const d = value ? parseKey(value) : parseKey(todayKey()); return { y: d.getFullYear(), m: d.getMonth() }; });
  useEffect(() => { if (open) { const d = value ? parseKey(value) : parseKey(todayKey()); setCur({ y: d.getFullYear(), m: d.getMonth() }); } }, [open]);
  const weeks = monthMatrix(cur.y, cur.m);
  const prevM = () => setCur(c => { const d = new Date(c.y, c.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const nextM = () => setCur(c => { const d = new Date(c.y, c.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const navBtn = (onClick, icon) => <button type="button" onClick={onClick} style={{ ...btnReset, width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', color: TOKENS.sub }}>{icon}</button>;
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={()=>setOpen(o=>!o)} style={{ ...btnReset, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px', borderRadius: 999,
        background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, fontSize: 13, cursor: 'pointer', color: value ? TOKENS.ink : TOKENS.sub }}>
        <CalToday size={13} style={{ color: TOKENS.sub }}/>
        <span>{value ? friendlyDue(value) : 'No date'}</span>
        <ChevD size={11} style={{ color: TOKENS.sub }}/>
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1 }}/>
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 2, width: 236,
            background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, boxShadow: '0 18px 44px rgba(20,30,20,0.2)', padding: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <div style={{ flex: 1, fontSize: 12.5, fontWeight: 500 }}>{MONTHS[cur.m]} {cur.y}</div>
              {navBtn(prevM, <ChevL size={14}/>)}
              {navBtn(nextM, <ChevR size={14}/>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {WEEK_HEADERS.map(w => <div key={w} style={{ textAlign: 'center', fontSize: 9, color: TOKENS.sub, padding: '2px 0' }}>{w[0]}</div>)}
              {weeks.flat().map(d => {
                const iso = keyOf(d);
                const inM = sameMonth(d, cur.y, cur.m);
                const sel = iso === value;
                const today = isToday(iso);
                return (
                  <button type="button" key={iso} onClick={()=>{ onChange(iso); setOpen(false); }} style={{ ...btnReset, height: 28, borderRadius: 7, fontSize: 12, cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
                    display: 'grid', placeItems: 'center',
                    background: sel ? TOKENS.green : (today ? TOKENS.greenTint : 'transparent'),
                    color: sel ? '#fff' : (inM ? TOKENS.ink : TOKENS.subSoft), fontWeight: (sel || today) ? 600 : 400 }}>{d.getDate()}</button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${TOKENS.lineSoft}` }}>
              <button type="button" onClick={()=>{ onChange(todayKey()); setOpen(false); }} style={{ ...btnReset, flex: 1, padding: '6px', borderRadius: 7, background: TOKENS.greenTint, color: TOKENS.green, fontSize: 11.5, fontWeight: 500 }}>Today</button>
              {value && <button type="button" onClick={()=>{ onChange(null); setOpen(false); }} style={{ ...btnReset, flex: 1, padding: '6px', borderRadius: 7, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11.5 }}>Clear</button>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function QuickAddTaskModal({ app }) {
  const opts = app.quickAdd;
  const open = !!opts;
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState({});
  const [dateIso, setDateIso] = useState(null);
  const [priority, setPriority] = useState('seedling');
  const [added, setAdded] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTitle(''); setAdded(0); setDateIso(null); setPriority('seedling');
      setPlace({ categoryId: opts.categoryId || null, projectId: opts.projectId || null });
      setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && app.quickAdd) app.closeQuickAdd(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [app.quickAdd, app.closeQuickAdd]);

  if (!open) return null;

  const create = (andOpen) => {
    const t = title.trim();
    if (!t) return;
    const id = app.addTask({ title: t, categoryId: place.categoryId || null, projectId: place.projectId || null, priority, date: dateIso });
    if (andOpen) { app.closeQuickAdd(); app.openTask(id); return; }
    setTitle(''); setAdded(n => n + 1);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 10);
  };
  const onKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); create(e.shiftKey); }
  };

  return (
    <div onClick={app.closeQuickAdd} style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.34)',
      backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'start center', paddingTop: '14vh', zIndex: 96 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 'min(540px, 92%)', background: TOKENS.surface, borderRadius: TOKENS.radiusLg,
        border: `1px solid ${TOKENS.line}`, boxShadow: '0 40px 90px rgba(20,30,20,0.26)', overflow: 'visible', fontFamily: TOKENS.fontSans, color: TOKENS.ink,
        animation: 'zenToastIn 0.22s cubic-bezier(0.2,0.8,0.2,1)' }}>
        <div style={{ padding: '16px 18px 6px', display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <span style={{ width: 22, height: 22, borderRadius: 999, border: `1.5px solid ${TOKENS.line}`, marginTop: 4, flexShrink: 0 }}/>
          <textarea ref={inputRef} value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={onKeyDown} rows={1}
            placeholder="What needs doing?"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', resize: 'none', overflow: 'hidden',
              fontFamily: 'inherit', fontSize: 18, fontWeight: 500, lineHeight: 1.35, letterSpacing: -0.2, color: TOKENS.ink, paddingTop: 2 }}/>
          <button onClick={app.closeQuickAdd} aria-label="Close" style={{ ...btnReset, color: TOKENS.sub, width: 28, height: 28, flexShrink: 0,
            display: 'grid', placeItems: 'center', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}><Close size={13}/></button>
        </div>

        <div style={{ padding: '6px 18px 16px 51px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <QuickAddPlacePicker app={app} place={place} onChange={setPlace}/>
          <QuickAddDateField value={dateIso} onChange={setDateIso}/>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}>
            {QA_PRIORITIES.map(p => (
              <button key={p} type="button" onClick={()=>setPriority(p)} title={PRIORITY_LABEL[p]}
                style={{ ...btnReset, width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', cursor: 'pointer',
                  background: priority === p ? TOKENS.surface : 'transparent', boxShadow: priority === p ? '0 1px 3px rgba(20,30,20,0.12)' : 'none' }}>
                <PriorityDot p={p}/>
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 18px', borderTop: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: TOKENS.sub }}>
            {added > 0 ? `${added} added · ` : ''}<b style={{ fontWeight: 600, color: TOKENS.inkSoft }}>↵</b> to add · <b style={{ fontWeight: 600, color: TOKENS.inkSoft }}>⇧↵</b> add &amp; open
          </span>
          <div style={{ flex: 1 }}/>
          {added > 0 && <button onClick={app.closeQuickAdd} style={{ ...btnReset, padding: '8px 14px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 12.5 }}>Done</button>}
          <button onClick={()=>create(false)} disabled={!title.trim()} style={{ ...btnReset, padding: '8px 18px', borderRadius: 999,
            background: title.trim() ? TOKENS.green : TOKENS.greenSoft, color: title.trim() ? '#fff' : TOKENS.sub,
            fontSize: 12.5, fontWeight: 500, cursor: title.trim() ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={12}/>Add task
          </button>
        </div>
      </div>
    </div>
  );
}
