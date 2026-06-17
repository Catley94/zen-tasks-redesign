// app object <-> Supabase row mappers. The DB uses snake_case columns and jsonb
// for nested shapes; the app uses camelCase. `toRow` always stamps user_id (RLS)
// and profile_id. `fromRow` drops DB-only audit columns.

const arr = (v) => (Array.isArray(v) ? v : []);

export const tasks = {
  table: 'tasks',
  toRow: (t, uid) => ({
    id: t.id,
    user_id: uid,
    profile_id: t.profileId || 'personal',
    title: t.title || '',
    notes: t.notes || '',
    priority: t.priority || 'seedling',
    due: t.due || '—',
    date: t.date || null,
    est: t.est || '—',
    done: !!t.done,
    project_id: t.projectId || null,
    category_id: t.categoryId || null,
    section_id: t.sectionId || null,
    reminder: t.reminder || 'none',
    tags: arr(t.tags),
    subtasks: arr(t.subtasks),
    comments: arr(t.comments),
    reminders: arr(t.reminders),
    history: arr(t.history),
  }),
  fromRow: (r) => ({
    id: r.id,
    profileId: r.profile_id,
    title: r.title,
    notes: r.notes || '',
    priority: r.priority,
    due: r.due,
    date: r.date,
    est: r.est,
    done: r.done,
    projectId: r.project_id,
    categoryId: r.category_id,
    sectionId: r.section_id,
    reminder: r.reminder,
    tags: arr(r.tags),
    subtasks: arr(r.subtasks),
    comments: arr(r.comments),
    reminders: arr(r.reminders),
    history: arr(r.history),
  }),
};

export const projects = {
  table: 'projects',
  toRow: (p, uid) => ({
    id: p.id,
    user_id: uid,
    profile_id: p.profileId || 'personal',
    name: p.name || '',
    color: p.color || '#5a8a3a',
    progress: typeof p.progress === 'number' ? p.progress : 0,
    last_active: p.lastActive || 'just now',
    status: p.status || 'active',
    note: p.note || '',
    phase_id: p.phaseId || null,
  }),
  // goalIds/phaseId are reconstructed from the project_goals junction at load.
  fromRow: (r) => ({
    id: r.id,
    profileId: r.profile_id,
    name: r.name,
    color: r.color,
    progress: Number(r.progress),
    lastActive: r.last_active,
    status: r.status,
    note: r.note || '',
    phaseId: r.phase_id,
    goalIds: [],
  }),
};

export const goals = {
  table: 'goals',
  toRow: (g, uid) => ({
    id: g.id,
    user_id: uid,
    profile_id: g.profileId || 'personal',
    name: g.name || '',
    overarching: g.overarching || '',
    enthusiasm: g.enthusiasm || '',
    enthusiasm_when: g.enthusiasmWhen || '',
    color: g.color || '#3f6e3a',
    icon: g.icon || 'leaf',
    last_touched: g.lastTouched || 'just now',
    phases: arr(g.phases),
  }),
  fromRow: (r) => ({
    id: r.id,
    profileId: r.profile_id,
    name: r.name,
    overarching: r.overarching || '',
    enthusiasm: r.enthusiasm || '',
    enthusiasmWhen: r.enthusiasm_when || '',
    color: r.color,
    icon: r.icon,
    lastTouched: r.last_touched,
    phases: arr(r.phases),
  }),
};

export const categories = {
  table: 'categories',
  toRow: (c, uid) => ({
    id: c.id,
    user_id: uid,
    profile_id: c.profileId || 'personal',
    name: c.name || '',
    color: c.color || '#5a8a3a',
    icon: c.icon || 'tag',
  }),
  fromRow: (r) => ({
    id: r.id,
    profileId: r.profile_id,
    name: r.name,
    color: r.color,
    icon: r.icon,
  }),
};

export const collections = {
  table: 'note_collections',
  toRow: (c, uid) => ({
    id: c.id,
    user_id: uid,
    profile_id: c.profileId || 'personal',
    name: c.name || '',
    color: c.color || '#2a8a8a',
    icon: c.icon || 'leaf',
  }),
  fromRow: (r) => ({
    id: r.id,
    profileId: r.profile_id,
    name: r.name,
    color: r.color,
    icon: r.icon,
  }),
};

export const notes = {
  table: 'notes',
  toRow: (n, uid) => ({
    id: n.id,
    user_id: uid,
    profile_id: n.profileId || 'personal',
    collection_id: n.collectionId || null,
    title: n.title || '',
    body: n.body || '',
    pinned: !!n.pinned,
    tags: arr(n.tags),
    links: arr(n.links),
    ts: typeof n.ts === 'number' ? n.ts : 0,
    updated: n.updated || 'Just now',
  }),
  fromRow: (r) => ({
    id: r.id,
    profileId: r.profile_id,
    collectionId: r.collection_id,
    title: r.title || '',
    body: r.body || '',
    pinned: !!r.pinned,
    tags: arr(r.tags),
    links: arr(r.links),
    ts: r.ts || 0,
    updated: r.updated,
  }),
};

export const profiles = {
  table: 'profiles',
  // Composite PK (id, user_id) — handled specially in repo/sync.
  toRow: (p, uid) => ({
    id: p.id,
    user_id: uid,
    name: p.name || 'Personal',
    color: p.color || '#5a8a3a',
  }),
  fromRow: (r) => ({ id: r.id, name: r.name, color: r.color }),
};

// Tables with a single `id` PK, synced generically. Order matters for FKs:
// goals/categories/collections before projects/notes before tasks.
export const SYNC_TABLES = [
  { key: 'goals', ...goals },
  { key: 'categories', ...categories },
  { key: 'collections', ...collections },
  { key: 'projects', ...projects },
  { key: 'notes', ...notes },
  { key: 'tasks', ...tasks },
];

// project_goals junction: app stores it as { [projectId]: { [goalId]: phaseId } }.
export function projectGoalsToRows(map, uid) {
  const rows = [];
  for (const projectId of Object.keys(map || {})) {
    const links = map[projectId] || {};
    for (const goalId of Object.keys(links)) {
      rows.push({
        project_id: projectId,
        goal_id: goalId,
        phase_id: links[goalId] || null,
        user_id: uid,
      });
    }
  }
  return rows;
}

export function rowsToProjectGoals(rows) {
  const map = {};
  for (const r of arr(rows)) {
    (map[r.project_id] ||= {})[r.goal_id] = r.phase_id || null;
  }
  return map;
}

export function settingsToRow(s, uid) {
  return {
    user_id: uid,
    active_profile_id: s.activeProfileId || 'personal',
    density: s.density || 'calm',
    ai_mode: s.aiMode || 'assistant',
    dyslexia_font: !!s.dyslexiaFont,
    primary_goal_id: s.primaryGoalId || null,
    focus_task_ids: arr(s.focusTaskIds),
    pinned_project_ids: arr(s.pinnedProjectIds),
  };
}

export function rowToSettings(r) {
  if (!r) return null;
  return {
    activeProfileId: r.active_profile_id,
    density: r.density,
    aiMode: r.ai_mode,
    dyslexiaFont: !!r.dyslexia_font,
    primaryGoalId: r.primary_goal_id,
    focusTaskIds: arr(r.focus_task_ids),
    pinnedProjectIds: arr(r.pinned_project_ids),
  };
}
