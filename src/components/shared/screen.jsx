// Screen wrapper + MobileMoreSheet — the app chrome for every route.

import { useState, useEffect, useRef } from 'react';
import {
  TOKENS, btnReset, GOALS, PROJECTS,
} from '../../data/seeds.js';
import {
  Plus, Close, Search, Grid, Sparkles, Flame, Settings, ChevR, ChevD,
  Moon, Pin, Check, CalToday, CalMonth, Home, NotebookIcon, MoreV, Bell, Target, Folder,
} from './icons.jsx';
import {
  CommandPalette, NotificationToast, AskZenOverlay, ZenCorner,
  Sidebar, TopBar, ProfileManager, SectionLabel, buildProjectNav, NotificationsBell,
} from './primitives.jsx';

// Temporary stubs — will be replaced by real implementations
function TaskStack() { return null; }
function NoteEditor() { return null; }
function ProductTour() { return null; }
function QuickAddTaskModal() { return null; }

// Mobile overflow nav — the full app map, since the tab bar only holds five.
export function MobileMoreSheet({ app, active, onNav, onClose }) {
  const go = (id) => { onClose(); onNav(id); };
  const base = (active || '').split(':')[0];
  const [creating, setCreating] = useState(null); // 'goal' | 'project' | null
  const [createName, setCreateName] = useState('');
  const [projExpanded, setProjExpanded] = useState(false);
  const submitCreate = (e) => {
    e.preventDefault();
    const n = createName.trim();
    if (n) {
      const id = creating === 'goal' ? app.addGoal({ name: n }) : app.addProject({ name: n });
      setCreateName(''); setCreating(null);
      go((creating === 'goal' ? 'goal:' : 'project:') + id);
      return;
    }
    setCreateName(''); setCreating(null);
  };
  const CreateRow = ({ kind, label }) => creating === kind ? (
    <form onSubmit={submitCreate} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 18px', borderTop: `1px solid ${TOKENS.lineSoft}` }}>
      <span style={{ width: 9, height: 9, borderRadius: 999, border: `1.5px dashed ${TOKENS.green}`, flexShrink: 0 }}/>
      <input autoFocus value={createName} onChange={e=>setCreateName(e.target.value)} onBlur={()=>{ if (!createName.trim()) setCreating(null); }}
        placeholder={label + ' name…'}
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontFamily: 'inherit', color: TOKENS.ink }}/>
    </form>
  ) : (
    <button onClick={()=>{ setCreating(kind); setCreateName(''); }} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 18px', textAlign: 'left', borderTop: `1px solid ${TOKENS.lineSoft}`, cursor: 'pointer', color: TOKENS.sub }}>
      <span style={{ width: 9, height: 9, borderRadius: 999, border: `1.5px dashed ${TOKENS.subSoft}`, flexShrink: 0 }}/>
      <span style={{ flex: 1, fontSize: 13.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Plus size={12}/>New {kind}</span>
    </button>
  );
  const seg = (active || '').includes(':') ? active.split(':')[1] : null;
  const projects = app.projects || PROJECTS;
  const goals = app.goals || GOALS;
  const Row = ({ onClick, icon, color, label, activeOn, star }) => (
    <button onClick={onClick} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '12px 18px',
      textAlign: 'left', borderTop: `1px solid ${TOKENS.lineSoft}`, cursor: 'pointer',
      background: activeOn ? TOKENS.greenTint : 'transparent', color: activeOn ? TOKENS.green : TOKENS.ink }}>
      {color ? <span style={{ width: 9, height: 9, borderRadius: 999, background: color, flexShrink: 0 }}/> : <span style={{ color: TOKENS.sub, display: 'grid', placeItems: 'center', width: 16 }}>{icon}</span>}
      <span style={{ flex: 1, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {star && <span style={{ fontSize: 10, color: TOKENS.green, fontWeight: 700 }}>★</span>}
      <ChevR size={14} style={{ color: TOKENS.subSoft }}/>
    </button>
  );
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 88, background: 'rgba(30,40,30,0.34)', backdropFilter: 'blur(3px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background: TOKENS.surface, borderTopLeftRadius: TOKENS.radiusLg, borderTopRightRadius: TOKENS.radiusLg,
        maxHeight: '78%', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'zenToastIn 0.24s cubic-bezier(0.2,0.8,0.2,1)' }}>
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${TOKENS.line}` }}>
          <div style={{ width: 30, height: 4, borderRadius: 999, background: TOKENS.line, position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 7 }}/>
          <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>Go to…</div>
          <button onClick={onClose} aria-label="Close" style={{ ...btnReset, width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.sub }}><Close size={13}/></button>
        </div>
        <div style={{ overflow: 'auto' }}>
          <div data-tour="ms-spaces">
          <div style={{ padding: '10px 18px 2px' }}><SectionLabel>Space</SectionLabel></div>
          {app.profiles.map(p => (
            <button key={p.id} onClick={()=>{ app.switchProfile(p.id); onClose(); }} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 18px', textAlign: 'left', borderTop: `1px solid ${TOKENS.lineSoft}`, cursor: 'pointer', background: p.id === app.activeProfileId ? TOKENS.greenTint : 'transparent' }}>
              <span style={{ width: 22, height: 22, borderRadius: 7, background: p.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{p.name[0].toUpperCase()}</span>
              <span style={{ flex: 1, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: TOKENS.ink }}>{p.name}</span>
              {p.id === app.activeProfileId && <Check size={15} stroke={2.5} style={{ color: TOKENS.green }}/>}
            </button>
          ))}
          <button onClick={()=>{ onClose(); app.openManageSpaces(); }} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 18px', textAlign: 'left', borderTop: `1px solid ${TOKENS.lineSoft}`, cursor: 'pointer', color: TOKENS.sub }}>
            <span style={{ width: 22, display: 'grid', placeItems: 'center' }}><Settings size={14}/></span>
            <span style={{ flex: 1, fontSize: 13.5 }}>Manage spaces</span>
          </button>
          </div>
          <div data-tour="ms-nav">
          {goals.length > 0 && <div style={{ padding: '12px 18px 2px' }}><SectionLabel>Goals</SectionLabel></div>}
          {goals.map(g => <Row key={g.id} color={g.color} label={g.name} star={app.primaryGoalId === g.id} activeOn={base==='goal' && seg===g.id} onClick={()=>go('goal:'+g.id)}/>)}
          {goals.length === 0 && <div style={{ padding: '12px 18px 2px' }}><SectionLabel>Goals</SectionLabel></div>}
          <CreateRow kind="goal" label="Goal"/>
          <div style={{ padding: '12px 18px 2px' }}><SectionLabel>Projects</SectionLabel></div>
          {(() => {
            const nav = buildProjectNav(app);
            const visible = projExpanded ? nav.children : nav.children.filter(c => !nav.hiddenIds.has(c.id) || (base==='project' && seg===c.pid));
            const hidden = nav.hiddenIds.size;
            return (
              <>
                {visible.map(c => {
                  const activeOn = base==='project' && seg===c.pid;
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', borderTop: `1px solid ${TOKENS.lineSoft}`, background: activeOn ? TOKENS.greenTint : 'transparent' }}>
                      <button onClick={()=>go(c.id)} style={{ ...btnReset, flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 11, padding: '12px 4px 12px 18px', textAlign: 'left', cursor: 'pointer', color: activeOn ? TOKENS.green : TOKENS.ink }}>
                        <span style={{ width: 9, height: 9, borderRadius: 999, background: c.color, flexShrink: 0 }}/>
                        <span style={{ flex: 1, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                        {c.dormant && <Moon size={13} style={{ color: TOKENS.subSoft }}/>}
                        {c.noGoal && <span style={{ fontSize: 9.5, color: TOKENS.subSoft, background: TOKENS.bgSoft, border: `1px solid ${TOKENS.line}`, padding: '1px 7px', borderRadius: 999, flexShrink: 0 }}>No goal</span>}
                      </button>
                      <button onClick={(e)=>{ e.stopPropagation(); app.togglePinProject && app.togglePinProject(c.pid); }}
                        aria-label={c.pinned ? 'Unpin project' : 'Pin to top'}
                        style={{ ...btnReset, width: 44, height: 44, display: 'grid', placeItems: 'center', flexShrink: 0, cursor: 'pointer', color: c.pinned ? TOKENS.teal : TOKENS.subSoft }}>
                        <Pin size={15} style={{ transform: c.pinned ? 'none' : 'rotate(40deg)' }}/>
                      </button>
                    </div>
                  );
                })}
                {hidden > 0 && (
                  <button onClick={()=>setProjExpanded(x=>!x)} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 18px', textAlign: 'left', borderTop: `1px solid ${TOKENS.lineSoft}`, cursor: 'pointer', color: TOKENS.subSoft }}>
                    <span style={{ width: 16, display: 'grid', placeItems: 'center' }}><ChevD size={14} style={{ transform: projExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/></span>
                    <span style={{ flex: 1, fontSize: 13.5 }}>{projExpanded ? 'Show less' : `Show ${hidden} more`}</span>
                  </button>
                )}
              </>
            );
          })()}
          <CreateRow kind="project" label="Project"/>
          <div style={{ padding: '12px 18px 2px' }}><SectionLabel>More</SectionLabel></div>
          <Row icon={<Grid size={15}/>} label="Categories" activeOn={base==='categories'} onClick={()=>go('categories')}/>
          <Row icon={<NotebookIcon size={15}/>} label="Notes" activeOn={base==='notes'} onClick={()=>go('notes')}/>
          <Row icon={<Sparkles size={15}/>} label="Ask Zen" activeOn={base==='zen'} onClick={()=>go('zen')}/>
          <Row icon={<Flame size={15}/>} label="Weekly review" activeOn={base==='review'} onClick={()=>go('review')}/>
          </div>
          <div data-tour="ms-settings">
          <Row icon={<Settings size={15}/>} label="Settings" activeOn={base==='settings'} onClick={()=>go('settings')}/>
          </div>
          <div style={{ height: 18 }}/>
        </div>
      </div>
    </div>
  );
}

// The Screen wrapper + AppShell. Provides sidebar + topbar + Zen corner + framing.
export function Screen({ frame, app, active, onNav, onAsk, title, subtitle, crumbs, headerRight, children }) {
  const [zen, setZen] = useState(false);
  const moreOpen = app.moreSheetOpen;
  const setMoreOpen = (v) => v ? app.openMoreSheet() : app.closeMoreSheet();
  const [palette, setPalette] = useState(false);
  const rootRef = useRef(null);
  const ask = () => { if (app.openZenChat) app.openZenChat(); else if (onAsk) onAsk(); else setZen(true); };
  const moreActive = ['goal','project','categories','review','settings'].includes((active||'').split(':')[0]);
  // ⌘P / Ctrl+P opens the command palette — scoped to whichever app frame holds focus
  // (so the gallery's many instances don't all open at once).
  useEffect(() => {
    const h = (e) => {
      const root = rootRef.current;
      const scoped = root && document.activeElement && document.activeElement !== document.body && root.contains(document.activeElement);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        if (scoped) { e.preventDefault(); setPalette(true); }
      } else if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = document.activeElement;
        const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
        if (scoped && !typing && !app.quickAdd) { e.preventDefault(); app.openQuickAdd(); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [app.quickAdd]);

  if (frame === 'mobile') {
    return (
      <div ref={rootRef} className={app.dyslexiaFont ? 'dys-font' : undefined} style={{ width: 360, height: 760, background: TOKENS.bg, color: TOKENS.ink,
        fontFamily: TOKENS.fontSans, fontSize: 14, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <header style={{ padding: '40px 18px 10px', borderBottom: `1px solid ${TOKENS.line}`, background: TOKENS.surface }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div data-tour="m-space" style={{ width: 24, height: 24, borderRadius: 7, background: app.activeProfile.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }} title={app.activeProfile.name + ' space'}>{app.activeProfile.name[0].toUpperCase()}</div>
            <div style={{ fontSize: 11, color: TOKENS.sub, textTransform: 'uppercase', letterSpacing: 1.2, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{crumbs ? crumbs.map(c => (c && typeof c === 'object') ? c.label : c).join(' · ') : ''}</div>
            <button onClick={()=>setPalette(true)} aria-label="Search" style={{ ...btnReset, width: 30, height: 30, borderRadius: 999, display: 'grid', placeItems: 'center', color: TOKENS.sub }}><Search size={15}/></button>
            <button data-tour="m-help" onClick={()=>app.startTour && app.startTour()} aria-label="Take the tour" style={{ ...btnReset, width: 30, height: 30, borderRadius: 999, display: 'grid', placeItems: 'center', color: TOKENS.sub, fontSize: 15, fontWeight: 600 }}>?</button>
            <NotificationsBell app={app} align="right" narrow onNav={onNav}/>
            <button onClick={()=>onNav('settings')} aria-label="Settings" style={{ ...btnReset, width: 30, height: 30, borderRadius: 999, display: 'grid', placeItems: 'center', color: active==='settings' ? TOKENS.green : TOKENS.sub, background: active==='settings' ? TOKENS.greenSoft : 'transparent' }}><Settings size={15}/></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '8px 0 2px', fontSize: 19, fontWeight: 500, letterSpacing: -0.2 }}>{title}</h1>
              {subtitle && <div style={{ fontSize: 12, color: TOKENS.sub }}>{subtitle}</div>}
            </div>
            {headerRight}
          </div>
        </header>
        <div data-tour="m-main" style={{ flex: 1, overflow: 'auto' }}>{children}</div>
        <button onClick={()=>app.openQuickAdd()} aria-label="New task" data-tour="m-newtask"
          style={{ ...btnReset, position: 'absolute', right: 16, bottom: 78, width: 52, height: 52, borderRadius: 999, zIndex: 50,
            background: TOKENS.green, color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 8px 22px rgba(40,80,40,0.34)', cursor: 'pointer' }}>
          <Plus size={22}/>
        </button>
        <nav data-tour="m-nav" style={{ display: 'flex', borderTop: `1px solid ${TOKENS.line}`, background: TOKENS.surface, paddingBottom: 14 }}>
          {[{id:'agenda',i:<CalToday size={16}/>,l:'Today'},{id:'calendar',i:<CalMonth size={16}/>,l:'Calendar'},{id:'today',i:<Home size={16}/>,l:'Focus'},{id:'zen',i:<Sparkles size={16}/>,l:'Zen',teal:true},{id:'more',i:<MoreV size={16}/>,l:'More'}].map(it => {
            const isActive = it.id==='more' ? moreActive : (active===it.id);
            return (
            <button key={it.id} data-tour={it.id==='more' ? 'm-more' : undefined} onClick={()=> it.id==='more' ? setMoreOpen(true) : onNav(it.id)} style={{ ...btnReset, flex: 1, padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: isActive ? (it.teal ? TOKENS.teal : TOKENS.green) : TOKENS.sub, fontSize: 10 }}>
              {it.i}<span>{it.l}</span>
            </button>
          ); })}
        </nav>
        {moreOpen && <MobileMoreSheet app={app} active={active} onNav={onNav} onClose={()=>setMoreOpen(false)}/>}
        <NotificationToast app={app}/>
        <AskZenOverlay app={app}/>
        <CommandPalette open={palette} onClose={()=>setPalette(false)} app={app} onNav={(r)=>{ setPalette(false); onNav(r); }}/>
        <TaskStack app={app} frame="mobile"/>
        <NoteEditor app={app} frame="mobile" onNav={onNav}/>
        {app.manageSpacesOpen && <ProfileManager app={app} onClose={app.closeManageSpaces}/>}
        <QuickAddTaskModal app={app}/>
        <ProductTour app={app} frame="mobile" getRoot={()=>rootRef.current} onNav={onNav}/>
      </div>
    );
  }
  return (
    <div ref={rootRef} className={app.dyslexiaFont ? 'dys-font' : undefined} style={{ width: '100%', height: '100dvh', background: TOKENS.bg, color: TOKENS.ink,
      fontFamily: TOKENS.fontSans, fontSize: 14, display: 'flex', position: 'relative', overflow: 'hidden' }}>
      <Sidebar active={active} onNav={onNav} app={app} onSearch={()=>setPalette(true)}/>
      <main data-tour="main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar crumbs={crumbs} title={title} subtitle={subtitle} right={headerRight} app={app} onAsk={ask} onNav={onNav}/>
        <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
      </main>
      <ZenCorner app={app} onExpand={ask}/>
      <NotificationToast app={app}/>
      <AskZenOverlay app={app}/>
      <CommandPalette open={palette} onClose={()=>setPalette(false)} app={app} onNav={(r)=>{ setPalette(false); onNav(r); }}/>
      <TaskStack app={app} frame="desktop"/>
      <NoteEditor app={app} frame="desktop" onNav={onNav}/>
      {app.manageSpacesOpen && <ProfileManager app={app} onClose={app.closeManageSpaces}/>}
      <QuickAddTaskModal app={app}/>
      <ProductTour app={app} frame="desktop" getRoot={()=>rootRef.current} onNav={onNav}/>
    </div>
  );
}

