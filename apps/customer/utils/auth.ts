import jwt from 'jsonwebtoken';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import bcrypt from 'bcryptjs';

// JWT settings
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '10m'; // Token expires in 10 minutes
const COOKIE_NAME = 'auth_token';

// Types
export interface UserPayload {
  id: number;
  email: string;
  role: string;
}

export interface TokenPayload extends UserPayload {
  iat: number;
  exp: number;
}

// Generate JWT token for a user
export const generateToken = (user: UserPayload): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

// Set JWT token in HTTP-only cookie
export const setAuthCookie = (token: string, cookieStore: any): void => {
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes in seconds
    path: '/',
    sameSite: 'strict' as const,
  });
};

// Verify and decode JWT token from cookie
export const verifyToken = (token: string): UserPayload | null => {
  try {
    console.log('🔍 verifyToken called with token:', token.substring(0, 20) + '...');
    console.log('🔑 JWT_SECRET exists:', !!JWT_SECRET);
    
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
    
    const decoded = jwt.verify(token, JWT_SECRET as string) as TokenPayload;
    console.log('✅ Token verified successfully:', { id: decoded.id, email: decoded.email, role: decoded.role });
    
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'id' in decoded &&
      'email' in decoded &&
      'role' in decoded
    ) {
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    }
    console.log('❌ Token payload validation failed');
    return null;
  } catch (error: unknown) {
    console.log('❌ Token verification error:', error);
    return null;
  }
};

// Get user from request cookies
export const getUserFromCookies = (cookieStore: ReadonlyRequestCookies): UserPayload | null => {
  // Check both cookie names for compatibility
  let token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    token = cookieStore.get('token')?.value;
  }
  if (!token) return null;
  
  return verifyToken(token);
};

// Remove auth cookie  
export const removeAuthCookie = (cookieStore: any): void => {
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
    sameSite: 'strict' as const,
  });
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password with hash
export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// For client-side auth state management
export const isUserAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if token exists in cookie
  const cookies = document.cookie.split(';');
  return cookies.some(cookie => cookie.trim().startsWith(`${COOKIE_NAME}=`));
};
