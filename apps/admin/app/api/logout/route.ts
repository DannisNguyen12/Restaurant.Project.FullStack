import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'));
  
  // Clear the admin session cookie
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiry to epoch time to delete the cookie
    path: '/',
    sameSite: 'lax'
  });
  
  return response;
}
