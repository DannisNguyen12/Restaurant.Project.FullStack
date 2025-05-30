"use client";
import React, { useState } from "react";
import ForgotPasswordForm from "../../components/forgotpassword/forgotpassword";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/forgotpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send reset link");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ForgotPasswordForm onSubmit={handleForgotPassword} loading={loading} error={error} success={success} />
  );
}