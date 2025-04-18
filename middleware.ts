import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a password reset URL
  if (pathname.startsWith('/password-reset/') && pathname.split('/').length >= 4) {
    // This is likely a password reset URL with ID and token
    // Next.js static export will load the file at /password-reset/[id]/[token].html
    // We don't need to modify the URL, the client component will handle the parameters
    return NextResponse.next();
  }
  
  // For all other requests, proceed normally
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Run middleware on password reset paths
    '/password-reset/:id/:token*',
  ],
}; 