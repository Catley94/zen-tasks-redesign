// Reactive write-back to Supabase. Each hook watches an app state slice and, once
// armed (after the initial hydrate), diffs it against the last-synced snapshot and
// pushes upserts/deletes on a short debounce. This mirrors state to the DB without
// touching the app's ~40 existing mutators — they just update React state as before.

import { useEffect, useRef } from 'react';
import { supabase } from '../supabase.js';
import { projectGoalsToRows, settingsToRow } from './mappers.js';

const DEBOUNCE = 700;

// Generic sync for tables with a single `id` primary key (plus profiles, via the
// optional onConflict arg for its composite key).
export function useTableSync(table, items, toRow, enabled, uid, conflict) {
  const prev = useRef(new Map());
  const armed = useRef(false);
  const timer = useRef(null);
  useEffect(() => {
    if (!enabled || !uid) { armed.current = false; prev.current = new Map(); return; }
    const rows = items.map((o) => toRow(o, uid));
    const nextMap = new Map(rows.map((r) => [r.id, JSON.stringify(r)]));
    if (!armed.current) { armed.current = true; prev.current = nextMap; return; }
    const upserts = rows.filter((r) => prev.current.get(r.id) !== nextMap.get(r.id));
    const deletes = [...prev.current.keys()].filter((k) => !nextMap.has(k));
    prev.current = nextMap;
    if (!upserts.length && !deletes.length) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        if (upserts.length) {
          const { error } = await supabase
            .from(table)
            .upsert(upserts, conflict ? { onConflict: conflict } : undefined);
          if (error) console.error(`sync upsert ${table}:`, error.message);
        }
        if (deletes.length) {
          const { error } = await supabase.from(table).delete().in('id', deletes);
          if (error) console.error(`sync delete ${table}:`, error.message);
        }
      } catch (e) {
        console.error(`sync ${table}:`, e);
      }
    }, DEBOUNCE);
  }, [items, enabled, uid]);
}

// project_goals junction: composite key (project_id, goal_id).
export function useJunctionSync(map, enabled, uid) {
  const prev = useRef(new Map());
  const armed = useRef(false);
  const timer = useRef(null);
  useEffect(() => {
    if (!enabled || !uid) { armed.current = false; prev.current = new Map(); return; }
    const rows = projectGoalsToRows(map, uid);
    const key = (r) => `${r.project_id}|${r.goal_id}`;
    const nextMap = new Map(rows.map((r) => [key(r), JSON.stringify(r)]));
    if (!armed.current) { armed.current = true; prev.current = nextMap; return; }
    const upserts = rows.filter((r) => prev.current.get(key(r)) !== nextMap.get(key(r)));
    const deletes = [...prev.current.keys()].filter((k) => !nextMap.has(k)).map((k) => k.split('|'));
    prev.current = nextMap;
    if (!upserts.length && !deletes.length) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        if (upserts.length) {
          const { error } = await supabase
            .from('project_goals')
            .upsert(upserts, { onConflict: 'project_id,goal_id' });
          if (error) console.error('sync upsert project_goals:', error.message);
        }
        for (const [pid, gid] of deletes) {
          const { error } = await supabase
            .from('project_goals')
            .delete()
            .eq('project_id', pid)
            .eq('goal_id', gid);
          if (error) console.error('sync delete project_goals:', error.message);
        }
      } catch (e) {
        console.error('sync project_goals:', e);
      }
    }, DEBOUNCE);
  }, [map, enabled, uid]);
}

// user_settings: a single row per user.
export function useSettingsSync(settings, enabled, uid) {
  const prev = useRef(null);
  const armed = useRef(false);
  const timer = useRef(null);
  useEffect(() => {
    if (!enabled || !uid) { armed.current = false; prev.current = null; return; }
    const json = JSON.stringify(settingsToRow(settings, uid));
    if (!armed.current) { armed.current = true; prev.current = json; return; }
    if (json === prev.current) return;
    prev.current = json;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const { error } = await supabase
        .from('user_settings')
        .upsert(JSON.parse(json), { onConflict: 'user_id' });
      if (error) console.error('sync user_settings:', error.message);
    }, DEBOUNCE);
  }, [settings, enabled, uid]);
}
