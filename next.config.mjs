/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Add trailingSlash for better compatibility with static hosting
  trailingSlash: true,
  // Explicitly exclude pages we don't want in our build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Configure image domains if you're using Next.js Image component
  images: {
    unoptimized: true,
  },
  // Add a note that we're using static export
  webpack: (config, { isServer }) => {
    if (!isServer) {
      console.log(`
        Note: You're using 'output: export' in Next.js config.
        Password reset is now handled completely by the backend API.
      `);
    }
    
    return config;
  },
  // Use options that are compatible with App Router
  experimental: {
    // This helps ensure consistent hydration behaviors
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
};

export default nextConfig;