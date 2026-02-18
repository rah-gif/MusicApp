import { Header } from '@/components/Header';
import { SpeedDial } from '@/components/SpeedDial';
import { Card } from '@/components/Card';
import { CategoryPills } from '@/components/CategoryPills';
import { SearchResults } from '@/components/SearchResults';
import { playlists, songs } from '@/lib/data';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';

import { searchYouTubeServer } from '@/lib/youtube-server';

interface HomeProps {
  searchParams: Promise<{ q?: string; cat?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = params.q;
  const category = params.cat;
  
  const supabase = await createClient(); // Use server client
  
  // Auth check
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch(e) {
      console.error("Auth error:", e);
  }

  // Fetch Playlists
  let userPlaylists: any[] = [];
  let likedSongsCount = 0;

  if (user) {
      const { data: playlists } = await supabase
          .from('playlists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
      userPlaylists = playlists || [];

      const { count } = await supabase
          .from('liked_songs')
          .select('*', { count: 'estimated', head: true })
          .eq('user_id', user.id);
      likedSongsCount = count || 0;
  }

  // "Recent" songs
  const quickPicks = [...songs].sort(() => 0.5 - Math.random()).slice(0, 6);

  // Determine content based on Category
  let sectionSongs = songs;
  let sectionTitle = "Start radio from a song";

  if (category) {
      // 20 results for a fuller list
      const fetchedSongs = await searchYouTubeServer(`${category} music`, 20);
      if (fetchedSongs.length > 0) {
          sectionSongs = fetchedSongs;
          sectionTitle = `Stations for ${category}`;
      }
  }

  // If no user, we can still show some generic playlists or nothing specific
  const displayName = user?.user_metadata?.full_name || user?.email || 'Guest';

  return (
    <div className="bg-zinc-950 min-h-screen">
      <Header />
      
      <div className="pt-20 p-4 md:p-8 space-y-8 max-w-screen-xl mx-auto w-full">
         <CategoryPills />

      {query ? (
        <SearchResults query={query} />
      ) : (
        <>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden relative bg-zinc-800 flex items-center justify-center">
                        {user?.user_metadata?.avatar_url ? (
                             <Image src={user.user_metadata.avatar_url} alt="User" fill className="object-cover" />
                        ) : (
                             <span className="text-xs text-white">{displayName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{displayName}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Speed dial</h1>
                <SpeedDial 
                    playlists={userPlaylists} 
                    songs={quickPicks} 
                    user={user}
                    likedSongsCount={likedSongsCount}
                />
            </div>

            <section className="space-y-4 pt-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold capitalize">{sectionTitle}</h2>
                    <button className="text-gray-400 hover:text-white text-xs font-bold border border-gray-600 rounded-full px-3 py-1 uppercase hover:border-white transition">More</button>
                </div>
                
                <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory">
                {sectionSongs.map((song) => (
                    <div key={song.id} className="snap-center">
                        <Card item={song} type="song" aspectRatio="square" className="w-[160px] md:w-[200px]" />
                    </div>
                ))}
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Recommended albums</h2>
                    <button className="text-gray-400 hover:text-white text-xs font-bold border border-gray-600 rounded-full px-3 py-1 uppercase hover:border-white transition">More</button>
                </div>
                <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory">
                {playlists.map((playlist) => (
                    <div key={playlist.id} className="snap-center">
                        <Card item={playlist} type="playlist" aspectRatio="square" className="w-[160px] md:w-[200px]" />
                    </div>
                ))}
                </div>
            </section>
        </>
      )}
      </div>
    </div>
  );
}
