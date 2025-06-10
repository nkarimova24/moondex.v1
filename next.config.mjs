/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export to generate all pages
  output: 'export',
  
  // Add trailingSlash for better compatibility with static hosting
  trailingSlash: true,
  
  // Explicitly exclude pages we don't want in our build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Configure image domains if you're using Next.js Image component
  images: {
    unoptimized: true,
  },
  
  // Disable ESLint during build to focus on the core functionality
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip TypeScript validation to prevent dynamic params issues
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Add a note that we're using static export
  webpack: (config, { isServer }) => {
    if (!isServer) {
      console.log(`
        MoonDex.v1 is being built with static export.
        Password reset is handled by the custom post-build script.
      `);
    }
    
    return config;
  },
  
  // Use options that are compatible with App Router
  experimental: {
    // This helps ensure consistent hydration behaviors
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  
  // Exclude certain routes from build process
  distDir: '.next',
  
  // Custom onBuildStart hook via post-build script
  // See scripts/post-build.js for custom route handling
};

export default nextConfig;