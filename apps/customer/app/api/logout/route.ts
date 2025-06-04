import { NextResponse } from 'next/server';

export async function POST() {
    // To "delete" a cookie, set its value to empty and its expiration date to a past date
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set('token', '', { httpOnly: true, expires: new Date(0), path: '/' });
    return response;
}