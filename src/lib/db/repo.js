// Supabase data access for the whole app. loadAll() hydrates state on login;
// seedDatabase() copies the demo data into a fresh account so there's something
// to test against. Writes are stamped with user_id (required by RLS).

import { supabase } from '../supabase.js';
import {
  TASKS, PROJECTS, GOALS, CATEGORIES, NOTES, NOTE_COLLECTIONS,
} from '../../data/seeds.js';
import * as M from './mappers.js';

const DEFAULT_PROFILES = [
  { id: 'personal', name: 'Personal', color: '#5a8a3a' },
  { id: 'work', name: 'Work', color: '#2a6f8a' },
];

function check(error, label) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

// Pull every table for the signed-in user and shape it into app state.
export async function loadAll(uid) {
  const [
    profilesRes, goalsRes, projectsRes, categoriesRes,
    collectionsRes, notesRes, tasksRes, junctionRes, settingsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('goals').select('*'),
    supabase.from('projects').select('*'),
    supabase.from('categories').select('*'),
    supabase.from('note_collections').select('*'),
    supabase.from('notes').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('project_goals').select('*'),
    supabase.from('user_settings').select('*').maybeSingle(),
  ]);

  check(profilesRes.error, 'load profiles');
  check(goalsRes.error, 'load goals');
  check(projectsRes.error, 'load projects');
  check(categoriesRes.error, 'load categories');
  check(collectionsRes.error, 'load collections');
  check(notesRes.error, 'load notes');
  check(tasksRes.error, 'load tasks');
  check(junctionRes.error, 'load project_goals');
  check(settingsRes.error, 'load settings');

  let profiles = (profilesRes.data || []).map(M.profiles.fromRow);
  // Every account needs at least one Space, or the UI has nothing to render.
  if (profiles.length === 0) {
    const { error } = await supabase
      .from('profiles')
      .insert(DEFAULT_PROFILES.map((p) => M.profiles.toRow(p, uid)));
    check(error, 'create default profile');
    profiles = DEFAULT_PROFILES.map((p) => ({ ...p }));
  }

  const projectGoals = M.rowsToProjectGoals(junctionRes.data);
  const projects = (projectsRes.data || []).map((r) => {
    const p = M.projects.fromRow(r);
    p.goalIds = Object.keys(projectGoals[p.id] || {});
    return p;
  });

  return {
    profiles,
    goals: (goalsRes.data || []).map(M.goals.fromRow),
    projects,
    categories: (categoriesRes.data || []).map(M.categories.fromRow),
    collections: (collectionsRes.data || []).map(M.collections.fromRow),
    notes: (notesRes.data || []).map(M.notes.fromRow),
    tasks: (tasksRes.data || []).map(M.tasks.fromRow),
    projectGoals,
    settings: M.rowToSettings(settingsRes.data),
  };
}

// Copy the bundled demo data into the user's DB (idempotent upserts, FK-safe order).
export async function seedDatabase(uid) {
  const profilesRows = DEFAULT_PROFILES.map((p) => M.profiles.toRow(p, uid));
  const goalsRows = GOALS.map((g) => M.goals.toRow({ ...g, profileId: 'personal' }, uid));
  const categoriesRows = CATEGORIES.map((c) => M.categories.toRow({ ...c, profileId: 'personal' }, uid));
  const collectionsRows = NOTE_COLLECTIONS.map((c) => M.collections.toRow({ ...c, profileId: 'personal' }, uid));
  const projectsRows = PROJECTS.map((p) => M.projects.toRow({ ...p, profileId: 'personal' }, uid));
  const notesRows = NOTES.map((n) => M.notes.toRow({ ...n, profileId: 'personal' }, uid));
  const tasksRows = TASKS.map((t) => M.tasks.toRow({ ...t, profileId: 'personal' }, uid));

  // Rebuild the project↔goal junction from the seed projects' goalIds/phaseId.
  const junctionMap = {};
  PROJECTS.forEach((p) => {
    const entry = {};
    (p.goalIds || []).forEach((gid) => {
      const g = GOALS.find((x) => x.id === gid);
      const owns = g && g.phases.some((ph) => ph.id === p.phaseId);
      entry[gid] = owns ? p.phaseId : null;
    });
    junctionMap[p.id] = entry;
  });
  const junctionRows = M.projectGoalsToRows(junctionMap, uid);

  // Order respects foreign keys.
  check((await supabase.from('profiles').upsert(profilesRows, { onConflict: 'id,user_id' })).error, 'seed profiles');
  check((await supabase.from('goals').upsert(goalsRows)).error, 'seed goals');
  check((await supabase.from('categories').upsert(categoriesRows)).error, 'seed categories');
  check((await supabase.from('note_collections').upsert(collectionsRows)).error, 'seed collections');
  check((await supabase.from('projects').upsert(projectsRows)).error, 'seed projects');
  check((await supabase.from('project_goals').upsert(junctionRows, { onConflict: 'project_id,goal_id' })).error, 'seed project_goals');
  check((await supabase.from('notes').upsert(notesRows)).error, 'seed notes');
  check((await supabase.from('tasks').upsert(tasksRows)).error, 'seed tasks');
}
