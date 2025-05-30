"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ImagePreview from "./imagePreview";
import Toast from "../common/toast";

interface EditItemFormProps {
  item: {
    id: number;
    name: string;
    description: string;
    fullDescription: string;
    price: number;
    image: string;
    ingredients: string[];
    servingTips: string[];
    recommendations: string[];
  };
}

const EditItemForm: React.FC<EditItemFormProps> = ({ item }) => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: item.name || "",
    description: item.description || "",
    fullDescription: item.fullDescription || "",
    price: item.price?.toString() || "",
    image: item.image || "",
    ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(", ") : "",
    servingTips: Array.isArray(item.servingTips) ? item.servingTips.join(", ") : "",
    recommendations: Array.isArray(item.recommendations) ? item.recommendations.join(", ") : "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ 
    message: string; 
    type: 'success' | 'error' | 'info';
    visible: boolean;
  } | null>(null);

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.price || isNaN(Number(form.price))) return "Valid price is required.";
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
      setToast({
        message: validation,
        type: 'error',
        visible: true
      });
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/items/${item.id}/edit`, {
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
    setLoading(false);
    if (res.ok) {
      const successMessage = "Item updated successfully!";
      setSuccess(successMessage);
      setToast({
        message: successMessage,
        type: 'success',
        visible: true
      });
      // Navigate back to admin home page after 2 seconds
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    } else {
      const data = await res.json();
      const errorMessage = data.error || "Failed to update item.";
      setError(errorMessage);
      setToast({
        message: errorMessage,
        type: 'error',
        visible: true
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {toast && toast.visible && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)}
        />
      )}
      <form onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-green-700 border-b pb-2">Edit Item</h2>
        {error && <div className="text-red-500 p-3 mb-4 bg-red-50 rounded border border-red-200">{error}</div>}
        {success && <div className="text-green-600 p-3 mb-4 bg-green-50 rounded border border-green-200">{success}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold">Name</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500" 
            />
          </div>
          
          <div>
            <label className="block mb-2 font-semibold">Price</label>
            <input 
              name="price" 
              type="number" 
              step="0.01"
              value={form.price} 
              onChange={handleChange} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500" 
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold">Image URL</label>
            <input 
              name="image" 
              value={form.image} 
              onChange={handleChange} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-2" 
            />
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-2">Image preview:</p>
              <ImagePreview imageUrl={form.image} />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold">Short Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[80px]" 
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold">Full Description</label>
            <textarea 
              name="fullDescription" 
              value={form.fullDescription} 
              onChange={handleChange} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[120px]" 
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold">Ingredients (comma separated)</label>
            <input 
              name="ingredients" 
              value={form.ingredients} 
              onChange={handleChange} 
              placeholder="e.g. rice, vegetables, soy sauce"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500" 
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold">Serving Tips (comma separated)</label>
            <input 
              name="servingTips" 
              value={form.servingTips} 
              onChange={handleChange} 
              placeholder="e.g. serve hot, best with rice"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500" 
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold">Recommendations (comma separated)</label>
            <input 
              name="recommendations" 
              value={form.recommendations} 
              onChange={handleChange} 
              placeholder="e.g. spring rolls, iced tea"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500" 
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditItemForm;