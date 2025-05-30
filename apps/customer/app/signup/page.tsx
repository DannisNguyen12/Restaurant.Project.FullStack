"use client";
import React, { useState } from "react";
import SignupForm from "../../components/signup/signup";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (email: string, password: string, rePassword: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rePassword, name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Signup failed");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupForm onSubmit={handleSignup} loading={loading} error={error} />
  );
}