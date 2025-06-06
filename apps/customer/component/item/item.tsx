'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

type ItemCardProps = {
  id: number;
  image: string;
  name: string;
  description: string;
  price: number;
};

export default function Item({ 
  id,
  image, 
  name, 
  description, 
  price
}: ItemCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, isItemInCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    setIsLoading(true);
    
    // Check if item is already in cart to determine message
    const itemAlreadyInCart = isItemInCart(id);
    
    // Add item to cart using context
    try {
      addToCart({
        id,
        name,
        description,
        price,
        image
      });
      
      // Show success feedback
      addToast({
        type: 'success',
        title: itemAlreadyInCart ? 'Quantity Updated' : 'Added to Cart',
        message: itemAlreadyInCart 
          ? `${name} quantity increased in your cart`
          : `${name} has been added to your cart`
      });
      
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Unable to add item to cart. Please try again.'
      });
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl border border-gray-100 h-full flex flex-col group"
      data-testid={`item-card-${id}`}
    >
      {/* Image */}
      <div className="aspect-[4/3] w-full bg-gray-200 relative overflow-hidden">
        {image ? (
          <Image 
            src={image} 
            alt={name}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
            <svg 
              className="h-16 w-16" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1.5" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Name */}
        <h3 className="text-xl font-bold mb-2 leading-tight">
          <Link 
            href={`/item/${id}`}
            className="text-gray-900 hover:text-indigo-600 transition-colors duration-200 line-clamp-2"
            aria-label={`View details for ${name}`}
          >
            {name}
          </Link>
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-grow">
          <span className="line-clamp-3">
            {description}
          </span>
        </p>
        
        {/* Price and Button */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <span className="text-2xl font-bold text-indigo-600 flex-shrink-0">
            ${price.toFixed(2)}
          </span>
          
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className={`flex-1 max-w-[140px] px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm
            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
            focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-md ${
              isLoading ? 'opacity-70 cursor-not-allowed scale-100' : ''
            }`}
            aria-label={`Add ${name} to cart`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
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
