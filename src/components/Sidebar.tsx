import { Home, Compass, Library, CircleArrowUp, ListMusic, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import { CreatePlaylistButton } from './CreatePlaylistButton';

export async function Sidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let playlists: any[] = [];
  if (user) {
    const { data } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    playlists = data || [];
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-80px)] bg-black text-white fixed left-0 top-0 p-4 z-40">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-white"
          >
            <path
              fillRule="evenodd"
              d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight">Music</span>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
        <Link
          href="/"
          className="flex items-center gap-4 px-3 py-3 rounded-lg bg-[#272727] text-white transition hover:bg-[#272727]"
        >
          <Home className="w-6 h-6" />
          <span className="font-medium">Home</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-4 px-3 py-3 rounded-lg text-[#a3a3a3] hover:text-white transition hover:bg-[#1a1a1a]"
        >
          <Compass className="w-6 h-6" />
          <span className="font-medium">Explore</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-4 px-3 py-3 rounded-lg text-[#a3a3a3] hover:text-white transition hover:bg-[#1a1a1a]"
        >
          <Library className="w-6 h-6" />
          <span className="font-medium">Library</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-4 px-3 py-3 rounded-lg text-[#a3a3a3] hover:text-white transition hover:bg-[#1a1a1a]"
        >
          <CircleArrowUp className="w-6 h-6" />
          <span className="font-medium">Upgrade</span>
        </Link>
        
        {/* Liked Songs Link */}
        <Link
            href="/liked"
            className="flex items-center gap-4 px-3 py-3 rounded-lg text-[#a3a3a3] hover:text-white transition hover:bg-[#1a1a1a] mt-4 opacity-100"
        >
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-sm flex items-center justify-center">
                <Heart className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-medium">Liked Songs</span>
        </Link>

        {user && playlists.length > 0 && (
            <div className="pt-6 pb-2">
                <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Your Playlists
                </div>
                {playlists.map((playlist) => (
                    <Link
                        key={playlist.id}
                        href={`/playlist/${playlist.id}`}
                        className="flex items-center gap-4 px-3 py-2 rounded-lg text-[#a3a3a3] hover:text-white transition hover:bg-[#1a1a1a] group"
                    >
                        <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center text-xs text-gray-500 group-hover:text-white overflow-hidden relative shrink-0">
                            {playlist.cover_url ? (
                                <Image src={playlist.cover_url} alt={playlist.title} fill className="object-cover" />
                            ) : (
                                <ListMusic className="w-4 h-4" />
                            )}
                        </div>
                        <span className="font-medium text-sm truncate">{playlist.title}</span>
                    </Link>
                ))}
            </div>
        )}
      </nav>
      
      <CreatePlaylistButton />
    </aside>
  );
}
