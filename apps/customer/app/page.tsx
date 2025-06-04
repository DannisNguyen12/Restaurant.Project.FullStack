'use client';
import { useState, useCallback } from 'react';
import StaticSidebar from '../component/leftmenu/leftMenu';
import TopSearchBar from '../component/search/search';
import HomeContent from '../component/home/homeContent';

// Import SearchItem interface from the component that defines it
import { SearchItem } from '../component/search/search';

export default function HomePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(0); // 0 means all items
  const [searchResults, setSearchResults] = useState<SearchItem[] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  // Memoize these callbacks to prevent recreating them on every render
  const handleCategorySelect = useCallback((categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSearchResults(null);
    setSearchQuery(null);
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
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Left Menu */}
      <div className="w-64 flex-shrink-0">
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
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4">
          <HomeContent 
            categoryId={selectedCategoryId} 
            searchResults={searchResults}
            searchQuery={searchQuery}
          />
        </main>
      </div>
    </div>
  );
}
