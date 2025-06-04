'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSignOut = async () => {
    try {
      // Call logout API to clear the cookie server-side
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        router.push('/');
        
        console.log('User signed out successfully');
      } else {
        console.error('Failed to sign out');
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };
  
  const handleCategoryClick = (categoryId: number, e: React.MouseEvent) => {
    if (onCategorySelect) {
      e.preventDefault();
      onCategorySelect(categoryId);
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
              >
                <span>All Items</span>
              </button>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.id}`}
                  onClick={(e) => handleCategoryClick(category.id, e)}
                  className={`flex items-center w-full px-4 py-2 text-sm rounded-lg ${
                    selectedCategoryId === category.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span>{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Auth Buttons */}
      <div className="p-4 border-t border-gray-700">
          <button 
            type="button" 
            onClick={handleSignOut}
            className="w-full py-2 px-4 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Sign Out
          </button>

          <button 
            type="button" 
            onClick={handleSignIn}
            className="w-full py-2 px-4 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Sign In
          </button>
      </div>
    </div>
  );
}