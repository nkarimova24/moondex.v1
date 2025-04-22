import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Define interface for decoded JWT payload
interface JwtPayload {
  id?: number;
  name?: string;
  email?: string;
  password_change_required?: boolean;
  exp?: number;
}

// Protected routes that require authentication
const protectedRoutes = ['/profile', '/dashboard', '/settings'];

// Public routes that should be accessible without auth
const publicRoutes = ['/signin', '/signup', '/forgot-password', '/change-temporary-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const currentPath = request.nextUrl.pathname;
  
  // Skip middleware for API routes, static files, etc.
  if (
    currentPath.startsWith('/_next') || 
    currentPath.startsWith('/api') ||
    currentPath.startsWith('/static') ||
    currentPath.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }
  
  let decoded: JwtPayload | null = null;
  let isTokenValid = false;
  
  try {
    if (token) {
      decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (decoded.exp && decoded.exp > currentTime) {
        isTokenValid = true;
      }
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    // Token is invalid, proceed with redirection logic
  }
  
  // If user has password_change_required flag set to true, redirect to change password page
  // unless they're already on that page
  if (isTokenValid && decoded && decoded.password_change_required && currentPath !== '/change-temporary-password') {
    return NextResponse.redirect(new URL('/change-temporary-password', request.url));
  }
  
  // If accessing a protected route without valid token, redirect to login
  if (protectedRoutes.some(route => currentPath.startsWith(route)) && !isTokenValid) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.nextUrl.pathname));
    return NextResponse.redirect(url);
  }
  
  // If user is logged in but trying to access login/signup pages, redirect to profile
  if (publicRoutes.some(route => currentPath.startsWith(route)) && isTokenValid && decoded && !decoded.password_change_required) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Run middleware on password reset paths
    '/password-reset/:id/:token*',
  ],
}; 