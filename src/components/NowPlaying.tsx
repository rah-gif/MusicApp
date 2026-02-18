"use client";

import { ChevronDown, MoreVertical, Cast, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Sidebar, Radio, Mic2, Info, Heart } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { LyricsPanel } from './LyricsPanel';
import { getLyrics, type ParsedLyricLine } from '@/lib/lyrics';

import { LikeButton } from './LikeButton';
import { AddToPlaylistModal } from './AddToPlaylistModal';

export function NowPlaying() {
  const { 
    currentSong, 
    isExpanded, 
    collapsePlayer, 
    isPlaying, 
    togglePlay, 
    queue, 
    contextQueue, 
    relatedQueue, 
    autoplay, 
    toggleAutoplay,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
    nextSong, 
    prevSong,
    toggleLike, 
    isLiked,
    progress,
    duration,
    seek 
  } = usePlayer();
  const [activeTab, setActiveTab] = useState<'upnext' | 'lyrics' | 'related' | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  // Lyrics State
  const [lyrics, setLyrics] = useState<ParsedLyricLine[]>([]);
  const [lyricsType, setLyricsType] = useState<'synced' | 'plain' | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);

  // Fetch lyrics when song changes
  useEffect(() => {
    if (!currentSong) {
      setLyrics([]);
      setLyricsType(null);
      return;
    }

    const fetchLyrics = async () => {
      setIsLoadingLyrics(true);
      setLyricsError(null);
      
      try {
        const result = await getLyrics(
          currentSong.artist,
          currentSong.title,
          currentSong.duration
        );
        
        if (result.lines.length > 0) {
          setLyrics(result.lines);
          setLyricsType(result.type);
        } else {
          setLyricsError('Lyrics not available for this track.');
          setLyrics([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch lyrics:', err);
        setLyricsError('Lyrics not available for this track.');
        setLyrics([]);
        setLyricsType(null);
      } finally {
        setIsLoadingLyrics(false);
      }
    };

    fetchLyrics();
  }, [currentSong?.id]);

  // Sync progress when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress || 0);
    }
  }, [progress, isDragging]);

  const handleSeekStart = () => {
    setIsDragging(true);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setLocalProgress(newProgress);
  };

  const handleSeekCommit = () => {
    setIsDragging(false);
    seek(localProgress);
  };

  const handleLyricClick = (time: number) => {
    seek(time);
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };



  if (!currentSong) return null;

  return (
    <>
      {/* Mobile & Desktop Container */}
      <div
        className={cn(
          "fixed inset-0 z-[100] flex flex-col transition-all duration-500 ease-in-out overflow-hidden",
          "translate-y-full md:translate-y-0",
          isExpanded ? "translate-y-0 opacity-100" : "translate-y-full md:opacity-0 md:pointer-events-none",
          "bg-zinc-900 md:bg-gradient-to-b md:from-zinc-800 md:to-zinc-950"
        )}
      >
        {/* Helper to close on mobile */}
        <div className="absolute top-4 left-4 md:hidden z-50">
           <button onClick={collapsePlayer} className="p-2 rounded-full hover:bg-white/10">
             <ChevronDown className="w-8 h-8 text-white" />
           </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col md:flex-row h-full">
            
            {/* Left/Top: Artwork & Controls */}
            <div className={cn(
                "flex-1 flex flex-col relative transition-all duration-500 h-full md:overflow-hidden",
                "overflow-y-auto scrollbar-hide",
                isPanelOpen ? "mr-0" : "" 
            )}>
                
                {/* Desktop Close Button */}
                <button 
                    onClick={collapsePlayer} 
                    className="absolute top-8 left-8 hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition z-50"
                >
                    <ChevronDown className="w-6 h-6" />
                    <span className="font-medium">Close</span>
                </button>

                 {/* Header Actions */}
                 <div className="absolute top-8 right-8 flex gap-4 z-50">
                     <button onClick={() => setIsPanelOpen(!isPanelOpen)} className={cn("hidden md:block transition", isPanelOpen ? "text-white" : "text-gray-400 hover:text-white")}>
                        <Sidebar className="w-6 h-6" />
                     </button>
                     <Cast className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                     <MoreVertical className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                 </div>

                {/* Main Content Area (Artwork + Controls) - Centered Flow */}
                <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 relative px-8 pt-16 pb-64 md:pb-0 md:pt-0 md:p-12 overflow-y-auto scrollbar-hide">
                     
                     {/* Combined Container for Desktop Alignment - Fixed max-width to prevent jumping/resizing */}
                     <div className={cn(
                         "flex flex-col items-center w-full transition-all duration-500",
                         "max-w-[500px] lg:max-w-[600px]" 
                     )}>
                         {/* Artwork */}
                         <div className={cn(
                            "relative w-full shadow-2xl transition-all duration-500 ease-out z-10 flex-shrink-0 mb-8 md:mb-12",
                            "aspect-square rounded-xl overflow-hidden",
                            // Mobile sizing
                             "max-h-[45vh]",
                             // Desktop sizing handled by parent max-w
                        )}>
                            <Image 
                                src={currentSong.cover} 
                                alt={currentSong.title} 
                                fill
                                sizes="(max-width: 768px) 100vw, 500px"
                                className="object-cover"
                            />
                        </div>

                        {/* Desktop: Controls explicitly below artwork */}
                        <div className="hidden md:flex flex-col w-full">
                            {/* Song Info */}
                            <div className="w-full flex justify-between items-start mb-6">
                                <div>
                                     <h2 className="font-bold text-white mb-1 line-clamp-1 text-3xl">{currentSong.title}</h2>
                                     <p className="text-gray-400 line-clamp-1 text-xl">{currentSong.artist}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <LikeButton song={currentSong} />
                                     <button 
                                        onClick={() => setShowAddToPlaylist(true)}
                                        className="text-gray-400 hover:text-white p-2"
                                     >
                                         <MoreVertical className="w-6 h-6" />
                                     </button>
                                </div>
                            </div>
                            
                            {showAddToPlaylist && (
                                <AddToPlaylistModal 
                                    song={currentSong} 
                                    onClose={() => setShowAddToPlaylist(false)} 
                                />
                            )}

                            {/* Progress Bar */}
                            <div className="w-full mb-6 flex flex-col gap-2">
                                 <div className="group relative h-1 flex items-center">
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
                                        className="absolute z-20 w-full h-4 opacity-0 cursor-pointer"
                                    />
                                     <div className="w-full h-1 bg-gray-700/50 rounded-full overflow-hidden">
                                         <div 
                                            className="h-full bg-white group-hover:bg-red-500 rounded-full relative"
                                            style={{ width: `${Math.min(100, Math.max(0, (localProgress / (duration || 1)) * 100))}%` }}
                                         ></div>
                                     </div>
                                     <div 
                                        className="w-3 h-3 bg-white rounded-full absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity top-1/2 -translate-y-1/2"
                                        style={{ left: `${Math.min(100, Math.max(0, (localProgress / (duration || 1)) * 100))}%`, transform: 'translateX(-50%)' }}
                                     ></div>
                                 </div>
                                 <div className="flex justify-between text-xs font-medium text-gray-500">
                                     <span>{formatTime(localProgress)}</span>
                                     <span>{formatTime(duration)}</span>
                                 </div>
                            </div>

                            {/* Main Controls */}
                            <div className="flex items-center justify-between w-full px-4">
                                <button 
                                    onClick={toggleShuffle}
                                    className={`transition ${shuffle ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Shuffle className="w-5 h-5" />
                                </button>
                                <button onClick={prevSong} className="text-white hover:text-gray-300 transition"><SkipBack className="w-8 h-8" /></button>
                                <button 
                                    onClick={togglePlay}
                                    className="bg-white rounded-full flex items-center justify-center hover:scale-105 transition w-16 h-16 shadow-lg shadow-white/10"
                                >
                                    {isPlaying ? (
                                        <Pause className="text-black fill-black w-8 h-8" />
                                    ) : (
                                         <Play className="text-black fill-black ml-1 w-8 h-8" />
                                    )}
                                </button>
                                <button onClick={nextSong} className="text-white hover:text-gray-300 transition"><SkipForward className="w-8 h-8" /></button>
                                <button 
                                    onClick={cycleRepeat}
                                    className={`transition relative ${repeat !== 'off' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Repeat className="w-5 h-5" />
                                    {repeat === 'one' && (
                                        <span className="absolute -top-1 -right-1 text-[10px] font-bold">1</span>
                                    )}
                                </button>
                            </div>
                        </div>


                    </div>


                    {/* Mobile Controls (Keep absolute bottom) */}
                    <div className="md:hidden absolute bottom-0 left-0 right-0 z-50 flex flex-col items-center w-full px-8 pb-safe bg-[#0f0f0f] pt-4 rounded-t-3xl border-t border-white/5">
                        <div className="w-full mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex-1">
                                    <h2 className="font-bold text-white text-xl line-clamp-1">{currentSong.title}</h2>
                                    <p className="text-gray-400 text-base line-clamp-1">{currentSong.artist}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                     <LikeButton song={currentSong} />
                                     <button 
                                        onClick={() => setShowAddToPlaylist(true)}
                                        className="text-gray-400"
                                     >
                                         <MoreVertical className="w-6 h-6" />
                                     </button>
                                </div>
                            </div>
                            
                            <div className="w-full mb-4 group relative h-1 bg-gray-700 rounded-full cursor-pointer">
                                  <div className="absolute h-full bg-white w-1/3 rounded-full"></div>
                            </div>
                            
                             <div className="flex items-center justify-between w-full">
                                <button className="text-gray-400"><Shuffle className="w-5 h-5" /></button>
                                <button className="text-white"><SkipBack className="w-7 h-7" /></button>
                                <button onClick={togglePlay} className="bg-white rounded-full w-14 h-14 flex items-center justify-center">
                                    {isPlaying ? <Pause className="text-black fill-black w-6 h-6" /> : <Play className="text-black fill-black ml-1 w-6 h-6" />}
                                </button>
                                <button onClick={nextSong} className="text-white"><SkipForward className="w-7 h-7" /></button>
                                <button className="text-gray-400 hover:text-white transition"><Repeat className="w-5 h-5" /></button>
                             </div>

                            {/* Mobile Tabs (Fixed Bottom Footer) */}
                             <div className="flex justify-between items-center w-full pt-8 pb-4 mt-2 border-t border-white/5 md:hidden">
                                {['upnext', 'lyrics', 'related'].map((tab) => (
                                    <button 
                                        key={tab}
                                        onClick={() => setActiveTab(activeTab === tab ? null : tab as any)}
                                        className={cn(
                                            "text-[11px] font-black tracking-[0.2em] uppercase transition-colors duration-300 flex-1 text-center py-2", 
                                            activeTab === tab ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                                        )}
                                    >
                                        {tab.replace('upnext', 'Up Next')}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* Right Side Panel (Desktop) */}
            <div className={cn(
                "hidden md:flex flex-col bg-[#0f0f0f] border-l border-white/5 transition-all duration-500 ease-in-out overflow-hidden scrollbar-hide",
                isPanelOpen ? "w-[400px] opacity-100" : "w-0 opacity-0 border-none"
            )}>
                 <div className="p-6 pb-0 flex gap-8 mb-4 border-b border-white/10">
                    {['upnext', 'lyrics', 'related'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn("text-sm font-bold tracking-widest uppercase pb-4 border-b-2 transition hover:text-white -mb-[1px]", activeTab === tab ? "text-white border-white" : "text-gray-500 border-transparent")}
                        >
                            {tab.replace('upnext', 'Up Next')}
                        </button>
                    ))}
                 </div>

                 <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pt-2">
                     {activeTab === 'upnext' && (
                         <div className="space-y-6">
                             
                             {/* 1. Manual Queue */}
                             {queue.length > 0 && (
                                 <div>
                                     <h3 className="text-gray-400 text-xs font-bold uppercase mb-3">Next in Queue</h3>
                                     <div className="space-y-2">
                                         {queue.map((song, i) => (
                                             <SongItem key={i} song={song} />
                                         ))}
                                     </div>
                                 </div>
                             )}

                             {/* 2. Context Queue */}
                             {contextQueue.length > 0 && (
                                 <div>
                                    <h3 className="text-gray-400 text-xs font-bold uppercase mb-3">Playing from Album</h3>
                                     <div className="space-y-2">
                                         {contextQueue.map((song, i) => (
                                             <SongItem key={i} song={song} />
                                         ))}
                                     </div>
                                 </div>
                             )}

                             {/* Autoplay Toggle */}
                             <div className="flex items-center justify-between py-2">
                                 <div className="flex items-center gap-2">
                                     <span className="text-sm font-medium text-white">Autoplay</span>
                                     <Info className="w-4 h-4 text-gray-500" />
                                 </div>
                                 <button 
                                    onClick={toggleAutoplay}
                                    className={cn("w-10 h-6 rounded-full relative transition-colors", autoplay ? "bg-white" : "bg-zinc-700")}
                                 >
                                     <div className={cn("absolute top-1 w-4 h-4 rounded-full transition-all bg-black", autoplay ? "left-5" : "left-1")} />
                                 </button>
                             </div>

                             {/* 3. Related Queue */}
                             {autoplay && relatedQueue.length > 0 && (
                                 <div>
                                     <h3 className="text-gray-400 text-xs font-bold uppercase mb-3">Similar to {currentSong.artist}</h3>
                                     <div className="space-y-2">
                                         {relatedQueue.map((song, i) => (
                                             <SongItem key={i} song={song} isRelated />
                                         ))}
                                     </div>
                                 </div>
                             )}
                         </div>
                     )}
                     {activeTab === 'lyrics' && (
                         <LyricsPanel 
                             currentSong={currentSong} 
                             progress={progress}
                             lyrics={lyrics}
                             lyricsType={lyricsType}
                             isLoading={isLoadingLyrics}
                             error={lyricsError}
                             onLineClick={handleLyricClick}
                         />
                     )}
                     {activeTab === 'related' && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 text-center">
                             <Radio className="w-12 h-12 opacity-50" />
                             <p>Related Artists and Albums<br/>would appear in a grid here.</p>
                         </div>
                     )}
                 </div>
            </div>

        </div>

        {/* Mobile Full-Screen Overlay (Image 2 Style) */}
        <div className={cn(
            "fixed inset-0 z-[120] bg-zinc-950 transition-transform duration-500 ease-in-out md:hidden flex flex-col",
            activeTab ? "translate-y-0" : "translate-y-full pointer-events-none"
        )}>
            
            {/* Overlay Header (Mini Player Style) */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 backdrop-blur-md border-b border-white/5 shrink-0">
                <button onClick={() => setActiveTab(null)} className="p-2 -ml-2 text-white">
                    <ChevronDown className="w-6 h-6" />
                </button>
                
                <div className="flex flex-col items-center flex-1 mx-4">
                    <span className="text-sm font-bold text-white line-clamp-1">{currentSong.title}</span>
                    <span className="text-xs text-gray-400 line-clamp-1">{currentSong.artist}</span>
                </div>

                <div className="flex items-center gap-4">
                     <Cast className="w-5 h-5 text-gray-400" />
                     <button onClick={togglePlay} className="text-white">
                        {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
                     </button>
                </div>
            </div>

            {/* Top Tabs Navigation */}
            <div className="flex items-center justify-center gap-8 w-full py-4 shrink-0">
                {['upnext', 'lyrics', 'related'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={cn(
                            "text-xs font-bold tracking-widest uppercase pb-2 border-b-2 transition select-none", 
                            activeTab === tab ? "text-white border-white" : "text-gray-500 border-transparent"
                        )}
                    >
                        {tab.replace('upnext', 'Up Next')}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-8">
                 {activeTab === 'upnext' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* 1. Manual Queue */}
                        {queue.length > 0 && (
                            <div>
                                <div className="space-y-2">
                                    {queue.map((song, i) => (
                                        <SongItem key={i} song={song} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* 2. Context Queue */}
                        {contextQueue.length > 0 && (
                            <div>
                                <div className="space-y-2">
                                     {(() => {
                                        const currentIndex = contextQueue.findIndex(s => s.id === currentSong?.id);
                                        const nextSongs = currentIndex !== -1 ? contextQueue.slice(currentIndex + 1) : contextQueue.filter(s => s.id !== currentSong?.id);
                                        if (nextSongs.length === 0) return null;
                                        return nextSongs.map((song, i) => <SongItem key={i} song={song} />);
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'lyrics' && (
                    <LyricsPanel 
                        currentSong={currentSong} 
                        progress={progress}
                        lyrics={lyrics}
                        lyricsType={lyricsType}
                        isLoading={isLoadingLyrics}
                        error={lyricsError} 
                        onLineClick={handleLyricClick}
                    />
                )}
                {activeTab === 'related' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         {relatedQueue.length > 0 ? (
                             <div>
                                 <div className="space-y-2">
                                     {relatedQueue.map((song, i) => (
                                         <SongItem key={i} song={song} isRelated />
                                     ))}
                                 </div>
                             </div>
                         ) : (
                             <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 space-y-4 text-center">
                                 <Radio className="w-12 h-12 opacity-50" />
                                 <p>Related Artists and Albums<br/>would appear in a grid here.</p>
                             </div>
                         )}
                    </div>
                )}
            </div>
        </div>

      </div>
    </>
  );
}

function SongItem({ song, isRelated }: { song: any, isRelated?: boolean }) {
    return (
        <div className="flex items-center gap-3 group cursor-pointer hover:bg-white/10 p-2 rounded-md transition">
            <div className="w-10 h-10 bg-zinc-800 rounded flex-shrink-0 relative overflow-hidden">
             <Image src={song.cover} alt={song.title} fill className="object-cover" sizes="40px" />
            </div>
            <div className="flex-1 min-w-0">
                <p className={cn("text-white text-sm font-medium truncate", isRelated && "text-gray-300")}>{song.title}</p>
                <p className="text-gray-400 text-xs truncate">{song.artist}</p>
            </div>
            <span className="text-gray-600 text-xs group-hover:text-white">3:45</span>
        </div>
    )
}
