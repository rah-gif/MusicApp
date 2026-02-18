'use client';

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const categories = [
  "Energize", "Relax", "Feel Good", "Party", "Focus", "Sleep", "Romance", "Sad", "Commute", "Workout"
];

export function CategoryPills() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('cat');

  const handleCategoryClick = (category: string) => {
    if (activeCategory === category) {
      router.push('/');
    } else {
      router.push(`/?cat=${category}`);
    }
  };

  return (
    <div className="sticky top-16 z-40 bg-zinc-950/95 backdrop-blur-sm -mx-4 px-4 md:-mx-8 md:px-8 py-2 transition-all overflow-hidden text-nowrap">
       <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 pt-1 w-full touch-pan-x overscroll-x-contain">
          {categories.map((cat) => (
             <button 
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-lg border text-sm font-medium transition whitespace-nowrap shrink-0 snap-center",
                  activeCategory === cat 
                    ? "bg-white text-black border-white" 
                    : "bg-white/5 hover:bg-white/20 border-white/5 text-white"
                )}
             >
                {cat}
             </button>
          ))}
       </div>
    </div>
  );
}
