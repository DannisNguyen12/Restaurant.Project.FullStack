'use client';
import { useState } from 'react';
import Image from 'next/image';

type ItemCardProps = {
  image: string;
  name: string;
  description: string;
  price: number;
  onAddToCart?: () => void;
};

export default function Item({ 
  image, 
  name, 
  description, 
  price, 
  onAddToCart 
}: ItemCardProps) {
  const [isLoading, setIsLoading] = useState(false);

const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call or cart update
    setTimeout(() => {
        setIsLoading(false);
        onAddToCart?.();
    }, 500);
};

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg"
    >
      {/* Image */}
      <div className="h-48 w-full bg-gray-200 relative">
        {image ? (
          <Image 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg 
              className="h-12 w-12" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-lg font-semibold mb-2">
          <a 
            href="#" 
            className="text-gray-900 hover:text-indigo-600 transition-colors"
            aria-label={`View details for ${name}`}
          >
            {name}
          </a>
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>
        
        {/* Price and Button */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>
          
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md bg-indigo-600 text-white font-medium 
            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
            focus:ring-offset-2 transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            aria-label={`Add ${name} to cart`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </span>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Example usage:
/*
<ItemCard
  image="https://picsum.photos/300/200?random=1"
  name="Premium Headphones"
  description="High-quality wireless headphones with noise cancellation and 20-hour battery life."
  price={199.99}
  onAddToCart={() => console.log('Item added to cart!')}
/>
*/