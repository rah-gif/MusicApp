import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Heart } from 'lucide-react';
import { LikedSongsClient } from '@/components/LikedSongsClient';

export default async function LikedMusicPage() {
  const supabase = await createClient();
  
  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error('Failed to get user session:', error);
    redirect('/login');
  }

  if (!user) {
    redirect('/login');
  }

  // Fetch Liked Songs
  const { data: likedSongs } = await supabase
    .from('liked_songs')
    .select('*')
    .eq('user_id', user.id)
    .order('liked_at', { ascending: false });

  return (
    <LikedSongsClient songs={likedSongs || []} user={user} />
  );
}
