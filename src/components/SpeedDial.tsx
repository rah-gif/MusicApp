"use client";

import Image from 'next/image';
import { Play, Heart } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Song } from '@/lib/data';
import { useRouter } from 'next/navigation';

interface SpeedDialProps {
    playlists: any[];
    songs: any[];
    user: any;
    likedSongsCount: number;
}

export function SpeedDial({ playlists, songs, user, likedSongsCount }: SpeedDialProps) {
    const { playSong } = usePlayer();
    const router = useRouter();

    // Combine items: Liked Songs Card + Playlists + Recent Songs
    // We want a mix to make it look interesting.
    
    return (
        <div className="flex flex-nowrap overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 -mx-4 px-4 md:mx-0 md:px-0 pb-4 scrollbar-hide snap-x snap-mandatory">
            {/* 1. Liked Songs Card (Special) */}
            <div 
                className="group flex bg-[#2a2a2a] hover:bg-[#3f3f3f] rounded-[4px] overflow-hidden cursor-pointer transition-colors relative h-20 min-w-[280px] md:min-w-0 md:w-auto shrink-0 snap-center"
                onClick={() => router.push('/liked')}
            >
                <div className="relative w-20 h-20 flex-shrink-0 bg-gradient-to-br from-indigo-700 to-purple-800 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white fill-white" />
                </div>
                <div className="flex flex-col justify-center px-4 flex-1 min-w-0">
                    <span className="text-white font-bold text-base truncate">Liked Songs</span>
                    <span className="text-gray-400 text-sm truncate">{likedSongsCount} liked songs</span>
                </div>
            </div>

            {/* 2. User Playlists */}
            {playlists.slice(0, 3).map((playlist) => (
                <div 
                    key={playlist.id} 
                    className="group flex bg-[#2a2a2a] hover:bg-[#3f3f3f] rounded-[4px] overflow-hidden cursor-pointer transition-colors relative h-20 min-w-[280px] md:min-w-0 md:w-auto shrink-0 snap-center"
                    onClick={() => router.push(`/playlist/${playlist.id}`)}
                >
                    <div className="relative w-20 h-20 flex-shrink-0 bg-zinc-800 flex items-center justify-center">
                        {playlist.cover_url ? (
                            <Image src={playlist.cover_url} alt={playlist.title} fill className="object-cover" />
                        ) : (
                            <span className="text-xl font-bold text-gray-500">{playlist.title.charAt(0)}</span>
                        )}
                    </div>
                    <div className="flex items-center px-4 flex-1 min-w-0">
                        <span className="text-white font-bold text-base truncate">{playlist.title}</span>
                    </div>
                </div>
            ))}

            {/* 3. Recent Songs (Quick Picks) */}
            {songs.slice(0, 4).map((song) => (
                 <div 
                    key={song.id} 
                    className="group flex bg-[#2a2a2a] hover:bg-[#3f3f3f] rounded-[4px] overflow-hidden cursor-pointer transition-colors relative h-20 min-w-[280px] md:min-w-0 md:w-auto shrink-0 snap-center"
                    onClick={() => playSong(song)}
                >
                    <div className="relative w-20 h-20 flex-shrink-0">
                         {song.cover ? (
                            <Image src={song.cover} alt={song.title} fill className="object-cover" />
                         ) : (
                             <div className="w-full h-full bg-zinc-800" />
                         )}
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Play className="fill-white text-white w-8 h-8" />
                         </div>
                    </div>
                    <div className="flex flex-col justify-center px-4 flex-1 min-w-0">
                        <span className="text-white font-bold text-base truncate">{song.title}</span>
                        <span className="text-gray-400 text-sm truncate">{song.artist}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
