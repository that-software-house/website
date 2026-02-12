create table if not exists public.spotify_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  spotify_user_id text,
  display_name text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create or replace function public.touch_spotify_connections_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_spotify_connections_updated_at on public.spotify_connections;

create trigger trg_spotify_connections_updated_at
before update on public.spotify_connections
for each row
execute function public.touch_spotify_connections_updated_at();

alter table public.spotify_connections enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'spotify_connections'
      and policyname = 'spotify_connections_select_own'
  ) then
    create policy spotify_connections_select_own
      on public.spotify_connections
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'spotify_connections'
      and policyname = 'spotify_connections_insert_own'
  ) then
    create policy spotify_connections_insert_own
      on public.spotify_connections
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'spotify_connections'
      and policyname = 'spotify_connections_update_own'
  ) then
    create policy spotify_connections_update_own
      on public.spotify_connections
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'spotify_connections'
      and policyname = 'spotify_connections_delete_own'
  ) then
    create policy spotify_connections_delete_own
      on public.spotify_connections
      for delete
      using (auth.uid() = user_id);
  end if;
end
$$;

grant select, insert, update, delete on table public.spotify_connections to authenticated;
