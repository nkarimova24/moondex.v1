import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", //enable for working export / disable for working npm run dev 
  reactStrictMode: true,
  images: {
    loader: "default", //enable for working export / disable for working npm run dev
    unoptimized: true, //enable for working export / disable for working npm run dev
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pokemontcg.io',
      },
    ],
  },
};

module.exports = nextConfig;