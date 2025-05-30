import { NextResponse } from 'next/server';

export async function POST() {
  // Remove the session cookie (assuming it's called 'session')
  const response = NextResponse.json({ success: true });
  response.cookies.set('session', '', { path: '/', maxAge: 0 });
  return response;
}
