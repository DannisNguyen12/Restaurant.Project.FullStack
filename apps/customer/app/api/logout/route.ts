import { NextResponse } from 'next/server';

export async function POST() {
  // Create a response
  const response = NextResponse.json({ success: true });
  
  // Remove the session cookie
  response.cookies.set('session', '', { path: '/', maxAge: 0 });
  
  // Also clear the cart cookie when logging out
  response.cookies.set('cart', '', { path: '/', maxAge: 0 });
  
  return response;
}
