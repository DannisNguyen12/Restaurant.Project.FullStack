import MenuItemDetail from "../../../components/item/detail";
import { PrismaClient } from "@repo/database/generated/prisma";
import { notFound } from "next/navigation";

interface DetailPageProps {
  params: { id: string };
}

export default async function DetailPage({ params }: DetailPageProps) {
  const prisma = new PrismaClient();
  const item = await prisma.item.findUnique({
    where: { id: Number(params.id) },
    include: { category: true, likes: true },
  });

  if (!item) return notFound();

  // Ensure array fields are always string[]
  const safeIngredients = Array.isArray(item.ingredients) ? item.ingredients.filter((v): v is string => typeof v === 'string') : [];
  const safeServingTips = Array.isArray(item.servingTips) ? item.servingTips.filter((v): v is string => typeof v === 'string') : [];
  const safeRecommendations = Array.isArray(item.recommendations) ? item.recommendations.filter((v): v is string => typeof v === 'string') : [];

  // Convert nullable string fields to undefined if null
  const safeDescription = item.description === null ? undefined : item.description;
  const safeFullDescription = item.fullDescription === null ? undefined : item.fullDescription;
  const safeImage = item.image === null ? undefined : item.image;

  // Convert createdAt to string
  const safeCreatedAt = item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt);

  return <MenuItemDetail item={{
    ...item,
    description: safeDescription,
    fullDescription: safeFullDescription,
    image: safeImage,
    ingredients: safeIngredients,
    servingTips: safeServingTips,
    recommendations: safeRecommendations,
    createdAt: safeCreatedAt,
  }} />;
}
