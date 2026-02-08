'use client';

import { Play, Clock, Pause, Trash2, Heart, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { Song } from '@/lib/data';
import { usePlayer } from '@/contexts/PlayerContext';
import { formatDuration } from '@/utils/format';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface LikedSong extends Song {
    song_id: string;
    added_at: string;
}

interface LikedSongsClientProps {
  songs: any[]; // Receiving raw DB response which has song_id
  user: any;
}

export function LikedSongsClient({ songs: initialSongs, user }: LikedSongsClientProps) {
  const { playCollection, currentSong, isPlaying, togglePlay } = usePlayer();
  // Cast initial songs to LikedSong[] for better type safety locally
  const [songs, setSongs] = useState<LikedSong[]>(initialSongs as LikedSong[]);
  const supabase = createClient();
  const router = useRouter();

  // Transform db songs to app Song type for playback
  // DB structure: { id, song_id, title, ... }
  const appSongs: Song[] = songs.map(s => ({
    id: s.song_id, // Use actual song_id for playback
    title: s.title,
    artist: s.artist,
    album: s.album || 'Liked Songs',
    cover: s.cover,
    duration: s.duration,
  }));

  const handlePlayAll = () => {
    if (appSongs.length > 0) {
      playCollection(appSongs, 0);
    }
  };

  const handlePlaySong = (index: number) => {
    // Check if currently playing this exact song from the playing context
    if (appSongs[index].id === currentSong?.id) {
        togglePlay();
        return;
    }
    playCollection(appSongs, index);
  };

  const handleRemove = async (e: React.MouseEvent, dbId: string) => {
      e.stopPropagation();
      
      // Optimistic update
      const songToRemove = songs.find(s => s.id === dbId);
      if (!songToRemove) return;

      setSongs(prev => prev.filter(s => s.id !== dbId));
      
      const { error } = await supabase
        .from('liked_songs')
        .delete()
        .eq('id', dbId);

      if (error) {
          console.error("Failed to remove like:", error);
          setSongs(prev => [...prev, songToRemove]); // Revert
          alert('Failed to remove song');
      } else {
          router.refresh();
      }
  };

  return (
      <div className="bg-gradient-to-b from-purple-900 to-black min-h-screen pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 p-8 bg-gradient-to-b from-purple-800/50 to-purple-900/0 relative">
          
          {/* Mobile Back Button */}
          <button 
             onClick={() => router.back()} 
             className="md:hidden absolute top-4 left-4 z-30 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 backdrop-blur-md"
          >
               <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="w-52 h-52 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl shadow-black/50 rounded-lg flex items-center justify-center relative overflow-hidden shrink-0 group">
              <Heart className="w-20 h-20 text-white fill-white shadow-lg" />
          </div>

          <div className="flex flex-col gap-3 flex-1 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-white">Playlist</span>
            <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tight">Liked Music</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-300 font-medium">
                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
                    {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xs">{user.email?.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <span className="text-white hover:underline cursor-pointer">{user.user_metadata?.full_name || 'User'}</span>
                <span>•</span>
                <span>{songs.length} songs</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 px-8 py-4">
            <button 
                onClick={handlePlayAll}
                className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg translate-y-0 hover:brightness-105"
            >
                {isPlaying && currentSong && appSongs.some(s => s.id === currentSong.id) ? (
                    <Pause className="fill-black text-black ml-1 w-7 h-7" />
                ) : (
                    <Play className="fill-black text-black ml-1 w-7 h-7" />
                )}
            </button>
        </div>

        {/* Songs List */}
        <div className="px-8 flex flex-col">
            <div className="grid grid-cols-[16px_minmax(0,1fr)_80px] md:grid-cols-[16px_minmax(0,1fr)_minmax(0,1fr)_120px] gap-4 text-sm text-gray-400 border-b border-white/10 pb-2 mb-4 px-4 sticky top-16 bg-black z-10 uppercase tracking-wider font-medium">
                <span>#</span>
                <span>Title</span>
                <span className="hidden md:block">Album</span>
                <span className="text-right flex justify-end"><Clock className="w-4 h-4" /></span>
            </div>

            {!songs || songs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
                    <p>Songs you like will appear here</p>
                    <p className="text-sm">Save songs by tapping the heart icon.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {songs.map((song, index) => {
                        // Song.id is the UUID of the liked_songs row
                        // Song.song_id is the YouTube ID of the song
                        const isCurrent = currentSong?.id === song.song_id;
                        return (
                            <div 
                                key={song.id} 
                                onClick={() => handlePlaySong(index)}
                                className={`grid grid-cols-[16px_minmax(0,1fr)_80px] md:grid-cols-[16px_minmax(0,1fr)_minmax(0,1fr)_120px] gap-4 items-center px-4 py-2 rounded-md group transition-colors cursor-pointer text-sm ${isCurrent ? 'bg-white/10 text-green-500' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                            >
                                <span className="group-hover:hidden text-gray-400 flex justify-center">
                                    {isCurrent && isPlaying ? (
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                    ) : (
                                        index + 1
                                    )}
                                </span>
                                <span className="hidden group-hover:block text-white">
                                    {isCurrent && isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                                </span>
                                
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 bg-zinc-800 flex-shrink-0 relative rounded overflow-hidden">
                                        {song.cover && <Image src={song.cover} alt={song.title} fill className="object-cover" />}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`font-medium truncate ${isCurrent ? 'text-green-500' : 'text-white'}`}>{song.title}</span>
                                        <span className={`text-xs truncate ${isCurrent ? 'text-green-400' : 'group-hover:text-white'}`}>{song.artist}</span>
                                    </div>
                                </div>

                                <span className="hidden md:block truncate">Liked Song</span>
                                
                                <div className="flex items-center justify-end gap-2 md:gap-4 relative">
                                    <button 
                                        onClick={(e) => handleRemove(e, song.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500"
                                        title="Remove from Liked Songs"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    
                                    <span className="font-variant-numeric tabular-nums w-[40px] text-right">
                                        {song.duration ? formatDuration(typeof song.duration === 'string' ? 0 : song.duration) : '--:--'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
  );
}
