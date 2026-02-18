import { Home, Compass, Library, CircleArrowUp } from 'lucide-react';

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black text-white border-t border-white/10 py-2 px-6 flex justify-between items-center z-50 pb-safe">
      <div className="flex flex-col items-center gap-1 text-white">
        <Home className="w-6 h-6" />
        <span className="text-[10px]">Home</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Compass className="w-6 h-6" />
        <span className="text-[10px]">Samples</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Compass className="w-6 h-6" />
        <span className="text-[10px]">Explore</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Library className="w-6 h-6" />
        <span className="text-[10px]">Library</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <CircleArrowUp className="w-6 h-6" />
        <span className="text-[10px]">Upgrade</span>
      </div>
    </nav>
  );
}
