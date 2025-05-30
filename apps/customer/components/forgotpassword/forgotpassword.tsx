import React, { useState } from "react";

interface ForgotPasswordProps {
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  success?: boolean;
}

const ForgotPasswordForm: React.FC<ForgotPasswordProps> = ({ onSubmit, loading, error, success }) => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!email) return;
    await onSubmit(email);
  };

  const emailValid = /\S+@\S+\.\S+/.test(email);

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
      {error && <div className="mb-2 text-red-600 text-center">{error}</div>}
      {success && <div className="mb-2 text-green-600 text-center">Check your email for a reset link.</div>}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Email</label>
        <input
          type="email"
          className="w-full border rounded p-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
        />
        {touched && !emailValid && (
          <div className="text-red-500 text-sm">Please enter a valid email.</div>
        )}
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        disabled={loading || !emailValid}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
};

export default ForgotPasswordForm;