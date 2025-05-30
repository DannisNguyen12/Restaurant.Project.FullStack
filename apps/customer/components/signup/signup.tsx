'use client';
import React, { useState } from "react";

interface SignupProps {
  onSubmit: (email: string, password: string, rePassword: string, name: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const SignupForm: React.FC<SignupProps> = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [name, setName] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false, rePassword: false, name: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, rePassword: true, name: true });
    if (!email || !password || !rePassword || password !== rePassword || !name) return;
    await onSubmit(email, password, rePassword, name);
  };

  const emailValid = /\S+@\S+\.\S+/.test(email);

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
      {error && <div className="mb-2 text-red-600 text-center">{error}</div>}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Username</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, name: true }))}
        />
        {touched.name && !name && (
          <div className="text-red-500 text-sm">Username is required.</div>
        )}
      </div>
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
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Re-enter Password</label>
        <input
          type="password"
          className="w-full border rounded p-2"
          value={rePassword}
          onChange={e => setRePassword(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, rePassword: true }))}
        />
        {touched.rePassword && (!rePassword || rePassword !== password) && (
          <div className="text-red-500 text-sm">Passwords do not match.</div>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        disabled={loading || !emailValid || !password || password !== rePassword || !name}
      >
        {loading ? "Registering..." : "Register"}
      </button>
      <div className="mt-4 text-center">
        <button
          type="button"
          className="w-full mb-2 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          onClick={() => window.location.href = "/api/auth/google"}
        >
          Sign up with Google
        </button>
        <button
          type="button"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          onClick={() => window.location.href = "/api/auth/facebook"}
        >
          Sign up with Facebook
        </button>
      </div>
    </form>
  );
};

export default SignupForm;