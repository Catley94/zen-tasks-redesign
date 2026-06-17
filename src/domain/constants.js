// Domain enumerations — the valid values for task / project / category metadata.
// Pure data, no React. Presentation (display colours, icon components) stays in the views;
// only the keys/labels and palettes that the *model* cares about live here.

// Task metadata options (used by the task-detail + quick-add forms).
export const DUE_OPTIONS = ['—', 'Today', 'Tomorrow', 'This week', 'Next week', 'Overdue'];
export const EST_OPTIONS = ['—', '2m', '5m', '10m', '15m', '20m', '30m', '45m', '1h', '2h', '3h', '4h'];
export const PRIORITY_KEYS = ['seedling', 'growing', 'rooted', 'falling'];
export const REMINDER_OPTIONS = [['none', "Don't remind me"], ['same-day', 'On the day'], ['day-before', 'A day before'], ['2-days', '2 days before'], ['week-before', 'A week before']];

// Project lifecycle statuses (key + display label). The colour for each is presentation,
// mapped to TOKENS in the view.
export const PROJECT_STATUS_KEYS = [
  { key: 'active', label: 'Active' },
  { key: 'quiet', label: 'Quiet' },
  { key: 'parked', label: 'Parked' },
];

// Category editor: the icons a category may use (icon key → component is mapped in the view)
// and the colour palette to choose from.
export const CATEGORY_ICON_KEYS = ['tag', 'home', 'heart', 'bag', 'wallet', 'leaf', 'flame', 'calendar'];
// Earthy palette drawn from the existing project colours — shared chroma family.
export const CATEGORY_COLORS = ['#8a6a3a', '#5a8a3a', '#2a8a8a', '#3a8a6e', '#a06a3a', '#6e8a3a', '#2f7a8a', '#9a4a4a'];

// The virtual "everything not filed anywhere" bucket. A real domain concept — the
// tasks-for-category selector keys off UNCAT.id — not a stored category.
export const UNCAT = { id: '__uncat', name: 'Uncategorised', color: '#8a8f86', icon: 'tag', system: true };
