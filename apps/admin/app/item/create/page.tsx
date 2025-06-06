'use client';
import CreateItemForm from '../../../component/item/create';

export default function CreateItemPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Item</h1>
          <p className="text-gray-600 mt-2">Add a new item to your restaurant menu</p>
        </div>
        <CreateItemForm />
      </div>
    </div>
  );
}
