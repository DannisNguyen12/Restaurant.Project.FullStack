import React from "react";
import Image from "next/image";
import Link from "next/link";

interface ItemCardProps {
  item: {
    id: number;
    name: string;
    description?: string;
    price: number;
    image?: string;
    likes?: any[];
    slug?: string;
  };
  onAddToCart?: (item: { id: number; name: string; price: number }) => void;
}

const Card: React.FC<ItemCardProps> = ({ item, onAddToCart }) => {
  return (
    <div className="bg-white p-4 rounded shadow-md hover:shadow-lg transition duration-300">
      {item.image && (
        <div className="relative w-full h-[200px] mb-4">
          <Image
            src={item.image.trim()}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            style={{ objectFit: 'cover' }}
            className="rounded"
          />
        </div>
      )}
      <h2 className="text-xl font-bold mb-2">
        <Link href={`/detail/${item.id}`} className="hover:underline text-green-700">
          {item.name}
        </Link>
      </h2>
      {item.price && (
        <p className="text-green-600 font-semibold mb-2">
          {typeof item.price === "number"
            ? item.price.toLocaleString("en-US", { style: "currency", currency: "USD" })
            : item.price}
        </p>
      )}
      {item.description && <p className="text-gray-600 mb-2">{item.description}</p>}
      {item.likes && <div className="text-xs text-gray-500 mt-1">Likes: {item.likes.length}</div>}
      {onAddToCart && (
        <button
          className="mt-2 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          onClick={() => onAddToCart({ id: item.id, name: item.name, price: item.price })}
        >
          Add to Cart
        </button>
      )}
    </div>
  );
};

export default Card;
