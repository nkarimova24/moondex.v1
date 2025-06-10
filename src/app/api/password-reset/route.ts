import { NextRequest, NextResponse } from 'next/server';
import { logoutFromAllSessions } from '@/app/lib/api/auth';

// Configure for static export compatibility
export const dynamic = 'force-static';

// Define all possible static paths
export async function generateStaticParams() {
  return [];
}

export async function GET(request: NextRequest) {
  // This is a fallback route for password reset confirmation
  try {
    // Extract parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const redirectTo = searchParams.get('redirect') || 'https://moondex.nl';
    
    console.log('Received password reset callback:', { status, message, redirectTo });
    
    // If the reset was successful, log out from all sessions
    if (status === 'success') {
      try {
        await logoutFromAllSessions();
        console.log('Successfully logged out of all sessions');
      } catch (error) {
        console.error('Error logging out of all sessions:', error);
      }
      
      // Redirect to the success page with a 302 temporary redirect
      const successUrl = new URL('/password/reset-success.html', request.nextUrl.origin);
      
      // Create a response with redirect
      const response = NextResponse.redirect(successUrl);
      
      // Add cookies to clear auth data
      response.cookies.set('auth_token', '', { 
        expires: new Date(0),
        path: '/'
      });
      
      response.cookies.set('user', '', {
        expires: new Date(0),
        path: '/'
      });
      
      return response;
    }
    
    // For errors, redirect to the main site
    return NextResponse.redirect(redirectTo);
  } catch (error) {
    console.error('Error in password reset handler:', error);
    return NextResponse.redirect('https://moondex.nl');
  }
}

// Handle POST as well to be comprehensive
export async function POST(request: NextRequest) {
  return GET(request);
} 