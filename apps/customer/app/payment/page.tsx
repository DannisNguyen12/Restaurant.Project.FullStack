'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Image from 'next/image';
import PaymentForm, { PaymentFormData } from '../../component/payment/PaymentForm';

export default function PaymentPage() {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const total = getCartTotal();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin?callbackUrl=/payment');
    }
    
    if (cartItems.length === 0) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, cartItems.length, router]);

  const handlePaymentSubmit = async (formData: PaymentFormData) => {
    setIsProcessing(true);

    try {
      addToast({
        type: 'info',
        title: 'Processing payment',
        message: 'Please wait while we process your order...',
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would integrate with a real payment processor
      const orderData = {
        items: cartItems,
        total,
        customerInfo: formData,
        userId: user?.id,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const orderResponse = await response.json();
        
        addToast({
          type: 'success',
          title: 'Payment successful!',
          message: `Order #${orderResponse.id} has been placed`,
        });
        
        // Store order data for success page
        const orderDataForStorage = {
          id: orderResponse.id,
          total: total,
          items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        };
        sessionStorage.setItem('lastOrder', JSON.stringify(orderDataForStorage));
        
        clearCart();
        router.push('/order-success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      addToast({
        type: 'error',
        title: 'Payment failed',
        message: errorMessage,
      });
      throw error; // Re-throw so PaymentForm can handle it
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
            <p className="text-gray-600">Complete your order</p>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Order Summary */}
            <div className="lg:w-2/5 p-6 bg-gray-50 border-r border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="w-15 h-15 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <PaymentForm
              initialData={{ email: user?.email || '' }}
              total={total}
              onSubmit={handlePaymentSubmit}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
