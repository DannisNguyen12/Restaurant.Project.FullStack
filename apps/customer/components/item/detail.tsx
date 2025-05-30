import React from "react";
import Image from "next/image";

// Define TypeScript interfaces for Item and Category
interface Category {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
  description?: string;
  fullDescription?: string;
  price: number;
  image?: string;
  ingredients: string[];
  servingTips: string[];
  recommendations: string[];
  categoryId?: number | null;
  category?: Category | null;
  createdAt: string;
  likes?: any[];
}

const MenuItemDetail: React.FC<{ item: Item }> = ({ item }) => {
  return (
    <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      {/* Dish Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/2">
          {item.image && (
            <Image
              src={item.image.trim()}
              alt={item.name}
              width={400}
              height={300}
              className="w-full h-[300px] object-cover rounded-lg"
            />
          )}
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold text-black">{item.name}</h1>
          <p className="text-green-600 text-xl mt-2">
            {typeof item.price === "number"
              ? item.price.toLocaleString("en-US", { style: "currency", currency: "USD" })
              : item.price}
          </p>
          {item.category && (
            <p className="mt-2 text-sm text-gray-500">Category: {item.category.name}</p>
          )}
          <p className="mt-4 text-gray-600">{item.description}</p>
        </div>
      </div>

      {/* Full Description */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-black border-b pb-2">Full Description</h2>
        <p className="mt-4 text-gray-700">{item.fullDescription}</p>
      </section>

      {/* Ingredients */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-black border-b pb-2">Ingredients</h2>
        <ul className="list-disc pl-5 mt-4 space-y-1 text-gray-700">
          {item.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </section>

      {/* Serving Tips */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-black border-b pb-2">Serving Tips</h2>
        <ul className="list-disc pl-5 mt-4 space-y-1 text-gray-700">
          {item.servingTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </section>

      {/* Recommendations */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-black border-b pb-2">Recommendations</h2>
        <ul className="list-disc pl-5 mt-4 space-y-1 text-gray-700">
          {item.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </section>

      {/* Additional Info */}
      <div className="text-xs text-gray-400 mt-2">Created: {new Date(item.createdAt).toLocaleString()}</div>
      {item.likes && (
        <div className="text-xs text-gray-500 mt-1">Likes: {item.likes.length}</div>
      )}
    </div>
  );
};

export default MenuItemDetail;