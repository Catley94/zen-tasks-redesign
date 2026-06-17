// Pure derived queries over app data. No React — each takes its inputs explicitly so it can
// be called from the controller hook (or a test) without a component. The controller wraps
// these in useCallback and feeds them the current state.

import { todayKey, isPast } from '../lib/dates';
import { UNCAT } from './constants';

// Weekly Review aggregation: what advanced this week. `projectById` is injected so this
// stays independent of how projects are stored.
export function weeklyReview(tasks, projectById, goals) {
  const doneTasks = tasks.filter(t => t.done);
  const recentByProject = {};
  doneTasks.forEach(t => { if (t.projectId) recentByProject[t.projectId] = (recentByProject[t.projectId] || 0) + 1; });
  const advanced = Object.keys(recentByProject).map(pid => {
    const p = projectById(pid);
    const all = tasks.filter(t => t.projectId === pid);
    const done = all.filter(t => t.done).length;
    return { p, recent: recentByProject[pid], total: all.length, done, progress: all.length ? done / all.length : 0 };
  }).filter(a => a.p).sort((a, b) => b.recent - a.recent || b.progress - a.progress);
  const goalsTouched = [...new Set(advanced.flatMap(a => a.p.goalIds || []))]
    .map(id => goals.find(g => g.id === id)).filter(Boolean);
  const biggest = advanced[0];
  const otherDone = doneTasks.filter(t => !t.projectId);
  return { doneTasks, advanced, goalsTouched, biggest, otherDone };
}

// Simple task-list filters.
export const tasksForDate = (tasks, iso) => tasks.filter(t => t.date === iso);
export const todayTasks = (tasks) => tasks.filter(t => t.date === todayKey());
export const overdueTasks = (tasks) => tasks.filter(t => isPast(t.date) && !t.done);
export const unscheduledTasks = (tasks) => tasks.filter(t => !t.date && !t.done);
export const tasksForCategory = (tasks, cid) => cid === UNCAT.id
  ? tasks.filter(t => !t.categoryId && !t.projectId)
  : tasks.filter(t => t.categoryId === cid);
