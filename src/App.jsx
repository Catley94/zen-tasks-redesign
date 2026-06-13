import React, { useState, useEffect } from 'react';
import { useAppState } from './state';
import { TaskDetailModal } from './modals/task-detail';
import { QuickAddTaskModal } from './modals/quick-add';
import { ProfileManager } from './components/primitives';

import { TodayScreen, GoalScreen, ProjectScreen } from './screens/screens-a';
import { ZenScreen, OnboardingScreen, ReviewScreen, SettingsScreen, EmptyScreen, NudgeScreen } from './screens/screens-b';
import { CategoriesScreen } from './screens/categories';
import { CalendarScreen, AgendaScreen } from './screens/calendar';

function LiveApp() {
  const app = useAppState();
  const [route, setRoute] = useState('today');
  const onNav = (id) => setRoute(id || 'today');

  // First-run tour on desktop
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem('zen-tour-seen') === '1'; } catch (e) {}
    if (!seen) {
      const t = setTimeout(() => app.startTour(), 700);
      return () => clearTimeout(t);
    }
  }, []);

  const parts = route.split(':');
  const base = parts[0];
  const seg = parts[1] || null;
  const seg2 = parts[2] || null;
  const common = { app, variant: 'a', frame: 'desktop', onNav };

  let content;
  if (base === 'goal') content = <GoalScreen {...common} goalId={seg || app.primaryGoalId} initialPhase={seg2}/>;
  else if (base === 'project') content = <ProjectScreen {...common} projectId={seg || 'p1'}/>;
  else if (base === 'categories') content = <CategoriesScreen {...common} categoryId={seg || undefined}/>;
  else if (base === 'agenda') content = <AgendaScreen {...common}/>;
  else if (base === 'calendar') content = <CalendarScreen {...common}/>;
  else if (base === 'zen') content = <ZenScreen {...common}/>;
  else if (base === 'review') content = <ReviewScreen {...common}/>;
  else if (base === 'settings') content = <SettingsScreen {...common}/>;
  else if (base === 'onboarding') content = <OnboardingScreen {...common}/>;
  else if (base === 'empty') content = <EmptyScreen {...common}/>;
  else if (base === 'nudge') content = <NudgeScreen {...common}/>;
  else content = <TodayScreen {...common}/>;

  return (
    <div
      className={app.dyslexiaFont ? 'dys-font' : undefined}
      style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {content}
      {app.openTaskId && <TaskDetailModal app={app} taskId={app.openTaskId} onClose={app.closeTask}/>}
      {app.quickAdd && <QuickAddTaskModal app={app} onClose={app.closeQuickAdd}/>}
      {app.manageSpacesOpen && <ProfileManager app={app} onClose={app.closeManageSpaces}/>}
    </div>
  );
}

export default function App() {
  return <LiveApp />;
}
