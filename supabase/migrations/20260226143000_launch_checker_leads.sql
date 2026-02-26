create table if not exists public.launch_checker_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  track text,
  answers jsonb not null default '{}'::jsonb,
  overall_score integer,
  category_scores jsonb not null default '[]'::jsonb,
  top_gaps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists launch_checker_leads_created_at_idx
  on public.launch_checker_leads (created_at desc);

create index if not exists launch_checker_leads_email_idx
  on public.launch_checker_leads (email);

alter table public.launch_checker_leads enable row level security;

revoke all on table public.launch_checker_leads from public, anon, authenticated;
grant select, insert on table public.launch_checker_leads to service_role;
