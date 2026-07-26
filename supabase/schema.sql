-- LeadDesk Mini — schema + Row Level Security policies
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

create type lead_status as enum ('new', 'contacted', 'closed');

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  company text,
  message text not null,
  status lead_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- Keep updated_at current on every write.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row
  execute function public.set_updated_at();

-- Row Level Security ------------------------------------------------------
-- Public visitors may only INSERT (submit a lead). They cannot read,
-- update, or delete rows — that's reserved for authenticated admins.
-- Authenticated users (the admin team) can read and update every row.

alter table public.leads enable row level security;

create policy "Anyone can submit a lead"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated users can view leads"
  on public.leads
  for select
  to authenticated
  using (true);

create policy "Authenticated users can update leads"
  on public.leads
  for update
  to authenticated
  using (true)
  with check (true);

-- No delete policy is defined on purpose: leads are never removed via the
-- app, only re-statused, so deletes stay locked down by default.
