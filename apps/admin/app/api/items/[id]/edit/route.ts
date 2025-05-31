import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database/index";
import { cookies } from "next/headers";


export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin is logged in
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get item ID from URL params
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    // Check if item exists
    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    
    if (isNaN(Number(body.price)) || Number(body.price) <= 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }
    
    if (!body.image?.trim()) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }
    
    // Make sure arrays are properly formatted
    const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
    const servingTips = Array.isArray(body.servingTips) ? body.servingTips : [];
    const recommendations = Array.isArray(body.recommendations) ? body.recommendations : [];

    // Update the item in the database
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        fullDescription: body.fullDescription?.trim() || null,
        price: Number(body.price),
        image: body.image?.trim() || null,
        ingredients: ingredients,
        servingTips: servingTips,
        recommendations: recommendations,
      },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
