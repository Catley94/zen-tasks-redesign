-- Zen Tasks — Supabase schema
-- All tables partition by user_id (auth) and profile_id (Spaces).
-- Enable Row Level Security on every table.

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles (Spaces) ────────────────────────────────────────────────────────
create table if not exists profiles (
  id          text        not null,
  user_id     uuid        references auth.users not null,
  name        text        not null default 'Personal',
  color       text        not null default '#5a8a3a',
  created_at  timestamptz not null default now(),
  primary key (id, user_id)
);

alter table profiles enable row level security;
create policy "Users manage their own profiles"
  on profiles for all using (auth.uid() = user_id);

-- ─── Goals ────────────────────────────────────────────────────────────────────
create table if not exists goals (
  id              text        primary key default 'g' || extract(epoch from now())::bigint::text,
  user_id         uuid        references auth.users not null,
  profile_id      text        not null default 'personal',
  name            text        not null,
  overarching     text        not null default '',
  enthusiasm      text        not null default '',
  enthusiasm_when text        not null default '',
  color           text        not null default '#3f6e3a',
  icon            text        not null default 'leaf',
  last_touched    text        not null default 'just now',
  phases          jsonb       not null default '[]',
  -- phases shape: [{ id, name, order, description, status }]
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table goals enable row level security;
create policy "Users manage their own goals"
  on goals for all using (auth.uid() = user_id);

-- ─── Projects ─────────────────────────────────────────────────────────────────
create table if not exists projects (
  id          text        primary key default 'p' || extract(epoch from now())::bigint::text,
  user_id     uuid        references auth.users not null,
  profile_id  text        not null default 'personal',
  name        text        not null,
  color       text        not null default '#5a8a3a',
  progress    numeric     not null default 0 check (progress >= 0 and progress <= 1),
  last_active text        not null default 'just now',
  status      text        not null default 'active'
                          check (status in ('active','new','quiet','parked')),
  note        text        not null default '',
  phase_id    text,
  -- many-to-many goal links stored in project_goals junction table
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table projects enable row level security;
create policy "Users manage their own projects"
  on projects for all using (auth.uid() = user_id);

-- ─── Project ↔ Goal junction (with phase assignment) ─────────────────────────
create table if not exists project_goals (
  project_id  text        not null references projects(id) on delete cascade,
  goal_id     text        not null references goals(id) on delete cascade,
  phase_id    text,       -- which phase of this goal the project sits in (nullable)
  user_id     uuid        references auth.users not null,
  primary key (project_id, goal_id)
);

alter table project_goals enable row level security;
create policy "Users manage their own project_goals"
  on project_goals for all using (auth.uid() = user_id);

-- ─── Categories ───────────────────────────────────────────────────────────────
create table if not exists categories (
  id          text        primary key default 'c' || extract(epoch from now())::bigint::text,
  user_id     uuid        references auth.users not null,
  profile_id  text        not null default 'personal',
  name        text        not null,
  color       text        not null default '#5a8a3a',
  icon        text        not null default 'tag',
  created_at  timestamptz not null default now()
);

alter table categories enable row level security;
create policy "Users manage their own categories"
  on categories for all using (auth.uid() = user_id);

-- ─── Tasks ────────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id          text        primary key default 't' || extract(epoch from now())::bigint::text,
  user_id     uuid        references auth.users not null,
  profile_id  text        not null default 'personal',
  title       text        not null,
  notes       text        not null default '',
  priority    text        not null default 'seedling'
                          check (priority in ('seedling','growing','rooted','falling')),
  due         text        not null default '—',
  date        text,       -- ISO date string YYYY-MM-DD
  est         text        not null default '—',
  done        boolean     not null default false,
  project_id  text        references projects(id) on delete set null,
  category_id text        references categories(id) on delete set null,
  section_id  text,       -- project section id (denormalized)
  reminder    text        not null default 'none',
  tags        jsonb       not null default '[]',
  -- tags shape: string[]
  subtasks    jsonb       not null default '[]',
  -- subtasks shape: [{ id, title, done }]
  comments    jsonb       not null default '[]',
  -- comments shape: [{ id, author, when, text, edited? }]
  reminders   jsonb       not null default '[]',
  -- reminders shape: [{ id, dateISO, time?, label }]
  history     jsonb       not null default '[]',
  -- history shape: [{ when, what }]
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table tasks enable row level security;
create policy "Users manage their own tasks"
  on tasks for all using (auth.uid() = user_id);

-- ─── Note Collections ─────────────────────────────────────────────────────────
create table if not exists note_collections (
  id          text        primary key default 'col' || extract(epoch from now())::bigint::text,
  user_id     uuid        references auth.users not null,
  profile_id  text        not null default 'personal',
  name        text        not null,
  color       text        not null default '#2a8a8a',
  icon        text        not null default 'leaf',
  created_at  timestamptz not null default now()
);

alter table note_collections enable row level security;
create policy "Users manage their own note_collections"
  on note_collections for all using (auth.uid() = user_id);

-- ─── Notes ────────────────────────────────────────────────────────────────────
create table if not exists notes (
  id              text        primary key default 'note' || extract(epoch from now())::bigint::text,
  user_id         uuid        references auth.users not null,
  profile_id      text        not null default 'personal',
  collection_id   text        references note_collections(id) on delete set null,
  title           text        not null default '',
  body            text        not null default '',
  pinned          boolean     not null default false,
  tags            jsonb       not null default '[]',
  -- tags shape: string[]
  links           jsonb       not null default '[]',
  -- links shape: [{ type: 'goal'|'project', id }]
  ts              integer     not null default 0,
  updated         text        not null default 'Just now',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table notes enable row level security;
create policy "Users manage their own notes"
  on notes for all using (auth.uid() = user_id);

-- ─── User Settings ────────────────────────────────────────────────────────────
create table if not exists user_settings (
  user_id           uuid        primary key references auth.users,
  active_profile_id text        not null default 'personal',
  density           text        not null default 'calm'
                                check (density in ('calm','compact')),
  ai_mode           text        not null default 'assistant'
                                check (ai_mode in ('assistant','manager')),
  dyslexia_font     boolean     not null default false,
  primary_goal_id   text,
  focus_task_ids    jsonb       not null default '[]',
  -- focus_task_ids shape: string[]
  pinned_project_ids jsonb      not null default '[]',
  -- pinned_project_ids shape: string[]
  updated_at        timestamptz not null default now()
);

alter table user_settings enable row level security;
create policy "Users manage their own settings"
  on user_settings for all using (auth.uid() = user_id);

-- ─── Updated-at triggers ──────────────────────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger goals_updated_at before update on goals
  for each row execute procedure update_updated_at_column();
create trigger projects_updated_at before update on projects
  for each row execute procedure update_updated_at_column();
create trigger tasks_updated_at before update on tasks
  for each row execute procedure update_updated_at_column();
create trigger notes_updated_at before update on notes
  for each row execute procedure update_updated_at_column();
create trigger user_settings_updated_at before update on user_settings
  for each row execute procedure update_updated_at_column();
