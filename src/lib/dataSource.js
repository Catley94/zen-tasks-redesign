// Where the app reads/writes its data: 'seed' (in-memory demo data) or
// 'supabase' (the real DB). Persisted in localStorage so it survives reloads.
// Switching reloads the page so state re-initializes cleanly from the chosen
// source rather than trying to reconcile two live datasets.

const KEY = 'zen-data-source';

export function getDataSource() {
  try {
    return localStorage.getItem(KEY) === 'supabase' ? 'supabase' : 'seed';
  } catch {
    return 'seed';
  }
}

export function setDataSource(value) {
  try {
    localStorage.setItem(KEY, value === 'supabase' ? 'supabase' : 'seed');
  } catch {
    /* ignore */
  }
}
