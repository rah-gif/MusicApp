import type { Song } from './data';

const CACHE_KEY = 'youtube_music_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData {
  songs: Song[];
  timestamp: number;
}

/**
 * Fetches popular music from YouTube API with 24-hour caching
 */
export async function fetchYouTubeMusic(): Promise<Song[]> {
  // Check cache first
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const data: CachedData = JSON.parse(cached);
        const age = Date.now() - data.timestamp;
        
        // Return cached data if less than 24 hours old
        if (age < CACHE_DURATION) {
          console.log('✅ Using cached YouTube music data');
          return data.songs;
        }
      } catch (error) {
        console.error('Cache parse error:', error);
        localStorage.removeItem(CACHE_KEY);
      }
    }
  }

  try {
    console.log('🔍 Fetching fresh YouTube music data...');
    // Fetch from our API route
    const response = await fetch('/api/youtube/music');
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();
    
    // Cache the results
    if (typeof window !== 'undefined' && result.songs) {
      const cacheData: CachedData = {
        songs: result.songs,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Cached new YouTube music data');
    }

    return result.songs || [];
    
  } catch (error) {
    console.error('❌ Failed to fetch YouTube music:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Clears the YouTube music cache
 */
export function clearYouTubeMusicCache(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Cleared YouTube music cache');
  }
}
