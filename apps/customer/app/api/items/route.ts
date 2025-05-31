// apps/customer/app/api/items/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@repo/database/index";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category")
      ? Number(searchParams.get("category"))
      : undefined;

    const items = await prisma.item.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
      },
      include: { likes: true, category: true },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("API /api/items error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}