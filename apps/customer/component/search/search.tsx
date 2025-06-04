'use client';
import { useState, useEffect, useRef } from 'react';

interface SearchItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category: {
    name: string;
  };
}

interface TopSearchBarProps {
  onSearch?: (query: string) => void;
  onItemsFound?: (items: SearchItem[]) => void;
}

export default function TopSearchBar({ onSearch, onItemsFound }: TopSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  
  // Use refs to keep callback references stable
  const onSearchRef = useRef(onSearch);
  const onItemsFoundRef = useRef(onItemsFound);
  
  // Update refs when props change
  useEffect(() => {
    onSearchRef.current = onSearch;
    onItemsFoundRef.current = onItemsFound;
  }, [onSearch, onItemsFound]);

  // Debounce search
  useEffect(() => {
    // Skip if query hasn't changed or is too short
    if (searchQuery === lastQuery || searchQuery.length < 2) {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        onItemsFoundRef.current?.([]);
      }
      return;
    }
    
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        setSearchResults(data.items || []);
        setShowDropdown(true);
        onItemsFoundRef.current?.(data.items || []);
        setLastQuery(searchQuery);
      } catch (error) {
        console.error('Error searching:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // Increased debounce time to reduce API calls
    
    return () => clearTimeout(timer);
  }, [searchQuery, lastQuery]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (searchQuery && searchQuery.length >= 2) {
      // Directly call onSearch
      onSearchRef.current?.(searchQuery);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  className="h-5 w-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for menu items..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowDropdown(false);
                    setLastQuery(null);
                    onItemsFoundRef.current?.([]);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg 
                    className="h-5 w-5 text-gray-400 hover:text-gray-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
              
              {/* Search results dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-10 w-full bg-white rounded-md shadow-lg border border-gray-200 z-20 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    {isLoading ? (
                      <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : (
                      searchResults.slice(0, 5).map((item) => (
                        <div 
                          key={item.id}
                          className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center"
                          onClick={() => {
                            setShowDropdown(false);
                            onSearchRef.current?.(item.name);
                          }}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500 truncate">{item.description}</p>
                          </div>
                          <span className="text-indigo-600 font-medium text-sm">${item.price.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                    
                    {searchResults.length > 5 && (
                      <div className="p-2 text-center border-t border-gray-100">
                        <button 
                          className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
                          onClick={() => {
                            onSearch?.(searchQuery);
                            setShowDropdown(false);
                          }}
                        >
                          See all {searchResults.length} results
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}