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
  // Convert price to string for UI compatibility
  return items.map(item => ({
    ...item,
    price: item.price?.toLocaleString("en-US", { style: "currency", currency: "USD" }),
  }));
}

export default async function HomePage() {
  const items = await getItems();

  return (
    <main>
      <ListOfCard items={items} />
    </main>
  );
}