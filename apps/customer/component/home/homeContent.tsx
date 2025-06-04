'use client';
import { useState, useEffect, useRef } from 'react';
import ItemList from '../item/list';
import { SearchItem } from '../search/search';

type Item = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId?: number;
};

interface HomeContentProps {
  categoryId: number | null;
  searchResults: SearchItem[] | null;
  searchQuery: string | null;
}

export default function HomeContent({ categoryId, searchResults, searchQuery }: HomeContentProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('Our Menu');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Use useRef to avoid unnecessary API calls and track the last fetched category
  const fetchInProgress = useRef(false);
  const lastFetchedCategoryId = useRef<number | null>(null);

  // Fetch all items only once at component mount - but we'll keep this only for the initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      // Prevent duplicate fetches
      if (initialLoadComplete || fetchInProgress.current) return;
      
      fetchInProgress.current = true;
      setLoading(true);
      
      try {
        // Fetch all items for initial view
        const itemsResponse = await fetch('/api/items');
        if (!itemsResponse.ok) throw new Error('Failed to fetch items');
        const itemsData = await itemsResponse.json();
        
        // Process items
        const processedItems = itemsData.map((item: { 
          id: number; 
          name: string; 
          description?: string; 
          price: number; 
          image?: string; 
        }) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image || '/placeholder-food.jpg'
        }));
        
        // Set initial items
        setItems(processedItems);
        setInitialLoadComplete(true);
        
        console.log(`Loaded ${processedItems.length} items for initial view`);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load menu data');
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
      }
    };

    fetchInitialData();
  }, [initialLoadComplete]); // Include initialLoadComplete in dependency array

  // Fetch category items when category changes
  useEffect(() => {
    const fetchCategoryItems = async () => {
      // Don't fetch if we're still loading initial data or there's already a fetch in progress
      if (fetchInProgress.current || !initialLoadComplete) return;
      
      // If we have search results, use those instead of fetching by category
      if (searchResults && searchResults.length > 0) {
        setItems(searchResults.map(item => ({
          id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image || '/placeholder-food.jpg'
        })));
        setTitle(`Search Results: "${searchQuery}"`);
        return;
      }
      
      // If category ID is the same as the last one we fetched, don't fetch again
      if (categoryId === lastFetchedCategoryId.current) return;
      
      // Set loading state
      setLoading(true);
      fetchInProgress.current = true;
      setError(null); // Clear any previous errors
      
      try {
        console.log(`Fetching items for category ID: ${categoryId}`);
        
        // If categoryId is 0 or null, fetch all items
        if (!categoryId || categoryId === 0) {
          const response = await fetch('/api/items');
          if (!response.ok) throw new Error('Failed to fetch items');
          const data = await response.json();
          
          setItems(data.map((item: { 
            id: number; 
            name: string; 
            description?: string; 
            price: number; 
            image?: string; 
          }) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            image: item.image || '/placeholder-food.jpg'
          })));
          
          setTitle('Our Menu');
        } 
        // Otherwise fetch items for the specific category
        else {
          // First get the category name
          const categoryResponse = await fetch(`/api/categories/${categoryId}`);
          if (!categoryResponse.ok) throw new Error('Failed to fetch category');
          const categoryData = await categoryResponse.json();
          
          // Then get the items for this category
          const itemsResponse = await fetch(`/api/categories/${categoryId}/items`);
          if (!itemsResponse.ok) throw new Error('Failed to fetch category items');
          const itemsData = await itemsResponse.json();
          
          setItems(itemsData.map((item: { 
            id: number; 
            name: string; 
            description?: string; 
            price: number; 
            image?: string; 
          }) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            image: item.image || '/placeholder-food.jpg'
          })));
          
          setTitle(categoryData.name || 'Category Items');
          console.log(`Loaded ${itemsData.length} items for category: ${categoryData.name}`);
        }
        
        // Update the last fetched category ID
        lastFetchedCategoryId.current = categoryId;
        
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to load items');
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
      }
    };

    fetchCategoryItems();
  }, [categoryId, searchResults, searchQuery, initialLoadComplete]);

  return (
    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 inline-block text-left">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {searchQuery 
              ? "No results found" 
              : categoryId && categoryId > 0 
                ? `No items in this category` 
                : "No menu items available"
            }
          </h3>
          <p className="mt-1 text-gray-500">
            {searchQuery 
              ? "Try adjusting your search terms or browse our menu categories." 
              : categoryId && categoryId > 0
                ? "Try selecting a different category from the menu."
                : "Please check back later for our updated menu."
            }
          </p>
        </div>
      ) : (
        <ItemList 
          items={items} 
          title={title} 
          loading={loading}
        />
      )}
    </div>
  );
}
