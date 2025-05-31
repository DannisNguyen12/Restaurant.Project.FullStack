import { NextResponse } from "next/server";
import { prisma } from "@repo/database/index";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function POST(request: Request) {
  try {
    const { email, password, rePassword, name } = await request.json();
    if (!email || !password || !rePassword || !name) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password !== rePassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 400 });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Create JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "10m" });

    // Set cookie for 10 minutes
    const response = NextResponse.json({ success: true, redirect: "/" });
    response.cookies.set("customer_session", token, {
      httpOnly: true,
      maxAge: 600, // 10 minutes
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}