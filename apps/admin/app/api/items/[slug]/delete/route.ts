import { NextResponse } from "next/server";
import { PrismaClient } from "@repo/database/generated/prisma";

const prisma = new PrismaClient();

export async function DELETE(request: Request, context: { params: { slug: string } }) {

  const id = Number(context.params.slug);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalslug ID" }, { status: 400 });
  }
  await prisma.item.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
