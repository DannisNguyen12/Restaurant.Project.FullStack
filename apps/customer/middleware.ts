import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Define protected routes - only authenticated users can access these
const protectedRoutes = ['/checkout', '/payment']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  console.log(`Checking authentication for protected route: ${pathname}`)

  // Check for authentication using multiple methods
  let isAuthenticated = false
  let authMethod = ''
  
  // Method 1: Check for custom auth session cookie (simple cookie check)
  const userSessionCookie = request.cookies.get('user_session')?.value
  
  if (userSessionCookie) {
    try {
      const userSession = JSON.parse(decodeURIComponent(userSessionCookie))
      if (userSession && userSession.id && userSession.email) {
        isAuthenticated = true
        authMethod = 'CustomAuth'
        console.log(`User authenticated via custom session: ${userSession.email}`)
      }
    } catch (error) {
      console.log('Custom session parsing failed:', error)
    }
  }
  
  // Method 2: Check for NextAuth session token (for OAuth providers)
  if (!isAuthenticated) {
    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      })
      
      if (token && token.email) {
        isAuthenticated = true
        authMethod = 'NextAuth'
        console.log(`User authenticated via NextAuth token: ${token.email}`)
      }
    } catch (error) {
      console.log('NextAuth token verification failed:', error)
    }
  }

  // If user is not authenticated, redirect to signin
  if (!isAuthenticated) {
    const signinUrl = new URL('/signin', request.url)
    signinUrl.searchParams.set('callbackUrl', pathname)
    
    console.log(`Redirecting unauthenticated user from ${pathname} to signin`)
    
    // Create redirect response and clear any invalid tokens
    const response = NextResponse.redirect(signinUrl)
    
    // Clear potentially invalid cookies
    response.cookies.delete('auth_token')
    response.cookies.delete('user_session')
    
    return response
  }

  // User is authenticated, allow access
  console.log(`Allowing authenticated access to ${pathname} via ${authMethod}`)
  return NextResponse.next()
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Protected routes
    '/checkout/:path*',
    '/payment/:path*',
  ]
}
