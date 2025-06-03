import { useState } from 'react';

export default function CartSummary({ items = [], onCheckout }) {
  const [cartItems, setCartItems] = useState(items);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Update quantity for an item
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <div className={`w-80 bg-white rounded-lg shadow-lg p-6 transition-all duration-300 ${
      isCollapsed ? 'h-16' : 'h-auto'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Your Order</h2>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isCollapsed ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Cart Items (hidden when collapsed) */}
      {!isCollapsed && (
        <>
          <div className="mt-4 max-h-96 overflow-y-auto pr-2 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p>Your cart is empty</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="font-medium text-gray-800">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-3">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={onCheckout}
              disabled={cartItems.length === 0}
              className={`mt-6 w-full py-3 rounded-lg font-medium text-white transition-colors ${
                cartItems.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Example usage:
/*
const sampleCartItems = [
  {
    id: '1',
    name: 'Margherita Pizza',
    price: 12.99,
    quantity: 2,
    image: 'https://picsum.photos/300/200?random=1'
  },
  {
    id: '2',
    name: 'Veggie Burger',
    price: 9.99,
    quantity: 1,
    image: 'https://picsum.photos/300/200?random=2'
  }
];

<CartSummary 
  items={sampleCartItems}
  onCheckout={() => console.log('Proceeding to checkout')}
/>
*/