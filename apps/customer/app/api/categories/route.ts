import { NextResponse } from "next/server";
import { PrismaClient } from "@repo/database/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ categories });
}
