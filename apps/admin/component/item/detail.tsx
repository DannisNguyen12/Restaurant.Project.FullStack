'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from '../../context/ToastContext';

// Item data structure based on your Prisma model
type Item = {
  id: number;
  name: string;
  fullDescription: string;
  price: number;
  image: string | null;
  ingredients?: string[] | string | null; 
  servingTips?: string[] | string | null; 
  recommendations?: string[] | string | null; 
  category: {
    id: number;
    name: string;
  } | null;
  likes?: {
    id: number;
  }[];
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Category = {
  id: number;
  name: string;
};

type ItemDetailProps = {
  itemId: number;
};

export default function ItemDetail({ itemId }: ItemDetailProps) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { addToast } = useToast();

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    fullDescription: '',
    price: 0,
    image: '',
    ingredients: [] as string[],
    servingTips: [] as string[],
    recommendations: [] as string[],
    categoryId: null as number | null
  });

  // Helper function to safely parse JSON fields that might be strings or already arrays
  const getJsonArray = (fieldValue: unknown): string[] => {
    if (Array.isArray(fieldValue)) {
      // Ensure all items in the array are strings
      return fieldValue.every(item => typeof item === 'string') ? fieldValue : [];
    }
    if (typeof fieldValue === 'string') {
      try {
        const parsed = JSON.parse(fieldValue);
        // Ensure the parsed result is an array of strings
        return Array.isArray(parsed) && parsed.every(item => typeof item === 'string') ? parsed : [];
      } catch (e) {
        console.error('Failed to parse JSON string:', e);
        return [];
      }
    }
    return [];
  };

  // Fetch item data from API
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/items/${itemId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Item not found');
          }
          throw new Error('Failed to fetch item details');
        }
        
        const data = await response.json();
        setItem(data);
        
        // Populate edit form with current data
        setEditForm({
          name: data.name || '',
          fullDescription: data.fullDescription || '',
          price: data.price || 0,
          image: data.image || '',
          ingredients: getJsonArray(data.ingredients),
          servingTips: getJsonArray(data.servingTips),
          recommendations: getJsonArray(data.recommendations),
          categoryId: data.category?.id || null
        });
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const categoriesData = await response.json();
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    if (itemId) {
      fetchItemDetails();
      fetchCategories();
    }
  }, [itemId]);

  if (loading) {
    return (
      <div className="animate-pulse p-8">
        <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-8"></div>
        <div className="h-12 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  const ingredients: string[] = item ? getJsonArray(item.ingredients) : [];
  const servingTips: string[] = item ? getJsonArray(item.servingTips) : [];

  // Toggle edit mode
  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to original values when cancelling
      if (item) {
        setEditForm({
          name: item.name || '',
          fullDescription: item.fullDescription || '',
          price: item.price || 0,
          image: item.image || '',
          ingredients: getJsonArray(item.ingredients),
          servingTips: getJsonArray(item.servingTips),
          recommendations: getJsonArray(item.recommendations),
          categoryId: item.category?.id || null
        });
      }
    }
    setIsEditing(!isEditing);
  };

  // Save changes
  const handleSave = async () => {
    if (!item) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item');
      }

      const updatedItem = await response.json();
      setItem(updatedItem);
      setIsEditing(false);
      
      addToast({
        type: 'success',
        title: 'Item Updated',
        message: `${editForm.name} has been successfully updated`
      });
    } catch (error) {
      console.error('Error saving item:', error);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: error instanceof Error ? error.message : 'Unable to save changes. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | string[] | null) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array field changes (ingredients, servingTips, recommendations)
  const handleArrayFieldChange = (field: 'ingredients' | 'servingTips' | 'recommendations', value: string) => {
    const array = value.split('\n').map(item => item.trim()).filter(item => item.length > 0);
    handleInputChange(field, array);
  };

  // Delete item
  const handleDelete = async () => {
    if (!item) return;

    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }

      addToast({
        type: 'success',
        title: 'Item Deleted',
        message: `${item.name} has been successfully deleted`
      });

      // Redirect or navigate back after successful deletion
      // You might want to use router.push('/items') or similar
      window.history.back();
      
    } catch (error) {
      console.error('Error deleting item:', error);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error instanceof Error ? error.message : 'Unable to delete item. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Image Section */}
        <div className="md:flex">
          <div className="md:w-1/2">
            <Image
              src={item?.image || '/placeholder-image.jpg'}
              alt={item?.name || 'Item image'}
              width={600}
              height={400}
              className="w-full h-96 md:h-full object-cover"
            />
          </div>
          
          {/* Content Section */}
          <div className="p-8 md:w-1/2">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 mr-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-3xl font-bold text-gray-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent w-full"
                    placeholder="Item name"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900">{item?.name}</h1>
                )}
                <p className="text-sm text-gray-500 mt-1">ID: {item?.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <select
                    value={editForm.categoryId || ''}
                    onChange={(e) => handleInputChange('categoryId', e.target.value ? parseInt(e.target.value) : null)}
                    className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {item?.category?.name || "Uncategorized"}
                  </div>
                )}
                <button
                  onClick={handleEditToggle}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isEditing 
                      ? 'bg-gray-500 text-white hover:bg-gray-600' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
            </div>

            {/* Price and Image URL */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className="text-2xl font-semibold text-gray-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-gray-900">
                    {item ? `$${item.price.toFixed(2)}` : ''}
                  </span>
                )}
              </div>
              
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={editForm.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="flex space-x-8" aria-label="Tabs">
                {['description', 'ingredients', 'serving', 'recommendations'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 text-sm font-medium border-b-2 capitalize ${
                      activeTab === tab 
                        ? 'border-indigo-500 text-indigo-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab === 'serving' ? 'Serving Tips' : tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6 min-h-[200px]">
              {activeTab === 'description' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Description</h2>
                  <div className="max-h-[200px] overflow-y-auto">
                    {isEditing ? (
                      <textarea
                        value={editForm.fullDescription}
                        onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Enter item description..."
                      />
                    ) : (
                      <p className="text-gray-700">{item?.fullDescription}</p>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'ingredients' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Ingredients</h2>
                  <div className="max-h-[200px] overflow-y-auto">
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editForm.ingredients.join('\n')}
                          onChange={(e) => handleArrayFieldChange('ingredients', e.target.value)}
                          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          placeholder="Enter each ingredient on a new line..."
                        />
                        <p className="text-sm text-gray-500 mt-1">Enter each ingredient on a separate line</p>
                      </div>
                    ) : (
                      <>
                        {ingredients.length > 0 ? (
                          <ul className="space-y-2">
                            {ingredients.map((ingredient, index) => (
                              <li key={index} className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                {ingredient}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No ingredients information available.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'serving' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Serving Tips</h2>
                  <div className="max-h-[200px] overflow-y-auto">
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editForm.servingTips.join('\n')}
                          onChange={(e) => handleArrayFieldChange('servingTips', e.target.value)}
                          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          placeholder="Enter each serving tip on a new line..."
                        />
                        <p className="text-sm text-gray-500 mt-1">Enter each serving tip on a separate line</p>
                      </div>
                    ) : (
                      <>
                        {servingTips.length > 0 ? (
                          <ul className="space-y-2">
                            {servingTips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No serving tips available.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'recommendations' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h2>
                  <div className="max-h-[200px] overflow-y-auto">
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editForm.recommendations.join('\n')}
                          onChange={(e) => handleArrayFieldChange('recommendations', e.target.value)}
                          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          placeholder="Enter each recommendation on a new line..."
                        />
                        <p className="text-sm text-gray-500 mt-1">Enter each recommendation on a separate line</p>
                      </div>
                    ) : (
                      <>
                        {getJsonArray(item?.recommendations).length > 0 ? (
                          <ul className="space-y-2">
                            {getJsonArray(item?.recommendations).map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <svg className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No recommendations available.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-gray-600">{item?.likes?.length ?? 0} likes</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2h-4a2 2 0 012-2z" />
                  </svg>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`flex-1 py-3 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Item
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Additional Info */}
        <div className="p-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-gray-200">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Created</h3>
            <p className="text-gray-600">
              {item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Last Updated</h3>
            <p className="text-gray-600">
              {item?.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
