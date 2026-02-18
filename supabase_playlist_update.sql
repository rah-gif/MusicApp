-- Add description column to playlists
alter table public.playlists 
add column if not exists description text;

-- Create storage bucket for covers
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'covers' );

create policy "Authenticated users can upload covers"
  on storage.objects for insert
  with check ( bucket_id = 'covers' and auth.role() = 'authenticated' );

create policy "Users can update their own covers"
  on storage.objects for update
  using ( bucket_id = 'covers' and auth.uid() = owner );
