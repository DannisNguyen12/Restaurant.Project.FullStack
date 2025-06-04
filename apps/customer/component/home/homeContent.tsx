'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import ItemList from '../item/list';

type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId?: number;
};

interface SearchItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category: {
    name: string;
    id: number;
  };
}

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
  
  // Cache for all fetched items and category data
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [categoryNames, setCategoryNames] = useState<Record<number, string>>({});
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Use useRef to avoid unnecessary API calls when component re-renders
  const fetchInProgress = useRef(false);

  // Fetch all items only once at component mount
  useEffect(() => {
    const fetchAllData = async () => {
      // Prevent duplicate fetches
      if (initialLoadComplete || fetchInProgress.current) return;
      
      fetchInProgress.current = true;
      setLoading(true);
      
      try {
        // Fetch all items
        const itemsResponse = await fetch('/api/items');
        if (!itemsResponse.ok) throw new Error('Failed to fetch items');
        const itemsData = await itemsResponse.json();
        
        // Fetch all categories to get their names
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        
        // Map category IDs to names for easy lookup
        const categoryMap: Record<number, string> = {};
        categoriesData.forEach((cat: any) => {
          categoryMap[cat.id] = cat.name;
        });
        
        // Process and store all items
        const processedItems = itemsData.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image || '/placeholder-food.jpg',
          categoryId: item.categoryId
        }));
        
        // Store in state for later filtering
        setAllItems(processedItems);
        setCategoryNames(categoryMap);
        setInitialLoadComplete(true);
        
        console.log(`Loaded ${processedItems.length} items and ${Object.keys(categoryMap).length} categories`);
        
        // Also set as current items (will show all items initially)
        setItems(processedItems);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load menu data');
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
      }
    };

    fetchAllData();
  }, []); // Empty dependency array as we're using fetchInProgress.current to prevent duplicate fetches

  // Update displayed items when search results or category changes
  useEffect(() => {
    // If we have search results, use those
    if (searchResults && searchResults.length > 0) {
      setItems(searchResults.map(item => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || '/placeholder-food.jpg'
      })));
      setTitle(`Search Results: "${searchQuery}"`);
      return;
    }
    
    // If we're still loading the initial data, don't do anything
    if (!initialLoadComplete) return;
    
    // Client-side filtering based on category ID
    if (categoryId && categoryId > 0) {
      console.log(`Filtering for category ${categoryId}: ${categoryNames[categoryId]}`);
      const filteredItems = allItems.filter(item => item.categoryId === categoryId);
      console.log(`Found ${filteredItems.length} items in category ${categoryId}`);
      setItems(filteredItems);
      setTitle(categoryNames[categoryId] || 'Category Items');
    } 
    // Otherwise show all items
    else {
      setItems(allItems);
      setTitle('Our Menu');
    }
  }, [categoryId, searchResults, searchQuery, initialLoadComplete, allItems, categoryNames]);

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
      ) : items.length === 0 && searchQuery ? (
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search terms or browse our menu categories.</p>
        </div>
      ) : (
        <ItemList 
          items={items} 
          title={title} 
          loading={loading} 
          onItemAddedToCart={(item) => console.log('Added to cart:', item)}
        />
      )}
    </div>
  );
}
