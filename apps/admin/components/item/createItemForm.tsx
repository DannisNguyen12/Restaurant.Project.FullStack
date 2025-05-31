"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateItemForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    fullDescription: "",
    price: "",
    image: "",
    ingredients: "",
    servingTips: "",
    recommendations: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) 
      return "Valid price is required (must be a positive number).";
    if (!form.image.trim()) return "Image URL is required.";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/items/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          ingredients: form.ingredients.split(",").map((s: string) => s.trim()).filter(Boolean),
          servingTips: form.servingTips.split(",").map((s: string) => s.trim()).filter(Boolean),
          recommendations: form.recommendations.split(",").map((s: string) => s.trim()).filter(Boolean),
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess("Item created successfully!");
        setForm({
          name: "",
          description: "",
          fullDescription: "",
          price: "",
          image: "",
          ingredients: "",
          servingTips: "",
          recommendations: "",
        });
        // Redirect to home page immediately after success
        router.push('/');
        return;
      } else {
        setError(data.error || "Failed to create item.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Create item error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Create New Item</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <label className="block mb-2">Name
        <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" />
      </label>
      <label className="block mb-2">Description
        <input name="description" value={form.description} onChange={handleChange} className="w-full border p-2 rounded" />
      </label>
      <label className="block mb-2">Full Description
        <textarea name="fullDescription" value={form.fullDescription} onChange={handleChange} className="w-full border p-2 rounded" />
      </label>
      <label className="block mb-2">Price
        <input name="price" value={form.price} onChange={handleChange} className="w-full border p-2 rounded" />
      </label>
      <label className="block mb-2">Image URL
        <input name="image" value={form.image} onChange={handleChange} className="w-full border p-2 rounded" />
      </label>
      <label className="block mb-2">Ingredients (comma separated)
        <input name="ingredients" value={form.ingredients} onChange={handleChange} className="w-full border p-2 rounded" />
      </label>
      <label className="block mb-2">Serving Tips (comma separated)
        <input name="servingTips" value={form.servingTips} onChange={handleChange} className="w-full border p-2 rounded" />
      </label>
      <label className="block mb-2">Recommendations (comma separated)
        <input name="recommendations" value={form.recommendations} onChange={handleChange} className="w-full border p-2 rounded" />
      </label>
      <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
        {loading ? "Creating..." : "Create Item"}
      </button>
    </form>
  );
}
