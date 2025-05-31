import { NextResponse } from "next/server";
import { prisma } from "@repo/database/index";


export async function GET() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ categories });
}
