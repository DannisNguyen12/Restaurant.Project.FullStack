"use client";
import React from 'react';
import Image from 'next/image';

interface ItemPreviewProps {
  item: {
    name: string;
    description: string;
    fullDescription: string;
    price: number | string;
    image: string;
    ingredients: string[];
    servingTips: string[];
    recommendations: string[];
  };
}

const ItemPreview: React.FC<ItemPreviewProps> = ({ item }) => {
  // Ensure price is formatted properly
  const formattedPrice = typeof item.price === 'number'
    ? item.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : item.price;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative w-full h-[300px]">
        <Image
          src={item.image.trim()}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-800">{item.name}</h1>
          <p className="text-xl font-bold text-green-600">{formattedPrice}</p>
        </div>
        
        <p className="mt-2 text-gray-600">{item.description}</p>
        
        {item.fullDescription && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-800">Description</h2>
            <p className="mt-1 text-gray-600">{item.fullDescription}</p>
          </div>
        )}
        
        {item.ingredients.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-800">Ingredients</h2>
            <ul className="mt-1 list-disc pl-5">
              {item.ingredients.map((ingredient, i) => (
                <li key={i} className="text-gray-600">{ingredient}</li>
              ))}
            </ul>
          </div>
        )}
        
        {item.servingTips.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-800">Serving Tips</h2>
            <ul className="mt-1 list-disc pl-5">
              {item.servingTips.map((tip, i) => (
                <li key={i} className="text-gray-600">{tip}</li>
              ))}
            </ul>
          </div>
        )}
        
        {item.recommendations.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-800">Recommendations</h2>
            <ul className="mt-1 list-disc pl-5">
              {item.recommendations.map((rec, i) => (
                <li key={i} className="text-gray-600">{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemPreview;
