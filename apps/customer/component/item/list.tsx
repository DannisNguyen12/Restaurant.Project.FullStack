"use client";
import Item from './item';

// Define the item type
type ItemType = {
  id: number;
  image: string;
  name: string;
  description: string;
  price: number;
};

type ItemListProps = {
  items: ItemType[];
  title?: string;
  loading?: boolean;
};

export default function ItemList({ 
  items, 
  title = "Our Menu", 
  loading = false
}: ItemListProps) {

  // Intelligent responsive grid that prioritizes content readability
  // Uses CSS Grid auto-fit with minimum width constraints
  const gridClass = "grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))]";
  const gapClass = "gap-6 lg:gap-8 xl:gap-10";

  // Skeleton loader for loading state
  const renderSkeleton = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className={`grid ${gridClass} ${gapClass}`}>
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="h-48 sm:h-52 md:h-56 lg:h-64 bg-gray-200"></div>
            <div className="p-4 sm:p-5 md:p-6">
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6 mb-4 sm:mb-6"></div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="h-6 sm:h-7 bg-gray-200 rounded w-1/3"></div>
                <div className="h-9 sm:h-10 bg-gray-200 rounded w-full sm:w-2/5"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return renderSkeleton();
  }

  // Add null/undefined check before accessing length
  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 lg:py-16">
        <div className="text-center py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl lg:rounded-2xl my-6 sm:my-8 lg:my-12 border border-gray-200">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto text-gray-400 mb-4 sm:mb-6 lg:mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293H6a1 1 0 01-1-1v-4a1 1 0 011-1h9.586l-2.414-2.414a1 1 0 00-.707-.293H3a1 1 0 00-1 1v7a1 1 0 001 1h18a1 1 0 001-1v-5a1 1 0 00-1-1h-5z" />
          </svg>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-700 mb-3 sm:mb-4 lg:mb-6">{title}</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-base sm:text-lg lg:text-xl leading-relaxed px-4">
            No items available at the moment. Please check back later or try a different category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      {title && (
        <div className="text-center mb-8 sm:mb-12 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 tracking-tight px-4">
            {title}
          </h2>
          <div className="w-16 sm:w-24 lg:w-32 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className={`grid ${gridClass} ${gapClass}`}>
          {items.map((item) => (
            <div 
              key={item.id} 
              className="transform transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 lg:hover:-translate-y-3 hover:shadow-lg sm:hover:shadow-xl lg:hover:shadow-2xl"
            >
              <Item
                id={item.id}
                image={item.image}
                name={item.name}
                description={item.description}
                price={item.price}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}