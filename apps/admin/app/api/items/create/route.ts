import { NextResponse } from "next/server";
import { prisma } from "@repo/database/index";


export async function POST(request: Request) {
  
  const data = await request.json();
  // Basic validation
  if (!data.name || !data.price || isNaN(Number(data.price)) || !data.image) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  try {
    const created = await prisma.item.create({
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
    return NextResponse.json({ success: true, item: created });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create item" }, { status: 500 });
  }
}
