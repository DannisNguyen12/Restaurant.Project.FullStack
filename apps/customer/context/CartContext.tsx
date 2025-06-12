'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

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

// Constants
const CART_STORAGE_KEY = 'restaurant-cart';

// Cart provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart) as CartItem[];
          // Validate the cart data structure
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(CART_STORAGE_KEY);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCartFromStorage();
  }, []);

  // Save cart to localStorage whenever cartItems change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isLoaded]);

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
    // Also clear from localStorage immediately
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
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

  // Don't render children until cart is loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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
