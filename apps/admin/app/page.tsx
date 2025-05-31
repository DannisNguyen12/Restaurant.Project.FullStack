import React from "react";
import Link from "next/link";
import ListOfCard from "../components/item/listOfCard";
import { prisma } from "@repo/database/index";
import { requireAuth } from "../utils/auth";

async function getItems() {
  // Fetch all items from the database
  const items = await prisma.item.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
    },
  });
  // Convert price to string for UI compatibility and provide default values for nullable fields
  interface Item {
    id: number;
    name: string;
    description: string | null;
    price: number | null;
    image: string | null;
  }

  interface FormattedItem {
    id: number;
    name: string;
    description: string;
    price: string | undefined;
    image: string;
  }

    return items.map((item): FormattedItem => ({
      ...item,
      id: parseInt(item.id.toString()),
      description: item.description || '',
      image: item.image || '',
      price: item.price?.toLocaleString("en-US", { style: "currency", currency: "USD" }),
    }));
}

export default async function HomePage() {
  // Check authentication
  await requireAuth();
  
  const items = await getItems();
  return (
    <main>
      <div className="flex justify-end max-w-6xl mx-auto mt-8">
        <Link href="/create" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold">+ Create New Item</Link>
      </div>
      <ListOfCard items={items} />
    </main>
  );
}
