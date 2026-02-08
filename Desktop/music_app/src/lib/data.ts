export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: string;
}

export interface Playlist {
  id: string;
  name: string;
  cover: string;
  desc: string;
}

// Curated list of verified YouTube music videos
// These IDs are manually verified to ensure correct playback
// This serves as a fallback if YouTube API fails
export const songs: Song[] = [
  { id: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', album: 'Vida', cover: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg', duration: '3:47' },
  { id: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Divide)', cover: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg', duration: '3:54' },
  { id: 'RgKAFK5djSk', title: 'See You Again', artist: 'Wiz Khalifa ft. Charlie Puth', album: 'Furious 7', cover: 'https://img.youtube.com/vi/RgKAFK5djSk/hqdefault.jpg', duration: '3:49' },
  { id: 'OPf0YbXqDm0', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', album: 'Uptown Special', cover: 'https://img.youtube.com/vi/OPf0YbXqDm0/hqdefault.jpg', duration: '4:30' },
  { id: 'fRh_vgS2dFE', title: 'Sorry', artist: 'Justin Bieber', album: 'Purpose', cover: 'https://img.youtube.com/vi/fRh_vgS2dFE/hqdefault.jpg', duration: '3:20' },
  { id: 'nfWlot6h_JM', title: 'Shake It Off', artist: 'Taylor Swift', album: '1989', cover: 'https://img.youtube.com/vi/nfWlot6h_JM/hqdefault.jpg', duration: '3:39' },
  { id: '2Vv-BfVoq4g', title: 'Perfect', artist: 'Ed Sheeran', album: '÷ (Divide)', cover: 'https://img.youtube.com/vi/2Vv-BfVoq4g/hqdefault.jpg', duration: '4:23' },
  { id: 'hLQl3WQQoQ0', title: 'Someone Like You', artist: 'Adele', album: '21', cover: 'https://img.youtube.com/vi/hLQl3WQQoQ0/hqdefault.jpg', duration: '4:47' },
  { id: '4NRXx6U8ABQ', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', cover: 'https://img.youtube.com/vi/4NRXx6U8ABQ/hqdefault.jpg', duration: '3:22' },
  { id: 'lp-EO5I60KA', title: 'Thinking Out Loud', artist: 'Ed Sheeran', album: 'x (Multiply)', cover: 'https://img.youtube.com/vi/lp-EO5I60KA/hqdefault.jpg', duration: '4:41' },
  { id: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', album: '25', cover: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg', duration: '4:55' },
  { id: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', album: 'Native', cover: 'https://img.youtube.com/vi/hT_nvWreIhg/hqdefault.jpg', duration: '4:17' },
  { id: 'uelHwf8o7_U', title: 'Love Yourself', artist: 'Justin Bieber', album: 'Purpose', cover: 'https://img.youtube.com/vi/uelHwf8o7_U/hqdefault.jpg', duration: '3:53' },
  { id: 'CevxZvSJLk8', title: 'Believer', artist: 'Imagine Dragons', album: 'Evolve', cover: 'https://img.youtube.com/vi/CevxZvSJLk8/hqdefault.jpg', duration: '3:24' },
  { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', cover: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg', duration: '5:55' },
];

// Dynamic songs loaded from YouTube API
let dynamicSongs: Song[] = [];

/**
 * Load songs from YouTube API (called on app startup)
 * Falls back to static list if API fails
 */
export async function loadYouTubeMusicOnStartup(): Promise<Song[]> {
  if (typeof window === 'undefined') {
    return songs; // Server-side, return static list
  }

  try {
    const { fetchYouTubeMusic } = await import('./youtube');
    const ytSongs = await fetchYouTubeMusic();
    
    if (ytSongs && ytSongs.length > 0) {
      dynamicSongs = ytSongs;
      console.log(`🎵 Loaded ${ytSongs.length} songs from YouTube`);
      return ytSongs;
    }
  } catch (error) {
    console.error('Failed to load YouTube music:', error);
  }
  
  // Fallback to static list
  console.log('📀 Using fallback music library');
  return songs;
}

/**
 * Get current songs (dynamic or fallback)
 */
export function getSongs(): Song[] {
  return dynamicSongs.length > 0 ? dynamicSongs : songs;
}

export const playlists: Playlist[] = [
  {
    id: '1',
    name: 'Liked Music',
    cover: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG11c2ljfGVufDB8fDB8fHww',
    desc: 'Auto playlist',
  },
  {
    id: '2',
    name: 'Alone with the Moon ✨',
    cover: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9vbnxlbnwwfHwwfHx8MA%3D%3D',
    desc: 'Playlist • rahul@universe • 110 tracks',
  },
  {
    id: '3',
    name: 'yung kai',
    cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D',
    desc: 'Artist • 1.43M subscribers',
  },
  {
    id: '4',
    name: 'Episodes for Later',
    cover: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym9va21hcmt8ZW58MHx8MHx8fDA%3D',
    desc: 'Auto playlist • 1 episode',
  },
    {
    id: '5',
    name: 'Techno Bunker',
    cover: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGp8ZW58MHx8MHx8fDA%3D',
    desc: 'Playlist • Spotify • 50 tracks',
  },
    {
    id: '6',
    name: 'Chill Hits',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hpbGwlMjBtdXNpY3xlbnwwfHwwfHx8MA%3D%3D',
    desc: 'Playlist • Vibe Music • 85 tracks',
  },
];

export const speedDialData = [
  ...playlists.map((p) => ({ ...p, type: 'playlist' })),
  ...songs.slice(0, 3).map((s) => ({ ...s, name: s.title, desc: s.artist, type: 'song' })),
];
