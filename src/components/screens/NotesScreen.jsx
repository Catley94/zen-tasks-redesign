import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../shared/AppContext.jsx';
import { TOKENS, btnReset } from '../../data/seeds.js';
import { Screen } from '../shared/screen.jsx';
import { SectionLabel } from '../shared/primitives.jsx';
import { Plus, Close, Edit, Trash, Bookmark, Feather, Leaf, Book, Compass, Spark, Heart, Flame, Tag, Check } from '../shared/icons.jsx';
import { NotebookIcon } from '../shared/icons.jsx';

const NOTE_COLL_ICON_MAP = { leaf: Leaf, book: Book, compass: Compass, spark: Spark, heart: Heart, feather: Feather, bookmark: Bookmark, tag: Tag, flame: Flame };
const NOTE_COLL_ICON_KEYS = ['leaf', 'book', 'compass', 'spark', 'feather', 'heart', 'bookmark', 'flame'];
const NOTE_COLL_COLORS = ['#2a8a8a', '#8a6a3a', '#6e8a3a', '#a06a3a', '#3a8a6e', '#2f7a8a', '#7a4f8a', '#9a4a4a'];

function CollIcon({ icon, size = 13 }) {
  const I = NOTE_COLL_ICON_MAP[icon] || Leaf;
  return <I size={size} />;
}

function mdToText(src) {
  if (!src) return '';
  return src
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function TagPill({ tag }) {
  return <span style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub }}>#{tag}</span>;
}

function NoteCard({ note, app, mobile }) {
  const coll = note.collectionId ? app.collectionById(note.collectionId) : null;
  const accent = coll ? coll.color : TOKENS.subSoft;
  const preview = mdToText(note.body);
  const hasQuote = /(^|\n)\s*>/.test(note.body || '');
  return (
    <button onClick={() => app.openNote(note.id)}
      style={{ ...btnReset, display: 'block', width: '100%', textAlign: 'left', breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', marginBottom: 14, background: TOKENS.surfaceAlt, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, borderLeft: `3px solid ${accent}`, padding: '15px 16px 13px', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}>
      {note.pinned && (
        <span title="Pinned" style={{ position: 'absolute', top: -1, right: 13, color: accent, display: 'grid', placeItems: 'center' }}>
          <Bookmark size={17} style={{ fill: accent, stroke: accent }} />
        </span>
      )}
      <div style={{ fontSize: 17.5, fontWeight: 500, lineHeight: 1.28, letterSpacing: -0.2, color: TOKENS.ink, paddingRight: note.pinned ? 20 : 0, marginBottom: preview ? 7 : 0, textWrap: 'pretty', fontFamily: '"EB Garamond", Georgia, serif' }}>{note.title || 'Untitled note'}</div>
      {preview && (
        <div style={{ fontSize: 13.6, lineHeight: 1.5, color: TOKENS.inkSoft, display: '-webkit-box', WebkitLineClamp: hasQuote ? 5 : 6, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: '"EB Garamond", Georgia, serif' }}>{preview}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        {coll && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: accent, fontWeight: 500 }}>
            <CollIcon icon={coll.icon} size={11} />{coll.name}
          </span>
        )}
        {(note.tags || []).slice(0, 2).map(t => <TagPill key={t} tag={t} />)}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10.5, color: TOKENS.subSoft, whiteSpace: 'nowrap' }}>{note.updated}</span>
      </div>
    </button>
  );
}

function NoteChip({ active, color, icon, label, count, onClick }) {
  return (
    <button onClick={onClick} style={{ ...btnReset, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0, background: active ? (color ? color : TOKENS.green) : TOKENS.surface, border: `1px solid ${active ? (color || TOKENS.green) : TOKENS.line}`, color: active ? '#fff' : TOKENS.sub }}>
      {icon}{label}
      {count != null && <span style={{ fontSize: 10.5, opacity: active ? 0.85 : 0.7, fontVariantNumeric: 'tabular-nums' }}>{count}</span>}
    </button>
  );
}

function CollectionEditorModal({ open, mode, coll, app, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(NOTE_COLL_COLORS[0]);
  const [icon, setIcon] = useState('leaf');
  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && coll) { setName(coll.name); setColor(coll.color); setIcon(coll.icon); }
    else { setName(''); setColor(NOTE_COLL_COLORS[0]); setIcon('leaf'); }
  }, [open, mode, coll]);
  if (!open) return null;
  const canSave = name.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    if (mode === 'edit' && coll) app.updateCollection(coll.id, { name: name.trim(), color, icon });
    else { const id = app.addCollection({ name: name.trim(), color, icon }); onCreated && onCreated(id); }
    onClose();
  };
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.32)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 99 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(420px, 92%)', background: TOKENS.surface, borderRadius: TOKENS.radiusLg, border: `1px solid ${TOKENS.line}`, boxShadow: '0 40px 90px rgba(20,30,20,0.22)', overflow: 'hidden', fontFamily: TOKENS.fontSans, color: TOKENS.ink }}>
        <div style={{ padding: '14px 14px 14px 18px', borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><CollIcon icon={icon} size={14} /></span>
          <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{mode === 'edit' ? 'Edit collection' : 'New collection'}</div>
          <button onClick={onClose} aria-label="Close" style={{ ...btnReset, color: TOKENS.sub, width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}><Close size={13} /></button>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <SectionLabel>Name</SectionLabel>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') save(); }} placeholder="e.g. Reflections, Reading, Ideas…"
              style={{ width: '100%', marginTop: 8, padding: '10px 12px', borderRadius: TOKENS.radius, border: `1px solid ${TOKENS.line}`, background: TOKENS.bg, fontSize: 14, fontFamily: 'inherit', color: TOKENS.ink, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <SectionLabel>Colour</SectionLabel>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 10 }}>
              {NOTE_COLL_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} aria-label={'Colour ' + c} style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, background: c, cursor: 'pointer', boxShadow: color === c ? `0 0 0 2px ${TOKENS.surface}, 0 0 0 4px ${c}` : 'none' }} />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Icon</SectionLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {NOTE_COLL_ICON_KEYS.map(k => {
                const sel = icon === k;
                return (
                  <button key={k} onClick={() => setIcon(k)} aria-label={'Icon ' + k} style={{ ...btnReset, width: 36, height: 36, borderRadius: TOKENS.radius, display: 'grid', placeItems: 'center', cursor: 'pointer', background: sel ? color : TOKENS.bg, color: sel ? '#fff' : TOKENS.sub, border: `1px solid ${sel ? color : TOKENS.line}` }}>
                    <CollIcon icon={k} size={16} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 18px', borderTop: `1px solid ${TOKENS.line}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ ...btnReset, padding: '8px 16px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 12.5 }}>Cancel</button>
          <button onClick={save} disabled={!canSave} style={{ ...btnReset, padding: '8px 18px', borderRadius: 999, background: canSave ? TOKENS.teal : TOKENS.tealSoft, color: canSave ? '#fff' : TOKENS.sub, fontSize: 12.5, fontWeight: 500, cursor: canSave ? 'pointer' : 'default' }}>{mode === 'edit' ? 'Save changes' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}

export default function NotesScreen() {
  const { collectionId } = useParams();
  const { app, onNav, frame } = useApp();

  const mobile = frame === 'mobile';
  const calm = app.density === 'calm';
  const [filter, setFilter] = useState('all');
  const [editor, setEditor] = useState(null);
  const focused = !!collectionId;
  const active = focused ? collectionId : filter;

  const sorted = (list) => [...list].sort((a, b) => (b.pinned - a.pinned) || (b.ts - a.ts));
  let shown;
  if (focused) shown = sorted(app.notesForCollection(collectionId));
  else if (filter === 'all') shown = sorted(app.notes);
  else if (filter === 'pinned') shown = sorted(app.notes.filter(n => n.pinned));
  else shown = sorted(app.notesForCollection(filter));

  const collName = (id) => app.collectionById(id)?.name || 'Collection';
  const cols = mobile ? 1 : 2;
  const pinnedCount = app.notes.filter(n => n.pinned).length;

  const newBtn = (
    <button onClick={() => app.createNote(focused ? { collectionId } : {})} style={{ ...btnReset, padding: '7px 13px', borderRadius: 999, background: TOKENS.green, color: '#fff', fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Feather size={12} />New note
    </button>
  );

  return (
    <Screen app={app} active={focused ? 'notes:' + collectionId : 'notes'} onNav={onNav} frame={frame}
      title={focused ? collName(collectionId) : 'Notes'}
      subtitle={calm ? null : (focused ? 'Collection' : `${app.notes.length} notes · a quiet place for what you don't want to lose`)}
      crumbs={focused ? ['Notes', collName(collectionId)] : ['Notes']}
      headerRight={newBtn}>
      <div style={{ padding: mobile ? '18px 16px 36px' : '22px 30px 44px', maxWidth: 940 }}>
        {!calm && !focused && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, color: TOKENS.sub, fontSize: 12.5, lineHeight: 1.5 }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: TOKENS.tealTint, color: TOKENS.teal, display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1 }}><Feather size={11} /></span>
            <span style={{ maxWidth: 640 }}>Notes are the things you keep, not the things you do — reflections, passages, threads to pull on. They never get ticked off; they just stay, waiting for you to wander back.</span>
          </div>
        )}
        {!focused && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: mobile ? 'nowrap' : 'wrap', overflowX: mobile ? 'auto' : 'visible', paddingBottom: mobile ? 4 : 0 }}>
            <NoteChip active={filter === 'all'} label="All" count={app.notes.length} onClick={() => setFilter('all')} />
            {pinnedCount > 0 && <NoteChip active={filter === 'pinned'} color={TOKENS.teal} icon={<Bookmark size={12} />} label="Pinned" count={pinnedCount} onClick={() => setFilter('pinned')} />}
            {app.collections.map(c => (
              <NoteChip key={c.id} active={filter === c.id} color={c.color} icon={<CollIcon icon={c.icon} size={12} />} label={c.name} count={app.notesForCollection(c.id).length} onClick={() => setFilter(c.id)} />
            ))}
            <button onClick={() => setEditor({ mode: 'new' })} title="New collection" style={{ ...btnReset, width: 30, height: 30, borderRadius: 999, display: 'grid', placeItems: 'center', cursor: 'pointer', color: TOKENS.sub, border: `1px dashed ${TOKENS.line}`, flexShrink: 0 }}><Plus size={14} /></button>
          </div>
        )}
        {focused && (() => {
          const c = app.collectionById(collectionId);
          if (!c) return null;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: c.color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><CollIcon icon={c.icon} size={17} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, color: TOKENS.sub }}>{shown.length} {shown.length === 1 ? 'note' : 'notes'} in this collection</div>
              </div>
              <button onClick={() => setEditor({ mode: 'edit', coll: c })} style={{ ...btnReset, padding: '6px 12px', borderRadius: 999, background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Edit size={12} />Edit</button>
            </div>
          );
        })()}

        {shown.length > 0 ? (
          <div style={{ columnCount: cols, columnGap: 14 }}>
            {shown.map(n => <NoteCard key={n.id} note={n} app={app} mobile={mobile} />)}
          </div>
        ) : (
          <div style={{ padding: '40px 22px', textAlign: 'center', color: TOKENS.sub, border: `1px dashed ${TOKENS.line}`, borderRadius: TOKENS.radius, background: TOKENS.surfaceAlt }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: TOKENS.tealTint, color: TOKENS.teal, display: 'inline-grid', placeItems: 'center', marginBottom: 12 }}><Feather size={19} /></span>
            <div style={{ fontSize: 18, color: TOKENS.ink, marginBottom: 5, fontFamily: '"EB Garamond", Georgia, serif' }}>
              {filter === 'pinned' ? 'No pinned notes yet' : 'Nothing here yet'}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.55, maxWidth: 360, margin: '0 auto 16px' }}>
              {filter === 'pinned' ? 'Pin a note to keep it within easy reach at the top.' : 'Jot down a reflection, a passage worth keeping, or a thread you want to pull on later.'}
            </div>
            {filter !== 'pinned' && (
              <button onClick={() => app.createNote(focused ? { collectionId } : {})} style={{ ...btnReset, padding: '9px 18px', borderRadius: 999, background: TOKENS.green, color: '#fff', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 7 }}><Feather size={13} />Write a note</button>
            )}
          </div>
        )}
      </div>
      <CollectionEditorModal open={!!editor} mode={editor?.mode} coll={editor?.coll} app={app}
        onClose={() => setEditor(null)} onCreated={(id) => setFilter(id)} />
    </Screen>
  );
}
