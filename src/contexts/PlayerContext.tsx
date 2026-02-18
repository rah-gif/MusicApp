"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Song, loadYouTubeMusicOnStartup } from '@/lib/data';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  isExpanded: boolean;
  queue: Song[];
  contextQueue: Song[];
  relatedQueue: Song[];
  autoplay: boolean;
  likedSongs: string[];
  progress: number;
  duration: number;
  isLoading: boolean;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  
  // Actions
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  expandPlayer: () => void;
  collapsePlayer: () => void;
  playSong: (song: Song) => void;
  addToQueue: (song: Song) => void;
  toggleAutoplay: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  nextSong: () => void;
  prevSong: () => void;
  toggleLike: (songId: string) => void;
  isLiked: (songId: string) => boolean;
  seek: (amount: number) => void;
  
  // Audio Engine Setters
  setDuration: (duration: number) => void;
  setProgress: (progress: number) => void;
  setIsLoading: (loading: boolean) => void;
  // Internal for AudioPlayer
  seekTo: number | null;
  resetSeek: () => void;
  playCollection: (songs: Song[], startIndex?: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Queues
  const [queue, setQueue] = useState<Song[]>([]);
  const [contextQueue, setContextQueue] = useState<Song[]>([]);
  const [relatedQueue, setRelatedQueue] = useState<Song[]>([]);
  const [autoplay, setAutoplay] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('off');
  const [history, setHistory] = useState<Song[]>([]);

  // Likes
  const [likedSongs, setLikedSongs] = useState<string[]>([]);

  // Available songs (loaded from YouTube API)
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);

  // Load songs from YouTube API on startup
  useEffect(() => {
    loadYouTubeMusicOnStartup().then((songs) => {
      setAvailableSongs(songs);
      console.log(`🎵 PlayerContext initialized with ${songs.length} songs`);
    });
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const expandPlayer = () => setIsExpanded(true);
  const collapsePlayer = () => setIsExpanded(false);
  
  const playSong = (song: Song) => {
    if (currentSong?.id === song.id) {
        setIsPlaying(true); // Ensure it plays if it was paused
        return;
    }
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
    setDuration(0); // Reset duration
    setIsLoading(true);
    setSeekTo(0); // Optional: ensure start from 0
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const toggleAutoplay = () => {
    setAutoplay(prev => !prev);
  };

  const toggleShuffle = () => {
    setShuffle(prev => !prev);
  };

  const cycleRepeat = () => {
    setRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const nextSong = useCallback(() => {
    console.log("nextSong called, repeat:", repeat, "currentSong:", currentSong?.title);
    
    // If repeat one, replay current song
    if (repeat === 'one' && currentSong) {
      console.log("Repeating current song");
      playSong(currentSong);
      return;
    }

    // Add current song to history before moving forward
    if (currentSong) {
      setHistory(prev => [...prev.slice(-19), currentSong]); // Keep last 20 songs
    }

    // 1. Check Manual Queue
    if (queue.length > 0) {
      const next = queue[0];
      setQueue(prev => prev.slice(1));
      playSong(next);
      return;
    }

    // 2. Check Context Queue (with shuffle if enabled)
    if (contextQueue.length > 0) {
      let next: Song;
      if (shuffle) {
        // Pick random from context queue, avoiding recently played
        const recentIds = [...history.slice(-3).map(s => s.id), currentSong?.id].filter(Boolean);
        const availableSongs = contextQueue.filter(s => !recentIds.includes(s.id));
        
        if (availableSongs.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableSongs.length);
          next = availableSongs[randomIndex];
          setContextQueue(prev => prev.filter(s => s.id !== next.id));
        } else {
          // All songs were recently played, just pick random
          const randomIndex = Math.floor(Math.random() * contextQueue.length);
          next = contextQueue[randomIndex];
          setContextQueue(prev => prev.filter((_, i) => i !== randomIndex));
        }
      } else {
        next = contextQueue[0];
        setContextQueue(prev => prev.slice(1));
      }
      playSong(next);
      return;
    }

    // 3. If repeat all and we have history, restart from beginning
    if (repeat === 'all' && history.length > 0) {
      const firstSong = history[0];
      setHistory([]);
      playSong(firstSong);
      return;
    }

    // 4. Play random song from available library
    // This works for BOTH autoplay and manual next button clicks
    if (availableSongs.length > 0) {
      let next: Song;
      
      // Pick random song, avoiding recently played ones
      const recentIds = [...history.slice(-3).map(s => s.id), currentSong?.id].filter(Boolean);
      const availableSongPool = availableSongs.filter((s: Song) => !recentIds.includes(s.id));
      
      if (availableSongPool.length > 0) {
        next = availableSongPool[Math.floor(Math.random() * availableSongPool.length)];
      } else {
        // All songs were recently played, just avoid current
        const notCurrent = availableSongs.filter((s: Song) => s.id !== currentSong?.id);
        next = notCurrent[Math.floor(Math.random() * notCurrent.length)] || availableSongs[0];
      }
      
      playSong(next);
      return;
    }

    // Stop if nothing left
    setIsPlaying(false);
  }, [queue, contextQueue, autoplay, currentSong, shuffle, repeat, history, availableSongs]);

  const prevSong = () => {
    // If more than 3 seconds into song, restart it
    if (progress > 3) {
      seek(0);
      return;
    }

    // Go to previous song in history
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(prevHistory => prevHistory.slice(0, -1));
      playSong(prev);
    } else {
      // No history, just restart current song
      seek(0);
    }
  };

  const toggleLike = (songId: string) => {
    setLikedSongs(prev => {
      if (prev.includes(songId)) {
        return prev.filter(id => id !== songId);
      } else {
        return [...prev, songId];
      }
    });
  };

  const isLiked = (songId: string) => likedSongs.includes(songId);

  // This function will be properly implemented by binding to the audio player ref in the component
  // For now it updates state which the player component listens to
  // Actually, we need a way to tell the player to seek. 
  // We can use a shared object or event, but for React, we usually expose a ref or a setter.
  // Since the player component is inside the provider, we can't easily ref it from here without more complex setup.
  // ALTERNATIVE: The Context holds the state 'seekTo' which the player listens to.
  const [seekTo, setSeekTo] = useState<number | null>(null);

  const seek = (amount: number) => {
      setSeekTo(amount);
      setProgress(amount); 
  };

  const resetSeek = useCallback(() => {
    setSeekTo(null);
  }, []);

  const playCollection = useCallback((songs: Song[], startIndex = 0) => {
    if (songs.length === 0) return;
    
    const songToPlay = songs[startIndex];
    
    // Set Current Song
    setCurrentSong(songToPlay);
    setIsPlaying(true);
    setProgress(0);
    setDuration(0);
    setIsLoading(true);
    setSeekTo(0);
    
    // Set Queue (Rest of the songs)
    // We set the context queue to be the songs AFTER the current one.
    // Previous songs are correctly ignored by current 'prevSong' logic which relies on history.
    // Ideally we might want to populate history if we wanted to allow going back to previous tracks in the collection immediately,
    // but standard behavior is usually just setting up 'next'.
    setContextQueue(songs.slice(startIndex + 1));
    setQueue([]); // Clear manual queue
    setHistory([]); // Reset history for a fresh collection start? Or keep it?
    // Let's reset history if we are starting a major new collection play
    setHistory([]); 
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        isExpanded,
        queue,
        contextQueue,
        relatedQueue,
        autoplay,
        shuffle,
        repeat,
        likedSongs,
        progress,
        duration,
        isLoading,
        togglePlay,
        setIsPlaying,
        expandPlayer,
        collapsePlayer,
        playSong,
        addToQueue,
        toggleAutoplay,
        toggleShuffle,
        cycleRepeat,
        nextSong,
        prevSong,
        toggleLike,
        isLiked,
        seek,
        setDuration,
        setProgress,
        setIsLoading,
        seekTo,
        resetSeek,
        playCollection
      }}
    >
      {children}
      {/* We will insert the AudioPlayer specific logic in the UI component that wraps this, or handled via exposing values */}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
