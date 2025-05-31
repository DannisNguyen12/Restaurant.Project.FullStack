import { NextResponse } from "next/server";
import { prisma } from "@repo/database/index";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "10m" });

    // Get the existing cart cookie
    let cartData = [];
    const cartCookie = request.headers.get("cookie")?.split(";").find(c => c.trim().startsWith("cart="));
    if (cartCookie) {
      const value = cartCookie.split("=")[1];
      if (value) {
        try {
          // Try to parse the existing cart with multiple methods
          if (value.startsWith('[') || value.startsWith('{')) {
            // Direct JSON parsing
            cartData = JSON.parse(value);
            console.log("Preserved cart during login (direct JSON):", cartData);
          } else {
            // Try URL-decoded parsing
            cartData = JSON.parse(decodeURIComponent(value));
            console.log("Preserved cart during login (decoded JSON):", cartData);
          }
        } catch (parseError) {
          console.error("Error parsing cart cookie during login:", parseError);
          // If parsing fails, try to create a clean cart cookie
          cartData = [];
        }
      }
    } else {
      console.log("No cart cookie found during login");
    }

    // Set cookie for 10 minutes
    const response = NextResponse.json({ 
      success: true,
      cart: cartData  // Include cart data in the response
    });
    
    // Set the session cookie
    response.cookies.set("customer_session", token, {
      httpOnly: true,
      maxAge: 600, // 10 minutes
      path: "/",
      sameSite: "lax",
    });
    
    // Re-set the cart cookie to ensure it persists after login
    if (cartData.length > 0) {
      const cartJson = JSON.stringify(cartData);
      console.log("Re-setting cart cookie during login:", cartJson);
      
      response.cookies.set("cart", cartJson, {
        httpOnly: false, // Allow JavaScript access
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
        sameSite: "lax"
      });
    }

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}