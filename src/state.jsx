import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GOALS, PROJECTS, TASKS, CATEGORIES, FOCUS_TASK_IDS, NOTIFICATIONS, PROJECT_STALE_DAYS, lastActiveDays, TASK_SECTIONS, PROJECT_SECTIONS, UPCOMING } from './lib/data';
import { friendlyDue, fmtDayLabel, diffDays, isToday, reminderInfo, todayKey, seedDate, isPast } from './lib/dates';
import { UNCAT } from './domain/constants';
import * as select from './domain/selectors';
import { buildZenSystemPrompt, callZen } from './domain/zen';

export function useAppState() {
  const [profiles, setProfiles] = useState(() => [
    { id: 'personal', name: 'Personal', color: '#5a8a3a' },
    { id: 'work', name: 'Work', color: '#2a6f8a' },
  ]);
  const [activeProfileId, setActiveProfileId] = useState('personal');
  const [allTasks, setTasks] = useState(() => TASKS.map((t, i) => ({ ...t, profileId: 'personal', subtasks: (t.subtasks||[]).map(s=>({...s})), comments: (t.comments||[]).map(c=>({...c})), date: seedDate(t.due, i), reminder: 'same-day' })));
  const tasks = useMemo(() => allTasks.filter(t => (t.profileId || 'personal') === activeProfileId), [allTasks, activeProfileId]);
  const [navRecency, setNavRecency] = useState({});
  const allTasksRef = useRef([]);
  const projectGoalsRef = useRef({});
  const touchProject = useCallback((pid) => {
    if (!pid) return;
    const now = Date.now();
    const gids = Object.keys(projectGoalsRef.current[pid] || {});
    setNavRecency(m => { const n = { ...m, [pid]: now }; gids.forEach(g => { n[g] = now; }); return n; });
  }, []);
  const touchForTask = useCallback((tid) => {
    const t = allTasksRef.current.find(x => x.id === tid);
    if (t && t.projectId) touchProject(t.projectId);
  }, [touchProject]);
  const toggleTask = useCallback((id) => { setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t)); touchForTask(id); }, [touchForTask]);
  const toggleSub = useCallback((tid, sid) => { setTasks(ts => ts.map(t => t.id !== tid ? t : { ...t, subtasks: t.subtasks.map(s => s.id === sid ? { ...s, done: !s.done } : s) })); touchForTask(tid); }, [touchForTask]);
  const addTask = useCallback(({ title, categoryId = null, projectId = null, priority = 'seedling', due = '—', est = '—', date = null }) => {
    const id = 'tn' + Date.now();
    setTasks(ts => [...ts, { id, title, projectId, categoryId, priority, due: date ? friendlyDue(date) : due, est, done: false, date, reminder: 'same-day', profileId: activeProfileId, tags: [], subtasks: [], notes: '', comments: [], history: [] }]);
    if (projectId) touchProject(projectId);
    return id;
  }, [activeProfileId, touchProject]);
  const setTaskCategory = useCallback((tid, categoryId) => setTasks(ts => ts.map(t => t.id === tid ? { ...t, categoryId } : t)), []);
  const deleteTask = useCallback((id) => {
    setTasks(ts => ts.filter(t => t.id !== id));
    setFocusIds(s => { if (!s.has(id)) return s; const n = new Set(s); n.delete(id); return n; });
    setTaskSections(m => { if (!(id in m)) return m; const n = { ...m }; delete n[id]; return n; });
    setOpenTaskId(cur => cur === id ? null : cur);
  }, []);
  const [quickAdd, setQuickAdd] = useState(null);
  const openQuickAdd = useCallback((opts = {}) => setQuickAdd(opts || {}), []);
  const closeQuickAdd = useCallback(() => setQuickAdd(null), []);
  const [taskSections, setTaskSections] = useState(() => ({ ...TASK_SECTIONS }));
  const sectionOf = useCallback((tid) => taskSections[tid] ?? null, [taskSections]);
  const setTaskSection = useCallback((tid, sid) => setTaskSections(m => ({ ...m, [tid]: sid || null })), []);
  const placeTask = useCallback((tid, { projectId = null, categoryId = null, sectionId = null }) => {
    setTasks(ts => ts.map(t => t.id === tid ? { ...t, projectId, categoryId } : t));
    setTaskSections(m => ({ ...m, [tid]: projectId ? sectionId : null }));
    if (projectId) touchProject(projectId);
  }, [touchProject]);
  const updateTask = useCallback((id, patch) => { setTasks(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t)); touchForTask(id); }, [touchForTask]);
  const addSubtask = useCallback((tid, title) => { setTasks(ts => ts.map(t => t.id !== tid ? t : { ...t, subtasks: [...t.subtasks, { id: 's' + Date.now(), title, done: false }] })); touchForTask(tid); }, [touchForTask]);
  const addComment = useCallback((tid, text) => setTasks(ts => ts.map(t => {
    if (t.id !== tid) return t;
    const d = new Date(); const hh = String(d.getHours()).padStart(2, '0'); const mm = String(d.getMinutes()).padStart(2, '0');
    return { ...t, comments: [...(t.comments || []), { id: 'cm' + Date.now(), author: 'You', when: `Today ${hh}:${mm}`, text }] };
  })), []);
  const addCommentTouched = useCallback((tid, text) => { addComment(tid, text); touchForTask(tid); }, [addComment, touchForTask]);
  const updateComment = useCallback((tid, cid, text) => setTasks(ts => ts.map(t => t.id !== tid ? t : { ...t, comments: (t.comments||[]).map(c => c.id === cid ? { ...c, text, edited: true } : c) })), []);
  const deleteComment = useCallback((tid, cid) => setTasks(ts => ts.map(t => t.id !== tid ? t : { ...t, comments: (t.comments||[]).filter(c => c.id !== cid) })), []);
  const [openTaskId, setOpenTaskId] = useState(null);
  const openTask = useCallback((id) => setOpenTaskId(id), []);
  const closeTask = useCallback(() => setOpenTaskId(null), []);
  const [focusIds, setFocusIds] = useState(() => new Set(FOCUS_TASK_IDS));
  const toggleFocus = useCallback((id) => setFocusIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);
  const [aiMode, setAiModeRaw] = useState('assistant');
  const [density, setDensity] = useState('calm');
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const startTour = useCallback(() => { setTourStep(0); setTourOpen(true); }, []);
  const endTour = useCallback(() => { setTourOpen(false); try { localStorage.setItem('zen-tour-seen', '1'); } catch (e) {} }, []);
  const setTourStepSafe = useCallback((n) => setTourStep(n), []);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const openMoreSheet = useCallback(() => setMoreSheetOpen(true), []);
  const closeMoreSheet = useCallback(() => setMoreSheetOpen(false), []);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [notifications, setNotifications] = useState(() => NOTIFICATIONS.map(n => ({ ...n })));
  const [modeToast, setModeToast] = useState(null);
  const toastTimer = useRef(null);
  const clearToastTimer = useCallback(() => { if (toastTimer.current) { clearTimeout(toastTimer.current); toastTimer.current = null; } }, []);
  const pauseModeToast = useCallback(() => clearToastTimer(), [clearToastTimer]);
  const markNotifRead = useCallback((id) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n)), []);
  const markAllNotifsRead = useCallback(() => setNotifications(ns => ns.map(n => ({ ...n, read: true }))), []);
  const notify = useCallback((note) => {
    const full = { id: 'n' + Date.now(), read: false, when: 'Just now', kind: 'reminder', ...note };
    setNotifications(ns => [full, ...ns]);
    setModeToast(full);
    clearToastTimer();
    toastTimer.current = setTimeout(() => { setModeToast(null); toastTimer.current = null; }, 5000);
  }, [clearToastTimer]);
  const emitReminderNote = useCallback((title, iso, reminder) => {
    if (!iso) return;
    const info = reminderInfo(iso, reminder);
    if (!info) {
      notify({ title: 'Scheduled · ' + friendlyDue(iso), summary: `"${title}" is set for ${fmtDayLabel(iso)}.`,
        body: `"${title}" is on your calendar for ${fmtDayLabel(iso)}. Add a reminder if you'd like a nudge beforehand.` });
      return;
    }
    if (diffDays(info.fireISO) <= 0) {
      const when = friendlyDue(iso);
      const dueText = /today/i.test(when) ? 'due today' : 'coming up ' + when.toLowerCase();
      notify({ title: 'Reminder · ' + when, summary: `"${title}" is ${dueText}.`,
        body: `Heads-up — "${title}" is ${/today/i.test(when) ? 'due today' : 'coming up: ' + fmtDayLabel(iso)}.` });
    } else {
      notify({ title: 'Reminder set', summary: `I'll nudge you ${info.phrase}.`,
        body: `Reminder saved for "${title}" — I'll nudge you ${info.phrase}, ahead of ${fmtDayLabel(iso)}.` });
    }
  }, [notify]);
  const scheduleTask = useCallback((id, iso) => {
    let title = '', reminder = 'none';
    setTasks(ts => ts.map(t => { if (t.id !== id) return t; title = t.title; reminder = t.reminder || 'none'; return { ...t, date: iso, due: iso ? friendlyDue(iso) : '—' }; }));
    if (iso) emitReminderNote(title, iso, reminder);
    touchForTask(id);
  }, [emitReminderNote, touchForTask]);
  const setReminder = useCallback((id, reminder) => {
    let title = '', date = null;
    setTasks(ts => ts.map(t => { if (t.id !== id) return t; title = t.title; date = t.date; return { ...t, reminder }; }));
    if (date && reminder !== 'none') emitReminderNote(title, date, reminder);
  }, [emitReminderNote]);
  const setAiMode = useCallback((m) => {
    setAiModeRaw(prev => {
      if (m === prev) return prev;
      const isMgr = m === 'manager';
      const note = {
        id: 'mode-' + Date.now(), kind: 'ai', read: false, when: 'Just now',
        title: isMgr ? 'Switched to Manager mode' : 'Switched to Assistant mode',
        summary: isMgr ? "I'm here to help you manage — tell me what to add, change or complete."
                       : "I'm here to help — ask me anything and I'll advise; you stay in control.",
        body: isMgr
          ? "You're in Manager mode now.\n\nI'll sit front-and-centre. Tell me what you want in plain words — \"add a task to call Ava\", \"mark the logo sketches done\", \"break this into three steps\" — and I'll make the change, then show you what I did. Bigger life moves, like parking a goal, I'll still check with you first.\n\nThe normal screens stay fully usable — I'm just an extra, conversational way to get things done."
          : "You're in Assistant mode now.\n\nI'll stay out of the way — summon me with ⌘K or the corner leaf. I can suggest what to start with, explain why a project's gone quiet, replay a note you wrote, or summarise your week. I won't change your tasks on my own; anything I propose comes as a suggestion you tap to apply.",
      };
      setNotifications(ns => [note, ...ns]);
      setModeToast(note);
      clearToastTimer();
      toastTimer.current = setTimeout(() => { setModeToast(null); toastTimer.current = null; }, 6000);
      return m;
    });
  }, [clearToastTimer]);
  const dismissModeToast = useCallback(() => { clearToastTimer(); setModeToast(null); }, [clearToastTimer]);
  const [primaryGoalRaw, setPrimaryGoalId] = useState('g1');
  const [allProjects, setProjects] = useState(() => PROJECTS.map(p => ({ ...p, profileId: 'personal' })));
  const projects = useMemo(() => allProjects.filter(p => (p.profileId||'personal') === activeProfileId), [allProjects, activeProfileId]);
  const projectById = useCallback((id) => allProjects.find(p => p.id === id), [allProjects]);
  const addProject = useCallback(({ name, color } = {}) => {
    const id = 'pn' + Date.now();
    const palette = ['#5a8a3a', '#2a8a8a', '#8a6a3a', '#3a8a6e', '#a06a3a', '#6e8a3a'];
    setProjects(ps => [...ps, { id, name: name || 'Untitled project', color: color || palette[ps.length % palette.length], goalIds: [], phaseId: null, progress: 0, lastActive: 'just now', status: 'active', note: '', profileId: activeProfileId }]);
    touchProject(id);
    return id;
  }, [activeProfileId, touchProject]);
  const updateProject = useCallback((id, patch) => { setProjects(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p)); touchProject(id); }, [touchProject]);
  const [allCategories, setCategories] = useState(() => CATEGORIES.map(c => ({ ...c, profileId: 'personal' })));
  const categories = useMemo(() => allCategories.filter(c => (c.profileId||'personal') === activeProfileId), [allCategories, activeProfileId]);
  const addCategory = useCallback((cat) => {
    const id = 'c' + Date.now();
    setCategories(cs => [...cs, { id, icon: 'tag', color: '#5a8a3a', profileId: activeProfileId, ...cat }]);
    return id;
  }, [activeProfileId]);
  const updateCategory = useCallback((id, patch) => setCategories(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c)), []);
  const [projectStatus, setProjectStatusMap] = useState({});
  const statusOf = useCallback((pid) => projectStatus[pid] ?? (PROJECTS.find(p => p.id === pid) || {}).status, [projectStatus]);
  const setProjectStatus = useCallback((pid, status) => { setProjectStatusMap(m => ({ ...m, [pid]: status })); touchProject(pid); }, [touchProject]);
  const [pinnedProjectIds, setPinnedProjectIds] = useState(() => new Set(['p4']));
  const isProjectPinned = useCallback((pid) => pinnedProjectIds.has(pid), [pinnedProjectIds]);
  const togglePinProject = useCallback((pid) => setPinnedProjectIds(s => {
    const n = new Set(s); n.has(pid) ? n.delete(pid) : n.add(pid); return n;
  }), []);
  const pinNudgedRef = useRef(new Set());
  useEffect(() => {
    pinnedProjectIds.forEach(pid => {
      if (pinNudgedRef.current.has(pid)) return;
      const p = allProjects.find(x => x.id === pid);
      if (!p) return;
      const d = lastActiveDays(p.lastActive);
      if (d != null && d > PROJECT_STALE_DAYS) {
        pinNudgedRef.current.add(pid);
        const note = {
          id: 'pin-' + pid, read: false, when: 'This morning', kind: 'pin-dormant',
          title: `"${p.name}" is pinned, but resting`,
          summary: `Kept in view, yet untouched for ${d} days.`,
          body: `You pinned "${p.name}" to keep it close — but it hasn't moved in ${d} days. No pressure: sometimes a pin outlives the plan. Want to pick it up with one small step, or unpin it and let it rest for now?`,
          ctaProjectId: pid,
        };
        setNotifications(ns => ns.some(n => n.id === note.id) ? ns : [note, ...ns]);
      }
    });
  }, [pinnedProjectIds, allProjects]);
  const deleteCategory = useCallback((id) => {
    setCategories(cs => cs.filter(c => c.id !== id));
    setTasks(ts => ts.map(t => t.categoryId === id ? { ...t, categoryId: null } : t));
  }, []);
  const [projectGoals, setProjectGoals] = useState(() => {
    const m = {};
    PROJECTS.forEach(p => {
      const entry = {};
      (p.goalIds || []).forEach(gid => {
        const g = GOALS.find(x => x.id === gid);
        const owns = g && g.phases.some(ph => ph.id === p.phaseId);
        entry[gid] = owns ? p.phaseId : null;
      });
      m[p.id] = entry;
    });
    return m;
  });
  const setProjectGoalIds = useCallback((pid, goalIds) => setProjectGoals(m => {
    const prev = m[pid] || {};
    const next = {};
    goalIds.forEach(gid => { next[gid] = (gid in prev) ? prev[gid] : null; });
    return { ...m, [pid]: next };
  }), []);
  const setProjectPhase = useCallback((pid, gid, phaseId) => setProjectGoals(m => ({
    ...m, [pid]: { ...(m[pid]||{}), [gid]: phaseId }
  })), []);
  const [allGoals, setAllGoals] = useState(() => GOALS.map(g => ({ ...g, profileId: 'personal' })));
  const goals = useMemo(() => allGoals.filter(g => (g.profileId||'personal') === activeProfileId), [allGoals, activeProfileId]);
  const goalById = useCallback((id) => allGoals.find(g => g.id === id), [allGoals]);
  const addGoal = useCallback(({ name, overarching = '', color } = {}) => {
    const id = 'gn' + Date.now();
    const palette = ['#3f6e3a', '#2a8a8a', '#8a6a3a', '#7a4f8a', '#a06a3a'];
    setAllGoals(gs => [...gs, {
      id, name: name || 'Untitled goal', overarching, enthusiasm: '', enthusiasmWhen: 'just now',
      color: color || palette[gs.length % palette.length], icon: 'leaf', lastTouched: 'just now',
      phases: [{ id: id + '-ph1', name: 'First steps', order: 1, description: 'Sketch the shape of this goal.', status: 'active' }],
      profileId: activeProfileId,
    }]);
    setNavRecency(m => ({ ...m, [id]: Date.now() }));
    return id;
  }, [activeProfileId]);
  const updateGoal = useCallback((id, patch) => {
    setAllGoals(gs => gs.map(g => g.id === id ? { ...g, ...patch } : g));
    setNavRecency(m => ({ ...m, [id]: Date.now() }));
  }, []);
  const clearDatabase = useCallback(() => {
    try { Object.keys(localStorage).filter(k => k.startsWith('zen-')).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    window.location.reload();
  }, []);
  const primaryGoalId = useMemo(() => (goals.find(g => g.id === primaryGoalRaw)?.id) ?? (goals[0]?.id ?? null), [goals, primaryGoalRaw]);
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const switchProfile = useCallback((id) => { setActiveProfileId(id); setOpenTaskId(null); }, []);
  const [manageSpacesOpen, setManageSpacesOpen] = useState(false);
  const openManageSpaces = useCallback(() => setManageSpacesOpen(true), []);
  const closeManageSpaces = useCallback(() => setManageSpacesOpen(false), []);
  const addProfile = useCallback(({ name, color } = {}) => {
    const id = 'pf' + Date.now();
    setProfiles(ps => [...ps, { id, name: name || 'New profile', color: color || '#8a6a3a' }]);
    return id;
  }, []);
  const updateProfile = useCallback((id, patch) => setProfiles(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p)), []);
  const deleteProfile = useCallback((id) => setProfiles(ps => {
    if (ps.length <= 1) return ps;
    const remaining = ps.filter(p => p.id !== id);
    setTasks(ts => ts.filter(t => (t.profileId||'personal') !== id));
    setProjects(prj => prj.filter(p => (p.profileId||'personal') !== id));
    setCategories(cs => cs.filter(c => (c.profileId||'personal') !== id));
    setAllGoals(gs => gs.filter(g => (g.profileId||'personal') !== id));
    setActiveProfileId(cur => cur === id ? remaining[0].id : cur);
    return remaining;
  }), []);
  const goalIdsOf = useCallback((pid) => Object.keys(projectGoals[pid] || {}), [projectGoals]);
  const projectsForGoal = useCallback((gid) => projects.filter(p => gid in (projectGoals[p.id]||{})), [projects, projectGoals]);
  const phaseForProjectInGoal = useCallback((pid, gid) => (projectGoals[pid]||{})[gid] ?? null, [projectGoals]);
  const goalsForProject = useCallback((pid) => goalIdsOf(pid).map(gid => allGoals.find(g => g.id === gid)).filter(Boolean), [goalIdsOf, allGoals]);
  const goalsForTask = useCallback((tid) => {
    const t = allTasks.find(x => x.id === tid); if (!t) return [];
    return goalIdsOf(t.projectId).map(gid => allGoals.find(g => g.id === gid)).filter(Boolean);
  }, [goalIdsOf, allTasks, allGoals]);
  const tasksForCategory = useCallback((cid) => select.tasksForCategory(tasks, cid), [tasks]);
  const categoryById = useCallback((id) => allCategories.find(c => c.id === id), [allCategories]);
  const tasksForDate = useCallback((iso) => select.tasksForDate(tasks, iso), [tasks]);
  const todayTasks = useCallback(() => select.todayTasks(tasks), [tasks]);
  const overdueTasks = useCallback(() => select.overdueTasks(tasks), [tasks]);
  const unscheduledTasks = useCallback(() => select.unscheduledTasks(tasks), [tasks]);
  // Weekly Review aggregation (what advanced this week) — derived by the model.
  const weeklyReview = useCallback(() => select.weeklyReview(tasks, projectById, goals), [tasks, projectById, goals]);
  // The custom sections a project defines (raw — empty if none; views add a default if needed).
  const sectionsForProject = useCallback((pid) => PROJECT_SECTIONS[pid] || [], []);
  // The goal a fresh "Focus" / phase context hangs off — the resolved primary goal.
  const primaryGoal = goalById(primaryGoalId);
  allTasksRef.current = allTasks;
  projectGoalsRef.current = projectGoals;
  return { tasks, toggleTask, toggleSub, addTask, setTaskCategory, deleteTask, updateTask, addSubtask, addComment: addCommentTouched, updateComment, deleteComment, scheduleTask, notify, openTaskId, openTask, closeTask, focusIds, toggleFocus, aiMode, setAiMode,
    density, setDensity, dyslexiaFont, setDyslexiaFont,
    navRecency, touchProject,
    tourOpen, tourStep, startTour, endTour, setTourStep: setTourStepSafe,
    moreSheetOpen, openMoreSheet, closeMoreSheet,
    profiles, activeProfileId, activeProfile, switchProfile, addProfile, updateProfile, deleteProfile, manageSpacesOpen, openManageSpaces, closeManageSpaces,
    notifications, markNotifRead, markAllNotifsRead, modeToast, dismissModeToast, pauseModeToast,
    goals, primaryGoalId, primaryGoal, setPrimaryGoalId, goalById, goalIdsOf, projectsForGoal, phaseForProjectInGoal,
    goalsForProject, goalsForTask, projectGoals, setProjectGoalIds, setProjectPhase,
    addGoal, updateGoal, clearDatabase,
    projects, projectById, addProject, updateProject,
    categories, addCategory, updateCategory, deleteCategory, tasksForCategory, categoryById,
    quickAdd, openQuickAdd, closeQuickAdd,
    tasksForDate, todayTasks, overdueTasks, unscheduledTasks, weeklyReview, sectionsForProject, upcoming: UPCOMING, sectionOf, setTaskSection, placeTask, setReminder, statusOf, setProjectStatus,
    pinnedProjectIds, isProjectPinned, togglePinProject };
}

export function useZenAI(extraCtx = '') {
  const DEFAULT_CHAT = [
    { role: 'assistant', text: "Morning. You're working towards two things — Zen Tasks shipping, and a quieter place to live. Today's focus mostly serves the first one. Worth giving the second a moment too?" },
  ];
  const [messages, setMessages] = useState(DEFAULT_CHAT);
  const [busy, setBusy] = useState(false);
  const send = useCallback(async (userText) => {
    setMessages(m => [...m, { role: 'user', text: userText }]);
    setBusy(true);
    try {
      const systemPrompt = buildZenSystemPrompt(GOALS, PROJECTS, extraCtx);
      const reply = await callZen(systemPrompt, userText);
      setMessages(m => [...m, { role: 'assistant', text: reply.trim() }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: "(I couldn't reach my brain just now — try again in a moment.)" }]);
    } finally { setBusy(false); }
  }, [extraCtx]);
  return { messages, send, busy };
}
