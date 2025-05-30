'use client';

import React from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface PaymentProps {
  cart: CartItem[];
}

const Payment: React.FC<PaymentProps> = ({ cart }) => {
  const [method, setMethod] = React.useState("card");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardName, setCardName] = React.useState("");
  const [exp, setExp] = React.useState("");
  const [cvc, setCvc] = React.useState("");
  const [touched, setTouched] = React.useState({ cardNumber: false, cardName: false, exp: false, cvc: false });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [localCart, setLocalCart] = React.useState(cart);

  React.useEffect(() => {
    setLocalCart(cart);
  }, [cart]);

  // Card validation helpers
  const cardNumberValid = /^\d{16}$/.test(cardNumber.replace(/\s+/g, ""));
  const cardNameValid = cardName.trim().length > 0;
  const expValid = /^(0[1-9]|1[0-2])\/(\d{2})$/.test(exp);
  const cvcValid = /^\d{3,4}$/.test(cvc);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ cardNumber: true, cardName: true, exp: true, cvc: true });
    setError(null);
    if (method === "card") {
      if (!cardNumberValid || !cardNameValid || !expValid || !cvcValid) return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: localCart, method, details: method === "card" ? { cardNumber, cardName, exp, cvc } : {} }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Payment failed");
        setLoading(false);
        return;
      }
      // Only clear cart if payment was successful
      await res.json(); // ignore unused variable warning
      setSuccess(true);
      setLocalCart([]);
      try {
        const clearRes = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Important for cookies
          body: JSON.stringify({ cart: [] }),
        });
        if (!clearRes.ok) {
          console.error("Failed to clear cart cookie:", clearRes.status);
        }
      } catch (err) {
        console.error("Error clearing cart cookie:", err);
      }
      setCardNumber("");
      setCardName("");
      setExp("");
      setCvc("");
      setTouched({ cardNumber: false, cardName: false, exp: false, cvc: false });
    } catch (err) {
      setError("Network error");
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const total = localCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <ul className="mb-4">
        {localCart.map(item => (
          <li key={item.id} className="flex justify-between mb-2">
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="font-bold mb-4">Total: ${total.toFixed(2)}</div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Payment Method</label>
          <select value={method} onChange={e => setMethod(e.target.value)} className="w-full border rounded p-2">
            <option value="card">Credit/Debit Card</option>
            <option value="apple">Apple Pay</option>
            <option value="samsung">Samsung Pay</option>
          </select>
        </div>
        {method === "card" && (
          <>
            <div className="mb-2">
              <input className="w-full border rounded p-2" placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} onBlur={() => setTouched(t => ({ ...t, cardNumber: true }))} required />
              {touched.cardNumber && !cardNumberValid && <div className="text-red-500 text-sm">Card number must be 16 digits.</div>}
            </div>
            <div className="mb-2">
              <input className="w-full border rounded p-2" placeholder="Name on Card" value={cardName} onChange={e => setCardName(e.target.value)} onBlur={() => setTouched(t => ({ ...t, cardName: true }))} required />
              {touched.cardName && !cardNameValid && <div className="text-red-500 text-sm">Name is required.</div>}
            </div>
            <div className="flex gap-2 mb-2">
              <input className="w-1/2 border rounded p-2" placeholder="MM/YY" value={exp} onChange={e => setExp(e.target.value)} onBlur={() => setTouched(t => ({ ...t, exp: true }))} required />
              <input className="w-1/2 border rounded p-2" placeholder="CVC" value={cvc} onChange={e => setCvc(e.target.value)} onBlur={() => setTouched(t => ({ ...t, cvc: true }))} required />
            </div>
            <div className="flex gap-2 mb-2">
              {touched.exp && !expValid && <div className="text-red-500 text-sm">Exp must be MM/YY.</div>}
              {touched.cvc && !cvcValid && <div className="text-red-500 text-sm">CVC must be 3 or 4 digits.</div>}
            </div>
          </>
        )}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">Payment successful!</div>}
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition" disabled={loading || (method === "card" && (!cardNumberValid || !cardNameValid || !expValid || !cvcValid)) || localCart.length === 0}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </form>
    </div>
  );
};

export default Payment;
