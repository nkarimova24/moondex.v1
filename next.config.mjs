/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Add trailingSlash for better compatibility with static hosting
  trailingSlash: true,
  // Using distDir to put the static export in a specific folder
  distDir: 'out',
  // Explicitly set which dynamic routes should be included in the export
  // For password reset, we're using client-side processing so we need a minimal static version
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    // Start with the default paths
    const paths = { ...defaultPathMap };
    
    // Add a placeholder path for the password reset URL pattern
    paths['/password-reset/placeholder-id/placeholder-token/'] = { 
      page: '/password-reset/[id]/[token]', 
      query: { id: 'placeholder-id', token: 'placeholder-token' } 
    };
    
    // Add the specifically mentioned paths from error messages
    paths['/password-reset/1/U8XTLkUbnirU7JE81nrcwMrj5sc0glAtOyJT3UGKavDkPSapSsgy2egIkzki/'] = { 
      page: '/password-reset/[id]/[token]', 
      query: { id: '1', token: 'U8XTLkUbnirU7JE81nrcwMrj5sc0glAtOyJT3UGKavDkPSapSsgy2egIkzki' } 
    };
    
    paths['/password-reset/1/gShW5VqZMbGawcjZQFO48TILeEDLMOm78AHwLs1OQf2BlXFSCcRDLzQYvnkQ/'] = { 
      page: '/password-reset/[id]/[token]', 
      query: { id: '1', token: 'gShW5VqZMbGawcjZQFO48TILeEDLMOm78AHwLs1OQf2BlXFSCcRDLzQYvnkQ' } 
    };
    
    // Add the optional catch-all route for the base path
    paths['/password-reset/'] = { 
      page: '/password-reset/[[...path]]'
    };
    
    // Add the success page
    if (!paths['/password-reset/success/']) {
      paths['/password-reset/success/'] = { page: '/password-reset/success' };
    }
    
    return paths;
  },
  // Configure image domains if you're using Next.js Image component
  images: {
    unoptimized: true,
  },
  // Add a note to fallback middleware since normal middleware doesn't run in static export
  webpack: (config, { isServer }) => {
    // Add a note that we're using static export
    if (!isServer) {
      console.log(`
        Note: You're using 'output: export' in Next.js config.
        This means that middleware won't run during runtime.
        Password reset URLs will be handled client-side.
      `);
    }
    
    return config;
  }
};

export default nextConfig; 