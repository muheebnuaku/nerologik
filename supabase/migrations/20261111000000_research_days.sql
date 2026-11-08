-- Nerologik — custom calendar days for the research journal
--
-- "Add to calendar" saves extra dates (e.g. a Saturday visit, or a day
-- outside the study window) so they show on the calendar to be logged.
-- Own rows only, for admins or RIT members.
--
-- Run once in the Supabase SQL editor, after 20261110000000_rit_members.sql.

create table public.research_days (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day        date not null,
  unique (user_id, day)
);

alter table public.research_days enable row level security;
revoke all on public.research_days from anon;
grant select, insert, update, delete on public.research_days to authenticated;

create policy "Own research rows" on public.research_days for all to authenticated
  using (user_id = (select auth.uid()) and ((select public.is_admin()) or (select public.is_rit_member())))
  with check (user_id = (select auth.uid()) and ((select public.is_admin()) or (select public.is_rit_member())));
