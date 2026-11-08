-- Nerologik — private research journal (admin only, per user)
-- Tables: research_logs, research_process_steps, research_questions,
--         research_weekly_reviews, research_candidates
--
-- Every row belongs to the admin who wrote it (user_id defaults to auth.uid()).
-- RLS: an admin can only ever see and change their OWN research rows.
-- Notes are process-level only; the app blocks identifiers before saving.
--
-- Run once in the Supabase SQL editor.

-- ─────────────────────────────────────────────────────────────────────────────
-- Daily logs
-- ─────────────────────────────────────────────────────────────────────────────
create table public.research_logs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date    date not null,
  observer    text not null default 'me' check (char_length(observer) between 1 and 60),
  pain_score  smallint check (pain_score between 1 and 5),
  entry       jsonb not null default '{}'::jsonb,
  unique (user_id, observer, log_date)
);
create index research_logs_user_date_idx on public.research_logs (user_id, log_date desc);
create trigger research_logs_set_updated_at before update on public.research_logs
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Process map
-- ─────────────────────────────────────────────────────────────────────────────
create table public.research_process_steps (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  position    integer not null default 0,
  title       text not null check (char_length(title) between 1 and 200),
  tool        text check (char_length(tool) <= 200),
  owner       text check (char_length(owner) <= 200),
  notes       text check (char_length(notes) <= 4000),
  keywords    text[] not null default '{}'
);
create index research_steps_user_idx on public.research_process_steps (user_id, position);
create trigger research_steps_set_updated_at before update on public.research_process_steps
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Questions to ask
-- ─────────────────────────────────────────────────────────────────────────────
create table public.research_questions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question    text not null check (char_length(question) between 3 and 500),
  source      text not null default 'manual' check (source in ('guide', 'weekly', 'map', 'manual')),
  status      text not null default 'open' check (status in ('open', 'asked', 'answered')),
  answer      text check (char_length(answer) <= 4000)
);
create index research_questions_user_idx on public.research_questions (user_id, status);
create trigger research_questions_set_updated_at before update on public.research_questions
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Weekly reviews (the computed stats are rebuilt live; this stores your notes)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.research_weekly_reviews (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week_start  date not null,
  notes       jsonb not null default '{}'::jsonb,
  unique (user_id, week_start)
);
create trigger research_weekly_set_updated_at before update on public.research_weekly_reviews
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Candidate problems (manual overrides of the auto-generated list + summary)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.research_candidates (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key         text not null check (char_length(key) <= 200),   -- cluster key, or 'manual:<uuid>'
  title       text not null check (char_length(title) <= 300),
  frequency   smallint check (frequency between 1 and 5),      -- null = use auto score
  pain        smallint check (pain between 1 and 5),
  buildable   smallint check (buildable between 1 and 5),
  safe        smallint check (safe between 1 and 5),
  dismissed   boolean not null default false,
  chosen      boolean not null default false,
  summary     jsonb,
  unique (user_id, key)
);
create trigger research_candidates_set_updated_at before update on public.research_candidates
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: own rows only, and only while you are an admin
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['research_logs','research_process_steps','research_questions','research_weekly_reviews','research_candidates']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format($p$create policy "Own research rows" on public.%I for all to authenticated
      using (user_id = (select auth.uid()) and (select public.is_admin()))
      with check (user_id = (select auth.uid()) and (select public.is_admin()))$p$, t);
  end loop;
end $$;
