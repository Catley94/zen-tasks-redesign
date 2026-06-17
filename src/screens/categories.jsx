// Categories — lightweight everyday buckets (Errands, Home, Health…).
// Sectioned list: each category shows its tasks, a working quick-add row, and an
// edit/delete menu. A "New category" affordance + a name/colour/icon editor modal.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TOKENS, btnReset } from '../lib/tokens';
import { Screen } from '../components/screen';
import { SectionLabel, TaskRow } from '../components/primitives';
import { Tag, Home, Heart, Bag, Wallet, Leaf, Flame, Calendar, Plus, Close, Edit, Trash, MoreV, Grid } from '../components/icons';
import { CATEGORY_ICON_KEYS, CATEGORY_COLORS, UNCAT } from '../domain/constants';

// icon key → component. Presentation, so it stays in the view (the key list lives in the model).
const CATEGORY_ICON_MAP = { tag: Tag, home: Home, heart: Heart, bag: Bag, wallet: Wallet, leaf: Leaf, flame: Flame, calendar: Calendar };

export function CatIcon({ icon, size = 13 }) {
  const I = CATEGORY_ICON_MAP[icon] || Tag;
  return <I size={size}/>;
}

// ——— small "…" menu on each category: Edit / Delete (with inline confirm) ———
function CategoryMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { if (!open) setConfirm(false); }, [open]);
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={()=>setOpen(o=>!o)} aria-label="Category options"
        style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center',
          color: open ? TOKENS.ink : TOKENS.sub, background: open ? TOKENS.bg : 'transparent' }}>
        <MoreV size={15}/>
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }}/>
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 41, width: 168,
            background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius,
            boxShadow: '0 18px 44px rgba(20,30,20,0.2)', overflow: 'hidden', fontFamily: TOKENS.fontSans }}>
            {!confirm ? (
              <>
                <button onClick={()=>{ setOpen(false); onEdit(); }} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 13, color: TOKENS.ink, cursor: 'pointer' }}>
                  <Edit size={13} style={{ color: TOKENS.sub }}/>Edit category
                </button>
                <button onClick={()=>setConfirm(true)} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 13, color: TOKENS.rose, cursor: 'pointer', borderTop: `1px solid ${TOKENS.lineSoft}` }}>
                  <Trash size={13}/>Delete
                </button>
              </>
            ) : (
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 12.5, color: TOKENS.ink, lineHeight: 1.5, marginBottom: 4 }}>Delete this category?</div>
                <div style={{ fontSize: 11, color: TOKENS.sub, lineHeight: 1.5, marginBottom: 10 }}>The tasks stay — they just become uncategorised.</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={()=>{ setOpen(false); onDelete(); }} style={{ ...btnReset, flex: 1, padding: '6px 10px', borderRadius: 999, background: TOKENS.rose, color: '#fff', fontSize: 11.5, fontWeight: 500 }}>Delete</button>
                  <button onClick={()=>setConfirm(false)} style={{ ...btnReset, flex: 1, padding: '6px 10px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 11.5 }}>Keep</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ——— quick-add row that actually creates a task into the category ———
function CategoryQuickAdd({ cat, app }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) { setOpen(false); return; }
    app.addTask({ title: t, categoryId: cat.system ? null : cat.id });
    setDraft('');
  };
  if (!open) {
    return (
      <button onClick={()=>setOpen(true)} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 11,
        padding: '10px 16px', borderTop: `1px solid ${TOKENS.lineSoft}`, color: TOKENS.sub, fontSize: 12.5, cursor: 'pointer' }}>
        <span style={{ width: 18, height: 18, borderRadius: 999, border: `1.5px dashed ${TOKENS.line}`, display: 'grid', placeItems: 'center', color: cat.color }}><Plus size={11}/></span>
        Add to {cat.name}…
      </button>
    );
  }
  return (
    <form onSubmit={submit} style={{ padding: '10px 16px', borderTop: `1px solid ${TOKENS.lineSoft}`, display: 'flex', gap: 11, alignItems: 'center', background: TOKENS.surfaceAlt }}>
      <span style={{ width: 18, height: 18, borderRadius: 999, border: `1.5px dashed ${cat.color}`, flexShrink: 0 }}/>
      <input autoFocus value={draft} onChange={e=>setDraft(e.target.value)} onBlur={()=>!draft && setOpen(false)}
        placeholder={`New task in ${cat.name}…`}
        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontFamily: 'inherit', color: TOKENS.ink }}/>
      <span style={{ fontSize: 10.5, color: TOKENS.sub, fontFamily: TOKENS.fontMono, whiteSpace: 'nowrap' }}>press enter</span>
    </form>
  );
}

// ——— one category card ———
export function CategorySection({ cat, app, onNav, onEdit, onDelete, mobile = false, defaultOpen = true }) {
  const tasks = app.tasksForCategory(cat.id);
  const open = tasks.filter(t=>!t.done);
  const done = tasks.filter(t=>t.done).length;
  const [collapsed, setCollapsed] = useState(!defaultOpen);
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden' }}>
      <div style={{ padding: '12px 12px 12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: collapsed ? 'none' : `1px solid ${TOKENS.lineSoft}` }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: cat.color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><CatIcon icon={cat.icon} size={15}/></span>
        <button onClick={()=>setCollapsed(c=>!c)} style={{ ...btnReset, flex: 1, minWidth: 0, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 9 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: TOKENS.ink }}>{cat.name}</span>
          <span style={{ fontSize: 11.5, color: TOKENS.sub, fontVariantNumeric: 'tabular-nums' }}>
            {open.length === 0 ? (tasks.length === 0 ? 'empty' : 'all done') : `${open.length} open`}{done > 0 && tasks.length > 0 ? ` · ${done} done` : ''}
          </span>
        </button>
        {!cat.system && <CategoryMenu onEdit={onEdit} onDelete={onDelete || (()=>app.deleteCategory(cat.id))}/>}
      </div>
      {!collapsed && (
        <>
          {open.concat(tasks.filter(t=>t.done)).map(t => <TaskRow key={t.id} task={t} app={app} mobile={mobile}/>)}
          {tasks.length === 0 && (
            <div style={{ padding: '14px 16px', fontSize: 12.5, color: TOKENS.sub, textAlign: 'center' }}>Nothing here yet.</div>
          )}
          <CategoryQuickAdd cat={cat} app={app}/>
        </>
      )}
    </div>
  );
}

// ——— create / edit modal ———
export function CategoryEditorModal({ open, mode, cat, app, onClose }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[1]);
  const [icon, setIcon] = useState('tag');
  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && cat) { setName(cat.name); setColor(cat.color); setIcon(cat.icon); }
    else { setName(''); setColor(CATEGORY_COLORS[1]); setIcon('tag'); }
  }, [open, mode, cat]);
  if (!open) return null;
  const canSave = name.trim().length > 0;
  const save = () => {
    if (!canSave) return;
    if (mode === 'edit' && cat) app.updateCategory(cat.id, { name: name.trim(), color, icon });
    else app.addCategory({ name: name.trim(), color, icon });
    onClose();
  };
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,40,30,0.32)',
      backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 90 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 'min(440px, 92%)',
        background: TOKENS.surface, borderRadius: TOKENS.radiusLg, border: `1px solid ${TOKENS.line}`,
        boxShadow: '0 40px 90px rgba(20,30,20,0.22)', overflow: 'hidden', fontFamily: TOKENS.fontSans, color: TOKENS.ink }}>
        <div style={{ padding: '14px 14px 14px 18px', borderBottom: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><CatIcon icon={icon} size={14}/></span>
          <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{mode === 'edit' ? 'Edit category' : 'New category'}</div>
          <button onClick={onClose} aria-label="Close" style={{ ...btnReset, color: TOKENS.sub, width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}><Close size={13}/></button>
        </div>
        <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <SectionLabel>Name</SectionLabel>
            <input autoFocus value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{ if (e.key==='Enter') save(); }}
              placeholder="e.g. Errands, Home, Health…"
              style={{ width: '100%', marginTop: 8, padding: '10px 12px', borderRadius: TOKENS.radius, border: `1px solid ${TOKENS.line}`,
                background: TOKENS.bg, fontSize: 14, fontFamily: 'inherit', color: TOKENS.ink, outline: 'none', boxSizing: 'border-box' }}/>
          </div>
          <div>
            <SectionLabel>Colour</SectionLabel>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 10 }}>
              {CATEGORY_COLORS.map(c => (
                <button key={c} onClick={()=>setColor(c)} aria-label={'Colour '+c}
                  style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, background: c, cursor: 'pointer',
                    boxShadow: color === c ? `0 0 0 2px ${TOKENS.surface}, 0 0 0 4px ${c}` : 'none' }}/>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Icon</SectionLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {CATEGORY_ICON_KEYS.map(k => {
                const sel = icon === k;
                return (
                  <button key={k} onClick={()=>setIcon(k)} aria-label={'Icon '+k}
                    style={{ ...btnReset, width: 36, height: 36, borderRadius: TOKENS.radius, display: 'grid', placeItems: 'center', cursor: 'pointer',
                      background: sel ? color : TOKENS.bg, color: sel ? '#fff' : TOKENS.sub,
                      border: `1px solid ${sel ? color : TOKENS.line}` }}>
                    <CatIcon icon={k} size={16}/>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 18px', borderTop: `1px solid ${TOKENS.line}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ ...btnReset, padding: '8px 16px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub, fontSize: 12.5 }}>Cancel</button>
          <button onClick={save} disabled={!canSave} style={{ ...btnReset, padding: '8px 18px', borderRadius: 999,
            background: canSave ? TOKENS.green : TOKENS.greenSoft, color: canSave ? '#fff' : TOKENS.sub,
            fontSize: 12.5, fontWeight: 500, cursor: canSave ? 'pointer' : 'default', opacity: canSave ? 1 : 0.7 }}>
            {mode === 'edit' ? 'Save changes' : 'Create category'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ====== CATEGORIES SCREEN ======
export function CategoriesScreen({ app, variant, frame, onNav, onAsk, categoryId }) {
  const cats = app.categories;
  // Virtual system bucket: everything with no project and no category lands here. Always shown,
  // not editable/deletable — it's the default home for a quickly-captured task.
  const allCats = [...cats, UNCAT];
  const nameFor = (id) => id === '__uncat' ? 'Uncategorised' : (app.categoryById(id)?.name || 'Category');
  const focusOne = categoryId ? allCats.filter(c => c.id === categoryId) : allCats;
  const [editor, setEditor] = useState(null); // null | {mode:'new'} | {mode:'edit', cat}
  const calm = app.density === 'calm';
  const mobile = frame === 'mobile';

  const totalOpen = app.tasks.filter(t => t.categoryId && !t.done).length;

  const newBtn = (
    <button onClick={()=>setEditor({ mode: 'new' })} style={{ ...btnReset, padding: '7px 13px', borderRadius: 999, background: TOKENS.green, color: '#fff', fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Plus size={12}/>New category
    </button>
  );

  // Variant B (desktop overview): 2-column card grid. Variant A / mobile: single-column sectioned list.
  const twoCol = variant === 'b' && !mobile && !categoryId;

  return (
    <Screen frame={frame} app={app} active={categoryId ? 'categories:'+categoryId : 'categories'} onNav={onNav} onAsk={onAsk}
      title={categoryId ? nameFor(categoryId) : 'Categories'}
      subtitle={calm ? null : (categoryId ? (categoryId === '__uncat' ? 'Everything not filed anywhere' : 'Everyday bucket') : `${cats.length} buckets · ${totalOpen} open · the small stuff outside your goals`)}
      crumbs={categoryId ? ['Categories', nameFor(categoryId)] : ['Categories']}
      headerRight={newBtn}>
      <div style={{ padding: '22px 30px 40px', maxWidth: twoCol ? 'none' : 760, margin: twoCol ? 0 : undefined }}>
        {!calm && !categoryId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: TOKENS.sub, fontSize: 12.5, lineHeight: 1.5 }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: TOKENS.greenTint, color: TOKENS.green, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Grid size={11}/></span>
            Categories are for everyday things — errands, home, health. Lighter than a goal or a project; just a colour to file a task under.
          </div>
        )}
        <div style={{ display: twoCol ? 'grid' : 'flex', gridTemplateColumns: twoCol ? '1fr 1fr' : undefined,
          flexDirection: twoCol ? undefined : 'column', gap: 14, alignItems: twoCol ? 'start' : undefined }}>
          {focusOne.map(cat => (
            <CategorySection key={cat.id} cat={cat} app={app} onNav={onNav} mobile={mobile}
              defaultOpen={!!categoryId || !twoCol}
              onDelete={()=>{ app.deleteCategory(cat.id); if (categoryId) onNav('categories'); }}
              onEdit={()=>setEditor({ mode: 'edit', cat })}/>
          ))}
          {focusOne.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: TOKENS.sub, border: `1px dashed ${TOKENS.line}`, borderRadius: TOKENS.radius }}>
              <div style={{ fontSize: 14, color: TOKENS.ink, marginBottom: 4 }}>No categories yet</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>Make one for the everyday stuff — errands, home, health.</div>
            </div>
          )}
          {!categoryId && (
            <button onClick={()=>setEditor({ mode: 'new' })} style={{ ...btnReset, padding: '12px 16px', border: `1px dashed ${TOKENS.line}`,
              borderRadius: TOKENS.radius, color: TOKENS.sub, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
              gridColumn: twoCol ? '1 / -1' : undefined, width: twoCol ? 'auto' : undefined }}>
              <span style={{ width: 20, height: 20, borderRadius: 999, border: `1.5px dashed ${TOKENS.sub}`, display: 'grid', placeItems: 'center' }}><Plus size={11}/></span>
              New category
            </button>
          )}
        </div>
      </div>
      <CategoryEditorModal open={!!editor} mode={editor?.mode} cat={editor?.cat} app={app} onClose={()=>setEditor(null)}/>
    </Screen>
  );
}

export { CATEGORY_ICON_MAP, CATEGORY_COLORS };
