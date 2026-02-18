'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Song } from '@/lib/data';

export async function toggleLike(song: Song) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('liked_songs')
    .select('id')
    .eq('user_id', user.id)
    .eq('song_id', song.id) // Assuming song.id is the YouTube ID or unique identifier
    .single();

  if (existingLike) {
    // Delete
    const { error } = await supabase
      .from('liked_songs')
      .delete()
      .eq('id', existingLike.id);
      
    if (error) return { error: error.message };
    revalidatePath('/');
    return { liked: false };
  } else {
    // Insert
    // Ensure duration is integer
    let durationInt = 0;
    if (typeof (song as any).duration === 'string') {
        const parts = (song as any).duration.split(':');
        if (parts.length === 2) durationInt = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else if (typeof (song as any).duration === 'number') {
        durationInt = (song as any).duration;
    }

    const { error } = await supabase
      .from('liked_songs')
      .insert({
        user_id: user.id,
        song_id: song.id,
        title: song.title,
        artist: (song as any).artist, // Assuming artist property exists
        cover: song.cover,
        duration: durationInt,
      });

    if (error) return { error: error.message };
    revalidatePath('/');
    return { liked: true };
  }
}

export async function checkIsLiked(songId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('liked_songs')
        .select('id')
        .eq('user_id', user.id)
        .eq('song_id', songId)
        .single();
    
    return !!data;
}
