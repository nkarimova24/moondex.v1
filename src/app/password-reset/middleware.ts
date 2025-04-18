import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware intercepts password reset requests and handles them properly
export function middleware(request: NextRequest) {
  // Check if we're running in a static export environment
  // In static export, middleware doesn't run the same way
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    // We're in a browser environment with static export
    console.log('Middleware running in browser context, passing through');
    return NextResponse.next();
  }
  
  const pathname = request.nextUrl.pathname;
  
  // Check if this is a password reset URL with direct parameters in the URL
  if (pathname.startsWith('/password-reset/') && !pathname.endsWith('/success')) {
    console.log('Password reset middleware: Processing URL', pathname);
    
    // Extract the segments after /password-reset/
    const segments = pathname.slice('/password-reset/'.length).split('/');
    
    // If we have exactly 2 segments (id and token), let it through to the standard handler
    if (segments.length === 2) {
      console.log('Password reset middleware: Standard format detected', segments);
      return NextResponse.next();
    }
    
    // If we have a non-standard format, redirect to the catch-all handler
    console.log('Password reset middleware: Non-standard format detected', segments);
    return NextResponse.rewrite(new URL(`/password-reset/${segments.join('/')}`, request.url));
  }
  
  return NextResponse.next();
}

// Configure the middleware to only run on specific paths
export const config = {
  matcher: ['/password-reset/:path*'],
}; 