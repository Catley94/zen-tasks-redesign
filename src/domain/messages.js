// Notification-text rules — the words Zen says when something changes in the model.
// Pure builders returning { title, summary, body }. Kept out of the views so editing UI
// can't change what the app says (and so the copy lives in one place).

import { PROJECT_STATUS_KEYS } from './constants';

// Generic project status change (used by the status control on the project screen).
export function projectStatusNote(name, key) {
  const label = (PROJECT_STATUS_KEYS.find(s => s.key === key) || { label: key }).label;
  return {
    title: 'Project ' + label.toLowerCase(),
    summary: `"${name}" is now ${label.toLowerCase()}.`,
    body: key === 'parked' ? `"${name}" is parked — it'll rest quietly and won't nudge you.`
        : key === 'quiet'  ? `"${name}" is marked quiet — still around, just not pressing.`
        : `"${name}" is active again — back among the things you're moving.`,
  };
}

// Gentle "reopen" from the weekly review (warmer wording than the generic note above).
export function projectReopenNote(name) {
  return {
    title: 'Reopened gently',
    summary: `"${name}" is back among your active projects.`,
    body: `"${name}" is active again — no pressure, just back in view. Open it whenever you're ready.`,
  };
}

// "Park for later" from the weekly review.
export function projectParkNote(name) {
  return {
    title: 'Parked for later',
    summary: `"${name}" is resting — I won't nudge you about it.`,
    body: `"${name}" is parked. It'll wait quietly; reopen it from the project list whenever you like.`,
  };
}
