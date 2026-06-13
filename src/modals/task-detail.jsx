// Task detail dialog — opens from any task row (app.openTask(id)).
// Edit the title inline, write a Markdown description (Write / Preview), see the
// most relevant meta (where it lives, due, priority, time), and manage subtasks.

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { TOKENS, btnReset, PRIORITY_LABEL, PRIORITY_COLOR } from '../lib/tokens';
import { PROJECTS, PROJECT_SECTIONS, CATEGORIES } from '../lib/data';
import { Close, Check, Plus, Edit, Trash, ChevD, ChevL, ChevR, Clock, Calendar, CalToday, Bell, Dot } from '../components/icons';
import { renderMarkdown } from '../lib/markdown';
import { keyOf, todayKey, monthMatrix, fmtDayLabel, addDays, MONTHS, MONTHS_SHORT, WEEKDAYS_SHORT, WEEK_HEADERS, isToday, sameMonth, parseKey, friendlyDue } from '../lib/dates';
import { PriorityDot, SectionLabel } from '../components/primitives';
import { CatIcon } from '../screens/categories';

const DUE_OPTIONS = ['—', 'Today', 'Tomorrow', 'This week', 'Next week', 'Overdue'];
const EST_OPTIONS = ['—', '2m', '5m', '10m', '15m', '20m', '30m', '45m', '1h', '2h', '3h', '4h'];
const PRIORITY_KEYS = ['seedling', 'growing', 'rooted', 'falling'];
const REMINDER_OPTIONS = [['none', "Don't remind me"], ['same-day', 'On the day'], ['day-before', 'A day before'], ['2-days', '2 days before'], ['week-before', 'A week before']];

// Auto-growing textarea that stays in sync with its content.
function AutoTextarea({ value, onChange, style, ...rest }) {
  const ref = useRef(null);
  const resize = () => { const el = ref.current; if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } };
  useEffect(() => { resize(); }, [value]);
  return <textarea ref={ref} value={value} onChange={e=>{ onChange(e); resize(); }} style={{ resize: 'none', overflow: 'hidden', ...style }} {...rest}/>;
}

// Toolbar icon (20×20 grid, stroked like the app's icon set).
function MdIcon({ children }) {
  return <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

// Markdown toolbar button — icon-based; `accent` renders the filled teal pill (link).
function MdToolButton({ title, onClick, accent, children }) {
  return (
    <button type="button" onMouseDown={e=>e.preventDefault()} onClick={onClick} title={title} aria-label={title}
      style={{ ...btnReset, minWidth: accent ? 40 : 30, height: 30, padding: 0, borderRadius: accent ? 9 : 7,
        display: 'grid', placeItems: 'center', cursor: 'pointer',
        background: accent ? TOKENS.teal : 'transparent', color: accent ? '#fff' : TOKENS.inkSoft, marginLeft: accent ? 6 : 0 }}
      onMouseEnter={e=>{ if (!accent) { e.currentTarget.style.background = TOKENS.bg; e.currentTarget.style.color = TOKENS.ink; } else { e.currentTarget.style.opacity = 0.88; } }}
      onMouseLeave={e=>{ if (!accent) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TOKENS.inkSoft; } else { e.currentTarget.style.opacity = 1; } }}>
      {children}
    </button>
  );
}

const MdDivider = () => <span style={{ width: 1, height: 18, background: TOKENS.line, margin: '0 6px', flexShrink: 0 }}/>;

// ——— DOM → Markdown serializer (bounded to the tags renderMarkdown emits) ———
// Lets the contentEditable show live formatting while we still store clean Markdown.
function htmlToMarkdown(root) {
  const inline = (node) => {
    if (node.nodeType === 3) return node.nodeValue.replace(/ /g, ' ');
    if (node.nodeType !== 1) return '';
    const kids = () => Array.from(node.childNodes).map(inline).join('');
    switch (node.tagName) {
      case 'BR': return '\n';
      case 'STRONG': case 'B': return `**${kids()}**`;
      case 'EM': case 'I': return `*${kids()}*`;
      case 'DEL': case 'S': case 'STRIKE': return `~~${kids()}~~`;
      case 'U': return `++${kids()}++`;
      case 'INPUT': return node.type === 'checkbox' ? (node.checked ? '[x] ' : '[ ] ') : '';
      case 'CODE': return '`' + node.textContent + '`';
      case 'A': return `[${kids()}](${node.getAttribute('href') || ''})`;
      default: return kids();
    }
  };
  const inlineOf = (node) => Array.from(node.childNodes).map(inline).join('').trim();
  const isBlock = (el) => el.nodeType === 1 && /^(H[1-4]|UL|OL|BLOCKQUOTE|PRE|P|DIV)$/.test(el.tagName);
  const hasBlockChild = (node) => Array.from(node.children).some(isBlock);
  const blocks = [];
  const walk = (parent) => {
    Array.from(parent.childNodes).forEach(node => {
      if (node.nodeType === 3) { const t = node.nodeValue.trim(); if (t) blocks.push(t); return; }
      if (node.nodeType !== 1) return;
      const tag = node.tagName;
      if (/^H[1-4]$/.test(tag)) { blocks.push('#'.repeat(+tag[1]) + ' ' + inlineOf(node)); return; }
      if (tag === 'UL') { Array.from(node.children).forEach(li => blocks.push('- ' + inlineOf(li))); return; }
      if (tag === 'OL') { Array.from(node.children).forEach((li, i) => blocks.push(`${i + 1}. ` + inlineOf(li))); return; }
      if (tag === 'BLOCKQUOTE') { inlineOf(node).split('\n').forEach(l => blocks.push('> ' + l)); return; }
      if (tag === 'PRE') { blocks.push('```\n' + node.textContent.replace(/\n$/, '') + '\n```'); return; }
      if (tag === 'BR') return;
      // a paragraph/div that wraps block elements → recurse so we don't flatten lists/headings
      if ((tag === 'P' || tag === 'DIV') && hasBlockChild(node)) { walk(node); return; }
      const t = inlineOf(node); if (t) blocks.push(t);
    });
  };
  walk(root);
  // merge consecutive list items so they render as one list (no blank line between)
  const out = [];
  blocks.forEach(b => {
    const prev = out[out.length - 1];
    const isList = /^(- |\d+\. |> )/.test(b);
    if (isList && prev && /^(- |\d+\. |> )/.test(prev)) out.push('' + b); else out.push(b);
  });
  return out.join('\n\n').replace(/\n\n/g, '\n').replace(//g, '').replace(/\n{3,}/g, '\n\n').trim();
}

function DescriptionEditor({ task, app }) {
  const edRef = useRef(null);
  // Render stored Markdown into the editable surface only when the task changes,
  // so live typing never resets the caret.
  useEffect(() => { const el = edRef.current; if (el) el.innerHTML = renderMarkdown(task.notes || ''); }, [task.id]);
  const sync = () => { const el = edRef.current; if (el) app.updateTask(task.id, { notes: htmlToMarkdown(el) }); };
  const focusBack = () => edRef.current && edRef.current.focus();

  const cmd = (command, value = null) => { focusBack(); document.execCommand(command, false, value); sync(); };
  const toggleBlock = (tagName) => {
    focusBack();
    const cur = (document.queryCommandValue('formatBlock') || '').toLowerCase();
    document.execCommand('formatBlock', false, cur.includes(tagName.toLowerCase()) ? 'p' : tagName);
    sync();
  };
  const surround = (make) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { focusBack(); return; }
    const range = sel.getRangeAt(0);
    const wrap = make(sel.toString());
    try { range.surroundContents(wrap); }
    catch (_) { const frag = range.extractContents(); wrap.appendChild(frag); range.insertNode(wrap); }
    sel.removeAllRanges();
    focusBack();
    sync();
  };
  const wrapCode = () => surround(() => document.createElement('code'));
  // Turn the current list item into a task item (checkbox), creating the list if needed.
  const checklist = () => {
    focusBack();
    document.execCommand('insertUnorderedList');
    const root = edRef.current; const sel = window.getSelection();
    if (root && sel && sel.anchorNode) {
      let li = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
      while (li && li !== root && li.tagName !== 'LI') li = li.parentElement;
      if (li && li.tagName === 'LI' && !li.querySelector('input[type="checkbox"]')) {
        li.classList.add('task');
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.contentEditable = 'false';
        li.insertBefore(document.createTextNode(' '), li.firstChild);
        li.insertBefore(cb, li.firstChild);
      }
    }
    sync();
  };
  const wrapLink = () => surround((text) => {
    const a = document.createElement('a');
    a.href = /^https?:\/\//.test(text) ? text : 'https://';
    a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <SectionLabel>Description</SectionLabel>
      </div>
      <div style={{ border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden', background: TOKENS.surfaceAlt }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 8px', borderBottom: `1px solid ${TOKENS.line}`, background: TOKENS.surface, flexWrap: 'wrap' }}>
          <MdToolButton title="Bold (⌘B)" onClick={()=>cmd('bold')}><MdIcon><path d="M6.5 4.2h4a2.8 2.8 0 0 1 0 5.6h-4zM6.5 9.8h4.8a3 3 0 0 1 0 6h-4.8z"/></MdIcon></MdToolButton>
          <MdToolButton title="Italic (⌘I)" onClick={()=>cmd('italic')}><MdIcon><path d="M11 4.2h5.5M3.5 15.8H9M12.8 4.2 7.2 15.8"/></MdIcon></MdToolButton>
          <MdToolButton title="Underline (⌘U)" onClick={()=>cmd('underline')}><MdIcon><path d="M5.5 3.8v5.4a4.5 4.5 0 0 0 9 0V3.8M4.5 16.5h11"/></MdIcon></MdToolButton>
          <MdToolButton title="Strikethrough" onClick={()=>cmd('strikeThrough')}><MdIcon><path d="M3.5 10h13M14 5.7C13.3 4.6 11.8 4 10 4 7.7 4 6.2 5 6.2 6.5c0 .9.5 1.6 1.6 2.1M6 14.3c.7 1.1 2.2 1.7 4 1.7 2.3 0 3.8-1 3.8-2.5 0-.9-.5-1.6-1.5-2.1"/></MdIcon></MdToolButton>
          <MdToolButton title="Code" onClick={wrapCode}><MdIcon><path d="m7 6.5-4 3.5 4 3.5M13 6.5l4 3.5-4 3.5"/></MdIcon></MdToolButton>
          <MdDivider/>
          <MdToolButton title="Bulleted list" onClick={()=>cmd('insertUnorderedList')}><MdIcon><circle cx="4.2" cy="5" r="1.25" fill="currentColor" stroke="none"/><circle cx="4.2" cy="10" r="1.25" fill="currentColor" stroke="none"/><circle cx="4.2" cy="15" r="1.25" fill="currentColor" stroke="none"/><path d="M8.5 5h8M8.5 10h8M8.5 15h8"/></MdIcon></MdToolButton>
          <MdToolButton title="Numbered list" onClick={()=>cmd('insertOrderedList')}><MdIcon><path d="M8.5 5h8M8.5 10h8M8.5 15h8"/><text x="2" y="7" fontSize="6" fill="currentColor" stroke="none">1</text><text x="2" y="12" fontSize="6" fill="currentColor" stroke="none">2</text><text x="2" y="17" fontSize="6" fill="currentColor" stroke="none">3</text></MdIcon></MdToolButton>
          <MdToolButton title="Checklist" onClick={checklist}><MdIcon><rect x="3" y="3.5" width="13" height="13" rx="3"/><path d="m6.6 10.2 2.1 2.1 4.4-4.6"/></MdIcon></MdToolButton>
          <MdToolButton title="Quote" onClick={()=>toggleBlock('BLOCKQUOTE')}><MdIcon><path fill="currentColor" stroke="none" d="M4 13.6c0-3.3 1.8-5.8 4.5-6.9l.8 1.6c-1.7.7-2.7 2-2.9 3.2h2.7v4.7H4v-2.6zm7.6 0c0-3.3 1.8-5.8 4.5-6.9l.8 1.6c-1.7.7-2.7 2-2.9 3.2h2.7v4.7h-5.1v-2.6z"/></MdIcon></MdToolButton>
          <MdToolButton title="Link" accent onClick={wrapLink}><MdIcon><path d="M8.2 11.8a3.4 3.4 0 0 0 4.8 0l2.6-2.6a3.4 3.4 0 0 0-4.8-4.8L9.5 5.7M11.8 8.2a3.4 3.4 0 0 0-4.8 0l-2.6 2.6a3.4 3.4 0 0 0 4.8 4.8l1.3-1.3"/></MdIcon></MdToolButton>
        </div>
        <div ref={edRef} className="zen-md zen-rte" contentEditable suppressContentEditableWarning
          data-placeholder="Add details… select text and use the toolbar to format."
          onInput={sync}
          onClick={(e)=>{ if (e.target && e.target.type === 'checkbox') sync(); }}
          onKeyDown={(e)=>{ if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='b') { e.preventDefault(); cmd('bold'); }
            else if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='i') { e.preventDefault(); cmd('italic'); }
            else if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='u') { e.preventDefault(); cmd('underline'); } }}/>
      </div>
      <div style={{ marginTop: 6, fontSize: 10.5, color: TOKENS.subSoft, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontFamily: TOKENS.fontMono, fontSize: 10, padding: '1px 5px', borderRadius: 4, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}>M↓</span>
        Formats live as you type — stored as Markdown.
      </div>
    </div>
  );
}

// Editable-surface styling for the live description editor.
if (!document.getElementById('zen-rte-styles')) {
  const s = document.createElement('style');
  s.id = 'zen-rte-styles';
  s.textContent = `
    .zen-rte { outline: none; min-height: 112px; padding: 12px 14px; cursor: text; }
    .zen-rte:empty:before { content: attr(data-placeholder); color: ${TOKENS.subSoft}; font-style: italic; pointer-events: none; }
    .zen-rte:focus { box-shadow: inset 0 0 0 2px ${TOKENS.greenTint}; }
  `;
  document.head.appendChild(s);
}

function MetaCell({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <SectionLabel>{label}</SectionLabel>
      <div style={{ fontSize: 13, color: TOKENS.ink, display: 'flex', alignItems: 'center', gap: 6, minHeight: 24 }}>{children}</div>
    </div>
  );
}

// Custom date popover (a compact month grid) — reliable inside sandboxed iframes
// where the native <input type="date"> picker is blocked.
function DateField({ task, app, overdue }) {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(() => { const d = task.date ? parseKey(task.date) : parseKey(todayKey()); return { y: d.getFullYear(), m: d.getMonth() }; });
  useEffect(() => { if (open) { const d = task.date ? parseKey(task.date) : parseKey(todayKey()); setCur({ y: d.getFullYear(), m: d.getMonth() }); } }, [open, task.id]);
  const weeks = monthMatrix(cur.y, cur.m);
  const pick = (iso) => { app.scheduleTask(task.id, iso); setOpen(false); };
  const prevM = () => setCur(c => { const d = new Date(c.y, c.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const nextM = () => setCur(c => { const d = new Date(c.y, c.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const navBtn = (onClick, icon) => <button onClick={onClick} style={{ ...btnReset, width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', color: TOKENS.sub }}>{icon}</button>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative' }}>
        <button onClick={()=>setOpen(o=>!o)} style={{ ...btnReset, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 11px', borderRadius: 999,
          background: overdue ? TOKENS.warnSoft : TOKENS.bg, border: `1px solid ${overdue ? TOKENS.warnSoft : TOKENS.line}`, cursor: 'pointer', fontSize: 13,
          color: overdue ? TOKENS.warn : (task.date ? TOKENS.ink : TOKENS.sub) }}>
          <CalToday size={13} style={{ color: overdue ? TOKENS.warn : TOKENS.sub }}/>
          <span>{task.date ? friendlyDue(task.date) : 'Schedule…'}</span>
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
                  const sel = iso === task.date;
                  const today = isToday(iso);
                  return (
                    <button key={iso} onClick={()=>pick(iso)} style={{ ...btnReset, height: 28, borderRadius: 7, fontSize: 12, cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
                      display: 'grid', placeItems: 'center',
                      background: sel ? TOKENS.green : (today ? TOKENS.greenTint : 'transparent'),
                      color: sel ? '#fff' : (inM ? TOKENS.ink : TOKENS.subSoft), fontWeight: (sel || today) ? 600 : 400 }}>{d.getDate()}</button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${TOKENS.lineSoft}` }}>
                <button onClick={()=>pick(todayKey())} style={{ ...btnReset, flex: 1, padding: '6px', borderRadius: 7, background: TOKENS.greenTint, color: TOKENS.green, fontSize: 11.5, fontWeight: 500 }}>Today</button>
                {task.date && <button onClick={()=>{ app.scheduleTask(task.id, null); setOpen(false); }} style={{ ...btnReset, flex: 1, padding: '6px', borderRadius: 7, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11.5 }}>Clear date</button>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PickGroupLabel({ children }) {
  return <div style={{ padding: '8px 12px 4px', fontSize: 9.5, color: TOKENS.sub, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 500 }}>{children}</div>;
}

// Editable "Lives in" — move a task into a Project, a Category, or leave it Standalone.
function PlacementPicker({ task, app }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [task.id]);
  const project = PROJECTS.find(p => p.id === task.projectId);
  const category = task.categoryId ? app.categoryById(task.categoryId) : null;
  const choose = (place) => { app.placeTask(task.id, place); setOpen(false); };
  const rowStyle = (active) => ({ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px',
    textAlign: 'left', cursor: 'pointer', fontSize: 13, background: active ? TOKENS.greenTint : 'transparent', color: TOKENS.ink });

  const current = project ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ width: 9, height: 9, borderRadius: 999, background: project.color }}/>{project.name}</span>
  ) : category ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ width: 18, height: 18, borderRadius: 6, background: category.color, color: '#fff', display: 'grid', placeItems: 'center' }}><CatIcon icon={category.icon} size={10}/></span>{category.name}</span>
  ) : <span style={{ color: TOKENS.sub }}>Standalone</span>;

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ ...btnReset, display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: '100%',
        padding: '4px 10px 4px 9px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, fontSize: 13, cursor: 'pointer' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current}</span>
        <ChevD size={11} style={{ color: TOKENS.sub, flexShrink: 0 }}/>
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1 }}/>
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 2, width: 232, maxHeight: 280, overflow: 'auto',
            background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, boxShadow: '0 18px 44px rgba(20,30,20,0.2)', padding: 4 }}>
            <button onClick={()=>choose({})} style={rowStyle(!project && !category)}>
              <span style={{ width: 18, height: 18, borderRadius: 6, background: TOKENS.subSoft, color: '#fff', display: 'grid', placeItems: 'center' }}><Dot size={10}/></span>
              Standalone
              {!project && !category && <Check size={12} stroke={2.5} style={{ marginLeft: 'auto', color: TOKENS.green }}/>}
            </button>
            <PickGroupLabel>Projects</PickGroupLabel>
            {(app.projects || PROJECTS).map(p => {
              const secs = PROJECT_SECTIONS[p.id] || [];
              return (
                <button key={p.id} onClick={()=>choose({ projectId: p.id, sectionId: secs[0] ? secs[0].id : null })} style={rowStyle(task.projectId === p.id)}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: p.color, flexShrink: 0 }}/>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  {task.projectId === p.id && <Check size={12} stroke={2.5} style={{ color: TOKENS.green }}/>}
                </button>
              );
            })}
            <PickGroupLabel>Categories</PickGroupLabel>
            {app.categories.map(c => (
              <button key={c.id} onClick={()=>choose({ categoryId: c.id })} style={rowStyle(task.categoryId === c.id)}>
                <span style={{ width: 18, height: 18, borderRadius: 6, background: c.color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><CatIcon icon={c.icon} size={10}/></span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                {task.categoryId === c.id && <Check size={12} stroke={2.5} style={{ color: TOKENS.green }}/>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CommentRow({ c, task, app }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(c.text);
  const [confirmDel, setConfirmDel] = useState(false);
  useEffect(() => { setDraft(c.text); }, [c.text]);
  const save = () => { const t = draft.trim(); if (!t) return; app.updateComment(task.id, c.id, t); setEditing(false); };
  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: `1px solid ${TOKENS.lineSoft}` }}>
      <span style={{ width: 26, height: 26, borderRadius: 999, background: TOKENS.tealSoft, color: TOKENS.tealDeep, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{(c.author || 'Y')[0]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: TOKENS.ink }}>{c.author || 'You'}</span>
          <span style={{ fontSize: 11, color: TOKENS.sub }}>{c.when}{c.edited ? ' · edited' : ''}</span>
          <div style={{ flex: 1 }}/>
          {!editing && !confirmDel && (
            <div style={{ display: 'flex', gap: 2 }}>
              <button onClick={()=>{ setDraft(c.text); setEditing(true); }} title="Edit" style={{ ...btnReset, width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', color: TOKENS.subSoft }}
                onMouseEnter={e=>{ e.currentTarget.style.background = TOKENS.bg; e.currentTarget.style.color = TOKENS.ink; }} onMouseLeave={e=>{ e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TOKENS.subSoft; }}><Edit size={12}/></button>
              <button onClick={()=>setConfirmDel(true)} title="Delete" style={{ ...btnReset, width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', color: TOKENS.subSoft }}
                onMouseEnter={e=>{ e.currentTarget.style.background = TOKENS.bg; e.currentTarget.style.color = TOKENS.rose; }} onMouseLeave={e=>{ e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TOKENS.subSoft; }}><Trash size={12}/></button>
            </div>
          )}
          {confirmDel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: TOKENS.sub }}>Delete?</span>
              <button onClick={()=>app.deleteComment(task.id, c.id)} style={{ ...btnReset, padding: '3px 9px', borderRadius: 999, background: TOKENS.rose, color: '#fff', fontSize: 11, fontWeight: 500 }}>Delete</button>
              <button onClick={()=>setConfirmDel(false)} style={{ ...btnReset, padding: '3px 8px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11 }}>Keep</button>
            </div>
          )}
        </div>
        {editing ? (
          <div style={{ marginTop: 5 }}>
            <textarea autoFocus value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{ if ((e.metaKey||e.ctrlKey) && e.key==='Enter') save(); if (e.key==='Escape') setEditing(false); }} rows={2}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 40, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, background: TOKENS.surfaceAlt, padding: '8px 10px', fontFamily: TOKENS.fontSans, fontSize: 13, lineHeight: 1.5, color: TOKENS.ink, outline: 'none' }}/>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}>
              <button onClick={()=>setEditing(false)} style={{ ...btnReset, padding: '5px 12px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11.5 }}>Cancel</button>
              <button onClick={save} disabled={!draft.trim()} style={{ ...btnReset, padding: '5px 13px', borderRadius: 999, background: draft.trim() ? TOKENS.green : TOKENS.greenSoft, color: draft.trim() ? '#fff' : TOKENS.sub, fontSize: 11.5, fontWeight: 500, cursor: draft.trim() ? 'pointer' : 'default' }}>Save</button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 3 }}><Markdown source={c.text} empty=""/></div>
        )}
      </div>
    </div>
  );
}

function CommentsSection({ task, app }) {
  const [draft, setDraft] = useState('');
  useEffect(() => { setDraft(''); }, [task.id]);
  const comments = task.comments || [];
  const post = (e) => { if (e && e.preventDefault) e.preventDefault(); const t = draft.trim(); if (!t) return; app.addComment(task.id, t); setDraft(''); };
  return (
    <div>
      <div style={{ marginBottom: 6 }}><SectionLabel>Updates{comments.length ? ` · ${comments.length}` : ''}</SectionLabel></div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {comments.map(c => <CommentRow key={c.id} c={c} task={task} app={app}/>)}
        {comments.length === 0 && <div style={{ padding: '6px 0 10px', fontSize: 12.5, color: TOKENS.sub, lineHeight: 1.5 }}>No updates yet — log progress, blockers, or decisions to keep a history.</div>}
      </div>
      <form onSubmit={post} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 4, paddingTop: 10, borderTop: `1px solid ${TOKENS.lineSoft}` }}>
        <span style={{ width: 26, height: 26, borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, display: 'grid', placeItems: 'center', flexShrink: 0 }}><User size={13}/></span>
        <div style={{ flex: 1 }}>
          <textarea value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{ if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') post(e); }}
            placeholder="Post an update…  (⌘↵ to send · Markdown ok)" rows={2}
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 42, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, background: TOKENS.surfaceAlt, padding: '9px 11px', fontFamily: TOKENS.fontSans, fontSize: 13, lineHeight: 1.5, color: TOKENS.ink, outline: 'none' }}/>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="submit" disabled={!draft.trim()} style={{ ...btnReset, padding: '6px 14px', borderRadius: 999, background: draft.trim() ? TOKENS.green : TOKENS.greenSoft, color: draft.trim() ? '#fff' : TOKENS.sub, fontSize: 12, fontWeight: 500, cursor: draft.trim() ? 'pointer' : 'default' }}>Post update</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function TaskDetailModal({ app }) {
  const id = app.openTaskId;
  const task = app.tasks.find(t => t.id === id);
  const [subDraft, setSubDraft] = useState('');
  const [prioOpen, setPrioOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  useEffect(() => { setSubDraft(''); setPrioOpen(false); setConfirmDel(false); }, [id]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && app.openTaskId) app.closeTask(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [app.openTaskId, app.closeTask]);
  if (!task) return null;

  const project = PROJECTS.find(p => p.id === task.projectId);
  const category = task.categoryId ? app.categoryById(task.categoryId) : null;
  const tGoals = app.goalsForTask ? app.goalsForTask(task.id) : [];
  const subDone = task.subtasks.filter(s => s.done).length;
  const due = DUE_OPTIONS.includes(task.due) ? task.due : (task.due || '—');
  const dueOptions = DUE_OPTIONS.includes(task.due) ? DUE_OPTIONS : [task.due, ...DUE_OPTIONS];
  const overdue = isPast(task.date) && !task.done;
  const est = EST_OPTIONS.includes(task.est) ? task.est : (task.est || '—');
  const estOptions = (task.est && !EST_OPTIONS.includes(task.est)) ? [task.est, ...EST_OPTIONS] : EST_OPTIONS;

  const addSub = (e) => { e.preventDefault(); const t = subDraft.trim(); if (!t) return; app.addSubtask(task.id, t); setSubDraft(''); };

  return (
    <div onClick={app.closeTask} style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.34)',
      backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 95, padding: 20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 'min(580px, 100%)', maxHeight: '100%',
        background: TOKENS.surface, borderRadius: TOKENS.radiusLg, border: `1px solid ${TOKENS.line}`,
        boxShadow: '0 40px 90px rgba(20,30,20,0.24)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        fontFamily: TOKENS.fontSans, color: TOKENS.ink, animation: 'zenToastIn 0.24s cubic-bezier(0.2,0.8,0.2,1)' }}>

        {/* header — done toggle + editable title */}
        <div style={{ padding: '16px 14px 14px 18px', borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <button onClick={()=>app.toggleTask(task.id)} style={{ ...btnReset, width: 22, height: 22, borderRadius: 999, marginTop: 2, flexShrink: 0,
            border: `1.5px solid ${task.done ? TOKENS.green : TOKENS.line}`, background: task.done ? TOKENS.green : 'transparent',
            color: '#fff', display: 'grid', placeItems: 'center' }}>{task.done && <Check size={12} stroke={2.5}/>}</button>
          <AutoTextarea value={task.title} onChange={e=>app.updateTask(task.id, { title: e.target.value })} rows={1}
            placeholder="Task title…" aria-label="Task title"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit',
              fontSize: 19, fontWeight: 500, lineHeight: 1.3, letterSpacing: -0.2, color: TOKENS.ink,
              textDecoration: task.done ? 'line-through' : 'none', padding: 0 }}/>
          <FocusPill on={app.focusIds.has(task.id)} onClick={()=>app.toggleFocus(task.id)} size="md"/>
          <button onClick={app.closeTask} aria-label="Close" style={{ ...btnReset, color: TOKENS.sub, width: 28, height: 28, flexShrink: 0,
            display: 'grid', placeItems: 'center', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}><Close size={13}/></button>
        </div>

        <div style={{ overflow: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* meta grid — most relevant info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            background: TOKENS.surfaceAlt, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, padding: '14px 16px' }}>
            <MetaCell label="Lives in">
              <PlacementPicker task={task} app={app}/>
            </MetaCell>
            {project && (PROJECT_SECTIONS[project.id] || []).length > 0 && (
              <MetaCell label="Section">
                <div style={{ position: 'relative' }}>
                  <select value={app.sectionOf(task.id) || ''} onChange={e=>app.setTaskSection(task.id, e.target.value || null)}
                    style={{ appearance: 'none', WebkitAppearance: 'none', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
                      padding: '3px 24px 3px 10px', borderRadius: 999, color: app.sectionOf(task.id) ? TOKENS.ink : TOKENS.sub,
                      background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, outline: 'none', maxWidth: 150 }}>
                    <option value="">No section</option>
                    {PROJECT_SECTIONS[project.id].map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <ChevD size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: TOKENS.sub, pointerEvents: 'none' }}/>
                </div>
              </MetaCell>
            )}
            <MetaCell label="Date">
              <DateField task={task} app={app} overdue={overdue}/>
            </MetaCell>
            {task.date && (
              <MetaCell label="Remind me">
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <Bell size={12} style={{ position: 'absolute', left: 10, color: (task.reminder && task.reminder !== 'none') ? TOKENS.teal : TOKENS.sub, pointerEvents: 'none' }}/>
                  <select value={task.reminder || 'none'} onChange={e=>app.setReminder(task.id, e.target.value)}
                    style={{ appearance: 'none', WebkitAppearance: 'none', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
                      padding: '3px 24px 3px 28px', borderRadius: 999, color: (task.reminder && task.reminder !== 'none') ? TOKENS.ink : TOKENS.sub,
                      background: (task.reminder && task.reminder !== 'none') ? TOKENS.tealTint : TOKENS.bg,
                      border: `1px solid ${(task.reminder && task.reminder !== 'none') ? TOKENS.tealSoft : TOKENS.line}`, outline: 'none' }}>
                    {REMINDER_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <ChevD size={11} style={{ position: 'absolute', right: 8, color: TOKENS.sub, pointerEvents: 'none' }}/>
                </div>
              </MetaCell>
            )}
            <MetaCell label="Priority">
              <div style={{ position: 'relative' }}>
                <button onClick={()=>setPrioOpen(o=>!o)} style={{ ...btnReset, display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '4px 11px 4px 9px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, fontSize: 13, cursor: 'pointer' }}>
                  <PriorityDot p={task.priority}/>{PRIORITY_LABEL[task.priority]}<ChevD size={11} style={{ color: TOKENS.sub }}/>
                </button>
                {prioOpen && (
                  <>
                    <div onClick={()=>setPrioOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1 }}/>
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 2, width: 150,
                      background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius,
                      boxShadow: '0 16px 40px rgba(20,30,20,0.2)', overflow: 'hidden', padding: 4 }}>
                      {PRIORITY_KEYS.map(k => (
                        <button key={k} onClick={()=>{ app.updateTask(task.id, { priority: k }); setPrioOpen(false); }}
                          style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6,
                            background: task.priority === k ? TOKENS.greenTint : 'transparent', fontSize: 13, cursor: 'pointer' }}>
                          <PriorityDot p={k}/>{PRIORITY_LABEL[k]}
                          {task.priority === k && <Check size={12} stroke={2.5} style={{ marginLeft: 'auto', color: TOKENS.green }}/>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </MetaCell>
            <MetaCell label="Estimate">
              <div style={{ position: 'relative' }}>
                <select value={est} onChange={e=>app.updateTask(task.id, { est: e.target.value })}
                  style={{ appearance: 'none', WebkitAppearance: 'none', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
                    padding: '3px 24px 3px 10px', borderRadius: 999, color: (task.est && task.est !== '—') ? TOKENS.ink : TOKENS.sub,
                    background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, outline: 'none', fontVariantNumeric: 'tabular-nums' }}>
                  {estOptions.map(d => <option key={d} value={d}>{d === '—' ? 'No estimate' : d}</option>)}
                </select>
                <ChevD size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: TOKENS.sub, pointerEvents: 'none' }}/>
              </div>
            </MetaCell>
            {tGoals.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                <MetaCell label="Toward">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {tGoals.map(g => <GoalChip key={g.id} goal={g} primary={app.primaryGoalId === g.id}/>)}
                  </div>
                </MetaCell>
              </div>
            )}
          </div>

          {/* description — markdown */}
          <DescriptionEditor task={task} app={app}/>

          {/* subtasks */}
          <div>
            <div style={{ marginBottom: 8 }}>
              <SectionLabel>Subtasks{task.subtasks.length > 0 ? ` · ${subDone}/${task.subtasks.length}` : ''}</SectionLabel>
            </div>
            <div style={{ border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden' }}>
              {task.subtasks.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 14px', borderBottom: `1px solid ${TOKENS.lineSoft}`, opacity: s.done ? 0.55 : 1 }}>
                  <button onClick={()=>app.toggleSub(task.id, s.id)} style={{ ...btnReset, width: 16, height: 16, borderRadius: 999, flexShrink: 0,
                    border: `1.5px solid ${s.done ? TOKENS.green : TOKENS.line}`, background: s.done ? TOKENS.green : 'transparent',
                    color: '#fff', display: 'grid', placeItems: 'center' }}>{s.done && <Check size={9} stroke={2.8}/>}</button>
                  <span style={{ fontSize: 13.5, textDecoration: s.done ? 'line-through' : 'none' }}>{s.title}</span>
                </div>
              ))}
              <form onSubmit={addSub} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 14px', background: task.subtasks.length ? TOKENS.surfaceAlt : 'transparent' }}>
                <span style={{ width: 16, height: 16, borderRadius: 999, border: `1.5px dashed ${TOKENS.line}`, display: 'grid', placeItems: 'center', color: TOKENS.green, flexShrink: 0 }}><Plus size={10}/></span>
                <input value={subDraft} onChange={e=>setSubDraft(e.target.value)} placeholder="Add a subtask…"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontFamily: 'inherit', color: TOKENS.ink }}/>
              </form>
            </div>
          </div>

          {/* updates / comments — a work log for the task */}
          <CommentsSection task={task} app={app}/>
        </div>

        <div style={{ padding: '12px 18px', borderTop: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          {!confirmDel ? (
            <button onClick={()=>setConfirmDel(true)} style={{ ...btnReset, display: 'inline-flex', alignItems: 'center', gap: 6, color: TOKENS.rose, fontSize: 12, padding: '6px 0' }}>
              <Trash size={13}/>Delete task
            </button>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: TOKENS.ink }}>
              Delete for good?
              <button onClick={()=>app.deleteTask(task.id)} style={{ ...btnReset, padding: '5px 13px', borderRadius: 999, background: TOKENS.rose, color: '#fff', fontSize: 11.5, fontWeight: 500 }}>Delete</button>
              <button onClick={()=>setConfirmDel(false)} style={{ ...btnReset, padding: '5px 13px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11.5 }}>Keep</button>
            </span>
          )}
          <div style={{ flex: 1 }}/>
          <span style={{ fontSize: 11, color: TOKENS.sub }}>Changes save as you type.</span>
          <button onClick={app.closeTask} style={{ ...btnReset, padding: '8px 18px', borderRadius: 999, background: TOKENS.green, color: '#fff', fontSize: 12.5, fontWeight: 500 }}>Done</button>
        </div>
      </div>
    </div>
  );
}

export { DescriptionEditor };
