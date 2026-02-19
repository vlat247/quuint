-- 1. Users (Public profile / syncing)
-- Matches: id, email, role, created_at, username, auth_id
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text default 'user',
  created_at timestamp without time zone default now(),
  username text,
  auth_id uuid references auth.users
);

-- 2. Folders
-- Matches: id, name, email, created_at, user_id, icon
create table if not exists public.folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade, -- referencing public.users instead of auth.users directly if possible, or auth.users if preferred. schema says user_id exists.
  name text not null,
  email text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Folder Channels
-- Matches: id, folder_id, channel, created_at
create table if not exists public.folder_channels (
  id uuid default gen_random_uuid() primary key,
  folder_id uuid references public.folders(id) on delete cascade,
  channel text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Summaries (Analysis results)
-- Matches: id, user_id, channel, summary, created_at, email
create table if not exists public.summaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete set null,
  channel text not null,
  summary jsonb not null,
  email text,
  created_at timestamp without time zone default now()
);

-- 5. Digests
-- Matches: id, folder_id, summary, created_at
create table if not exists public.digests (
  id uuid default gen_random_uuid() primary key,
  folder_id uuid references public.folders(id) on delete set null,
  summary jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Early Access Emails
-- Matches: id, email, source, verified, created_at
create table if not exists public.early_access_emails (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  source text,
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);


-- Row Level Security (RLS) Policies
alter table public.users enable row level security;
alter table public.folders enable row level security;
alter table public.folder_channels enable row level security;
alter table public.summaries enable row level security;
alter table public.digests enable row level security;
alter table public.early_access_emails enable row level security;

-- Policies

-- Users
create policy "Users can view their own profile"
  on public.users for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.users for update
  using ( auth.uid() = id );

-- Folders
create policy "Users can view their own folders"
  on public.folders for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own folders"
  on public.folders for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own folders"
  on public.folders for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own folders"
  on public.folders for delete
  using ( auth.uid() = user_id );

-- Folder Channels
create policy "Users can view channels in their folders"
  on public.folder_channels for select
  using ( exists ( select 1 from public.folders where id = folder_channels.folder_id and user_id = auth.uid() ) );

create policy "Users can insert channels in their folders"
  on public.folder_channels for insert
  with check ( exists ( select 1 from public.folders where id = folder_channels.folder_id and user_id = auth.uid() ) );

create policy "Users can delete channels in their folders"
  on public.folder_channels for delete
  using ( exists ( select 1 from public.folders where id = folder_channels.folder_id and user_id = auth.uid() ) );

-- Summaries
create policy "Users can view their own summaries"
  on public.summaries for select
  using ( auth.uid() = user_id );
  
create policy "Users can insert summaries"
  on public.summaries for insert
  with check ( auth.uid() = user_id );

-- Digests
create policy "Users can view their own digests"
  on public.digests for select
  using ( exists ( select 1 from public.folders where id = digests.folder_id and user_id = auth.uid() ) );


-- User Sync Trigger (CRITICAL FIX)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, auth_id, role, created_at, username)
  values (
    new.id,
    new.email,
    new.id,
    'user',
    new.created_at,
    new.raw_user_meta_data->>'display_name'
  )
  on conflict (id) do nothing; -- idempotency: don't fail if user exists
  return new;
end;
$$ language plpgsql security definer;

-- Recreate Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
