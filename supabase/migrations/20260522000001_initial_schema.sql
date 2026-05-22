-- ===== TABELLEN =====

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table public.ideas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'open' check (status in ('open', 'planned', 'in_progress', 'done', 'rejected')),
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.votes (
  id uuid default gen_random_uuid() primary key,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(idea_id, user_id)
);

create table public.comments (
  id uuid default gen_random_uuid() primary key,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

-- ===== INDIZES =====

create index ideas_author_id_idx on public.ideas(author_id);
create index ideas_status_idx on public.ideas(status);
create index ideas_created_at_idx on public.ideas(created_at desc);
create index votes_idea_id_idx on public.votes(idea_id);
create index votes_user_id_idx on public.votes(user_id);
create index comments_idea_id_idx on public.comments(idea_id);
create index comments_author_id_idx on public.comments(author_id);

-- ===== RLS AKTIVIEREN =====

alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;

-- ===== RLS POLICIES: profiles =====

create policy "Eigenes Profil lesen"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Eigenes Profil aktualisieren"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ===== RLS POLICIES: ideas =====

create policy "Ideen lesen"
  on public.ideas for select
  to authenticated
  using (true);

create policy "Idee einreichen"
  on public.ideas for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Idee bearbeiten (Autor oder Admin)"
  on public.ideas for update
  to authenticated
  using (
    (select auth.uid()) = author_id or
    exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true)
  )
  with check (
    (select auth.uid()) = author_id or
    exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true)
  );

create policy "Idee loeschen (Admin)"
  on public.ideas for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true)
  );

-- ===== RLS POLICIES: votes =====

create policy "Votes lesen"
  on public.votes for select
  to authenticated
  using (true);

create policy "Abstimmen"
  on public.votes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Eigene Stimme loeschen"
  on public.votes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ===== RLS POLICIES: comments =====

create policy "Kommentare lesen"
  on public.comments for select
  to authenticated
  using (true);

create policy "Kommentar schreiben"
  on public.comments for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Eigenen Kommentar bearbeiten"
  on public.comments for update
  to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

create policy "Kommentar loeschen (Autor oder Admin)"
  on public.comments for delete
  to authenticated
  using (
    (select auth.uid()) = author_id or
    exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true)
  );

-- ===== TRIGGER: updated_at fuer ideas =====

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ideas_updated_at
  before update on public.ideas
  for each row execute function public.set_updated_at();

-- ===== TRIGGER: Profil automatisch erstellen =====

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
