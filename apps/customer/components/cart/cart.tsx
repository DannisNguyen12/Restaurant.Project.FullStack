import React, { useEffect, useState } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const Cart: React.FC<{
  cart: CartItem[];
  onIncrease: (id: number) => void;
  onRemove: (id: number) => void;
  onDecrease: (id: number) => void;
}> = ({ cart: propCart, onIncrease, onRemove, onDecrease }) => {
  const [cart, setCart] = useState<CartItem[]>(propCart);

  // Sync cart state with propCart only when propCart changes
  useEffect(() => {
    setCart(propCart);
  }, [propCart]);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded shadow-lg p-4 min-w-[300px]">
      <h3 className="font-bold text-lg mb-2">Cart</h3>
      {cart.length === 0 ? (
        <div className="text-gray-500">Your cart is empty.</div>
      ) : (
        <ul className="mb-2">
          {cart.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between mb-2"
            >
              <span>{item.name}</span>
              <span className="flex items-center gap-2">
                <button
                  className="bg-green-200 px-2 rounded text-green-700 font-bold"
                  onClick={() => onIncrease(item.id)}
                  title="Increase quantity"
                >
                  +
                </button>
                <button
                  className="bg-yellow-200 px-2 rounded text-yellow-700 font-bold"
                  onClick={() => onDecrease(item.id)}
                  title="Decrease quantity"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="w-6 text-center">{item.quantity}</span>
                <button
                  className="bg-red-200 px-2 rounded text-red-700 font-bold"
                  onClick={() => onRemove(item.id)}
                  title="Remove item"
                >
                  🗑️
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="font-semibold mb-2">
        Total: ${totalPrice.toFixed(2)}
      </div>
      <button
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        onClick={() => {
          if (cart.length > 0 && totalPrice > 0) {
            window.location.href = "/payment";
          }
        }}
        disabled={cart.length === 0 || totalPrice <= 0}
      >
        Checkout
      </button>
    </div>
  );
};

export default Cart;
