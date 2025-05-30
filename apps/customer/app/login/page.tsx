"use client";
import React, { useState } from "react";
import LoginForm from "../../components/login/login";
// We're not using the router anymore since we're using window.location.href
// import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter(); // Removed since we're not using it

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // Include cookies in the request
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
      } else {
        const data = await res.json();
        console.log("Login successful, cart data:", data.cart);
        
        // After successful login, redirect to home page
        // We'll use window.location.href instead of router.push to ensure a full page reload
        // which will trigger the useEffect in page.tsx to load the cart from cookies
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
  );
}