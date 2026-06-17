export const GOALS = [
  { id: 'g1', name: "Build something I'm proud of",
    overarching: "Make a living from my own work by the end of 2026.",
    enthusiasm: "This one feels different — it's the first thing I've built that's for me, not for a client. If I finish one real thing this year I'll have proved to myself that I can.",
    enthusiasmWhen: '3 weeks ago', color: '#3f6e3a', icon: 'leaf', lastTouched: '2h ago',
    phases: [
      { id: 'ph1', name: 'Ship Zen Tasks MVP', order: 1, description: 'Get the app in front of 10 real users.', status: 'active' },
      { id: 'ph2', name: 'Record the EP', order: 2, description: 'Quiet Hours — 5 tracks, rough mixes.', status: 'parked' },
      { id: 'ph3', name: 'Write the kids book', order: 3, description: "First draft of Chapter 1.", status: 'parked' },
    ] },
  { id: 'g2', name: 'Move somewhere quieter',
    overarching: "Be out of the city by next spring — a smaller place, near trees and water.",
    enthusiasm: "Every time I visit Mum's village I breathe differently. I want that as the default, not a holiday.",
    enthusiasmWhen: '6 weeks ago', color: '#2a8a8a', icon: 'mountain', lastTouched: '17 days ago',
    phases: [
      { id: 'ph4', name: 'Save the deposit', order: 1, description: '£18k by Sept. Currently at £6k.', status: 'active' },
      { id: 'ph5', name: 'Visit three places', order: 2, description: 'Stay a weekend in each — feel the rhythm.', status: 'active' },
      { id: 'ph6', name: 'Make the move', order: 3, description: 'Pack, hand notice in, pick keys up.', status: 'parked' },
    ] },
];

export const GOAL = GOALS[0];

export const PROJECTS = [
  { id: 'p1', phaseId: 'ph1', goalIds: ['g1'], name: 'Zen Tasks launch', color: '#5a8a3a', progress: 0.62, lastActive: '2h ago', status: 'active', note: "The core app is close. Focus on polishing the focus view and the goal-capture flow." },
  { id: 'p2', phaseId: 'ph1', goalIds: ['g1'], name: 'Landing page + waitlist', color: '#2a8a8a', progress: 0.28, lastActive: 'yesterday', status: 'active', note: "Aiming for something honest, not shouty. Stephen King quote at the bottom." },
  { id: 'p3', phaseId: 'ph1', goalIds: ['g1'], name: 'Private beta', color: '#8a6a3a', progress: 0, lastActive: '—', status: 'new', note: "5 people first. Give them a week, then open a bit wider." },
  { id: 'p4', phaseId: 'ph2', goalIds: ['g1', 'g2'], name: 'EP — Quiet Hours', color: '#2f7a8a', progress: 0.12, lastActive: '45 days ago', status: 'quiet', note: "Rough vocals for Track 2, then a studio day for drums." },
  { id: 'p5', phaseId: 'ph2', goalIds: ['g1'], name: 'Cover art', color: '#6a8a6a', progress: 0, lastActive: '—', status: 'parked', note: "" },
  { id: 'p6', phaseId: 'ph3', goalIds: ['g1'], name: 'Chapter 1 — The quiet room', color: '#a06a3a', progress: 0, lastActive: '—', status: 'parked', note: "" },
  { id: 'p7', phaseId: 'ph4', goalIds: ['g2'], name: 'Deposit fund', color: '#3a8a6e', progress: 0.33, lastActive: '5d ago', status: 'active', note: "Sweep the freelance overflow into here every month." },
  { id: 'p8', phaseId: 'ph5', goalIds: ['g2'], name: 'Weekend in Hebden Bridge', color: '#6e8a3a', progress: 0.5, lastActive: 'yesterday', status: 'active', note: "Booked the cottage. Need a list of pubs and a walk." },
  { id: 'p9', phaseId: 'ph5', goalIds: ['g2'], name: 'Weekend in Lewes', color: '#8a6a3a', progress: 0, lastActive: '38 days ago', status: 'quiet', note: "" },
  { id: 'p10', phaseId: 'ph6', goalIds: ['g2'], name: 'Notice + paperwork', color: '#a06a3a', progress: 0, lastActive: '—', status: 'parked', note: "" },
];

export const TASKS = [
  { id: 't1', projectId: 'p1', title: 'Draft three landing copy variants', priority: 'growing', due: 'Today', est: '45m', done: false, tags: ['writing'],
    subtasks: [{ id: 's1', title: 'Honest take', done: true }, { id: 's2', title: 'Playful take', done: false }, { id: 's3', title: 'Quiet/minimal take', done: false }],
    notes: "Try three takes: honest, playful, quiet. Pick one Friday.\n\nFollow-on once copy lands: [Sketch icon ideas for the logo](task:t2).",
    reminders: [{ id: 'rm-seed1', time: '09:30', label: 'Send to Ava before lunch' }],
    comments: [
      { id: 'cm1', author: 'You', when: 'Mon 09:40', text: "Drafted the **honest** and **playful** takes. The quiet one still feels flat — will revisit after lunch." },
      { id: 'cm2', author: 'You', when: 'Tue 11:05', text: "Went with the honest take as the lead. Sending to Ava for a gut check before I commit." },
    ], history: [{ when: 'Today 09:12', what: 'Created' }, { when: 'Today 09:40', what: 'Added to focus' }] },
  { id: 't2', projectId: 'p1', title: 'Sketch three icon ideas for Zen logo', priority: 'growing', due: 'Today', est: '25m', done: false, tags: ['design'], subtasks: [], notes: "Wait on the copy direction — see [Draft landing copy variants](task:t1).\n\nNext up: [Polish the focus view empty state](task:t3).", history: [] },
  { id: 't3', projectId: 'p1', title: 'Polish focus view empty state', priority: 'seedling', due: 'This week', est: '1h', done: false, tags: ['design'], subtasks: [], notes: "Then move to the landing page: [Pick a hero illustration style](task:t6).", history: [] },
  { id: 't4', projectId: 'p1', title: 'Wire up Stripe test keys', priority: 'rooted', due: '—', est: '30m', done: true, tags: ['dev'], subtasks: [], notes: "", history: [] },
  { id: 't5', projectId: 'p1', title: 'Fix mobile tab flicker', priority: 'rooted', due: '—', est: '20m', done: true, tags: ['dev'], subtasks: [], notes: "", history: [] },
  { id: 't6', projectId: 'p2', title: 'Pick a hero illustration style', priority: 'seedling', due: 'This week', est: '45m', done: false, tags: ['design'], subtasks: [], notes: "Pairs with the copy work: [Write headline + subhead options](task:t7).", history: [] },
  { id: 't7', projectId: 'p2', title: 'Write headline + subhead options', priority: 'growing', due: 'Today', est: '30m', done: false, tags: ['writing'], subtasks: [], notes: "", history: [] },
  { id: 't8', projectId: 'p2', title: 'Hook up waitlist form', priority: 'rooted', due: 'Next week', est: '1h', done: false, tags: ['dev'], subtasks: [], notes: "", history: [] },
  { id: 't9', projectId: 'p3', title: 'Pick 5 beta testers', priority: 'seedling', due: 'This week', est: '15m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't10', projectId: 'p3', title: 'Write the welcome message', priority: 'seedling', due: '—', est: '20m', done: false, tags: ['writing'], subtasks: [], notes: "", history: [] },
  { id: 't11', projectId: 'p4', title: 'Record rough vocals for track 2', priority: 'rooted', due: '—', est: '1h', done: false, tags: ['music'], subtasks: [], notes: "", history: [] },
  { id: 't12', projectId: 'p4', title: 'Book studio time', priority: 'falling', due: 'Overdue', est: '10m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't13', projectId: 'p7', title: 'Set up monthly auto-transfer', priority: 'growing', due: 'This week', est: '15m', done: false, tags: ['admin'], subtasks: [], notes: "", history: [] },
  { id: 't14', projectId: 'p7', title: 'Sell the bike I never ride', priority: 'seedling', due: '—', est: '30m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't15', projectId: 'p8', title: 'Pack a bag and a notebook', priority: 'rooted', due: 'Today', est: '15m', done: false, tags: [], subtasks: [], notes: "", reminders: [{ id: 'rm-seed2', time: '18:00', label: 'Before you head out' }], history: [] },
  { id: 't16', projectId: 'p8', title: 'Map out a walk for Sat morning', priority: 'seedling', due: 'This week', est: '20m', done: false, tags: [], subtasks: [], notes: "", history: [] },
  { id: 't17', projectId: 'p9', title: 'Find a place to stay', priority: 'seedling', due: 'Next week', est: '30m', done: false, tags: [], subtasks: [], notes: "", history: [] },
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
  { id: 'dt1', projectId: null, categoryId: 'c6', title: 'Demo 1 · Start here', priority: 'growing', due: 'Today', est: '5m', done: false, tags: ['demo', 'shopping'], subtasks: [],
    notes: "This is the start of a 5-task chain.\n\nNext → [Demo 2 · Stack me](task:dt2)", history: [] },
  { id: 'dt2', projectId: null, categoryId: 'c6', title: 'Demo 2 · Stack me', priority: 'growing', due: 'Today', est: '5m', done: false, tags: ['demo', 'Aldi'], subtasks: [],
    notes: "You're now stacked on top of Demo 1.\n\nNext → [Demo 3 · Keep going](task:dt3)", history: [] },
  { id: 'dt3', projectId: null, categoryId: 'c6', title: 'Demo 3 · Keep going', priority: 'seedling', due: 'Today', est: '5m', done: false, tags: ['demo', 'Tesco'], subtasks: [],
    notes: "Three cards deep now.\n\nNext → [Demo 4 · Drop the oldest](task:dt4)", history: [] },
  { id: 'dt4', projectId: null, categoryId: 'c6', title: 'Demo 4 · Drop the oldest', priority: 'seedling', due: 'Today', est: '5m', done: false, tags: ['demo', 'Argos'], subtasks: [],
    notes: "Demo 1 just slid off.\n\nNext → [Demo 5 · The end](task:dt5)", history: [] },
  { id: 'dt5', projectId: null, categoryId: 'c6', title: 'Demo 5 · The end', priority: 'rooted', due: 'Today', est: '5m', done: false, tags: ['demo', 'done'], subtasks: [],
    notes: "End of the chain.\n\nStart over → [Demo 1 · Start here](task:dt1)", history: [] },
];

export const CATEGORIES = [
  { id: 'c1', name: 'Errands',  color: '#8a6a3a', icon: 'bag' },
  { id: 'c2', name: 'Home',     color: '#5a8a3a', icon: 'home' },
  { id: 'c3', name: 'Health',   color: '#2a8a8a', icon: 'heart' },
  { id: 'c4', name: 'Money',    color: '#3a8a6e', icon: 'wallet' },
  { id: 'c5', name: 'Personal', color: '#a06a3a', icon: 'tag' },
  { id: 'c6', name: 'Stacking demo', color: '#7a4f8a', icon: 'tag' },
];

export const NOTE_COLLECTIONS = [
  { id: 'col1', name: 'Reflections', color: '#2a8a8a', icon: 'leaf' },
  { id: 'col2', name: 'Reading',     color: '#8a6a3a', icon: 'book' },
  { id: 'col3', name: 'To explore',  color: '#6e8a3a', icon: 'compass' },
  { id: 'col4', name: 'Sparks',      color: '#a06a3a', icon: 'spark' },
];

export const NOTES = [
  { id: 'note1', collectionId: 'col1', pinned: true, tags: ['meditation', 'breath'], ts: 8, updated: 'This morning',
    title: 'The space between thoughts',
    body: "Twenty minutes this morning and for a few seconds there was a gap — no commentary, just the room and the breath. I keep wanting to *grab* it, and that wanting is exactly what ends it.\n\nWhat I noticed:\n- The gap comes when I stop trying to make it come.\n- Counting breaths is a crutch, but a good one.\n- The mind isn't the enemy. It's just loud.\n\n> Don't push the river.\n\nWorth sitting with: what would it be like to *not* narrate the next hour of work?" },
  { id: 'note8', collectionId: 'col1', pinned: false, tags: ['making', 'shipping'], ts: 7, updated: 'Yesterday', links: [{ type: 'project', id: 'p1' }],
    title: "On shipping before it's ready",
    body: "Caught myself polishing the focus view for the third time this week. The polishing is hiding.\n\n> Done is a decision, not a feeling.\n\nShip the thing. The quiet note I keep forgetting: nobody is watching as closely as I think they are." },
  { id: 'note3', collectionId: 'col1', pinned: false, tags: ['ritual', 'morning'], ts: 6, updated: '2 days ago',
    title: 'Three breaths before the laptop',
    body: "A small thing I want to keep: before opening the laptop, three slow breaths with my hand flat on the desk. Just to *arrive* before the inbox arrives for me.\n\nDay three. It works on the days I actually remember to do it — which is the whole problem with small good things." },
  { id: 'note5', collectionId: 'col3', pinned: true, tags: ['money', 'questions'], ts: 5, updated: '4 days ago', links: [{ type: 'goal', id: 'g2' }],
    title: "What does 'enough' actually mean?",
    body: "The deposit goal is £18k. But £18k for *what*, exactly? A number I picked because it sounded safe.\n\nQuestions to sit with — not to answer today:\n- What's the smallest version of the quieter life that would still feel like the real thing?\n- Am I saving *toward* a place, or *away* from this one?\n- Where did the number actually come from?\n\nNo task here. Just a thread to keep pulling." },
  { id: 'note2', collectionId: 'col2', pinned: false, tags: ['craft', 'making'], ts: 4, updated: 'Last week', links: [{ type: 'project', id: 'p1' }],
    title: 'On doing the work, not the talking',
    body: "Listened to that interview with the potter again. What stayed with me, in my own words:\n\n> You don't find your voice by thinking about it. You find it by making a hundred bad bowls.\n\nApplies to Zen Tasks more than I'd like to admit. Less planning the perfect thing. More bad bowls." },
  { id: 'note7', collectionId: 'col3', pinned: false, tags: ['dreaming'], ts: 3, updated: 'Last week', links: [{ type: 'goal', id: 'g2' }],
    title: 'The cabin daydream',
    body: "The recurring one: a small place near water, a desk by a window, woodsmoke in the evening. I notice I reach for it most when work gets loud.\n\nIs it an escape fantasy or an actual plan? Maybe the point of the weekend in Hebden is to find out which one it is." },
  { id: 'note6', collectionId: 'col4', pinned: false, tags: ['experiment', 'writing'], ts: 2, updated: '2 weeks ago',
    title: 'Morning pages — try it for a week?',
    body: "Idea: three longhand pages every morning before anything else. Not journaling exactly — more like clearing the cache so the day starts with less static.\n\nNot a task, and I don't want to turn it into one. If it sticks, it sticks. Revisit next Sunday." },
  { id: 'note4', collectionId: 'col2', pinned: false, tags: ['reading'], ts: 1, updated: '3 weeks ago',
    title: 'Books for the quieter life',
    body: "A running list. No pressure to finish any of them.\n\n- *The Three Marriages* — David Whyte (re-read the work chapter)\n- *How to Live on 24 Hours a Day* — Arnold Bennett\n- *Silence in the Age of Noise* — Erling Kagge\n- *A Field Guide to Getting Lost* — Rebecca Solnit\n\nCurrently reading: nothing. Which is its own kind of fine." },
];

export const FOCUS_TASK_IDS = ['t1', 't2', 't7', 't15'];

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

export const TASK_SECTIONS = {
  t1:'p1s1', t2:'p1s1', t3:'p1s2', t4:'p1s2', t5:'p1s2', t9:'p1s3', t10:'p1s3',
  t6:'p2s1', t7:'p2s2', t8:'p2s3',
};

export const UPCOMING = [
  { id: 'u1', text: 'Weekend in Hebden Bridge — cottage booked for Sat', when: 'Tomorrow', goalId: 'g2' },
  { id: 'u2', text: 'Studio day for drums', when: 'Thu', goalId: 'g1' },
  { id: 'u3', text: 'Monthly deposit sweep', when: 'Next Mon', goalId: 'g2' },
];

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
  return n;
}

export const PROJECT_STALE_DAYS = 30;
export const MAX_SIDEBAR_PROJECTS = 5;

export const ZEN_NUDGES = [
  { id: 'n1', when: 'this morning', kind: 'quiet-goal', text: "Move somewhere quieter hasn't had your attention in 17 days. Even an hour on the deposit fund would move it along — and you said yourself, that one matters.", ctaGoalId: 'g2' },
  { id: 'n2', when: 'this morning', kind: 'quiet-project', text: "Quiet Hours has been sitting for two weeks. When you're ready, even 20 minutes of rough vocals on Track 2 would move it along.", ctaProjectId: 'p4' },
  { id: 'n3', when: 'yesterday', kind: 'encouragement', text: "Landing page is further along than it feels. The copy variants on your focus list today are the last hard part — after that it's just choosing.", ctaProjectId: 'p2' },
];

export const DEFAULT_CHAT = [
  { role: 'assistant', text: "Morning. You're working towards two things — Zen Tasks shipping, and a quieter place to live. Today's focus mostly serves the first one. Worth giving the second a moment too?" },
];

export const NOTIFICATIONS = [
  { id: 'no1', kind: 'ai', when: 'Just now', read: false,
    title: 'How Zen behaves — Assistant vs Manager',
    summary: 'A quick note on the two AI modes and what changes between them.',
    body: "Zen has two modes you can switch anytime in Settings.\n\nAssistant (default) — Zen advises, you stay in control. It lives behind ⌘K and the corner leaf, so it's out of the way until you call it.\n\nManager — Zen becomes the main way you drive the app. Tell it what you want in plain words and it makes the change, then shows you what it did.",
    ctaNav: 'settings', ctaNavLabel: 'Open Settings' },
  { id: 'no2', kind: 'quiet', when: 'This morning', read: false,
    title: 'Move somewhere quieter is resting',
    summary: "It hasn't had your attention in 17 days.",
    body: "Move somewhere quieter hasn't had your attention in 17 days. No pressure — but you said yourself that one matters. Even an hour on the deposit fund would keep it breathing.",
    ctaGoalId: 'g2', ctaProjectId: 'p7' },
  { id: 'no3', kind: 'reminder', when: 'Tomorrow', read: true,
    title: 'Weekend in Hebden Bridge',
    summary: 'Cottage booked for Saturday.',
    body: "Your cottage in Hebden Bridge is booked for Saturday. You wanted to map a walk for Sat morning and pack a notebook — both are on your focus list.",
    ctaProjectId: 'p8', ctaTaskId: 't15' },
  { id: 'no4', kind: 'encouragement', when: 'Yesterday', read: true,
    title: 'Landing page is closer than it feels',
    summary: 'The copy variants are the last hard part.',
    body: "The landing page is further along than it feels. The three copy variants on your focus list are the last genuinely hard part — after that, it's just choosing.",
    ctaProjectId: 'p2', ctaTaskId: 't1' },
];

export const TOKENS = {
  bg: '#f6f2e8', bgSoft: '#f1ecdd', surface: '#fbf7ee', surfaceAlt: '#fdfaf3',
  ink: '#2a2e26', inkSoft: '#4a4e45', sub: '#6b6e63', subSoft: '#8a8d82',
  line: '#e6ddc9', lineSoft: '#efe8d6', lineSofter: '#f3edde',
  green: '#3f6e3a', greenDeep: '#2d5228', greenSoft: '#d6e2cb', greenTint: '#ebf1e2',
  teal: '#2a8a8a', tealDeep: '#1f6a6a', tealSoft: '#c8e0e0', tealTint: '#e0ecec',
  warn: '#b8733a', warnSoft: '#f1e1cf', rose: '#9a4a4a',
  dotSeedling: '#a8b89a', dotGrowing: '#6b9a4e', dotRooted: '#3f6e3a', dotFalling: '#b8733a',
  radius: 10, radiusSm: 6, radiusLg: 14,
  fontSans: '"Inter", system-ui, sans-serif',
  fontMono: 'ui-monospace, "SF Mono", monospace',
};

export const btnReset = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
  fontStyle: 'inherit', lineHeight: 'inherit', color: 'inherit', padding: 0,
};

export const PRIORITY_LABEL = { seedling: 'Seedling', growing: 'Growing', rooted: 'Rooted', falling: 'Falling' };
export const PRIORITY_COLOR = {
  seedling: '#a8b89a', growing: '#6b9a4e', rooted: '#3f6e3a', falling: '#b8733a',
};
