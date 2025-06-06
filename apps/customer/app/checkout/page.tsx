'use client';
import { useSession } from 'next-auth/react';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../context/ToastContext';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { cartItems, getCartTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const total = getCartTotal();

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      addToast({
        type: 'warning',
        title: 'Empty Cart',
        message: 'Please add items to your cart before proceeding'
      });
      router.push('/');
      return;
    }

    setIsProcessing(true);
    addToast({
      type: 'info',
      title: 'Redirecting to Payment',
      message: 'Taking you to secure payment page'
    });
    router.push('/payment');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
          
          {/* User Info */}
          <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-medium">Authenticated as: {session?.user?.email}</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Your cart is empty</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total: ${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {cartItems.length > 0 && (
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
