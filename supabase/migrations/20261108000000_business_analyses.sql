-- Nerologik — AI Business Analyser
-- Table: business_analyses
--
-- Rows are written ONLY by server code (secret key) after validation, rate
-- limiting and the AI analysis, because the report must not be forgeable by
-- the public. Admins read and manage them from /admin.
--
-- Run once in the Supabase SQL editor after the initial schema.

create table public.business_analyses (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Contact
  contact_name        text not null check (char_length(contact_name) between 2 and 120),
  email               text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone               text check (char_length(phone) <= 40),

  -- Business profile (denormalised for filtering in the admin)
  business_name       text not null check (char_length(business_name) between 1 and 160),
  industry            text not null check (char_length(industry) <= 80),
  city                text not null check (char_length(city) <= 120),
  country             text not null check (char_length(country) <= 80),
  monthly_customers   text not null check (char_length(monthly_customers) <= 40),
  walk_in_pct         smallint not null check (walk_in_pct between 0 and 100),
  budget              text not null check (char_length(budget) <= 40),

  -- Every answer from the form, as submitted (validated server-side)
  answers             jsonb not null,

  -- The generated report
  report              jsonb not null,
  engine              text not null check (engine in ('ai', 'rules')),
  model               text,
  recommended_service text not null,
  currency            text not null check (currency in ('GHS', 'USD')),
  estimate_min        integer not null check (estimate_min >= 0),
  estimate_max        integer not null check (estimate_max >= estimate_min),
  monthly_min         integer not null default 0 check (monthly_min >= 0),
  monthly_max         integer not null default 0 check (monthly_max >= monthly_min),

  -- Email delivery
  email_sent_at       timestamptz,
  email_error         text,

  -- Pipeline
  status              text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'won', 'lost', 'spam')),
  notes               text
);

create index business_analyses_created_at_idx on public.business_analyses (created_at desc);
create index business_analyses_status_idx on public.business_analyses (status);
create index business_analyses_email_idx on public.business_analyses (lower(email));

create trigger business_analyses_set_updated_at
  before update on public.business_analyses
  for each row execute function public.set_updated_at();

alter table public.business_analyses enable row level security;

-- The public has no direct access at all; the server inserts with the secret key.
revoke all on public.business_analyses from anon;
revoke insert on public.business_analyses from authenticated;
grant select, update, delete on public.business_analyses to authenticated; -- gated by admin policies

create policy "Admins can read analyses"
  on public.business_analyses for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can update analyses"
  on public.business_analyses for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete analyses"
  on public.business_analyses for delete
  to authenticated
  using ((select public.is_admin()));
