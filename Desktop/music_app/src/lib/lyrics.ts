// Lyrics service using LRCLIB API
// API Docs: https://lrclib.net/docs

const LRCLIB_API_BASE = 'https://lrclib.net/api';

export interface ParsedLyricLine {
  time: number;  // Time in seconds
  text: string;  // Lyric text
}

interface LRCLIBResponse {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  syncedLyrics: string | null;
  plainLyrics: string | null;
}

export interface LyricsResult {
  lines: ParsedLyricLine[];
  type: 'synced' | 'plain' | null;
}

/**
 * Fetch lyrics from LRCLIB API
 * @param artist - Artist name
 * @param title - Song title
 * @param duration - Song duration in "M:SS" format
 */
/**
 * Clean string for better matching (remove brackets, ft., etc)
 */
function cleanString(str: string): string {
  return str
    .replace(/\(.*\)|\[.*\]/g, '') // Remove (...) and [...]
    .replace(/\b(ft\.|feat\.|featuring)\s+.*$/i, '') // Remove ft. Artist
    .replace(/\b(official video|audio|lyrics)\b/gi, '') // Remove common keywords
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

export async function getLyrics(
  artist: string,
  title: string,
  duration?: string
): Promise<LyricsResult> {
  try {
    const cleanTitle = cleanString(title);
    const cleanArtist = cleanString(artist);

    // 1. Try with duration (most accurate)
    let params = new URLSearchParams({
      artist: cleanArtist,
      title: cleanTitle,
      ...(duration && { duration }),
    });

    console.log('🎵 Fetching lyrics:', { artist: cleanArtist, title: cleanTitle, duration });
    
    let response = await fetch(`/api/lyrics?${params}`);
    
    // 2. Fallback: Try without duration if 404
    if (!response.ok && response.status === 404) {
         console.log('⚠️ Exact match failed, trying without duration...');
         params = new URLSearchParams({
            artist: cleanArtist,
            title: cleanTitle,
         });
         response = await fetch(`/api/lyrics?${params}`);
    }

    if (!response.ok) {
      console.warn(`Lyrics API returned ${response.status}`);
      return { lines: [], type: null };
    }
    
    const data = await response.json();
    
    // Handle instrumental tracks
    if (data.instrumental) {
      return {
        lines: [{ time: 0, text: '🎵 Instrumental Track 🎵' }],
        type: null
      };
    }
    
    // Try synced lyrics first
    if (data.syncedLyrics) {
      console.log('✅ Found synced lyrics');
      return {
        lines: parseLRC(data.syncedLyrics),
        type: 'synced'
      };
    }
    
    // Fall back to plain lyrics
    if (data.plainLyrics) {
      console.log('✅ Found plain lyrics (no sync)');
      return {
        lines: parsePlainLyrics(data.plainLyrics),
        type: 'plain'
      };
    }
    
    throw new Error('No lyrics available');
    
  } catch (error) {
    console.error('❌ Lyrics fetch error:', error);
    return {
      lines: [],
      type: null
    };
  }
}

/**
 * Parse LRC format into structured lines with timestamps
 * LRC format: [MM:SS.xx]Lyric text
 */
function parseLRC(lrcString: string): ParsedLyricLine[] {
  const lines: ParsedLyricLine[] = [];
  const lrcLines = lrcString.split('\n');
  
  for (const line of lrcLines) {
    // Match timestamp pattern [MM:SS.xx] or [MM:SS]
    const match = line.match(/\[(\d{2}):(\d{2})\.?(\d{2})?\](.*)/);
    
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = parseInt(match[3] || '0', 10);
      
      const time = minutes * 60 + seconds + centiseconds / 100;
      const text = match[4].trim();
      
      if (text) {
        lines.push({ time, text });
      }
    }
  }
  
  return lines;
}

/**
 * Parse plain lyrics (no timestamps)
 * Assign fake timestamps 3 seconds apart
 */
function parsePlainLyrics(plainText: string): ParsedLyricLine[] {
  const lines = plainText
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map((text, index) => ({
      time: index * 3, // 3 seconds per line
      text: text.trim()
    }));
  
  return lines;
}

/**
 * Convert duration string "M:SS" or "MM:SS" to total seconds
 */
function parseDurationToSeconds(duration: string): number {
  const parts = duration.split(':');
  
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  }
  
  return 0;
}

/**
 * Get the index of the active lyric line based on current playback time
 */
export function getActiveLyricIndex(
  currentTime: number,
  lyrics: ParsedLyricLine[]
): number {
  if (!lyrics.length) return -1;
  
  // Find the last line whose timestamp has passed
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      return i;
    }
  }
  
  return -1; // Before first line
}
