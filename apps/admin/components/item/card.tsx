// components/Card.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300" data-testid="item-card">
      <div className="relative w-full h-[200px] mb-4">
        <Image
          src={item.image.trim()}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          style={{ objectFit: 'cover' }}
          className="rounded"
        />
      </div>

      <Link href={`/detail/${item.id}`} className="text-xl font-bold hover:text-green-500 transition-colors block mb-2">
        {item.name}
      </Link>

      <p className="text-gray-600 mb-2 line-clamp-2">{item.description}</p>
      {item.price && <p className="text-lg font-bold text-green-600 mt-2">{item.price}</p>}
      
      <div className="mt-4 flex justify-between">
        <Link href={`/detail/${item.id}`} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
          Edit
        </Link>
        {onDelete && (
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={() => {
              const confirmMessage = `Are you sure you want to delete "${item.name}"?\n\nThis action cannot be undone and will permanently remove this item from the menu.`;
              if (window.confirm(confirmMessage)) {
                onDelete(item.id);
              }
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;