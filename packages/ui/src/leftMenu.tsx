'use client';
import React, { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
}

const LeftMenu: React.FC<{ onCategorySelect?: (categoryId: number | null) => void }> = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    // Fetch categories from API
    fetch("/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.text();
      })
      .then((text) => {
        if (!text) throw new Error("Empty response");
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON");
        }
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(() => {
        setCategories([]);
        setLoading(false);
      });
  }, []);

  const handleClick = (id: number | null) => {
    setSelected(id);
    if (onCategorySelect) onCategorySelect(id);
  };

  return (
    <aside className="w-64 bg-gray-100 p-4 h-full border-r">
      <h2 className="text-lg font-bold mb-4">
        <a href="/" className="hover:underline text-green-700">Categories</a>
      </h2>
      <ul>
        <li>
          <button
            className={`w-full text-left px-2 py-1 rounded mb-1 ${selected === null ? 'bg-green-200 font-semibold' : 'hover:bg-green-100'}`}
            onClick={() => handleClick(null)}
          >
            All
          </button>
        </li>
        {loading ? (
          <li>Loading...</li>
        ) : (
          categories.map((cat) => (
            <li key={cat.id}>
              <button
                className={`w-full text-left px-2 py-1 rounded mb-1 ${selected === cat.id ? 'bg-green-200 font-semibold' : 'hover:bg-green-100'}`}
                onClick={() => handleClick(cat.id)}
              >
                {cat.name}
              </button>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
};

export default LeftMenu;
