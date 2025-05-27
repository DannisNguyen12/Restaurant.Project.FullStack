import React from 'react';

// Define TypeScript interface for MenuItem
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  fullDescription: string;
  ingredients: string[];
  servingTips: string[];
  recommendations: string[];
}

const MenuItemDetail: React.FC<{ item: MenuItem }> = ({ item }) => {
  return (
    <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      {/* Dish Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/2">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-[300px] object-cover rounded-lg"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold text-black">{item.name}</h1>
          <p className="text-green-600 text-xl mt-2">{item.price}</p>
          <p className="mt-4 text-gray-600">{item.description}</p>
        </div>
      </div>

      {/* Full Description */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-black border-b pb-2">About This Dish</h2>
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
        <h2 className="text-2xl font-semibold text-black border-b pb-2">Serving Suggestions</h2>
        <ul className="list-disc pl-5 mt-4 space-y-1 text-gray-700">
          {item.servingTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </section>

      {/* Recommendations */}
      <section>
        <h2 className="text-2xl font-semibold text-black border-b pb-2">Pair It With</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {item.recommendations.map((recommendation, index) => (
            <div key={index} className="bg-gray-100 p-3 rounded">
              {recommendation}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MenuItemDetail;