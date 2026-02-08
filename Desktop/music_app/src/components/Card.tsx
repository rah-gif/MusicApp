"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Play, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';
import { Song, Playlist } from '@/lib/data';
import { LikeButton } from './LikeButton';
import { AddToPlaylistModal } from './AddToPlaylistModal';

interface CardProps {
  item: Song | Playlist;
  type: 'song' | 'playlist';
  aspectRatio?: 'square' | 'video';
  className?: string;
}

export function Card({ item, type, aspectRatio = 'square', className }: CardProps) {
  const { playSong } = usePlayer();
  const description = 'artist' in item ? item.artist : item.desc;
  
  const [showModal, setShowModal] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'song') {
      playSong(item as Song);
    }
    // Playlist play logic would go here
  };

  const handleMore = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowModal(true);
  };

  return (
    <>
      <div 
          onClick={handlePlay}
          className={cn("flex flex-col gap-3 group cursor-pointer w-full flex-shrink-0 relative", className)}
      >
        <div className={cn("relative overflow-hidden rounded-md bg-zinc-800", aspectRatio === 'square' ? "aspect-square" : "aspect-video")}>
          <Image 
            src={item.cover} 
            alt={'title' in item ? item.title : item.name} 
            fill 
            sizes="(max-width: 768px) 160px, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105" 
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                  onClick={handlePlay}
                  className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg"
              >
                  <Play className="fill-black text-black ml-1 w-5 h-5 md:w-6 md:h-6" />
              </button>
              {type === 'song' && (
                  <>
                    <div className="absolute top-2 right-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <LikeButton song={item as Song} className="bg-black/50 hover:bg-black/70 text-white" />
                    </div>
                    <button 
                        onClick={handleMore}
                        className="absolute bottom-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white translate-y-[10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                  </>
              )}
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <h3 className="text-white font-medium truncate">
              {'title' in item ? item.title : item.name}
          </h3>
          <p className="text-gray-400 text-sm truncate">{description}</p>
        </div>
      </div>
      
      {showModal && type === 'song' && (
          <AddToPlaylistModal song={item as Song} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
