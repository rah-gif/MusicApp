"use client";

import { usePlayer } from '@/contexts/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Repeat } from 'lucide-react';
import Image from 'next/image';
import { NowPlaying } from './NowPlaying';
import React, { useState, useEffect } from 'react';

export function PlayerBar() {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    expandPlayer, 
    progress, 
    duration, 
    seek, 
    nextSong, 
    prevSong 
  } = usePlayer();

  const [isDragging, setIsDragging] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress);
    }
  }, [progress, isDragging]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProgress(Number(e.target.value));
  };

  const handleSeekCommit = () => {
    setIsDragging(false);
    seek(localProgress);
  };

  const handleSeekStart = () => {
    setIsDragging(true);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <>
      <div 
        onClick={expandPlayer}
        className="fixed bottom-0 left-0 right-0 h-[64px] bg-[#212121] border-t border-white/5 md:border-t-0 flex items-center px-4 justify-between z-50 cursor-pointer md:cursor-auto"
      >
        {/* Progress bar (mobile only) - positioned at the very top of the bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gray-600 md:hidden">
            <div 
                className="h-full bg-red-600 transition-all duration-100 ease-linear"
                style={{ width: `${Math.min((localProgress / (duration || 1)) * 100, 100)}%` }}
            ></div>
        </div>

        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative w-12 h-12 md:w-14 md:h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0">
             <Image src={currentSong.cover} alt={currentSong.title} fill className="object-cover" sizes="56px" />
          </div>
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-white font-medium truncate text-sm md:text-base">{currentSong.title}</span>
            <span className="text-gray-400 text-xs md:text-sm truncate">{currentSong.artist}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
             {/* Mobile Controls */}
            <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                className="w-10 h-10 flex items-center justify-center md:hidden"
            >
                {isPlaying ? <Pause className="fill-white text-white" /> : <Play className="fill-white text-white" />}
            </button>
             
             {/* Desktop Controls */}
             <div className="hidden md:flex flex-col items-center gap-1 flex-1 min-w-[300px]">
                <div className="flex items-center gap-6">
                     <button 
                        onClick={(e) => { e.stopPropagation(); prevSong(); }}
                        className="text-gray-400 hover:text-white"
                     >
                        <SkipBack className="w-5 h-5 fill-current" />
                     </button>
                     <button 
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition"
                    >
                         {isPlaying ? <Pause className="fill-black text-black w-4 h-4" /> : <Play className="fill-black text-black w-4 h-4 ml-0.5" />}
                     </button>
                     <button 
                        onClick={(e) => { e.stopPropagation(); nextSong(); }}
                        className="text-gray-400 hover:text-white"
                     >
                        <SkipForward className="w-5 h-5 fill-current" />
                     </button>
                </div>
                <div className="flex items-center gap-3 w-full text-xs text-gray-400 font-medium" onClick={(e) => e.stopPropagation()}>
                    <span>{formatTime(localProgress)}</span>
                    <div className="flex-1 relative group h-3 flex items-center">
                        <input 
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={localProgress || 0}
                            onChange={handleSeekChange}
                            onMouseDown={handleSeekStart}
                            onMouseUp={handleSeekCommit}
                            onTouchStart={handleSeekStart}
                            onTouchEnd={handleSeekCommit}
                            className="absolute z-20 w-full h-full opacity-0 cursor-pointer"
                        />
                         <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-white group-hover:bg-red-600 rounded-full"
                                style={{ width: `${(localProgress / (duration || 1)) * 100}%` }}
                             ></div>
                         </div>
                         <div 
                            className="w-3 h-3 bg-white rounded-full absolute -ml-1.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `${(localProgress / (duration || 1)) * 100}%` }}
                         ></div>
                    </div>
                    <span>{formatTime(duration)}</span>
                </div>
             </div>
        </div>

        {/* Desktop RIGHT side controls (Volume etc) */}
        <div className="hidden md:flex items-center gap-4 flex-1 justify-end min-w-0">
             <div className="w-24 h-1 bg-gray-600 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-white"></div>
             </div>
        </div>
      </div>
      
      {/* The Overlay Component */}
      <NowPlaying />
    </>
  );
}
