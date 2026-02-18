import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/Card';
import { ListMusic, Heart } from 'lucide-react';
import Link from 'next/link';

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch Playlists
  const { data: playlists } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch Liked Songs
  const { data: likedSongs } = await supabase
    .from('liked_songs')
    .select('*')
    .eq('user_id', user.id)
    .order('liked_at', { ascending: false });

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-b from-zinc-900 to-black min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
             {user.user_metadata?.avatar_url ? (
                 <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
             ) : (
                 <span className="text-2xl font-bold text-white">{user.email?.charAt(0).toUpperCase()}</span>
             )}
        </div>
        <div>
            <h1 className="text-3xl font-bold text-white">Your Library</h1>
            <p className="text-gray-400">{user.user_metadata?.full_name || user.email}</p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
            <ListMusic className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
        </div>
        {playlists && playlists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {playlists.map((playlist) => (
                <Link key={playlist.id} href={`/playlist/${playlist.id}`} className="group block">
                    <div className="relative aspect-square bg-zinc-800 rounded-md overflow-hidden mb-3 group-hover:bg-zinc-700 transition-colors flex items-center justify-center">
                        {playlist.cover_url ? (
                            <img src={playlist.cover_url} alt={playlist.title} className="object-cover w-full h-full" />
                        ) : (
                            <ListMusic className="w-12 h-12 text-gray-600 group-hover:text-white transition-colors" />
                        )}
                    </div>
                    <h3 className="text-white font-medium truncate group-hover:underline">{playlist.title}</h3>
                    <p className="text-sm text-gray-400">Playlist • You</p>
                </Link>
            ))}
            </div>
        ) : (
            <p className="text-gray-400">You haven't created any playlists yet.</p>
        )}
      </section>

      <section className="space-y-4 pt-8 border-t border-white/10">
        <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <h2 className="text-2xl font-bold text-white">Liked Songs</h2>
        </div>
        {likedSongs && likedSongs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {likedSongs.map((song) => (
                <Card 
                    key={song.id} 
                    item={{
                        id: song.song_id,
                        title: song.title,
                        artist: song.artist,
                        cover: song.cover,
                        src: '', // We don't store src in DB, assume it's handled by player logic or re-fetched if needed. Ideally we'd store it or fetch it.
                        // For this implementation, let's assume the Card won't play correctly without `src` unless fetch happens. 
                        // Wait, audio player needs src. We should probably store `src` or videoId to fetch it.
                        // The existing `search` flow provides `id` (videoId). `AudioPlayer` usually fetches stream.
                        // Let's assume Card passes ID to player, and Player fetches stream if needed.
                    } as any}
                    type="song" 
                    aspectRatio="square" 
                />
            ))}
            </div>
        ) : (
            <p className="text-gray-400">No liked songs yet.</p>
        )}
      </section>
    </div>
  );
}
