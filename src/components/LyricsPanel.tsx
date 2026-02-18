"use client";

import { useRef, useMemo, useEffect } from 'react';
import { Mic2, Loader2 } from 'lucide-react';
import { getActiveLyricIndex, type ParsedLyricLine } from '@/lib/lyrics';
import { Song } from '@/lib/data';

interface LyricsPanelProps {
  currentSong: Song | null;
  progress: number;
  lyrics: ParsedLyricLine[];
  lyricsType: 'synced' | 'plain' | null;
  isLoading: boolean;
  error: string | null;
  onLineClick?: (time: number) => void;
}

export function LyricsPanel({ 
  currentSong, 
  progress,
  lyrics,
  lyricsType,
  isLoading,
  error,
  onLineClick
}: LyricsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate active line index
  const activeLine = useMemo(() => {
    if (lyricsType !== 'synced') return -1;
    return getActiveLyricIndex(progress, lyrics);
  }, [progress, lyrics, lyricsType]);

  // Auto-scroll to active line

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLine === -1 || !activeLineRefs.current[activeLine]) return;
    
    const element = activeLineRefs.current[activeLine];
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLine]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin" />
        <p className="text-sm">Loading lyrics...</p>
      </div>
    );
  }

  // Error or no lyrics
  if (error || lyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 text-center px-6">
        <Mic2 className="w-12 h-12 opacity-50" />
        <p className="text-sm">{error || 'Lyrics not available for this track.'}</p>
      </div>
    );
  }

  // Lyrics display
  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full overflow-y-auto scrollbar-hide px-6 py-8"
    >
      {/* Spacer for better scrolling */}
      <div className="h-[40vh]" />
      
      {lyrics.map((line, index) => {
        const isActive = lyricsType === 'synced' && index === activeLine;

        return (
          <div
            key={index}
            ref={(el) => {
              activeLineRefs.current[index] = el;
            }}
            onClick={() => lyricsType === 'synced' && onLineClick?.(line.time)}
            className={`
              transition-all duration-300 ease-out py-3 px-4 rounded-lg my-1
              ${isActive ? 'scale-105 font-bold text-2xl' : 'text-gray-400 text-lg opacity-60 hover:opacity-100 hover:bg-white/5 cursor-pointer'}
              ${lyricsType === 'plain' ? 'text-center' : ''}
            `}
            style={isActive ? {
              background: 'linear-gradient(90deg, #a78bfa, #ec4899, #a78bfa)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s ease infinite',
              filter: 'drop-shadow(0 0 12px rgba(167, 139, 250, 0.6))',
            } : undefined}
          >
            {line.text}
          </div>
        );
      })}
      
      {/* Bottom spacer */}
      <div className="h-[40vh]" />
    </div>
  );
}
