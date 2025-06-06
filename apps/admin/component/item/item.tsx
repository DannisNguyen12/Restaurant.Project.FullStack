'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '../../context/ToastContext';

type ItemCardProps = {
  id: number;
  image: string;
  name: string;
  description: string;
  price: number;
  onDelete?: (id: number) => void; // Optional callback for when item is deleted
};

export default function Item({ 
  id,
  image, 
  name, 
  description, 
  price,
  onDelete
}: ItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();

  const handleDeleteItem = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    
    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }

      // Show success message
      addToast({
        type: 'success',
        title: 'Item Deleted',
        message: `${name} has been successfully deleted`
      });

      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete(id);
      }
      
    } catch (error) {
      console.error('Error deleting item:', error);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error instanceof Error ? error.message : 'Unable to delete item. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      data-testid={`item-card-${id}`}
      className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl border border-gray-100 h-full flex flex-col group"
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
            onClick={handleDeleteItem}
            disabled={isDeleting}
            className={`flex-1 max-w-[140px] px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium text-sm
            hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 
            focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-md ${
              isDeleting ? 'opacity-70 cursor-not-allowed scale-100' : ''
            }`}
            aria-label={`Delete ${name}`}
          >
            {isDeleting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            ) : (
              <>
                <svg className="h-4 w-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
