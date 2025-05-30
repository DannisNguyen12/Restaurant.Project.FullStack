import { NextResponse } from "next/server";
import { PrismaClient } from "@repo/database/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const APP_URL = process.env.APP_URL || "http://localhost:3001";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, do not reveal if email is not registered
      return NextResponse.json({ success: true });
    }
    // Create a reset token valid for 15 minutes
    const resetToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `${APP_URL}/resetpassword?token=${resetToken}`;
    // TODO: Send email with resetLink (use nodemailer or similar in production)
    console.log(`Password reset link for ${email}: ${resetLink}`);
    // Always return success for security
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
