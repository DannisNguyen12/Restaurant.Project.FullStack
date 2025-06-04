'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Define the cart item type
export interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

// Define the cart context type
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  getCartTax: () => number;
  getCartItemCount: () => number;
  isItemInCart: (itemId: number) => boolean;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Add item to cart
  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // If item already exists, update quantity
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // If new item, add to cart
        return [...prevItems, { ...item, quantity }];
      }
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((itemId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Calculate cart subtotal
  const getCartSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Calculate cart tax (10%)
  const getCartTax = useCallback(() => {
    return getCartSubtotal() * 0.1;
  }, [getCartSubtotal]);

  // Calculate cart total
  const getCartTotal = useCallback(() => {
    return getCartSubtotal() + getCartTax();
  }, [getCartSubtotal, getCartTax]);

  // Get total item count in cart
  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Check if item is in cart
  const isItemInCart = useCallback((itemId: number) => {
    return cartItems.some(item => item.id === itemId);
  }, [cartItems]);

  const contextValue: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartSubtotal,
    getCartTax,
    getCartItemCount,
    isItemInCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
