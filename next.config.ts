import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow builds to succeed even with type errors in edge cases
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
