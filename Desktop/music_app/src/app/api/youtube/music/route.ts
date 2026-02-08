import { NextRequest, NextResponse } from 'next/server';

// YouTube Data API endpoint
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    // Search for popular music videos
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?` +
      `part=snippet&` +
      `type=video&` +
      `videoCategoryId=10&` + // Music category
      `order=viewCount&` +
      `maxResults=50&` +
      `chart=mostPopular&` +
      `regionCode=US&` +
      `key=${apiKey}`
    );

    if (!searchResponse.ok) {
      const error = await searchResponse.json();
      console.error('YouTube API Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch from YouTube API', details: error },
        { status: searchResponse.status }
      );
    }

    const data = await searchResponse.json();
    
    // Get video IDs to fetch durations
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    
    // Fetch video details for durations
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?` +
      `part=contentDetails,snippet&` +
      `id=${videoIds}&` +
      `key=${apiKey}`
    );

    if (!videosResponse.ok) {
      const error = await videosResponse.json();
      console.error('YouTube Videos API Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch video details', details: error },
        { status: videosResponse.status }
      );
    }

    const videosData = await videosResponse.json();

    // Transform to our song format
    const songs = videosData.items.map((video: any) => {
      const title = video.snippet.title;
      const channelTitle = video.snippet.channelTitle;
      
      // Try to extract artist from title (usually "Artist - Song Title")
      let artist = channelTitle;
      let songTitle = title;
      
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0].trim();
        songTitle = parts.slice(1).join(' - ').trim();
      }

      // Convert ISO 8601 duration to readable format
      const duration = parseDuration(video.contentDetails.duration);

      return {
        id: video.id,
        title: songTitle,
        artist: artist,
        album: 'YouTube Music',
        cover: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
        duration: duration,
      };
    });

    return NextResponse.json({
      songs,
      cached: false,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Helper function to parse ISO 8601 duration
function parseDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
