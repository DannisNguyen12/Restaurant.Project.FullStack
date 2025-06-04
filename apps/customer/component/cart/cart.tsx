'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';

export default function CartSummary() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartSubtotal, 
    getCartTax, 
    getCartTotal,
    getCartItemCount 
  } = useCart();

  // Calculate totals using context methods
  const subtotal = getCartSubtotal();
  const tax = getCartTax();
  const total = getCartTotal();
  const itemCount = getCartItemCount();

  const handleCheckout = () => {
    console.log('Proceeding to checkout with items:', cartItems);
    // TODO: Implement checkout functionality
  };

  return (
    <div className={`w-full bg-white rounded-lg shadow-lg transition-all duration-300 ${
      isCollapsed ? 'h-12 sm:h-14' : 'h-auto'
    } min-h-0 max-h-full flex flex-col`}>
      {/* Header */}
      <div className="flex justify-between items-center p-3 sm:p-4 lg:p-5 flex-shrink-0">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 truncate">Your Order</h2>
          {itemCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.25rem] sm:min-w-[1.5rem] text-center flex-shrink-0">
              {itemCount}
            </span>
          )}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700 p-1.5 sm:p-2 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label={isCollapsed ? "Expand cart" : "Collapse cart"}
        >
          {isCollapsed ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Cart Items (hidden when collapsed) */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 lg:pb-5">
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3 min-h-0">
            {cartItems.length === 0 ? (
              <div className="text-center py-6 sm:py-8 lg:py-12 text-gray-500 flex-shrink-0">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto text-gray-300 mb-2 sm:mb-3 lg:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-sm sm:text-base font-medium">Your cart is empty</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Add some delicious items to get started!</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="relative flex-shrink-0">
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-cover rounded-md sm:rounded-lg shadow-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0 mr-1 sm:mr-2">
                    <p className="font-medium text-gray-800 text-xs sm:text-sm lg:text-base line-clamp-2 leading-tight mb-1">{item.name}</p>
                    <p className="text-indigo-600 font-semibold text-sm sm:text-base">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors text-sm sm:text-base"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-6 sm:w-8 text-center text-sm sm:text-base font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors text-sm sm:text-base"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 sm:p-1.5 rounded-full transition-colors"
                      aria-label="Remove item"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {cartItems.length > 0 && (
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 flex-shrink-0">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium text-gray-800">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base sm:text-lg border-t border-gray-200 pt-2 sm:pt-3">
                  <span className="text-gray-800">Total</span>
                  <span className="text-indigo-600">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="mt-4 sm:mt-6 w-full py-2.5 sm:py-3 lg:py-4 rounded-lg font-semibold text-white text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.01] shadow-md hover:shadow-lg"
              >
                <span className="hidden sm:inline">Proceed to Checkout (${total.toFixed(2)})</span>
                <span className="sm:hidden">Checkout (${total.toFixed(2)})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

