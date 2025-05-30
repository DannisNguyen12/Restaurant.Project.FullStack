'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Card from './card';
import Toast from '../common/toast';

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
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  } | null>(null);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/items/${id}/delete`, { method: 'DELETE' });
      
      if (res.ok) {
        // Find the deleted item name for the notification
        const deletedItem = items.find(item => item.id === id);
        const itemName = deletedItem ? deletedItem.name : 'Item';
        
        // Update the UI by removing the deleted item
        setItems(items.filter(item => item.id !== id));
        
        // Show success toast
        setToast({
          message: `"${itemName}" has been successfully deleted`,
          type: 'success',
          visible: true
        });
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      
      // Show error toast
      setToast({
        message: error instanceof Error ? error.message : 'Failed to delete item',
        type: 'error',
        visible: true
      });
    }
  };

  return (
    <section className="py-12 px-6 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        {toast && toast.visible && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)}
          />
        )}
        
        <h3 className="text-xl font-bold text-green-500">DELICIOUS DISHES</h3>
        <h2 className="text-3xl font-bold mt-2">Experience the flavors of Vietnam</h2>
        
        {items.length === 0 ? (
          <div className="mt-8 p-8 bg-white rounded-lg text-center">
            <p className="text-gray-500 text-lg">No items found</p>
            <Link href="/create" className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              + Add New Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {items.map((item) => (
              <Card key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ListOfCard;