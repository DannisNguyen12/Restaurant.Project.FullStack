"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      window.location.href = "/";
    } else {
      const data = await res.json();
      setError(data.error || "Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input className="w-full border p-2 rounded mb-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="w-full border p-2 rounded mb-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="w-full bg-green-600 text-white py-2 rounded" type="submit">Login</button>
    </form>
  );
}