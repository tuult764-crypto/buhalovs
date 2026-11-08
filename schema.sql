-- БУХАЛ ӨВС: Supabase SQL Editor дээр бүхэлд нь ажиллуулна.
-- Хэрэглэгчийн хувийн тэмдэглэл зөвхөн тухайн хэрэглэгчид харагдана.

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phase smallint not null check (phase between 1 and 5),
  content text not null check (char_length(content) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_entries_user_phase_idx
  on public.journal_entries(user_id, phase, created_at);

alter table public.journal_entries enable row level security;

drop policy if exists "Users can read own journal entries" on public.journal_entries;
create policy "Users can read own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own journal entries" on public.journal_entries;
create policy "Users can insert own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own journal entries" on public.journal_entries;
create policy "Users can update own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own journal entries" on public.journal_entries;
create policy "Users can delete own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- Бүртгэл үүсэх үед тэмдэглэлийн user_id автоматаар auth.uid()-аас авна.
create or replace function public.set_journal_user_id()
returns trigger language plpgsql security invoker as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists journal_entries_set_user_id on public.journal_entries;
create trigger journal_entries_set_user_id
before insert on public.journal_entries
for each row execute function public.set_journal_user_id();