'use client';
import React, { useEffect, useState } from "react";
import ListOfCard from "../components/item/listOfCard";
import LeftMenu from "@repo/ui/leftMenu";
import Search from "@repo/ui/search";
import Cart from "../components/cart/cart";
import Logout from "../components/logout/logout";
import Link from "next/link";

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId !== null) params.set("category", String(categoryId));
    setLoading(true);
    setError(null);
    fetch(`/api/items?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch items");
        return res.json();
      })
      .then(data => setItems(data.items))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, categoryId]);

  // Load cart from server cookies on mount ONLY (not polling)
  useEffect(() => {
    console.log("Page mounted, attempting to load cart from cookies");
    
    // First, try to load from API
    fetch("/api/cart", {
      credentials: "include" // Important to include cookies
    })
      .then(res => {
        if (!res.ok) {
          console.error("Failed to fetch cart from API:", res.status);
          // If API fails, try to get cart cookie directly from browser
          return { cart: getCartFromBrowserCookie() };
        }
        return res.json();
      })
      .then(data => {
        console.log("Loaded cart from cookies:", data.cart);
        if (Array.isArray(data.cart) && data.cart.length > 0) {
          setCart(data.cart);
        } else {
          // If no cart from API, try to get it directly from browser cookies
          const browserCart = getCartFromBrowserCookie();
          if (browserCart.length > 0) {
            console.log("Using cart from browser cookie:", browserCart);
            setCart(browserCart);
          } else {
            setCart([]);
          }
        }
      })
      .catch(err => {
        console.error("Error loading cart from API:", err);
        // Try to get cart directly from browser cookies as fallback
        const browserCart = getCartFromBrowserCookie();
        console.log("Fallback: Using cart from browser cookie:", browserCart);
        setCart(browserCart);
      });
  }, []);

  // Function to get cart directly from browser cookies
  const getCartFromBrowserCookie = () => {
    try {
      const cookies = document.cookie.split(';');
      const cartCookie = cookies.find(cookie => cookie.trim().startsWith('cart='));
      
      if (cartCookie) {
        const cartValue = cartCookie.split('=')[1];
        if (cartValue) {
          // Try a safe approach to decode and parse
          try {
            // First try direct parsing (no decoding needed)
            if (cartValue.startsWith('[') || cartValue.startsWith('{')) {
              console.log("Parsing direct JSON from cookie");
              return JSON.parse(cartValue);
            }
            
            // Try decoding once
            const decodedValue = decodeURIComponent(cartValue);
            console.log("Decoded cookie value:", decodedValue);
            
            if (decodedValue.startsWith('[') || decodedValue.startsWith('{')) {
              return JSON.parse(decodedValue);
            } 
            
            // If we reach here, log the unexpected format
            console.error("Cookie value is not in expected JSON format:", decodedValue);
          } catch (parseErr) {
            console.error("Error parsing cookie value:", parseErr);
          }
        }
      }
      return [];
    } catch (err) {
      console.error("Error retrieving cart cookie directly:", err);
      return [];
    }
  };

  // Save cart to server cookies whenever cart changes (but not on every render)
  const saveCartToCookie = (newCart: typeof cart) => {
    console.log("Saving cart to cookie:", newCart);
    
    // First try to save via API
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: newCart }),
      credentials: "include", // Important for cookies
    })
    .then(res => {
      if (!res.ok) {
        console.error("Failed to save cart via API:", res.status);
        // Fallback: Set cookie directly in the browser as a backup
        setCartCookieDirectly(newCart);
      } else {
        console.log("Cart saved successfully via API");
      }
      return res.json();
    })
    .catch(err => {
      console.error("Error saving cart via API:", err);
      // Fallback: Set cookie directly in the browser
      setCartCookieDirectly(newCart);
    });
  };

  // Fallback method to set cookie directly in the browser
  const setCartCookieDirectly = (cartData: typeof cart) => {
    try {
      // Make sure we're working with valid data
      if (!Array.isArray(cartData)) {
        console.error("Invalid cart data for cookie", cartData);
        return;
      }
      
      // Stringify the cart data WITHOUT URL encoding
      // This makes it easier to read directly from document.cookie
      const cartJson = JSON.stringify(cartData);
      
      console.log("Setting direct cookie with JSON:", cartJson);
      
      // Set the cookie with proper attributes - no encoding
      document.cookie = `cart=${cartJson};path=/;max-age=${60 * 60 * 24 * 7};samesite=lax`;
      console.log("Cart cookie set directly in browser");
    } catch (err) {
      console.error("Failed to set cart cookie directly:", err);
    }
  };

  const handleAddToCart = (item: { id: number; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.id === item.id);
      let updatedCart;
      if (existing) {
        updatedCart = prev.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      } else {
        updatedCart = [...prev, { ...item, quantity: 1 }];
      }
      saveCartToCookie(updatedCart);
      return updatedCart;
    });
  };

  const handleIncrease = (id: number) => {
    setCart(prev => {
      const updatedCart = prev.map(ci => ci.id === id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      saveCartToCookie(updatedCart);
      return updatedCart;
    });
  };

  const handleDecrease = (id: number) => {
    setCart(prev => {
      const updatedCart = prev.map(ci => ci.id === id && ci.quantity > 1 ? { ...ci, quantity: ci.quantity - 1 } : ci);
      saveCartToCookie(updatedCart);
      return updatedCart;
    });
  };

  const handleRemove = (id: number) => {
    setCart(prev => {
      const updatedCart = prev.filter(ci => ci.id !== id);
      saveCartToCookie(updatedCart);
      return updatedCart;
    });
  };

  return (
    <>
      <div className="flex flex-col">
        {/* Logout/Login buttons at the top */}
        <div className="flex justify-end items-center gap-2 p-4">
          <Logout />
          <Link href="/login">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
              Login
            </button>
          </Link>
        </div>
        <div className="flex items-center justify-between p-4">
          <Cart
            cart={cart}
            onIncrease={handleIncrease}
            onRemove={handleRemove}
            onDecrease={handleDecrease}
          />
          <Search onSearch={setSearch} initialValue={search} />
        </div>
        <div className="flex min-h-screen">
          <div className="hidden md:block">
            <LeftMenu onCategorySelect={setCategoryId} />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              {loading && (
                <div className="flex justify-center items-center h-full text-gray-500">Loading...</div>
              )}
              {error && (
                <div className="flex justify-center items-center h-full text-red-500">{error}</div>
              )}
              {!loading && !error && <ListOfCard items={items} onAddToCart={handleAddToCart} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}