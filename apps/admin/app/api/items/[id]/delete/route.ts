import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database/index";
import { cookies } from "next/headers";


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Before deleting the item, we need to check and delete any related records
    // such as likes, orderItems, etc. to avoid foreign key constraint errors

    // First, delete any likes associated with this item
    await prisma.like.deleteMany({ where: { itemId: id } });

    // Then, delete any orderItems associated with this item
    await prisma.orderItem.deleteMany({ where: { itemId: id } });

    // Finally, delete the item itself
    await prisma.item.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}