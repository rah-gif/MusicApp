import { NextRequest, NextResponse } from 'next/server';

const LRCLIB_API_BASE = 'https://lrclib.net/api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artist = searchParams.get('artist');
  const title = searchParams.get('title');
  const duration = searchParams.get('duration');

  if (!artist || !title) {
    return NextResponse.json(
      { error: 'Missing required parameters: artist and title' },
      { status: 400 }
    );
  }

  try {
    // Convert duration from "M:SS" to seconds
    let durationSeconds: number | undefined;
    if (duration) {
      const parts = duration.split(':');
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        durationSeconds = minutes * 60 + seconds;
      }
    }

    const params = new URLSearchParams({
      artist_name: artist,
      track_name: title,
    });

    if (durationSeconds) {
      params.append('duration', durationSeconds.toString());
    }

    console.log('🎵 Fetching lyrics from LRCLIB:', { artist, title, duration, durationSeconds });

    const response = await fetch(`${LRCLIB_API_BASE}/get?${params}`, {
      headers: {
        'User-Agent': 'Music App (https://github.com/yourusername/music-app)',
      },
    });

    console.log('📡 LRCLIB response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('❌ Lyrics not found for:', { artist, title });
        return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 });
      }
      const errorText = await response.text();
      console.error('❌ LRCLIB API error:', response.status, errorText);
      throw new Error(`LRCLIB API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Lyrics fetched successfully');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Failed to fetch lyrics:', error.message);
    // Return 404/Empty to allow UI to fail gracefully
    return NextResponse.json(
      { error: 'Failed to fetch lyrics' },
      { status: 404 }
    );
  }
}
