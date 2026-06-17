// Calendar (month grid + day scheduling panel) and Today (agenda) screens.
// Tasks carry a real ISO `date`; scheduling routes through app.scheduleTask,
// which keeps the fuzzy `due` label in sync and fires a notification.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TOKENS, btnReset } from '../lib/tokens';
import { Screen } from '../components/screen';
import { SectionLabel, TaskRow } from '../components/primitives';
import { Check, ChevD, ChevL, ChevR, Clock, Close, Leaf, Plus, CalMonth } from '../components/icons';
import { MONTHS, WEEK_HEADERS, todayKey, parseKey, keyOf, sameMonth, isToday, fmtDayLabel, monthMatrix } from '../lib/dates';

export function taskColor(app, t) {
  const p = app.projectById(t.projectId);
  if (p) return p.color;
  const c = app.categoryById ? app.categoryById(t.categoryId) : null;
  return c ? c.color : TOKENS.green;
}

// Compact task line for the day panel + schedule trays.
export function CalMiniRow({ task, app, trailing }) {
  const color = taskColor(app, task);
  return (
    <div onClick={()=>app.openTask(task.id)}
      onMouseEnter={e=>{ e.currentTarget.style.background = TOKENS.surfaceAlt; }}
      onMouseLeave={e=>{ e.currentTarget.style.background = 'transparent'; }}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderTop: `1px solid ${TOKENS.lineSoft}`,
        cursor: 'pointer', opacity: task.done ? 0.5 : 1, transition: 'background .12s' }}>
      <button onClick={e=>{ e.stopPropagation(); app.toggleTask(task.id); }} style={{ ...btnReset, width: 16, height: 16, borderRadius: 999, flexShrink: 0,
        border: `1.5px solid ${task.done ? TOKENS.green : TOKENS.line}`, background: task.done ? TOKENS.green : 'transparent', color: '#fff', display: 'grid', placeItems: 'center' }}>
        {task.done && <Check size={9} stroke={2.8}/>}</button>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: color, flexShrink: 0 }}/>
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</span>
      {trailing}
    </div>
  );
}

// ===== CALENDAR (month) =====
export function CalendarScreen({ app, frame, onNav, onAsk, variant }) {
  const mobile = frame === 'mobile';
  const startRef = parseKey(todayKey());
  const [cursor, setCursor] = useState({ y: startRef.getFullYear(), m: startRef.getMonth() });
  const [selected, setSelected] = useState(todayKey());
  const [draft, setDraft] = useState('');
  const [trayOpen, setTrayOpen] = useState(false);

  const weeks = monthMatrix(cursor.y, cursor.m);
  const prevM = () => setCursor(c => { const d = new Date(c.y, c.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const nextM = () => setCursor(c => { const d = new Date(c.y, c.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const goToday = () => { const d = parseKey(todayKey()); setCursor({ y: d.getFullYear(), m: d.getMonth() }); setSelected(todayKey()); };

  const selTasks = app.tasksForDate(selected);
  const unscheduled = app.unscheduledTasks();
  const addToDay = (e) => { e.preventDefault(); const t = draft.trim(); if (!t) return; app.addTask({ title: t, date: selected }); setDraft(''); };

  const navBtn = (onClick, icon, label) => (
    <button onClick={onClick} aria-label={label} style={{ ...btnReset, width: 30, height: 30, borderRadius: 999, display: 'grid', placeItems: 'center',
      color: TOKENS.sub, background: TOKENS.bg, border: `1px solid ${TOKENS.line}` }}>{icon}</button>
  );

  const monthGrid = (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: `1px solid ${TOKENS.lineSoft}` }}>
        <div style={{ fontSize: 15, fontWeight: 500, flex: 1 }}>{MONTHS[cursor.m]} {cursor.y}</div>
        <button onClick={goToday} style={{ ...btnReset, padding: '4px 11px', borderRadius: 999, background: TOKENS.greenTint, color: TOKENS.green, fontSize: 11.5, fontWeight: 500 }}>Today</button>
        {navBtn(prevM, <ChevL size={15}/>, 'Previous month')}
        {navBtn(nextM, <ChevR size={15}/>, 'Next month')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {WEEK_HEADERS.map(w => (
          <div key={w} style={{ padding: '8px 0', textAlign: 'center', fontSize: 10, color: TOKENS.sub, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>{mobile ? w[0] : w}</div>
        ))}
        {weeks.flat().map((d, i) => {
          const iso = keyOf(d);
          const inMonth = sameMonth(d, cursor.y, cursor.m);
          const dayTasks = app.tasksForDate(iso);
          const today = isToday(iso);
          const sel = iso === selected;
          return (
            <button key={iso} onClick={()=>setSelected(iso)}
              style={{ ...btnReset, textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3,
                minHeight: mobile ? 46 : 92, padding: mobile ? '4px 4px' : '6px 7px',
                borderTop: `1px solid ${TOKENS.lineSoft}`, borderLeft: (i % 7 === 0) ? 'none' : `1px solid ${TOKENS.lineSoft}`,
                background: sel ? TOKENS.tealTint : (inMonth ? 'transparent' : TOKENS.bgSoft),
                boxShadow: sel ? `inset 0 0 0 1.5px ${TOKENS.teal}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: mobile ? 'center' : 'flex-start' }}>
                <span style={{ width: 20, height: 20, borderRadius: 999, display: 'grid', placeItems: 'center', fontSize: 11.5, fontVariantNumeric: 'tabular-nums',
                  background: today ? TOKENS.green : 'transparent', color: today ? '#fff' : (inMonth ? TOKENS.ink : TOKENS.subSoft), fontWeight: today ? 600 : 400 }}>{d.getDate()}</span>
              </div>
              {!mobile && dayTasks.slice(0, 2).map(t => (
                <div key={t.id} style={{ fontSize: 9.5, lineHeight: 1.35, padding: '1px 4px', borderRadius: 4, background: taskColor(app, t) + '22',
                  color: TOKENS.inkSoft, borderLeft: `2px solid ${taskColor(app, t)}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
              ))}
              {!mobile && dayTasks.length > 2 && <div style={{ fontSize: 9, color: TOKENS.sub, paddingLeft: 2 }}>+{dayTasks.length - 2} more</div>}
              {mobile && dayTasks.length > 0 && (
                <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {dayTasks.slice(0, 4).map(t => <span key={t.id} style={{ width: 5, height: 5, borderRadius: 999, background: taskColor(app, t) }}/>)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const dayPanel = (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '13px 16px', borderBottom: `1px solid ${TOKENS.lineSoft}` }}>
        <SectionLabel color={isToday(selected) ? TOKENS.teal : TOKENS.sub}>{isToday(selected) ? 'Today' : 'Selected day'}</SectionLabel>
        <div style={{ fontSize: 15, fontWeight: 500, marginTop: 3 }}>{fmtDayLabel(selected)}</div>
        <div style={{ fontSize: 11.5, color: TOKENS.sub, marginTop: 2 }}>{selTasks.length === 0 ? 'Nothing scheduled' : `${selTasks.filter(t=>!t.done).length} open · ${selTasks.filter(t=>t.done).length} done`}</div>
      </div>
      <div style={{ overflow: 'auto' }}>
        {selTasks.map(t => (
          <CalMiniRow key={t.id} task={t} app={app}
            trailing={<button onClick={e=>{ e.stopPropagation(); app.scheduleTask(t.id, null); }} title="Remove from this day"
              style={{ ...btnReset, color: TOKENS.subSoft, width: 22, height: 22, borderRadius: 999, display: 'grid', placeItems: 'center' }}><Close size={12}/></button>}/>
        ))}
        {selTasks.length === 0 && (
          <div style={{ padding: '18px 16px 4px', textAlign: 'center', fontSize: 12.5, color: TOKENS.sub, lineHeight: 1.5 }}>
            Nothing here yet — add one below, or schedule an existing task.
          </div>
        )}
        <form onSubmit={addToDay} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderTop: `1px solid ${TOKENS.lineSoft}`, background: selTasks.length ? TOKENS.surfaceAlt : 'transparent' }}>
          <span style={{ width: 16, height: 16, borderRadius: 999, border: `1.5px dashed ${TOKENS.green}`, display: 'grid', placeItems: 'center', color: TOKENS.green, flexShrink: 0 }}><Plus size={10}/></span>
          <input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Add a task to this day…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit', color: TOKENS.ink }}/>
        </form>
      </div>
      {/* schedule an existing unscheduled task onto this day */}
      <div style={{ borderTop: `1px solid ${TOKENS.line}` }}>
        <button onClick={()=>setTrayOpen(o=>!o)} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', cursor: 'pointer' }}>
          <Clock size={13} style={{ color: TOKENS.sub }}/>
          <span style={{ flex: 1, textAlign: 'left', fontSize: 12.5, color: TOKENS.ink }}>Schedule something here</span>
          <span style={{ fontSize: 11, color: TOKENS.sub, fontVariantNumeric: 'tabular-nums' }}>{unscheduled.length}</span>
          <ChevD size={14} style={{ color: TOKENS.sub, transform: trayOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/>
        </button>
        {trayOpen && (
          <div style={{ maxHeight: 220, overflow: 'auto', borderTop: `1px solid ${TOKENS.lineSoft}`, background: TOKENS.surfaceAlt }}>
            {unscheduled.length === 0 && <div style={{ padding: '14px 16px', fontSize: 12, color: TOKENS.sub, textAlign: 'center' }}>Everything's scheduled. </div>}
            {unscheduled.map(t => (
              <button key={t.id} onClick={()=>app.scheduleTask(t.id, selected)} style={{ ...btnReset, width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px 8px 16px', borderTop: `1px solid ${TOKENS.lineSofter}`, cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: taskColor(app, t), flexShrink: 0 }}/>
                <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                <span style={{ color: TOKENS.green, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11 }}><Plus size={10}/></span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Screen frame={frame} app={app} active="calendar" onNav={onNav} onAsk={onAsk}
      title="Calendar" subtitle={app.density === 'calm' ? null : 'Schedule tasks onto days — they roll into Today and nudge you when due.'}
      crumbs={['Calendar']}>
      <div style={{ padding: mobile ? '16px' : '22px 30px 40px' }}>
        <div style={{ display: mobile ? 'flex' : 'grid', flexDirection: mobile ? 'column' : undefined,
          gridTemplateColumns: mobile ? undefined : 'minmax(0,1fr) 320px', gap: 16, alignItems: 'start' }}>
          {monthGrid}
          {dayPanel}
        </div>
      </div>
    </Screen>
  );
}

// ===== TODAY (agenda) =====
function AgendaCard({ label, labelColor, action, children }) {
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden' }}>
      <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${TOKENS.lineSoft}` }}>
        <SectionLabel color={labelColor}>{label}</SectionLabel>
        <div style={{ flex: 1 }}/>
        {action}
      </div>
      {children}
    </div>
  );
}

export function AgendaScreen({ app, frame, onNav, onAsk, variant }) {
  const mobile = frame === 'mobile';
  const today = todayKey();
  const overdue = app.overdueTasks().slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const todays = app.tasksForDate(today);
  const open = todays.filter(t => !t.done);
  const done = todays.filter(t => t.done);
  const empty = overdue.length === 0 && todays.length === 0;

  const calBtn = (
    <button onClick={()=>onNav('calendar')} style={{ ...btnReset, padding: '7px 13px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`,
      color: TOKENS.ink, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}><CalMonth size={13} style={{ color: TOKENS.sub }}/>Calendar</button>
  );

  return (
    <Screen frame={frame} app={app} active="agenda" onNav={onNav} onAsk={onAsk}
      title="Today" subtitle={fmtDayLabel(today)} crumbs={['Today']} headerRight={calBtn}>
      <div style={{ padding: mobile ? '18px 16px 40px' : '22px 30px 40px', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {empty && (
          <div style={{ padding: '46px 24px', textAlign: 'center', background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius }}>
            <div style={{ width: 46, height: 46, borderRadius: 999, background: TOKENS.greenTint, color: TOKENS.green, display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}><Leaf size={22}/></div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 5 }}>Nothing scheduled for today</div>
            <div style={{ fontSize: 13, color: TOKENS.sub, lineHeight: 1.55, maxWidth: 360, margin: '0 auto 16px' }}>A clear day is allowed. When you're ready, open the calendar and drop a task or two onto today.</div>
            <button onClick={()=>onNav('calendar')} style={{ ...btnReset, padding: '9px 18px', borderRadius: 999, background: TOKENS.green, color: '#fff', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 7 }}><CalMonth size={14}/>Open calendar</button>
          </div>
        )}

        {overdue.length > 0 && (
          <AgendaCard label={`Overdue · ${overdue.length}`} labelColor={TOKENS.warn}
            action={<button onClick={()=>overdue.forEach(t => app.scheduleTask(t.id, today))}
              style={{ ...btnReset, padding: '4px 11px', borderRadius: 999, background: TOKENS.warnSoft, color: TOKENS.warn, fontSize: 11.5, fontWeight: 500 }}>Move all to today</button>}>
            {overdue.map(t => <TaskRow key={t.id} task={t} app={app} showProject showGoal mobile={mobile}/>)}
          </AgendaCard>
        )}

        {todays.length > 0 && (
          <AgendaCard label={open.length > 0 ? `Today · ${open.length} to do` : 'Today · all done'} labelColor={TOKENS.green}>
            {open.concat(done).map(t => <TaskRow key={t.id} task={t} app={app} showProject showGoal mobile={mobile}/>)}
          </AgendaCard>
        )}
      </div>
    </Screen>
  );
}
