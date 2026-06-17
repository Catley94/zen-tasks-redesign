import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from './components/shared/AppContext.jsx';
import { useAppState } from './state/useAppState.jsx';
import TodayScreen from './components/screens/TodayScreen.jsx';
import GoalScreen from './components/screens/GoalScreen.jsx';
import ProjectScreen from './components/screens/ProjectScreen.jsx';
import CategoriesScreen from './components/screens/CategoriesScreen.jsx';
import NotesScreen from './components/screens/NotesScreen.jsx';
import AgendaScreen from './components/screens/AgendaScreen.jsx';
import CalendarScreen from './components/screens/CalendarScreen.jsx';
import ZenScreen from './components/screens/ZenScreen.jsx';
import ReviewScreen from './components/screens/ReviewScreen.jsx';
import SettingsScreen from './components/screens/SettingsScreen.jsx';
import OnboardingScreen from './components/screens/OnboardingScreen.jsx';

function AppShell() {
  const app = useAppState();
  const navigate = useNavigate();
  const location = useLocation();

  const onNav = (route) => {
    if (!route) return;
    const [base, seg, seg2] = route.split(':');
    if (base === 'today') return navigate('/focus');
    if (base === 'goal') return navigate(seg ? `/goals/${seg}${seg2 ? '/' + seg2 : ''}` : '/focus');
    if (base === 'project') return navigate(seg ? `/projects/${seg}` : '/focus');
    if (base === 'categories') return navigate(seg ? `/categories/${seg}` : '/categories');
    if (base === 'notes') return navigate(seg ? `/notes/${seg}` : '/notes');
    if (base === 'agenda') return navigate('/agenda');
    if (base === 'calendar') return navigate('/calendar');
    if (base === 'zen') return navigate('/zen');
    if (base === 'review') return navigate('/review');
    if (base === 'settings') return navigate('/settings');
    if (base === 'onboarding') return navigate('/onboarding');
  };

  const frame = 'desktop';

  const ctx = { app, onNav, frame };

  return (
    <AppContext.Provider value={ctx}>
      <Routes>
        <Route path="/" element={<Navigate to="/focus" replace />} />
        <Route path="/focus" element={<TodayScreen />} />
        <Route path="/goals/:goalId" element={<GoalScreen />} />
        <Route path="/goals/:goalId/:phase" element={<GoalScreen />} />
        <Route path="/projects/:projectId" element={<ProjectScreen />} />
        <Route path="/categories" element={<CategoriesScreen />} />
        <Route path="/categories/:categoryId" element={<CategoriesScreen />} />
        <Route path="/notes" element={<NotesScreen />} />
        <Route path="/notes/:collectionId" element={<NotesScreen />} />
        <Route path="/agenda" element={<AgendaScreen />} />
        <Route path="/calendar" element={<CalendarScreen />} />
        <Route path="/zen" element={<ZenScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default function App() {
  return <AppShell />;
}
