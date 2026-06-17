import React from 'react';
import { useApp } from '../shared/AppContext.jsx';
import { TOKENS, btnReset } from '../../data/seeds.js';
import { Screen } from '../shared/screen.jsx';
import { TaskRow, SectionLabel, ZenLine } from '../shared/primitives.jsx';
import { CalMonth, Leaf } from '../shared/icons.jsx';
import { fmtDayLabel, todayKey } from '../../lib/dates.js';

function AgendaCard({ label, labelColor, action, children }) {
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius, overflow: 'hidden' }}>
      <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${TOKENS.lineSoft}` }}>
        <SectionLabel color={labelColor}>{label}</SectionLabel>
        <div style={{ flex: 1 }} />
        {action}
      </div>
      {children}
    </div>
  );
}

export default function AgendaScreen() {
  const { app, onNav, frame } = useApp();
  const mobile = frame === 'mobile';
  const today = todayKey();
  const overdue = app.overdueTasks().slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const todays = app.tasksForDate(today);
  const open = todays.filter(t => !t.done);
  const done = todays.filter(t => t.done);
  const empty = overdue.length === 0 && todays.length === 0;

  const calBtn = (
    <button onClick={() => onNav('calendar')} style={{ ...btnReset, padding: '7px 13px', borderRadius: 999, background: TOKENS.bg, border: `1px solid ${TOKENS.line}`, color: TOKENS.ink, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <CalMonth size={13} style={{ color: TOKENS.sub }} />Calendar
    </button>
  );

  return (
    <Screen app={app} active="agenda" onNav={onNav} frame={frame}
      title="Today" subtitle={fmtDayLabel(today)} crumbs={['Today']} headerRight={calBtn}>
      <div style={{ padding: mobile ? '18px 16px 40px' : '22px 30px 40px', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {empty && (
          <div style={{ padding: '46px 24px', textAlign: 'center', background: TOKENS.surface, border: `1px solid ${TOKENS.line}`, borderRadius: TOKENS.radius }}>
            <div style={{ width: 46, height: 46, borderRadius: 999, background: TOKENS.greenTint, color: TOKENS.green, display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}><Leaf size={22} /></div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 5 }}>Nothing scheduled for today</div>
            <div style={{ fontSize: 13, color: TOKENS.sub, lineHeight: 1.55, maxWidth: 360, margin: '0 auto 16px' }}>A clear day is allowed. When you're ready, open the calendar and drop a task or two onto today.</div>
            <button onClick={() => onNav('calendar')} style={{ ...btnReset, padding: '9px 18px', borderRadius: 999, background: TOKENS.green, color: '#fff', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 7 }}><CalMonth size={14} />Open calendar</button>
          </div>
        )}

        {!empty && (open.length + overdue.length) > 0 && (
          <ZenLine app={app} chips={[
            { chip: 'Help me shape today', label: 'Today', context: `Scheduled for today: ${todays.map(t => t.title).join('; ') || 'nothing'}. Overdue: ${overdue.map(t => t.title).join('; ') || 'none'}.`, seed: `Here's my day. Help me decide what to focus on and what can wait.` },
            ...(overdue.length > 0 ? [{ chip: `Triage ${overdue.length} overdue`, label: 'Overdue', context: `Overdue tasks: ${overdue.map(t => t.title).join('; ')}.`, seed: `I have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}. Help me decide what to reschedule, drop, or do now.` }] : []),
          ]}>
            {open.length > 0 ? <>You've got <b>{open.length}</b> thing{open.length > 1 ? 's' : ''} scheduled for today{overdue.length > 0 ? <>, and <b>{overdue.length}</b> overdue</> : ''}. Want a hand shaping it?</>
              : <><b>{overdue.length}</b> overdue, nothing new for today. Want to clear the backlog?</>}
          </ZenLine>
        )}

        {overdue.length > 0 && (
          <AgendaCard label={`Overdue · ${overdue.length}`} labelColor={TOKENS.warn}
            action={<button onClick={() => overdue.forEach(t => app.scheduleTask(t.id, today))}
              style={{ ...btnReset, padding: '4px 11px', borderRadius: 999, background: TOKENS.warnSoft, color: TOKENS.warn, fontSize: 11.5, fontWeight: 500 }}>Move all to today</button>}>
            {overdue.map(t => <TaskRow key={t.id} task={t} app={app} showProject showGoal mobile={mobile} />)}
          </AgendaCard>
        )}

        {todays.length > 0 && (
          <AgendaCard label={open.length > 0 ? `Today · ${open.length} to do` : 'Today · all done'} labelColor={TOKENS.green}>
            {open.concat(done).map(t => <TaskRow key={t.id} task={t} app={app} showProject showGoal mobile={mobile} />)}
          </AgendaCard>
        )}
      </div>
    </Screen>
  );
}
