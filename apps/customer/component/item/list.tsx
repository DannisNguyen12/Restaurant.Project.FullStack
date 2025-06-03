"use client";
import { useState } from 'react';
import Item from './item';
import Image from 'next/image';

// Define the item type
type Item = {
  id: string;
  image: string;
  name: string;
  description: string;
  price: number;
};

type ItemListProps = {
  items: Item[];
  title?: string;
  onItemAddedToCart?: (item: Item) => void;
  loading?: boolean;
};

export default function ItemList({ 
  items, 
  title = "Our Menu", 
  onItemAddedToCart,
  loading = false
}: ItemListProps) {
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const handleAddToCart = (item: Item) => {
    setCartItems(prev => [...prev, item.id]);
    setAddedItem(item.id);
    
    // Reset added item animation after 1s
    setTimeout(() => {
      setAddedItem(null);
    }, 1000);
    
    onItemAddedToCart?.(item);
  };

  // Skeleton loader for loading state
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="flex items-center justify-between mt-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return renderSkeleton();
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg my-8">
        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293H6a1 1 0 01-1-1v-4a1 1 0 011-1h9.586l-2.414-2.414a1 1 0 00-.707-.293H3a1 1 0 00-1 1v7a1 1 0 001 1h18a1 1 0 001-1v-5a1 1 0 00-1-1h-5z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-700 mt-4 mb-2">{title}</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          No items available at the moment. Please check back later or try a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      {title && (
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10 tracking-tight">
          {title}
        </h2>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className={`
              relative overflow-hidden rounded-xl bg-white shadow-md 
              ${addedItem === item.id ? 'ring-2 ring-green-500 ring-offset-2' : ''}
            `}>
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {addedItem === item.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-xl">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-indigo-600 transition-colors">
                  <a href="#" className="block truncate">{item.name}</a>
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[3rem]">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-gray-900">
                    ${item.price.toFixed(2)}
                  </span>
                  
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium 
                    hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                    focus:ring-offset-2 transition-all transform hover:scale-105 active:scale-95
                    disabled:opacity-70 disabled:cursor-not-allowed"
                    aria-label={`Add ${item.name} to cart`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}