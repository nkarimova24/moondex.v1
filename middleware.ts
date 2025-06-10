import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id?: number;
  name?: string;
  email?: string;
  password_change_required?: boolean;
  exp?: number;
}

const protectedRoutes = ['/profile', '/dashboard', '/settings'];

const publicRoutes = ['/signin', '/signup', '/forgot-password', '/change-temporary-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const currentPath = request.nextUrl.pathname;
  
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
      
      if (decoded) {
        console.log('JWT Token debugging:', {
          decodedToken: decoded,
          passwordChangeRequired: decoded.password_change_required,
          tokenExpiration: decoded.exp,
          currentTime,
          isValid: decoded.exp && decoded.exp > currentTime
        });
      }
      
      if (decoded && decoded.exp && decoded.exp > currentTime) {
        isTokenValid = true;
      }
    } else {
      console.log('No auth token found in request');
    }
  } catch (error) {
    console.error('Error decoding token:', error);
  }
  
  // If user has password_change_required flag set to true, redirect to change password page
  // unless they're already on that page
  if (isTokenValid && decoded && decoded.password_change_required && currentPath !== '/change-temporary-password') {
    console.log('Redirecting to change-temporary-password due to password_change_required flag');
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

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 