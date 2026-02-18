'use client';

import { createPlaylist } from '@/actions/playlist';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export function CreatePlaylistButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const { error } = await createPlaylist();
      if (error) {
         // If error is "Not authenticated", redirect to login
         if (error === 'Not authenticated') {
            router.push('/login');
         } else {
            console.error(error);
         }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-3 py-4 border-t border-[#2e2e2e] mt-auto">
        <button 
            onClick={handleCreate}
            disabled={isLoading}
            className="flex items-center gap-3 text-sm font-medium text-[#a3a3a3] hover:text-white w-full hover:bg-white/5 rounded-lg p-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                {isLoading ? <Loader2 className="w-3 h-3 text-black animate-spin" /> : <span className="text-black text-xs">+</span>}
            </div>
            <span>New playlist</span>
        </button>
    </div>
  );
}
