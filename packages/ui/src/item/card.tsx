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
  onDelete?: (id: number) => void;
}

const Card: React.FC<MenuItemCardProps> = ({ item, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded shadow-md hover:shadow-lg transition duration-300">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-[200px] object-cover mb-4 rounded"
      />

      <a href={`/detail/${item.id}`} className="text-xl font-bold hover:text-green-500 transition-colors">
        {item.name}
      </a>

      <p className="text-gray-600">{item.description}</p>
      {item.price && <p className="text-lg font-bold mt-2">{item.price}</p>}
      {onDelete && (
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          onClick={() => onDelete(item.id)}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default Card;