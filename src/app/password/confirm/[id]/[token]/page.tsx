// This is a static page for Next.js static export
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Password Reset Confirmation',
  description: 'Confirm your password reset'
};

// This function is required for static export with dynamic routes
export function generateStaticParams() {
  // For static export, we provide a dummy parameter
  // The actual validation happens client-side
  return [
    { id: 'placeholder', token: 'placeholder' }
  ];
}

// Static page that will load the client component
export default function PasswordResetConfirmPage() {
  return (
    <div id="password-reset-container">
      {/* Static content that will be visible before the client component loads */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <h1>Password Reset Confirmation</h1>
        <p>Please wait while we verify your password reset request...</p>
      </div>
      
      {/* Script to load the client component */}
      <Script id="load-client-component" strategy="afterInteractive">
        {`
          (function() {
            // Check if we're already in browser
            if (typeof window !== 'undefined') {
              // Create a script element to dynamically load the client component
              const script = document.createElement('script');
              script.src = '/client-components/password-reset.js';
              script.async = true;
              document.body.appendChild(script);
            }
          })();
        `}
      </Script>
    </div>
  );
} 