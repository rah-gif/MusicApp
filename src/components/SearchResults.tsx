'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Song } from '@/lib/data';

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'songs' | 'videos' | 'artists' | 'albums'>('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'songs', label: 'Songs' },
    { id: 'videos', label: 'Videos' },
    { id: 'artists', label: 'Artists' },
    { id: 'albums', label: 'Albums' },
  ] as const;

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Searching for:', query, 'Filter:', activeFilter);
        
        // Add type parameter if not 'all'
        const typeParam = activeFilter !== 'all' ? `&type=${activeFilter}` : '';
        const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}${typeParam}`);
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ API Error:', JSON.stringify(errorData, null, 2));
          throw new Error(errorData.message || errorData.error || 'Search failed');
        }
        
        const data = await response.json();
        console.log('✅ Got results:', data.songs?.length || 0, 'songs');
        setResults(data.songs || []);
      } catch (err: any) {
        console.error('🔴 Search error:', err);
        setError(err.message || 'Failed to search. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, activeFilter]); // Refetch when filter changes

  if (!query) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Searching...</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-zinc-800/50 rounded-lg aspect-square animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Search Results</h2>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">No results found for "{query}"</h2>
        <p className="text-gray-400">Try different keywords</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 px-4 md:px-0">
        <h2 className="text-xl md:text-2xl font-bold text-white break-words w-full">
          Search Results for "{query}" <span className="text-gray-400 text-lg">({results.length})</span>
        </h2>
        
        {/* Filter Tabs */}
        <div className="flex gap-4 border-b border-white/10 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`pb-3 px-2 text-sm font-medium whitespace-nowrap transition-all relative shrink-0 ${
                activeFilter === filter.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {filter.label}
              {activeFilter === filter.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4 px-2 md:px-0">
        {results.map((song, index) => (
          <Card key={song.id || `result-${index}`} item={song} type="song" aspectRatio="square" />
        ))}
      </div>
    </div>
  );
}
