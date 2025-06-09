'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  item: {
    id: number;
    name: string;
    price: number;
    image?: string;
  };
}

interface Order {
  id: number;
  customerName: string;
  total: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/signin?callbackUrl=/order-history');
          return;
        }
        throw new Error('Failed to fetch orders');
      }
      
      const ordersData = await response.json();
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'loading') return; // Still loading session
    
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/order-history');
      return;
    }

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router, fetchOrders]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-gray-600">Loading your order history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Orders</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
              <p className="text-gray-600 mt-2">
                {session?.user?.name ? `Welcome back, ${session.user.name}!` : 'Your order history'}
              </p>
            </div>
            <Link
              href="/"
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven&apos;t placed any orders yet. Start browsing our menu!</p>
            <Link
              href="/"
              className="inline-block bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Order #{order.id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-800">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {order.items.map((orderItem) => (
                      <div key={`${order.id}-${orderItem.item.id}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          {orderItem.item.image && (
                            <Image
                              src={orderItem.item.image}
                              alt={orderItem.item.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-800">{orderItem.item.name}</h4>
                            <p className="text-sm text-gray-600">Quantity: {orderItem.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">
                            ${(orderItem.item.price * orderItem.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${orderItem.item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
