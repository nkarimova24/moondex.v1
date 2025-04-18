import { Suspense } from 'react';
import ClientPasswordResetPage from './client-page';

// Mark this route for dynamic rendering at runtime
export const dynamic = 'force-dynamic'; 

// This tells Next.js to skip static generation for this route
export const dynamicParams = true;

// Export a dummy generateStaticParams to satisfy the static export requirement
// while using dynamic rendering for the actual content
export function generateStaticParams() {
  // We'll create placeholder params for static export
  // but use client-side JavaScript to handle actual tokens
  return [
    { id: 'placeholder-id', token: 'placeholder-token' }
  ];
}

// The main component loads the client component
export default function PasswordResetPage() {
  return (
    <Suspense fallback={<div>Loading password reset page...</div>}>
      <ClientPasswordResetPage />
    </Suspense>
  );
} 