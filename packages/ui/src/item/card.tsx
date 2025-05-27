// components/Card.tsx
import React from 'react';


interface MenuItem {
  id: number;
  name: string;
  description: string;
  price?: string;
  image: string;
}

interface MenuItemCardProps {
  item: MenuItem;
}

const Card: React.FC<MenuItemCardProps> = ({ item }) => {
  return (
    <div className="bg-white p-4 rounded shadow-md hover:shadow-lg transition duration-300">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-[200px] object-cover mb-4 rounded"
      />

        <a href={`/card/${item.id}`} className="text-xl font-bold hover:text-green-500 transition-colors">
          {item.name}
        </a>
  
      <p className="text-gray-600">{item.description}</p>
      {item.price && <p className="text-lg font-bold mt-2">{item.price}</p>}
    </div>
  );
};

export default Card;