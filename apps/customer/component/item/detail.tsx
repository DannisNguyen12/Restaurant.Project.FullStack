'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
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
  orderItems?: {
    quantity: number;
  }[];
  likes?: {
    id: number;
  }[];
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ItemDetailProps = {
  itemId: number;
};

export default function ItemDetail({ itemId }: ItemDetailProps) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // Cart and like functionality
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  
  // Like state
  const [likeData, setLikeData] = useState<{
    userHasLiked: boolean;
    likes: number;
  }>({
    userHasLiked: false,
    likes: 0
  });
  const [likeLoading, setLikeLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  
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
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItemDetails();
    }
  }, [itemId]);

  // Fetch like data
  useEffect(() => {
    const fetchLikeData = async () => {
      try {
        const response = await fetch(`/api/items/${itemId}/like`);
        if (response.ok) {
          const data = await response.json();
          setLikeData({
            userHasLiked: data.userHasLiked || false,
            likes: data.likes || 0
          });
        }
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };

    if (itemId) {
      fetchLikeData();
    }
  }, [itemId]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!item) return;
    
    setCartLoading(true);
    try {
      addToCart({
        id: item.id,
        name: item.name,
        description: item.fullDescription || '',
        price: item.price,
        image: item.image || ''
      }, quantity);
      
      addToast({
        type: 'success',
        title: 'Added to cart!',
        message: `${quantity} x ${item.name} added to your cart`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add item to cart'
      });
    } finally {
      setCartLoading(false);
    }
  };

  // Handle like/unlike
  const handleLike = async () => {
    if (!session?.user) {
      addToast({
        type: 'warning',
        title: 'Sign in required',
        message: 'Please sign in to like items'
      });
      return;
    }

    setLikeLoading(true);
    try {
      // If user already liked, remove it (toggle)
      if (likeData.userHasLiked) {
        const response = await fetch(`/api/items/${itemId}/like`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const data = await response.json();
          setLikeData({
            userHasLiked: data.liked || false,
            likes: data.likeCount || 0
          });
          addToast({
            type: 'info',
            title: 'Like removed',
            message: 'Your like has been removed'
          });
        }
      } else {
        // Add like
        const response = await fetch(`/api/items/${itemId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: 'LIKE' }),
        });

        if (response.ok) {
          const data = await response.json();
          setLikeData({
            userHasLiked: data.liked || false,
            likes: data.likeCount || 0
          });
          
          addToast({
            type: 'success',
            title: 'Liked!',
            message: 'You liked this item'
          });
        }
      }
    } catch (error) {
      console.error('Error liking item:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to like item'
      });
    } finally {
      setLikeLoading(false);
    }
  };

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

  // Calculate total orders
  const totalOrders = item && item.orderItems ? item.orderItems.reduce((sum, order) => sum + order.quantity, 0) : 0;

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

  const ingredients: string[] = item ? getJsonArray(item.ingredients) : [];
  const servingTips: string[] = item ? getJsonArray(item.servingTips) : [];

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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{item?.name}</h1>
                <p className="text-sm text-gray-500 mt-1">ID: {item?.id}</p>
              </div>
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {item?.category?.name || "Uncategorized"}
              </div>
            </div>

            {/* Price */}
            <div className="mt-4">
              <span className="text-2xl font-semibold text-gray-900">
                {item ? `$${item.price.toFixed(2)}` : ''}
              </span>
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
                  <div className="max-h-[150px] overflow-y-auto">
                    <p className="text-gray-700">{item?.fullDescription}</p>
                  </div>
                </div>
              )}
              {activeTab === 'ingredients' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Ingredients</h2>
                  <div className="max-h-[150px] overflow-y-auto">
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
                  </div>
                </div>
              )}
              {activeTab === 'serving' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Serving Tips</h2>
                  <div className="max-h-[150px] overflow-y-auto">
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
                  </div>
                </div>
              )}
              {activeTab === 'recommendations' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h2>
                  <div className="max-h-[150px] overflow-y-auto">
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
                  </div>
                </div>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-6">                <div className="flex items-center" data-testid="like-count">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-testid="heart-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-gray-600">{likeData.likes} likes</span>
                </div>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2h-4a2 2 0 012-2z" />
                  </svg>
                  <span className="text-gray-600">{totalOrders} orders</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center mb-6">
                <label htmlFor="quantity" className="mr-4 text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <button 
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-gray-800">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={cartLoading || !item}
                  data-testid="add-to-cart-button"
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cartLoading ? 'Adding...' : 'Add to Cart'}
                </button>
                <button 
                  onClick={handleLike}
                  disabled={likeLoading}
                  data-testid="like-button"
                  aria-label={likeData.userHasLiked ? 'Unlike item' : 'Like item'}
                  className={`py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    likeData.userHasLiked 
                      ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500'
                  }`}
                >
                  <svg className="h-5 w-5" fill={likeData.userHasLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
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
