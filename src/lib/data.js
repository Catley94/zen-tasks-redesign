// Extended mock data — multi-goal hierarchy, tasks with subtasks/notes, timeline, AI threads.
// Goals: many. Phases: belong to a single goal. Projects: many-to-many with goals (goalIds[]).

export const GOALS = [
  { id: 'g1',
    name: "Build something I'm proud of",
    overarching: "Make a living from my own work by the end of 2026.",
    enthusiasm: "This one feels different — it's the first thing I've built that's for me, not for a client. If I finish one real thing this year I'll have proved to myself that I can.",
    enthusiasmWhen: '3 weeks ago',
    color: '#3f6e3a', // forest
    icon: 'leaf',
    lastTouched: '2h ago',
    phases: [
      { id: 'ph1', name: 'Ship Zen Tasks MVP', order: 1, description: 'Get the app in front of 10 real users.', status: 'active' },
      { id: 'ph2', name: 'Record the EP', order: 2, description: 'Quiet Hours — 5 tracks, rough mixes.', status: 'parked' },
      { id: 'ph3', name: 'Write the kids book', order: 3, description: "First draft of Chapter 1.", status: 'parked' },
    ],
  },
  { id: 'g2',
    name: 'Move somewhere quieter',
    overarching: "Be out of the city by next spring — a smaller place, near trees and water.",
    enthusiasm: "Every time I visit Mum's village I breathe differently. I want that as the default, not a holiday.",
    enthusiasmWhen: '6 weeks ago',
    color: '#2a8a8a', // turquoise
    icon: 'mountain',
    lastTouched: '17 days ago',
    phases: [
      { id: 'ph4', name: 'Save the deposit', order: 1, description: '£18k by Sept. Currently at £6k.', status: 'active' },
      { id: 'ph5', name: 'Visit three places', order: 2, description: 'Stay a weekend in each — feel the rhythm.', status: 'active' },
      { id: 'ph6', name: 'Make the move', order: 3, description: 'Pack, hand notice in, pick keys up.', status: 'parked' },
    ],
  },
];

// Backwards compat for places that still reference GOAL singular.
export const GOAL = GOALS[0];

export const PROJECTS = [
  { id: 'p1', phaseId: 'ph1', goalIds: ['g1'], name: 'Zen Tasks launch', color: '#5a8a3a', progress: 0.62, lastActive: '2h ago', status: 'active',
    note: "The core app is close. Focus on polishing the focus view and the goal-capture flow." },
  { id: 'p2', phaseId: 'ph1', goalIds: ['g1'], name: 'Landing page + waitlist', color: '#2a8a8a', progress: 0.28, lastActive: 'yesterday', status: 'active',
    note: "Aiming for something honest, not shouty. Stephen King quote at the bottom." },
  { id: 'p3', phaseId: 'ph1', goalIds: ['g1'], name: 'Private beta', color: '#8a6a3a', progress: 0, lastActive: '—', status: 'new',
    note: "5 people first. Give them a week, then open a bit wider." },
  // EP — cross-linked: belongs to "Build something" AND "Move somewhere quieter" (it's a quiet-life project too).
  { id: 'p4', phaseId: 'ph2', goalIds: ['g1', 'g2'], name: 'EP — Quiet Hours', color: '#2f7a8a', progress: 0.12, lastActive: '45 days ago', status: 'quiet',
    note: "Rough vocals for Track 2, then a studio day for drums." },
  { id: 'p5', phaseId: 'ph2', goalIds: ['g1'], name: 'Cover art', color: '#6a8a6a', progress: 0, lastActive: '—', status: 'parked', note: "" },
  { id: 'p6', phaseId: 'ph3', goalIds: ['g1'], name: 'Chapter 1 — The quiet room', color: '#a06a3a', progress: 0, lastActive: '—', status: 'parked', note: "" },
  // Goal 2 projects
  { id: 'p7', phaseId: 'ph4', goalIds: ['g2'], name: 'Deposit fund', color: '#3a8a6e', progress: 0.33, lastActive: '5d ago', status: 'active',
    note: "Sweep the freelance overflow into here every month." },
  { id: 'p8', phaseId: 'ph5', goalIds: ['g2'], name: 'Weekend in Hebden Bridge', color: '#6e8a3a', progress: 0.5, lastActive: 'yesterday', status: 'active',
    note: "Booked the cottage. Need a list of pubs and a walk." },
  { id: 'p9', phaseId: 'ph5', goalIds: ['g2'], name: 'Weekend in Lewes', color: '#8a6a3a', progress: 0, lastActive: '38 days ago', status: 'quiet', note: "" },
  { id: 'p10', phaseId: 'ph6', goalIds: ['g2'], name: 'Notice + paperwork', color: '#a06a3a', progress: 0, lastActive: '—', status: 'parked', note: "" },
];

export const TASKS = [
  // Goal 1 — Zen Tasks launch
  { id: 't1', projectId: 'p1', title: 'Draft three landing copy variants', priority: 'growing', due: 'Today', est: '45m', done: false, tags: ['writing'],
    subtasks: [{ id: 's1', title: 'Honest take', done: true }, { id: 's2', title: 'Playful take', done: false }, { id: 's3', title: 'Quiet/minimal take', done: false }],
    notes: "Try three takes: honest, playful, quiet. Pick one Friday.",
    comments: [
      { id: 'cm1', author: 'You', when: 'Mon 09:40', text: "Drafted the **honest** and **playful** takes. The quiet one still feels flat — will revisit after lunch." },
      { id: 'cm2', author: 'You', when: 'Tue 11:05', text: "Went with the honest take as the lead. Sending to Ava for a gut check before I commit." },
    ],
    history: [{ when: 'Today 09:12', what: 'Created' }, { when: 'Today 09:40', what: 'Added to focus' }] },
  { id: 't2', projectId: 'p1', title: 'Sketch three icon ideas for Zen logo', priority: 'growing', due: 'Today', est: '25m', done: false, tags: ['design'], subtasks: [], notes: "", history: [] },
  { id: 't3', projectId: 'p1', title: 'Polish focus view empty state', priority: 'seedling', due: 'This week', est: '1h', done: false, tags: ['design'], subtasks: [], notes: "", history: [] },
  { id: 't4', projectId: 'p1', title: 'Wire up Stripe test keys', priority: 'rooted', due: '—', est: '30m', done: true, tags: ['dev'], subtasks: [], notes: "", history: [] },
  { id: 't5', projectId: 'p1', title: 'Fix mobile tab flicker', priority: 'rooted', due: '—', est: '20m', done: true, tags: ['dev'], subtasks: [], notes: "", history: [] },
  { id: 't6', projectId: 'p2', title: 'Pick a hero illustration style', priority: 'seedling', due: 'This week', est: '45m', done: false, tags: ['design'], subtasks: [], notes: "", history: [] },
  { id: 't7', projectId: 'p2', title: 'Write headline + subhead options', priority: 'growing', due: 'Today', est: '30m', done: false, tags: ['writing'], subtasks: [], notes: "", history: [] },
  { id: 't8', projectId: 'p2', title: 'Hook up waitlist form', priority: 'rooted', due: 'Next week', est: '1h', done: false, tags: ['dev'], subtasks: [], notes: "", history: [] },
  { id: 't9', projectId: 'p3', title: 'Pick 5 beta testers', priority: 'seedling', due: 'This week', est: '15m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't10', projectId: 'p3', title: 'Write the welcome message', priority: 'seedling', due: '—', est: '20m', done: false, tags: ['writing'], subtasks: [], notes: "", history: [] },
  { id: 't11', projectId: 'p4', title: 'Record rough vocals for track 2', priority: 'rooted', due: '—', est: '1h', done: false, tags: ['music'], subtasks: [], notes: "", history: [] },
  { id: 't12', projectId: 'p4', title: 'Book studio time', priority: 'falling', due: 'Overdue', est: '10m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  // Goal 2 — Move somewhere quieter
  { id: 't13', projectId: 'p7', title: 'Set up monthly auto-transfer', priority: 'growing', due: 'This week', est: '15m', done: false, tags: ['admin'], subtasks: [], notes: "", history: [] },
  { id: 't14', projectId: 'p7', title: 'Sell the bike I never ride', priority: 'seedling', due: '—', est: '30m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't15', projectId: 'p8', title: 'Pack a bag and a notebook', priority: 'rooted', due: 'Today', est: '15m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't16', projectId: 'p8', title: 'Map out a walk for Sat morning', priority: 'seedling', due: 'This week', est: '20m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't17', projectId: 'p9', title: 'Find a place to stay', priority: 'seedling', due: 'Next week', est: '30m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  // Standalone / everyday — sorted into Categories (lightweight buckets, no goal or project).
  { id: 't18', projectId: null, categoryId: 'c1', title: 'Renew library card', priority: 'seedling', due: 'This week', est: '5m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't19', projectId: null, categoryId: 'c5', title: 'Text Priya happy birthday', priority: 'rooted', due: 'Today', est: '2m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't20', projectId: null, categoryId: 'c1', title: 'Return the parcel to the post office', priority: 'growing', due: 'Today', est: '20m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't21', projectId: null, categoryId: 'c1', title: 'Pick up the dry cleaning', priority: 'seedling', due: 'This week', est: '15m', done: true, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't22', projectId: null, categoryId: 'c2', title: 'Water the plants', priority: 'rooted', due: 'Today', est: '10m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't23', projectId: null, categoryId: 'c2', title: 'Fix the wobbly shelf in the hall', priority: 'seedling', due: '—', est: '30m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't24', projectId: null, categoryId: 'c3', title: 'Book a dentist checkup', priority: 'growing', due: 'This week', est: '10m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't25', projectId: null, categoryId: 'c3', title: 'Morning run — 5k', priority: 'seedling', due: 'Tomorrow', est: '40m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't26', projectId: null, categoryId: 'c4', title: 'Review monthly subscriptions', priority: 'growing', due: 'This week', est: '25m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't27', projectId: null, categoryId: 'c4', title: 'Pay the council tax', priority: 'rooted', due: 'Overdue', est: '10m', done: false, tags: [], subtasks: [], notes: "", history: [] },
];

// Categories — lightweight everyday buckets. Lighter than a Goal or Project:
// just a colour + name a task can live under (Errands, Home, Health…). Fully editable at runtime.
export const CATEGORIES = [
  { id: 'c1', name: 'Errands',  color: '#8a6a3a', icon: 'bag' },
  { id: 'c2', name: 'Home',     color: '#5a8a3a', icon: 'home' },
  { id: 'c3', name: 'Health',   color: '#2a8a8a', icon: 'heart' },
  { id: 'c4', name: 'Money',    color: '#3a8a6e', icon: 'wallet' },
  { id: 'c5', name: 'Personal', color: '#a06a3a', icon: 'tag' },
];

export const FOCUS_TASK_IDS = ['t1', 't2', 't7', 't15'];

// Project sections — collapsible groupings of tasks inside a project.
// Task.sectionId points to one of these.
export const PROJECT_SECTIONS = {
  p1: [
    { id: 'p1s1', name: 'Copy & story' },
    { id: 'p1s2', name: 'Polish & bugs' },
    { id: 'p1s3', name: 'Beta prep' },
  ],
  p2: [
    { id: 'p2s1', name: 'Visual direction' },
    { id: 'p2s2', name: 'Copy' },
    { id: 'p2s3', name: 'Build' },
  ],
};

// Assign tasks to sections (nondestructive).
export const TASK_SECTIONS = { t1:'p1s1', t2:'p1s1', t3:'p1s2', t4:'p1s2', t5:'p1s2', t9:'p1s3', t10:'p1s3',
  t6:'p2s1', t7:'p2s2', t8:'p2s3' };

// Upcoming reminders for Weekly Review.
export const UPCOMING = [
  { id: 'u1', text: 'Weekend in Hebden Bridge — cottage booked for Sat', when: 'Tomorrow', goalId: 'g2' },
  { id: 'u2', text: 'Studio day for drums', when: 'Thu', goalId: 'g1' },
  { id: 'u3', text: 'Monthly deposit sweep', when: 'Next Mon', goalId: 'g2' },
];

// Parse a human "last active" label ("2h ago", "yesterday", "5d ago", "14 days ago",
// "6 weeks ago") into a rough number of days. null = never touched ("—"), so brand-new
// projects are never treated as dormant.
export function lastActiveDays(s) {
  if (!s) return null;
  s = String(s).toLowerCase().trim();
  if (s === '—' || s === '-' || s === '') return null;
  if (/now|today|min|sec|hour|\d+\s*h\b|h ago/.test(s)) return 0;
  if (s.includes('yesterday')) return 1;
  const m = s.match(/(\d+)\s*(mo|month|d|day|w|week|y|year)/);
  if (!m) return null;
  const n = parseInt(m[1], 10), u = m[2];
  if (u === 'mo' || u.startsWith('month')) return n * 30;
  if (u[0] === 'y') return n * 365;
  if (u[0] === 'w') return n * 7;
  return n; // days
}

export const PROJECT_STALE_DAYS = 30;   // untouched longer than this → dormant (collapsed in the sidebar)
export const MAX_SIDEBAR_PROJECTS = 5;  // most-recent active projects shown before "show more"

// Proactive AI messages
export const ZEN_NUDGES = [
  { id: 'n1', when: 'this morning', kind: 'quiet-goal', text: "Move somewhere quieter hasn't had your attention in 17 days. Even an hour on the deposit fund would move it along — and you said yourself, that one matters.", ctaGoalId: 'g2' },
  { id: 'n2', when: 'this morning', kind: 'quiet-project', text: "Quiet Hours has been sitting for two weeks. When you're ready, even 20 minutes of rough vocals on Track 2 would move it along.", ctaProjectId: 'p4' },
  { id: 'n3', when: 'yesterday', kind: 'encouragement', text: "Landing page is further along than it feels. The copy variants on your focus list today are the last hard part — after that it's just choosing.", ctaProjectId: 'p2' },
];

export const DEFAULT_CHAT = [
  { role: 'assistant', text: "Morning. You're working towards two things — Zen Tasks shipping, and a quieter place to live. Today's focus mostly serves the first one. Worth giving the second a moment too?" },
];

// Notifications — shown in the bell panel. `body` is the expanded long-form text.
export const NOTIFICATIONS = [
  { id: 'no1', kind: 'ai', when: 'Just now', read: false,
    title: 'How Zen behaves — Assistant vs Manager',
    summary: 'A quick note on the two AI modes and what changes between them.',
    body: "Zen has two modes you can switch anytime in Settings.\n\nAssistant (default) — Zen advises, you stay in control. It lives behind ⌘K and the corner leaf, so it's out of the way until you call it. It can suggest what to start with, explain why a project's gone quiet, replay a note you wrote, or summarise your week — but it never changes your tasks on its own. Anything it proposes comes as a suggestion you tap to apply.\n\nManager — Zen becomes the main way you drive the app. You tell it what you want in plain words — \"add a task to call Ava about cover art\", \"mark the logo sketches done\", \"break this into three steps\" — and it makes the change, then shows you what it did. Bigger life moves, like parking a goal or switching your primary goal, it still checks with you first.\n\nEither way, the normal screens stay fully usable. Manager adds a conversational layer on top of the app — it never takes the buttons away. You can always fall back to tapping." },
  { id: 'no2', kind: 'quiet', when: 'This morning', read: false,
    title: 'Move somewhere quieter is resting',
    summary: "It hasn't had your attention in 17 days.",
    body: "Move somewhere quieter hasn't had your attention in 17 days. No pressure — but you said yourself that one matters. Even an hour on the deposit fund would keep it breathing. Want me to surface its next small step?" },
  { id: 'no3', kind: 'reminder', when: 'Tomorrow', read: true,
    title: 'Weekend in Hebden Bridge',
    summary: 'Cottage booked for Saturday.',
    body: "Your cottage in Hebden Bridge is booked for Saturday. You wanted to map a walk for Sat morning and pack a notebook — both are on your focus list. Nothing else needed; just a heads-up so it doesn't sneak up on you." },
  { id: 'no4', kind: 'encouragement', when: 'Yesterday', read: true,
    title: 'Landing page is closer than it feels',
    summary: 'The copy variants are the last hard part.',
    body: "The landing page is further along than it feels. The three copy variants on your focus list are the last genuinely hard part — after that, it's just choosing. You've got this one." },
];
