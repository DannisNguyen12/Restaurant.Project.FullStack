'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define category interface
interface Category {
  id: number;
  name: string;
}

interface StaticSidebarProps {
  onCategorySelect?: (categoryId: number) => void;
  selectedCategoryId?: number | null;
}

export default function StaticSidebar({ onCategorySelect, selectedCategoryId }: StaticSidebarProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleOrderHistory = () => {
    try {
      // Navigate to order history page
      router.push('/order-history');
    } catch (error) {
      console.error('Error navigating to order history:', error);
    }
  };
  

  
  return (
    <div className="h-screen w-64 bg-gray-800 text-white flex flex-col">
      {/* Logo Section */}
      <div className="flex items-center p-6 h-16 border-b border-gray-700">
        <span className="ml-2 text-xl font-bold">Vietnamese Restaurant</span>
      </div>

      {/* Categories Section */}
      <nav className="flex-1 overflow-y-auto py-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="px-6 py-4 text-red-400">{error}</div>
        ) : (
          <ul className="px-2 space-y-1">
            <li>
              <button
                onClick={() => onCategorySelect?.(0)}
                className={`flex items-center w-full px-4 py-2 text-sm rounded-lg ${
                  selectedCategoryId === 0 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                aria-current={selectedCategoryId === 0 ? 'page' : undefined}
                data-testid="category-all-items"
              >
                <svg 
                  className="mr-2 h-5 w-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span>All Items</span>
                {selectedCategoryId === 0 && (
                  <span className="ml-auto flex items-center">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => onCategorySelect?.(category.id)}
                  className={`flex items-center w-full px-4 py-2 text-sm rounded-lg ${
                    selectedCategoryId === category.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  aria-current={selectedCategoryId === category.id ? 'page' : undefined}
                  data-testid={`category-${category.name.toLowerCase().replace(' ', '-')}`}
                >
                  <span>{category.name}</span>
                  {selectedCategoryId === category.id && (
                    <span className="ml-auto flex items-center">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>


      {/* Order History */}
      <div className="p-4 border-t border-gray-700">
          <button 
            type="button" 
            onClick={handleOrderHistory}
            className="w-full py-2 px-4 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg 
              className="mr-2 h-4 w-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Order History
          </button>
      </div>

    </div>
  );
}