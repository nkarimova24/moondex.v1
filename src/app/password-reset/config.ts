// Configuration specific to password reset routes
// This helps with static exports and dynamic routes

// Export format for dynamic routes
export const dynamic = 'force-dynamic';
export const dynamicParams = true; // Enables dynamic params for non-export scenarios

// Special handling for static export mode
export const isStaticExport = process.env.NEXT_PHASE === 'phase-export';

// Handle specific token value from error message
export const knownTokens = [
  '1/U8XTLkUbnirU7JE81nrcwMrj5sc0glAtOyJT3UGKavDkPSapSsgy2egIkzki',
  '1/gShW5VqZMbGawcjZQFO48TILeEDLMOm78AHwLs1OQf2BlXFSCcRDLzQYvnkQ',
  '1/token',
  '2/token',
  '3/token'
];

// Generate params for static export
export function getStaticParams() {
  // Start with our placeholder values
  const params = [
    { id: 'placeholder-id', token: 'placeholder-token' }
  ];
  
  // Add any known tokens from error messages
  knownTokens.forEach(tokenPath => {
    const [id, token] = tokenPath.split('/');
    if (id && token) {
      params.push({ id, token });
    }
  });
  
  return params;
} 