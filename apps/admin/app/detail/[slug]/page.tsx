import { notFound } from "next/navigation";
import { PrismaClient } from "@repo/database/generated/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import EditItemForm from "../../../components/item/editItem";

const prisma = new PrismaClient();

function safeStringArray(val: unknown): string[] {
  return Array.isArray(val) ? val.filter((v): v is string => typeof v === "string") : [];
}

export default async function ItemDetailPage({ params }: { params: { slug: string } }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) {
    redirect("/login");
  }

  const id = Number(params.slug);
  if (isNaN(id)) return notFound();

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return notFound();

  // Convert nullable fields and JSON fields for the client component
  return <EditItemForm item={{
    ...item,
    description: item.description || "",
    fullDescription: item.fullDescription || "",
    image: item.image || "",
    ingredients: safeStringArray(item.ingredients),
    servingTips: safeStringArray(item.servingTips),
    recommendations: safeStringArray(item.recommendations),
  }} />;
}
