ha-- Create a table for folders
create table if not exists folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for channels within folders
create table if not exists channels (
  id uuid default gen_random_uuid() primary key,
  folder_id uuid references folders on delete cascade not null,
  name text not null, -- e.g. '@verge'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(folder_id, name)
);

-- Create a table for storing analysis/summaries (optional, for caching)
create table if not exists channel_summaries (
  id uuid default gen_random_uuid() primary key,
  channel_name text not null,
  summary_json jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table folders enable row level security;
alter table channels enable row level security;
alter table channel_summaries enable row level security;

-- Create policies
create policy "Users can view their own folders"
  on folders for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own folders"
  on folders for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own folders"
  on folders for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own folders"
  on folders for delete
  using ( auth.uid() = user_id );

create policy "Users can view channels in their folders"
  on channels for select
  using ( exists ( select 1 from folders where id = channels.folder_id and user_id = auth.uid() ) );

create policy "Users can insert channels in their folders"
  on channels for insert
  with check ( exists ( select 1 from folders where id = channels.folder_id and user_id = auth.uid() ) );

create policy "Users can delete channels in their folders"
  on channels for delete
  using ( exists ( select 1 from folders where id = channels.folder_id and user_id = auth.uid() ) );

-- Summaries are public for now or could be restricted. Let's make them readable by authenticated users.
create policy "Authenticated users can view summaries"
  on channel_summaries for select
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can insert summaries"
  on channel_summaries for insert
  with check ( auth.role() = 'authenticated' );
