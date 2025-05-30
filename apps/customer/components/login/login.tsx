'use client';
import React, { useState } from "react";

interface LoginProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const LoginForm: React.FC<LoginProps> = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email || !password) return;
    await onSubmit(email, password);
  };

  const emailValid = /\S+@\S+\.\S+/.test(email);

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      {error && <div className="mb-2 text-red-600 text-center">{error}</div>}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Email</label>
        <input
          type="email"
          className="w-full border rounded p-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, email: true }))}
        />
        {touched.email && !emailValid && (
          <div className="text-red-500 text-sm">Please enter a valid email.</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Password</label>
        <input
          type="password"
          className="w-full border rounded p-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, password: true }))}
        />
        {touched.password && !password && (
          <div className="text-red-500 text-sm">Password is required.</div>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        disabled={loading || !emailValid || !password}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      <div className="mt-4 text-center">
        <a href="/forgot-password" className="text-green-700 hover:underline">
          Forgot password?
        </a>
        <span className="mx-2 text-gray-400">|</span>
        <a href="/signup" className="text-green-700 hover:underline">
          Sign up
        </a>
      </div>
    </form>
  );
};

export default LoginForm;