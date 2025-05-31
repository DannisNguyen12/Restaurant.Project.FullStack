import { NextResponse } from "next/server";
import { prisma } from "@repo/database/index";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function POST(request: Request) {
  try {
    // Check for user session cookie
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/customer_session=([^;]+)/);
    let userName = null;
    if (match && typeof match[1] === "string") {
      try {
        const decoded = jwt.verify(match[1], JWT_SECRET);
        // Try to get user from DB
        const user = await prisma.user.findUnique({ where: { id: (decoded as any).userId } });
        userName = user?.name || null;
      } catch {}
    }
    const { cart, method, details } = await request.json();
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }
    // Use username from cookie if available, else cardName, else Guest
    const finalName = userName || details.cardName || "Guest";
    const order = await prisma.order.create({
      data: {
        customerName: finalName,
        total: cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
        status: "COMPLETED",
        items: {
          create: cart.map((item: any) => ({
            itemId: item.id,
            quantity: item.quantity,
          })),
        },
      },
    });
    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ error: "Payment failed." }, { status: 500 });
  }
}
