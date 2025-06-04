import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../../packages/database/src/index'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    
    // Find the user in the database
    const user = await prisma.user.findUnique({ 
      where: { email } 
    })
    
    // If no user found with this email
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    
    // Create JWT token with user data
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    )
    
    // Create response with cookie
    const response = NextResponse.json({ 
      success: true,
      user: { 
        id: user.id, 
        email: user.email,
        role: user.role
      }
    })
    
    // Set HTTP-only cookie with JWT token
    response.cookies.set('token', token, {
      httpOnly: true,
      maxAge: 60 * 60, // 1 hour in seconds
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}