"use client";

import { Suspense } from 'react';
import ClientPasswordResetPage from './client-page';
import { getStaticParams } from '../../config';

// With static export, Next.js requires each dynamic segment to be listed in generateStaticParams
// Since we can't predict all possible tokens, we use a simple client-side approach instead
export async function generateStaticParams() {
  // Start with our placeholder and any known tokens
  const params = getStaticParams();
  
  // Add the specific token from the error message
  const specificTokens = [
    { id: '1', token: 'U8XTLkUbnirU7JE81nrcwMrj5sc0glAtOyJT3UGKavDkPSapSsgy2egIkzki' },
    { id: '1', token: 'gShW5VqZMbGawcjZQFO48TILeEDLMOm78AHwLs1OQf2BlXFSCcRDLzQYvnkQ' }
  ];
  
  // Merge the specific tokens with our params
  const allParams = [...params, ...specificTokens];
  
  console.log('Generated static params for password reset:', allParams);
  
  return allParams;
}

// Make the component simple - all processing happens on the client side
export default function PasswordResetPage() {
  return (
    <Suspense fallback={<div>Loading password reset page...</div>}>
      <ClientPasswordResetPage />
    </Suspense>
  );
} 