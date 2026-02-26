create table if not exists public.cost_estimator_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  industry text,
  site_size text,
  features jsonb not null default '[]'::jsonb,
  extras jsonb not null default '{}'::jsonb,
  estimate_low integer,
  estimate_high integer,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists cost_estimator_leads_created_at_idx
  on public.cost_estimator_leads (created_at desc);

create index if not exists cost_estimator_leads_email_idx
  on public.cost_estimator_leads (email);

alter table public.cost_estimator_leads enable row level security;

revoke all on table public.cost_estimator_leads from public, anon, authenticated;
grant select, insert on table public.cost_estimator_leads to service_role;
