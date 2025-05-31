import { NextResponse } from "next/server";
import { prisma } from "@repo/database/index";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") || "";

  const items = await prisma.item.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } }
          ],
        }
      : {},
    include: { likes: true, category: true },
  });

  return NextResponse.json({ items });
}
