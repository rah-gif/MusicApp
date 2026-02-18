'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toggleLike, checkIsLiked } from '@/actions/like';
import { Song } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
    song: Song;
    className?: string; 
}

export function LikeButton({ song, className }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkIsLiked(song.id).then(setIsLiked);
    }, [song.id]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsLoading(true);
        // Optimistic update
        setIsLiked(!isLiked);

        const result = await toggleLike(song);
        if (result.error) {
            if (result.error === 'Not authenticated') {
                router.push('/login');
            } else {
                // Revert on error
                setIsLiked(!isLiked);
                console.error(result.error);
            }
        }
        setIsLoading(false);
    };

    return (
        <button 
            onClick={handleToggle}
            disabled={isLoading}
            className={cn("p-2 rounded-full hover:bg-white/10 transition-colors group/like", className)}
        >
            <Heart 
                className={cn(
                    "w-5 h-5 transition-colors", 
                    isLiked ? "fill-red-500 text-red-500" : "text-gray-400 group-hover/like:text-white"
                )} 
            />
        </button>
    );
}
