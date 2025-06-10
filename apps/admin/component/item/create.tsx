'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '../../context/ToastContext';

type Category = {
  id: number;
  name: string;
};

type CreateItemFormData = {
  name: string;
  fullDescription: string;
  price: number;
  image: string;
  ingredients: string[];
  servingTips: string[];
  recommendations: string[];
  categoryId: number | null;
};

export default function CreateItemForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Use separate text state for array fields to allow normal text input
  const [formData, setFormData] = useState({
    name: '',
    fullDescription: '',
    price: 0,
    image: '',
    ingredientsText: '',
    servingTipsText: '',
    recommendationsText: '',
    categoryId: null as number | null
  });

  // Fetch categories for dropdown
  useEffect(() => {
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

    fetchCategories();
  }, []);

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Convert text fields to arrays for API submission
  const getArrayFromText = (text: string): string[] => {
    return text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Item name is required'
      });
      return;
    }

    if (formData.price <= 0) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Price must be greater than 0'
      });
      return;
    }

    setLoading(true);
    try {
      // Convert text fields to arrays for API submission
      const submitData: CreateItemFormData = {
        name: formData.name,
        fullDescription: formData.fullDescription,
        price: formData.price,
        image: formData.image,
        ingredients: getArrayFromText(formData.ingredientsText),
        servingTips: getArrayFromText(formData.servingTipsText),
        recommendations: getArrayFromText(formData.recommendationsText),
        categoryId: formData.categoryId
      };

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create item');
      }

      const newItem = await response.json();
      
      addToast({
        type: 'success',
        title: 'Item Created',
        message: `${submitData.name} has been successfully created`
      });

      // Redirect to the new item's detail page
      router.push(`/item/${newItem.id}`);
      
    } catch (error) {
      console.error('Error creating item:', error);
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: error instanceof Error ? error.message : 'Unable to create item. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel - go back to home
  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <form onSubmit={handleSubmit} className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              {/* Item Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter item name"
                  required
                />
              </div>

              {/* Price */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) => handleInputChange('categoryId', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Preview
                  </label>
                  <div className="relative w-full h-48 border border-gray-300 rounded-md overflow-hidden">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                      onError={() => {
                        // Handle image loading error
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Information</h2>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.fullDescription}
                onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Enter item description..."
              />
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients
              </label>
              <textarea
                value={formData.ingredientsText}
                onChange={(e) => handleInputChange('ingredientsText', e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Enter each ingredient on a new line..."
              />
              <p className="text-sm text-gray-500 mt-1">Enter each ingredient on a separate line</p>
            </div>

            {/* Serving Tips */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serving Tips
              </label>
              <textarea
                value={formData.servingTipsText}
                onChange={(e) => handleInputChange('servingTipsText', e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Enter each serving tip on a new line..."
              />
              <p className="text-sm text-gray-500 mt-1">Enter each serving tip on a separate line</p>
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendations
              </label>
              <textarea
                value={formData.recommendationsText}
                onChange={(e) => handleInputChange('recommendationsText', e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Enter each recommendation on a new line..."
              />
              <p className="text-sm text-gray-500 mt-1">Enter each recommendation on a separate line</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              'Create Item'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
