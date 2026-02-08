import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'songs'; // songs, videos, artists, albums
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    
    console.log('🔑 API Key configured:', !!apiKey);
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    // Build search URL based on type
    // NOTE: key was missing in the template literal in the original code!
    let searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&key=${apiKey}`;
    
    console.log('🔗 Search URL (redacted):', searchUrl.replace(apiKey, 'HIDDEN'));
    
    switch (type) {
      case 'artists':
        // Search for channels (artists/creators)
        searchUrl += '&type=channel';
        break;
      case 'albums':
        // Search for playlists (albums/compilations)
        searchUrl += '&type=playlist';
        break;
      case 'videos':
        // All videos
        searchUrl += '&type=video';
        break;
      case 'songs':
      default:
        // Music videos only
        searchUrl += '&type=video';
        if (query.toLowerCase().indexOf('mix') === -1) { // Don't restrict if user searching for mix? 
           searchUrl += '&videoCategoryId=10';
        }
        break;
    }

    console.log('🔍 YouTube API Search:', type, query);

    // Search for content matching the query
    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      const error = await searchResponse.json();
      console.error('YouTube Search API Error:', error);
      return NextResponse.json(
        { error: 'Failed to search YouTube', details: error },
        { status: searchResponse.status }
      );
    }

    const data = await searchResponse.json();
    
    if (!data.items) {
      console.warn('YouTube API returned no items:', data);
      return NextResponse.json({ songs: [] });
    }
    
    // Handle different response types
    if (type === 'artists') {
      // Return channel/artist data
      const artists = data.items.map((item: any, index: number) => ({
        id: item.id?.channelId || `artist-${index}`,
        title: item.snippet?.channelTitle || item.snippet?.title || 'Unknown Artist',
        artist: item.snippet?.description?.substring(0, 100) || 'Artist',
        cover: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
        duration: '0:00',
        type: 'artist'
      }));
      
      return NextResponse.json({ songs: artists });
    }
    
    if (type === 'albums') {
      // Return playlist/album data
      const albums = data.items.map((item: any, index: number) => ({
        id: item.id?.playlistId || `album-${index}`,
        title: item.snippet?.title || 'Unknown Album',
        artist: item.snippet?.channelTitle || 'Unknown Artist',
        cover: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
        duration: '0:00',
        type: 'album'
      }));
      
      return NextResponse.json({ songs: albums });
    }
    
    // For videos and songs, get video IDs to fetch durations
    const videoIds = data.items
      .map((item: any) => item.id?.videoId)
      .filter((id: string) => id) // Filter out undefined IDs
      .join(',');
    
    if (!videoIds) {
      return NextResponse.json({ songs: [] });
    }
    
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
      // Fallback to basic data if details fetch fails
      const fallbackSongs = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        album: 'YouTube Music',
        cover: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        duration: '0:00',
      }));
      return NextResponse.json({ songs: fallbackSongs });
    }

    const videosData = await videosResponse.json();

    if (!videosData.items) {
      return NextResponse.json({ songs: [] });
    }

    // Transform to our song format
    const songs = videosData.items.map((video: any) => {
      try {
        const title = video.snippet?.title || 'Unknown Title';
        const channelTitle = video.snippet?.channelTitle || 'Unknown Artist';
        
        // Try to extract artist from title
        let artist = channelTitle;
        let songTitle = title;
        
        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          artist = parts[0].trim();
          songTitle = parts.slice(1).join(' - ').trim();
        }

        const duration = video.contentDetails?.duration 
          ? parseDuration(video.contentDetails.duration) 
          : '0:00';

        return {
          id: video.id,
          title: songTitle,
          artist: artist,
          album: 'YouTube Music',
          cover: video.snippet?.thumbnails?.maxres?.url || 
                 video.snippet?.thumbnails?.high?.url || 
                 video.snippet?.thumbnails?.default?.url || 
                 `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
          duration: duration,
        };
      } catch (err) {
        console.error('Error processing video item:', err, video);
        return null;
      }
    }).filter((song: any) => song !== null); // Filter out failed items

    return NextResponse.json({ songs });
    
  } catch (error: any) {
    console.error('Search API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

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
