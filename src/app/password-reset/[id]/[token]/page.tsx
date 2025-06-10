import { Suspense } from 'react';
import ClientPasswordResetPage from './client-page';

// For static export support, we'll use static rendering
export const dynamic = 'error';

// This tells Next.js to only render the statically generated parameters
export const dynamicParams = false;

// Export a generateStaticParams to satisfy the static export requirement
export function generateStaticParams() {
  // Create a set of placeholder params for static export
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