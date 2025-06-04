'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<{
    id?: string;
    total?: number;
    items?: Array<{ name: string; quantity: number; price: number }>;
  } | null>(null);

  useEffect(() => {
    // Try to get order data from sessionStorage (set during payment)
    const storedOrderData = sessionStorage.getItem('lastOrder');
    if (storedOrderData) {
      setOrderData(JSON.parse(storedOrderData));
      // Clear it after using
      sessionStorage.removeItem('lastOrder');
    }

    // Auto redirect to home after 30 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 30000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Order Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your order! Your payment has been processed successfully. 
          You will receive a confirmation email shortly.
        </p>

        {orderData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Order Details</h3>
            {orderData.id && (
              <p className="text-sm text-gray-600 mb-2">
                Order ID: <span className="font-mono">{orderData.id}</span>
              </p>
            )}
            {orderData.total && (
              <p className="text-sm text-gray-600 mb-2">
                Total: <span className="font-semibold">${orderData.total.toFixed(2)}</span>
              </p>
            )}
            {orderData.items && orderData.items.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {orderData.items.map((item, index) => (
                    <li key={index}>
                      {item.quantity}x {item.name} - ${(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            Your order is being prepared and will be ready for pickup or delivery soon.
            We&apos;ll notify you once it&apos;s ready.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
          >
            Continue Shopping
          </Link>
          
          <Link
            href="/orders"
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors inline-block"
          >
            View My Orders
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Redirecting to home page in 10 seconds...
        </p>
      </div>
    </div>
  );
}
