-- Nerologik — RIT members (research team accounts)
--
-- RIT members sign up at /rit with name, phone and password. They get the
-- private research journal at /research, and NOTHING else (no leads, no
-- analyses, no admin). Each person still only sees their own research rows.
--
-- Run once in the Supabase SQL editor, after 20261109000000_research_journal.sql.

create table public.rit_members (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 2 and 80),
  phone      text not null unique check (phone ~ '^[0-9]{9,15}$')
);

alter table public.rit_members enable row level security;
revoke all on public.rit_members from anon;
grant select on public.rit_members to authenticated;

-- Rows are created by the server (secret key) at sign-up.
create policy "Members see themselves, admins see all"
  on public.rit_members for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create or replace function public.is_rit_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.rit_members m where m.user_id = (select auth.uid()));
$$;

revoke all on function public.is_rit_member() from public;
grant execute on function public.is_rit_member() to anon, authenticated;

-- Research tables: own rows, for admins OR RIT members.
do $$
declare t text;
begin
  foreach t in array array['research_logs','research_process_steps','research_questions','research_weekly_reviews','research_candidates']
  loop
    execute format('drop policy if exists "Own research rows" on public.%I', t);
    execute format($p$create policy "Own research rows" on public.%I for all to authenticated
      using (user_id = (select auth.uid()) and ((select public.is_admin()) or (select public.is_rit_member())))
      with check (user_id = (select auth.uid()) and ((select public.is_admin()) or (select public.is_rit_member())))$p$, t);
  end loop;
end $$;
