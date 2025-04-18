import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware intercepts password reset requests and handles them properly
export function middleware(request: NextRequest) {
  // Check if we're running in a static export environment
  // In static export, middleware doesn't run the same way
  const isStaticExport = process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NEXT_OUTPUT === 'export';

  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // If we're trying to hit a dynamic path that doesn't exist in the static export 
  // serve the static wrapper that will handle the client-side logic
  if (pathname.startsWith('/password-reset/') && 
      !pathname.endsWith('/success') && 
      !pathname.endsWith('/error')) {
    
    console.log('Password reset middleware: Processing URL', pathname);
    
    // Extract the segments after /password-reset/
    const segments = pathname.slice('/password-reset/'.length).split('/');
    
    // If we have exactly 2 segments (id and token), this is likely a password reset confirmation link
    if (segments.length === 2) {
      // In static export, we need to serve the static wrapper to handle the client-side logic
      if (isStaticExport) {
        console.log('Static export: Serving static wrapper for password reset confirmation');
        
        // We'll use the static wrapper HTML file to process this on the client side
        // This file will extract the token and make the API call directly
        return NextResponse.rewrite(new URL('/password-reset/static-wrapper.html', request.url));
      }
    }
  }
  
  // For all other paths, continue as normal
  return NextResponse.next();
}

// Configure the middleware to only run on specific paths
export const config = {
  matcher: ['/password-reset/:path*'],
}; 