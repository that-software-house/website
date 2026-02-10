create table if not exists public.api_daily_usage (
  identifier text not null,
  usage_date date not null,
  request_count integer not null default 0 check (request_count >= 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  primary key (identifier, usage_date)
);

create index if not exists api_daily_usage_date_idx
  on public.api_daily_usage (usage_date);

create or replace function public.touch_api_daily_usage_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_api_daily_usage_updated_at on public.api_daily_usage;

create trigger trg_api_daily_usage_updated_at
before update on public.api_daily_usage
for each row
execute function public.touch_api_daily_usage_updated_at();

create or replace function public.increment_api_daily_usage(
  p_identifier text,
  p_usage_date date,
  p_increment integer default 1
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count integer;
begin
  if p_identifier is null or length(trim(p_identifier)) = 0 then
    raise exception 'p_identifier is required';
  end if;

  if p_usage_date is null then
    raise exception 'p_usage_date is required';
  end if;

  if p_increment is null or p_increment < 0 then
    raise exception 'p_increment must be >= 0';
  end if;

  insert into public.api_daily_usage (identifier, usage_date, request_count)
  values (p_identifier, p_usage_date, p_increment)
  on conflict (identifier, usage_date)
  do update
    set request_count = public.api_daily_usage.request_count + excluded.request_count,
        updated_at = timezone('utc'::text, now())
  returning request_count into next_count;

  return next_count;
end;
$$;

alter table public.api_daily_usage enable row level security;

revoke all on table public.api_daily_usage from public, anon, authenticated;
grant select, insert, update on table public.api_daily_usage to service_role;

revoke all on function public.increment_api_daily_usage(text, date, integer) from public, anon, authenticated;
grant execute on function public.increment_api_daily_usage(text, date, integer) to service_role;
