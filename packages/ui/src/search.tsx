'use client';
import React, { useState } from "react";

interface SearchProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

const Search: React.FC<SearchProps> = ({ onSearch, initialValue = "" }) => {
  const [query, setQuery] = useState(initialValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-lg mx-auto mb-4">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search by title, description, or recommendation..."
        className="flex-1 border rounded p-2"
      />
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
        Search
      </button>
    </form>
  );
};

export default Search;
