'use client';
import React, { useEffect, useState } from "react";
import ListOfCard from "../components/item/listOfCard";
import LeftMenu from "@repo/ui/leftMenu";
import Search from "@repo/ui/search";

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId !== null) params.set("category", String(categoryId));
    setLoading(true);
    setError(null);
    fetch(`/api/items?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch items");
        return res.json();
      })
      .then(data => setItems(data.items))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, categoryId]);

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <LeftMenu onCategorySelect={setCategoryId} />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="p-4">
          <Search onSearch={setSearch} initialValue={search} />
        </div>
        <div className="flex-1">
          {loading && (
            <div className="flex justify-center items-center h-full text-gray-500">Loading...</div>
          )}
          {error && (
            <div className="flex justify-center items-center h-full text-red-500">{error}</div>
          )}
          {!loading && !error && <ListOfCard items={items} />}
        </div>
      </div>
    </div>
  );
}