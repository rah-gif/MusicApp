import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { PlayerBar } from '@/components/PlayerBar';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { AudioPlayer } from '@/components/AudioPlayer';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Music App',
  description: 'A YouTube Music clone',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-black text-white antialiased")}>
        <PlayerProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-64 relative">
                 <main className="flex-1 overflow-y-auto pb-32 md:pb-24 scrollbar-hide">
                    <div className="max-w-screen-xl mx-auto w-full">
                        {children}
                    </div>
                 </main>
                 <div className="hidden md:block absolute bottom-0 left-0 right-0 z-50">
                    <PlayerBar />
                 </div>
                  <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60]">
                    <PlayerBar />
                 </div>
            </div>
          </div>
          <AudioPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
