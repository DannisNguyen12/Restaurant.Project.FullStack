import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Get cart from cookies
  const cartCookie = request.headers.get("cookie")?.split(";").find(c => c.trim().startsWith("cart="));
  let cart = [];
  
  if (cartCookie) {
    const value = cartCookie.split("=")[1];
    if (value) {
      try {
        // First try direct JSON parsing (if not URL-encoded)
        if (value.startsWith('[') || value.startsWith('{')) {
          cart = JSON.parse(value);
          console.log("GET /api/cart: Successfully parsed direct JSON from cookie:", cart);
        } else {
          // Try URL-decoded parsing
          cart = JSON.parse(decodeURIComponent(value));
          console.log("GET /api/cart: Successfully parsed decoded cart from cookie:", cart);
        }
      } catch (parseError) {
        console.error("GET /api/cart: Error parsing cart cookie value", parseError);
        // ignore parse error, return empty cart
      }
    }
  } else {
    console.log("GET /api/cart: No cart cookie found");
  }
  
  return NextResponse.json({ cart });
}

export async function POST(request: Request) {
  // Save cart to cookies
  const { cart } = await request.json();
  
  console.log("POST /api/cart: Setting cart cookie with value:", cart);
  
  // Create a new response
  const response = NextResponse.json({ success: true, cart });
  
  // Convert cart to JSON string first
  const cartJson = JSON.stringify(cart);
  
  // Don't double-encode - just set the JSON directly as the cookie value
  // Many issues come from double-encoding or wrong encoding of the JSON
  response.cookies.set({
    name: "cart",
    value: cartJson,
    httpOnly: false, // Allow JavaScript access to read the cookie
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
    sameSite: "lax"
  });
  
  return response;
}
