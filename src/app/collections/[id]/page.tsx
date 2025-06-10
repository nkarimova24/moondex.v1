// Server component for static generation
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

// For static export compatibility
export const dynamic = 'error';

// This tells Next.js to only render the statically generated parameters
export const dynamicParams = false; 

// Generate static parameters for the build
export function generateStaticParams() {
  // For static export, we'll generate placeholder IDs
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
}

// Server component that redirects to profile page which handles collections
export default function CollectionPage({ params }: { params: { id: string } }) {
  // This is a placeholder page that redirects users to the profile page
  // The actual collection viewing happens in the profile page
  
  // In a static export, this won't run during the build
  // It will only run in the browser when someone visits this URL
  return redirect('/profile');
}
