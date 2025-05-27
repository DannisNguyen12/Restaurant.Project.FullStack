import { NextResponse } from "next/server";
import { PrismaClient } from "@repo/database/generated/prisma";

const prisma = new PrismaClient();
const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 10; // 10 minutes in seconds

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  // Create a simple session token (for demo, use user id + timestamp)
  const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax"
  });
  return response;
}
