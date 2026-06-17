import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  TASKS, PROJECTS, GOALS, CATEGORIES, NOTE_COLLECTIONS, NOTES,
  FOCUS_TASK_IDS, TASK_SECTIONS, NOTIFICATIONS, DEFAULT_CHAT, ZEN_NUDGES,
  PROJECT_STALE_DAYS, lastActiveDays,
} from '../data/seeds.js';
import {
  seedDate, friendlyDue, fmtDayLabel, diffDays, isPast, todayKey,
  reminderInfo, reminderState, formatTime, keyOf,
} from '../lib/dates.js';

const MAX_TASK_STACK = 3;

function draftSnapshot(t, sectionId) {
  return {
    title: t.title || '', notes: t.notes || '', priority: t.priority, est: t.est || '—',
    projectId: t.projectId || null, categoryId: t.categoryId || null, sectionId: sectionId ?? null,
    tags: [...(t.tags || [])], subtasks: (t.subtasks || []).map(s => ({ ...s })),
  };
}

export function useAppState() {
  const [profiles, setProfiles] = useState(() => [
    { id: 'personal', name: 'Personal', color: '#5a8a3a' },
    { id: 'work', name: 'Work', color: '#2a6f8a' },
  ]);
  const [activeProfileId, setActiveProfileId] = useState('personal');
  const [allTasks, setTasks] = useState(() => TASKS.map((t, i) => {
    const date = seedDate(t.due, i);
    const reminders = (t.reminders || []).map(r => ({ ...r, dateISO: r.dateISO || date }));
    return { ...t, profileId: 'personal', subtasks: (t.subtasks||[]).map(s=>({...s})), comments: (t.comments||[]).map(c=>({...c})), reminders, date, reminder: 'same-day' };
  }));
  const tasks = useMemo(() => allTasks.filter(t => (t.profileId || 'personal') === activeProfileId), [allTasks, activeProfileId]);

  const [openStack, setOpenStack] = useState([]);
  const stackRef = useRef([]);
  const [taskGuard, setGuard] = useState(null);
  const guardRef = useRef(null);
  const pendingRef = useRef(null);
  const taskSectionsRef = useRef({});
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
    setTasks(ts => [...ts, { id, title, projectId, categoryId, priority, due: date ? friendlyDue(date) : due, est, done: false, date, reminder: 'same-day', reminders: [], profileId: activeProfileId, tags: [], subtasks: [], notes: '', history: [] }]);
    if (projectId) touchProject(projectId);
    return id;
  }, [activeProfileId, touchProject]);

  const setTaskCategory = useCallback((tid, categoryId) => setTasks(ts => ts.map(t => t.id === tid ? { ...t, categoryId } : t)), []);

  const deleteTask = useCallback((id) => {
    setTasks(ts => ts.filter(t => t.id !== id));
    setFocusIds(s => { if (!s.has(id)) return s; const n = new Set(s); n.delete(id); return n; });
    setTaskSections(m => { if (!(id in m)) return m; const n = { ...m }; delete n[id]; return n; });
    stackRef.current = stackRef.current.filter(e => e.id !== id); setOpenStack(stackRef.current);
    if (guardRef.current && guardRef.current.taskId === id) { setGuard(null); pendingRef.current = null; }
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

  const openTaskId = openStack.length ? openStack[openStack.length - 1].id : null;
  const applyStack = useCallback((next) => { stackRef.current = next; setOpenStack(next); }, []);

  const snapshotFor = useCallback((id) => {
    const t = allTasksRef.current.find(x => x.id === id); if (!t) return null;
    return draftSnapshot(t, taskSectionsRef.current[id] ?? null);
  }, []);

  const isTaskDirty = useCallback((id) => {
    const e = stackRef.current.find(x => x.id === id); if (!e) return false;
    const snap = snapshotFor(id); if (!snap) return false;
    return JSON.stringify(e.draft) !== JSON.stringify(snap);
  }, [snapshotFor]);

  const openTask = useCallback((id) => {
    const stack = stackRef.current;
    const existing = stack.find(e => e.id === id);
    if (existing) {
      if (stack[stack.length - 1].id === id) return;
      applyStack([...stack.filter(e => e.id !== id), existing]);
      return;
    }
    const t = allTasksRef.current.find(x => x.id === id); if (!t) return;
    let next = [...stack, { id, draft: snapshotFor(id) }];
    if (next.length > MAX_TASK_STACK) {
      const victim = next[0];
      if (isTaskDirty(victim.id)) {
        pendingRef.current = { type: 'evict', newId: id, victimId: victim.id };
        const vt = allTasksRef.current.find(x => x.id === victim.id);
        setGuard({ taskId: victim.id, title: vt ? vt.title : '' });
        return;
      }
      next = next.slice(1);
    }
    applyStack(next);
  }, [snapshotFor, isTaskDirty, applyStack]);

  const closeTask = useCallback(() => {
    const stack = stackRef.current;
    if (!stack.length) return;
    const top = stack[stack.length - 1];
    if (isTaskDirty(top.id)) {
      pendingRef.current = { type: 'pop', id: top.id };
      const t = allTasksRef.current.find(x => x.id === top.id);
      setGuard({ taskId: top.id, title: t ? t.title : '' });
      return;
    }
    applyStack(stack.slice(0, -1));
  }, [isTaskDirty, applyStack]);

  const closeAllTasks = useCallback(() => { pendingRef.current = null; setGuard(null); applyStack([]); }, [applyStack]);

  const setDraft = useCallback((id, patch) => {
    applyStack(stackRef.current.map(e => e.id === id
      ? { ...e, draft: { ...e.draft, ...(typeof patch === 'function' ? patch(e.draft) : patch) } } : e));
  }, [applyStack]);

  const commitDraft = useCallback((id) => {
    const e = stackRef.current.find(x => x.id === id); if (!e) return;
    const d = e.draft;
    setTasks(ts => ts.map(t => t.id === id ? { ...t, title: d.title, notes: d.notes, priority: d.priority, est: d.est,
      projectId: d.projectId, categoryId: d.categoryId, tags: [...d.tags], subtasks: d.subtasks.map(s => ({ ...s })) } : t));
    setTaskSections(m => ({ ...m, [id]: d.projectId ? (d.sectionId || null) : null }));
    if (d.projectId) touchProject(d.projectId);
    touchForTask(id);
  }, [touchProject, touchForTask]);

  const revertDraft = useCallback((id) => {
    const snap = snapshotFor(id); if (!snap) return;
    applyStack(stackRef.current.map(e => e.id === id ? { ...e, draft: snap } : e));
  }, [snapshotFor, applyStack]);

  const commitAndClose = useCallback((id) => {
    commitDraft(id);
    applyStack(stackRef.current.filter(e => e.id !== id));
  }, [commitDraft, applyStack]);

  const resolveGuard = useCallback((choice) => {
    const g = guardRef.current, p = pendingRef.current;
    if (!g) return;
    const id = g.taskId;
    if (choice === 'cancel') { setGuard(null); pendingRef.current = null; return; }
    if (choice === 'save') commitDraft(id);
    if (p && p.type === 'pop') {
      applyStack(stackRef.current.filter(e => e.id !== id));
    } else if (p && p.type === 'evict') {
      let ns = stackRef.current.filter(e => e.id !== p.victimId);
      if (!ns.some(e => e.id === p.newId)) {
        const t = allTasksRef.current.find(x => x.id === p.newId);
        if (t) ns = [...ns, { id: p.newId, draft: snapshotFor(p.newId) }];
      }
      applyStack(ns);
    }
    setGuard(null); pendingRef.current = null;
  }, [commitDraft, applyStack, snapshotFor]);

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
          ? "You're in Manager mode now.\n\nTell me what you want in plain words — \"add a task to call Ava\", \"mark the logo sketches done\" — and I'll make the change."
          : "You're in Assistant mode now.\n\nI'll stay out of the way — summon me with ⌘K or the corner leaf.",
      };
      setNotifications(ns => [note, ...ns]);
      setModeToast(note);
      clearToastTimer();
      toastTimer.current = setTimeout(() => { setModeToast(null); toastTimer.current = null; }, 6000);
      return m;
    });
  }, [clearToastTimer]);

  const dismissModeToast = useCallback(() => { clearToastTimer(); setModeToast(null); }, [clearToastTimer]);

  const [zenChat, setZenChat] = useState({ open: false, seed: null, context: '', label: null, suggestions: null, nonce: 0 });
  const openZenChat = useCallback((opts = {}) => setZenChat(c => ({ open: true, seed: opts.seed || null, context: opts.context || '', label: opts.label || null, suggestions: opts.suggestions || null, nonce: c.nonce + 1 })), []);
  const closeZenChat = useCallback(() => setZenChat(c => ({ ...c, open: false })), []);

  const notify = useCallback((note) => {
    const full = { id: 'n' + Date.now(), read: false, when: 'Just now', kind: 'reminder', ...note };
    setNotifications(ns => [full, ...ns]);
    setModeToast(full);
    clearToastTimer();
    toastTimer.current = setTimeout(() => { setModeToast(null); toastTimer.current = null; }, 5000);
  }, [clearToastTimer]);

  const emitReminderNote = useCallback((title, iso, reminder, taskId) => {
    if (!iso) return;
    const ref = taskId ? { ctaTaskId: taskId } : {};
    const info = reminderInfo(iso, reminder);
    if (!info) {
      notify({ title: 'Scheduled · ' + friendlyDue(iso), summary: `"${title}" is set for ${fmtDayLabel(iso)}.`,
        body: `"${title}" is on your calendar for ${fmtDayLabel(iso)}.`, ...ref });
      return;
    }
    if (diffDays(info.fireISO) <= 0) {
      const when = friendlyDue(iso);
      notify({ title: 'Reminder · ' + when, summary: `"${title}" is due ${when.toLowerCase()}.`,
        body: `Heads-up — "${title}" is ${/today/i.test(when) ? 'due today' : 'coming up: ' + fmtDayLabel(iso)}.`, ...ref });
    } else {
      notify({ title: 'Reminder set', summary: `I'll nudge you ${info.phrase}.`,
        body: `Reminder saved for "${title}" — I'll nudge you ${info.phrase}.`, ...ref });
    }
  }, [notify]);

  const scheduleTask = useCallback((id, iso) => {
    let title = '', reminder = 'none';
    setTasks(ts => ts.map(t => { if (t.id !== id) return t; title = t.title; reminder = t.reminder || 'none'; return { ...t, date: iso, due: iso ? friendlyDue(iso) : '—' }; }));
    if (iso) emitReminderNote(title, iso, reminder, id);
    touchForTask(id);
  }, [emitReminderNote, touchForTask]);

  const setReminder = useCallback((id, reminder) => {
    let title = '', date = null;
    setTasks(ts => ts.map(t => { if (t.id !== id) return t; title = t.title; date = t.date; return { ...t, reminder }; }));
    if (date && reminder !== 'none') emitReminderNote(title, date, reminder, id);
  }, [emitReminderNote]);

  const emitCustomReminderNote = useCallback((title, dateISO, time, label, taskId) => {
    if (!dateISO) return;
    const ref = taskId ? { ctaTaskId: taskId } : {};
    const state = reminderState(dateISO, time);
    const timeLabel = time ? formatTime(time) : null;
    const whenLabel = friendlyDue(dateISO) + (timeLabel ? ` · ${timeLabel}` : '');
    if (state === 'sent' || state === 'today') {
      notify({ kind: 'reminder', title: 'Reminder · ' + whenLabel,
        summary: `${label ? label + ' — ' : ''}"${title}".`,
        body: `Heads-up — "${title}"${label ? ` · ${label}` : ''}${timeLabel ? `, ${timeLabel}` : ''}.`.trim(), ...ref });
    } else {
      notify({ kind: 'reminder', title: 'Reminder set',
        summary: `I'll nudge you ${friendlyDue(dateISO)}${timeLabel ? ` at ${timeLabel}` : ''}.`,
        body: `Reminder saved for "${title}"${label ? ` · ${label}` : ''}. I'll nudge you on ${fmtDayLabel(dateISO)}${timeLabel ? ` at ${timeLabel}` : ''}.`, ...ref });
    }
  }, [notify]);

  const addReminder = useCallback((tid, { dateISO, time = null, label = '' }) => {
    if (!dateISO) return null;
    const rid = 'rm' + Date.now();
    let title = '';
    setTasks(ts => ts.map(t => { if (t.id !== tid) return t; title = t.title; return { ...t, reminders: [...(t.reminders || []), { id: rid, dateISO, time: time || null, label: label || '' }] }; }));
    emitCustomReminderNote(title, dateISO, time, label, tid);
    touchForTask(tid);
    return rid;
  }, [emitCustomReminderNote, touchForTask]);

  const removeReminder = useCallback((tid, rid) => setTasks(ts => ts.map(t => t.id !== tid ? t : { ...t, reminders: (t.reminders || []).filter(r => r.id !== rid) })), []);

  const ringReminder = useCallback((tid, rid) => {
    const t = allTasksRef.current.find(x => x.id === tid); if (!t) return;
    const r = (t.reminders || []).find(x => x.id === rid); if (!r) return;
    emitCustomReminderNote(t.title, r.dateISO, r.time, r.label, tid);
  }, [emitCustomReminderNote]);

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
  const deleteCategory = useCallback((id) => {
    setCategories(cs => cs.filter(c => c.id !== id));
    setTasks(ts => ts.map(t => t.categoryId === id ? { ...t, categoryId: null } : t));
  }, []);

  const [allNotes, setNotes] = useState(() => NOTES.map(n => ({ ...n, profileId: 'personal' })));
  const notes = useMemo(() => allNotes.filter(n => (n.profileId||'personal') === activeProfileId), [allNotes, activeProfileId]);
  const allNotesRef = useRef([]); allNotesRef.current = allNotes;
  const noteById = useCallback((id) => allNotesRef.current.find(n => n.id === id), []);

  const [allCollections, setCollections] = useState(() => NOTE_COLLECTIONS.map(c => ({ ...c, profileId: 'personal' })));
  const collections = useMemo(() => allCollections.filter(c => (c.profileId||'personal') === activeProfileId), [allCollections, activeProfileId]);
  const collectionById = useCallback((id) => allCollections.find(c => c.id === id), [allCollections]);
  const notesForCollection = useCallback((cid) => cid === '__loose'
    ? notes.filter(n => !n.collectionId)
    : notes.filter(n => n.collectionId === cid), [notes]);

  const nextTs = useCallback(() => allNotesRef.current.reduce((m, n) => Math.max(m, n.ts || 0), 0) + 1, []);

  const addNote = useCallback(({ title = '', body = '', collectionId = null, tags = [], pinned = false, links = [] } = {}) => {
    const id = 'note' + Date.now();
    setNotes(ns => [...ns, { id, title, body, collectionId, tags: [...tags], pinned, links: [...links], ts: nextTs(), updated: 'Just now', profileId: activeProfileId }]);
    return id;
  }, [activeProfileId, nextTs]);

  const updateNote = useCallback((id, patch) => setNotes(ns => ns.map(n => n.id === id ? { ...n, ...patch, ts: nextTs(), updated: 'Just now' } : n)), [nextTs]);
  const deleteNote = useCallback((id) => { setNotes(ns => ns.filter(n => n.id !== id)); setOpenNoteId(cur => cur === id ? null : cur); }, []);
  const togglePinNote = useCallback((id) => setNotes(ns => ns.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)), []);

  const addCollection = useCallback((c) => {
    const id = 'col' + Date.now();
    setCollections(cs => [...cs, { id, icon: 'leaf', color: '#2a8a8a', profileId: activeProfileId, ...c }]);
    return id;
  }, [activeProfileId]);

  const updateCollection = useCallback((id, patch) => setCollections(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c)), []);
  const deleteCollection = useCallback((id) => { setCollections(cs => cs.filter(c => c.id !== id)); setNotes(ns => ns.map(n => n.collectionId === id ? { ...n, collectionId: null } : n)); }, []);

  const [openNoteId, setOpenNoteId] = useState(null);
  const openNote = useCallback((id) => setOpenNoteId(id), []);
  const createNote = useCallback((opts = {}) => { const id = addNote(opts); setOpenNoteId(id); return id; }, [addNote]);
  const closeNote = useCallback(() => {
    setOpenNoteId(cur => {
      const n = cur && allNotesRef.current.find(x => x.id === cur);
      if (n && !(n.title || '').trim() && !(n.body || '').trim() && !(n.tags || []).length) {
        setNotes(ns => ns.filter(x => x.id !== cur));
      }
      return null;
    });
  }, []);

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
          body: `You pinned "${p.name}" to keep it close — but it hasn't moved in ${d} days.`,
          ctaProjectId: pid,
        };
        setNotifications(ns => ns.some(n => n.id === note.id) ? ns : [note, ...ns]);
      }
    });
  }, [pinnedProjectIds, allProjects]);

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

  const switchProfile = useCallback((id) => { setActiveProfileId(id); stackRef.current = []; setOpenStack([]); setGuard(null); pendingRef.current = null; setOpenNoteId(null); }, []);
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
    setNotes(ns => ns.filter(n => (n.profileId||'personal') !== id));
    setCollections(cs => cs.filter(c => (c.profileId||'personal') !== id));
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
  }, [allTasks, goalIdsOf, allGoals]);

  const tasksForCategory = useCallback((cid) => cid === '__uncat'
    ? tasks.filter(t => !t.categoryId && !t.projectId)
    : tasks.filter(t => t.categoryId === cid), [tasks]);
  const categoryById = useCallback((id) => allCategories.find(c => c.id === id), [allCategories]);

  const tasksForDate = useCallback((iso) => tasks.filter(t => t.date === iso), [tasks]);
  const todayTasks = useCallback(() => tasks.filter(t => t.date === todayKey()), [tasks]);
  const overdueTasks = useCallback(() => tasks.filter(t => isPast(t.date) && !t.done), [tasks]);
  const unscheduledTasks = useCallback(() => tasks.filter(t => !t.date && !t.done), [tasks]);

  allTasksRef.current = allTasks;
  projectGoalsRef.current = projectGoals;
  stackRef.current = openStack;
  guardRef.current = taskGuard;
  taskSectionsRef.current = taskSections;

  return {
    tasks, toggleTask, toggleSub, addTask, setTaskCategory, deleteTask, updateTask, addSubtask,
    addComment: addCommentTouched, updateComment, deleteComment, scheduleTask, notify,
    openTaskId, openTask, closeTask, focusIds, toggleFocus, aiMode, setAiMode,
    openStack, closeAllTasks, setDraft, isTaskDirty, commitAndClose, revertDraft, taskGuard, resolveGuard,
    density, setDensity, dyslexiaFont, setDyslexiaFont,
    navRecency, touchProject,
    tourOpen, tourStep, startTour, endTour, setTourStep: setTourStepSafe,
    moreSheetOpen, openMoreSheet, closeMoreSheet,
    zenChat, openZenChat, closeZenChat,
    profiles, activeProfileId, activeProfile, switchProfile, addProfile, updateProfile, deleteProfile,
    manageSpacesOpen, openManageSpaces, closeManageSpaces,
    notifications, markNotifRead, markAllNotifsRead, modeToast, dismissModeToast, pauseModeToast,
    goals, primaryGoalId, setPrimaryGoalId, goalById, goalIdsOf, projectsForGoal, phaseForProjectInGoal,
    goalsForProject, goalsForTask, projectGoals, setProjectGoalIds, setProjectPhase,
    addGoal, updateGoal, clearDatabase,
    projects, projectById, addProject, updateProject,
    categories, addCategory, updateCategory, deleteCategory, tasksForCategory, categoryById,
    notes, noteById, addNote, updateNote, deleteNote, togglePinNote, notesForCollection,
    collections, collectionById, addCollection, updateCollection, deleteCollection,
    openNoteId, openNote, createNote, closeNote,
    quickAdd, openQuickAdd, closeQuickAdd,
    tasksForDate, todayTasks, overdueTasks, unscheduledTasks,
    sectionOf, setTaskSection, placeTask, setReminder, addReminder, removeReminder, ringReminder,
    statusOf, setProjectStatus, pinnedProjectIds, isProjectPinned, togglePinProject,
  };
}

export function useZenAI(extraCtx = '') {
  const [messages, setMessages] = useState(DEFAULT_CHAT);
  const [busy, setBusy] = useState(false);
  const reset = useCallback(() => setMessages(DEFAULT_CHAT), []);
  const send = useCallback(async (userText) => {
    setMessages(m => [...m, { role: 'user', text: userText }]);
    setBusy(true);
    try {
      const ctx = [
        "You are Zen, a calm AI companion inside a to-do app. Keep replies short (1–3 sentences), warm, grounded, never urgent. No emoji.",
        `User goals: ${GOALS.map(g => `${g.name} — ${g.overarching}`).join(' | ')}`,
        `Active phases: ${GOALS.map(g => g.phases[0] && `${g.name}: ${g.phases[0].name}`).filter(Boolean).join(' | ')}`,
        `Projects: ${PROJECTS.map(p=>`${p.name} (${Math.round(p.progress*100)}%, ${p.status})`).join('; ')}`,
        ...GOALS.map(g => `Enthusiasm note for "${g.name}" ${g.enthusiasmWhen}: "${g.enthusiasm}"`),
        extraCtx,
      ].join('\n');
      // Use Anthropic API if available in this context
      const reply = await (window.claude?.complete ? window.claude.complete({ messages: [{ role: 'user', content: ctx + '\n\nUser: ' + userText }] }) : Promise.resolve("I'm Zen, your calm companion. I'm here to help you think through what matters most today."));
      setMessages(m => [...m, { role: 'assistant', text: typeof reply === 'string' ? reply.trim() : reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: "(I couldn't reach my brain just now — try again in a moment.)" }]);
    } finally { setBusy(false); }
  }, [extraCtx]);
  return { messages, send, busy, reset };
}
