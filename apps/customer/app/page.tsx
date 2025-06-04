'use client';
import { useState, useCallback } from 'react';
import StaticSidebar from '../component/leftmenu/leftMenu';
import TopSearchBar from '../component/search/search';
import HomeContent from '../component/home/homeContent';
import CartSummary from '../component/cart/cart';

// Import SearchItem interface from the component that defines it
import { SearchItem } from '../component/search/search';

export default function HomePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(0); // 0 means all items
  const [searchResults, setSearchResults] = useState<SearchItem[] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-gray-100">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className="relative bg-white w-80 max-w-sm shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
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
        {/* Top Search Bar */}
        <TopSearchBar 
          onSearch={handleSearch}
          onItemsFound={handleItemsFound}
        />
        
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
          
          {/* Cart Sidebar - Fully responsive and adaptive */}
          <aside className="w-full sm:max-w-none lg:w-80 xl:w-96 2xl:w-[400px] lg:max-w-md xl:max-w-lg 2xl:max-w-xl p-2 sm:p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white lg:bg-transparent overflow-y-auto flex-shrink-0">
            <CartSummary />
          </aside>
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
