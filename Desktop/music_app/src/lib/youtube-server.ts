import { Song } from './data';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function searchYouTubeServer(query: string, limit = 20): Promise<Song[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('SERVER: Missing YOUTUBE_API_KEY');
    return [];
  }

  // Combine query with "audio" or "music" to ensure relevant results
  const searchQuery = `${query} music`;

  const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&maxResults=${limit}&q=${encodeURIComponent(searchQuery)}&type=video&videoCategoryId=10&key=${apiKey}`;

  try {
    const response = await fetch(searchUrl, { 
        next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
        console.error(`SERVER: YouTube API error ${response.status}`);
        return [];
    }

    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      album: 'Single', // API doesn't return album
      cover: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      duration: '3:00', // API search doesn't return duration, requires 2nd call. Mock for now or accept inaccuracy.
    }));

  } catch (error) {
    console.error('SERVER: Search failed', error);
    return [];
  }
}
