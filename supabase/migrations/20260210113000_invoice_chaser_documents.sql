create table if not exists public.invoice_chaser_documents (
  queue_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  source_file_name text not null default 'invoice-export',
  status text not null default 'pending' check (status in ('pending', 'paid')),
  summary jsonb not null default '{}'::jsonb,
  invoices jsonb not null default '[]'::jsonb,
  prioritized_invoices jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  last_prioritized_at timestamptz
);

create index if not exists invoice_chaser_documents_user_updated_idx
  on public.invoice_chaser_documents (user_id, updated_at desc);

create index if not exists invoice_chaser_documents_user_status_idx
  on public.invoice_chaser_documents (user_id, status);

create or replace function public.touch_invoice_chaser_documents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_invoice_chaser_documents_updated_at on public.invoice_chaser_documents;

create trigger trg_invoice_chaser_documents_updated_at
before update on public.invoice_chaser_documents
for each row
execute function public.touch_invoice_chaser_documents_updated_at();

alter table public.invoice_chaser_documents enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invoice_chaser_documents'
      and policyname = 'invoice_chaser_documents_select_own'
  ) then
    create policy invoice_chaser_documents_select_own
      on public.invoice_chaser_documents
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invoice_chaser_documents'
      and policyname = 'invoice_chaser_documents_insert_own'
  ) then
    create policy invoice_chaser_documents_insert_own
      on public.invoice_chaser_documents
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invoice_chaser_documents'
      and policyname = 'invoice_chaser_documents_update_own'
  ) then
    create policy invoice_chaser_documents_update_own
      on public.invoice_chaser_documents
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'invoice_chaser_documents'
      and policyname = 'invoice_chaser_documents_delete_own'
  ) then
    create policy invoice_chaser_documents_delete_own
      on public.invoice_chaser_documents
      for delete
      using (auth.uid() = user_id);
  end if;
end
$$;

grant select, insert, update, delete on table public.invoice_chaser_documents to authenticated;
