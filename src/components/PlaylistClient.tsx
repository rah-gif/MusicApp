'use client';

import { useState, useRef } from 'react';
import { Play, Clock, Trash2, ListMusic, Pencil, Upload, Pause, X, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { usePlayer } from '@/contexts/PlayerContext';
import { Song } from '@/lib/data';
import { formatDuration } from '@/utils/format';
import { updatePlaylist, deletePlaylist } from '@/actions/playlist';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface PlaylistClientProps {
  playlist: any;
  songs: any[];
  user: any;
}

export function PlaylistClient({ playlist, songs, user }: PlaylistClientProps) {
  const { playCollection, currentSong, isPlaying, togglePlay } = usePlayer();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Convert DB songs to App songs
  const appSongs: Song[] = songs.map(s => ({
    id: s.song_id,
    title: s.title,
    artist: s.artist,
    album: 'Playlist',
    cover: s.cover || '',
    duration: formatDuration(s.duration || 0),
  }));

  const handlePlayAll = () => {
    if (appSongs.length > 0) {
       playCollection(appSongs, 0);
    }
  };

  const handlePlaySong = (index: number) => {
    if (currentSong?.id === appSongs[index].id) {
        togglePlay();
        return;
    }
    playCollection(appSongs, index);
  };

  const handleSave = async () => {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      if (fileInputRef.current?.files?.[0]) {
          formData.append('cover', fileInputRef.current.files[0]);
      }

      await updatePlaylist(playlist.id, formData);
      setIsEditing(false);
      setIsSaving(false);
      router.refresh();
  };

  const handleDelete = async () => {
      if (confirm('Are you sure you want to delete this playlist?')) {
          await deletePlaylist(playlist.id);
      }
  };

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-black min-h-screen pb-24">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 p-8 bg-gradient-to-b from-zinc-800/50 to-zinc-900/0 group/header relative">
        
        {/* Mobile Back Button */}
        <button 
            onClick={() => router.back()} 
            className="md:hidden absolute top-4 left-4 z-30 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 backdrop-blur-md"
        >
            <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Editorial Mode Overlay */}
        {isEditing && (
            <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                 <div className="bg-zinc-800 p-6 rounded-xl w-full max-w-md border border-white/10 space-y-4">
                     <h3 className="text-xl font-bold text-white">Edit Playlist</h3>
                     
                     <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase font-bold">Name</label>
                        <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-white/30"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs text-gray-400 uppercase font-bold">Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-white/30 resize-none h-24"
                        />
                     </div>
                     
                     <div className="space-y-2">
                         <label className="text-xs text-gray-400 uppercase font-bold">Cover Image</label>
                         <input 
                            type="file" 
                            ref={fileInputRef}
                            accept="image/*"
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600"
                        />
                     </div>

                     <div className="flex justify-end gap-3 pt-4">
                         <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-white hover:text-gray-300">Cancel</button>
                         <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition disabled:opacity-50">
                             {isSaving ? 'Saving...' : 'Save'}
                         </button>
                     </div>
                 </div>
            </div>
        )}

        <div 
            className="w-52 h-52 bg-zinc-800 shadow-2xl shadow-black/50 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer shrink-0"
            onClick={() => setIsEditing(true)}
        >
            {playlist.cover_url ? (
                <Image src={playlist.cover_url} alt={playlist.title} fill className="object-cover group-hover:opacity-50 transition" />
            ) : (
                <div className="flex flex-col items-center justify-center text-zinc-500 group-hover:opacity-50 transition">
                    <ListMusic className="w-16 h-16 mb-2" />
                    <span className="text-sm">No Cover</span>
                </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <div className="flex flex-col items-center text-white drop-shadow-lg">
                    <Pencil className="w-10 h-10 mb-2" />
                    <span className="text-sm font-bold">Edit</span>
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-3 flex-1 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-white">Playlist</span>
            <h1 
                className="text-4xl md:text-7xl font-bold text-white tracking-tight cursor-pointer hover:underline decoration-white/30"
                onClick={() => setIsEditing(true)}
            >
                {title}
            </h1>
            <p className="text-gray-400 text-sm font-medium line-clamp-2 max-w-2xl">{description || 'No description'}</p>
            
            <div className="flex items-center gap-2 text-sm text-gray-300 font-medium mt-2">
                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
                    {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xs">{user.email?.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <span className="text-white hover:underline cursor-pointer">{user.user_metadata?.full_name || 'User'}</span>
                <span>•</span>
                <span>{songs?.length || 0} songs</span>
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
                  <Pause className="fill-black text-black w-7 h-7" />
              ) : (
                  <Play className="fill-black text-black ml-1 w-7 h-7" />
              )}
          </button>
          
          <div className="flex-1" />

          <button onClick={handleDelete} className="text-gray-400 hover:text-white transition p-2" title="Delete Playlist">
              <Trash2 className="w-6 h-6" />
          </button>
      </div>

      {/* Songs List */}
      <div className="px-8 flex flex-col">
          <div className="grid grid-cols-[16px_minmax(0,1fr)_120px] md:grid-cols-[16px_minmax(0,1fr)_minmax(0,1fr)_120px] gap-4 text-sm text-gray-400 border-b border-white/10 pb-2 mb-4 px-4 sticky top-16 bg-black z-10 uppercase tracking-wider font-medium">
              <span>#</span>
              <span>Title</span>
              <span className="hidden md:block">Album</span>
              <span className="text-right flex justify-end"><Clock className="w-4 h-4" /></span>
          </div>

          {songs?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
                  <p>This playlist is empty</p>
                  <button className="px-6 py-2 rounded-full bg-white text-black font-bold hover:scale-105 transition">
                      Find Songs
                  </button>
              </div>
          ) : (
            <div className="space-y-2">
                {songs.map((song, index) => {
                    const isCurrent = currentSong?.id === song.song_id;
                    return (
                        <div 
                            key={song.id} 
                            onClick={() => handlePlaySong(index)}
                            className={`grid grid-cols-[16px_minmax(0,1fr)_120px] md:grid-cols-[16px_minmax(0,1fr)_minmax(0,1fr)_120px] gap-4 items-center px-4 py-2 rounded-md group transition-colors cursor-pointer text-sm ${isCurrent ? 'bg-white/10 text-green-500' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                        >
                            <span className="group-hover:hidden flex justify-center">{isCurrent && isPlaying ? <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" /> : index + 1}</span>
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

                            <span className="hidden md:block truncate">Unknown Album</span>
                            
                            <span className="text-right font-variant-numeric tabular-nums">
                                {song.duration ? formatDuration(song.duration) : '--:--'}
                            </span>
                        </div>
                    );
                })}
            </div>
          )}
      </div>
    </div>
  );
}
