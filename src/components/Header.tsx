"use client";

import { Search, Bell, User, ArrowLeft, X, Clock, Menu, Home, Compass, Library, CircleArrowUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSearchHistory, addToSearchHistory, removeFromSearchHistory } from '@/lib/searchHistory';
import { createClient } from '@/utils/supabase/client';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  // Load search history
  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // Fetch suggestions as user types (with debounce)
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/youtube/suggestions?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery.trim());
      setSearchHistory(getSearchHistory());
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setShowDropdown(false);
      setSuggestions([]);
    } else {
      router.push('/');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleRemoveHistory = (e: React.MouseEvent, historyItem: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromSearchHistory(historyItem);
    setSearchHistory(getSearchHistory());
  };

  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-between px-4 md:px-8 border-b border-white/5">
        
        {/* Left: Hamburger (Mobile) + Logo */}
        <div className="flex items-center gap-4">
            {/* Hamburger Menu - Mobile Only */}
            <button 
                onClick={() => setIsDrawerOpen(true)}
                className="md:hidden text-white p-1 -ml-2 hover:bg-white/10 rounded-full transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>

            <div 
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => router.push('/')}
            >
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-white"
                >
                    <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                    />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white hidden md:block">Music</span>
            </div>
        </div>

        {/* Center: Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-auto" ref={searchContainerRef}>
            <form onSubmit={handleSubmit} className="relative w-full group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors">
                    <Search className="w-5 h-5" />
                </div>
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search songs, albums, artists..." 
                    className="w-full h-10 bg-[#212121] rounded-full pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:bg-[#2a2a2a] focus:ring-1 focus:ring-white/20 transition-all font-medium"
                />
                
                {/* Combined Dropdown: History + Suggestions */}
                {showDropdown && (
                  <div className="absolute top-full mt-2 w-full bg-[#282828] rounded-lg shadow-2xl border border-white/10 overflow-hidden max-h-[400px] overflow-y-auto">
                    {/* Show history when query is empty or short */}
                    {query.length < 2 && searchHistory.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs text-gray-400 font-semibold uppercase">Recent Searches</div>
                        {searchHistory.map((item, index) => (
                          <div
                            key={`history-${index}`}
                            onClick={() => handleSuggestionClick(item)}
                            className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-white text-sm">{item}</span>
                            </div>
                            <button
                              onClick={(e) => handleRemoveHistory(e, item)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show suggestions when typing */}
                    {query.length >= 2 && (
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs text-gray-400 font-semibold uppercase">Suggestions</div>
                        {isLoadingSuggestions ? (
                          <div className="px-4 py-3 text-gray-400 text-sm">Loading...</div>
                        ) : suggestions.length > 0 ? (
                          suggestions.map((item, index) => (
                            <div
                              key={`suggestion-${index}`}
                              onClick={() => handleSuggestionClick(item)}
                              className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center gap-3"
                            >
                              <Search className="w-4 h-4 text-gray-400" />
                              <span className="text-white text-sm">{item}</span>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-400 text-sm">No suggestions</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
            </form>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-2 md:gap-6">
             <button 
                className="p-2 md:hidden text-white hover:bg-white/10 rounded-full"
                onClick={() => setIsSearchOpen(true)}
             >
                 <Search className="w-6 h-6" />
             </button>

             <button className="p-2 text-white hover:bg-white/10 rounded-full hidden md:block">
                 <Bell className="w-6 h-6" />
             </button>

             {user ? (
                <div className="relative">
                    <div 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 overflow-hidden border border-white/20 flex items-center justify-center cursor-pointer ml-2"
                    >
                        {user.user_metadata?.avatar_url ? (
                             <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                             <span className="text-xs font-bold">{user.email?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    
                    {/* User Menu Dropdown */}
                    {showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#282828] rounded-lg shadow-xl border border-white/10 overflow-hidden z-50">
                            <div className="px-4 py-3 border-b border-white/5">
                                <p className="text-sm text-white font-medium truncate">{user.user_metadata?.full_name || 'User'}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                            <button 
                                onClick={handleSignOut}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
             ) : (
                <Link href="/login" className="ml-2 px-4 py-1.5 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform">
                    Sign In
                </Link>
             )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {/* Backdrop */}
      <div 
        className={cn(
            "fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 md:hidden",
            isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsDrawerOpen(false)}
      />
      
      {/* Drawer Panel */}
      <div 
        className={cn(
            "fixed top-0 bottom-0 left-0 w-[280px] bg-[#0f0f0f] z-[70] transition-transform duration-300 ease-out md:hidden flex flex-col border-r border-white/5",
            isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
          <div className="flex items-center gap-3 p-4 border-b border-white/5 h-16">
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 -ml-2 text-white/70 hover:text-white">
                  <Menu className="w-6 h-6" />
              </button>
              <span className="text-xl font-bold tracking-tight text-white">Music</span>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {[
                { icon: Home, label: 'Home', href: '/' },
                { icon: Compass, label: 'Explore', href: '#' },
                { icon: Library, label: 'Library', href: '#' },
                { icon: CircleArrowUp, label: 'Upgrade', href: '#' },
            ].map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <item.icon className="w-6 h-6" />
                    <span className="font-medium text-base">{item.label}</span>
                </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5">
                <button className="flex items-center gap-3 text-sm font-medium text-[#a3a3a3] hover:text-white w-full px-4 py-3 hover:bg-white/5 rounded-lg transition">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-black text-xs">+</span>
                    </div>
                    <span>New playlist</span>
                </button>
          </div>
      </div>

      {/* Mobile Search Overlay */}
      <div 
        className={cn(
            "fixed inset-0 bg-[#030303] z-[60] flex flex-col transition-transform duration-300 ease-in-out md:hidden",
            isSearchOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
          <div className="flex items-center gap-2 p-2 border-b border-white/10 h-16">
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-white hover:bg-white/10 rounded-full"
              >
                  <ArrowLeft className="w-6 h-6" />
              </button>
              <form onSubmit={handleSubmit} className="flex-1 relative">
                  <input 
                    ref={inputRef}
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..." 
                    className="w-full h-10 bg-[#212121] rounded-full pl-4 pr-10 text-white placeholder-gray-500 focus:outline-none focus:bg-[#2a2a2a] transition-all font-medium"
                />
                 {query && (
                    <button 
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                 )}
              </form>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
               {/* Mobile Search Suggestions */}
               {query.length < 2 && searchHistory.length > 0 && (
                  <div className="mb-6">
                    <div className="px-2 pb-2 text-xs text-gray-400 font-semibold uppercase">Recent Searches</div>
                    {searchHistory.map((item, index) => (
                      <div
                        key={`mob-history-${index}`}
                        onClick={() => {
                            handleSuggestionClick(item);
                            setIsSearchOpen(false);
                        }}
                        className="px-2 py-3 border-b border-white/5 flex items-center justify-between active:bg-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <span className="text-white text-base">{item}</span>
                        </div>
                        <button
                          onClick={(e) => handleRemoveHistory(e, item)}
                          className="p-2 text-gray-500 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {query.length >= 2 && (
                  <div>
                    <div className="px-2 pb-2 text-xs text-gray-400 font-semibold uppercase">Suggestions</div>
                    {isLoadingSuggestions ? (
                      <div className="px-2 py-3 text-gray-400">Loading...</div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((item, index) => (
                        <div
                          key={`mob-suggestion-${index}`}
                          onClick={() => {
                              handleSuggestionClick(item);
                              setIsSearchOpen(false);
                          }}
                          className="px-2 py-4 border-b border-white/5 flex items-center gap-3 active:bg-white/10"
                        >
                          <Search className="w-5 h-5 text-gray-500" />
                          <span className="text-white text-base font-medium">{item}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-3 text-gray-400">No suggestions</div>
                    )}
                  </div>
                )}
          </div>
      </div>
    </>
  );
}
