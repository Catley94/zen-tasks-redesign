// Converted from project/shared/dates.jsx
// Removed: Object.assign(window, {...}) global exports
// All helpers exported as named ES module exports.

export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const WEEKDAYS_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const WEEKDAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const WEEK_HEADERS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; // Monday-start grid

export const pad2 = (n) => String(n).padStart(2, '0');
export const keyOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const parseKey = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const todayKey = () => keyOf(new Date());
export const diffDays = (iso) => Math.round((parseKey(iso) - parseKey(todayKey())) / 86400000);
export const isToday = (iso) => iso === todayKey();
export const isPast = (iso) => !!iso && diffDays(iso) < 0;
export const sameMonth = (d, year, month) => d.getFullYear() === year && d.getMonth() === month;

// Short label for the fuzzy `due` field, derived from a real date.
export function friendlyDue(iso) {
  if (!iso) return '—';
  const n = diffDays(iso);
  if (n < 0) return 'Overdue';
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  const d = parseKey(iso);
  if (n <= 6) return WEEKDAYS_SHORT[d.getDay()];
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

// Full, human day label for panel headers, e.g. "Tuesday 3 June".
export function fmtDayLabel(iso) {
  if (!iso) return '';
  const d = parseKey(iso);
  return `${WEEKDAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// 6×7 grid of Date objects for a month, Monday-start.
export function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // days since Monday
  const start = addDays(first, -offset);
  const weeks = [];
  for (let w = 0; w < 6; w++) weeks.push(Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i)));
  return weeks;
}

// Seed a real date from the legacy fuzzy `due` string, spread for a lively calendar.
export function seedDate(due, i = 0) {
  const t = new Date();
  switch (due) {
    case 'Today': return keyOf(t);
    case 'Tomorrow': return keyOf(addDays(t, 1));
    case 'This week': return keyOf(addDays(t, 2 + (i % 4)));
    case 'Next week': return keyOf(addDays(t, 7 + (i % 3)));
    case 'Overdue': return keyOf(addDays(t, -(1 + (i % 3))));
    default: return null; // '—'
  }
}

// Reminder lead-times: how far ahead of a task's date to nudge.
export const REMINDER_LEAD = { 'none': null, 'same-day': 0, 'day-before': 1, '2-days': 2, 'week-before': 7 };

// Given a scheduled date + reminder key, return when the nudge fires and a human phrase.
export function reminderInfo(iso, reminder) {
  const lead = REMINDER_LEAD[reminder];
  if (iso == null || lead == null) return null;
  const fireISO = keyOf(addDays(parseKey(iso), -lead));
  const phrase = reminder === 'same-day'
    ? `the morning of ${fmtDayLabel(iso)}`
    : `${{ 'day-before': 'the day before', '2-days': 'two days before', 'week-before': 'a week before' }[reminder]} — ${fmtDayLabel(fireISO)}`;
  return { fireISO, phrase };
}

// 'HH:MM' (24h) → friendly '9:00 am'. Empty string means "all day" (no time).
export function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ap = h < 12 ? 'am' : 'pm';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${pad2(m)} ${ap}`;
}

// Has this clock-time already passed *today*? (Only meaningful when the date is today.)
export function timePassedToday(t) {
  if (!t) return false;
  const [h, m] = t.split(':').map(Number);
  const now = new Date();
  return (now.getHours() * 60 + now.getMinutes()) > (h * 60 + m);
}

// Lifecycle of a single reminder given its day + optional time.
export function reminderState(dateISO, time) {
  if (!dateISO) return 'upcoming';
  const d = diffDays(dateISO);
  if (d < 0) return 'sent';
  if (d === 0) return (time && timePassedToday(time)) ? 'sent' : 'today';
  return 'upcoming';
}
