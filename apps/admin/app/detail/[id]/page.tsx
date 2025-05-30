import { notFound } from "next/navigation";
import { PrismaClient } from "@repo/database/generated/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import EditItemForm from "../../../components/item/editItem";
import ItemPreview from "../../../components/item/itemPreview";

const prisma = new PrismaClient();

function safeStringArray(val: unknown): string[] {
  return Array.isArray(val) ? val.filter((v): v is string => typeof v === "string") : [];
}

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) {
    redirect("/login");
  }

  const id = Number(params.id);
  if (isNaN(id)) return notFound();

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return notFound();

  // Convert nullable fields and JSON fields for the client component
  const processedItem = {
    ...item,
    description: item.description || "",
    fullDescription: item.fullDescription || "",
    image: item.image || "",
    ingredients: safeStringArray(item.ingredients),
    servingTips: safeStringArray(item.servingTips),
    recommendations: safeStringArray(item.recommendations),
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Item Details</h1>
          <p className="text-gray-600">View and edit this item&apos;s information</p>
        </div>
        <Link 
          href="/" 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition inline-flex items-center"
        >
          &larr; Back to All Items
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-green-700">Preview</h2>
          <ItemPreview item={processedItem} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4 text-green-700">Edit</h2>
          <EditItemForm item={processedItem} />
        </div>
      </div>
    </div>
  );
}
