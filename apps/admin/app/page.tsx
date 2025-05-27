import React from "react";
import ListOfCard from "@repo/ui/item/listOfCard";
import { PrismaClient } from "@repo/database/generated/prisma";



const prisma = new PrismaClient();

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
  return items.map(item => ({
    ...item,
    description: item.description || '',
    image: item.image || '',
    price: item.price?.toLocaleString("en-US", { style: "currency", currency: "USD" }),
  }));
}

export default async function HomePage() {
  const items = await getItems();
  return (
    <main>
      <div className="flex justify-end max-w-6xl mx-auto mt-8">
        <a href="/create" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold">+ Create New Item</a>
      </div>
      <ListOfCard items={items} />
    </main>
  );
}
