'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import StaticSidebar from '../component/leftmenu/leftMenu';
import TopSearchBar from '../component/search/search';
import HomeContent from '../component/home/homeContent';

// Import SearchItem interface from the component that defines it
import { SearchItem } from '../component/search/search';

export default function HomePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(0); // 0 means all items
  const [searchResults, setSearchResults] = useState<SearchItem[] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAuthenticated = status === 'authenticated';
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoize these callbacks to prevent recreating them on every render
  const handleCategorySelect = useCallback((categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSearchResults(null);
    setSearchQuery(null);
    setIsMobileMenuOpen(false); // Close mobile menu when category is selected
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Category selection will be cleared by the searchResults being set
  }, []);

  const handleItemsFound = useCallback((items: SearchItem[]) => {
    setSearchResults(items);
    // This will override category selection in the HomeContent component
  }, []);

  return (
    <div data-testid="admin-home" className="flex flex-col lg:flex-row h-screen overflow-hidden bg-gray-100">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className="relative bg-white max-w-sm shadow-xl">
            <div className="overflow-y-auto">
              <StaticSidebar 
                onCategorySelect={handleCategorySelect} 
                selectedCategoryId={selectedCategoryId}
              />
            </div>
          </div>
        </div>
      )}

      {/* Left Menu - Hidden on mobile, overlay on tablet, sidebar on desktop */}
      <div className="hidden lg:block lg:w-64 flex-shrink-0">
        <StaticSidebar 
          onCategorySelect={handleCategorySelect} 
          selectedCategoryId={selectedCategoryId}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Search Bar and User Menu */}
        <div className="flex items-center justify-between gap-4 p-2 sm:p-4 lg:p-6 bg-white shadow-sm border-b">
          <div className="flex-1">
            <TopSearchBar 
              onSearch={handleSearch}
              onItemsFound={handleItemsFound}
            />
          </div>
          
          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.email}
                </span>
                <svg 
                  className="w-4 h-4 text-gray-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      Signed in as {user?.email}
                    </div>
                    <button
                      onClick={async () => {
                        await signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <a
                href="/signin"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
        
        {/* Content Area with Cart */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
            <HomeContent 
              categoryId={selectedCategoryId} 
              searchResults={searchResults}
              searchQuery={searchQuery}
            />
          </main>
          
        </div>
      </div>

      {/* Mobile Menu Button - Show on mobile/tablet */}
      <div className="lg:hidden fixed bottom-4 left-4 z-40">
        <button 
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
