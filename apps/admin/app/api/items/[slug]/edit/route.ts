import { NextResponse } from "next/server";
import { PrismaClient } from "@repo/database/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: Request, context: { params: { slug: string } }) {
 
  const id = Number(context.params.slug);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const data = await request.json();
  // Basic validation
  if (!data.name || !data.price || isNaN(Number(data.price)) || !data.image) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  try {
    const updated = await prisma.item.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        fullDescription: data.fullDescription,
        price: Number(data.price),
        image: data.image,
        ingredients: data.ingredients,
        servingTips: data.servingTips,
        recommendations: data.recommendations,
      },
    });
    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update item";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
