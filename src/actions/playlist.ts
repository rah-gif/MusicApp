'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPlaylist() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('playlists')
    .insert({
      title: `My Playlist #${Math.floor(Math.random() * 1000)}`,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  return { data };
}

export async function deletePlaylist(playlistId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function addToPlaylist(playlistId: string, song: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // Check ownership
  const { data: playlist } = await supabase
    .from('playlists')
    .select('id')
    .eq('id', playlistId)
    .eq('user_id', user.id)
    .single();

  if (!playlist) return { error: 'Playlist not found or access denied' };

  // Check if exists
  const { data: existing } = await supabase
    .from('playlist_songs')
    .select('id')
    .eq('playlist_id', playlistId)
    .eq('song_id', song.id)
    .single();

  if (existing) return { error: 'Song already in playlist' };

  // Insert
  // Ensure duration is integer
  let durationInt = 0;
  if (typeof song.duration === 'string') {
      const parts = song.duration.split(':');
      if (parts.length === 2) durationInt = parseInt(parts[0]) * 60 + parseInt(parts[1]);
  } else if (typeof song.duration === 'number') {
      durationInt = song.duration;
  }

  const { error } = await supabase
    .from('playlist_songs')
    .insert({
      playlist_id: playlistId,
      song_id: song.id,
      title: song.title,
      artist: song.artist || song.description || 'Unknown', // Fallback
      cover: song.cover || '',
      duration: durationInt
    });

  if (error) return { error: error.message };

  revalidatePath(`/playlist/${playlistId}`);
  return { success: true };
}

export async function updatePlaylist(playlistId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const coverFile = formData.get('cover') as File;

  let coverUrl = null;

  // Upload Cover if provided
  if (coverFile && coverFile.size > 0) {
      const fileExt = coverFile.name.split('.').pop();
      const fileName = `playlist_cover_${playlistId}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, coverFile);

      if (uploadError) {
          console.error('Upload error:', uploadError);
          return { error: 'Failed to upload cover' };
      }
      
      const { data: { publicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(fileName);
          
      coverUrl = publicUrl;
  }

  const updates: any = {
      title,
      description,
      ...(coverUrl && { cover_url: coverUrl })
  };

  const { error } = await supabase
      .from('playlists')
      .update(updates)
      .eq('id', playlistId)
      .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath(`/playlist/${playlistId}`);
  return { success: true };
}
