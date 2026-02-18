'use client';

import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { X, ListMusic, Plus, Loader2 } from 'lucide-react';
import { addToPlaylist } from '@/actions/playlist';
import { Song } from '@/lib/data';

interface AddToPlaylistModalProps {
  song: Song;
  onClose: () => void;
}

export function AddToPlaylistModal({ song, onClose }: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchPlaylists = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('playlists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setPlaylists(data || []);
      }
      setLoading(false);
    };
    fetchPlaylists();
  }, []);

  const handleAdd = async (playlistId: string) => {
    setAddingId(playlistId);
    await addToPlaylist(playlistId, song);
    setAddingId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-zinc-900 w-full max-w-sm rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-bold text-lg">Add to Playlist</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading ? (
             <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-500" /></div>
          ) : playlists.length === 0 ? (
             <div className="text-center p-8 text-gray-500">
                <p>No playlists found.</p>
             </div>
          ) : (
             <div className="space-y-1">
                {playlists.map((playlist) => (
                   <button
                     key={playlist.id}
                     onClick={() => handleAdd(playlist.id)}
                     disabled={!!addingId}
                     className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition text-left group"
                   >
                     <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center text-gray-500">
                        <ListMusic className="w-5 h-5" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{playlist.title}</p>
                        <p className="text-xs text-gray-500">{0} songs</p>
                     </div>
                     {addingId === playlist.id && <Loader2 className="w-4 h-4 text-white animate-spin" />}
                   </button>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
