'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ItemDetail from '../../../component/item/detail';
import Link from 'next/link';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = typeof params.id === 'string' ? parseInt(params.id) : undefined;
  
  if (!itemId || isNaN(itemId)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Item ID</h1>
          <p className="text-gray-600 mb-6">The item ID provided is not valid.</p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ItemDetail itemId={itemId} />
    </div>
  );
}
