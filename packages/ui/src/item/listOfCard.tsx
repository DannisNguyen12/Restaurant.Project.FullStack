'use client';
import React, { useState } from 'react';
import Card from './card';

interface ListOfCardProps {
  items: Array<{
    id: number;
    name: string;
    description: string;
    price?: string;
    image: string;
  }>;
}

const ListOfCard: React.FC<ListOfCardProps> = ({ items: initialItems }) => {
  const [items, setItems] = useState(initialItems);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/items/${id}/delete`, { method: 'DELETE' });
    if (res.ok) {
      setItems(items.filter(item => item.id !== id));
    } else {
      alert('Failed to delete item');
    }
  };

  return (
    <section className="py-12 px-6 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-xl font-bold text-green-500">DELICIOUS DISHES</h3>
        <h2 className="text-3xl font-bold mt-2">Experience the flavors of Vietnam</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {items.map((item) => (
            <Card key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListOfCard;