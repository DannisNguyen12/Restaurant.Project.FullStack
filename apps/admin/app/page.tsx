import React from "react";
import Link from "next/link";
import ListOfCard from "../components/item/listOfCard";
import { PrismaClient } from "@repo/database/generated/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) {
    redirect("/login");
  }
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
