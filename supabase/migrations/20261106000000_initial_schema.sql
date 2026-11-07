-- Nerologik — initial schema
-- Tables: admins, leads, newsletter_subscribers, case_studies, testimonials, posts
--
-- Access model (enforced by Row Level Security):
--   • Public (anon)      → read PUBLISHED content; insert leads + newsletter sign-ups only
--   • Admins             → full read/write on everything (membership in public.admins)
--   • Server (secret key)→ bypasses RLS; used only in server code
--
-- Safe to run once in the Supabase SQL editor on a fresh project.

-- ─────────────────────────────────────────────────────────────────────────────
-- Helpers
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Admins
-- ─────────────────────────────────────────────────────────────────────────────

create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- SECURITY DEFINER so policies can check membership without exposing the table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create policy "Admins can see the admin list"
  on public.admins for select
  to authenticated
  using ((select public.is_admin()));
-- No insert/update/delete policies: admins are added from the SQL editor only.

-- ─────────────────────────────────────────────────────────────────────────────
-- Leads (contact form)
-- ─────────────────────────────────────────────────────────────────────────────

create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 2 and 120),
  email      text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company    text check (char_length(company) <= 160),
  service    text not null check (service in ('custom-software', 'ai-automation', 'web-mobile-apps', 'digital-marketing', 'not-sure')),
  budget     text not null check (budget in ('under-5k', '5k-15k', '15k-50k', '50k-plus', 'not-sure')),
  message    text not null check (char_length(message) between 20 and 3000),
  source     text check (char_length(source) <= 200),
  status     text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'won', 'lost', 'spam')),
  notes      text
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

-- The public may only submit the form fields — never status or internal notes.
revoke insert, update, delete on public.leads from anon, authenticated;
grant insert (name, email, company, service, budget, message, source) on public.leads to anon, authenticated;
grant update, delete on public.leads to authenticated; -- still gated by admin policies below

create policy "Anyone can submit a lead"
  on public.leads for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read leads"
  on public.leads for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can update leads"
  on public.leads for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete leads"
  on public.leads for delete
  to authenticated
  using ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────────────────────
-- Newsletter subscribers
-- ─────────────────────────────────────────────────────────────────────────────

create table public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  email           text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source          text check (char_length(source) <= 200),
  status          text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  unsubscribed_at timestamptz
);

-- One row per address, case-insensitive.
create unique index newsletter_subscribers_email_key on public.newsletter_subscribers (lower(email));

alter table public.newsletter_subscribers enable row level security;

revoke insert, update, delete on public.newsletter_subscribers from anon, authenticated;
grant insert (email, source) on public.newsletter_subscribers to anon, authenticated;
grant update, delete on public.newsletter_subscribers to authenticated;

create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read subscribers"
  on public.newsletter_subscribers for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can update subscribers"
  on public.newsletter_subscribers for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete subscribers"
  on public.newsletter_subscribers for delete
  to authenticated
  using ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────────────────────
-- Case studies (Work)
-- ─────────────────────────────────────────────────────────────────────────────

create table public.case_studies (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  client           text not null,
  title            text not null,
  summary          text not null,
  content          text not null default '',        -- Markdown
  tags             text[] not null default '{}',
  categories       text[] not null default '{}',    -- ai | web | payments | automation | education
  services         text[] not null default '{}',    -- service slugs
  metric_value     text,
  metric_label     text,
  live_url         text not null,
  live_label       text,
  image_url        text,                            -- desktop screenshot
  mobile_image_url text,
  featured         boolean not null default false,
  sort_order       integer not null default 0,
  is_published     boolean not null default false,
  published_at     timestamptz
);

create index case_studies_published_idx on public.case_studies (is_published, sort_order);

create trigger case_studies_set_updated_at
  before update on public.case_studies
  for each row execute function public.set_updated_at();

alter table public.case_studies enable row level security;

create policy "Published case studies are public"
  on public.case_studies for select
  to anon, authenticated
  using (is_published or (select public.is_admin()));

create policy "Admins can insert case studies"
  on public.case_studies for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update case studies"
  on public.case_studies for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete case studies"
  on public.case_studies for delete
  to authenticated
  using ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────────────────────
-- Testimonials
-- ─────────────────────────────────────────────────────────────────────────────

create table public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  name          text not null,
  role          text,
  company       text,
  quote         text not null check (char_length(quote) <= 1000),
  avatar_url    text,
  case_study_id uuid references public.case_studies (id) on delete set null,
  sort_order    integer not null default 0,
  is_published  boolean not null default false
);

create index testimonials_published_idx on public.testimonials (is_published, sort_order);
create index testimonials_case_study_id_idx on public.testimonials (case_study_id);

create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;

create policy "Published testimonials are public"
  on public.testimonials for select
  to anon, authenticated
  using (is_published or (select public.is_admin()));

create policy "Admins can insert testimonials"
  on public.testimonials for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update testimonials"
  on public.testimonials for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete testimonials"
  on public.testimonials for delete
  to authenticated
  using ((select public.is_admin()));

-- ─────────────────────────────────────────────────────────────────────────────
-- Posts (Insights)
-- ─────────────────────────────────────────────────────────────────────────────

create table public.posts (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title           text not null,
  excerpt         text not null,
  content         text not null default '',   -- Markdown
  category        text not null,
  author          text not null default 'Nerologik team',
  cover_image_url text,
  is_published    boolean not null default false,
  published_at    timestamptz
);

create index posts_published_idx on public.posts (is_published, published_at desc);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

create policy "Published posts are public"
  on public.posts for select
  to anon, authenticated
  using (is_published or (select public.is_admin()));

create policy "Admins can insert posts"
  on public.posts for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update posts"
  on public.posts for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete posts"
  on public.posts for delete
  to authenticated
  using ((select public.is_admin()));
