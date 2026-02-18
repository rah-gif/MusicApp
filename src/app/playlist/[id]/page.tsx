import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { PlaylistClient } from '@/components/PlaylistClient';

interface PlaylistPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaylistPage(props: PlaylistPageProps) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Try to get user from session if getUser fails (optional fallback logic)
  let tryUser = user;
  if (!tryUser) {
      const { data: { session } } = await supabase.auth.getSession();
      tryUser = session?.user || null;
  }

  if (!tryUser) {
    redirect('/login');
  }

  if (!user) {
    redirect('/login');
  }

  // Fetch Playlist Details
  const { data: playlist, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !playlist) {
    notFound();
  }

  // Fetch Playlist Songs
  const { data: playlistSongs } = await supabase
    .from('playlist_songs')
    .select('*')
    .eq('playlist_id', playlist.id)
    .order('added_at', { ascending: true });

  return (
    <PlaylistClient playlist={playlist} songs={playlistSongs || []} user={tryUser || user} />
  );
}
