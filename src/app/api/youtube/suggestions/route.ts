import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_SUGGEST_API = 'https://suggestqueries-clients6.youtube.com/complete/search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Use YouTube's autocomplete API (same one YouTube uses)
    const response = await fetch(
      `${YOUTUBE_SUGGEST_API}?client=firefox&ds=yt&q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      console.error('YouTube Suggest API failed:', response.status);
      return NextResponse.json({ suggestions: [] });
    }

    const data = await response.json();
    
    // The API returns an array where second element contains suggestions
    const suggestions = data[1] || [];
    
    // Return up to 8 suggestions
    return NextResponse.json({
      suggestions: suggestions.slice(0, 8)
    });
    
  } catch (error: any) {
    console.error('Suggestions API Error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
