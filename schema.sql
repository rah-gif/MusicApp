-- Music App Database Schema

-- 1. Profiles Table (Private User Data)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Playlists Table
create table public.playlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  cover_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Liked Songs Table
create table public.liked_songs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  song_id text not null, -- External ID (YouTube/Spotify)
  title text not null,
  artist text not null,
  cover text not null,
  duration integer,
  liked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, song_id)
);

-- 4. Playlist Songs Table
create table public.playlist_songs (
  id uuid default gen_random_uuid() primary key,
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  song_id text not null,
  title text not null,
  artist text not null,
  cover text not null,
  duration integer,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.playlists enable row level security;
alter table public.liked_songs enable row level security;
alter table public.playlist_songs enable row level security;

-- 6. RLS Policies

-- Profiles
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);

create policy "Users can insert their own profile" 
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update using (auth.uid() = id);

-- Playlists
create policy "Playlists are viewable by everyone" 
  on public.playlists for select using (true);

create policy "Users can insert their own playlists" 
  on public.playlists for insert with check (auth.uid() = user_id);

create policy "Users can update their own playlists" 
  on public.playlists for update using (auth.uid() = user_id);

create policy "Users can delete their own playlists" 
  on public.playlists for delete using (auth.uid() = user_id);

-- Liked Songs
create policy "Users can view their own liked songs" 
  on public.liked_songs for select using (auth.uid() = user_id);

create policy "Users can insert their own liked songs" 
  on public.liked_songs for insert with check (auth.uid() = user_id);

create policy "Users can delete their own liked songs" 
  on public.liked_songs for delete using (auth.uid() = user_id);

-- Playlist Songs
create policy "Playlist songs are viewable by everyone" 
  on public.playlist_songs for select using (true);

create policy "Users can add songs to their playlists" 
  on public.playlist_songs for insert 
  with check (
    exists (
      select 1 from public.playlists 
      where id = playlist_id and user_id = auth.uid()
    )
  );

create policy "Users can remove songs from their playlists" 
  on public.playlist_songs for delete 
  using (
    exists (
      select 1 from public.playlists 
      where id = playlist_id and user_id = auth.uid()
    )
  );

-- 7. Triggers for User Management
-- Auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
