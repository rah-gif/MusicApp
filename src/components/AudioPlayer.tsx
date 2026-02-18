"use client";

import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

// Using standard YouTube iframe instead of react-player
export function AudioPlayer() {
  const { 
    currentSong, 
    isPlaying, 
    setProgress, 
    setDuration, 
    nextSong,
    setIsLoading,
    seekTo,
    resetSeek
  } = usePlayer();

  const playerRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize YouTube API only ONCE
  useEffect(() => {
    if (!isClient || initRef.current) return;
    
    initRef.current = true;
    console.log("Initializing YouTube API");

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API Ready");
    };
  }, [isClient]);

  // Create player when we have a song
  useEffect(() => {
    if (!isClient || !currentSong || playerReady) return;

    // Wait for API to load
    const checkAPI = setInterval(() => {
      // @ts-ignore
      if (window.YT && window.YT.Player) {
        clearInterval(checkAPI);
        
        console.log("Creating YouTube player for:", currentSong.id);
        // @ts-ignore
        playerRef.current = new window.YT.Player('youtube-player', {
          height: ' 360',
          width: '640',
          videoId: currentSong.id,
          playerVars: {
            controls: 0,
            origin: window.location.origin
          },
          events: {
            'onReady': (event: any) => {
              console.log("Player Ready");
              setIsLoading(false);
              setDuration(event.target.getDuration());
              setPlayerReady(true);
              if (isPlaying) {
                event.target.playVideo();
              }
            },
            'onStateChange': (event: any) => {
              console.log("State change:", event.data);
              if (event.data === 0) { //ended
                nextSong();
              }
            }
          }
        });
      }
    }, 100);

    return () => clearInterval(checkAPI);
  }, [isClient, currentSong, playerReady]);

  // Handle song changes
  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById && currentSong && playerReady) {
      console.log("Loading new video:", currentSong.id);
      playerRef.current.loadVideoById(currentSong.id);
      
      // Get duration after video loads with multiple retries
      let attempts = 0;
      const fetchDuration = () => {
        if (playerRef.current && playerRef.current.getDuration) {
          const dur = playerRef.current.getDuration();
          console.log("Duration fetched:", dur);
          if (dur && dur > 0) {
            setDuration(dur);
          } else if (attempts < 10) {
            attempts++;
            setTimeout(fetchDuration, 300);
          }
        }
      };
      
      setTimeout(fetchDuration, 500);
    }
  }, [currentSong?.id, playerReady]);

  // Handle play/pause
  useEffect(() => {
    if (playerRef.current && playerReady) {
      if (isPlaying) {
        playerRef.current.playVideo?.();
      } else {
        playerRef.current.pauseVideo?.();
      }
    }
  }, [isPlaying, playerReady]);

  // Handle seek
  useEffect(() => {
    if (seekTo !== null && playerRef.current && playerRef.current.seekTo && playerReady) {
      playerRef.current.seekTo(seekTo, true);
      resetSeek();
    }
  }, [seekTo, playerReady, resetSeek]);

  // Update progress
  useEffect(() => {
    if (!playerReady) return;
    
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        setProgress(current);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [playerReady]); // Removed setProgress from dependencies

  if (!isClient) return null;

  return (
    <div style={{ position: 'fixed', bottom: '-1000px', left: '-1000px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
      <div id="youtube-player"></div>
    </div>
  );
}
